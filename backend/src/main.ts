import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import config from "config";
import { Logger, LoggerErrorInterceptor } from "nestjs-pino";
import { mw } from "request-ip";

import { AppModule } from "./app.module";

export async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: "*",
  });
  app.flushLogs();
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.use(mw());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Petits chevaux")
    .setDescription("API for the game \"Petits chevaux\"")
    .setVersion("1.0")
    .addTag("rounds")
    .addTag("pawns")
    .addTag("technical")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api", app, document);

  await app.listen(config.get("http.port"));
  console.log(`Application is running on: ${await app.getUrl()}`);

  // (await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
  //  transport: Transport.KAFKA,
  //  options: {
  //    client: {
  //      brokers: ["localhost:29096"],
  //    },
  //    consumer: {
  //      groupId: "jeu-petits-chevaux-backend",
  //    },
  //  },
  // })).listen();
}

bootstrap();
