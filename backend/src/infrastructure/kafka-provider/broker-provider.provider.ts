import { ClassProvider } from "@nestjs/common";

import { BROKER_PROVIDER } from "../../common/constants";
import { BrokerRepository } from "../../domain/gateways/broker.repository";
import { KafkaRepository } from "./kafka/kafka-provider.provider";

export const BrokerProviderProvider: ClassProvider<BrokerRepository> = {
  provide: BROKER_PROVIDER,
  useClass: KafkaRepository,
};
