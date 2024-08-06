import { option } from "fp-ts";
import { Option } from "fp-ts/Option";
import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryBrokerRepository } from "../../../infrastructure/kafka-provider/in-memory/in-memory-broker.provider";
import { InMemoryRoundRepository } from "../../../infrastructure/repositories/round/in-memory/in-memory-round.repository";
import { HttpWebhookRepository } from "../../../infrastructure/webhook-provider/http/http-webhook-provider.provider";
import { toPromise } from "../../../utils/to-promise";
import { generateGameId } from "../../entities/game";
import { generatePlayerId } from "../../entities/player";
import { generateRound, Round } from "../../entities/round";
import { NotYourTurnError } from "../../errors/not-your-turn.error";
import { EventService } from "../../services/event.service";
import { PlayerRoolsADicePort, PlayerRoolsADiceUseCase } from "./player-rools-a-dice.use-case.use-case";

describe("when a player rolls a dice", () => {
  let playerRoolsADiceUseCase: PlayerRoolsADiceUseCase;
  let roundRepository: InMemoryRoundRepository;
  let round: Round;
  const gameId = generateGameId();
  const playerId = generatePlayerId();

  beforeEach(() => {
    round = generateRound({ gameId, playerId, status: "WaitingDiceLaunch" });
    roundRepository = new InMemoryRoundRepository([round]);

    playerRoolsADiceUseCase = new PlayerRoolsADiceUseCase(
      roundRepository,
      new EventService(
        new HttpWebhookRepository(),
        new LoggerForTest(),
        new InMemoryBrokerRepository(),
      ),
    );
  });

  describe("when it's the turn of the player to play", () => {
    it("should return the whole round", async () => {
      const port : PlayerRoolsADicePort = {
        gameId,
        playerId,
        roundId: round.id,
      };
      const answer = await toPromise(playerRoolsADiceUseCase.execute(port));
      expect(answer).toMatchObject({
        pawnName: option.none,
        playerId: port.playerId,
        pawnEndingCase: option.none,
        pawnStartingCase: option.none,
        status: "WaitingMove",
      });
      expectToHaveADiceScore(answer.diceScore);
    });

    it("should define a dice score for the round", async () => {
      const port : PlayerRoolsADicePort = {
        gameId: generateGameId(),
        playerId,
        roundId: round.id,
      };
      await toPromise(playerRoolsADiceUseCase.execute(port));
      expect(roundRepository.entities).lengthOf(1);
      expectToHaveADiceScore(roundRepository.entities[0].diceScore);
    });

    it("should persist the status of the round", async () => {
      const port : PlayerRoolsADicePort = {
        gameId: generateGameId(),
        playerId,
        roundId: round.id,
      };
      await toPromise(playerRoolsADiceUseCase.execute(port));
      expect(roundRepository.entities).lengthOf(1);
      expect(roundRepository.entities[0].status).toBe("WaitingMove");
    });
  });

  describe("when another player try to play when it's not its turn", () => {
    it("should return an error", async () => {
      const port : PlayerRoolsADicePort = {
        gameId,
        playerId: generatePlayerId(),
        roundId: round.id,
      };

      expect(async () => await toPromise(playerRoolsADiceUseCase.execute(port))).to.rejects.toBeInstanceOf(NotYourTurnError);
    });
  });
});

function expectToHaveADiceScore (
  score: Option<number>,
): void {
  expect(option.isSome(score)).toBeTruthy();
  if (option.isSome(score)) {
    expect(score.value).toBeGreaterThanOrEqual(1);
    expect(score.value).toBeLessThanOrEqual(6);
  }
}
