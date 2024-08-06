import { taskEither } from "fp-ts";
import { constVoid } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { BrokerRepository } from "../../../domain/gateways/broker.repository";
import { TechnicalError } from "../../errors/technical.errors";

export class InMemoryBrokerRepository implements BrokerRepository {
  private messages: any = [];

  send (
    endpoint: string,
    data: any,
  ): TaskEither<TechnicalError, void> {
    this.messages.push(data);

    return taskEither.right(constVoid());
  }
}
