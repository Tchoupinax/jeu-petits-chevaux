import { Column, DataType, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";

import { Pawn } from "../../../../domain/entities/pawn";
import { Color } from "../../../../domain/value-objects/color";
import { PawnName } from "../../../../domain/value-objects/pawn-name";
import { TrayCase } from "../../../../domain/value-objects/tray-case";

@Table({ tableName: "pawns", freezeTableName: true, timestamps: true })
export class SequelizePawnModel extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  color!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  position!: string;

  @IsUUID(4)
  @Column({ type: DataType.STRING, allowNull: false, field: "player_id" })
  playerId!: string;

  @IsUUID(4)
  @Column({ type: DataType.STRING, allowNull: false, field: "game_id" })
  gameId!: string;

  @Column({ type: DataType.DATE, allowNull: false, field: "created_at" })
  createdAt!: Date;

  @Column({ type: DataType.DATE, allowNull: false, field: "updated_at" })
  updatedAt!: Date;

  static toModel (pawn: Pawn, isNewRecord = true): SequelizePawnModel {
    return SequelizePawnModel.build({
      id: pawn.id,
      color: pawn.color,
      createdAt: pawn.createdAt,
      updatedAt: pawn.updatedAt,
      gameId: pawn.gameId,
      playerId: pawn.playerId,
      name: pawn.name,
      position: pawn.position as TrayCase,
    }, { isNewRecord });
  }

  static toEntity (pawnModel: SequelizePawnModel): Pawn {
    return {
      id: pawnModel.id,
      color: pawnModel.color as Color,
      createdAt: pawnModel.createdAt,
      updatedAt: pawnModel.updatedAt,
      gameId: pawnModel.gameId,
      playerId: pawnModel.playerId,
      name: pawnModel.name as PawnName,
      position: pawnModel.position.toString() as TrayCase,
    };
  }
}
