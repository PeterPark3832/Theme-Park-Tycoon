import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Theme-Park-Tycoon/',
  build: {
    chunkSizeWarningLimit: 900,
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: true,
    },
  },
})
