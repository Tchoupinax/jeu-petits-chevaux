import { Inject, Logger } from "@nestjs/common";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { TechnicalError } from "src/infrastructure/errors/technical.errors";
import { ValidationError } from "src/infrastructure/errors/validation.error";

import { PLAYER_REPOSITORY } from "../../../common/constants";
import { Player } from "../../entities/player";
import { PlayerRepository } from "../../gateways/player.repository";

export type GetPlayerByNamePort = {
  name: string
}

export class GetPlayerByNameUseCase {
  constructor (
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    private logger: Logger,
  ) { }

  execute (
    port: GetPlayerByNamePort,
  ): TaskEither<TechnicalError | ValidationError, Player> {
    this.logger.debug({ port }, "GetPlayerByNameUseCase");

    return this.playerRepository.getOneByNickname(port.name);
  }
}
