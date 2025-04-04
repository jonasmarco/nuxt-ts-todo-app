// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/fonts', '@nuxt/icon'],
  css: ['~/assets/css/main.css'],
  fonts: {
    families: [
      {
        name: 'Poppins',
        weights: [400, 500, 600],
      },
    ],
  },
});
