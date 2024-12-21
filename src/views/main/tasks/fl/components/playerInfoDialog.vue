<template>

    <el-dialog class="dialog" :model-value="dialogVisiblePlayer" width="1000px" @close="handleClose" append-to-body>
        <el-card>
            <el-descriptions title="基本信息">
                <el-descriptions-item label="任务ID">{{ props.taskUuid }}</el-descriptions-item>
                <el-descriptions-item label="任务名称">{{ props.taskName }}</el-descriptions-item>
                <el-descriptions-item label="角色">任务发起方</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ props.createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述">{{ props.taskDescription }}</el-descriptions-item>



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
const taskPlayerList = ref([])
const playerInfoLoading = ref(false)
const playertotal = ref(0)
const props = defineProps({
    dialogValue: {
        type: String,
        default: '',
        required: true
    },
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
})
const queryFormPlayer = ref({
    uuid: '',
    page: 1,
    pageSize: 30
})
const emits = defineEmits(['update:modelValue'])

const handleClose = () => {
    emits('update:modelValue', false)
}
const handlePlayerInfo = async () => {
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
onMounted(async () => {
    playerInfoLoading.value = true
    await handlePlayerInfo()
    playerInfoLoading.value = false
})
</script>

<style scoped>
.break-word {
    word-break: break-all;
    /* 允许在单词内换行 */
    white-space: normal;
    /* 允许换行后的空白处理 */
}
</style>