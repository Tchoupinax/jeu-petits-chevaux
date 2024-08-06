import { isMatching, match, P } from "ts-pattern";

import { Pawn, PawnCase } from "../entities/pawn";
import { Color } from "./color";

export const CAMP_SIZE = 14 as const;
export const COLOR_ORDER: Array<Color> = ["Blue", "Red", "Green", "Yellow"];

export type TrayCase = "0xx6" | "0xx7" | "0xx8" | "1xx6" | "1xx8" | "2xx6" |
  "2xx8" | "3xx6" | "3xx8" | "4xx6" | "4xx8" | "5xx6" | "5xx8" | "6xx0" |
  "6xx1" | "6xx2" | "6xx3" | "6xx4" | "6xx5" | "6xx6" | "6xx8" | "6xx9" |
  "6xx10" | "6xx11" | "6xx12" | "6xx13" | "6xx14" | "7xx0" | "7xx14" | "8xx0" |
  "8xx1" | "8xx2" | "8xx3" | "8xx4" | "8xx5" | "8xx6" | "8xx8" | "8xx9" | "8xx10" |
  "8xx11" | "8xx12" | "8xx13" | "8xx14" | "9xx6" | "9xx8" | "10xx6" | "10xx8" |
  "11xx6" | "11xx8" | "12xx6" | "12xx8" | "13xx6" | "13xx8" | "14xx6" | "14xx7" |
  "14xx8";

export type BlueRoad = ["0xx7", "0xx8", "1xx8", "2xx8", "3xx8", "4xx8", "5xx8", "6xx8", "6xx9", "6xx10", "6xx11", "6xx12", "6xx13", "6xx14"];
export type GreenRoad = ["14xx7", "14xx6", "13xx6", "12xx6", "11xx6", "10xx6", "9xx6", "8xx6", "8xx5", "8xx4", "8xx3", "8xx2", "8xx1", "8xx0"];
export type RedRoad = ["7xx14", "8xx14", "8xx13", "8xx12", "8xx11", "8xx10", "8xx9", "8xx8", "9xx8", "10xx8", "11xx8", "12xx8", "13xx8", "14xx8"];
export type YellowRoad = ["7xx0", "6xx0", "6xx1", "6xx2", "6xx3", "6xx4", "6xx5", "6xx6", "5xx6", "4xx6", "3xx6", "2xx6", "1xx6", "0xx6"];
export const road: Record<Color, BlueRoad | GreenRoad | RedRoad | YellowRoad> = {
  Blue: ["0xx7", "0xx8", "1xx8", "2xx8", "3xx8", "4xx8", "5xx8", "6xx8", "6xx9", "6xx10", "6xx11", "6xx12", "6xx13", "6xx14"],
  Green: ["14xx7", "14xx6", "13xx6", "12xx6", "11xx6", "10xx6", "9xx6", "8xx6", "8xx5", "8xx4", "8xx3", "8xx2", "8xx1", "8xx0"],
  Red: ["7xx14", "8xx14", "8xx13", "8xx12", "8xx11", "8xx10", "8xx9", "8xx8", "9xx8", "10xx8", "11xx8", "12xx8", "13xx8", "14xx8"],
  Yellow: ["7xx0", "6xx0", "6xx1", "6xx2", "6xx3", "6xx4", "6xx5", "6xx6", "5xx6", "4xx6", "3xx6", "2xx6", "1xx6", "0xx6"],
};
export const heaven: Record<Color, Array<string>> = {
  Blue: ["1xx7", "2xx7", "3xx7", "4xx7", "5xx7", "6xx7"],
  Red: ["7xx13", "7xx12", "7xx11", "7xx10", "7xx9", "7xx8"],
  Green: ["13xx7", "12xx7", "11xx7", "10xx7", "9xx7", "8xx7"],
  Yellow: ["7xx1", "7xx2", "7xx3", "7xx4", "7xx5", "7xx6"],
};

export function arrayCutAndJoinFromIndex (
  array: Array<TrayCase>,
  cutIndex: number,
): Array<TrayCase> {
  if (cutIndex > array.length - 1) {
    throw new Error(`The given index is too high, please provide an index between 0 and ${array.length - 1}`);
  }

  return [
    ...array.slice(cutIndex),
    ...array.slice(0, cutIndex),
  ];
}

export function arrayCutAndJoinFromTraycase (
  array: Array<TrayCase>,
  trayCase: TrayCase,
): Array<TrayCase> {
  const index = array.findIndex(el => el === trayCase);

  if (index === -1) {
    throw new Error(`The case ${trayCase} does not exist in the array`);
  }

  return [
    ...array.slice(index),
    ...array.slice(0, index),
  ];
}

