import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.png', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'GetMídia - IA para o seu Negócio',
        short_name: 'GetMídia',
        description: 'Transforme seu negócio com Inteligência Artificial',
        theme_color: '#EAB308',
        background_color: '#111827',
        display: 'standalone',
        icons: [
          {
            src: 'app-icon.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'app-icon.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})

