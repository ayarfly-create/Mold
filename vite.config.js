import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 關鍵網站是在 /Mold/ 這個子路徑下設定：告訴 Vite 您的
  base: './', 
})
