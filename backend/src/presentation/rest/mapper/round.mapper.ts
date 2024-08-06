import { option } from "fp-ts";
import { Round } from "src/domain/entities/round";

import { ExternalRound } from "../../types/external-round";

export function roundFromDomainToRest (
  round: Round,
): ExternalRound {
  return {
    roundId: round.id,
    diceLaunchedAt: option.toNullable(round.diceLaunchedAt)?.toISOString() ?? null,
    diceScore: option.toNullable(round.diceScore),
    pawnEndingCase: option.toNullable(round.pawnEndingCase),
    pawnName: option.toNullable(round.pawnName),
    pawnStartingCase: option.toNullable(round.pawnStartingCase),
    playerId: round.playerId,
    possibleActions: [],
  };
}
