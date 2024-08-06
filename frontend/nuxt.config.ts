// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  compatibilityDate: "2024-08-06",
  ssr: false,
  typescript: {
    shim: false
  },
  imports: {
    dirs: ['stores'],
  },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  app: {
    baseURL: process.env.NODE_ENV === "production" ? '/jeu-petits-chevaux/' : '/',
    head: {
      title: "Jeu petits chevaux"
    },
  },
  runtimeConfig: {
    public: {
      apiUrl: "http://localhost:8080"
    }
  }
});
