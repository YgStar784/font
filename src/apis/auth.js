import request from './request'
export const authAPI=(data)=>{
    return request({
      url:'/auth',
      method:'POST',   
      data    
    })
  }