import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { LoggerModule } from "nestjs-pino";
import { getClientIp } from "request-ip";

import { DomainModule } from "./domain/domain.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { PresentationModule } from "./presentation/presentation.module";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        base: () => "",
        customProps: (req) => ({
          ip: getClientIp(req),
        }),
        level: "trace",
        transport: {
          target: "pino-pretty",
          options: {
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
            singleLine: true,
          },
        },
      },
    }),
    EventEmitterModule.forRoot(),
    PresentationModule,
    DomainModule,
    InfrastructureModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
