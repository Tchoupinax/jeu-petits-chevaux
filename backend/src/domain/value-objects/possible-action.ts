import { PawnName } from "./pawn-name";
import { TrayCase } from "./tray-case";

export type PossibleAction = {
  endingCase: TrayCase;
  id: number;
  pawnName: PawnName;
  startingCase: TrayCase;
}
