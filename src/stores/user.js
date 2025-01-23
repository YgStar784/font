//管理用户相关数据
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getUserInfoAPI } from '@/apis/users'
import { ElMessage } from 'element-plus'
import router from '@/router/index.js';  // 导入路由实例

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
      } else if (res.code === 1006) {
        ElMessage({ type: 'warning', message: 'token过期，请重新登录' })
        setTimeout(() => {
          router.push({ path: '/login' }); // 确保路径和名称正确
        }, 500); // 避免动画加载导致页面阻塞
        return
      }

      else {
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
