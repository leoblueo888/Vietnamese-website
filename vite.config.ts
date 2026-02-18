import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Tự động điều chỉnh đường dẫn dựa trên môi trường deploy
  base: process.env.VERCEL ? '/' : '/Vietnamese-website/',
})
