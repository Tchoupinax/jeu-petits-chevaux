import { Body, Controller, Get, Param, Post, UseFilters } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "crypto";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { Logger } from "nestjs-pino";

import { CreatePlayerUseCase } from "../../../domain/use-cases/create-player/create-player.use-case";
import { GetPlayerByNameUseCase } from "../../../domain/use-cases/get-player-by-name/get-player-by-name.use-case";
import { toPromise } from "../../../utils/to-promise";
import { ContextInput } from "../../common/context-input";
import { ExternalPlayer } from "../../types/external-player";
import { AllExceptionsFilter } from "../mapper/exception.mapper";
import { fromDomainToRest } from "../mapper/player.mapper";

export type RegisterPlayerBody = {
  nickname: string;
}

@Controller("players")
@ApiTags("players")
export class PlayerController {
  constructor (
    private createPlayerUseCase: CreatePlayerUseCase,
    private getPlayerByNameUseCase: GetPlayerByNameUseCase,
    private logger: Logger,
  ) { }

  @Get("/:name")
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["id", "name"],
      properties: {
        id: {
          type: "string",
          example: randomUUID(),
        },
        nickname: {
          type: "string",
        },
        gameId: {
          type: "string",
          example: randomUUID(),
        },
      },
    },
  })
  async getPlayerByName (
    @Param("name") name: string,
  ): Promise<ExternalPlayer> {
    return toPromise(
      pipe(
        this.getPlayerByNameUseCase.execute({ name }),
        taskEither.map(fromDomainToRest),
      ),
    );
  }

  @Post("register")
  @UseFilters(AllExceptionsFilter)
  @ApiOkResponse({
    schema: {
      type: "object",
      required: ["id", "nickname"],
      properties: {
        id: {
          type: "string",
          example: randomUUID(),
        },
        nickname: {
          type: "string",
          example: randomUUID(),
        },
      },
    },
  })
  async registerPlayer (
    @Body() body: RegisterPlayerBody,
  ): Promise<{ id: string, nickname: string }> {
    this.logger.debug("/players/register");

    return toPromise(
      pipe(
        this.createPlayerUseCase.execute(body),
        taskEither.map(player => ({ id: player.id, nickname: player.nickname })),
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
