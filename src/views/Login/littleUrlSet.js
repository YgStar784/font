import { ref } from 'vue'
import { getUserInfoAPI } from '@/apis/users'
const littleUrlSetAPI = async () => {
    const res = await getUserInfoAPI()

    return 'https:' + res.data.nodeIp + ':' + res.data.nodePort + '/api'

}
export const littleUrl = littleUrlSetAPI()


