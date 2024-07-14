import { ref } from 'vue'
export const url = 'https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api'
