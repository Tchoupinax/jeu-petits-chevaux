import { randomUUID } from "crypto";
import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

import { Color } from "../value-objects/color";
import { GameId } from "./game";

export type PlayerId = string & { readonly "": unique symbol };
export type Player = {
  favoriteColor: Option<Color>,
  gameId: Option<GameId>;
  id: PlayerId;
  nickname: string;
}

export function generatePlayerId (): PlayerId {
  return randomUUID() as PlayerId;
}
export function generatePlayer (
  properties: Partial<Player> = {},
): Player {
  return {
    id: generatePlayerId(),
    nickname: "",
    gameId: option.none,
    favoriteColor: option.none,
    ...properties,
  };
}
