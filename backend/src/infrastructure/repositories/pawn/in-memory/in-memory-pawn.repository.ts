import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { Option } from "fp-ts/lib/Option";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { Context } from "../../../../common/context";
import { GameId } from "../../../../domain/entities/game";
import { Pawn } from "../../../../domain/entities/pawn";
import { PawnRepository } from "../../../../domain/gateways/pawn.repository";
import { PawnName } from "../../../../domain/value-objects/pawn-name";
import { TrayCase } from "../../../../domain/value-objects/tray-case";
import { InMemory } from "../../../../utils/in-memory";
import { TechnicalError } from "../../../errors/technical.errors";

export class InMemoryPawnRepository extends InMemory<Pawn> implements PawnRepository {
  constructor (pawns: Array<Pawn> = []) {
    super(pawns);
  }

  findAllByTraycase (
    traycase: TrayCase,
  ): taskEither.TaskEither<TechnicalError, Pawn[]> {
    return pipe(
      this.entities.filter(pawn => pawn.position === traycase),
      taskEither.right,
    );
  }

  getByTraycase (
    traycase: TrayCase,
  ): taskEither.TaskEither<TechnicalError, Option<Pawn>> {
    return pipe(
      this.entities.find(pawn => pawn.position === traycase),
      option.fromNullable,
      taskEither.right,
    );
  }

  getByName (
    pawnName: PawnName,
    gameId: GameId,
  ): taskEither.TaskEither<TechnicalError, Pawn> {
    const index = this.entities.findIndex(
      pawn => pawn.name === pawnName && pawn.gameId === gameId,
    );

    if (index === -1) {
      return taskEither.left(new TechnicalError(new Error(`Pawn ${pawnName} was not found`)));
    }

    return taskEither.right(this.entities[index]);
  }

  createPosition (pawn: Pawn): TaskEither<TechnicalError, Pawn> {
    this.entities.push(pawn);

    return taskEither.right(pawn);
  }

  listCurrentPositions (gameId: string): taskEither.TaskEither<TechnicalError, Pawn[]> {
    return pipe(
      this.entities,
      array.filter(pawn => pawn.gameId === gameId),
      taskEither.right,
    );
  }

  listCurrentPositionsByPlayerId (context: Context): taskEither.TaskEither<TechnicalError, Pawn[]> {
    return pipe(
      this.entities,
      array.filter(pawn => pawn.playerId === context.playerId),
      array.filter(pawn => pawn.gameId === context.gameId),
      taskEither.right,
    );
  }
}
