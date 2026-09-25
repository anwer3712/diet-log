import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'math.jpg'],
      manifest: {
        name: '陽光照護日誌 / Catatan Perawatan Mentari',
        short_name: '照護日誌',
        description: '雙語銀髮居家照護日誌 (繁中/印尼文)',
        theme_color: '#FB8B7A',
        background_color: '#FAFAFA',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'math.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'math.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      }
    })
  ]
});
