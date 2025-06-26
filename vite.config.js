import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/steal-tracker/',
  plugins: [react()],
})
