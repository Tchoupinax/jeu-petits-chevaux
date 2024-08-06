import { Body, Controller, Get, HttpCode, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { randomUUID } from "crypto";
import { taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/lib/function";
import { Logger } from "nestjs-pino";

import { Context } from "../../../domain/common/context";
import { Game } from "../../../domain/entities/game";
import { AdminStartsGameUseCase } from "../../../domain/use-cases/admin-starts-games/admin-starts-game.use-case";
import { CreateGameUseCase } from "../../../domain/use-cases/create-game/create-game.use-case";
import { CreatePlayerUseCase } from "../../../domain/use-cases/create-player/create-player.use-case";
import { GetEndStatsUseCase } from "../../../domain/use-cases/get-end-stats/get-end-stats.use-case";
import { GetGameByNameUseCase } from "../../../domain/use-cases/get-game-by-name/get-game-by-name.use-case";
import { GetGameCurrentRoundUseCase } from "../../../domain/use-cases/get-game-current-round/get-game-current-round.use-case";
import { ListGamesUseCase } from "../../../domain/use-cases/list-games/list-games.use-case";
import { PlayerJoinsGamePort, PlayerJoinsGameUseCase } from "../../../domain/use-cases/player-joins-game/player-joins-game.use-case";
import { PlayerLeavesGamePort, PlayerLeavesGameUseCase } from "../../../domain/use-cases/player-leaves-game/player-leaves-game.use-case";
import { PlayerSelectsColorUseCase } from "../../../domain/use-cases/player-selects-color/player-selects-color.use-case";
import { toPromise } from "../../../utils/to-promise";
import { ContextInput } from "../../common/context-input";
import { ExternalGame } from "../../types/external-game";
import { SelectColorPayload } from "../../validators/game/select-color.validator";
import { fromDomainToRest } from "../mapper/game.mapper";
import { RegisterPlayerBody } from "./player.controller";

@Controller("games")
@ApiTags("games")
export class GameController {
  constructor (
    private adminStartsGameUseCase: AdminStartsGameUseCase,
    private createGameUseCase: CreateGameUseCase,
    private createPlayerUseCase: CreatePlayerUseCase,
    private getGameByNameUseCase: GetGameByNameUseCase,
    private listGamesUseCase: ListGamesUseCase,
    private playerJoinsGameUseCase: PlayerJoinsGameUseCase,
    private playerLeavesGameUseCase: PlayerLeavesGameUseCase,
    private playerSelectsColorUseCase: PlayerSelectsColorUseCase,
    private getGameCurrentRoundUseCase: GetGameCurrentRoundUseCase,
    private getEndStatsUseCase: GetEndStatsUseCase,
    private logger: Logger,
  ) { }

  @Get("/")
  @ApiOkResponse({
    description: "Get all opened games",
    schema: {},
  })
  @HttpCode(200)
  listGames (): Promise<Array<Game>> {
    this.logger.debug("GameController.listGames");
    return toPromise(this.listGamesUseCase.execute());
  }

  @Post("/")
  @ApiBody({
    schema: {
      properties: {
        name: {
          type: "string",
        },
      },
    },
  })
  @ApiOkResponse({
    description: "A game has been created",
    schema: {
      required: ["id"],
      properties: {
        id: {
          type: "string",
        },
      },
    },
  })
  createGame (
    @Body() input: { name: string, playerId: string },
  ): Promise<Game> {
    this.logger.debug({ input }, "GameController.createGame");

    return toPromise(this.createGameUseCase.execute(input));
  }

  @Post("create")
  @ApiBody({
    schema: {
      properties: {
        nickname: {
          type: "string",
        },
      },
    },
  })
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
    @Body("payload") body: RegisterPlayerBody,
  ): Promise<{ id: string, nickname: string }> {
    return await toPromise(
      pipe(
        this.createPlayerUseCase.execute(body),
        taskEither.map(player => ({ id: player.id, nickname: player.nickname })),
      ),
    );
  }

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
        name: {
          type: "string",
          example: "game1",
        },
        playerColors: {
          type: "object",
        },
        players: {
          type: "array",
        },
        startedAt: {
          type: "date",
        },
      },
    },
  })
  async getGameByName (
    @Param() params: { name: string },
  ): Promise<ExternalGame> {
    return toPromise(
      pipe(
        this.getGameByNameUseCase.execute({ name: params.name }),
        taskEither.bindTo("game"),
        taskEither.bind("currentRound",
          ({ game }) => this.getGameCurrentRoundUseCase.execute({ gameId: game.id }),
        ),
        taskEither.map(({ game, currentRound }) => fromDomainToRest(game, currentRound)),
      ),
    );
  }

  @Patch("color")
  @ApiBody({
    type: class ContextInput { playerId!: string; gameId!: string; },
    description: "dz",
    required: true,
  })
  @ApiOkResponse({
    isArray: false,
    schema: {
      type: "object",
      required: ["valid"],
      properties: {
        valid: {
          type: "boolean",
          example: "true",
          description: "returns true if the color has correctly been registered for this player",
        },
      },
    },
  })
  async selectColor (@Body() input: SelectColorPayload): Promise<{ valid: boolean }> {
    return toPromise(
      this.playerSelectsColorUseCase.execute(input),
    );
  }

  @Post("join")
  @HttpCode(200)
  @ApiBody({
    type: class ContextInput { playerId!: string; gameId!: string; },
    required: true,
  })
  @ApiOkResponse({
    description: "Join a game",
    schema: {},
  })
  async joinGame (
    @Body() input: Context,
  ): Promise<void> {
    function mapToPort (input: Context): PlayerJoinsGamePort {
      return {
        playerId: input.playerId,
        targetedGameId: input.gameId,
      };
    }

    return toPromise(
      pipe(
        this.playerJoinsGameUseCase.execute(mapToPort(input)),
        taskEither.map(constVoid),
      ),
    );
  }

  @Post("leave")
  @HttpCode(200)
  @ApiBody({
    type: class ContextInput { playerId!: string; gameId!: string; },
    required: true,
  })
  async leaveGame (
    @Body() input: Context,
  ): Promise<void> {
    function mapToPort (input: Context): PlayerLeavesGamePort {
      return {
        playerId: input.playerId,
        gameId: input.gameId,
      };
    }

    return toPromise(
      pipe(
        this.playerLeavesGameUseCase.execute(mapToPort(input)),
        taskEither.map(constVoid),
      ),
    );
  }

  @Post("start")
  @ApiBody({
    type: class ContextInput { playerId!: string; gameId!: string; },
    required: true,
  })
  async startGame (
    @Body() context: Context,
  ): Promise<void> {
    return toPromise(
      pipe(
        this.adminStartsGameUseCase.execute(context),
        taskEither.map(constVoid),
      ),
    );
  }

  @Get("/:name/end")
  @ApiBody({
    type: class ContextInput { playerId!: string; gameId!: string; },
    required: true,
  })
  async getEndStats (input: Context): Promise<{}> {
    return toPromise(
      this.getEndStatsUseCase.execute({ gameId: input.gameId }),
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
