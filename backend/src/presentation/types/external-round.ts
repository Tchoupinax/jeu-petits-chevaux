import { ApiProperty } from "@nestjs/swagger";

import type { PossibleAction } from "../../domain/value-objects/possible-action";

export class ExternalRound {
  @ApiProperty({ example: 1, description: "The age of the Cat" })
  public diceLaunchedAt!: string | null;

  public diceScore!: number | null;
  public pawnEndingCase!: string | null;
  public pawnName!: string | null;
  public pawnStartingCase!: string | null;
  public playerId!: string;
  public possibleActions!: Array<PossibleAction>;
  public roundId!: string;
}
