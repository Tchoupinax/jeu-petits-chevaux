import { Module } from "@nestjs/common";

import { InfrastructureModule } from "../infrastructure/infrastructure.module";
import { EventService } from "./services/event.service";
import { GameService } from "./services/game.service";
import { AdminStartsGameUseCase } from "./use-cases/admin-starts-games/admin-starts-game.use-case";
import { CreateGameUseCase } from "./use-cases/create-game/create-game.use-case";
import { CreatePlayerUseCase } from "./use-cases/create-player/create-player.use-case";
import { DeleteGameUseCase } from "./use-cases/delete-game/delete-game.use-case";
import { DetermineWhatPlayerCanDoUseCase } from "./use-cases/determine-what-player-can-do/determine-what-player-can-do.use-case";
import { GetEndStatsUseCase } from "./use-cases/get-end-stats/get-end-stats.use-case";
import { GetGameByNameUseCase } from "./use-cases/get-game-by-name/get-game-by-name.use-case";
import { GetGameCurrentRoundUseCase } from "./use-cases/get-game-current-round/get-game-current-round.use-case";
import { GetPlayerByNameUseCase } from "./use-cases/get-player-by-name/get-player-by-name.use-case";
import { ListGamesUseCase } from "./use-cases/list-games/list-games.use-case";
import { ListPawnsCoordinatesUseCase } from "./use-cases/list-pawns-coordinates/list-pawns-coordinates.use-case";
import { PlayerCommitsMoveUseCase } from "./use-cases/player-commits-move/player-commits-move.use-case";
import { PlayerJoinsGameUseCase } from "./use-cases/player-joins-game/player-joins-game.use-case";
import { PlayerLeavesGameUseCase } from "./use-cases/player-leaves-game/player-leaves-game.use-case";
import { PlayerRoolsADiceUseCase } from "./use-cases/player-rolls-a-dice/player-rools-a-dice.use-case.use-case";
import { PlayerSelectsColorUseCase } from "./use-cases/player-selects-color/player-selects-color.use-case";

const useCases = [
  AdminStartsGameUseCase,
  CreateGameUseCase,
  CreatePlayerUseCase,
  DeleteGameUseCase,
  DetermineWhatPlayerCanDoUseCase,
  GetEndStatsUseCase,
  GetGameByNameUseCase,
  GetGameCurrentRoundUseCase,
  GetPlayerByNameUseCase,
  ListGamesUseCase,
  ListPawnsCoordinatesUseCase,
  PlayerCommitsMoveUseCase,
  PlayerJoinsGameUseCase,
  PlayerLeavesGameUseCase,
  PlayerRoolsADiceUseCase,
  PlayerSelectsColorUseCase,
];

@Module({
  imports: [
    InfrastructureModule,
  ],
  controllers: [],
  providers: [
    GameService,
    EventService,
    ...useCases,
  ],
  exports: [
    GameService,
    EventService,
    ...useCases,
  ],
})
export class DomainModule { }