export function computeDestinationTrayCase (
  pawn: Pawn,
  diceScore: number,
): PawnCase {
  const spots = [
    ...road.Blue,
    ...road.Red,
    ...road.Green,
    ...road.Yellow,
  ];

  // when the pawn is on the last case and want to go to the heaven
  if (
    diceScore === 1 &&
    (
      (pawn.position === "0xx7" && pawn.color === "Blue") ||
      (pawn.position === "7xx14" && pawn.color === "Red") ||
      (pawn.position === "14xx7" && pawn.color === "Green") ||
      (pawn.position === "7xx0" && pawn.color === "Yellow")
    )
  ) {
    return match(pawn.color)
      .with("Blue", (): PawnCase => "1xx7")
      .with("Green", (): PawnCase => "13xx7")
      .with("Red", (): PawnCase => "7xx13")
      .with("Yellow", (): PawnCase => "7xx0")
      .exhaustive();
  }

  if (
    diceScore === 2 &&
    (
      (pawn.position === "1xx7" && pawn.color === "Blue") ||
      (pawn.position === "7xx13" && pawn.color === "Red") ||
      (pawn.position === "13xx7" && pawn.color === "Green") ||
      (pawn.position === "7xx1" && pawn.color === "Yellow")
    )
  ) {
    return match(pawn.color)
      .with("Blue", (): PawnCase => "2xx7")
      .with("Green", (): PawnCase => "12xx7")
      .with("Red", (): PawnCase => "7xx12")
      .with("Yellow", (): PawnCase => "7xx2")
      .exhaustive();
  }

  if (
    diceScore === 3 &&
    (
      (pawn.position === "2xx7" && pawn.color === "Blue") ||
      (pawn.position === "7xx12" && pawn.color === "Red") ||
      (pawn.position === "12xx7" && pawn.color === "Green") ||
      (pawn.position === "7xx2" && pawn.color === "Yellow")
    )
  ) {
    return match(pawn.color)
      .with("Blue", (): PawnCase => "3xx7")
      .with("Green", (): PawnCase => "11xx7")
      .with("Red", (): PawnCase => "7xx11")
      .with("Yellow", (): PawnCase => "7xx3")
      .exhaustive();
  }

  if (
    diceScore === 4 &&
    (
      (pawn.position === "3xx7" && pawn.color === "Blue") ||
      (pawn.position === "7xx11" && pawn.color === "Red") ||
      (pawn.position === "11xx7" && pawn.color === "Green") ||
      (pawn.position === "7xx3" && pawn.color === "Yellow")
    )
  ) {
    return match(pawn.color)
      .with("Blue", (): PawnCase => "4xx7")
      .with("Green", (): PawnCase => "10xx7")
      .with("Red", (): PawnCase => "7xx10")
      .with("Yellow", (): PawnCase => "7xx4")
      .exhaustive();
  }

  if (
    diceScore === 5 &&
    (
      (pawn.position === "4xx7" && pawn.color === "Blue") ||
      (pawn.position === "7xx10" && pawn.color === "Red") ||
      (pawn.position === "10xx7" && pawn.color === "Green") ||
      (pawn.position === "7xx4" && pawn.color === "Yellow")
    )
  ) {
    return match(pawn.color)
      .with("Blue", (): PawnCase => "5xx7")
      .with("Green", (): PawnCase => "9xx7")
      .with("Red", (): PawnCase => "7xx9")
      .with("Yellow", (): PawnCase => "7xx5")
      .exhaustive();
  }

  if (diceScore === 6) {
    if (
      (
        (pawn.position === "5xx7" && pawn.color === "Blue") ||
        (pawn.position === "7xx9" && pawn.color === "Red") ||
        (pawn.position === "9xx7" && pawn.color === "Green") ||
        (pawn.position === "7xx5" && pawn.color === "Yellow")
      )
    ) {
      return match(pawn.color)
        .with("Blue", (): PawnCase => "6xx7")
        .with("Green", (): PawnCase => "9xx6")
        .with("Red", (): PawnCase => "6xx9")
        .with("Yellow", (): PawnCase => "7xx6")
        .exhaustive();
    }

    if (
      (
        (pawn.position === "6xx7" && pawn.color === "Blue") ||
        (pawn.position === "7xx8" && pawn.color === "Red") ||
        (pawn.position === "8xx7" && pawn.color === "Green") ||
        (pawn.position === "7xx6" && pawn.color === "Yellow")
      )
    ) {
      return match(pawn.color)
        .with("Blue", (): PawnCase => "7xx7")
        .with("Green", (): PawnCase => "7xx7")
        .with("Red", (): PawnCase => "7xx7")
        .with("Yellow", (): PawnCase => "7xx7")
        .exhaustive();
    }
  }

  const index = spots.findIndex(spot => spot === pawn.position);
  let destinationIndex = index + diceScore;
  if (destinationIndex >= spots.length) {
    destinationIndex = destinationIndex - spots.length;
  }

  return spots[destinationIndex];
}

export function computeAllCaseBetweenSourceAndDestination (
  sourceTrayCase: PawnCase,
  diceScore: number,
): Array<TrayCase> {
  const spots = [
    ...road.Blue,
    ...road.Red,
    ...road.Green,
    ...road.Yellow,
  ];

  const index = spots.findIndex(spot => spot === sourceTrayCase);
  let destinationIndex = index + diceScore;
  if (destinationIndex >= spots.length) {
    destinationIndex = destinationIndex - spots.length;
  }

  return spots.slice(index + 1, destinationIndex + 1);
}

export function isPawnOnBoard (
  pawn: Pawn,
): boolean {
  const spots = [
    ...road.Blue,
    ...road.Red,
    ...road.Green,
    ...road.Yellow,

    ...heaven.Blue,
    ...heaven.Yellow,
    ...heaven.Green,
    ...heaven.Red,
  ] as const;

  return isMatching(P.union(...spots))(pawn.position);
}
