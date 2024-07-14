//管理用户相关数据
import { defineStore } from 'pinia'
import { getMenuAPI } from '@/apis/menu'
import { ref } from 'vue'
export const useCategoryStore = defineStore('category', () => {
  //导航列表的数据管理
  const categoryList = ref([])
  const getCategory = async () => {
    const res = await getMenuAPI()
    //console.log(res)
    categoryList.value = res.data
  }
  return {
    categoryList,
    getCategory
  }
},
{
  persist: true
}

)
