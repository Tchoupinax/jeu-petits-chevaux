import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll } from "vitest";

import { AppModule } from "../../src/app.module";

declare global {
  // eslint-disable-next-line no-var
  var app: INestApplication;
}

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .compile();

  globalThis.app = moduleRef.createNestApplication();
  await globalThis.app.init();
});

afterAll(async () => {
  await globalThis.app.close();
});
