import { Inject, Logger } from "@nestjs/common";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Pawn } from "src/domain/entities/pawn";
import { TechnicalError } from "src/infrastructure/errors/technical.errors";
import { ValidationError } from "src/infrastructure/errors/validation.error";

import { PAWN_REPOSITORY } from "../../../common/constants";
import { GameId } from "../../entities/game";
import { PawnRepository } from "../../gateways/pawn.repository";

export class ListPawnsCoordinatesUseCase {
  constructor (
    @Inject(PAWN_REPOSITORY)
    private pawnRepository: PawnRepository,
    private logger: Logger,
  ) { }

  execute (
    gameId: GameId,
  ): TaskEither<TechnicalError | ValidationError, Array<Pawn>> {
    // this.logger.debug("ListPawnsCoordinatesUseCase", { gameId });
    return this.pawnRepository.listCurrentPositions(gameId as GameId);
  }
}
