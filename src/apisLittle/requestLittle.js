import axios, { HttpStatusCode } from 'axios'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { useUserStore } from '@/stores/user'
import router from '@/router/index'
import { diffTokenTime } from '@/utils/auth'
import { useRouter } from 'vue-router'
import { authAPI } from '@/apis/auth'
import { ref } from 'vue'


console.log('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api')
const defaultConfig = {
    timeout: 5 * 1000,
    //baseURL: 'http://127.0.0.1:4523/m1/4311960-3954686-default'
    //rejectUnauthorized: false,
    //baseURL: '/littleApi'
    baseURL: 'https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api',
    /*     httpsAgent: new https.Agent({
            rejectUnauthorized: false
        }) */
};
const service = axios.create(Object.assign({}, defaultConfig));
/* const service = axios.create({
    baseURL: 'http://127.0.0.1:4523/m1/4311960-3954686-default',
    //baseURL:'http://127.0.0.1:4523/m1/4311960-3954686-default',
    timeout: 5000 * 4
}) */
const data = ref({})
/* const auth_node = async () => {
    const res = await authAPI(data.value)
    return res
} */
//拦截器
//axios请求拦截器
service.interceptors.request.use(
    async (config) => {
        //1.从pinia里获取token数据
        //2.按照后端的要求拼接token数据
        /*         const Data = ref({
                    token: localStorage.getItem('token'),
                    nodeIp: localStorage.getItem('nodeIp')
                })
                data.value = Data.value
                console.log(data.value)
                const res = await authAPI(data.value)
                console.log(res.code, res)
                if (res.code === 1000) {
                    console.log(res.code) */
        config.headers.Authorization = localStorage.getItem('token')
        /*         } else {
                    ElMessage({
                        type: 'warning',
                        message: 'token与IP绑定不一致'
                    })
                } */
        return config

    }
    ,
    (error) => {
        return Promise.reject(new Error(error))
    }
)
//axios响应式拦截器
// 响应拦截器
/* service.interceptors.response.use(response => {
    if (response.data.success) {
        // 数据正常，进行的逻辑功能
        return response.data
    } else {
        // 如果返回的 success 是 false，表明业务出错，直接触发 reject
        // 抛出的错误，被 catch 捕获
        return Promise.reject(new Error(response.data.message))
    }
}, error => {
    // 对响应错误做点什么
    return Promise.reject(error)
}) */

service.interceptors.response.use(
    //统一错误提示
    (response) => {
        if (response.status === 200 || response.status === 201) {
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
