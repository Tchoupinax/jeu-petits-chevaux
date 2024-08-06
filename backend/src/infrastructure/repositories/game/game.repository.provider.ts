import { FactoryProvider, Logger } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { GAME_REPOSITORY } from "../../../common/constants";
import { SequelizeGameRepository } from "./sequelize/sequelize-game.repository";

export const GameRepositoryProvider: FactoryProvider<SequelizeGameRepository> = {
  provide: GAME_REPOSITORY,
  useFactory: (sequelize: Sequelize, logger: Logger) => {
    return new SequelizeGameRepository(sequelize, logger);
  },
  inject: [Sequelize, Logger],
};
