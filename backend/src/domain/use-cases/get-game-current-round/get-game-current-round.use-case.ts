import { Inject, Logger } from "@nestjs/common";
import { array, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";

import { ROUND_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { GameId } from "../../entities/game";
import { Round } from "../../entities/round";
import { RoundRepository } from "../../gateways/round.repository";

export type GetGameCurrentRoundPort = {
  gameId: GameId;
}

export class GetGameCurrentRoundUseCase {
  constructor (
    @Inject(ROUND_REPOSITORY)
    private roundRepository: RoundRepository,
    private logger: Logger,
  ) { }

  execute (
    port: GetGameCurrentRoundPort,
  ): TaskEither<TechnicalError, Option<Round>> {
    this.logger.debug({ port }, "GetGameCurrentRoundUseCase");

    return pipe(
      this.roundRepository.findAllByGameId(port.gameId),
      taskEither.map(array.filter(round => round.status !== "Finished")),
      taskEither.map(array.head),
    );
  }
}
