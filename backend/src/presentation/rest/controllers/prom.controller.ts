import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
import * as client from "prom-client";

@Controller("metrics")
export class PrometheusController {
  @Get()
  async index (@Res() response: Response): Promise<void> {
    response.header("Content-Type", client.register.contentType);
    response.send(await client.register.metrics());
  }
}
