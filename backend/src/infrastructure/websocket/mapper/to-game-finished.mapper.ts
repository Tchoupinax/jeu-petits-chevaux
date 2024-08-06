import { Player } from "../../../domain/entities/player";
import { FrontendEvent } from "../../../domain/services/event.service";

type Input = {
  player: Player
};

export type GameFinishedWebsocket = {
  winnerPlayerNickname: Player["nickname"]
}

export function toGameFinishedEvent (
  input: Input,
): FrontendEvent<GameFinishedWebsocket> {
  return {
    type: "game-finished",
    data: { winnerPlayerNickname: input.player.nickname },
  };
}
