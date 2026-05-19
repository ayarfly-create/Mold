import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, // 允許 GitHub Codespaces 對外對接連接埠
    port: 5173
  }
})
