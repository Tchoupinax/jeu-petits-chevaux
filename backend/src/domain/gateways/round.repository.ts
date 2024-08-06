import { TaskEither } from "fp-ts/lib/TaskEither";
import { TechnicalError } from "src/infrastructure/errors/technical.errors";

import { GameId } from "../entities/game";
import { PlayerId } from "../entities/player";
import { Round, RoundId } from "../entities/round";
import { RoundNotFoundError } from "../errors/tour-not-found.error";
import { PawnName } from "../value-objects/pawn-name";
import { TrayCase } from "../value-objects/tray-case";

export type RoundRepository = {
  create(round: Round): TaskEither<TechnicalError, Round>;
  findAllByGameId(gameId: GameId): TaskEither<TechnicalError, Array<Round>>;
  getById(roundId: RoundId): TaskEither<TechnicalError | RoundNotFoundError, Round>;
  persistDiceLaunch(data: {
    gameId: string,
    launchedAt: Date,
    playerId: PlayerId,
    random: number
  }): TaskEither<TechnicalError, Round>;
  persistMove(data: {
    pawnEndingCase: TrayCase;
    pawnName: PawnName;
    pawnStartingCase: TrayCase;
    playerId: string;
    roundId: string;
  }): TaskEither<TechnicalError, Round>;
  update(round: Partial<Round>): TaskEither<TechnicalError, Round>;
}
