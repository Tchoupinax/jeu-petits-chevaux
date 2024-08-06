import { Inject, Logger } from "@nestjs/common";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY, PLAYER_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { Context } from "../../common/context";
import { PlayerAlreadyExistsError } from "../../errors/player-already-exists.error";
import { GameRepository } from "../../gateways/game.repository";
import { PlayerRepository } from "../../gateways/player.repository";

export type DeleteGamePort = {
  name: string;
}

export class DeleteGameUseCase {
  constructor (
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    private logger: Logger,
  ) { }

  execute (port: DeleteGamePort, context: Context): TaskEither<TechnicalError | PlayerAlreadyExistsError, void> {
    this.logger.debug({ port, context }, "DeleteGameUseCase");

    return pipe(
      this.gameRepository.getByName(port.name),
      taskEither.chain((game) => pipe(
        this.playerRepository.detachPlayersToGame(game.id),
        taskEither.chain(() => this.gameRepository.delete(game.id)),
      )),
    );
  }
}
