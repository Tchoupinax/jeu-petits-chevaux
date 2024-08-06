import { array, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";

import { Game, GameId, GamePlayersColors } from "../../../../domain/entities/game";
import { PlayerId } from "../../../../domain/entities/player";
import { GameNotFoundError } from "../../../../domain/errors/game-not-found.error";
import { GameRepository } from "../../../../domain/gateways/game.repository";
import { InMemory } from "../../../../utils/in-memory";
import { TechnicalError } from "../../../errors/technical.errors";

export class InMemoryGameRepository extends InMemory<Game> implements GameRepository {
  constructor (games: Array<Game> = []) {
    super(games);
  }

  finish (gameId: GameId, winnerPlayerId: PlayerId): taskEither.TaskEither<TechnicalError, void> {
    throw new Error("Method not implemented.");
  }

  getById (id: string): taskEither.TaskEither<GameNotFoundError, Game> {
    return pipe(
      this.entities,
      array.filter(game => game.id === id),
      games => {
        if (games.length === 0) {
          return taskEither.left(new GameNotFoundError(id));
        }

        return taskEither.right(games[0]);
      },
    );
  }

  getByName (name: string): taskEither.TaskEither<TechnicalError, Game> {
    return pipe(
      this.entities,
      array.findFirst(game => game.name === name),
      taskEither.fromOption(() => new TechnicalError(new Error(`Game with name ${name} not found`))),
    );
  }

  listGames (): taskEither.TaskEither<TechnicalError, Game[]> {
    throw new Error("Method not implemented.");
  }

  delete (): taskEither.TaskEither<TechnicalError, void> {
    return taskEither.right(constVoid());
  }

  getPlayersColors (gameId: string): TaskEither<TechnicalError, Option<GamePlayersColors>> {
    return pipe(
      this.entities.find(game => game.id === gameId),
      option.fromNullable,
      option.fold(
        () => taskEither.right(option.none),
        (game) => taskEither.right(game.playersColors),
      ),
    );
  }

  updatePlayersColors (gameId: string, gamePlayersColors: GamePlayersColors): TaskEither<TechnicalError, void> {
    const gameIndex = this.entities.findIndex(game => game.id === gameId);

    if (gameIndex >= 0) {
      this.entities[gameIndex].playersColors = option.some(gamePlayersColors);
    }

    return taskEither.right(constVoid());
  }
}
