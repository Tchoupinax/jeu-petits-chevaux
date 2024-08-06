import { randomUUID } from "crypto";
import { option } from "fp-ts";
import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryBrokerRepository } from "../../../infrastructure/kafka-provider/in-memory/in-memory-broker.provider";
import { InMemoryGameRepository } from "../../../infrastructure/repositories/game/in-memory/in-memory-game.repository";
import { HttpWebhookRepository } from "../../../infrastructure/webhook-provider/http/http-webhook-provider.provider";
import { fromOption } from "../../../utils/from-option";
import { toPromise } from "../../../utils/to-promise";
import { GameId, generateGame, generateGameId } from "../../entities/game";
import { generatePlayerId, PlayerId } from "../../entities/player";
import { PlayerColorAlreadyTakenError } from "../../errors/player-color-already-taken.error";
import { EventService } from "../../services/event.service";
import { PlayerSelectsColorUseCase } from "./player-selects-color.use-case";

describe("PlayerSelectColorUseCase", () => {
  let inMemoryGameRepository: InMemoryGameRepository;
  let playerSelectsColorUseCase: PlayerSelectsColorUseCase;
  let gameId: GameId;
  let playerId: PlayerId;

  beforeEach(() => {
    gameId = generateGameId();
    playerId = generatePlayerId();

    inMemoryGameRepository = new InMemoryGameRepository([
      generateGame({ id: gameId }),
    ]);

    playerSelectsColorUseCase = new PlayerSelectsColorUseCase(
      inMemoryGameRepository,
      new EventService(
        new HttpWebhookRepository(),
        new LoggerForTest(),
        new InMemoryBrokerRepository(),
      ),
      new LoggerForTest(),
    );
  });

  it("should correctly update the color of the player", async () => {
    const port = {
      playerId,
      gameId,
      color: "Yellow",
    };

    await toPromise(playerSelectsColorUseCase.execute(port));

    expect(inMemoryGameRepository.entities.length).toBe(1);
    expect(Array.isArray(fromOption(inMemoryGameRepository.entities[0].playersColors))).toBeTruthy();
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors).length).toBe(1);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors)[0]).toEqual({ color: "Yellow", playerId });
  });

  it("should not update the color of the player if the color is already taken", async () => {
    const oldPlayerId = randomUUID();
    inMemoryGameRepository.entities[0].playersColors = option.some([
      { color: "Yellow", playerId: oldPlayerId },
    ]);

    const port = {
      playerId,
      gameId,
      color: "Yellow",
    };

    await expect(toPromise(playerSelectsColorUseCase.execute(port))).rejects.toBeInstanceOf(PlayerColorAlreadyTakenError);
    expect(inMemoryGameRepository.entities.length).toBe(1);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors).length).toBe(1);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors)[0]).toMatchObject({ color: "Yellow", playerId: oldPlayerId });
  });

  it("should do nothing if the color is already taken by the player himself", async () => {
    inMemoryGameRepository.entities[0].playersColors = option.some([
      { color: "Yellow", playerId },
    ]);

    const port = {
      playerId,
      gameId,
      color: "Yellow",
    };

    await toPromise(playerSelectsColorUseCase.execute(port));
    expect(inMemoryGameRepository.entities.length).toBe(1);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors).length).toBe(1);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors)[0]).toMatchObject({ color: "Yellow", playerId });
  });

  it("should update the color of the player if the player changed its color", async () => {
    inMemoryGameRepository.entities[0].playersColors = option.some([
      { color: "Yellow", playerId },
      { color: "Blue", playerId: randomUUID() },
    ]);

    const port = {
      playerId,
      gameId,
      color: "Red",
    };

    await toPromise(playerSelectsColorUseCase.execute(port));

    expect(inMemoryGameRepository.entities.length).toBe(1);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors).length).toBe(2);
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors)[0]).toEqual({ color: "Red", playerId });
    expect(fromOption(inMemoryGameRepository.entities[0].playersColors)[1]).toMatchObject({ color: "Blue" });
  });
});
