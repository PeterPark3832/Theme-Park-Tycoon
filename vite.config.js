import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel sets process.env.VERCEL automatically; GitHub Pages needs the repo sub-path
const base = process.env.VERCEL ? '/' : '/Theme-Park-Tycoon/'

export default defineConfig({
  plugins: [react()],
  base,
  build: {
    chunkSizeWarningLimit: 900,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
  },
})
