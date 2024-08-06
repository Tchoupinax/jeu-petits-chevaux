import { FactoryProvider, Logger } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";

import { PAWN_REPOSITORY } from "../../../common/constants";
import { SequelizePawnRepository } from "./sequelize/sequelize-pawn.repository";

export const PawnRepositoryProvider: FactoryProvider<SequelizePawnRepository> = {
  provide: PAWN_REPOSITORY,
  useFactory: (sequelize: Sequelize, logger: Logger) => {
    return new SequelizePawnRepository(sequelize, logger);
  },
  inject: [Sequelize, Logger],
};
