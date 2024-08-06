import { Inject, Logger } from "@nestjs/common";
import { array, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";
import { Sequelize } from "sequelize-typescript";

import { Game, GameId, GamePlayersColors } from "../../../../domain/entities/game";
import { PlayerId } from "../../../../domain/entities/player";
import { GameNotFoundError } from "../../../../domain/errors/game-not-found.error";
import { GameRepository } from "../../../../domain/gateways/game.repository";
import { TechnicalError } from "../../../errors/technical.errors";
import { SequelizePlayerModel } from "../../player/sequelize/sequelize-player.model";
import { SequelizeGameModel } from "./sequelize-game.model";

export class SequelizeGameRepository implements GameRepository {
  constructor (
    @Inject(Sequelize)
    private readonly sequelize: Sequelize,
    private readonly logger: Logger,
  ) {
    this.sequelize.addModels([SequelizeGameModel, SequelizePlayerModel]);
  }

  finish (gameId: GameId, winnerPlayerId: PlayerId): taskEither.TaskEither<TechnicalError, void> {
    this.logger.debug({ gameId, winnerPlayerId }, "SequelizeGameRepository.finish");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.update(
          { finishedAt: new Date(), wonBy: winnerPlayerId },
          { where: this.getDefaultCriteria({ id: gameId }) },
        ),
        (err) => {
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(constVoid),
    );
  }

  update (game: Game): taskEither.TaskEither<TechnicalError, Game> {
    this.logger.debug({ game }, "SequelizeGameRepository.update");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.toModel(game, false).save(),
        (err) => {
          console.log(err);
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(SequelizeGameModel.toEntity),
    );
  }

  getById (id: string): taskEither.TaskEither<TechnicalError, Game> {
    this.logger.debug({ id }, "SequelizeGameRepository.getById");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.findOne({
          where: this.getDefaultCriteria({ id }),
          include: [SequelizePlayerModel],
        }),
        (err) => {
          console.log(err);
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(option.fromNullable),
      taskEither.chain(
        option.fold(
          () => taskEither.left(new GameNotFoundError(id)),
          (game) => taskEither.right(SequelizeGameModel.toEntity(game)),
        ),
      ),
    );
  }

  getByName (name: string): taskEither.TaskEither<TechnicalError, Game> {
    this.logger.debug({ name }, "SequelizeGameRepository.getByName");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.findOne({
          where: this.getDefaultCriteria({ name }),
          include: [SequelizePlayerModel],
        }),
        (err) => {
          console.log(err);
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(option.fromNullable),
      taskEither.chain(
        option.fold(
          () => taskEither.left(new GameNotFoundError(name)),
          (game) => taskEither.right(SequelizeGameModel.toEntity(game)),
        ),
      ),
    );
  }

  delete (gameId: Game["id"]): taskEither.TaskEither<TechnicalError, void> {
    this.logger.debug({ gameId }, "SequelizeGameRepository.delete");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.destroy(
          { where: this.getDefaultCriteria({ id: gameId }) },
        ),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(constVoid),
    );
  }

  listGames (): taskEither.TaskEither<TechnicalError, Array<Game>> {
    this.logger.debug("SequelizeGameRepository.listGames");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.findAll({
          include: [SequelizePlayerModel],
          where: this.getDefaultCriteria({}),
        }),
        err => new TechnicalError(err as Error),
      ),
      taskEither.map(array.map(SequelizeGameModel.toEntity)),
    );
  }

  create (game: Game): taskEither.TaskEither<TechnicalError, Game> {
    this.logger.debug({ game }, "SequelizeGameRepository.create");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.toModel(game).save(),
        (err) => {
          console.log(err);
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(SequelizeGameModel.toEntity),
    );
  }

  getPlayersColors (
    gameId: string,
  ): taskEither.TaskEither<TechnicalError, Option<GamePlayersColors>> {
    this.logger.debug({ gameId }, "SequelizeGameRepository.getPlayersColors");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.findByPk(gameId),
        (err) => {
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(option.fromNullable),
      taskEither.chain(
        option.fold(
          () => taskEither.left(new GameNotFoundError(gameId)),
          (game) => pipe(
            SequelizeGameModel.toEntity(game),
            game => taskEither.right(game.playersColors),
          ),
        ),
      ),
    );
  }

  updatePlayersColors (
    gameId: string,
    gamePlayersColors: GamePlayersColors,
  ): taskEither.TaskEither<TechnicalError, void> {
    this.logger.debug({ gameId, gamePlayersColors }, "SequelizeGameRepository.updatePlayersColors");

    return pipe(
      tryCatch(
        () => SequelizeGameModel.update(
          { playersColors: gamePlayersColors },
          { where: this.getDefaultCriteria({ id: gameId }) },
        ),
        (err) => {
          return new TechnicalError(err as Error);
        },
      ),
      taskEither.map(constVoid),
    );
  }

  getDefaultCriteria (
    criteria: Record<string, string | number | boolean>,
  ): Record<string, string | number | boolean> {
    return {
      ...criteria,
    };
  }
}
