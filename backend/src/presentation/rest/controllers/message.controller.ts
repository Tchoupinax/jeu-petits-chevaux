import { Body, Controller, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Logger } from "nestjs-pino";

import { EventService } from "../../../domain/services/event.service";
import { toPromise } from "../../../utils/to-promise";
import { ContextInput } from "../../common/context-input";
import { SendMessageInput } from "../../validators/send-message.validator";

@Controller("messages")
@ApiTags("messages")
export class MessageController {
  constructor (
    private eventService: EventService,
    private logger: Logger,
  ) {}

  @Post()
  @ApiResponse({
    description: "Message has been sent",
  })
  async sendMessage (
    @Body() input: SendMessageInput & ContextInput,
  ): Promise<void> {
    this.logger.debug({ input }, "MessageController");

    return toPromise(
      pipe(
        this.extractContext(input),
        taskEither.right,
        taskEither.chain(({ context, port }) => pipe(
          this.eventService.broadcast({
            type: "message-broacast",
            data: {
              ...port,
              playerId: context.playerId,
            },
          }),
        )),
      ),
    );
  }

  private extractContext<A> (body: ContextInput & A): { context: ContextInput, port: Omit<A, keyof ContextInput> } {
    const { playerId, gameId, ...rest } = body;

    return {
      context: { playerId, gameId },
      port: rest,
    };
  }
}
