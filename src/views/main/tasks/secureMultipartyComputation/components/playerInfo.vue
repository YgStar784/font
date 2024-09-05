<template>

    <el-button icon="ArrowLeftBold" style="margin-bottom: 20px;" @click="handleClickReturn">返回</el-button>

    <el-card>
        <el-descriptions title="基本信息">
            <el-descriptions-item label="任务ID">{{ route.query.taskUuid }}</el-descriptions-item>
            <el-descriptions-item label="任务名称">{{ route.query.taskName }}</el-descriptions-item>
            <el-descriptions-item label="角色">任务发起方</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ route.query.createTime }}</el-descriptions-item>
            <el-descriptions-item label="任务描述">{{ route.query.taskDescription }}</el-descriptions-item>

            <el-descriptions-item label="类型">
                <el-tag v-if="route.query.type === 'mpc'" size="small">安全多方计算</el-tag>
            </el-descriptions-item>

        </el-descriptions>
    </el-card>
    <br>
    <el-card>
        <el-descriptions title="参与者信息">
            <div v-for="(item, index) in taskPlayerList">
                <el-descriptions-item :label='`参与者 ${index}-IP`'>{{ item.playerIp }}</el-descriptions-item>
                <el-descriptions-item label="数据源描述">{{ item.dataDescription }}</el-descriptions-item>
                <el-descriptions-item label="数据源路径">{{ item.dataPath }}</el-descriptions-item>
                <el-descriptions-item label="内网计算IP">{{ item.privateComputingIp }}</el-descriptions-item>
                <el-descriptions-item label="状态" :v-if="item.playerState === 0">
                    接受
                </el-descriptions-item>
                <el-descriptions-item label="状态" :v-if="item.playerState === 1">
                    拒绝
                </el-descriptions-item>
                <el-descriptions-item label="状态" :v-if="item.playerState === 2">
                    待确认
                </el-descriptions-item>
                <el-descriptions-item label="类型">
                    <el-tag v-if="route.query.type === 'mpc'" size="small">安全多方计算</el-tag>
                </el-descriptions-item>
            </div>

        </el-descriptions>
    </el-card>
</template>
<script setup>
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const router = useRouter()
const taskPlayerList = ref([])
const queryFormPlayer = ref({
    uuid: '',
    page: 1,
    pageSize: 2
})
const handleClickReturn = () => {
    router.back()
}
const getPlayerInfo = async () => {
    queryFormPlayer.value.uuid = route.query.taskUuid
    await axios.post('/api/MPC/getMyTaskPlayers', queryFormPlayer.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                taskPlayerList.value = res.data.data.taskList
                console.log(taskPlayerList.value)
                playertotal.value = res.data.data.total
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
}
onMounted(() => {
    getPlayerInfo()

})
</script>