import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
<<<<<<< HEAD
  // 關鍵設定：告訴 Vite 您的網站是在 /Mold/ 這個子路徑下
=======
  // 為了讓 GitHub Pages 讀取到資源，請務必使用 './'
>>>>>>> 38b93f4 (更新工單系統與模具管理功能)
  base: './', 
})
