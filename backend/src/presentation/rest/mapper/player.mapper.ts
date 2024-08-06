import { option } from "fp-ts";

import { Player } from "../../../domain/entities/player";
import { ExternalPlayer } from "../../types/external-player";

export function fromDomainToRest (player: Player): ExternalPlayer {
  return {
    id: player.id,
    nickname: player.nickname,
    gameId: option.toNullable(player.gameId),
  };
}
