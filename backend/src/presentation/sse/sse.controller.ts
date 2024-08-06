import { Controller, Sse } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Observable } from "rxjs";

import { EventService } from "../../domain/services/event.service";

@Controller("sse")
@ApiTags("sse")
export class SSEController {
  constructor (
    private readonly evenService: EventService,
  ) {}

  @Sse()
  sse (): Observable<{ data: unknown }> {
    setInterval(() => {
      this.evenService.broadcast({ type: "game-created", data: {} });
    }, 1000);

    console.log("subscribe");
    return this.evenService.subscribe();
  }
}
