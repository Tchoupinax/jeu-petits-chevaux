import { Inject, Logger } from "@nestjs/common";
import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { TaskEither, tryCatch } from "fp-ts/TaskEither";
import { Sequelize } from "sequelize-typescript";

import { Context } from "../../../../common/context";
import { GameId } from "../../../../domain/entities/game";
import { Pawn } from "../../../../domain/entities/pawn";
import { PawnRepository } from "../../../../domain/gateways/pawn.repository";
import { PawnName } from "../../../../domain/value-objects/pawn-name";
import { TrayCase } from "../../../../domain/value-objects/tray-case";
import { TechnicalError } from "../../../errors/technical.errors";
import { SequelizePawnModel } from "./sequelize-pawn.model";

export class SequelizePawnRepository implements PawnRepository {
  constructor (
    @Inject(Sequelize)
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
  ) {
    this.sequelize.addModels([SequelizePawnModel]);
  }

  findAllByTraycase (
    traycase: TrayCase,
  ): taskEither.TaskEither<TechnicalError, Pawn[]> {
    this.logger.debug({ traycase }, "SequelizePawnRepository.findAllByTraycase");

    return pipe(
      tryCatch(
        () => SequelizePawnModel.findAll({ where: { position: traycase } }),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(array.map(SequelizePawnModel.toEntity)),
    );
  }

  getByName (
    pawnName: PawnName,
    gameId: GameId,
  ): taskEither.TaskEither<TechnicalError, Pawn> {
    this.logger.debug({ pawnName, gameId }, "SequelizePawnRepository.getByName");

    return pipe(
      tryCatch(
        () => SequelizePawnModel.findOne({ where: { name: pawnName, gameId } }),
        (err) => {
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(option.fromNullable),
      taskEither.chain(taskEither.fromOption(() => new TechnicalError(new Error("Pawn not found")))),
      taskEither.map(SequelizePawnModel.toEntity),
    );
  }

  update (pawn: Pawn): taskEither.TaskEither<TechnicalError, Pawn> {
    this.logger.debug({ pawn }, "SequelizePawnRepository.update");

    return pipe(
      tryCatch(
        () => SequelizePawnModel.toModel(pawn, false).save(),
        (err) => {
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(SequelizePawnModel.toEntity),
    );
  }

  createPosition (pawn: Pawn): TaskEither<TechnicalError, Pawn> {
    this.logger.debug({ pawn }, "SequelizePawnRepository.createPosition");

    return pipe(
      tryCatch(
        () => SequelizePawnModel.toModel(pawn).save(),
        (err) => {
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(() => pawn),
    );
  }

  listCurrentPositions (
    gameId: GameId,
  ): taskEither.TaskEither<TechnicalError, Pawn[]> {
    this.logger.debug({ gameId }, "SequelizePawnRepository.listCurrentPositions");

    return pipe(
      tryCatch(
        () => SequelizePawnModel.findAll({ where: { gameId } }),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(array.map(SequelizePawnModel.toEntity)),
    );
  }

  listCurrentPositionsByPlayerId (
    context: Context,
  ): taskEither.TaskEither<TechnicalError, Pawn[]> {
    this.logger.debug({ context }, "SequelizePawnRepository.listCurrentPositionsByPlayerId");

    return pipe(
      tryCatch(
        () => SequelizePawnModel.findAll({
          where: { gameId: context.gameId, playerId: context.playerId },
        }),
        (err) => new TechnicalError(err as Error),
      ),
      taskEither.map(array.map(SequelizePawnModel.toEntity)),
    );
  }
}
