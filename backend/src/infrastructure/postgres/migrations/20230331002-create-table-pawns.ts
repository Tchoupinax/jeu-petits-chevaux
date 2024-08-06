import Sequelize, { QueryInterface } from "sequelize";

export function up (queryInterface: QueryInterface): Promise<void> {
  return queryInterface.createTable("pawns", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    color: {
      type: Sequelize.STRING,
    },
    position: {
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
  return queryInterface.dropTable("pawns");
}
