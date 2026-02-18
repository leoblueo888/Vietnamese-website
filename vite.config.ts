import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Dùng './' để nó tự tìm file trong cùng thư mục, 
  // bất kể là GitHub Pages hay Vercel hay bất cứ đâu.
  base: './', 
})
