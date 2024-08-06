import { ClassProvider } from "@nestjs/common";

import { ROUND_REPOSITORY } from "../../../common/constants";
import { SequelizeRoundRepository } from "./sequelize/sequelize-round.repository";

export const RoundRepositoryProvider: ClassProvider<SequelizeRoundRepository> = {
  provide: ROUND_REPOSITORY,
  useClass: SequelizeRoundRepository,
};
