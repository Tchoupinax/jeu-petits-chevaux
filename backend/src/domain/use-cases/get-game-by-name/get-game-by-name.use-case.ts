import { Inject, Logger } from "@nestjs/common";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { Game } from "../../entities/game";
import { GameRepository } from "../../gateways/game.repository";

export type GetGameByNamePort = {
  name: string;
}

export class GetGameByNameUseCase {
  constructor (
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    private logger: Logger,
  ) { }

  execute (port: GetGameByNamePort): TaskEither<TechnicalError, Game> {
    this.logger.debug({ port }, "GetGameByNameUseCase");

    return this.gameRepository.getByName(port.name);
  }
}
