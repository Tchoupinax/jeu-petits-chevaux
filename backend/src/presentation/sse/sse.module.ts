import { Logger, Module } from "@nestjs/common";

import { DomainModule } from "../../domain/domain.module";
import { SSEController } from "./sse.controller";

@Module({
  imports: [
    DomainModule,
  ],
  controllers: [
    SSEController,
  ],
  providers: [
    Logger,
  ],
  exports: [],
})
export class SSEModule {}
