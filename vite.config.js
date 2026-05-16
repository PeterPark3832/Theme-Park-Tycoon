import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Vercel sets process.env.VERCEL automatically; GitHub Pages needs the repo sub-path
const base = process.env.VERCEL ? '/' : '/Theme-Park-Tycoon/'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'gstatic-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      manifest: {
        name: 'Parcadia — 테마파크 경영 게임',
        short_name: 'Parcadia',
        description: '방문객을 끌어모으고 최고의 테마파크를 건설하는 무료 경영 시뮬레이션 게임',
        start_url: base,
        display: 'standalone',
        background_color: '#080B20',
        theme_color: '#080B20',
        orientation: 'landscape-primary',
        lang: 'ko',
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
        categories: ['games', 'entertainment'],
        prefer_related_applications: false,
      },
      devOptions: { enabled: false },
    }),
  ],
  base,
  build: {
    chunkSizeWarningLimit: 1200,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
  },
})
