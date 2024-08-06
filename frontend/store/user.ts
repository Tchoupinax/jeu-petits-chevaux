import { acceptHMRUpdate, defineStore } from 'pinia'

export const useUserStore = defineStore({
  id: 'user-store',
  state: () => {
    return {
      id: localStorage.getItem('petits-chevaux.user.id') || null,
      nickname: localStorage.getItem('petits-chevaux.user.nickname') || null,
      isConnected: localStorage.getItem('petits-chevaux.user.isConnected') || false,
      isAdmin: localStorage.getItem('petits-chevaux.user.isAdmin') === "true" || false,
    }
  },
  actions: {
    register (id: string, nickname: string) {
      this.id = id;
      this.nickname = nickname;
      this.isConnected = true;
  
      localStorage.setItem('petits-chevaux.user.id', id);
      localStorage.setItem('petits-chevaux.user.nickname', nickname);
      localStorage.setItem('petits-chevaux.user.isConnected', "true");
    },
  
    setAdmin (bool: boolean) {
      this.isAdmin = bool || false;
      localStorage.setItem('petits-chevaux.user.isAdmin', this.isAdmin.toString());
    },
  
    disconnect () {
      this.id = null;
      this.nickname = null;
      this.isConnected = false;
  
      localStorage.removeItem('petits-chevaux.user.id');
      localStorage.removeItem('petits-chevaux.user.nickname');
      localStorage.removeItem('petits-chevaux.user.isConnected');
      localStorage.removeItem('petits-chevaux.user.isAdmin');
    },

    checkConnectionState(): boolean {
      return localStorage.getItem('petits-chevaux.user.id') != null
    }
  },
  getters: {},
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot))
}
