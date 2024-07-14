import request from './requestLittle'
export const uploadDataSourceAPI = (data) => {

    return request({
        url: '/uploadDataSource',
        method: 'POST',
        data
    })
}
export const delMyDataSourceAPI = (data) => {
    return request({
        url: '/delMyDataSource',
        method: 'POST',
        data
    })
}