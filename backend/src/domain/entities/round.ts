import { randomUUID } from "crypto";
import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

import { PawnName } from "../value-objects/pawn-name";
import { TrayCase } from "../value-objects/tray-case";
import { GameId, generateGameId } from "./game";
import { generatePlayerId, PlayerId } from "./player";

export type RoundStatus =
  "WaitingDiceLaunch" |
  "WaitingMove" |
  "Finished";

export type RoundId = string & { readonly "": unique symbol };
export type Round = {
  createdAt: Date;
  diceLaunchedAt: Option<Date>;
  diceScore: Option<number>;
  gameId: GameId;
  id: RoundId;
  pawnEndingCase: Option<TrayCase>;
  pawnName: Option<PawnName>;
  pawnStartingCase: Option<TrayCase>;
  playerId: PlayerId;
  status: RoundStatus;
  updatedAt: Date;
}
export function generateRoundId (): RoundId {
  return randomUUID() as RoundId;
}
export function generateRound (
  properties: Partial<Round> = {},
) : Round {
  return {
    id: generateRoundId(),
    gameId: generateGameId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    diceLaunchedAt: option.none,
    diceScore: option.none,
    pawnName: option.none,
    playerId: generatePlayerId(),
    pawnEndingCase: option.none,
    pawnStartingCase: option.none,
    status: "WaitingDiceLaunch",
    ...properties,
  };
}
