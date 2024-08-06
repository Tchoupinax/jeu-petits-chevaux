import { Inject, Logger } from "@nestjs/common";
import { randomUUID } from "crypto";
import { array, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { range } from "fp-ts/lib/NonEmptyArray";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY, PAWN_REPOSITORY, PLAYER_REPOSITORY, ROUND_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { Context } from "../../common/context";
import { Game, GameId } from "../../entities/game";
import { Pawn } from "../../entities/pawn";
import { PlayerId } from "../../entities/player";
import { generateRound, Round } from "../../entities/round";
import { GameAlreadyStartedError } from "../../errors/game-already-exists.error";
import { GameRepository } from "../../gateways/game.repository";
import { PawnRepository } from "../../gateways/pawn.repository";
import { PlayerRepository } from "../../gateways/player.repository";
import { RoundRepository } from "../../gateways/round.repository";
import { EventService } from "../../services/event.service";
import { GameService } from "../../services/game.service";
import { Color } from "../../value-objects/color";
import { HouseCase } from "../../value-objects/house-case";
import { PawnName } from "../../value-objects/pawn-name";
import { TrayCase } from "../../value-objects/tray-case";

export type AdminStartsGamePort = {
  name: string;
  playerId: string;
}

export class AdminStartsGameUseCase {
  constructor (
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    private logger: Logger,
    private eventService: EventService,
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    @Inject(ROUND_REPOSITORY)
    private roundRepository: RoundRepository,
    @Inject(PAWN_REPOSITORY)
    private pawnRepository: PawnRepository,
    private gameService: GameService,
  ) { }

  execute (
    context: Context,
  ): TaskEither<TechnicalError | GameAlreadyStartedError, void> {
    this.logger.debug("AdminStartsGameUseCase");

    return pipe(
      this.gameRepository.getById(context.gameId),
      taskEither.chain(
        (game) => pipe(
          game.startedAt,
          option.fold(
            () => this.startTheGame(game),
            () => taskEither.left(new GameAlreadyStartedError(game.id)),
          ),
        ),
      ),
    );
  }

  private startTheGame (game: Game): TaskEither<TechnicalError, void> {
    game.startedAt = option.some(new Date());

    return pipe(
      this.defineFirstPlayer(game.id),
      taskEither.chain(() => this.gameRepository.update(game)),
      taskEither.chainFirst((game) => this.initializeGame(game)),
      taskEither.chain(game => this.gameService.findCurrentRound(game.id)),
      taskEither.chain(
        option.fold(
          () => taskEither.left(new TechnicalError(new Error(""))),
          round => this.eventService.broadcast({ type: "game-starts", data: round }),
        ),
      ),
    );
  }

  defineFirstPlayer (
    gameId: Game["id"],
  ): TaskEither<TechnicalError, Round> {
    return pipe(
      taskEither.Do,
      taskEither.bind("players", () => this.playerRepository.findByGameId(gameId)),
      taskEither.bind("round",
        ({ players }) => taskEither.of(generateRound({ gameId, playerId: players[0].id })),
      ),
      taskEither.chain(({ round }) => this.roundRepository.create(round)),
    );
  }

  private initializeGame (
    game: Game,
  ): TaskEither<TechnicalError, void> {
    this.logger.debug({ game }, "AdminStartsGameUseCase.initializeGame");

    return pipe(
      this.playerRepository.findByGameId(game.id),
      taskEither.map(array.map(player => ({
        playerId: player.id,
        color: pipe(
          game.playersColors,
          option.fold(() => "Blue", (cc) => cc.find(c => c.playerId === player.id)?.color),
        ),
      }))),
      taskEither.map(
        array.mapWithIndex(
          (index, { color, playerId }) => pipe(
            range(1, 4),
            array.map(number =>
              this.pawnRepository.createPosition(
                this.generatePawn(`${color}.${number}` as PawnName, game.id, playerId),
              ),
            ),
            taskEither.sequenceSeqArray,
          ),
        ),
      ),
      taskEither.chain(taskEither.sequenceArray),
      taskEither.map(constVoid),
    );
  }

  private generatePawn (
    pawnName: PawnName,
    gameId: GameId,
    playerId: PlayerId,
  ): Pawn {
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

    function capitalizeFirstLetter (str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return {
      color: capitalizeFirstLetter(pawnName.toLowerCase().split(".")[0]) as Color,
      gameId,
      playerId,
      position: startingPositions[pawnName] as TrayCase,
      name: pawnName as PawnName,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}
