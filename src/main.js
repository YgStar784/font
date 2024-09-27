import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import '@/styles/index.scss'
import App from './App.vue'
import router from './router'
import i18n from './i18n/index'
import filters from './utils/filters'

import 'element-plus/dist/index.css';
const pinia = createPinia()

const app = createApp(App)
app.config.globalProperties.$littleBaseUrl = ''



pinia.use(piniaPluginPersistedstate)
app.use(ElementPlus)

app.use(pinia)

app.use(router)
app.use(i18n)
filters(app)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
