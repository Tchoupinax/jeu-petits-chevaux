import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";
import { TechnicalError } from "src/infrastructure/errors/technical.errors";

import { Player } from "../entities/player";
import { PlayerAlreadyExistsError } from "../errors/player-already-exists.error";
import { PlayerNotFoundError } from "../errors/player-not-found.error";

export type PlayerRepository = {
  attachPlayerToGame(playerId: string, gameId: string): TaskEither<PlayerNotFoundError, void>;
  create(player: Player): TaskEither<TechnicalError | PlayerAlreadyExistsError, Player>;
  detachPlayerToGame(data: { gameId: string, playerId: string }): TaskEither<PlayerNotFoundError, void>;
  detachPlayersToGame(gameId: string): TaskEither<TechnicalError, void>,
  findByGameId(gameId: string): TaskEither<TechnicalError, Array<Player>>;
  findOneByNickname(nickname: string): TaskEither<PlayerNotFoundError, Option<Player>>;
  getOne(id: Player["id"]): TaskEither<PlayerNotFoundError, Player>;
  getOneByNickname(nickname: string): TaskEither<PlayerNotFoundError, Player>;
}
