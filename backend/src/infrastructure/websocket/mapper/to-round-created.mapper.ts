import { Round } from "../../../domain/entities/round";
import { FrontendEvent } from "../../../domain/services/event.service";
import { roundFromDomainToRest } from "../../../presentation/rest/mapper/round.mapper";
import { ExternalRound } from "../../../presentation/types/external-round";

export function toRoundCreatedWebsocket (
  input: Round,
): FrontendEvent<ExternalRound> {
  return {
    type: "round-created",
    data: roundFromDomainToRest(input),
  };
}
