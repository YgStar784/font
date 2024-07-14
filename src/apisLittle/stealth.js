import request from './requestLittle'

export const stealthAddAPI = (data) => {
    return request({
        url: '/createTaskPIR',
        method: 'POST',
        data
    })
}