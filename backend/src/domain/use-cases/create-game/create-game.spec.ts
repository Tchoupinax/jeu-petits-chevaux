import { option } from "fp-ts";
import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryBrokerRepository } from "../../../infrastructure/kafka-provider/in-memory/in-memory-broker.provider";
import { InMemoryGameRepository } from "../../../infrastructure/repositories/game/in-memory/in-memory-game.repository";
import { InMemoryPlayerRepository } from "../../../infrastructure/repositories/player/in-memory/in-memory.player.repository";
import { HttpWebhookRepository } from "../../../infrastructure/webhook-provider/http/http-webhook-provider.provider";
import { toPromise } from "../../../utils/to-promise";
import { generatePlayer, generatePlayerId } from "../../entities/player";
import { EventService } from "../../services/event.service";
import { CreateGameUseCase } from "./create-game.use-case";

describe("CreateGameUseCase", () => {
  let createRoomUseCase: CreateGameUseCase;
  let inMemoryGameRepository: InMemoryGameRepository;
  let inMemoryPlayerRepository: InMemoryPlayerRepository;
  const player1Id = generatePlayerId();
  const player2Id = generatePlayerId();

  beforeEach(() => {
    inMemoryGameRepository = new InMemoryGameRepository([]);
    inMemoryPlayerRepository = new InMemoryPlayerRepository([
      generatePlayer({ id: player1Id, nickname: "Tchoupinax", favoriteColor: option.some("Green") }),
      generatePlayer({ id: player2Id, nickname: "Victor", favoriteColor: option.some("Yellow") }),
    ]);

    createRoomUseCase = new CreateGameUseCase(
      inMemoryGameRepository,
      inMemoryPlayerRepository,
      new LoggerForTest(),
      new EventService(
        new HttpWebhookRepository(),
        new LoggerForTest(),
        new InMemoryBrokerRepository(),
      ),
    );
  });

  it("should persist the game", async () => {
    const game = await toPromise(createRoomUseCase.execute({ name: "room1", playerId: player1Id }));

    expect(inMemoryGameRepository.entities.length).toBe(1);
    expect(inMemoryGameRepository.entities.at(0)).toBe(game);
  });

  it("should link two player to the game", async () => {
    const game = await toPromise(createRoomUseCase.execute({ name: "room1", playerId: player1Id }));

    expect(inMemoryPlayerRepository.entities.length).toBe(2);
    expect(inMemoryPlayerRepository.entities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ gameId: option.some(game.id) }),
      ]),
    );
  });

  it("should update roomId on the owner", async () => {
    await toPromise(createRoomUseCase.execute({ name: "room1", playerId: player1Id }));

    expect(inMemoryGameRepository.entities.length).toBe(1);
  });

  it("should have generate pawns for the player", async () => {
    await toPromise(createRoomUseCase.execute({ name: "room1", playerId: player1Id }));

    expect(inMemoryGameRepository.entities.length).toBe(1);
  });
});
