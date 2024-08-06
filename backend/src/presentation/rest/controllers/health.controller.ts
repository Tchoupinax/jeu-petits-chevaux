import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HealthCheck, HealthCheckResult, HealthCheckService, HealthIndicatorResult } from "@nestjs/terminus";

@Controller("health")
@ApiTags("technical")
export class HealthController {
  constructor (
    private health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck (): Promise<HealthCheckResult> {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => ({
        core: {
          status: "up",
        },
      }),
    ]);
  }
}
