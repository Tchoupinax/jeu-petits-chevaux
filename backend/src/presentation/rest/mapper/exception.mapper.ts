import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor (private readonly httpAdapterHost: HttpAdapterHost) {}

  catch (exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const statusCode = (exception as unknown as any).statusCode ?? 500;

    const responseBody = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: (exception as unknown as any).message,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
