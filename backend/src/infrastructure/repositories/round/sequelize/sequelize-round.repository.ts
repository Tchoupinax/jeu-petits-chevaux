import { Inject } from "@nestjs/common";
import { randomUUID } from "crypto";
import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { Sequelize } from "sequelize-typescript";

import { GameId } from "../../../../domain/entities/game";
import { PlayerId } from "../../../../domain/entities/player";
import { Round, RoundId } from "../../../../domain/entities/round";
import { RoundNotFoundError } from "../../../../domain/errors/tour-not-found.error";
import { RoundRepository } from "../../../../domain/gateways/round.repository";
import { PawnName } from "../../../../domain/value-objects/pawn-name";
import { TrayCase } from "../../../../domain/value-objects/tray-case";
import { TechnicalError } from "../../../errors/technical.errors";
import { SequelizeRoundModel } from "./sequelize-round.model";

export class SequelizeRoundRepository implements RoundRepository {
  constructor (@Inject(Sequelize) private readonly sequelize: Sequelize) {
    this.sequelize.addModels([SequelizeRoundModel]);
  }

  create (
    round: Round,
  ): taskEither.TaskEither<TechnicalError, Round> {
    return pipe(
      tryCatch(
        () => SequelizeRoundModel.toModel(round).save(),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(SequelizeRoundModel.toEntity),
    );
  }

  findAllByGameId (
    gameId: GameId,
  ): taskEither.TaskEither<TechnicalError, Round[]> {
    return pipe(
      tryCatch(
        () => SequelizeRoundModel.findAll({ where: { gameId } }),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(array.map(SequelizeRoundModel.toEntity)),
    );
  }

  update (
    round: Round,
  ): taskEither.TaskEither<TechnicalError, Round> {
    return pipe(
      tryCatch(
        () => SequelizeRoundModel.toModel(round, false).save(),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(SequelizeRoundModel.toEntity),
    );
  }

  getById (roundId: string): taskEither.TaskEither<TechnicalError | RoundNotFoundError, Round> {
    return pipe(
      tryCatch(
        () => SequelizeRoundModel.findOne({ where: { id: roundId } }),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.chain((data) => pipe(
        data,
        option.fromNullable,
        option.fold(
          () => taskEither.left(new RoundNotFoundError(roundId)),
          (round) => pipe(SequelizeRoundModel.toEntity(round), taskEither.right),
        ),
      )),
    );
  }

  getByIdAndPlayerId (
    roundId: string, playerId: string,
  ): taskEither.TaskEither<TechnicalError | RoundNotFoundError, Round> {
    return pipe(
      tryCatch(
        () => SequelizeRoundModel.findOne({ where: { id: roundId, playerId } }),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.chain((data) => pipe(
        data,
        option.fromNullable,
        option.fold(
          () => taskEither.left(new RoundNotFoundError(roundId)),
          (round) => pipe(SequelizeRoundModel.toEntity(round), taskEither.right),
        ),
      )),
    );
  }

  persistMove (data: {
    pawnEndingCase: TrayCase;
    pawnName: PawnName;
    pawnStartingCase: TrayCase;
    playerId: string;
    roundId: string;
  }): taskEither.TaskEither<TechnicalError, Round> {
    return pipe(
      tryCatch(
        () => SequelizeRoundModel.update(
          {
            pawnStartingCase: data.pawnStartingCase,
            pawnEndingCase: data.pawnEndingCase,
            pawnName: data.pawnName,
          },
          {
            where: { playerId: data.playerId, id: data.roundId },
            returning: true,
          },
        ),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(([, rows]) => rows[0]),
      taskEither.map(SequelizeRoundModel.toEntity),
    );
  }

  persistDiceLaunch (
    data: {
      gameId: GameId,
      launchedAt: Date,
      playerId: PlayerId,
      random: number
    },
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
        gameId: data.gameId,
        status: "WaitingDiceLaunch",
      }))(),
      data =>
        pipe(
          tryCatch(
            () => SequelizeRoundModel.toModel(data).save(),
            (err) => new TechnicalError(err as Error),
          ),
          taskEither.map(() => data),
        ),
    );
  }
}
