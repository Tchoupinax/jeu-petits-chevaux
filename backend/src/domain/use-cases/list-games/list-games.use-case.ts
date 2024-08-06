import { Inject, Logger } from "@nestjs/common";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { Game } from "../../entities/game";
import { PlayerAlreadyExistsError } from "../../errors/player-already-exists.error";
import { GameRepository } from "../../gateways/game.repository";

export class ListGamesUseCase {
  constructor (
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    private logger: Logger,
  ) { }

  execute (): TaskEither<TechnicalError | PlayerAlreadyExistsError, Array<Game>> {
    this.logger.debug("ListGamesUseCase");

    return this.gameRepository.listGames();
  }
}
