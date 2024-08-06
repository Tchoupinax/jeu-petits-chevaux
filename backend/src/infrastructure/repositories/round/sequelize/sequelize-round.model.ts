import { option } from "fp-ts";
import { Column, DataType, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";

import { GameId } from "../../../../domain/entities/game";
import { PlayerId } from "../../../../domain/entities/player";
import { Round, RoundId, RoundStatus } from "../../../../domain/entities/round";
import { PawnName } from "../../../../domain/value-objects/pawn-name";
import { TrayCase } from "../../../../domain/value-objects/tray-case";

@Table({ tableName: "rounds", freezeTableName: true, timestamps: true })
export class SequelizeRoundModel extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  declare id: string;

  @Column({ type: DataType.INTEGER, allowNull: true, field: "dice_score" })
  declare diceScore: number | null;

  @Column({ type: DataType.DATE, allowNull: true, field: "dice_launched_at" })
  declare diceLaunchedAt: Date | null;

  @Column({ type: DataType.STRING, allowNull: true, field: "pawn_starting_case" })
  declare pawnStartingCase: TrayCase | null;

  @Column({ type: DataType.STRING, allowNull: true, field: "pawn_ending_case" })
  declare pawnEndingCase: TrayCase | null;

  @Column({ type: DataType.STRING, allowNull: true, field: "pawn_name" })
  declare pawnName: PawnName | null;

  @IsUUID(4)
  @Column({ type: DataType.STRING, allowNull: false, field: "player_id" })
  declare playerId: string;

  @IsUUID(4)
  @Column({ type: DataType.STRING, allowNull: false, field: "game_id" })
  declare gameId: string;

  @Column({ type: DataType.STRING, allowNull: false, field: "status" })
  declare status: RoundStatus;

  @Column({ type: DataType.DATE, allowNull: false, field: "created_at" })
  declare createdAt: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: "updated_at" })
  declare updatedAt: Date;

  static toModel (
    round: Round,
    isNewRecord = true,
  ): SequelizeRoundModel {
    return SequelizeRoundModel.build({
      createdAt: round.createdAt,
      diceLaunchedAt: option.toNullable(round.diceLaunchedAt),
      diceScore: option.toNullable(round.diceScore),
      gameId: round.gameId,
      id: round.id,
      pawnEndingCase: option.toNullable(round.pawnEndingCase),
      pawnName: option.toNullable(round.pawnName),
      pawnStartingCase: option.toNullable(round.pawnStartingCase),
      playerId: round.playerId,
      status: round.status,
      updatedAt: round.updatedAt,
    }, { isNewRecord });
  }

  static toEntity (roundModel: SequelizeRoundModel): Round {
    return {
      createdAt: roundModel.createdAt,
      diceLaunchedAt: option.fromNullable(roundModel.diceLaunchedAt),
      diceScore: option.fromNullable(roundModel.diceScore),
      gameId: roundModel.gameId as GameId,
      id: roundModel.id as RoundId,
      pawnEndingCase: option.fromNullable(roundModel.pawnEndingCase),
      pawnName: option.fromNullable(roundModel.pawnName),
      pawnStartingCase: option.fromNullable(roundModel.pawnStartingCase),
      playerId: roundModel.playerId as PlayerId,
      status: roundModel.status,
      updatedAt: roundModel.updatedAt,
    };
  }
}
