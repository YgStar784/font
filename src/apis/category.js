import request from './request'

export function getCategoryAPI() {
  return request({
    url: '/home/category/head',
  })
}
export function getSubCategoryAPI(id){
  return request({
    url:'/category/sub/filter',
    params:{
      id
    }
  })
}
/**
 * @description: 获取导航数据
 * @data { 
     categoryId: 1005000 ,
     page: 1,
     pageSize: 20,
     sortField: 'publishTime' | 'orderNum' | 'evaluateNum'
   } 
 * @return {*}
 */
   export const getSubDataAPI = (data) => {
    return request({
      url:'/category/goods/temporary',
      method:'POST',
      data
    })
  }