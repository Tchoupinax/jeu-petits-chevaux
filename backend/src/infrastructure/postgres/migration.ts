import { Sequelize } from "sequelize";
import { SequelizeStorage, Umzug } from "umzug";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  password: "postgres",
  username: "postgres",
  database: "postgres",
  port: 5432,
});

const umzug = new Umzug({
  migrations: {
    glob: "src/infrastructure/postgres/migrations/*.ts",
    resolve: ({ name, path, context }) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const migration = require(path!);
      return {
        name,
        up: (): Promise<void> => migration.up(context, Sequelize),
        down: (): Promise<void> => migration.down(context, Sequelize),
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

(async (): Promise<void> => {
  await umzug.up();
})();
