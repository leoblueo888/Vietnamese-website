import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Vietnamese-website/', // Đây là dòng cực kỳ quan trọng để hết trang trắng
})
