import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/manabi-craft-world/',
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Split three.js into a stable vendor chunk for better caching.
        manualChunks: {
          'vendor-three': ['three', '@react-three/fiber'],
        },
      },
    },
  },
})
