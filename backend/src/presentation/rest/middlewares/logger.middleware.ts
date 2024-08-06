import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { Logger } from "nestjs-pino";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor (private logger: Logger) {}

  use (req: Request, res: Response, next: NextFunction): void {
    // this.logger.log(`${req.method} ${req.url} ${res.statusCode}`);
    next();
  }
}
