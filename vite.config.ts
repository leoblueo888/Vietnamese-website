import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Vietnamese-website/', // Thêm dòng này để định nghĩa đúng đường dẫn
})
