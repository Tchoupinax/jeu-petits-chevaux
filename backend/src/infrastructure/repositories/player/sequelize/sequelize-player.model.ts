import { option } from "fp-ts";
import { Column, DataType, ForeignKey, IsUUID, Model, PrimaryKey, Table } from "sequelize-typescript";

import { GameId } from "../../../../domain/entities/game";
import { Player, PlayerId } from "../../../../domain/entities/player";
import { SequelizeGameModel } from "../../game/sequelize/sequelize-game.model";

@Table({ tableName: "players", freezeTableName: true, timestamps: true })
export class SequelizePlayerModel extends Model {
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

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare nickname: string;

  @IsUUID(4)
  @ForeignKey(() => SequelizeGameModel)
  @Column({ type: DataType.STRING, allowNull: true })
  declare gameId: string;

  static toModel (player: Player): SequelizePlayerModel {
    return SequelizePlayerModel.build({
      id: player.id,
      nickname: player.nickname,
    });
  }

  static toEntity (playerModel: SequelizePlayerModel): Player {
    return {
      id: playerModel.id as PlayerId,
      nickname: playerModel.nickname,
      favoriteColor: option.none,
      gameId: option.fromNullable(playerModel.gameId as GameId),
    };
  }
}
