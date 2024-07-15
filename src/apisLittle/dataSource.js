import request from './requestLittle'
export const uploadDataSourceAPI = (data) => {

    return request({
        url: '/PIR/uploadDataSource',
        method: 'POST',
        data
    })
}
export const delMyDataSourceAPI = (data) => {
    return request({
        url: '/PIR/delMyDataSource',
        method: 'POST',
        data
    })
}