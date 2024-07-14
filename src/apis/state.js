import request from './request'

export const changeStateAPI = (uid,state) => {
    return request({
        url:`users/${uid}/state/${state}`,
        method:'PUT',         
        
    }) 
}