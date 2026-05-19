import { createApp } from 'vue'
import App from './App.vue'

// 引入 Element Plus 組件與樣式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入 Tailwind CSS 基礎樣式
import './style.css'

// 引入所有 Element Plus 圖標
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)

// 註冊所有圖標元件，讓 App.vue 可以直接使用 <Monitor />, <Tools /> 等標籤
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.mount('#app')
