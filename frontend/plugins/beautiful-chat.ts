import BeautifulChat from 'vue3-beautiful-chat'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(BeautifulChat);
});
