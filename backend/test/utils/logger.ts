/* eslint-disable @typescript-eslint/no-empty-function */
import { Logger } from "@nestjs/common";

export class LoggerForTest extends Logger {
  // debug (args) { console.log(args); }
  // error (args) { console.log(args); }
  // warn (args) { console.log(args); }
  // info (args) { console.log(args); }
  debug (): void {}
  error (): void {}
  warn (): void {}
  info (): void {}
}
