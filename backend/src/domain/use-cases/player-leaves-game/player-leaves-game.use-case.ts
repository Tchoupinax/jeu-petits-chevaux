import { Inject, Logger } from "@nestjs/common";
import { boolean, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY, PLAYER_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { PlayerId } from "../../entities/player";
import { PlayerAlreadyExistsError } from "../../errors/player-already-exists.error";
import { GameRepository } from "../../gateways/game.repository";
import { PlayerRepository } from "../../gateways/player.repository";
import { EventService } from "../../services/event.service";

export type PlayerLeavesGamePort = {
  gameId: string;
  playerId: string;
}

export class PlayerLeavesGameUseCase {
  constructor (
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    private logger: Logger,
    private eventService: EventService,
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
  ) { }

  execute (port: PlayerLeavesGamePort): TaskEither<TechnicalError | PlayerAlreadyExistsError, void> {
    this.logger.debug({ port }, "PlayerLeavesGameUseCase");

    return pipe(
      this.playerRepository.detachPlayerToGame(port),
      taskEither.chain(() => this.deleteGameIfEmpty(port.gameId)),
      taskEither.chain(() => this.playerRepository.getOne(port.playerId as PlayerId)),
      taskEither.chain(player => this.eventService.broadcastPlayer("game-player-leaved", player)),
    );
  }

  private deleteGameIfEmpty (gameId: string): TaskEither<TechnicalError, void> {
    return pipe(
      this.gameRepository.getById(gameId),
      taskEither.chain(game => pipe(
        game.players.length === 0,
        boolean.fold(
          () => taskEither.of(constVoid()),
          () => pipe(
            this.gameRepository.delete(game.id),
            taskEither.chain(() => this.eventService.broadcast({ data: game.id, type: "game-deleted" })),
          ),
        ),
      )),
    );
  }
}
