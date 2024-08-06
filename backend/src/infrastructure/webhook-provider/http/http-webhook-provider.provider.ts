import axios from "axios";
import { taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Error } from "sequelize";

import { WebhookRepository } from "../../../domain/gateways/webhook.repository";
import { TechnicalError } from "../../errors/technical.errors";

export class HttpWebhookRepository implements WebhookRepository {
  send<T> (
    endpoint: string,
    data: T,
  ): TaskEither<TechnicalError, void> {
    return pipe(
      taskEither.tryCatch(
        () => axios({
          url: endpoint,
          method: "POST",
          data,
        }),
        error => new TechnicalError(error as Error),
      ),
      taskEither.map(constVoid),
    );
  }
}
