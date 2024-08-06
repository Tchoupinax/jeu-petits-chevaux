import { Inject, Logger } from "@nestjs/common";
import { boolean, option, taskEither } from "fp-ts";
import { pipe } from "fp-ts/function";
import { TaskEither } from "fp-ts/lib/TaskEither";
import { Option } from "fp-ts/Option";

import { GAME_REPOSITORY } from "../../../common/constants";
import { TechnicalError } from "../../../infrastructure/errors/technical.errors";
import { SelectColorPayload } from "../../../presentation/validators/game/select-color.validator";
import { GamePlayersColors } from "../../entities/game";
import { PlayerColorAlreadyTakenError } from "../../errors/player-color-already-taken.error";
import { GameRepository } from "../../gateways/game.repository";
import { EventService } from "../../services/event.service";
import { Color } from "../../value-objects/color";

export type PlayerSelectsColorPort = SelectColorPayload;
export type PlayerSelectsColorErrors = TechnicalError | PlayerColorAlreadyTakenError;

export class PlayerSelectsColorUseCase {
  constructor (
    @Inject(GAME_REPOSITORY)
    private gameRepository: GameRepository,
    private eventService: EventService,
    private logger: Logger,
  ) { }

  execute (port: PlayerSelectsColorPort): TaskEither<PlayerSelectsColorErrors, { valid: boolean }> {
    this.logger.debug(port, "PlayerSelectsColorUseCase");

    return pipe(
      taskEither.Do,
      taskEither.bind("maybeCurrentPlayerColors", () => this.gameRepository.getPlayersColors(port.gameId)),

      taskEither.bind(
        "isColorAlreadyUsed",
        ({ maybeCurrentPlayerColors }) => this.isColorAlreadyUsed(
          port.color as Color, port.playerId, maybeCurrentPlayerColors,
        ),
      ),

      taskEither.chain(
        ({ maybeCurrentPlayerColors, isColorAlreadyUsed }) => pipe(
          isColorAlreadyUsed,
          boolean.fold(
            () => this.updatePlayersColors(maybeCurrentPlayerColors, port.color as Color, port.playerId, port.gameId),
            () => taskEither.left(new PlayerColorAlreadyTakenError(port.color as Color)),
          ),
        ),
      ),
      taskEither.chain(() => this.eventService.broadcast({
        type: "player-color-selection",
        data: { playerId: port.playerId, color: port.color as Color },
      })),
      taskEither.map(() => ({ valid: true })),
    );
  }

  private isColorAlreadyUsed (
    color: Color,
    playerId: string,
    playersColors: Option<GamePlayersColors>,
  ): TaskEither<TechnicalError, boolean> {
    return pipe(
      playersColors,
      option.fold(
        () => taskEither.right(false),
        (playersColors) => pipe(
          playersColors,
          (playersColors) => playersColors.find(config => config.color === color),
          option.fromNullable,
          option.fold(
            () => taskEither.right(false),
            (config) => taskEither.right(config.playerId !== playerId),
          ),
        ),
      ),
    );
  }

  private updatePlayersColors (
    maybeCurrentPlayerColors: Option<GamePlayersColors>,
    incomingColor: Color,
    playerId: string,
    gameId: string,
  ): TaskEither<PlayerSelectsColorErrors, void> {
    return pipe(
      maybeCurrentPlayerColors,
      option.fold(
        () => [{ color: incomingColor, playerId }],
        (currentPlayerColors) => {
          const index = currentPlayerColors.findIndex(c => c.playerId === playerId);

          if (index >= 0) {
            currentPlayerColors[index].color = incomingColor;
            return currentPlayerColors;
          } else {
            return [...currentPlayerColors, { color: incomingColor, playerId }];
          }
        },
      ),
      (playerColors) => this.gameRepository.updatePlayersColors(gameId, playerColors),
    );
  }
}
