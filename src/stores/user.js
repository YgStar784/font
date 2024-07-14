//管理用户相关数据
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoAPI } from '@/apis/users'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore(
  'user',
  () => {
    //1.定义管理用户数据的state
    const userInfo = ref({})
    //2.定义获取接口数据的action函数
    const getUserInfo = async () => {
      const res = await getUserInfoAPI()
      console.log(res)
      if (res.code === 1000) {
        userInfo.value = res.data
        console.log(userInfo.value)
      } else {
        ElMessage({
          type: 'error',
          messsage: res.messsage
        })
      }
    }
    //退出时清除用户信息
    const clearUserInfo = () => {
      localStorage.clear()
    }
    //3.以对象的格式state和action return
    return {
      userInfo,
      getUserInfo,
      clearUserInfo
    }
  },
  {
    persist: true
  }
)
