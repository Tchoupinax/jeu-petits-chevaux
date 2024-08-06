<template>
  <div class="flex flex-col justify-center items-center">
    <h1 class="font-bold text-4xl sm:text-5xl mt-24">
      Create a new game
    </h1>

    <div class="italic flex mt-4 text-sm">
      <NuxtLink class="ml-1 underline" to="/">
        Back to home
      </NuxtLink>
    </div>

    <div class="mt-24 w-full max-w-xs">
      <form
        class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        @submit="createRoom"
      >
        <div class="mb-4">
          <input
            id="roomName"
            v-model="roomName"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Room name"
            autocomplete="off"
          >
        </div>

        <div class="flex items-center justify-between">
          <button
            class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create the room
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { useGameStore } from "~~/store/game";
import { useUserStore } from "~/store/user";

import { Rest } from '../../services/rest';
import { Socket } from "../../services/socket";

let rest: Rest;

export default {
  data () {
    return {
      roomName: '',
    };
  },
  mounted() {
    const { public: { apiUrl } } = useRuntimeConfig();
    const socket = new Socket(apiUrl);
    socket.init();
    
    rest = new Rest(
      apiUrl,
      localStorage.getItem('petits-chevaux.user.id') ?? undefined,
      localStorage.getItem('petits-chevaux.game.id') ?? undefined
    );
  },  
  methods: {
    createRoom (e) {
      e.preventDefault();
      if (this.roomName.length === 0) { return; }

      rest.createGame(this.roomName).then(response => {
        useUserStore().setAdmin(true);
        useGameStore().join(response.id)

        this.$router.push(`/game/${this.roomName}`);
      });
    },
  },
};
</script>
