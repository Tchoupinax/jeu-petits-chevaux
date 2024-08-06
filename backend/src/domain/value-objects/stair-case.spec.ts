import { describe, expect, test } from "vitest";

import { generatePawn } from "../entities/pawn";
import { isPawnOnStairCase } from "./stair-case";

describe("stair case value object", () => {
  describe("isPawnOnStairCase", () => {
    test.each([
      // Red
      [generatePawn({ position: "7xx1" }), true],
      [generatePawn({ position: "7xx2" }), true],
      [generatePawn({ position: "7xx3" }), true],
      [generatePawn({ position: "7xx4" }), true],
      [generatePawn({ position: "7xx5" }), true],
      [generatePawn({ position: "7xx6" }), true],

      // Blue
      [generatePawn({ position: "1xx7" }), true],
      [generatePawn({ position: "2xx7" }), true],
      [generatePawn({ position: "3xx7" }), true],
      [generatePawn({ position: "4xx7" }), true],
      [generatePawn({ position: "5xx7" }), true],
      [generatePawn({ position: "6xx7" }), true],

      // Yellow
      [generatePawn({ position: "7xx8" }), true],
      [generatePawn({ position: "7xx9" }), true],
      [generatePawn({ position: "7xx10" }), true],
      [generatePawn({ position: "7xx11" }), true],
      [generatePawn({ position: "7xx12" }), true],
      [generatePawn({ position: "7xx13" }), true],

      // Green
      [generatePawn({ position: "8xx7" }), true],
      [generatePawn({ position: "9xx7" }), true],
      [generatePawn({ position: "10xx7" }), true],
      [generatePawn({ position: "11xx7" }), true],
      [generatePawn({ position: "12xx7" }), true],
      [generatePawn({ position: "13xx7" }), true],
    ])("should tell that case $position is a stair case", (pawn, boolean) => {
      expect(isPawnOnStairCase(pawn)).toBe(boolean);
    });

    test.each([
      [generatePawn({ position: "8xx1" }), false],
      [generatePawn({ position: "8xx1" }), false],
      [generatePawn({ position: "8xx8" }), false],
    ])("should tell that other case $position is not a stair case", (pawn, boolean) => {
      expect(isPawnOnStairCase(pawn)).toBe(boolean);
    });
  });
});
