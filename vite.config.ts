import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Vietnamese-website/', // TÊN REPO CỦA ÔNG PHẢI KHỚP Ở ĐÂY
})
