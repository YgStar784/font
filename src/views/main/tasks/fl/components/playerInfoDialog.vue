<template>

    <el-dialog class="dialog" :model-value="dialogVisiblePlayer" width="1000px" @open="handlePlayerInfo"
        @close="handleClose" append-to-body destroy-on-close>
        <el-card v-loading="playerInfoLoading">
            <el-descriptions title="基本信息" :column="4">
                <el-descriptions-item label="任务ID" :span="2">{{ props.taskUuid }}</el-descriptions-item>
                <el-descriptions-item label="任务名称" :span="1">{{ props.taskName }}</el-descriptions-item>

                <el-descriptions-item label="角色" :span="1">任务发起方</el-descriptions-item>
                <el-descriptions-item label="创建时间" :span="2">{{ props.createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述" :span="4">{{ props.taskDescription }}</el-descriptions-item>
                <el-descriptions-item v-if="props.taskInfoError" :span="4">
                    <template #label>
                        <span>失败原因</span>
                    </template>
                    <el-text class="mx-1" type="danger">{{ taskInfoError }}</el-text>
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
        <br>
        <el-card>
            <el-descriptions title="参与者信息" v-loading="playerInfoLoading">
                <div v-for="(item, index) in taskPlayerList">
                    <el-descriptions-item :label='`参与者 ${index}-IP`'>{{ item.playerIp }}</el-descriptions-item>
                    <el-descriptions-item label="数据源描述">{{ item.dataDescription }}</el-descriptions-item>
                    <el-descriptions-item label="角色">
                        <span v-if="item.role === 1" style="color:red;">Server</span>
                        <span v-if="item.role === 2" style="color:green;">Client</span>
                    </el-descriptions-item>
                    <el-descriptions-item v-if="item.playerState === 0 && item.role === 2" label="trainDataSourceUuid">
                        {{ item.trainDataSourceUuid }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="item.playerState === 0" label="evalDataSourceUuid">
                        {{ item.evalDataSourceUuid }}
                    </el-descriptions-item>
                    <el-descriptions-item :span="20" class="break-word" label="状态" v-if="item.playerState === 0">
                        <span style="color: #529b2e;">已接受</span>
                    </el-descriptions-item>
                    <el-descriptions-item :span="20" class="break-word" label="状态" v-if="item.playerState === 1">
                        <span style="color: #c45656;">已拒绝</span>

                    </el-descriptions-item>
                    <el-descriptions-item :span="20" class="break-word" label="状态" v-if="item.playerState === 2">
                        <span style="color: #303133;">待确认</span>
                    </el-descriptions-item>
                    <br>
                </div>

            </el-descriptions>
        </el-card>

    </el-dialog>
</template>


<script setup>

import { onMounted, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router'
const router = useRouter()
const taskPlayerList = ref([])
const playerInfoLoading = ref(false)
const playertotal = ref(0)
const props = defineProps({
    taskUuid: {
        type: String,
        default: '',
        required: true
    },
    taskName: {
        type: String,
        default: '',
        required: true
    },
    createTime: {
        type: String,
        default: '',
        required: true
    },
    taskDescription: {
        type: String,
        default: '',
        required: true
    },
    taskInfoError: {
        type: String,
        default: '',
    }
})
const queryFormPlayer = ref({
    uuid: '',
    page: 1,
    pageSize: 30
})
const queryFormTask = ref({
    uuid: '',
    page: 1,
    pageSize: 30
})
const emits = defineEmits(['update:modelValue'])

const handleClose = () => {
    emits('update:modelValue', false)
}

const handlePlayerInfo = async () => {
    playerInfoLoading.value = true
    /*     router.push({
            path: '/mpcplayerinfo',
            query: {
                taskUuid: row.taskUuid,
                taskName: row.taskName,
                taskDescription: row.taskDescription,
                createTime: row.createTime,
                type: 'mpc',
            }
        }) */
    queryFormPlayer.value.uuid = props.taskUuid
    queryFormTask.value.uuid = props.taskUuid
    console.log('props.taskUuid', props.taskUuid);
    await axios.post('/api/FL/getMyTrainTaskPlayers', queryFormPlayer.value
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
            } else if (response.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                handleClose()
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })

    playerInfoLoading.value = false
}

</script>

<style scoped>
.break-word {
    word-break: break-all;
    /* 允许在单词内换行 */
    white-space: normal;
    /* 允许换行后的空白处理 */
}
</style>