import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";

import { TechnicalError } from "../../infrastructure/errors/technical.errors";
import { Game, GamePlayersColors } from "../entities/game";
import { Player } from "../entities/player";

export type GameRepository = {
  create(game: Game): TaskEither<TechnicalError, Game>;
  delete(gameId: Game["id"]): TaskEither<TechnicalError, void>;
  finish(gameId: Game["id"], winnerPlayerId: Player["id"]): TaskEither<TechnicalError, void>;
  getById(id: string): TaskEither<TechnicalError, Game>;
  getByName(name: string): TaskEither<TechnicalError, Game>;
  getPlayersColors(gameId: string): TaskEither<TechnicalError, Option<GamePlayersColors>>;
  listGames(): TaskEither<TechnicalError, Array<Game>>;
  update(game: Game): TaskEither<TechnicalError, Game>;
  updatePlayersColors(gameId: string, gamePlayersColors: GamePlayersColors): TaskEither<TechnicalError, void>;
}
