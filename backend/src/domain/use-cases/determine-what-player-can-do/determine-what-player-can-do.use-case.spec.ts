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
import { generateGame, generateGameId } from "../../entities/game";
import { generatePawn } from "../../entities/pawn";
import { generatePlayer, generatePlayerId } from "../../entities/player";
import { generateRound, generateRoundId, Round } from "../../entities/round";
import { EventService } from "../../services/event.service";
import { DetermineWhatPlayerCanDoPort, DetermineWhatPlayerCanDoUseCase } from "./determine-what-player-can-do.use-case";

let determineWhatPlayerCanDoUseCase: DetermineWhatPlayerCanDoUseCase;
const roundRepository = new InMemoryRoundRepository();
const pawnRepository = new InMemoryPawnRepository();
const gameRepository = new InMemoryGameRepository();
const playerRepository = new InMemoryPlayerRepository();

describe("DetermineWhatPlayerCanDoUseCase", () => {
  const player1Id = generatePlayerId();
  const player2Id = generatePlayerId();
  const gameId = generateGameId();
  const roundId = generateRoundId();

  const port: DetermineWhatPlayerCanDoPort = {
    gameId,
    playerId: player1Id,
    roundId,
  };

  beforeEach(() => {
    gameRepository.entities = [generateGame({
      id: gameId,
      playersColors: option.some([
        { color: "Blue", playerId: player1Id },
      ]),
    })];
    pawnRepository.entities = [];
    playerRepository.entities = [
      generatePlayer({ gameId: option.some(gameId), id: player1Id, nickname: "Player1" }),
      generatePlayer({ gameId: option.some(gameId), id: player2Id, nickname: "Player2" }),
    ];

    determineWhatPlayerCanDoUseCase = new DetermineWhatPlayerCanDoUseCase(
      new LoggerForTest(),
      roundRepository,
      pawnRepository,
      new EventService(
        new HttpWebhookRepository(),
        new LoggerForTest(),
        new InMemoryBrokerRepository(),
      ),
      playerRepository,
    );
  });

  describe("when the dice score is equal to 6", () => {
    beforeEach(() => {
      roundRepository.entities = [
        generateRound({ id: port.roundId, gameId, playerId: player1Id, diceScore: option.some(6) }),
      ];
      pawnRepository.entities = [
        generatePawn({ gameId, playerId: player1Id, position: "0xx0", color: "Yellow", name: "Yellow.1" }),
        generatePawn({ gameId, playerId: player1Id, position: "0xx1", color: "Yellow", name: "Yellow.2" }),
        generatePawn({ gameId, playerId: player1Id, position: "1xx0", color: "Yellow", name: "Yellow.3" }),
        generatePawn({ gameId, playerId: player1Id, position: "1xx1", color: "Yellow", name: "Yellow.4" }),
      ];
    });

    it("should give the player another turn to play", async () => {
      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.canPlayAnotherRound).toBeTruthy();
    });

    it("should tell that the player is allowed to put a pawn outside", async () => {
      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.canPutPawnOutside).toBeTruthy();
    });

    it("should determine that all pawn in the house are found in movable pawns", async () => {
      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.movablePawns).toEqual([
        { name: "Yellow.1", destination: "6xx0", id: pawnRepository.entities[0].id, source: "0xx0" },
        { name: "Yellow.2", destination: "6xx0", id: pawnRepository.entities[1].id, source: "0xx1" },
        { name: "Yellow.3", destination: "6xx0", id: pawnRepository.entities[2].id, source: "1xx0" },
        { name: "Yellow.4", destination: "6xx0", id: pawnRepository.entities[3].id, source: "1xx1" },
      ]);
    });

    it("should tell that the player is allowed to put a pawn outside when the case is blocked by an opposant pawn", async () => {
      pawnRepository.entities = [
        generatePawn({ gameId, playerId: player1Id, position: "0xx0", color: "Yellow", name: "Yellow.1" }),
        generatePawn({ gameId, playerId: player1Id, position: "0xx1", color: "Yellow", name: "Yellow.2" }),
        generatePawn({ gameId, playerId: player1Id, position: "1xx0", color: "Yellow", name: "Yellow.3" }),
        generatePawn({ gameId, playerId: player1Id, position: "1xx1", color: "Yellow", name: "Yellow.4" }),

        generatePawn({ gameId, playerId: player2Id, position: "6xx0", color: "Blue", name: "Blue.1" }),
      ];

      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.canPutPawnOutside).toBeTruthy();
    });

    it("should tell that the player is not allowed to put a pawn outside when a owned pawn blocks the case", async () => {
      pawnRepository.entities = [generatePawn({
        playerId: player1Id,
        gameId,
        position: "0xx8",
        color: "Blue",
      })];

      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.canPutPawnOutside).toBeFalsy();
    });

    describe("when there is only one pawn on the board", () => {
      describe("when the pawn is at the start of its run", () => {
        beforeEach(() => {
          pawnRepository.entities = [generatePawn({ playerId: player1Id, gameId, position: "0xx8", color: "Blue" })];
        });

        it("should allow to move the pawn", async () => {
          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).toEqual([
            { name: "Green.1", destination: "6xx8", id: pawnRepository.entities[0].id, source: "0xx8" },
          ]);
        });
      });

      describe("when the pawn is at the end of its run", () => {
        beforeEach(() => {
          pawnRepository.entities = [generatePawn({ playerId: player1Id, gameId, position: "0xx7", color: "Blue" })];
        });

        it("should forbid to move the pawn because dice score is too high", async () => {
          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).toEqual([]);
        });
      });

      describe("when the pawn is four cases size from the end of the run", () => {
        beforeEach(() => {
          pawnRepository.entities = [generatePawn({ playerId: player1Id, gameId, position: "3xx6", color: "Blue" })];
        });

        it("should forbid to move the pawn because dice score is too high", async () => {
          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).toEqual([]);
        });
      });

      describe("when the pawn  has the space to run", () => {
        beforeEach(() => {
          pawnRepository.entities = [generatePawn({ playerId: player1Id, gameId, position: "6xx2", color: "Blue" })];
        });

        it("should allow this pawn to move", async () => {
          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).toEqual([
            {
              id: pawnRepository.entities[0].id,
              name: "Green.1",
              source: "6xx2",
              destination: "4xx6",
            },
          ]);
        });
      });
    });
  });

  describe("when the dice score is lower than 6", () => {
    beforeEach(() => {
      roundRepository.entities = [
        generateRound({ id: port.roundId, gameId, playerId: player1Id, diceScore: option.some(2) }),
      ];
    });

    it("should tell that the player can't play another turn", async () => {
      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.canPlayAnotherRound).toBeFalsy();
    });

    it("should tell that the player is not allowed to put a pawn outside in any case", async () => {
      const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
      expect(result.canPutPawnOutside).toBeFalsy();
    });

    describe("when the pawn is free to move", () => {
      describe("when the pawn is at the start of its run", () => {
        beforeEach(() => {
          pawnRepository.entities = [generatePawn({ playerId: player1Id, gameId, position: "0xx8", color: "Blue" })];
        });

        it("should allow to move a pawn when the pawn is on the spawn case without any obstacle", async () => {
          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).toEqual([{
            source: "0xx8",
            destination: "2xx8",
            id: pawnRepository.entities[0].id,
            name: "Green.1",
          }]);
        });
      });
    });

    describe("when the pawn is blocked by an opposant", () => {
      beforeEach(() => {
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "0xx8", color: "Blue" }),
          generatePawn({ playerId: player2Id, gameId, position: "1xx8", color: "Yellow" }),
        ];
      });

      it("should disallow to move a pawn ", async () => {
        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(0);
      });
    });

    describe("when any pawn can move", () => {
      it("sould return an empty array for movable options", async () => {
        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(0);
      });

      it("should create the next round", async () => {
        await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(roundRepository.entities).lengthOf(2);
        expect(roundRepository.entities.at(1)).toMatchObject({
          gameId,
          playerId: player2Id,
        });
      });

      it("should closed the previous round", async () => {
        await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(roundRepository.entities).lengthOf(2);
        expect(roundRepository.entities.at(0)).toMatchObject({
          status: "Finished",
          playerId: player1Id,
        });
      });
    });
  });

  describe("in any dice score case", () => {
    beforeEach(() => {
      roundRepository.entities = [
        generateRound({ id: port.roundId, gameId, playerId: player1Id, diceScore: option.some(4) }),
      ];
    });

    describe("when the pawn is not blocked", () => {
      beforeEach(() => {
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "0xx8", color: "Blue" }),
          generatePawn({ playerId: player2Id, gameId, position: "6xx8", color: "Yellow" }),
        ];
      });

      it("should return the possible move", async () => {
        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(1);
      });
    });

    describe("when the pawn is blocked", () => {
      beforeEach(() => {
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "8xx14", color: "Blue" }),
          generatePawn({ playerId: player2Id, gameId, position: "8xx12", color: "Yellow" }),
        ];
      });

      it("should return an empty array for movable options", async () => {
        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(0);
      });
    });

    describe("when the pawn's destination is busied by an opposant pawn", () => {
      beforeEach(() => {
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "14xx6", color: "Blue", name: "Blue.2" }),
          generatePawn({ playerId: player2Id, gameId, position: "10xx6", color: "Yellow", name: "Yellow.2" }),
        ];
      });

      it("should return the possible killing move", async () => {
        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(1);
        expect(result.movablePawns).toEqual([{
          id: pawnRepository.entities[0].id,
          name: "Blue.2",
          source: "14xx6",
          destination: "10xx6",
        }]);
      });
    });

    describe("when the pawn's destination is busied by my own pawn", () => {
      beforeEach(() => {
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "14xx6", color: "Blue", name: "Blue.3" }),
          generatePawn({ playerId: player1Id, gameId, position: "10xx6", color: "Blue", name: "Blue.2" }),
        ];
      });

      it("should return movables options", async () => {
        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(1);
        expect(result.movablePawns).toEqual([{
          id: pawnRepository.entities[1].id,
          name: "Blue.2",
          source: "10xx6",
          destination: "8xx4",
        }]);
      });
    });
  });

  describe("when testing a scenario", () => {
    describe("when all pawn are outside", () => {
      let round: Round;
      beforeEach(() => {
        round = generateRound({ playerId: player2Id, gameId, diceScore: option.some(6) });
        roundRepository.entities = [round];
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "0xx14", name: "Blue.1", color: "Blue" }),
          generatePawn({ playerId: player1Id, gameId, position: "2xx8", name: "Blue.2", color: "Blue" }),
          generatePawn({ playerId: player1Id, gameId, position: "1xx13", name: "Blue.3", color: "Blue" }),
          generatePawn({ playerId: player1Id, gameId, position: "1xx8", name: "Blue.4", color: "Blue" }),

          generatePawn({ playerId: player2Id, gameId, position: "8xx10", name: "Red.1", color: "Red" }),
          generatePawn({ playerId: player2Id, gameId, position: "10xx6", name: "Red.2", color: "Red" }),
          generatePawn({ playerId: player2Id, gameId, position: "10xx8", name: "Red.3", color: "Red" }),
          generatePawn({ playerId: player2Id, gameId, position: "8xx9", name: "Red.4", color: "Red" }),
        ];
      });

      it("should tell that we are not able to put a pawn outside", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player2Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPutPawnOutside).toBeFalsy();
      });

      it("should tell that we can play again", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player2Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPlayAnotherRound).toBeTruthy();
      });

      it("should return the whole list of actions", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player2Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).toEqual([
          {
            destination: "8xx2",
            id: pawnRepository.entities[5].id,
            name: "Red.2",
            source: "10xx6",
          },
          {
            destination: "14xx6",
            id: pawnRepository.entities[6].id,
            name: "Red.3",
            source: "10xx8",
          },
        ]);
      });
    });

    describe("when my pawn is on my root spot", () => {
      let round: Round;
      beforeEach(() => {
        round = generateRound({ playerId: player1Id, gameId, diceScore: option.some(6) });
        roundRepository.entities = [round];
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "0xx8", name: "Blue.2", color: "Blue" }),
        ];
      });

      it("should tell that we are not able to put a pawn outside", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player1Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPutPawnOutside).toBeFalsy();
      });

      it("should tell that we can play again", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player1Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPlayAnotherRound).toBeTruthy();
      });

      it("should return the whole list of actions", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player1Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).toEqual([
          {
            id: pawnRepository.entities[0].id,
            name: "Blue.2",
            source: "0xx8",
            destination: "6xx8",
          },
        ]);
      });
    });

    describe("when my pawn is on my root spot", () => {
      let round: Round;
      beforeEach(() => {
        round = generateRound({ playerId: player1Id, gameId, diceScore: option.some(6) });
        roundRepository.entities = [round];
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "0xx8", name: "Yellow.1", color: "Yellow" }),
          generatePawn({ playerId: player1Id, gameId, position: "6xx0", name: "Yellow.2", color: "Yellow" }),
          generatePawn({ playerId: player1Id, gameId, position: "1xx0", name: "Yellow.3", color: "Yellow" }),
          generatePawn({ playerId: player1Id, gameId, position: "1xx1", name: "Yellow.4", color: "Yellow" }),
        ];
      });

      it("should tell that we are not able to put a pawn outside", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player1Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPutPawnOutside).toBeFalsy();
      });

      it("should tell that we can play again", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player1Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPlayAnotherRound).toBeTruthy();
      });

      it("should return the whole list of actions", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player1Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(2);
        expect(result.movablePawns).toEqual(expect.arrayContaining([
          {
            id: expect.any(String),
            name: "Yellow.2",
            source: "6xx0",
            destination: "6xx6",
          },
          {
            id: expect.any(String),
            name: "Yellow.1",
            source: "0xx8",
            destination: "6xx8",
          },
        ]));
      });
    });

    describe("when scenario 4", () => {
      let round: Round;
      beforeEach(() => {
        round = generateRound({ playerId: player2Id, gameId, diceScore: option.some(4) });
        roundRepository.entities = [round];
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "14xx6", name: "Green.4", color: "Green" }),
          generatePawn({ playerId: player1Id, gameId, position: "11xx6", name: "Green.3", color: "Green" }),
          generatePawn({ playerId: player2Id, gameId, position: "14xx7", name: "Blue.2", color: "Blue" }),
        ];
      });

      it("should tell that we are not able to put a pawn outside", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player2Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPutPawnOutside).toBeFalsy();
      });

      it("should tell that we can't play again", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player2Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.canPlayAnotherRound).toBeFalsy();
      });

      it("should return the whole list of actions", async () => {
        const port: DetermineWhatPlayerCanDoPort = {
          roundId: round.id,
          playerId: player2Id,
          gameId,
        };

        const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
        expect(result.movablePawns).lengthOf(0);
      });
    });

    describe("when the pawn is at the last case before heaven", () => {
      let round: Round;
      beforeEach(() => {
        round = generateRound({ playerId: player1Id, gameId, diceScore: option.none });
        roundRepository.entities = [round];
        pawnRepository.entities = [
          generatePawn({ playerId: player1Id, gameId, position: "0xx7", name: "Blue.1", color: "Blue" }),
        ];
      });

      describe("when the dice score is not 1", () => {
        beforeEach(() => {
          round.diceScore = option.some(4);
        });

        it("should not return movable pawn", async () => {
          const port: DetermineWhatPlayerCanDoPort = {
            roundId: round.id,
            playerId: player1Id,
            gameId,
          };

          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).lengthOf(0);
        });
      });

      describe("when the dice score is 1", async () => {
        beforeEach(() => {
          round.diceScore = option.some(1);
        });

        it("should return a movable pawn", async () => {
          const port: DetermineWhatPlayerCanDoPort = {
            roundId: round.id,
            playerId: player1Id,
            gameId,
          };

          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).lengthOf(1);
          expect(result.movablePawns.at(0)?.destination).toBe("1xx7");
        });
      });

      describe("when the dice score is 1 (another color)", async () => {
        beforeEach(() => {
          round.diceScore = option.some(1);
          pawnRepository.entities = [
            generatePawn({ playerId: player1Id, gameId, position: "7xx14", name: "Red.1", color: "Red" }),
          ];
        });

        it("should return a movable pawn", async () => {
          const port: DetermineWhatPlayerCanDoPort = {
            roundId: round.id,
            playerId: player1Id,
            gameId,
          };

          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).lengthOf(1);
          expect(result.movablePawns.at(0)?.destination).toBe("7xx13");
        });
      });

      describe("when the dice score is 1 (another color)", async () => {
        beforeEach(() => {
          round.diceScore = option.some(1);
          pawnRepository.entities = [
            generatePawn({ playerId: player1Id, gameId, position: "14xx7", name: "Green.1", color: "Green" }),
          ];
        });

        it("should return a movable pawn", async () => {
          const port: DetermineWhatPlayerCanDoPort = {
            roundId: round.id,
            playerId: player1Id,
            gameId,
          };

          const result = await toPromise(determineWhatPlayerCanDoUseCase.execute(port));
          expect(result.movablePawns).lengthOf(1);
          expect(result.movablePawns.at(0)?.destination).toBe("13xx7");
        });
      });
    });
  });
});
