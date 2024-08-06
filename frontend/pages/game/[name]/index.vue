<template>
  <div>
    <div
      class="flex flex-row justify-between"
      :class="{
        'bg-green-100': player?.color ==='Green',
        'bg-red-100': player?.color === 'Red',
        'bg-blue-100': player?.color === 'Blue',
        'bg-yellow-100': player?.color === 'Yellow',
      }"
    >
      <modal v-if="showSelectColorModal" @close="showSelectColorModal = false">
        <template v-slot:body>
          <div class="w-full mt-16">
            <label v-if="!selectColorValidated" for="colors"
              class="text-4xl block mb-16 font-medium text-gray-900 dark:text-gray-400">
              Choose your color
            </label>

            <div v-for="participant of participants" :key="participant.id" class="flex">
              <div>- {{ participant.name }}</div>{{ participant.color === undefined ? ' (no color selected yet)' : participant.color }}
            </div>

            <select v-if="!selectColorValidated" v-model="selectedColor" id="colors"
              class="mt-16 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              <option value="Yellow">Yellow</option>
              <option value="Blue">Blue</option>
              <option value="Green">Green</option>
              <option value="Red">Red</option>
            </select>

            <button @click="chooseMyColor">
              {{ selectColorValidated ? "Change color" : 'Select' }}
            </button>

            <button
              class="absolute p-2 hover:shadow-inner rounded-lg text-xl font-bold border-4 border-black bottom-0 right-0 mr-16 mb-16"
              v-if="gameCanStart"
              @click="startTheGame"
            >
              START THE GAME
            </button>
          </div>
        </template>
      </modal>

      <Board
        class=""
        @diceLaunched="diceLaunched"
        @movePawn="(pawnName: PawnName) => updateDestinationTrayCase(pawnName)"
        :squares="squares"
        :possiblesActions="possiblesActions"
      />

      <div class="p-2 w-full flex flex-col items-center justify-between">
        <!-- Top block: title + dice -->
        <div class="flex flex-col justify-center items-center">
          <div
            class="text-3xl text-green-800 mb-4"
            v-if="isItMyTurn"
          >
            ✅ It's my turn!
          </div>
          <div
            class="text-3xl text-red-800 mb-4"
            v-else
          >
            Waiting for my turn...
          </div>

          <!-- BUTTON -->
          <div class="flex flex-col">
            <div class="flex items-center">
              <button
                v-if="isItMyTurn && currentRound && !currentRound.diceScore"
                class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
                @click="launchDice"
              >
                Launch dice
              </button>

              <Dice :value="currentRound?.diceScore" />
            </div>

            <button
              v-for="pawnName of possiblesActions.map(a => a.name).sort((a, b) => a > b ? 1 : -1)"
              class="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded"
              @click="updateDestinationTrayCase(pawnName as PawnName)"
            >
              Move {{ pawnName }}
            </button>
          </div>
        </div>

        <!-- Bottom block: participants + buttons -->
        <div class="flex flex-col justify-center items-center w-full">
          <PlayerTable :participants="participants" />
          <div class="flex m-4">
            <button
              class="flex items-center justify-center px-3 py-2 text-sm font-bold text-white bg-orange-500 border border-orange-700 rounded hover:bg-orange-700"
              @click="leaveRoom">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span class="ml-2">
                Leave the room
              </span>
            </button>

            <button v-if="isAdmin"
              class="flex items-center justify-center px-3 ml-4 py-2 text-sm font-bold text-white bg-red-500 border border-red-700 rounded hover:bg-red-700"
              @click="deleteRoom">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span class="ml-2">
                Delete the room
              </span>
            </button>
          </div>
        </div>
      </div>

      <beautiful-chat :participants="participants.filter(p => p.id !== playerId)" :title-image-url="titleImageUrl"
        :on-message-was-sent="onMessageWasSent" :message-list="messages" :new-messages-count="newMessagesCount"
        :is-open="isChatOpen" :close="closeChat" :open="openChat" :show-emoji="true" :show-file="true"
        :show-edition="true" :show-deletion="true" :deletion-confirmation="true"
        :show-typing-indicator="showTypingIndicator" :show-launcher="true" :show-close-button="true" :colors="colors"
        :always-scroll-to-bottom="alwaysScrollToBottom" :disable-user-list-toggle="false"
        :message-styling="messageStyling" @onType="handleOnType" @edit="editMessage" />
    </div>

    <div class="p-2">
      <div 
        v-for="log of logs.slice(0, 10)"
        :class="{
          'text-green-600': participants.find(p => p.id === log.playerId)?.color === 'Green',
          'text-blue-600': participants.find(p => p.id === log.playerId)?.color === 'Blue'
        }"
      >
        {{ participants.find(p => p.id === log.playerId)?.color }} {{ log.msg }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useGameStore } from "~/store/game";
