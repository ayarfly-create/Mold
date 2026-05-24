import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css' // 引入樣式
import App from './App.vue'         // 確保路徑指向 App.vue

const app = createApp(App)

app.use(ElementPlus) // 掛載 Element Plus
app.mount('#app')    // 掛載到 index.html 中的 <div id="app"></div>
