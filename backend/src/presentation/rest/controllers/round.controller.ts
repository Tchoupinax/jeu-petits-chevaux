import { Body, Controller, Post, UseFilters } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { Logger } from "nestjs-pino";
import { PawnName } from "src/domain/value-objects/pawn-name";
import { TrayCase } from "src/domain/value-objects/tray-case";

import { GameId } from "../../../domain/entities/game";
import { PawnCase } from "../../../domain/entities/pawn";
import { PlayerId } from "../../../domain/entities/player";
import { RoundId } from "../../../domain/entities/round";
import { DetermineWhatPlayerCanDoUseCase } from "../../../domain/use-cases/determine-what-player-can-do/determine-what-player-can-do.use-case";
import {
  PlayerCommitsMovePort,
  PlayerCommitsMoveUseCase,
} from "../../../domain/use-cases/player-commits-move/player-commits-move.use-case";
import {
  PlayerRoolsADiceUseCase,
} from "../../../domain/use-cases/player-rolls-a-dice/player-rools-a-dice.use-case.use-case";
import { toPromise } from "../../../utils/to-promise";
import { ExternalRound } from "../../types/external-round";
import { PlayerCommitsMoveInput } from "../../validators/player-commits-move.validator";
import { PlayerRoolsADiceInput, zPlayerRoolsADice } from "../../validators/player-rools-a-dice.validator";
import { WhatCanIPlayInput } from "../../validators/what-can-i-play.validator";
import { AllExceptionsFilter } from "../mapper/exception.mapper";
import { roundFromDomainToRest } from "../mapper/round.mapper";

@Controller("rounds")
@ApiTags("rounds")
export class RoundController {
  constructor (
    private playerRoolsADiceUseCase: PlayerRoolsADiceUseCase,
    private playerCommitsMove: PlayerCommitsMoveUseCase,
    private determineWhatPlayerCanDoUseCase: DetermineWhatPlayerCanDoUseCase,
    private logger: Logger,
  ) { }

  @Post("/launch-dice")
  @UseFilters(AllExceptionsFilter)
  @ApiResponse({
    status: 200,
    description: "The round created following the launch of the dice",
    type: ExternalRound,
  })
  async launchDice (
    @Body() input: PlayerRoolsADiceInput,
  ): Promise<ExternalRound> {
    this.logger.debug({ input }, "POST /launch-dice");

    try {
      zPlayerRoolsADice.parse(input);
    } catch (err) {
      this.logger.error(err);
      throw err;
    }

    return toPromise(
      pipe(
        this.playerRoolsADiceUseCase.execute({
          playerId: input.playerId as PlayerId,
          gameId: input.gameId as GameId,
          roundId: input.roundId as RoundId,
        }),
        taskEither.chain(round => taskEither.of(roundFromDomainToRest(round))),
      ),
    );
  }

  @Post("/what-can-i-play")
  @UseFilters(AllExceptionsFilter)
  @ApiBody({
    type: class ContextInput { playerId!: string; roundId!: string; gameId!: string; },
    required: true,
  })
  @ApiResponse({
    status: 200,
  })
  async whatCanIPlay (
    @Body() input: WhatCanIPlayInput,
  ): Promise<{
    canPlayAnotherRound: boolean;
    canPutPawnOutside: boolean;
    movablePawns: Array<{ destination: PawnCase, name: string, source: PawnCase }>;
  }> {
    this.logger.error({ input }, "POST /what-can-i-play");

    return toPromise(
      this.determineWhatPlayerCanDoUseCase.execute({
        gameId: input.gameId as GameId,
        playerId: input.playerId as PlayerId,
        roundId: input.roundId as RoundId,
      }),
    );
  }

  @Post("/player-commits-move")
  @UseFilters(AllExceptionsFilter)
  commitMove (@Body() input: PlayerCommitsMoveInput): Promise<ExternalRound> {
    this.logger.debug({ input }, "POST /player-commits-move");

    function mapToPort (input: PlayerCommitsMoveInput): PlayerCommitsMovePort {
      return {
        playerId: input.playerId as PlayerId,
        roundId: input.roundId as RoundId,
        pawnName: input.pawnName as PawnName,
        pawnEndingCase: input.pawnEndingCase as TrayCase,
        pawnStartingCase: input.pawnStartingCase as TrayCase,
        gameId: input.gameId as GameId,
      };
    }

    return toPromise(
      pipe(
        this.playerCommitsMove.execute(mapToPort(input)),
        taskEither.map(roundFromDomainToRest),
      ),
    );
  }
}
