import request from './src/apis/request'

export const getUserInfoAPI = () => {
    return request({
        url: '/getUserInfo',
        method: 'POST',
    })
}
