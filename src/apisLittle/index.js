import axios from 'axios'

axios.defaults.baseURL = 'https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api'

axios.interceptors.request.use(
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
axios.interceptors.response.use(
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
export default axios