import { useUserStore } from "~/store/user";

import { Socket } from '../../../services/socket';
import { Rest } from '../../../services/rest';
import { Option } from '@swan-io/boxed'

import { isCaseIsHouse } from "../../../functions/board/is-case-is-house";
import { isCaseIsPublicPath } from "../../../functions/board/is-case-is-public-path";
import { isCaseIsStair } from "../../../functions/board/is-case-is-stair";
import { getColorAccordingPosition } from "../../../functions/color-according-modulo";
import { computeClasses } from "../../../functions/compute-classes";
import { isCaseHasAPawnAbove } from "../../../functions/board/is-case-has-a-pawn-above";
import type { PawnCase } from "../../../../backend/src/domain/entities/pawn";
import type { Color } from "../../../../backend/src/domain/value-objects/color";
import type { PawnName } from "../../../../backend/src/domain/value-objects/pawn-name";
import type { TrayCase } from "../../../../backend/src/domain/value-objects/tray-case";
import type { ExternalRound } from "../../../../backend/src/presentation/types/external-round";
import type { Pawn } from "../../../app/domain/entities/pawn";


let socket: Socket;
let rest: Rest;

type State = {
  currentRound: ExternalRound | null;
  possiblesActions: Array<{ id: string, name: string, source: string, destination: string }>;
  gameCanStart: boolean;
  isChatOpen: boolean;
  messages: Array<any>;
  newMessagesCount: number;
  participants: Array<{ id: string, name: string, imageUrl: string, color?: Color }>;
  selectColorValidated: boolean;
  selectedCase: string;
  selectedColor: Color;
  showSelectColorModal: boolean;
  pawnName: string;
  squares: any;
  logs: Array<{ playerId: string, msg: string }>;
}

