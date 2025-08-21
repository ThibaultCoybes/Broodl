import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01', 
  devtools: { enabled: false },
  ssr: true,
  
  modules: [
    '@nuxt/eslint', 
    '@nuxt/fonts', 
    '@nuxt/icon',
    '@vite-pwa/nuxt'
  ],
  
  css: [
    join(currentDir, "/assets/css/theme.css")
  ],
  
  srcDir: '.',

  routeRules: {
    '/api/auth/login': { cors: true },
    '/api/auth/register': { cors: true },
    '/api/**': { cors: true }
  },
  
  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'default_secret',
    authUtils: {
      cookieName: 'auth_token',
      jwtSignOptions: { expiresIn: '7d' }
    }
  },
})