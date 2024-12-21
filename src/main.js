
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
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Layui from '@layui/layui-vue'
import '@layui/layui-vue/lib/index.css'
const pinia = createPinia()

const app = createApp(App)
app.config.globalProperties.$littleBaseUrl = ''
// 启用 Vue 2 兼容模式
app.config.compatConfig = {
  MODE: 2
};

pinia.use(piniaPluginPersistedstate)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.use(PrimeVue);
app.use(Layui)
app.use(ElementPlus, {
  theme: {
    // 自定义 Element Plus 的主题颜色，避免与 TinyVue 冲突
    '--el-color-primary': '#409EFF',
    '--el-icon-color': '#409EFF', // 修改图标颜色
  },
})
app.use(Antd)
//app.use(ElementPlus, { size: 'small' })
app.use(pinia)

app.use(router)
app.use(i18n)
filters(app)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app.mount('#app')
