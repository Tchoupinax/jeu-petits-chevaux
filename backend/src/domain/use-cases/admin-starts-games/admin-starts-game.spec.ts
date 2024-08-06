import { option } from "fp-ts";
import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryBrokerRepository } from "../../../infrastructure/kafka-provider/in-memory/in-memory-broker.provider";
import { InMemoryGameRepository } from "../../../infrastructure/repositories/game/in-memory/in-memory-game.repository";
import { InMemoryPawnRepository } from "../../../infrastructure/repositories/pawn/in-memory/in-memory-pawn.repository";
import { InMemoryPlayerRepository } from "../../../infrastructure/repositories/player/in-memory/in-memory.player.repository";
import { InMemoryRoundRepository } from "../../../infrastructure/repositories/round/in-memory/in-memory-round.repository";
import { HttpWebhookRepository } from "../../../infrastructure/webhook-provider/http/http-webhook-provider.provider";
import { toPromise } from "../../../utils/to-promise";
import { Game, generateGame, generateGameId } from "../../entities/game";
import { generatePlayer, generatePlayerId } from "../../entities/player";
import { GameAlreadyStartedError } from "../../errors/game-already-exists.error";
import { EventService } from "../../services/event.service";
import { GameService } from "../../services/game.service";
import { AdminStartsGameUseCase } from "./admin-starts-game.use-case";

describe("when an admin starts a game", () => {
  let adminStartsGameUseCase: AdminStartsGameUseCase;
  let inMemoryGameRepository: InMemoryGameRepository;
  let inMemoryPlayerRepository: InMemoryPlayerRepository;
  let roundRepository: InMemoryRoundRepository;
  let pawnRepository: InMemoryPawnRepository;

  let game: Game;

  beforeEach(() => {
    game = generateGame({});
    inMemoryGameRepository = new InMemoryGameRepository([game]);
    inMemoryPlayerRepository = new InMemoryPlayerRepository([
      generatePlayer({ nickname: "Tchoupinax", gameId: option.some(game.id), favoriteColor: option.some("Green") }),
      generatePlayer({ nickname: "Player1", gameId: option.some(generateGameId()), favoriteColor: option.some("Blue") }),
      generatePlayer({ nickname: "Player2", gameId: option.some(game.id), favoriteColor: option.some("Red") }),
    ]);
    roundRepository = new InMemoryRoundRepository();
    pawnRepository = new InMemoryPawnRepository();

    adminStartsGameUseCase = new AdminStartsGameUseCase(
      inMemoryGameRepository,
      new LoggerForTest(),
      new EventService(
        new HttpWebhookRepository(),
        new LoggerForTest(),
        new InMemoryBrokerRepository(),
      ),
      inMemoryPlayerRepository,
      roundRepository,
      pawnRepository,
      new GameService(roundRepository, new LoggerForTest()),
    );
  });

  describe("when the game has already been started", () => {
    beforeEach(() => {
      inMemoryGameRepository.entities[0].startedAt = option.some(new Date());
    });

    it("should return an error", async () => {
      const useCase = toPromise(adminStartsGameUseCase.execute({
        gameId: game.id,
        playerId: generatePlayerId(),
      }));

      expect(useCase).to.rejects.toBeInstanceOf(GameAlreadyStartedError);
    });
  });

  describe("when the is not started", () => {
    it("should update the startedAt date", async () => {
      await toPromise(adminStartsGameUseCase.execute({
        gameId: game.id,
        playerId: generatePlayerId(),
      }));

      expect(option.isSome(inMemoryGameRepository.entities[0].startedAt)).toBeTruthy();
    });

    it("should have defined which players plays first by creating a round", async () => {
      await toPromise(adminStartsGameUseCase.execute({
        gameId: game.id,
        playerId: generatePlayerId(),
      }));

      expect(roundRepository.entities).lengthOf(1);
      expect(roundRepository.entities[0]).toMatchObject({
        createdAt: expect.any(Date),
        diceLaunchedAt: option.none,
        diceScore: option.none,
        gameId: game.id,
        pawnEndingCase: option.none,
        pawnName: option.none,
        pawnStartingCase: option.none,
        playerId: inMemoryPlayerRepository.entities[0].id,
        status: "WaitingDiceLaunch",
        updatedAt: expect.any(Date),
      });
    });

    it("should have created pawns for each registered players", async () => {
      await toPromise(adminStartsGameUseCase.execute({
        gameId: game.id,
        playerId: inMemoryPlayerRepository.entities[0].id,
      }));

      expect(pawnRepository.entities).lengthOf(8);
    });
  });
});
