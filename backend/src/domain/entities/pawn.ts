import { randomUUID } from "crypto";

import { Color } from "../value-objects/color";
import { HouseCase } from "../value-objects/house-case";
import { ParadiseCase } from "../value-objects/paradise-case";
import { PawnName } from "../value-objects/pawn-name";
import { StairCase } from "../value-objects/stair-case";
import { CAMP_SIZE, COLOR_ORDER, heaven, road, TrayCase } from "../value-objects/tray-case";

export type PawnCase =
  TrayCase |
  HouseCase |
  StairCase |
  ParadiseCase;

export type Pawn = {
  color: Color;
  createdAt: Date;
  gameId: string;
  id: string;
  name: PawnName;
  playerId: string;
  position: PawnCase,
  updatedAt: Date;
}

export function generatePawn (
  properties?: Partial<Pawn>,
): Pawn {
  return {
    id: randomUUID(),
    color: "Green",
    createdAt: new Date(),
    gameId: randomUUID(),
    playerId: randomUUID(),
    position: "0xx6",
    updatedAt: new Date(),
    name: "Green.1",
    ...properties,
  };
}

export function isOnLastCase (pawn: Pawn): boolean {
  const map = {
    Blue: "0xx7",
    Yellow: "7xx0",
    Red: "7xx14",
    Green: "14xx7",
  };

  return map[pawn.color] === pawn.position;
}

export function isOnHeaven (pawn: Pawn): boolean {
  return heaven[pawn.color].includes(pawn.position);
}

// Return true if
export function isOnLastPart (
  pawn: Pawn,
): boolean {
  const lastPartColor: Record<Color, Color> = {
    Red: "Blue",
    Blue: "Yellow",
    Yellow: "Green",
    Green: "Red",
  };

  return (road[lastPartColor[pawn.color]] as Array<PawnCase>).includes(pawn.position);
}

export function distanceFromTheEnd (pawn: Pawn): number {
  if (isOnLastCase(pawn)) {
    return 0;
  }

  if (isOnLastPart(pawn)) {
    let index = COLOR_ORDER.findIndex(color => color === pawn.color);
    if (index - 1 < 0) {
      index = index - 1 + COLOR_ORDER.length;
    }

    const lastPartColor = COLOR_ORDER[index];
    const caseIndexInLastPart = (road[lastPartColor] as Array<TrayCase>).findIndex(trayCase => trayCase === pawn.position);

    return CAMP_SIZE - caseIndexInLastPart;
  }

  return CAMP_SIZE;
}

export function canPawnProgressOnHeaven (
  pawn: Pawn,
  diceScore: number,
): boolean {
  const abilities: Record<Pawn["color"], Record<string, number>> = {
    Green: {
      "13xx7": 2,
      "12xx7": 3,
      "11xx7": 4,
      "10xx7": 5,
      "9xx7": 6,
      "8xx7": 6,
    },
    Blue: {
      "1xx7": 2,
      "2xx7": 3,
      "3xx7": 4,
      "4xx7": 5,
      "5xx7": 6,
      "6xx7": 6,
    },
    Red: {
      "7xx8": 6,
      "7xx9": 6,
      "7xx10": 5,
      "7xx11": 4,
      "7xx12": 3,
      "7xx13": 2,
    },
    Yellow: {
      "7xx1": 2,
      "7xx2": 3,
      "7xx3": 4,
      "7xx4": 5,
      "7xx5": 6,
      "7xx6": 6,
    },
  };

  return abilities[pawn.color][pawn.position] === diceScore;
}
