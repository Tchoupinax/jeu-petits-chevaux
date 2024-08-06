import { randomUUID } from "crypto";
import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GameId, generateGameId } from "../../../../domain/entities/game";
import { PlayerId } from "../../../../domain/entities/player";
import { Round, RoundId } from "../../../../domain/entities/round";
import { RoundNotFoundError } from "../../../../domain/errors/tour-not-found.error";
import { RoundRepository } from "../../../../domain/gateways/round.repository";
import { PawnName } from "../../../../domain/value-objects/pawn-name";
import { TrayCase } from "../../../../domain/value-objects/tray-case";
import { InMemory } from "../../../../utils/in-memory";
import { TechnicalError } from "../../../errors/technical.errors";

export class InMemoryRoundRepository extends InMemory<Round> implements RoundRepository {
  constructor (rounds: Array<Round> = []) {
    super(rounds);
  }

  findAllByGameId (
    gameId: GameId,
  ): taskEither.TaskEither<TechnicalError, Round[]> {
    return pipe(
      this.entities,
      array.filter(entity => entity.gameId === gameId),
      taskEither.of,
    );
  }

  getById (
    roundId: string,
  ): taskEither.TaskEither<TechnicalError | RoundNotFoundError, Round> {
    return pipe(
      this.entities.find(round => round.id === roundId),
      option.fromNullable,
      taskEither.fromOption(() => new RoundNotFoundError(`round with id "${roundId}" not found`)),
    );
  }

  persistDiceLaunch (
    data: { gameId: GameId, launchedAt: Date; playerId: PlayerId; random: number; },
  ): TaskEither<TechnicalError, Round> {
    return pipe(
      ((): Round => ({
        id: randomUUID() as RoundId,
        diceScore: option.some(data.random),
        diceLaunchedAt: option.some(data.launchedAt),
        createdAt: new Date(),
        updatedAt: new Date(),
        pawnEndingCase: option.none,
        pawnStartingCase: option.none,
        pawnName: option.none,
        playerId: data.playerId,
        gameId: generateGameId(),
        status: "WaitingDiceLaunch",
      }))(),
      taskEither.right,
      taskEither.map((round) => {
        this.entities.push(round);
        return round;
      }),
    );
  }

  persistMove (data: {
    pawnEndingCase: TrayCase;
    pawnName: PawnName;
    pawnStartingCase: TrayCase;
    playerId: PlayerId;
    roundId: RoundId;
  }): TaskEither<TechnicalError, Round> {
    return pipe(
      this.entities.find(round => round.id === data.roundId),
      option.fromNullable,
      option.foldW(
        () => taskEither.left(new TechnicalError(new Error("fe"))),
        () => pipe(
          taskEither.right(this.entities.findIndex(round => round.id === data.roundId)),
          taskEither.map((index) => {
            this.entities[index] = ({
              ...this.entities[index],
              pawnStartingCase: option.fromNullable(data.pawnStartingCase),
              pawnEndingCase: option.fromNullable(data.pawnEndingCase),
              pawnName: option.fromNullable(data.pawnName),
              playerId: data.playerId,
            });

            return this.entities[index];
          }),
        ),
      ),
    );
  }

  findLatestRound (
    gameId: string,
  ): taskEither.TaskEither<TechnicalError, option.Option<Round>> {
    const array = this.entities.sort(
      (a, b) => {
        if (a.createdAt < b.createdAt) { return 1; } else if (a.createdAt > b.createdAt) { return -1; } else { return 0; }
      },
    );

    return taskEither.right(
      option.fromNullable(
        array.filter(round => round.gameId === gameId).at(0),
      ),
    );
  }
}
