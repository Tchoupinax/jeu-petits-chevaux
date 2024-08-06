<template>
  <div class="flex">
    <div class="xl:m-16">
      <div v-for="rows of squares" class="flex">
        <div
          v-for="({ classes, x, y, isHouse, isPublicPath, isStair, pawn }) of rows"
          class="w-8 xl:w-12 h-8 xl:h-12 flex justify-center items-center"
          :class="classes"
        >
          <div v-if="isStair" class="bg-pink-200 rounded-lg w-6 h-6 flex justify-center items-center text-white">
            <Pawn 
              v-if="pawn.isSome()"
              class="text-black"
              :pawn="pawn.get()"
              :movable="pawn.isSome() && possiblesActions.map(p => p.name).includes(pawn.get().name)"
              @click="movePawn(pawn.get().name)"
            />
          </div>

          <div 
            v-else-if="isPublicPath"
            class="w-full h-full text-xs flex justify-center items-center"
            :class="{
              ...borderComputation(x, y),
            }"
          >
            <Pawn 
              v-if="pawn.isSome()"
              :pawn="pawn.get()"
              :movable="pawn.isSome() && possiblesActions.map(p => p.name).includes(pawn.get().name)"
              @click="movePawn(pawn.get().name)"
            />
          </div>

          <div v-else-if="isHouse"> 
            <Pawn v-if="pawn.isSome()" :pawn="pawn.get()" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRuntimeConfig } from 'nuxt/app';
import type { PawnName } from '../../backend/src/domain/value-objects/pawn-name';
import { Socket } from '../services/socket';
import { useUserStore } from "~/store/user";


type State = {
  gameIdHash: string;
  pawnName: string;
  players: any;
}

export default {
  props: {
    squares: {
      type: Array,
      required: true,
    },
    possiblesActions: {
      type: Array,
      required: true,
    }
  },
  async mounted() {
    const { public: { apiUrl } } = useRuntimeConfig();
    const socket = new Socket(apiUrl);

    if (process.client) {
      const userStore = useUserStore()

      if (!userStore.checkConnectionState()) {
        (window as Window).location = '/';
        return 
      }

      socket.init();
    }
  },
  data(): State {
    return {
      gameIdHash: "",
      pawnName: "Blue.4",
      players: [
        {
          id: "ac75f666-38fa-405f-8775-d28a49dd9149",
          color: "pink",
          nickname: "Tchoupinax",
          diceScore: 6
        },
        {
          id: "bb27d249-9fa2-4911-bd55-9304ef2908a3",
          color: "pink",
          nickname: "Mamie",
          diceScore: 2
        },
      ],
      
    }
  },
  methods: {
    isPossibleAction(x: number, y: number) {
      const actions = this.possiblesActions.map(action => action.destination);
      return actions.includes(`${x}xx${y}`)
    },
    movePawn(pawnName: PawnName) {
      this.$emit('move-pawn', pawnName)
    },
    borderComputation(x: number, y: number) {
      let strClasses = "border-r border-b";

      if (x === 8 || x === 6) {
        strClasses += " border-t"
      }

      if (x === 5 || x === 7) {
        strClasses = strClasses.replace('border-b', "")
      }
      
      if (
        y === 14 ||
        (x === 0 && y === 7)||
        (x === 14 && y === 7) || 
        (y === 5)
      ) {
        strClasses = strClasses.replace('border-r', "")
      }

      if (y === 8 || y === 6) {
        strClasses += " border-l"
      }

      return {
        [strClasses]: true
      }
    }
  }
};
</script>

<style scoped>
.yellow-house {
  @apply bg-yellow-500;
}
.yellow-road {
  @apply bg-yellow-400;
}
.green-house {
  @apply bg-green-500;
}
.green-road {
  @apply bg-green-400;
}
.red-house {
  @apply bg-red-500;
}
.red-road {
  @apply bg-red-400;
}
.blue-house {
  @apply bg-blue-500;
}
.blue-road {
  @apply bg-blue-400;
}
</style>

function useRuntimeConfig(): { public: { apiUrl: any; }; } {
  throw new Error('Function not implemented.');
}
