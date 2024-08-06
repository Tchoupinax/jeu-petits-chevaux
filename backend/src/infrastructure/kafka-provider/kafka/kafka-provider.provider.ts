import { Inject } from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";
import { taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { firstValueFrom } from "rxjs";
import { Error } from "sequelize";

import { BrokerRepository } from "../../../domain/gateways/broker.repository";
import { TechnicalError } from "../../errors/technical.errors";

export class KafkaRepository implements BrokerRepository {
  constructor (
    @Inject("AUTH_MICROSERVICE")
    private readonly authClient: ClientKafka,
  ) {}

  send<T> (
    endpoint: string,
    data: T,
  ): TaskEither<TechnicalError, void> {
    return pipe(
      taskEither.tryCatch(
        () => firstValueFrom(this.authClient.emit("fe", data)),
        error => new TechnicalError(error as Error),
      ),
      taskEither.map(constVoid),
    );
  }
}
