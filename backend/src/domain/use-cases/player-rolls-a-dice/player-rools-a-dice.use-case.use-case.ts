import { Inject } from "@nestjs/common";
import { boolean, option, taskEither } from "fp-ts";
import { constVoid, pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";

import { ROUND_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { GameId } from "../../entities/game";
import { PlayerId } from "../../entities/player";
import { Round, RoundId } from "../../entities/round";
import { NotYourTurnError } from "../../errors/not-your-turn.error";
import { RoundNotFoundError } from "../../errors/tour-not-found.error";
import { RoundRepository } from "../../gateways/round.repository";
import { EventService } from "../../services/event.service";

export type PlayerRoolsADicePort = { gameId: GameId, playerId: PlayerId, roundId: RoundId }
export class PlayerRoolsADiceUseCase {
  constructor (
    @Inject(ROUND_REPOSITORY)
    private roundRepository: RoundRepository,
    private eventService: EventService,
  ) { }

  execute (
    port: PlayerRoolsADicePort,
  ): TaskEither<NotYourTurnError | TechnicalError, Round> {
    return pipe(
      this.checkIfRoundExists(port.roundId),
      taskEither.bindTo("round"),
      taskEither.bind("diceScore", () => taskEither.of(this.getRandomIntInclusive(1, 6))),
      taskEither.chainFirstW(({ round }) => pipe(
        round.playerId === port.playerId,
        boolean.fold(
          () => taskEither.left(new NotYourTurnError()),
          () => taskEither.right(constVoid()),
        ),
      )),
      taskEither.chainW(({ round, diceScore }) => this.updateRound(round, diceScore)),
      taskEither.chainFirstW(round => this.eventService.broadcast({ data: round, type: "dice-launched" })),
    );
  }

  private checkIfRoundExists (
    roundId: RoundId,
  ): TaskEither<TechnicalError | RoundNotFoundError, Round> {
    return this.roundRepository.getById(roundId);
  }

  private updateRound (
    round: Round,
    diceScore: number,
  ) : TaskEither<TechnicalError, Round> {
    return pipe(
      this.roundRepository.getById(round.id),
      taskEither.chain(round => this.roundRepository.update({
        ...round,
        status: "WaitingMove",
        diceScore: option.some(diceScore),
        diceLaunchedAt: option.some(new Date()),
      })),
    );
  }

  private getRandomIntInclusive (min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
