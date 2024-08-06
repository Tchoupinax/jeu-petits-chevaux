<template>
  Winner! {{ winnerNickname }}
</template>

<script lang="ts">
import { Rest } from '../../../services/rest';

let rest: Rest;

type State = {
  winnerNickname?: string
}

export default {
  data(): State {
    return {
      winnerNickname: undefined
    }
  },
  computed: {
    roomName(): string { return this.$route.params.name as string; },
  },
  async mounted() {
    const { public: { apiUrl } } = useRuntimeConfig();

    rest = new Rest(
      apiUrl,
      localStorage.getItem('petits-chevaux.user.id') ?? undefined,
      localStorage.getItem('petits-chevaux.game.id') ?? undefined
    );

    const stats = await rest.getEndStats(this.roomName);
    this.winnerNickname = "Corentin"
  }
}
</script>