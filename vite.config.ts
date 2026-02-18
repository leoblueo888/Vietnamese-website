import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Đảm bảo tên repo chính xác là Vietnamese-website (viết hoa chữ V)
export default defineConfig({
  plugins: [react()],
  base: '/Vietnamese-website/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})
