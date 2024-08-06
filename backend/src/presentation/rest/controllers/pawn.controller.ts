import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { Option } from "fp-ts/Option";

import { GameId } from "../../../domain/entities/game";
import { ListPawnsCoordinatesUseCase } from "../../../domain/use-cases/list-pawns-coordinates/list-pawns-coordinates.use-case";
import { toPromise } from "../../../utils/to-promise";
import { ContextInput } from "../../common/context-input";
import { ExternalPawn } from "../../types/external-pawn";
import { GetPawnOnCaseInput } from "../../validators/get-pawn-on-case.validator";
import { fromDomainToRest } from "../mapper/pawn.mapper";

@Controller("pawns")
@ApiTags("pawns")
export class PawnController {
  constructor (
    private listPawnsCoordinatesUseCase: ListPawnsCoordinatesUseCase,
  ) { }

  @Get()
  @ApiResponse({
    status: 200,
    description: "The round created following the launch of the dice",
    type: ExternalPawn,
  })
  async listPawns (
    @Body() context: ContextInput,
  ): Promise<Array<ExternalPawn>> {
    return toPromise(
      pipe(
        this.listPawnsCoordinatesUseCase.execute(context.gameId as GameId),
        taskEither.map(array.map(fromDomainToRest)),
      ),
    );
  }

  @Post("/on-case")
  async getPawnOnCoordinatesXY (
    @Body() input: GetPawnOnCaseInput,
  ): Promise<Option<ExternalPawn>> {
    return toPromise(
      pipe(
        this.listPawnsCoordinatesUseCase.execute(input.gameId as GameId),
        taskEither.map(
          (pawns) => {
            const pawn = pawns.find(p => p.position === `${input.x}xx${input.y}`);
            return option.fromNullable(pawn);
          },
        ),
      ),
    );
  }

  @Post("/:name")
  getPawnByName (
    @Param() params: { name: string },
    @Body() input: GetPawnOnCaseInput,
  ): Promise<Option<ExternalPawn>> {
    return toPromise(
      pipe(
        this.listPawnsCoordinatesUseCase.execute(input.gameId as GameId),
        taskEither.map(
          (pawns) => {
            const pawn = pawns.find(p => p.name === params.name);
            return option.fromNullable(pawn);
          },
        ),
      ),
    );
  }
}
