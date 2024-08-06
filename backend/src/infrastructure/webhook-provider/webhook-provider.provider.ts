import { ClassProvider } from "@nestjs/common";

import { WEBHOOK_PROVIDER } from "../../common/constants";
import { WebhookRepository } from "../../domain/gateways/webhook.repository";
import { HttpWebhookRepository } from "./http/http-webhook-provider.provider";

export const WebhookProviderProvider: ClassProvider<WebhookRepository> = {
  provide: WEBHOOK_PROVIDER,
  useClass: HttpWebhookRepository,
};
