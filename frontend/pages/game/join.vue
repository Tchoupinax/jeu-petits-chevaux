<template>
  <div class="flex flex-col justify-center items-center">
    <h1 class="font-bold text-5xl mt-24">
      Join a game
    </h1>

    <div class="italic flex mt-4 text-sm">
      <NuxtLink class="ml-1 underline" to="/">
        Back to home
      </NuxtLink>
    </div>

    <div class="mt-24 flex justify-center bg-blue-300">
      <table class="table-auto bg-gray-300 w-full">
        <thead>
          <tr>
            <th class="px-4 py-2">
              Room
            </th>
            <th class="px-4 py-2">
              Creator
            </th>
            <th class="px-4 py-2">
              Members
            </th>
            <th class="px-4 py-2">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(game, index) of games"
            :key="game.id"
            :class="{ 'bg-gray-100': index % 2 === 0 }"
            class="text-center"
          >
            <td class="border px-4 py-2">
              {{ game.name }}
            </td>
            <td class="border px-4 py-2">
              {{ game.players.length && game.players[0] && game.players[0].nickname }}
            </td>
            <td class="border px-4 py-2">
              {{ game.players && game.players.length }}
            </td>
            <td class="border px-4 py-2">
              <button
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
                @click="joinTheChannel(game)"
              >
                Join
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { useGameStore } from "~~/store/game";
import { useUserStore } from "~/store/user";

import { Socket } from '../../services/socket';
import { Rest } from '../../services/rest';


let rest: Rest;

type State = {
  games: Array<Game>
}

export default {
  data (): State {
    return {
      games: [],
    };
  },
  mounted () {
    const { public: { apiUrl } } = useRuntimeConfig();
    
    const socket = new Socket(apiUrl);
    socket.init();

    rest = new Rest(
      apiUrl,
      localStorage.getItem('petits-chevaux.user.id') ?? undefined,
      localStorage.getItem('petits-chevaux.game.id') ?? undefined
    );

    rest.listGames().then((games) => {
      this.games = games;
    });

    socket.eventBus.on<Game>('game-created', (game) => {
      this.games = [...this.games, game]
    });
    socket.eventBus.on<GameId>('game-deleted', (deletedGameId) => {
      const gameIndex = this.games.findIndex(game => game.id === deletedGameId);
      this.games.splice(gameIndex, 1)
    });
  },
  methods: {
    joinTheChannel (game: any) {
      rest.joinGame(game.id).then(() => {
        useGameStore().join(game.id);
        useUserStore().setAdmin(false);
        this.$router.push(`/game/${game.name}`);
      })
    },
  },
};
</script>
