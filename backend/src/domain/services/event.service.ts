import { Inject, Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import axios from "axios";
import { taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { fromEvent, map, merge, Observable } from "rxjs";

import { BROKER_PROVIDER, WEBHOOK_PROVIDER } from "../../common/constants";
import { TechnicalError } from "../../infrastructure/errors/technical.errors";
import { EventName, eventNames } from "../entities/event";
import { Player } from "../entities/player";
import { BrokerRepository } from "../gateways/broker.repository";
import { WebhookRepository } from "../gateways/webhook.repository";

export interface FrontendEvent<T> {
  data: T;
  id?: string;
  retry?: number;
  type: EventName;
}

@Injectable()
export class EventService {
  constructor (
    public readonly emitter: EventEmitter2,
    @Inject(WEBHOOK_PROVIDER)
    private readonly webhookRepository: WebhookRepository,
    private logger: Logger,
    @Inject(BROKER_PROVIDER)
    private readonly kafkaRepository: BrokerRepository,
  ) {}

  broadcast<T> ({ data, type }: FrontendEvent<T>): TaskEither<TechnicalError | TechnicalError, void> {
    this.logger.debug(`broadcast ${type}`, data);

    return pipe(
      taskEither.tryCatch(
        () => {
          this.emitter.emit(type, data);
          return Promise.resolve(undefined);
        },
        (err) => {
          return err as TechnicalError;
        },
      ),
      // taskEither.chain(() => this.webhookRepository.send(
      //  "https://webhook.site/03ffb260-1c68-4ece-bbc8-df6cdeef438b",
      //  data,
      // )),
      // taskEither.chain(() => this.kafkaRepository.send("", data)),
      taskEither.map(constVoid),
    );
  }

  broadcastPlayer (messageName: string, data: Player): TaskEither<TechnicalError, void> {
    this.logger.debug(`broadcastPlayer ${messageName}`, data);

    this.emitter.emit(messageName, data);
    return taskEither.right(constVoid());
  }

  emitWebhook () {
    const url = "https://localhost:3000";
    return axios({
      url,
      method: "POST",
    });
  }

  subscribe (): Observable<FrontendEvent<any>> {
    return merge(
      ...eventNames.map(eventName => fromEvent(this.emitter, eventName)),
    )
      .pipe(e => {
        console.log(e);
        console.log(e);
        console.log(e);

        return e;
      })
      .pipe(
        map((data) => ({
          data: (data as FrontendEvent<any>).data,
          type: (data as FrontendEvent<any>).type,
        })),
      );
  }
}
