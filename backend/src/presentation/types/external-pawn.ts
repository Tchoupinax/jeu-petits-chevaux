import { ApiProperty } from "@nestjs/swagger";
import { randomUUID } from "crypto";

export class ExternalPawn {
  public color!: string | null;

  @ApiProperty({ example: randomUUID(), description: "Uniq identifiant of the game" })
  public gameId!: string;

  @ApiProperty({ example: randomUUID(), description: "Uniq identifiant of the pawn" })
  public id!: string;

  public name!: string | null;

  @ApiProperty({ example: randomUUID(), description: "Uniq identifiant of the player which own the pawn" })
  public playerId!: string;

  public position!: string | null;
}
