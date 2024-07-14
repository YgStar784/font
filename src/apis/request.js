import axios, { HttpStatusCode } from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { useUserStore } from '@/stores/user'
import router from '@/router/index'
import { diffTokenTime } from '@/utils/auth'
import { useRouter } from 'vue-router'
const defaultConfig = {
  timeout: 5000 * 1,
  //baseURL: 'http://127.0.0.1:4523/m1/4311960-3954686-default'
  baseURL: '/api'
};
const service = axios.create(Object.assign({}, defaultConfig));
/* const service = axios.create({
  baseURL: '/api',
  baseURL: 'http://127.0.0.1:4523/m1/4311960-3954686-default',
  timeout: 5000 * 4
}) */

//拦截器
//axios请求拦截器
service.interceptors.request.use(
  (config) => {
    if (localStorage.getItem('token')) {
      /*       if (diffTokenTime()) {
              console.log(diffTokenTime())
              ElMessage({ type: 'warning', message: 'token失效，请重新登陆！' })
              localStorage.clear()
            } */
      //1.从pinia里获取token数据
      //2.按照后端的要求拼接token数据
      config.headers.Authorization = localStorage.getItem('token')
    }
    return config
  },
  (error) => {
    return Promise.reject(new Error(error))
  }
)
//axios响应式拦截器
service.interceptors.response.use(
  //统一错误提示
  (response) => {
    if (response.status === 200 || response.status === 201) {
      console.log(response)
      return response.data
    }
  },
  (error) => {
    console.log(error.response)
    error.response && ElMessage.error(error.response.data)
    return Promise.reject(new Error(error.response.data))
  }
)
export default service
