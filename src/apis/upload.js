import request from './request'

export const fileUploadAPI=(data)=>{
  return request({
    url:'/upload',
    method:'POST', 
    headers:{'Content-type':'multipart/form-data'},
    data    
  })
}