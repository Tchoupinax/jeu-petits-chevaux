import { Inject, Logger, ValidationError } from "@nestjs/common";
import { array, boolean, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY, PAWN_REPOSITORY, PLAYER_REPOSITORY, ROUND_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { GameId } from "../../entities/game";
import { Pawn, PawnCase } from "../../entities/pawn";
import { PlayerId } from "../../entities/player";
import { generateRound, Round, RoundId } from "../../entities/round";
import { NotYourTurnError } from "../../errors/not-your-turn.error";
import { GameRepository } from "../../gateways/game.repository";
import { PawnRepository } from "../../gateways/pawn.repository";
import { PlayerRepository } from "../../gateways/player.repository";
import { RoundRepository } from "../../gateways/round.repository";
import { EventService } from "../../services/event.service";
import { GameService } from "../../services/game.service";
import { HouseCase } from "../../value-objects/house-case";
import { PawnName } from "../../value-objects/pawn-name";
import { TrayCase } from "../../value-objects/tray-case";

export type PlayerCommitsMovePort = {
  gameId: GameId;
  pawnEndingCase: TrayCase;
  pawnName: PawnName;
  pawnStartingCase: TrayCase;
  playerId: PlayerId;
  roundId: RoundId;
};

export class PlayerCommitsMoveUseCase {
  constructor (
    @Inject(ROUND_REPOSITORY)
    private roundRepository: RoundRepository,
    @Inject(PAWN_REPOSITORY)
    private pawnRepository: PawnRepository,
    private logger: Logger,
    private eventService: EventService,
    private gameService: GameService,
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
  ) { }

  execute (
    port: PlayerCommitsMovePort,
  ): TaskEither<TechnicalError | ValidationError, Round> {
    this.logger.debug({ port }, "PlayerCommitsMoveUseCase");
    return pipe(
      this.checkValidCommand(port.gameId, port.playerId),
      taskEither.chain(() => this.finishRound(port)),
      taskEither.chainFirst(
        () => pipe(
          taskEither.Do,
          taskEither.bind("oldPawn", () => this.pawnRepository.getByName(port.pawnName, port.gameId)),
          taskEither.bind("currentPawn", ({ oldPawn }) => this.updatePawn(oldPawn, port.pawnEndingCase)),
          taskEither.chain(
            ({ oldPawn, currentPawn }) => pipe(
              this.killExistingPawnOnTheEndingCase(currentPawn.position, port.playerId),
              taskEither.chain(
                () => this.eventService.broadcast({ type: "pawn-moved", data: { oldPawn, currentPawn } }),
              ),
            ),
          ),
        ),
      ),

      // Check if the game is finished
      taskEither.chainFirst(
        round => pipe(
          this.pawnRepository.listCurrentPositionsByPlayerId({ gameId: port.gameId, playerId: port.playerId }),
          taskEither.map(
            pawns => pawns.every(p => p.position === "7xx7"),
          ),
          taskEither.chain(
            boolean.fold(
              () => this.createNextRound(port),
              // Game terminated!
              () => pipe(this.finishGame(port), taskEither.map(() => round)),
            ),
          ),
        ),
      ),
    );
  }

  private checkValidCommand (
    gameId: GameId,
    playerId: PlayerId,
  ): TaskEither<TechnicalError | NotYourTurnError, void> {
    this.logger.debug("PlayerCommitsMoveUseCase.checkValidCommand");

    return pipe(
      this.gameService.isPlayerAllowedToPlay(gameId, playerId),
      taskEither.chain(boolean.fold(
        () => taskEither.left(new NotYourTurnError()),
        () => taskEither.right(constVoid()),
      )),
    );
  }

  private finishRound (
    port: PlayerCommitsMovePort,
  ): TaskEither<TechnicalError, Round> {
    this.logger.debug("PlayerCommitsMoveUseCase.finishRound");

    return pipe(
      this.roundRepository.getById(port.roundId),
      taskEither.chain(round => {
        if (round.status === "Finished") {
          return taskEither.left(new TechnicalError(new Error("ALREADY FINISHED")));
        }
        return taskEither.right(round);
      }),
      taskEither.chain(round => this.roundRepository.update({
        ...round,
        pawnStartingCase: option.some(port.pawnStartingCase),
        pawnEndingCase: option.some(port.pawnEndingCase),
        pawnName: option.some(port.pawnName),
        status: "Finished",
      })),
    );
  }

  private createNextRound (
    port: PlayerCommitsMovePort,
  ): TaskEither<TechnicalError, Round> {
    this.logger.debug("PlayerCommitsMoveUseCase.createNextRound");

    return pipe(
      this.roundRepository.getById(port.roundId),
      taskEither.bindTo("round"),
      taskEither.bind("nextPlayer", () => pipe(
        this.playerRepository.findByGameId(port.gameId),
        taskEither.map(array.findFirst(player => player.id !== port.playerId)),
      )),
      taskEither.chain(
        ({ round, nextPlayer }) => pipe(
          nextPlayer,
          option.fold(
            () => taskEither.left(new TechnicalError(new Error("no player found"))),
            (player) => pipe(
              round.diceScore,
              option.fold(
                () => taskEither.left(new TechnicalError(new Error("no dice score found"))),
                (diceScore) => taskEither.of(generateRound({
                  gameId: port.gameId,
                  playerId: diceScore === 6 ? port.playerId : player.id,
                })),
              ),
              taskEither.chain(round => this.roundRepository.create(round)),
              taskEither.chainFirst(
                (round) => this.eventService.broadcast({ type: "round-created", data: round }),
              ),
            ),
          )),
      ),
    );
  }

  private updatePawn (
    pawn: Pawn,
    pawnEndingCase: TrayCase,
  ): TaskEither<TechnicalError, Pawn> {
    return pipe(
      this.pawnRepository.update({
        ...pawn,
        position: pawnEndingCase,
      }),
    );
  }

  private killExistingPawnOnTheEndingCase (
    pawnEndingCase: PawnCase,
    playerId: PlayerId,
  ): TaskEither<TechnicalError, void> {
    const startingPositions : Record<PawnName, HouseCase> = {
      "Blue.1": "0xx14",
      "Blue.2": "0xx13",
      "Blue.3": "1xx13",
      "Blue.4": "1xx14",
      "Yellow.1": "0xx0",
      "Yellow.2": "0xx1",
      "Yellow.3": "1xx0",
      "Yellow.4": "1xx1",
      "Green.1": "13xx0",
      "Green.2": "14xx0",
      "Green.3": "13xx1",
      "Green.4": "14xx1",
      "Red.1": "13xx13",
      "Red.2": "14xx14",
      "Red.3": "13xx14",
      "Red.4": "14xx13",
    };

    return pipe(
      this.pawnRepository.findAllByTraycase(pawnEndingCase),
      taskEither.map(array.findFirst(pawn => pawn.playerId !== playerId)),
      taskEither.chain(
        option.fold(
          () => taskEither.right(constVoid()),
          (pawn) => pipe(
            this.pawnRepository.update({
              ...pawn,
              position: startingPositions[pawn.name],
            }),
            taskEither.chain(() => this.eventService.broadcast<PawnCase>({ type: "traycase-updated", data: startingPositions[pawn.name] })),
          ),
        ),
      ),
    );
  }

  private finishGame (
    port: PlayerCommitsMovePort,
  ): TaskEither<TechnicalError, void> {
    return pipe(
      this.gameRepository.finish(port.gameId, port.playerId),
      taskEither.chain(() => this.playerRepository.getOne(port.playerId)),
      taskEither.chain(
        player => this.eventService.broadcast({ type: "game-finished", data: { player } }),
      ),
    );
  }
}
