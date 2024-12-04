import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/router'
import ElementPlus from 'element-plus' //全局引入
import 'element-plus/dist/index.css'
import * as ElIcon from '@element-plus/icons-vue'

const app = createApp(App)

import { ElMessage } from 'element-plus'
app.config.globalProperties.ElMessage = ElMessage


import Pagination from '@/components/Pagination/index.vue'
app.component('Pagination', Pagination)

app.use(ElementPlus)
app.use(router)
Object.keys(ElIcon).forEach((key) => {
    app.component(key, ElIcon[key])
})
app.mount('#app')

