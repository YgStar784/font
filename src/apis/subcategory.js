import request from './request'

export function changeUserState(params){
    return request({
      url:'users/:uId/state/:type',
      params   
    })
  }