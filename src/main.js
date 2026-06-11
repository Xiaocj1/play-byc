import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 引入全局样式
import '../public/css/base.css'
import '../public/css/game.css'
import '../public/css/modals.css'
import '../public/css/pmf.css'
import '../public/css/blame.css'
import '../public/css/skin-jira.css'
import '../public/css/skin-zentao.css'
import '../public/css/skin-feishu.css'
import '../public/css/skin-dingtalk.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
