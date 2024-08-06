import { TaskEither } from "fp-ts/lib/TaskEither";

import { TechnicalError } from "../../infrastructure/errors/technical.errors";

export type BrokerRepository = {
  send<T>(endpoint: string, data: T): TaskEither<TechnicalError, void>;
}
