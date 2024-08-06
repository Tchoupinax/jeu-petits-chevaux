import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryPlayerRepository } from "../../../infrastructure/repositories/player/in-memory/in-memory.player.repository";
import { toPromise } from "../../../utils/to-promise";
import { generatePlayer, generatePlayerId } from "../../entities/player";
import { CreatePlayerUseCase } from "./create-player.use-case";

describe("CreatePlayerUseCase", () => {
  let createPlayerUseCase: CreatePlayerUseCase;
  let inMemoryPlayerRepository: InMemoryPlayerRepository;

  beforeEach(() => {
    inMemoryPlayerRepository = new InMemoryPlayerRepository();

    createPlayerUseCase = new CreatePlayerUseCase(
      inMemoryPlayerRepository,
      new LoggerForTest(),
    );
  });

  it("should correctly persist the player and return it", async () => {
    const port = { nickname: "Tchoupinax" };

    const answer = await toPromise(createPlayerUseCase.execute(
      port,
    ));

    expect(answer).toMatchObject({
      id: expect.any(String),
      nickname: "Tchoupinax",
    });
    expect(inMemoryPlayerRepository.entities).lengthOf(1);
    expect(inMemoryPlayerRepository.entities[0]).toMatchObject({
      id: expect.any(String),
      nickname: "Tchoupinax",
    });
  });

  describe("when the player already exists", () => {
    const playerId = generatePlayerId();

    beforeEach(() => {
      inMemoryPlayerRepository.entities.push(generatePlayer({
        id: playerId,
        nickname: "Tchoupinax",
      }));
    });

    it("should return the id of the existing player", async () => {
      const port = { nickname: "Tchoupinax" };

      const answer = await toPromise(createPlayerUseCase.execute(
        port,
      ));

      expect(answer).toMatchObject({
        id: playerId,
        nickname: "Tchoupinax",
      });
    });
  });
});
