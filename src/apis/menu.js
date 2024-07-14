import request from './request'

export function getMenuAPI() {
    return request({
      url: '/menus',
    })
  }