import { TaskEither } from "fp-ts/lib/TaskEither";
import { TechnicalError } from "src/infrastructure/errors/technical.errors";

import { Context } from "../../common/context";
import { GameId } from "../entities/game";
import { Pawn, PawnCase } from "../entities/pawn";

export type PawnRepository = {
  createPosition(pawn: Pawn): TaskEither<TechnicalError, Pawn>;
  findAllByTraycase(traycase: PawnCase): TaskEither<TechnicalError, Array<Pawn>>;
  getByName(pawnName: Pawn["name"], gameId: GameId): TaskEither<TechnicalError, Pawn>;
  listCurrentPositions(gameId: GameId): TaskEither<TechnicalError, Array<Pawn>>,
  listCurrentPositionsByPlayerId(Context: Context): TaskEither<TechnicalError, Array<Pawn>>,
  update(pawn: Pawn): TaskEither<TechnicalError, Pawn>;
}
