
const dayjs = require('dayjs')

const filterTimes = (val,format='YYYY-MM-DD') =>{
    if(!isNULL(val)){
        val = parseInt(val) * 1000
        return dayjs(val).format(format)
    }else{
        return '--'
    }
}
export const isNULL = (date) =>{
    if(!date) {
        return true
    }
    if(JSON.stringify(date) === '{}') return true
    if(JSON.stringify(date) === '[]') return true


}

export default (app) =>{
    app.config.globalProperties.$filters = {
        filterTimes
    }
}