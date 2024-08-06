import { FactoryProvider, Logger } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { PLAYER_REPOSITORY } from "../../../common/constants";
import { SequelizePlayerRepository } from "./sequelize/sequelize-player.repository";

export const PlayerRepositoryProvider: FactoryProvider<SequelizePlayerRepository> = {
  provide: PLAYER_REPOSITORY,
  useFactory: (sequelize: Sequelize, logger: Logger) => {
    return new SequelizePlayerRepository(sequelize, logger);
  },
  inject: [Sequelize, Logger],
};
