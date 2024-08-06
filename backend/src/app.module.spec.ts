import { Test } from "@nestjs/testing";
import { describe, it } from "vitest";

import { AppModule } from "./app.module";

describe("NestJS application", () => {
  it("should be able to instantiate application modules", async () => {
    await Test.createTestingModule({ imports: [AppModule] }).compile();
  });
});
