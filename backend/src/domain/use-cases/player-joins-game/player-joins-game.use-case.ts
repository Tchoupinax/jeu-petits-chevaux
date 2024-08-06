import { Inject, Logger } from "@nestjs/common";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY, PLAYER_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { Game } from "../../entities/game";
import { PlayerId } from "../../entities/player";
import { PlayerAlreadyExistsError } from "../../errors/player-already-exists.error";
import { GameRepository } from "../../gateways/game.repository";
import { PlayerRepository } from "../../gateways/player.repository";
import { EventService } from "../../services/event.service";

export type PlayerJoinsGamePort = {
  playerId: string;
  targetedGameId: string;
}

export class PlayerJoinsGameUseCase {
  constructor (
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    private logger: Logger,
    private eventService: EventService,
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
  ) { }

  execute (port: PlayerJoinsGamePort): TaskEither<TechnicalError | PlayerAlreadyExistsError, Game> {
    this.logger.debug({ port }, "PlayerJoinsGameUseCase");

    return pipe(
      this.playerRepository.attachPlayerToGame(port.playerId, port.targetedGameId),
      taskEither.chain(() => this.playerRepository.getOne(port.playerId as PlayerId)),
      taskEither.chain((player) => this.eventService.broadcast({ data: player, type: "game-player-joined" })),
      taskEither.chain(() => this.gameRepository.getById(port.targetedGameId)),
    );
  }
}
