import { Args, Query, Resolver } from "@nestjs/graphql";
import { array, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";

import { GameId } from "../../../domain/entities/game";
import { ListPawnsCoordinatesUseCase } from "../../../domain/use-cases/list-pawns-coordinates/list-pawns-coordinates.use-case";
import { toPromise } from "../../../utils/to-promise";
import { ContextInput } from "../../common/context-input";
import { ContextInputGQL } from "../inputs/context.input.gql";
import { fromDomainToGQL } from "../mappers/pawn.mapper.gql";
import { PawnGQL } from "../types/pawn.gql";

@Resolver()
export class PawnResolvers {
  constructor (
    private listPawnsCoordinatesUseCase: ListPawnsCoordinatesUseCase,
  ) { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
  @Query(returns => [PawnGQL])
  async listPawns (
    @Args("context", { type: () => ContextInputGQL, description: "default context" }) input: ContextInput,
  ): Promise<Array<PawnGQL>> {
    return toPromise(
      pipe(
        this.listPawnsCoordinatesUseCase.execute(input.gameId as GameId),
        taskEither.map(array.map(fromDomainToGQL)),
      ),
    );
  }
}
