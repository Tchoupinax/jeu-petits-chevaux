import { randomUUID } from "crypto";
import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

import { Color } from "../value-objects/color";
import { Player } from "./player";

export type GamePlayersColors = Array<{
  color: Color;
  playerId: string;
}>

export type GameId = string & { readonly "": unique symbol };
export type Game = {
  finishedAt: Option<Date>;
  id: GameId;
  name: string;
  players: Array<Player>,
  playersColors: Option<GamePlayersColors>,
  startedAt: Option<Date>;
  wonBy: Option<Player["id"]>;
};

export function generateGameId (): GameId {
  return randomUUID() as GameId;
}
export function generateGame (
  properties: Partial<Game>,
): Game {
  const gameId = generateGameId();

  return {
    id: gameId,
    name: "",
    players: [],
    startedAt: option.none,
    playersColors: option.none,
    finishedAt: option.none,
    wonBy: option.none,
    ...properties,
  };
}
