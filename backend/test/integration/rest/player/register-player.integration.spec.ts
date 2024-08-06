import { randomUUID } from "crypto";
import request from "supertest";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { SequelizePlayerModel } from "../../../../src/infrastructure/repositories/player/sequelize/sequelize-player.model";

describe("when we want to register a player", () => {
  let nickname: string;
  let promise: request.Test;

  describe("when the nickname is not known", () => {
    beforeEach(() => {
      nickname = randomUUID();
      promise = request(globalThis.app.getHttpServer())
        .post("/players/register")
        .send({ nickname });
    });
    afterEach(async () => {
      await SequelizePlayerModel.destroy({ where: { nickname }, force: true });
    });
    it("should return a 201", () => {
      return promise.expect(201);
    });
    it("should return correctly data", async () => {
      const { body } = await promise;
      expect(body).toEqual({
        id: expect.any(String),
        nickname,
      });
    });
    it("should correctly persist the player", async () => {
      await promise;
      const player = await SequelizePlayerModel.findOne({
        where: { nickname },
        raw: true,
      });
      expect(player).toMatchObject({
        nickname,
        gameId: null,
      });
    });
  });

  describe("when the nickname is already known", () => {
    beforeAll(async () => {
      nickname = "Tchoupinax";
      await SequelizePlayerModel.build({ id: randomUUID(), nickname }).save();
      promise = request(globalThis.app.getHttpServer())
        .post("/players/register")
        .send({ nickname });
    });
    afterAll(async () => {
      await SequelizePlayerModel.destroy({ where: { nickname }, force: true });
    });
    it("should not create another player", async () => {
      const players = await SequelizePlayerModel.findAll({ where: { nickname } });
      expect(players).lengthOf(1);
    });
    it("should return a 201", () => {
      return promise.expect(201);
    });
    it("should return correctly data", async () => {
      const { body } = await promise;
      expect(body).toEqual({
        id: expect.any(String),
        nickname,
      });
    });
  });
});
