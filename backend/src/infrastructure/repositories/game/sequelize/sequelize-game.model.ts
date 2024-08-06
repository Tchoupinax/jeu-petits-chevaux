import { option } from "fp-ts";
import {
  Column,
  DataType,
  HasMany,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Game, GameId, GamePlayersColors } from "src/domain/entities/game";

import { Player, PlayerId } from "../../../../domain/entities/player";
import { SequelizePlayerModel } from "../../player/sequelize/sequelize-player.model";

@Table({ tableName: "games", freezeTableName: true, timestamps: true })
export class SequelizeGameModel extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    unique: true,
    allowNull: false,
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  name!: string;

  @Column({ type: DataType.DATE, allowNull: true })
  startedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  finishedAt!: Date;

  @Column({ type: DataType.JSONB, allowNull: true })
  playersColors!: GamePlayersColors;

  @HasMany(() => SequelizePlayerModel)
  players!: Player[];

  @Column({ type: DataType.JSONB, allowNull: true })
  playersOrders!: Array<string>;

  @Column({ type: DataType.STRING, allowNull: true })
  wonBy!: string;

  static toModel (
    game: Game,
    isNewRecord = true,
  ): SequelizeGameModel {
    return SequelizeGameModel.build(
      {
        finishedAt: option.toNullable(game.finishedAt),
        id: game.id,
        name: game.name,
        players: game.players,
        playersColors: option.toNullable(game.playersColors),
        startedAt: option.toNullable(game.startedAt),
        wonBy: option.toNullable(game.wonBy),
      },
      { isNewRecord },
    );
  }

  static toEntity (gameModel: SequelizeGameModel): Game {
    return {
      finishedAt: option.fromNullable(gameModel.finishedAt),
      id: gameModel.id as GameId,
      name: gameModel.name,
      players: gameModel.players,
      playersColors: option.fromNullable(gameModel.playersColors),
      startedAt: option.fromNullable(gameModel.startedAt),
      wonBy: option.fromNullable(gameModel.wonBy as PlayerId),
    };
  }
}
