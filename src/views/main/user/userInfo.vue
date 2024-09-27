<template>
    <el-card>
        <el-form :model="form" label-width="auto" label-position="left" style="max-width: 600px" :rules="rules">
            <el-form-item label="用户名:" prop="username">
                <el-input v-model="form.username" readonly="true" />
            </el-form-item>
            <el-form-item label="用户等级:" prop="level">
                <el-input v-model="form.level" readonly="true" />
            </el-form-item>
            <el-form-item label="节点IP:" prop="nodeIp">
                <el-input v-model="form.nodeIp" readonly="true" />
            </el-form-item>
            <el-form-item label="节点端口:" prop="nodePort">
                <el-input v-model="form.nodePort" readonly="true" />
            </el-form-item>
            <el-form-item label="节点描述:" prop="nodeDescription">
                <el-input v-model="form.nodeDescription" readonly="true" />
            </el-form-item>
        </el-form>
    </el-card>
</template>
<script setup>
const load = ref(true)
import { useUserStore } from '@/stores/user';
import { ElSelect } from 'element-plus';
import { onMounted, ref } from 'vue'

const userStore = useUserStore()
const form = ref({
    username: '',
    level: '',
    nodeIp: '',
    nodePort: '',
    nodeDescription: '',
})

const getUserInfo = async () => {
    console.log(localStorage.getItem('token'))
    const res = await userStore.getUserInfo()
    console.log(userStore.userInfo)
    form.value = userStore.userInfo
    localStorage.setItem('id', form.value.id)

    form.value.level = localStorage.getItem('level') === '0' ? '管理员' : '普通用户'

}
onMounted(() => getUserInfo())

</script>

<style lang="scss" scoped>
body {
    margin: 0;
}
</style>