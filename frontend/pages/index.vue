<template>
  <div class="flex flex-col justify-center items-center">
    <h1 class="font-bold text-5xl mt-24">
      Petit chevaux
    </h1>

    <form
      v-if="!isConnected"
      class="xl:w-full w-11/12 max-w-sm mt-24"
      @submit="register"
    >
      <div class="flex items-center border-b border-teal-500 py-2">
        <input
          v-model="nickname"
          class="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          placeholder="Nickname"
        >
        <button
          class="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
          type="submit"
        >
          Register
        </button>
      </div>
    </form>

    <div
      v-if="isConnected"
      class="flex flex-col mt-16 justify-center items-center"
    >
      <p class="text-xl">
        registered as {{ connectedAs }}!
      </p>

      <div class="italic flex mb-16 text-sm">
        <p>disconnect</p>
        <button
          class="ml-1 underline"
          @click="disconnect"
        >
          here
        </button>
      </div>

      <nuxt-link
        class="border border-blue-400 w-full p-2 text-center rounded-lg"
        to="/game/create"
      >
        Create
      </nuxt-link>
      <nuxt-link
        class="mt-4 border border-blue-400 w-full p-2 text-center rounded-lg"
        to="/game/join"
      >
        Join
      </nuxt-link>
    </div>
  </div>
</template>

<script lang="ts">
import { Rest } from '../services/rest';
import { useUserStore } from "~/store/user";

let rest: Rest;

export default {
  data () {
    return {
      nickname: '',
    };
  },
  mounted() {
    const { public: { apiUrl } } = useRuntimeConfig();
    rest = new Rest(
      apiUrl,
      localStorage.getItem('petits-chevaux.user.id') ?? undefined,
      localStorage.getItem('petits-chevaux.game.id') ?? undefined
    );

    if (!useUserStore().$state.nickname) {
      useUserStore().disconnect()
      return
    }

    rest.getPlayerByName(useUserStore().$state.nickname!)
      .then(() => {})
      .catch(() => {
        useUserStore().disconnect();
      })
  },
  computed: {
    connectedAs: () => useUserStore().$state.nickname,
    isConnected: () => useUserStore().$state.isConnected,
  },
  methods: {
    register (e) {
      e.preventDefault();

      if (this.nickname.length === 0) { return; }

      rest.registerPlayer(this.nickname)
        .then((data) => {
          useUserStore().register(data.id, data.nickname);
        })
        .catch(err => {
          alert(err.response.data.message)
        });
    },

    disconnect () {
      useUserStore().disconnect()
    },
  },
  notifications: {
    notifDeleteAccount: {
      title: 'Account deleted',
      message: 'Your account has been successfully delete. See you later !',
      type: 'success',
    },
  },
};
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
</style>
