import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { DomainModule } from "../../domain/domain.module";
import { GameController } from "./controllers/game.controller";
import { HealthController } from "./controllers/health.controller";
import { MessageController } from "./controllers/message.controller";
import { PawnController } from "./controllers/pawn.controller";
import { PlayerController } from "./controllers/player.controller";
import { PrometheusController } from "./controllers/prom.controller";
import { RoundController } from "./controllers/round.controller";
import { LoggerMiddleware } from "./middlewares/logger.middleware";

@Module({
  imports: [
    DomainModule,
    TerminusModule,
  ],
  controllers: [
    HealthController,
    PrometheusController,
    PawnController,
    RoundController,
    GameController,
    PlayerController,
    MessageController,
  ],
  providers: [],
})
export class RestModule implements NestModule {
  configure (consumer: MiddlewareConsumer): void {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes("*");
  }
}
