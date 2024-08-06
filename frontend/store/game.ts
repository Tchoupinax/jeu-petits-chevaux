import { acceptHMRUpdate, defineStore } from 'pinia'

export const useGameStore = defineStore({
  id: 'game-store',
  state: () => {
    return {
      id: localStorage.getItem('petits-chevaux.game.id') || null,
    }
  },
  actions: {
    join (roomId: string) {
      this.id = roomId;
      localStorage.setItem('petits-chevaux.game.id', roomId);
    },
  
    leave () {
      this.id = null;
      localStorage.removeItem('petits-chevaux.game.id');
    },
  },
  getters: {
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
