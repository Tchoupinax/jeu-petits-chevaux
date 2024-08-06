import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";

import { generateGameId } from "../../../../src/domain/entities/game";
import { generatePlayerId } from "../../../../src/domain/entities/player";
import { generateRoundId } from "../../../../src/domain/entities/round";
import { SequelizeRoundModel } from "../../../../src/infrastructure/repositories/round/sequelize/sequelize-round.model";

describe.skip("when we want to launch a dice", () => {
  let playerId: string;
  let gameId: string;
  let roundId: string;
  let promise: request.Test;

  beforeEach(() => {
    playerId = generatePlayerId();
    gameId = generateGameId();
    roundId = generateRoundId();
    promise = request(globalThis.app.getHttpServer())
      .post("/rounds/launch-dice")
      .send({ playerId, gameId, roundId });
  });

  it("should return a 201", () => {
    return promise.expect(201);
  });

  it("should correctly persist the round in database", async () => {
    await promise;
    const round = await SequelizeRoundModel.findOne({
      where: {
        playerId,
        gameId,
      },
      raw: true,
    });
    expect(round).toMatchObject({
      playerId,
      gameId,
      diceScore: expect.any(Number),
    });
  });
});
