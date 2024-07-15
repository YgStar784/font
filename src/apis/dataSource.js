import request from './request'

/* PIR */
export const getMyPirDataSourceAPI = (data) => {
  return request({
    url: '/PIR/getMyDataSource',
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

export const getPirDataSourceAPI = (data) => {
  return request({
    url: '/PIR/getDataSource',
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
export const getOthersPirDataSourceAPI = (data) => {
  return request({
    url: '/PIR/getOthersDataSource',
    method: 'POST',
    data
  })
}

/* MPC */

export const getMyMpcDataSourceAPI = (data) => {
  return request({
    url: '/MPC/getMyDataSource',
    method: 'POST',
    data
  })
}

export const getMpcDataSourceAPI = (data) => {
  return request({
    url: '/MPC/getDataSource',
    method: 'POST',
    data
  })
}
export const getOthersMpcDataSourceAPI = (data) => {
  return request({
    url: '/MPC/getOthersDataSource',
    method: 'POST',
    data
  })
}
/* 联邦学习 */

export const getMyFlDataSourceAPI = (data) => {
  return request({
    url: '/FL/getMyDataSource',
    method: 'POST',
    data
  })
}

export const getFlDataSourceAPI = (data) => {
  return request({
    url: '/FL/getDataSource',
    method: 'POST',
    data
  })
}
export const getOthersFlDataSourceAPI = (data) => {
  return request({
    url: '/FL/getOthersDataSource',
    method: 'POST',
    data
  })
}
/* 隐私求交 */

export const getMyPsiDataSourceAPI = (data) => {
  return request({
    url: '/PSI/getMyDataSource',
    method: 'POST',
    data
  })
}

export const getPsiDataSourceAPI = (data) => {
  return request({
    url: '/PSI/getDataSource',
    method: 'POST',
    data
  })
}
export const getOthersPsiDataSourceAPI = (data) => {
  return request({
    url: '/PSI/getOthersDataSource',
    method: 'POST',
    data
  })
}