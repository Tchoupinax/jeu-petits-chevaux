import { describe, expect, test } from "vitest";

import { canPawnProgressOnHeaven, generatePawn, isOnLastPart } from "./pawn";

describe("Pawn", () => {
  describe("isOnLastPart", () => {
    test.each([
      [generatePawn({ color: "Blue", position: "1xx8" }), false],
      [generatePawn({ color: "Blue", position: "2xx6" }), true],
      [generatePawn({ color: "Blue", position: "7xx0" }), true],
      [generatePawn({ color: "Red", position: "9xx8" }), false],
      [generatePawn({ color: "Red", position: "10xx8" }), false],
    ])("should correctly if determine", (pawn, expected) => {
      expect(isOnLastPart(pawn)).toBe(expected);
    });
  });

  describe("canPawnProgressOnHeaven", () => {
    test.each([
      [generatePawn({ color: "Green", position: "13xx7" }), 1, false],
      [generatePawn({ color: "Red", position: "7xx10" }), 4, false],

      [generatePawn({ color: "Green", position: "13xx7" }), 2, true],
      [generatePawn({ color: "Green", position: "12xx7" }), 3, true],
      [generatePawn({ color: "Green", position: "11xx7" }), 4, true],
      [generatePawn({ color: "Green", position: "10xx7" }), 5, true],
      [generatePawn({ color: "Green", position: "9xx7" }), 6, true],
      [generatePawn({ color: "Green", position: "8xx7" }), 6, true],

      [generatePawn({ color: "Blue", position: "1xx7" }), 2, true],
      [generatePawn({ color: "Blue", position: "2xx7" }), 3, true],
      [generatePawn({ color: "Blue", position: "3xx7" }), 4, true],
      [generatePawn({ color: "Blue", position: "4xx7" }), 5, true],
      [generatePawn({ color: "Blue", position: "5xx7" }), 6, true],
      [generatePawn({ color: "Blue", position: "6xx7" }), 6, true],

      [generatePawn({ color: "Red", position: "7xx13" }), 2, true],
      [generatePawn({ color: "Red", position: "7xx12" }), 3, true],
      [generatePawn({ color: "Red", position: "7xx11" }), 4, true],
      [generatePawn({ color: "Red", position: "7xx10" }), 5, true],
      [generatePawn({ color: "Red", position: "7xx9" }), 6, true],
      [generatePawn({ color: "Red", position: "7xx8" }), 6, true],

      [generatePawn({ color: "Yellow", position: "7xx1" }), 2, true],
      [generatePawn({ color: "Yellow", position: "7xx2" }), 3, true],
      [generatePawn({ color: "Yellow", position: "7xx3" }), 4, true],
      [generatePawn({ color: "Yellow", position: "7xx4" }), 5, true],
      [generatePawn({ color: "Yellow", position: "7xx5" }), 6, true],
      [generatePawn({ color: "Yellow", position: "7xx6" }), 6, true],
    ])("should correctly if determine the pawn can progress on heaven", (pawn, diceScore, expected) => {
      expect(canPawnProgressOnHeaven(pawn, diceScore)).toBe(expected);
    });
  });
});
