import { getUsersAPI } from '@/apis/users.js';

export const getAllUsers = async (data) => {
    const res = await getUsersAPI(data)
    if (res.code === 1000) {
        return res.data
    } else {
        return null
    }
}

