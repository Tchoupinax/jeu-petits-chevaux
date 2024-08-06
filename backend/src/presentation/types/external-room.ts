import { ApiProperty } from "@nestjs/swagger";
import { randomUUID } from "crypto";

import { ExternalPlayer } from "./external-player";

export class ExternalRoom {
  @ApiProperty({ example: randomUUID(), description: "Uniq identifiant of the room" })
  public id!: string;

  @ApiProperty({ example: "marguerite", description: "Name of the room" })
  public name!: string;

  @ApiProperty({
    type: ExternalPlayer,
    isArray: true,
  })
  public players!: Array<ExternalPlayer>;
}
