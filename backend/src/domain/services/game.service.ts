import { Inject, Injectable, Logger } from "@nestjs/common";
import { array, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";

import { ROUND_REPOSITORY } from "../../common/constants";
import { TechnicalError } from "../../infrastructure/errors/technical.errors";
import { GameId } from "../entities/game";
import { PlayerId } from "../entities/player";
import { Round } from "../entities/round";
import { RoundRepository } from "../gateways/round.repository";

@Injectable()
export class GameService {
  constructor (
    @Inject(ROUND_REPOSITORY)
    private roundRepository: RoundRepository,
    private logger: Logger,
  ) {}

  isPlayerAllowedToPlay (
    gameId: GameId,
    playerId: PlayerId,
  ): TaskEither<TechnicalError, boolean> {
    this.logger.debug("GameService.isPlayerAllowedToPlay");

    return pipe(
      this.findCurrentRound(gameId),
      taskEither.chain(
        option.fold(
          () => taskEither.right(false),
          round => taskEither.right(round.playerId === playerId),
        ),
      ),
    );
  }

  findCurrentRound (
    gameId: GameId,
  ): TaskEither<TechnicalError, Option<Round>> {
    this.logger.debug("GameService.findCurrentRound");

    return pipe(
      this.roundRepository.findAllByGameId(gameId),
      taskEither.map(array.filter(round => round.status !== "Finished")),
      taskEither.map(array.head),
    );
  }
}