export default {
  data(): State {
    return {
      pawnName: "",
      currentRound: null,
      possiblesActions: [],
      selectedCase: null,
      logs: [],
      isChatOpen: false,
      newMessagesCount: 0,
      participants: [],
      messages: [],
      selectedColor: "Yellow",
      showSelectColorModal: false,
      selectColorValidated: false,
      gameCanStart: false,
      titleImageUrl: 'https://a.slack-edge.com/66f9/img/avatars-teams/ava_0001-34.png',
      showTypingIndicator: '', // when set to a value matching the participant.id it shows the typing indicator for the specific user
      colors: {
        header: {
          bg: '#4e8cff',
          text: '#ffffff',
        },
        launcher: {
          bg: '#4e8cff',
        },
        messageList: {
          bg: '#ffffff',
        },
        sentMessage: {
          bg: '#4e8cff',
          text: '#ffffff',
        },
        receivedMessage: {
          bg: '#eaeaea',
          text: '#222222',
        },
        userInput: {
          bg: '#f4f7f9',
          text: '#565867',
        },
      },
      alwaysScrollToBottom: false, // when set to true always scrolls the chat to the bottom when new events are in (new message, user starts typing...)
      messageStyling: true, // enables *bold* /emph/ _underline_ and such (more info at github.com/mattezza/msgdown)
      squares: Array(15)
        .fill(1)
        .map((_, indexX) => {
          return Array(15).fill(1).map((_, indexY) => {
            const color = getColorAccordingPosition(indexX, indexY);

            return {
              color,
              x: indexX,
              y: indexY,
              classes: computeClasses(color, indexX, indexY),
              isHouse: isCaseIsHouse(indexX, indexY),
              isPublicPath: isCaseIsPublicPath(indexX, indexY),
              isStair: isCaseIsStair(indexX, indexY),
              pawn: Option.None<Pawn>(),
            };
          });
        }),
    };
  },
  head() {
    let name = this.roomName;

    if (this.newMessagesCount > 0) {
      name = `${name} (${this.newMessagesCount} New messsage ! )`;
    }

    return {
      title: name,
    };
  },
  computed: {
    gameId(): string { return useGameStore().$state.id as string },
    isAdmin(): boolean { return useUserStore().$state.isAdmin },
    isItMyTurn(): boolean { return this.currentRound?.playerId === this.playerId },
    player() { return this.participants.find(p => p.id === useUserStore().$state.id) },
    playerId(): string | null { return useUserStore().$state.id },
    roomName(): string { return this.$route.params.name as string; },
  },
  async mounted() {
    const { public: { apiUrl } } = useRuntimeConfig();


    socket = new Socket(apiUrl);
    socket.init();

    rest = new Rest(
      apiUrl,
      localStorage.getItem('petits-chevaux.user.id') ?? undefined,
      localStorage.getItem('petits-chevaux.game.id') ?? undefined
    );

    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        this.squares[i][j].pawn = await isCaseHasAPawnAbove(rest, i, j);
      }
    }

    rest.getGameByName(this.roomName)
      .then(response => {
        if (!response.startedAt) {
          this.showSelectColorModal = true
        }

        this.syncParticipants(response);
        this.currentRound = {...response.currentRound };

        if (this.currentRound && this.currentRound.diceScore) {
          this.getMyRoundOpportunities(this.currentRound.roundId);
        }
      });

    socket.eventBus.on<{ playerId: string, color: Color }>('player-color-selection', ({ playerId, color }) => {
      const index = this.participants.findIndex(p => p.id === playerId);
      if (index >= 0) {
        this.participants[index].color = color;
      }
    })

    socket.eventBus.on<ExternalPlayer>('game-player-joined', (data) => {
      console.log('palayer', data)
      if (data.gameId === this.gameId) {
        this.syncParticipant(data);
      }
    });

    socket.eventBus.on<ExternalPlayer>('game-player-leaved', (player) => {
      this.removeParticipant(player.id);
    });

    socket.eventBus.on<ExternalRound>('game-starts', (round) => {
      this.showSelectColorModal = false;
      this.currentRound = round;
    });

    socket.eventBus.on<{ winnerPlayerNickname: string }>('game-finished', (data) => {
      (window as Window).location = `/game/dzadz/end?winner=${data.winnerPlayerNickname}`;
    });

    socket.eventBus.on<{
      data: {
        playerId: string,
        message: string,
        roomId: string,
        type: "text"
      }
    }>('message-broacast', (message) => {
      // If the author is me, i do not take care about the new message
      if (message.data.playerId === this.playerId) { return; }

      this.messages = [
        ...this.messages,
        { type: message.data.type, author: message.data. playerId, data: { text: message.data.message } },
      ];
      this.newMessagesCount++;
    });

    socket.eventBus.on<ExternalRound>('round-created', (round) => {
      setTimeout(() => {
        this.currentRound = round;
      }, 500)
    });

    socket.eventBus.on('dice-launched', this.diceLaunched);
    socket.eventBus.on('pawn-moved', this.movePawnOnBoard);
    socket.eventBus.on<PawnCase>('traycase-updated', async (trayCase) => {
      const [x, y] = trayCase.split('xx').map(v => parseInt(v, 10));
      this.squares[x][y].pawn = await isCaseHasAPawnAbove(rest, x, y)
    })

    function getRandomIntInclusive (min: number, max: number): number {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    const automaticPlay = false;

    // Automatic play
    if (automaticPlay) {
      setInterval(async () => {
        console.log(`Automatic play starts (it's my turn?: ${this.isItMyTurn})`)
        if (this.isItMyTurn && this.currentRound && !this.currentRound.diceScore) {
          console.log('=> dice launch')
          await this.launchDice()
        }

        if (this.isItMyTurn && this.possiblesActions.length > 0) {
          console.log('=> play (2)')
          this.updateDestinationTrayCase(this.possiblesActions.at(getRandomIntInclusive(0, this.possiblesActions.length))?.name as PawnName)
        }
      }, 500)
    }
  },
  methods: {
    deleteRoom() {
      rest.deleteRoom(this.roomName).then(() => {
        this.$router.push('/');
      });
    },
    leaveRoom() {
      rest.leaveRoom(this.gameId)
        .then(() => {
          useUserStore().setAdmin(false);
          useGameStore().leave();
        })
        .finally(() => {
          this.$router.push('/');
        })
    },
    async diceLaunched(round: { playerId: string, diceScore: { value: number } }) {
      this.$emit('dice-launched', {
        playerId: round.playerId,
        diceScore: round.diceScore.value
      });
      this.logs.unshift({ playerId: round.playerId, msg: `launched dice and got ${round.diceScore.value}!` });
    },
    async movePawnOnBoard(event: PawnMovedWebsocket) {
      const [oldX, oldY] = event.oldPawn.position!.split('xx').map(value => parseInt(value, 10));
      this.squares[oldX][oldY].pawn = await isCaseHasAPawnAbove(rest, oldX, oldY);

      const [x, y] = event.currentPawn.position!.split('xx').map(value => parseInt(value, 10));
      this.squares[x][y].pawn = await isCaseHasAPawnAbove(rest, x, y);

      this.logs.unshift({ playerId: event.currentPawn.playerId, msg: `moved its pawn [[${event.currentPawn.name}!]]` });
    },
    syncParticipants(game: ExternalGame) {
      if (game?.playersColors) {
        const checkCurrentPlayerColor = game.playersColors.find(z => z.playerId === this.playerId)?.color;

        if (checkCurrentPlayerColor) {
          this.selectColorValidated = true;
        }
      }

      function checkAllParticipantHaveSelectedTheirColor(game: ExternalGame): boolean {
        return true;
      }

      if (checkAllParticipantHaveSelectedTheirColor(game) && this.isAdmin) {
        this.gameCanStart = true;
      }

      this.participants.push(
        ...game.players.map((player: any) => ({
          id: player.id,
          name: player.nickname,
          imageUrl: "",
          color: (game.playersColors ?? []).find(z => z.playerId === player.id)?.color
        }))
      );
    },

    syncParticipant(player: ExternalPlayer) {
      const index = this.participants.findIndex(participant => participant.id === player.id);
      if (index === -1) {
        this.participants.push({
          id: player.id,
          name: player.nickname,
          imageUrl: "",
        });
      }
    },

    removeParticipant(playerId: string) {
      const index = this.participants.findIndex(p => p.id === playerId);
      this.participants.splice(index, 1);
    },

    onMessageWasSent(
      message: { author: "me", type: "text", data: { text: string } }
    ) {
      this.messages = [...this.messages, message];

      rest.sendMessage({
        type: message.type,
        message: message.data.text,
        gameId: this.gameId
      })
    },

    openChat() {
      this.isChatOpen = true;
      this.newMessagesCount = 1;
    },

    closeChat() {
      this.isChatOpen = false;
    },

    handleScrollToTop() {
      // called when the user scrolls message list to top
      // leverage pagination for loading another page of messages
    },

    handleOnType() {
      console.log('Emit typing event');
    },

    editMessage(message) {
      const m = this.messages.find(m => m.id === message.id);
      m.isEdited = true;
      m.data.text = message.data.text;
    },

    chooseMyColor() {
      if (this.selectColorValidated) {
        this.selectColorValidated = false;
        return
      }

      rest.chooseColor(this.selectedColor)
        .then((answer) => {
          this.selectColorValidated = answer.valid;
        });
    },
    startTheGame() {
      rest.startTheGame()
    },
    async launchDice() {
      // When the dice has already been launched, we prevent to launch
      // another one
      // but we can ask again for getting informed about opportunitites
      if (this.currentRound?.diceScore) {
        this.getMyRoundOpportunities(this.currentRound.roundId)
        return
      }

      // Launch dice server side
      this.currentRound = await rest.playerRoolsADice(this.currentRound?.roundId!);
      this.getMyRoundOpportunities(this.currentRound.roundId);
    },
    async commitMove(pawnName: PawnName) {
      if (!this.currentRound) {
        console.log('Launch dice before!');
        return;
      }

      if(!this.selectedCase) {
        console.log("select case");
        return;
      }

      const pawnBeforeCommit = await rest.getPawnByName(pawnName);
      if (pawnBeforeCommit.isSome()) {
        await rest.playerCommitsMove({
          roundId: this.currentRound.roundId,
          pawnName: pawnName,
          pawnStartingCase: pawnBeforeCommit.get().position! as TrayCase,
          pawnEndingCase: this.selectedCase as TrayCase,
        });

        const [x, y] = pawnBeforeCommit.get()?.position!.split('xx').map(value => parseInt(value, 10));
        this.squares[x][y].pawn = await isCaseHasAPawnAbove(rest, x, y);

        this.possiblesActions = []
      }
    },
    async getMyRoundOpportunities(roundId: string) {
      const data = await rest.whatCanIPlay(roundId);
      this.possiblesActions = data.movablePawns;
    },
    updateDestinationTrayCase(pawnName: PawnName) {
      const action = this.possiblesActions.find(action => action.name === pawnName);
      if (!action) {
        console.log('FAILED ACTION')
        return;
      }

      this.selectedCase = action.destination as string;
      this.commitMove(pawnName)
    }
  },
};
</script>