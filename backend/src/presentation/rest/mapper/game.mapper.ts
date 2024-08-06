import { option } from "fp-ts";
import { Option } from "fp-ts/Option";

import { Game } from "../../../domain/entities/game";
import { Round } from "../../../domain/entities/round";
import { ExternalGame } from "../../types/external-game";
import { fromDomainToRest as playerFromDomainToRest } from "../mapper/player.mapper";
import { roundFromDomainToRest } from "./round.mapper";

export function fromDomainToRest (
  game: Game,
  currentRound: Option<Round>,
): ExternalGame {
  return {
    id: game.id,
    name: game.name,
    players: game.players.map(playerFromDomainToRest),
    playersColors: option.toNullable(game.playersColors),
    startedAt: option.toNullable(game.startedAt),
    currentRound: option.isSome(currentRound) ? roundFromDomainToRest(currentRound.value) : null,
  };
}
