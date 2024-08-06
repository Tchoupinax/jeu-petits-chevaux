import axios from 'axios';
import { ExternalRound } from "../../backend/src/presentation/types/external-round"
import type { TrayCase } from "../../backend/src/domain/value-objects/tray-case"
import type { PawnName } from "../../backend/src/domain/value-objects/pawn-name"
import type { Pawn } from '../app/domain/entities/pawn';
import { Option } from "@swan-io/boxed";
import type { Color } from "../../backend/src/domain/value-objects/color";
import { ExternalPawn } from "../../backend/src/presentation/types/external-pawn"

import * as SDK from "../sdk/backend";

export type commitMovePayload = {
  pawnName: PawnName;
  pawnStartingCase: TrayCase;
  pawnEndingCase: TrayCase;
  roundId: string
};

export class Rest {
  private playerId: string | null;
  private gameId: string | null;

  constructor (
    private readonly baseUrl: string,
    playerId?: string,
    gameId?: string
  ) {
    this.playerId = playerId ?? null;
    this.gameId = gameId ?? null;
  }

  getGameId(): string {
    return this.gameId!;
  }

  getPlayerId() : string {
    return this.playerId!
  }

  async registerPlayer(
    nickname: string
  ): Promise<SDK.operations["PlayerController_registerPlayer"]["responses"]["200"]["content"]["application/json"]> {
    return axios({
      url: `${this.baseUrl}/players/register`,
      method: "POST",
      data: {
        nickname
      }
    })
      .then(({ data }) => {
        this.playerId = data.playerId;

        return data;
      });
  }

  async createGame(
    name: string
  ): Promise<SDK.operations["GameController_createGame"]["responses"]["200"]["content"]["application/json"]> {
    return axios({
      url: `${this.baseUrl}/games`,
      method: "POST",
      data: {
        name: name,
        playerId: this.playerId
      },
    })
      .then(({ data }) => data)
  }
  
  async deleteRoom(
    name: string
  ): Promise<SDK.operations["RoomController_deleteRoom"]["responses"]["200"]> {
    return axios({
      url: `${this.baseUrl}/rooms`,
      method: "DELETE",
      data: {
        name: name,
        playerId: this.playerId
      },
    })
      .then(({ data }) => data)
  }

  async getGameByName(roomName: string): Promise<SDK.operations["GameController_getGameByName"]["responses"]["200"]["content"]["application/json"]> {
    return axios({
      url: `${this.baseUrl}/games/${roomName}`,
    })
      .then(({ data }) => data)
  }

  async listGames(): Promise<SDK.operations["GameController_listGames"]["responses"]["200"][""]> {
    return axios({
      url: `${this.baseUrl}/games`,
    })
      .then(({ data }) => data)
  }

  async joinGame(gameId: string): Promise<SDK.operations["GameController_joinGame"]["responses"]["200"]["content"]["application/json"]> {
    return axios({
      url: `${this.baseUrl}/games/join`,
      method: "POST",
      data: {
        gameId,
        playerId: this.playerId
      }
    })
      .then(({ data }) => data)
  }

  async leaveRoom(gameId: string): Promise<void> {
    await axios({
      url: `${this.baseUrl}/games/leave`,
      method: "POST",
      data: {
        gameId,
        playerId: this.playerId
      }
    })
      .then(({ data }) => data)
  }

  async playerRoolsADice(
    roundId: string,
  ): Promise<ExternalRound> {
    return axios({
      url: `${this.baseUrl}/rounds/launch-dice`,
      method: "POST",
      data: {
        "playerId": this.playerId,
        "gameId": this.gameId,
        "roundId": roundId,
      }
    })
      .then(({ data }) => data);
  }

  async playerCommitsMove(
    payload: commitMovePayload
  ): Promise<ExternalRound> {
    return axios({
      url: `${this.baseUrl}/rounds/player-commits-move`,
      method: "POST",
      data: {
        "playerId": this.playerId,
        "gameId": this.gameId,
        "pawnName": payload.pawnName,
        "pawnEndingCase": payload.pawnEndingCase,
        "pawnStartingCase": payload.pawnStartingCase,
        "roundId": payload.roundId
      }
    })
      .then(({ data }) => data);
  }

  async returnPawnOnCase(
    x: number,
    y: number
  ): Promise<Option<Pawn>> {
    const receivedOption = await axios({
      url: `${this.baseUrl}/pawns/on-case`,
      method: "POST",
      data: {
        playerId: this.playerId,
        gameId: this.gameId,
        x,
        y
      }
    })
      .then(({ data }) => data);

    if (receivedOption._tag === 'None') {
      return Option.None();
    }

    return Option.Some(receivedOption.value);
  }

  async sendMessage(
    data: { message: string, type: string, gameId: string }
  ): Promise<any> {
    return axios({
      url: `${this.baseUrl}/messages`,
      method: "POST",
      data: {
        ...data,
        gameId: this.gameId,
        playerId: this.playerId,
      }
    })
      .then(({ data }) => data);
  }

  async chooseColor(
    color: Color
  ): Promise<SDK.operations["GameController_selectColor"]["responses"]["200"]["content"]["application/json"]> {
    return axios({
      url: `${this.baseUrl}/games/color`,
      method: "PATCH",
      data: {
        color,
        playerId: this.playerId,
        gameId: this.gameId
      },
    })
      .then(({ data }) => data)
  }

  async startTheGame() {
    return axios({
      url: `${this.baseUrl}/games/start`,
      method: "POST",
      data: { 
        playerId: this.playerId,
        gameId: this.gameId,
      }
    })
      .then(({ data }) => data)
  }

  async getPlayerByName(name: string) {
    return axios({
      url: `${this.baseUrl}/players/${name}`,
      method: "GET",
    })
    .then(({ data }) => data)
  }

  async whatCanIPlay(roundId: string) {
    const data = {
      roundId,
      gameId: this.gameId,
      playerId: this.playerId,
    }

    return axios({
      url: `${this.baseUrl}/rounds/what-can-i-play`,
      method: "POST",
      data
    })
    .then(({ data }) => data)
  }

  async getPawnByName(
    name: PawnName
  ): Promise<Option<ExternalPawn>> {
    const receivedOption = await axios({
      url: `${this.baseUrl}/pawns/${name}`,
      method: "POST",
      data: {
        playerId: this.playerId,
        gameId: this.gameId,
      }
    })
      .then(({ data }) => data);

    if (receivedOption._tag === 'None') {
      return Option.None();
    }

    return Option.Some(receivedOption.value);
  }

  async getEndStats(
    gameName: string
  ): Promise<{}> {
    return axios({
      url: `${this.baseUrl}/games/${gameName}/end`,
      method: "GET",
    })
      .then(({ data }) => data);
  }
}
