import Sequelize, { QueryInterface } from "sequelize";

export function up (queryInterface: QueryInterface): Promise<void> {
  return queryInterface.createTable("rounds", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    dice_score: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    dice_launched_at: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    pawn_starting_case: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    pawn_ending_case: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    pawn_name: {
      type: Sequelize.STRING,
    },
    player_id: {
      type: Sequelize.STRING,
    },
    game_id: {
      type: Sequelize.STRING,
    },
    created_at: {
      type: Sequelize.DATE,
    },
    updated_at: {
      type: Sequelize.DATE,
    },
  });
}

export function down (queryInterface: QueryInterface): Promise<void> {
  return queryInterface.dropTable("rounds");
}
