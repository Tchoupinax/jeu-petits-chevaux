import request from "supertest";
import { beforeEach, describe, it } from "vitest";

describe("when we use the health route", () => {
  let promise: request.Test;

  beforeEach(() => {
    promise = request(globalThis.app.getHttpServer()).get("/health");
  });

  it("should return a 200", () => {
    return promise.expect(200);
  });
});
