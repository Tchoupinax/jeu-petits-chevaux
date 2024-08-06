import { GameId } from "../entities/game";
import { PlayerId } from "../entities/player";

export type Context = {
  gameId: GameId;
  playerId: PlayerId;
}
