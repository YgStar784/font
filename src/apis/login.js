import request from './request'

export const login = (data) => {
    return request({
        url: '/loginUser',
        method: 'POST',
        data
    })
}