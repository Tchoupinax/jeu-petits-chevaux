import { Pawn } from "../../../domain/entities/pawn";
import { PawnGQL } from "../types/pawn.gql";

export function fromDomainToGQL (pawn: Pawn): PawnGQL {
  return {
    color: pawn.color,
    position: pawn.position,
    id: pawn.id,
    gameId: pawn.gameId,
    playerId: pawn.playerId,
    name: pawn.name,
  };
}
