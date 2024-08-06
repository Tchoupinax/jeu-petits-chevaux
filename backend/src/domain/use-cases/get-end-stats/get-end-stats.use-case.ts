import { Inject } from "@nestjs/common";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Logger } from "nestjs-pino";

import { ROUND_REPOSITORY } from "../../../common/constants";
import { GameId } from "../../entities/game";
import { RoundRepository } from "../../gateways/round.repository";

export type GetEndStatsPort = {
  gameId: GameId
}
export type GetEndStatsErrors = {}
export type GetEndStatsResult = {
  roundCount: number
}

export class GetEndStatsUseCase {
  constructor (
    private logger: Logger,
    @Inject(ROUND_REPOSITORY)
    private readonly roundRepository: RoundRepository,
  ) {}

  execute (
    port: GetEndStatsPort,
  ): TaskEither<GetEndStatsErrors, GetEndStatsResult> {
    this.logger.error("DetermineWhatPlayerCanDoUseCase", { port });

    return pipe(
      this.roundRepository.findAllByGameId(port.gameId),
      taskEither.map(rounds => rounds.length),
      taskEither.bindTo("roundCount"),
      taskEither.map(({ roundCount }) => ({
        roundCount,
      })),
    );
  }
}
