import { Inject, Logger, Module, OnModuleInit } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { SequelizeModule } from "@nestjs/sequelize";
import config from "config";
import { Sequelize } from "sequelize-typescript";

import { BrokerProviderProvider } from "./kafka-provider/broker-provider.provider";
import { GameRepositoryProvider } from "./repositories/game/game.repository.provider";
import { PawnRepositoryProvider } from "./repositories/pawn/pawn.repository.provider";
import { PlayerRepositoryProvider } from "./repositories/player/player.repository.provider";
import { RoundRepositoryProvider } from "./repositories/round/round.repository.provider";
import { WebhookProviderProvider } from "./webhook-provider/webhook-provider.provider";

const providers = [
  PlayerRepositoryProvider,
  BrokerProviderProvider,
  Logger,
  PawnRepositoryProvider,
  RoundRepositoryProvider,
  WebhookProviderProvider,
  GameRepositoryProvider,
];

const postgres : {
  database: string,
  host: string,
  password: string,
  port: number,
  username: string,
} = config.get("services.postgres");

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        // logging: (sql: string): void => console.log(sql),
        logging: false,
        database: postgres.database,
        dialect: "postgres",
        host: postgres.host,
        password: postgres.password,
        port: postgres.port,
        synchronize: true,
        username: postgres.username,
        define: {
          underscored: true,
          paranoid: true,
        },
      }),
    }),
    ClientsModule.register([{
      name: "AUTH_MICROSERVICE",
      transport: Transport.KAFKA,
      options: {
        client: {
          clientId: "auth",
          brokers: ["localhost:29096"],
        },
        producerOnlyMode: true,
        consumer: {
          groupId: "jeu-petits-chevaux-backend",
        },
      },
    }]),
  ],
  providers,
  exports: [...providers],
})
export class InfrastructureModule implements OnModuleInit {
  constructor (
    @Inject(Sequelize)
    private readonly sequelize: Sequelize,
  ) {}

  async onModuleInit (): Promise<void> {
    await this.sequelize.sync({
      force: false,
      logging: true,
    });
  }
}
