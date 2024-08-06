import { Inject, Logger } from "@nestjs/common";
import { option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { PLAYER_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { generatePlayer, Player } from "../../entities/player";
import { PlayerAlreadyExistsError } from "../../errors/player-already-exists.error";
import { PlayerRepository } from "../../gateways/player.repository";

export type CreatePlayerPort = {
  nickname: string;
}

export class CreatePlayerUseCase {
  constructor (
    @Inject(PLAYER_REPOSITORY)
    private playerRepository: PlayerRepository,
    private logger: Logger,
  ) { }

  execute (
    port: CreatePlayerPort,
  ): TaskEither<TechnicalError | PlayerAlreadyExistsError, Player> {
    this.logger.debug({ port }, "CreatePlayerUseCase");

    return pipe(
      this.playerRepository.findOneByNickname(port.nickname),
      taskEither.chain(option.fold(
        () => pipe(
          generatePlayer({ nickname: port.nickname }),
          player => this.playerRepository.create(player),
          taskEither.orElse(() => this.playerRepository.getOneByNickname(port.nickname)),
        ),
        player => taskEither.right(player),
      )),
    );
  }
}
