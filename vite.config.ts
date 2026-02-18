import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ten-repo-cua-ban/', // Thay bằng tên repository của bạn
})
