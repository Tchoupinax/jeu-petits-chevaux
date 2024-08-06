import { Inject, Logger } from "@nestjs/common";
import { array, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { GAME_REPOSITORY, PLAYER_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { Game, generateGame } from "../../entities/game";
import { PlayerId } from "../../entities/player";
import { PlayerAlreadyExistsError } from "../../errors/player-already-exists.error";
import { PlayerNotFoundError } from "../../errors/player-not-found.error";
import { GameRepository } from "../../gateways/game.repository";
import { PlayerRepository } from "../../gateways/player.repository";
import { EventService } from "../../services/event.service";

export type CreateGamePort = {
  name: string;
  playerId: string;
}

export class CreateGameUseCase {
  constructor (
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    private logger: Logger,
    private eventService: EventService,
  ) { }

  execute (
    port: CreateGamePort,
  ): TaskEither<TechnicalError | PlayerAlreadyExistsError, Game> {
    this.logger.debug({ port }, "CreateGameUseCase");

    return pipe(
      generateGame({ name: port.name }),
      game => this.addOwnerInTheGame(port.playerId as PlayerId, game),
      taskEither.chainFirst(game => this.gameRepository.create(game)),
      taskEither.chainFirst(game => this.eventService.broadcast({ type: "game-created", data: game })),
      taskEither.chainFirst(game => this.playerRepository.attachPlayerToGame(game.players[0].id, game.id)),
      taskEither.chainFirst(game => pipe(
        game.players.slice(1),
        array.map(player => this.playerRepository.create(player)),
        taskEither.sequenceSeqArray,
      )),
    );
  }

  private addOwnerInTheGame (
    playerId: PlayerId,
    game: Game,
  ): TaskEither<TechnicalError | PlayerNotFoundError, Game> {
    return pipe(
      this.playerRepository.getOne(playerId),
      taskEither.chain(
        (player) => pipe(
          (() : Game => {
            game.players.push(player);
            return game;
          })(),
          game => taskEither.right(game),
        ),
      ),
    );
  }
}
