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
import { GameId, generateGameId } from "../../entities/game";
import { generatePawn, Pawn } from "../../entities/pawn";
import { generatePlayer, Player } from "../../entities/player";
import { generateRound, Round } from "../../entities/round";
import { NotYourTurnError } from "../../errors/not-your-turn.error";
import { EventService } from "../../services/event.service";
import { GameService } from "../../services/game.service";
import { TrayCase } from "../../value-objects/tray-case";
import { PlayerCommitsMovePort, PlayerCommitsMoveUseCase } from "./player-commits-move.use-case";

describe("PlayerCommitsMove", () => {
  let playerCommitsMoveUseCase: PlayerCommitsMoveUseCase;
  let roundRepository: InMemoryRoundRepository;
  let pawnRepository: InMemoryPawnRepository;
  let playerRepository: InMemoryPlayerRepository;
  let round: Round;
  let gameId: GameId;
  let pawn: Pawn;
  let player1: Player;
  let player2: Player;

  beforeEach(() => {
    gameId = generateGameId();
    player1 = generatePlayer({ nickname: "Player1", gameId: option.some(gameId) });
    player2 = generatePlayer({ nickname: "Player2", gameId: option.some(gameId) });

    round = generateRound({ gameId, diceScore: option.some(4), diceLaunchedAt: option.some(new Date()), playerId: player1.id });
    roundRepository = new InMemoryRoundRepository([round]);
    pawn = generatePawn({ gameId, playerId: player1.id, name: "Yellow.3" });
    pawnRepository = new InMemoryPawnRepository([pawn]);
    playerRepository = new InMemoryPlayerRepository([player1, player2]);

    playerCommitsMoveUseCase = new PlayerCommitsMoveUseCase(
      roundRepository,
      pawnRepository,
      new LoggerForTest(),
      new EventService(
        new HttpWebhookRepository(),
        new LoggerForTest(),
        new InMemoryBrokerRepository(),
      ),
      new GameService(roundRepository, new LoggerForTest()),
      playerRepository,
      new InMemoryGameRepository(),
    );
  });

  describe("when player two tries to play while it's player one's turn", () => {
    it("should forbid the move", async () => {
      const port: PlayerCommitsMovePort = {
        gameId,
        playerId: player2.id,
        roundId: round.id,
        pawnName: "Yellow.3",
        pawnEndingCase: "0xx6" as TrayCase,
        pawnStartingCase: "0xx7" as TrayCase,
      };

      expect(toPromise(playerCommitsMoveUseCase.execute(port))).rejects.toBeInstanceOf(NotYourTurnError);
    });
  });

  describe("when player one tries to play while it's its turn", () => {
    it("should valid the move", async () => {
      const port: PlayerCommitsMovePort = {
        gameId,
        playerId: player1.id,
        roundId: round.id,
        pawnName: "Yellow.3",
        pawnEndingCase: "0xx6" as TrayCase,
        pawnStartingCase: "0xx7" as TrayCase,
      };

      const answer = await toPromise(playerCommitsMoveUseCase.execute(port));

      expect(answer).toMatchObject({
        gameId,
        pawnName: option.some("Yellow.3"),
        playerId: player1.id,
        status: "Finished",
      });
    });
  });

  describe("when player1 commit its turn", () => {
    describe("when player1 made a dice score equals to 4", () => {
      it("should create the next round for player2", async () => {
        const port: PlayerCommitsMovePort = {
          gameId,
          playerId: player1.id,
          roundId: round.id,
          pawnName: "Yellow.3",
          pawnEndingCase: "0xx6" as TrayCase,
          pawnStartingCase: "0xx7" as TrayCase,
        };

        await toPromise(playerCommitsMoveUseCase.execute(port));
        expect(roundRepository.entities).lengthOf(2);
        expect(roundRepository.entities.at(0)).toMatchObject({
          playerId: player1.id,
        });
        expect(roundRepository.entities.at(1)).toMatchObject({
          playerId: player2.id,
        });
      });
    });

    describe("when player1 made a dice score equals to 6", () => {
      beforeEach(() => {
        roundRepository.entities[0].diceScore = option.some(6);
      });

      it("should create the next round for player1 because he plays again", async () => {
        const port: PlayerCommitsMovePort = {
          gameId,
          playerId: player1.id,
          roundId: round.id,
          pawnName: "Yellow.3",
          pawnEndingCase: "0xx6" as TrayCase,
          pawnStartingCase: "0xx7" as TrayCase,
        };

        await toPromise(playerCommitsMoveUseCase.execute(port));
        expect(roundRepository.entities).lengthOf(2);
        expect(roundRepository.entities.at(0)).toMatchObject({
          playerId: player1.id,
        });
        expect(roundRepository.entities.at(1)).toMatchObject({
          playerId: player1.id,
        });
      });
    });

    describe("when player1 kills a pawn from player2 (case1)", () => {
      beforeEach(() => {
        roundRepository.entities[0].diceScore = option.some(1);
        pawnRepository.entities = [
          generatePawn({ gameId, playerId: player1.id, color: "Blue", name: "Blue.1", position: "0xx8" }),
          generatePawn({ gameId, playerId: player2.id, color: "Yellow", name: "Yellow.1", position: "1xx8" }),
        ];
      });

      it("should return the killed pawn to the house", async () => {
        const port: PlayerCommitsMovePort = {
          gameId,
          playerId: player1.id,
          roundId: round.id,
          pawnName: "Blue.1",
          pawnEndingCase: "1xx8",
          pawnStartingCase: "0xx8",
        };

        await toPromise(playerCommitsMoveUseCase.execute(port));

        expect(pawnRepository.entities).lengthOf(2);
        expect(pawnRepository.entities.at(0)).toMatchObject({
          gameId,
          playerId: player1.id,
          name: "Blue.1",
          position: "1xx8",
        });
        expect(pawnRepository.entities.at(1)).toMatchObject({
          gameId,
          playerId: player2.id,
          name: "Yellow.1",
          position: "0xx0",
        });
      });
    });

    describe("when player1 kills a pawn from player2 (case2)", () => {
      beforeEach(() => {
        roundRepository.entities[0].diceScore = option.some(4);
        pawnRepository.entities = [
          generatePawn({ gameId, playerId: player1.id, color: "Red", name: "Red.1", position: "9xx8" }),
          generatePawn({ gameId, playerId: player2.id, color: "Green", name: "Green.3", position: "13xx8" }),
        ];
      });

      it("should return the killed pawn to the house", async () => {
        const port: PlayerCommitsMovePort = {
          gameId,
          playerId: player1.id,
          roundId: round.id,
          pawnName: "Red.1",
          pawnEndingCase: "13xx8",
          pawnStartingCase: "9xx8",
        };

        await toPromise(playerCommitsMoveUseCase.execute(port));

        expect(pawnRepository.entities).lengthOf(2);
        expect(pawnRepository.entities.at(0)).toMatchObject({
          gameId,
          playerId: player1.id,
          name: "Red.1",
          position: "13xx8",
        });
        expect(pawnRepository.entities.at(1)).toMatchObject({
          gameId,
          playerId: player2.id,
          name: "Green.3",
          position: "13xx1",
        });
      });
    });
  });
});
