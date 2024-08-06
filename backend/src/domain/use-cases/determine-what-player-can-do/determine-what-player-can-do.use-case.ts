import { Inject, Logger } from "@nestjs/common";
import { array, boolean, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { PAWN_REPOSITORY, PLAYER_REPOSITORY, ROUND_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { GameId } from "../../entities/game";
import { canPawnProgressOnHeaven, distanceFromTheEnd, isOnHeaven, isOnLastCase, Pawn, PawnCase } from "../../entities/pawn";
import { PlayerId } from "../../entities/player";
import { generateRound, Round, RoundId } from "../../entities/round";
import { DiceNotLaunchedError } from "../../errors/dice-not-launched.error";
import { NotYourTurnError } from "../../errors/not-your-turn.error";
import { PawnRepository } from "../../gateways/pawn.repository";
import { PlayerRepository } from "../../gateways/player.repository";
import { RoundRepository } from "../../gateways/round.repository";
import { EventService } from "../../services/event.service";
import { PawnName } from "../../value-objects/pawn-name";
import { computeAllCaseBetweenSourceAndDestination, computeDestinationTrayCase, isPawnOnBoard, TrayCase } from "../../value-objects/tray-case";

export type DetermineWhatPlayerCanDoPort = {
  gameId: GameId;
  playerId: PlayerId;
  roundId: RoundId;
}
export type DetermineWhatPlayerCanDoResult= {
  canPlayAnotherRound: boolean;
  canPutPawnOutside: boolean;
  movablePawns: Array<{
    destination: PawnCase;
    id: string;
    name: PawnName;
    source: PawnCase;
  }>;
}
export type DetermineWhatPlayerCanDoErrors = TechnicalError | DiceNotLaunchedError;

export class DetermineWhatPlayerCanDoUseCase {
  constructor (
    private logger: Logger,
    @Inject(ROUND_REPOSITORY)
    private roundRepository: RoundRepository,
    @Inject(PAWN_REPOSITORY)
    private pawnRepository: PawnRepository,
    private eventService: EventService,
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
  ) { }

  execute (
    port: DetermineWhatPlayerCanDoPort,
  ): TaskEither<DetermineWhatPlayerCanDoErrors, DetermineWhatPlayerCanDoResult> {
    this.logger.error("DetermineWhatPlayerCanDoUseCase", { port });

    return pipe(
      this.roundRepository.getById(port.roundId),
      // Check if the player is allowed to do something
      taskEither.chainFirst((round) => pipe(
        round.playerId === port.playerId,
        boolean.fold(
          () => taskEither.left(new NotYourTurnError()),
          () => taskEither.right(constVoid()),
        ),
      )),
      taskEither.chain(round => pipe(
        taskEither.Do,
        //
        taskEither.bind("anotherRound", () => this.computeAnotherRound(round)),
        //
        taskEither.bind("putPawnOutside", () => this.computePutPawnOutside(round, port)),
        //
        taskEither.bind("movablePawns", ({ putPawnOutside }) => this.computeMovablePawns(round, putPawnOutside)),
        //
        taskEither.chain((store) => taskEither.right({
          canPlayAnotherRound: store.anotherRound,
          movablePawns: store.movablePawns,
          canPutPawnOutside: store.putPawnOutside,
        })),
        taskEither.chainFirst(
          store => pipe(
            this.determineIfNothingCanDone(store),
            boolean.fold(
              () => pipe(
                this.determineIfICannotMoveButICanReplay(store),
                boolean.fold(
                  () => taskEither.right(constVoid()),
                  () => this.createNextRound(port.gameId, port.playerId, port.roundId),
                ),
              ),
              // If nothing can be played this turn, auto create the next round
              // for the next player. This creation will trigger the event so player interface
              // will be warned
              () => this.createNextRound(port.gameId, port.playerId, port.roundId),
            ),
          ),
        ),
      )),
    );
  }

  /// ////////////////////////////////////////////////////////////////////////////////
  /** COMPUTING FUNCTIONS */
  /// ////////////////////////////////////////////////////////////////////////////////

  private computeAnotherRound (
    round: Round,
  ): TaskEither<DiceNotLaunchedError, boolean> {
    return pipe(
      round.diceScore,
      option.fold(
        () => taskEither.left(new DiceNotLaunchedError(round.id)),
        (score) => taskEither.right(score === 6),
      ),
    );
  }

  private computePutPawnOutside (
    round: Round,
    port: DetermineWhatPlayerCanDoPort,
  ): TaskEither<DetermineWhatPlayerCanDoErrors, boolean> {
    return pipe(
      round.diceScore,
      option.fold(
        () => taskEither.left(new DiceNotLaunchedError(round.id)),
        (score) => pipe(
          score === 6,
          // If score is lower than 6, in any case you are not able to put a pawn outside
          boolean.fold(
            () => taskEither.right(false),
            // Check if the root case is busy by my pawn, otherwise I can
            // put a pawn out, alone or by killing an opposing pawn
            () => this.checkIfAOwnedPawnIsOnMyRootCase(port),
          ),
        ),
      ),
    );
  }

  private computeMovablePawns (
    round: Round,
    putPawnOutside: boolean,
  ): TaskEither<
    TechnicalError,
    Array<{
      destination: PawnCase;
      id: string;
      name: PawnName;
      source: PawnCase;
    }>
  > {
    return pipe(
      round.diceScore,
      option.fold(
        () => taskEither.left(new TechnicalError(new Error("dice score is not present"))),

        diceScore => pipe(
          this.pawnRepository.listCurrentPositions(round.gameId),
          taskEither.bindTo("totalPawns"),
          taskEither.bindW("onlyOnBoardPawns", ({ totalPawns }) => pipe(totalPawns, array.filter(isPawnOnBoard), taskEither.right)),
          taskEither.bindW("movablePawns", ({ onlyOnBoardPawns }) => pipe(
            onlyOnBoardPawns,
            array.filter(pawn => this.determineIfPawnIsMovable(pawn, onlyOnBoardPawns, round)),
            taskEither.right,
          )),
          // We have to consider pawn in the house.
          // Returns an empty array if the score is not 6
          taskEither.bindW("inHousePawns", () => pipe(
            diceScore === 6,
            boolean.fold(
              () => taskEither.right([]),
              () => this.getPawnsInHouse(round.gameId, round.playerId),
            ),
          )),
          taskEither.map(
            ({ movablePawns, inHousePawns }) => pipe(
              movablePawns,
              array.map(
                pawn => ({
                  id: pawn.id,
                  name: pawn.name,
                  source: pawn.position,
                  destination: computeDestinationTrayCase(pawn, diceScore),
                }),
              ),
              (dd) => {
                if (!putPawnOutside) {
                  return dd;
                }

                return [
                  ...dd,
                  ...inHousePawns.map(pawn => ({
                    id: pawn.id,
                    name: pawn.name,
                    source: pawn.position,
                    destination: { Yellow: "6xx0", Blue: "0xx8", Red: "8xx14", Green: "14xx6" }[pawn.color] as TrayCase,
                  })),
                ];
              },
            ),
          ),
        ),
      ),
    );
  }

  /// ////////////////////////////////////////////////////////////////////////////////
  /** PRIVATE FUNCTIONS */
  /// ////////////////////////////////////////////////////////////////////////////////

  private createNextRound (
    gameId: GameId,
    playerId: PlayerId,
    roundId: RoundId,
  ): TaskEither<TechnicalError, void> {
    this.logger.debug("DetermineWhatPlayerCanDoUseCase.createNextRound");

    return pipe(
      this.playerRepository.findByGameId(gameId),
      // Takes the first player that is not the current player Id
      // takes the next player
      taskEither.map(array.findFirst(player => player.id !== playerId)),
      taskEither.chain(
        option.fold(
          () => taskEither.left(new TechnicalError(new Error("no player found"))),
          (player) => pipe(
            this.roundRepository.create(generateRound({ gameId, playerId: player.id })),
            taskEither.chain((round) => this.eventService.broadcast({ type: "round-created", data: round })),
            taskEither.chain(() => this.closePreviousRound(roundId)),
          ),
        ),
      ),
      taskEither.map(constVoid),
    );
  }

  private checkIfAOwnedPawnIsOnMyRootCase (
    port: DetermineWhatPlayerCanDoPort,
  ): TaskEither<TechnicalError, boolean> {
    return pipe(
      taskEither.Do,
      taskEither.bind("pawns", () => this.pawnRepository.listCurrentPositionsByPlayerId(port)),
      taskEither.bind("round", () => this.roundRepository.getById(port.roundId)),
      taskEither.chain(
        ({ pawns, round }) => pipe(
          this.detectOwnedPawnOnMyRootCase(pawns, round.playerId),
          taskEither.chain(
            boolean.fold(
              () => taskEither.right(false),
              () => this.detectHavingOncePawnInHouse(pawns, round.playerId),
            ),
          ),
        ),
      ),
    );
  }

  private detectOwnedPawnOnMyRootCase (
    pawns: Array<Pawn>,
    playerId: PlayerId,
  ): TaskEither<TechnicalError, boolean> {
    const spawnCases = {
      Green: "14xx6",
      Red: "8xx14",
      Blue: "0xx8",
      Yellow: "6xx0",
    };

    return pipe(
      pawns,
      array.filter(pawn => pawn.playerId === playerId),
      array.filter(pawn => spawnCases[pawn.color] === (pawn.position)),
      pawns => pawns.length === 0,
      taskEither.right,
    );
  }

  private detectHavingOncePawnInHouse (
    pawns: Array<Pawn>,
    playerId: PlayerId,
  ): TaskEither<TechnicalError, boolean> {
    const houseCoords = [
      "0xx14",
      "0xx13",
      "1xx13",
      "1xx14",
      "0xx0",
      "0xx1",
      "1xx0",
      "1xx1",
      "13xx0",
      "14xx0",
      "13xx1",
      "14xx1",
      "13xx13",
      "14xx14",
      "13xx14",
      "14xx13",
    ];

    return pipe(
      pawns,
      array.filter(pawn => pawn.playerId === playerId),
      array.filter(pawn => houseCoords.includes(pawn.position)),
      pawns => pawns.length > 0,
      taskEither.right,
    );
  }

  private determineIfNothingCanDone (
    store: {
      canPlayAnotherRound: boolean,
      canPutPawnOutside: boolean,
      movablePawns: Array<any>
    },
  ): boolean {
    return !store.canPlayAnotherRound && !store.canPutPawnOutside && store.movablePawns.length === 0;
  }

  private determineIfICannotMoveButICanReplay (
    store: {
      canPlayAnotherRound: boolean,
      canPutPawnOutside: boolean,
      movablePawns: Array<any>
    },
  ): boolean {
    return store.canPlayAnotherRound && !store.canPutPawnOutside && store.movablePawns.length === 0;
  }

  private determineIfPawnIsMovable (
    pawn: Pawn,
    pawns: Array<Pawn>,
    round: Round,
  ): boolean {
    if (pawn.playerId !== round.playerId) {
      return false;
    }

    if (option.isNone(round.diceScore)) {
      return false;
    }

    // When a pawn of the correct color is on its last case
    // and the score is 1. The pawn can access the heaven
    if (round.diceScore.value === 1 && isOnLastCase(pawn)) {
      return true;
    }

    // When the pawn is in heaven, determine if the dice score allows
    // to move it
    if (isOnHeaven(pawn)) {
      return canPawnProgressOnHeaven(pawn, round.diceScore.value);
    }

    if (round.diceScore.value > distanceFromTheEnd(pawn)) {
      return false;
    }

    if (pawns.length === 1) {
      // If the position is the last
      if (isOnLastCase(pawn)) {
        if (round.diceScore.value !== 1) {
          return false;
        }

        return true;
      }

      return true;
    } else {
      const cases = computeAllCaseBetweenSourceAndDestination(pawn.position, round.diceScore.value);

      let notBlocked = true;

      // For each case before the last,
      // if a pawn is here I'm blocked whatever the pawn is
      for (const kase of cases.slice(0, -1)) {
        if (pawns.map(p => p.position).includes(kase)) {
          notBlocked = false;
        }
      }

      const pawnOnTheLastCase = pawns.find(
        p => p.position === cases.at(-1),
      );
      if (pawnOnTheLastCase) {
        if (
          pawn.playerId === pawnOnTheLastCase?.playerId
        ) {
          notBlocked = false;
        }
      }

      return notBlocked;
    }
  }

  private getPawnsInHouse (
    gameId: GameId,
    playerId: PlayerId,
  ): TaskEither<TechnicalError, Array<Pawn>> {
    const houseCoords = [
      "0xx14",
      "0xx13",
      "1xx13",
      "1xx14",

      "0xx0",
      "0xx1",
      "1xx0",
      "1xx1",

      "13xx0",
      "14xx0",
      "13xx1",
      "14xx1",

      "13xx13",
      "14xx14",
      "13xx14",
      "14xx13",
    ];

    return pipe(
      this.pawnRepository.listCurrentPositionsByPlayerId({ gameId, playerId }),
      taskEither.map(array.filter(pawn => houseCoords.includes(pawn.position))),
    );
  }

  private closePreviousRound (
    roundId: RoundId,
  ): TaskEither<TechnicalError, Round> {
    return pipe(
      this.roundRepository.getById(roundId),
      taskEither.chain((round) => this.roundRepository.update({
        ...round,
        status: "Finished",
      })),
    );
  }
}
