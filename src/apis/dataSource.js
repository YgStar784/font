import request from './request'


export const getMyDataSourceAPI = (data) => {
  return request({
    url: '/getMyDataSource',
    method: 'POST',
    data
  })
}
export const getAuthDataSourceAPI = (data) => {
  return request({
    url: '/getAuthDataSource',
    method: 'POST',
    data
  })
}
export const getMyDataSourceAuthUserAPI = (data) => {
  return request({
    url: '/authUser',
    method: 'POST',
    data
  })
}
export const getMyDataSourceUnAuthUserAPI = (data) => {
  return request({
    url: '/noAuthUser',
    method: 'POST',
    data
  })
}
export const authMyDataSourceAPI = (data) => {
  return request({
    url: '/authMyDataSource',
    method: 'POST',
    data
  })
}
export const noAuthMyDataSourceAPI = (data) => {
  return request({
    url: '/noAuthMyDataSource',
    method: 'POST',
    data
  })
}

export const getDataSourceAPI = (data) => {
  return request({
    url: '/getDataSource',
    method: 'POST',
    data
  })
}
export const getUserSourceAPI = (data) => {
  return request({
    url: '/getUserSource',
    method: 'POST',
    data
  })
}
export const getOthersDataSourceAPI = (data) => {
  return request({
    url: '/getOthersDataSource',
    method: 'POST',
    data
  })
}