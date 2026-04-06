// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-03-31',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  modules: ['@pinia/nuxt'],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'Mahjong Soul Academy',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Learn Riichi Mahjong from beginner to pro with interactive lessons, flashcards, and strategy guides.' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&family=Orbitron:wght@400;700&display=swap' },
      ],
    },
  },
});
