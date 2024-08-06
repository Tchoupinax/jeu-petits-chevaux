import { beforeEach, describe, expect, it } from "vitest";

import { LoggerForTest } from "../../../../test/utils/logger";
import { InMemoryPawnRepository } from "../../../infrastructure/repositories/pawn/in-memory/in-memory-pawn.repository";
import { toPromise } from "../../../utils/to-promise";
import { generateGameId } from "../../entities/game";
import { ListPawnsCoordinatesUseCase } from "./list-pawns-coordinates.use-case";

describe("ListPawnsCoordinatesUseCase", () => {
  let listPawnsCoordinatesUseCase: ListPawnsCoordinatesUseCase;

  beforeEach(() => {
    listPawnsCoordinatesUseCase = new ListPawnsCoordinatesUseCase(
      new InMemoryPawnRepository(),
      new LoggerForTest(),
    );
  });

  it("shou", async () => {
    const result = await toPromise(listPawnsCoordinatesUseCase.execute(generateGameId()));

    expect(result).toStrictEqual([]);
  });
});
