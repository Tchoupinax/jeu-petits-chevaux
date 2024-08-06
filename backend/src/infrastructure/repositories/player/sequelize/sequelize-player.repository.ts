import { Inject, Logger } from "@nestjs/common";
import { array, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { TaskEither, tryCatch } from "fp-ts/lib/TaskEither";
import { Sequelize } from "sequelize-typescript";

import { Player } from "../../../../domain/entities/player";
import { PlayerAlreadyExistsError } from "../../../../domain/errors/player-already-exists.error";
import { PlayerNotFoundError } from "../../../../domain/errors/player-not-found.error";
import { PlayerRepository } from "../../../../domain/gateways/player.repository";
import { TechnicalError } from "../../../errors/technical.errors";
import { SequelizePlayerModel } from "./sequelize-player.model";

export class SequelizePlayerRepository implements PlayerRepository {
  constructor (
    @Inject(Sequelize)
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
  ) {
    this.sequelize.addModels([SequelizePlayerModel]);
  }

  findByGameId (
    gameId: string,
  ): taskEither.TaskEither<TechnicalError, Player[]> {
    this.logger.debug({ gameId }, "SequelizePlayerRepository.findByGameId");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.findAll({ where: { gameId } }),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(array.map(SequelizePlayerModel.toEntity)),
    );
  }

  findOneByNickname (
    nickname: string,
  ): taskEither.TaskEither<PlayerNotFoundError, option.Option<Player>> {
    this.logger.debug({ nickname }, "SequelizePlayerRepository.findOneByNickname");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.findOne({ where: { nickname } }),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(option.fromNullable),
      taskEither.map(option.map(SequelizePlayerModel.toEntity)),
    );
  }

  getOneByNickname (
    nickname: string,
  ): taskEither.TaskEither<PlayerNotFoundError, Player> {
    this.logger.debug({ nickname }, "SequelizePlayerRepository.getOneByNickname");

    return pipe(
      this.findOneByNickname(nickname),
      taskEither.chain(
        option.fold(
          () => taskEither.left(new PlayerNotFoundError(nickname)),
          player => taskEither.right(player),
        ),
      ),
    );
  }

  detachPlayersToGame (
  ): taskEither.TaskEither<TechnicalError, void> {
    throw new Error("Method not implemented.");
  }

  detachPlayerToGame (data: { gameId: string, playerId: string }): taskEither.TaskEither<PlayerNotFoundError, void> {
    this.logger.debug({ data }, "SequelizePlayerRepository.detachPlayerToGame");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.update(
          { gameId: null },
          { where: { id: data.playerId } },
        ),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(constVoid),
    );
  }

  attachPlayerToGame (playerId: string, gameId: string): taskEither.TaskEither<PlayerNotFoundError, void> {
    this.logger.debug({ playerId, gameId }, "SequelizePlayerRepository.attachPlayerToRoom");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.update(
          { gameId },
          { where: { id: playerId } },
        ),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(constVoid),
    );
  }

  getOne (id: string): taskEither.TaskEither<PlayerNotFoundError, Player> {
    this.logger.debug({ id }, "SequelizePlayerRepository.getOne");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.findByPk(id),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(option.fromNullable),
      taskEither.chainW(option.fold(
        () => taskEither.left(new PlayerNotFoundError(id)),
        player => taskEither.right(SequelizePlayerModel.toEntity(player)),
      )),
    );
  }

  getPlayerByNickname (nickname: string): taskEither.TaskEither<TechnicalError | PlayerNotFoundError, Player> {
    this.logger.debug({ nickname }, "SequelizePlayerRepository.getPlayerByNickname");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.findOne({ where: { nickname } }),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(option.fromNullable),
      taskEither.chainW(option.fold(
        () => taskEither.left(new PlayerNotFoundError(nickname)),
        player => taskEither.right(SequelizePlayerModel.toEntity(player)),
      )),
    );
  }

  create (player: Player): TaskEither<TechnicalError | PlayerAlreadyExistsError, Player> {
    // this.logger.debug({ player }, "SequelizePlayerRepository.create");

    return pipe(
      tryCatch(
        () => SequelizePlayerModel.toModel(player).save(),
        (err: any) => {
          if (err.name === "SequelizeUniqueConstraintError" && err.fields.includes("nickname")) {
            return new PlayerAlreadyExistsError(player.nickname);
          }

          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(() => player),
    );
  }
}
