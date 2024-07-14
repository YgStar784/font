import request from './request'

export const getUserInfoAPI = () => {
  return request({
    url: '/getUserInfo',
    method: 'POST',
  })
}

export function getUsersAPI(data) {
  return request({
    url: '/getAllUser',
    method: 'POST',
    data
  })
}

export const registerUserAPI = (data) => {
  return request({
    url: '/registerUser',
    method: 'POST',
    data
  })
}
export const editUserAPI = (data) => {
  return request({
    url: `users/${data.id}`,
    method: 'PUT',
    data
  })
}

export const delUserAPI = (data) => {
  return request({
    url: `/delUser`,
    method: 'POST',
    data
  })
}
export const changePasswordAPI = (data) => {
  return request({
    url: '/changePassword',
    method: 'POST',
    data
  })
}

export const changeStateAPI = (data) => {
  return request({
    url: '/frozenUser',
    method: 'POST',
    data
  })
}
export const getAllUsersAPI = () => {
  return request({
    url: '/getAllUsers',
    method: 'POST',
  })
}
export const getlUserIpAPI = (data) => {
  return request({
    url: '/getlUserIp',
    method: 'POST',
    data
  })
}
export const changePortAPI = (data) => {
  return request({
    url: '/changePort',
    method: 'POST',
    data
  })
}
