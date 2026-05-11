import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '罗盘',
        short_name: '罗盘',
        description: 'iOS 风水罗盘照片叠加工具',
        theme_color: '#1a1a1a',
        background_color: '#1a1a1a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/luopan/',           // ⭐ 修正
        start_url: '/luopan/',       // ⭐ 修正
        icons: [
          { src: '/luopan/icon-192.png', sizes: '192x192', type: 'image/png' },   // ⭐ 修正
          { src: '/luopan/icon-512.png', sizes: '512x512', type: 'image/png' },     // ⭐ 修正
        ],
      },
    }),
  ],
  base: '/luopan/',
  build: {
    outDir: 'dist',
  }
})