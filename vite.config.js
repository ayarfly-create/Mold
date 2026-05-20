import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // 確保有這一行

export default defineConfig({
  plugins: [
    vue() // 確保這一行在這裡！沒有這行，Vite 就無法處理 .vue 檔案
  ],
  base: '/Mold/',
})
