import { array, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { Option } from "fp-ts/Option";

import { GameId } from "../../../../domain/entities/game";
import { Player } from "../../../../domain/entities/player";
import { PlayerNotFoundError } from "../../../../domain/errors/player-not-found.error";
import { PlayerRepository } from "../../../../domain/gateways/player.repository";
import { InMemory } from "../../../../utils/in-memory";
import { TechnicalError } from "../../../errors/technical.errors";

export class InMemoryPlayerRepository extends InMemory<Player> implements PlayerRepository {
  constructor (players: Array<Player> = []) {
    super(players);
  }

  findByGameId (
    gameId: string,
  ): taskEither.TaskEither<TechnicalError, Player[]> {
    return pipe(
      this.entities,
      array.filter(player => pipe(
        player.gameId,
        option.fold(
          () => false,
          currentGameId => currentGameId === gameId),
      ),
      ),
      taskEither.of,
    );
  }

  getOneByNickname (
    nickname: string,
  ): taskEither.TaskEither<PlayerNotFoundError, Player> {
    return pipe(
      this.entities,
      array.findFirst(entity => entity.nickname === nickname),
      taskEither.fromOption(() => new TechnicalError(new Error("d"))),
    );
  }

  detachPlayersToGame (
    gameId: string,
  ): taskEither.TaskEither<TechnicalError, void> {
    for (let i = 0; i < this.entities.length; i++) {
      const localGameId = this.entities[i].gameId;
      if (option.isSome(localGameId)) {
        if (localGameId.value === gameId) {
          this.entities[i].gameId = option.none;
        }
      }
    }

    return taskEither.of(constVoid());
  }

  detachPlayerToGame (data: { gameId: string; playerId: string; }): taskEither.TaskEither<PlayerNotFoundError, void> {
    const index = this.entities.findIndex(player => player.id === data.playerId);
    if (index === -1) {
      return taskEither.left(new TechnicalError(new Error("Player not found")));
    }

    this.entities[index].gameId = option.none;

    return taskEither.of(constVoid());
  }

  detachPlayerToRoom (data: { gameId: string, playerId: string }): taskEither.TaskEither<PlayerNotFoundError, void> {
    this.entities = this.entities
      .filter(player => player.gameId === option.some(data.gameId))
      .map((player) => ({
        ...player,
        roomId: option.none,
      }));

    return taskEither.right(constVoid());
  }

  detachPlayersToRoom (roomId: string): taskEither.TaskEither<TechnicalError, void> {
    this.entities = this.entities
      .filter(player => player.gameId === option.some(roomId))
      .map((player) => ({
        ...player,
        roomId: option.none,
      }));

    return taskEither.right(constVoid());
  }

  attachPlayerToGame (playerId: string, gameId: string): taskEither.TaskEither<PlayerNotFoundError, void> {
    const index = this.entities.findIndex(player => player.id === playerId);

    if (index >= 0) {
      this.entities[index].gameId = option.some(gameId as GameId);
    }

    return taskEither.right(constVoid());
  }

  getPlayerByNickname (nickname: string): taskEither.TaskEither<PlayerNotFoundError, Player> {
    return pipe(
      this.entities.find(player => player.nickname === nickname),
      option.fromNullable,
      taskEither.right,
      taskEither.chain(
        option.fold(
          () => taskEither.left(new PlayerNotFoundError(nickname)),
          player => taskEither.right(player),
        ),
      ),
    );
  }

  findOneByNickname (
    nickname: string,
  ): taskEither.TaskEither<PlayerNotFoundError, Option<Player>> {
    return pipe(
      this.entities,
      array.findFirst(entity => entity.nickname === nickname),
      taskEither.of,
    );
  }
}
