import { isMatching, P } from "ts-pattern";

import { UnionToTuple } from "../../common/union-tuple";
import { Pawn } from "../entities/pawn";

export type BlueStairCase = "1xx7" | "2xx7" | "3xx7" | "4xx7" | "5xx7" | "6xx7";
export const blueStairCases: UnionToTuple<BlueStairCase> = ["1xx7", "2xx7", "3xx7", "4xx7", "5xx7", "6xx7"];

export type YellowStairCase = "7xx8" | "7xx9" | "7xx10" | "7xx11" | "7xx12" | "7xx13";
export const yellowStairCases: UnionToTuple<YellowStairCase> = ["7xx8", "7xx9", "7xx10", "7xx11", "7xx12", "7xx13"];

export type GreenStairCase = "8xx7" | "9xx7" | "10xx7" | "11xx7" | "12xx7" | "13xx7";
export const greenStairCases: UnionToTuple<GreenStairCase> = ["8xx7", "9xx7", "10xx7", "11xx7", "12xx7", "13xx7"];

export type RedStairCase = "7xx1" | "7xx2" | "7xx3" | "7xx4" | "7xx5" | "7xx6";
export const redStairCases: UnionToTuple<RedStairCase> = ["7xx1", "7xx2", "7xx3", "7xx4", "7xx5", "7xx6"];

export const stairsCases = [
  ...blueStairCases,
  ...yellowStairCases,
  ...greenStairCases,
  ...redStairCases,
] as const;
export type StairCase = BlueStairCase |
  YellowStairCase |
  GreenStairCase |
  RedStairCase;

export function isPawnOnStairCase (pawn: Pawn): boolean {
  return isMatching(P.union(...stairsCases))(pawn.position);
}
