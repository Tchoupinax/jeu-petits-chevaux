import { Pawn } from "../../../domain/entities/pawn";
import { FrontendEvent } from "../../../domain/services/event.service";
import { fromDomainToRest } from "../../../presentation/rest/mapper/pawn.mapper";
import { ExternalPawn } from "../../../presentation/types/external-pawn";

type Input = {
  currentPawn: Pawn,
  oldPawn: Pawn
};

export type PawnMovedWebsocket = {
  currentPawn: ExternalPawn,
  oldPawn: ExternalPawn
}

export function toPawnMovedWebsocket (
  input: Input,
): FrontendEvent<PawnMovedWebsocket> {
  return {
    type: "pawn-moved",
    data: {
      oldPawn: fromDomainToRest(input.oldPawn),
      currentPawn: fromDomainToRest(input.currentPawn),
    },
  };
}
