import { ApiProperty } from "@nestjs/swagger";
import { randomUUID } from "crypto";

export class ExternalPlayer {
  @ApiProperty({ example: randomUUID(), description: "Uniq identifiant of the player" })
  public id!: string;

  @ApiProperty({ example: "Tchoupinax", description: "Nickname of the player" })
  public nickname!: string;

  public gameId!: string | null;
}
