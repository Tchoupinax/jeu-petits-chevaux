import { describe, expect, it, test } from "vitest";

import { generatePawn } from "../entities/pawn";
import { arrayCutAndJoinFromIndex, arrayCutAndJoinFromTraycase, computeDestinationTrayCase, isPawnOnBoard, TrayCase } from "./tray-case";

describe("arrayCutAndJoinFromIndex", () => {
  it("should work with index 1", () => {
    const input: Array<TrayCase> = ["0xx6", "0xx7", "0xx8"];
    const expected: Array<TrayCase> = ["0xx7", "0xx8", "0xx6"];

    expect(arrayCutAndJoinFromIndex(input, 1)).toEqual(expected);
  });

  it("should throw an error because the given index is higher that the array size", () => {
    const input: Array<TrayCase> = ["0xx6", "0xx7", "0xx8"];

    expect(() => arrayCutAndJoinFromIndex(input, 29)).toThrowError("is too high");
  });
});

describe("arrayCutAndJoinFromTraycase", () => {
  it("should work with index 1", () => {
    const input: Array<TrayCase> = ["0xx6", "0xx7", "0xx8"];
    const expected: Array<TrayCase> = ["0xx7", "0xx8", "0xx6"];

    expect(arrayCutAndJoinFromTraycase(input, "0xx7")).toEqual(expected);
  });
});

describe("computeDestinationTrayCase", () => {
  it("should handle 14xx6 (+1)", () => {
    const pawn = generatePawn({ position: "14xx6" });

    expect(computeDestinationTrayCase(pawn, 1)).toBe("13xx6");
  });
});

describe("tray case value object", () => {
  test.each([
    // Blue
    [generatePawn({ position: "0xx7" }), true],
    [generatePawn({ position: "0xx8" }), true],
    [generatePawn({ position: "1xx8" }), true],
    [generatePawn({ position: "2xx8" }), true],
    [generatePawn({ position: "3xx8" }), true],
    [generatePawn({ position: "4xx8" }), true],
    [generatePawn({ position: "5xx8" }), true],
    [generatePawn({ position: "6xx8" }), true],
    [generatePawn({ position: "6xx9" }), true],
    [generatePawn({ position: "6xx10" }), true],
    [generatePawn({ position: "6xx11" }), true],
    [generatePawn({ position: "6xx12" }), true],
    [generatePawn({ position: "6xx13" }), true],
    [generatePawn({ position: "6xx14" }), true],

    // Green
    [generatePawn({ position: "14xx7" }), true],
    [generatePawn({ position: "14xx6" }), true],
    [generatePawn({ position: "13xx6" }), true],
    [generatePawn({ position: "12xx6" }), true],
    [generatePawn({ position: "11xx6" }), true],
    [generatePawn({ position: "10xx6" }), true],
    [generatePawn({ position: "9xx6" }), true],
    [generatePawn({ position: "8xx6" }), true],
    [generatePawn({ position: "8xx5" }), true],
    [generatePawn({ position: "8xx4" }), true],
    [generatePawn({ position: "8xx3" }), true],
    [generatePawn({ position: "8xx2" }), true],
    [generatePawn({ position: "8xx1" }), true],
    [generatePawn({ position: "8xx0" }), true],

    // Red
    [generatePawn({ position: "7xx14" }), true],
    [generatePawn({ position: "8xx14" }), true],
    [generatePawn({ position: "8xx13" }), true],
    [generatePawn({ position: "8xx12" }), true],
    [generatePawn({ position: "8xx11" }), true],
    [generatePawn({ position: "8xx10" }), true],
    [generatePawn({ position: "8xx9" }), true],
    [generatePawn({ position: "8xx8" }), true],
    [generatePawn({ position: "9xx8" }), true],
    [generatePawn({ position: "10xx8" }), true],
    [generatePawn({ position: "11xx8" }), true],
    [generatePawn({ position: "12xx8" }), true],
    [generatePawn({ position: "13xx8" }), true],
    [generatePawn({ position: "14xx8" }), true],

    [generatePawn({ position: "7xx0" }), true],
    [generatePawn({ position: "6xx0" }), true],
    [generatePawn({ position: "6xx1" }), true],
    [generatePawn({ position: "6xx2" }), true],
    [generatePawn({ position: "6xx3" }), true],
    [generatePawn({ position: "6xx4" }), true],
    [generatePawn({ position: "6xx5" }), true],
    [generatePawn({ position: "6xx6" }), true],
    [generatePawn({ position: "5xx6" }), true],
    [generatePawn({ position: "4xx6" }), true],
    [generatePawn({ position: "3xx6" }), true],
    [generatePawn({ position: "2xx6" }), true],
    [generatePawn({ position: "1xx6" }), true],
    [generatePawn({ position: "0xx6" }), true],

  ])("should tell that case $position is on the board", (pawn, boolean) => {
    expect(isPawnOnBoard(pawn)).toBe(boolean);
  });

  test.each([
    [generatePawn({ position: "0xx0" }), false],
    [generatePawn({ position: "0xx1" }), false],
    [generatePawn({ position: "0xx13" }), false],
    [generatePawn({ position: "0xx14" }), false],
    [generatePawn({ position: "13xx13" }), false],
    [generatePawn({ position: "13xx14" }), false],
    [generatePawn({ position: "14xx13" }), false],
    [generatePawn({ position: "14xx14" }), false],
    [generatePawn({ position: "1xx0" }), false],
    [generatePawn({ position: "1xx1" }), false],
    [generatePawn({ position: "1xx13" }), false],
    [generatePawn({ position: "1xx14" }), false],
    [generatePawn({ position: "1xx7" }), true],
    [generatePawn({ position: "2xx7" }), true],
    [generatePawn({ position: "3xx7" }), true],
    [generatePawn({ position: "4xx7" }), true],
    [generatePawn({ position: "5xx7" }), true],
    [generatePawn({ position: "6xx7" }), true],
    [generatePawn({ position: "7xx1" }), true],
    [generatePawn({ position: "7xx10" }), true],
    [generatePawn({ position: "7xx11" }), true],
    [generatePawn({ position: "7xx12" }), true],
    [generatePawn({ position: "7xx13" }), true],
    [generatePawn({ position: "7xx2" }), true],
    [generatePawn({ position: "7xx3" }), true],
    [generatePawn({ position: "7xx4" }), true],
    [generatePawn({ position: "7xx5" }), true],
    [generatePawn({ position: "7xx6" }), true],
    [generatePawn({ position: "7xx8" }), true],
    [generatePawn({ position: "7xx9" }), true],
    [generatePawn({ position: "8xx7" }), true],
    [generatePawn({ position: "9xx7" }), true],
  ])("should tell that other case $position is not on board", (pawn, boolean) => {
    expect(isPawnOnBoard(pawn)).toBe(boolean);
  });
});
