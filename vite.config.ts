import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/manabi-craft-world/',
  server: {
    host: true,
  },
})
