import request from './requestLittle'
export const getMyTaskAPI = (data) => {
    return request({
        url: '/getMyTask',
        method: 'POST',
        data
    })
}
export const downloadResultByUuidAPI = (data) => {
    return request({
        url: '/downloadResultByUuid',
        responseType: 'blob',
        method: 'POST',
        data
    })
}
