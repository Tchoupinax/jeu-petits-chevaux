import { array, option } from "fp-ts";
import { identity, pipe } from "fp-ts/lib/function";
import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryGameRepository } from "../../../infrastructure/repositories/game/in-memory/in-memory-game.repository";
import { InMemoryPlayerRepository } from "../../../infrastructure/repositories/player/in-memory/in-memory.player.repository";
import { toPromise } from "../../../utils/to-promise";
import { Game, generateGame, generateGameId } from "../../entities/game";
import { generatePlayer, generatePlayerId, Player } from "../../entities/player";
import { DeleteGameUseCase } from "./delete-game.use-case";

describe("DeleteGameUseCase", () => {
  let deleteGameUseCase: DeleteGameUseCase;
  let inMemoryPlayerRepository: InMemoryPlayerRepository;
  let inMemoryGameRepository: InMemoryGameRepository;
  const playerId = generatePlayerId();

  let game: Game;
  let player: Player;

  beforeEach(() => {
    game = generateGame({ name: "abc" });
    player = generatePlayer({ id: playerId, gameId: option.some(game.id) });

    inMemoryGameRepository = new InMemoryGameRepository([game]);
    inMemoryPlayerRepository = new InMemoryPlayerRepository([player]);

    deleteGameUseCase = new DeleteGameUseCase(
      inMemoryGameRepository,
      inMemoryPlayerRepository,
      new LoggerForTest(),
    );
  });

  it("should remove the game", async () => {
    await toPromise(deleteGameUseCase.execute(
      { name: "abc" },
      { playerId, gameId: generateGameId() },
    ));

    expect(inMemoryGameRepository.entities.length).toBe(1);
  });

  it("should not exist a player linked to this game", async () => {
    const gameId = generateGameId();
    await toPromise(deleteGameUseCase.execute(
      { name: "abc" },
      { playerId, gameId },
    ));

    const players = inMemoryPlayerRepository.entities;
    const gameIds = pipe(players, array.map(player => pipe(player.gameId, option.fold(() => "", identity))));

    expect(gameIds).toEqual([""]);
  });
});
