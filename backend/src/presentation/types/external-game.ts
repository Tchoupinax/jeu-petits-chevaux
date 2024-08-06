import { ApiProperty } from "@nestjs/swagger";
import { randomUUID } from "crypto";

import { GamePlayersColors } from "../../domain/entities/game";
import { ExternalPlayer } from "./external-player";
import { ExternalRound } from "./external-round";

export class ExternalGame {
  @ApiProperty({ example: randomUUID(), description: "Uniq identifiant of the player" })
  public id!: string;

  @ApiProperty({ example: "Tchoupinax", description: "Nickname of the player" })
  public name!: string;

  public players!: Array<ExternalPlayer>;
  public playersColors!: GamePlayersColors | null;
  public startedAt!: Date | null;

  public currentRound!: ExternalRound | null;
}
