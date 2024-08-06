import { Pawn } from "../../../domain/entities/pawn";
import { ExternalPawn } from "../../types/external-pawn";

export function fromDomainToRest (pawn: Pawn): ExternalPawn {
  return {
    color: pawn.color,
    gameId: pawn.gameId,
    id: pawn.id,
    name: pawn.name,
    playerId: pawn.playerId,
    position: pawn.position,
  };
}
