<template>
    <el-dialog v-model="centerDialogVisible" v-loading="loadingOpen" @open="handleOpen" title="确认" width="500"
        @close="handleClose" align-center center>
        <span>
            确定要拒绝任务“{{ props.taskInfo.taskName }}”吗？
        </span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button :loading="refuseLoad" type="primary" @click="onSubmit">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import axios from 'axios'
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
const emits = defineEmits(['update:modelValue', 'initMyJoin'])
const handleClose = () => {
    emits('update:modelValue', false)
}
const singleLoadArr = ref([])
const singleTypeButArr = ref([])
const singleIconArr = ref([])
const theSameUuidTaskList = ref([])
const theSameUuidTaskListTotal = ref(0)
const loadingOpen = ref(false)
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const refuseLoad = ref(false)
const handleOpen = async () => {
    singleLoadArr.value = []
    singleTypeButArr.value = []
    singleIconArr.value = []
    await nextTick();
    loadingOpen.value = true
    await axios.post('/api/MPC/getMyTaskInvitationsDetailByUuid', {
        uuid: props.taskInfo.taskUuid,
        page: 1,
        pageSize: 2
    }, {
        headers: {
            Authorization: localStorage.getItem('token'),
        }
    }).then(res => {
        if (res.data.code === 1000) {
            theSameUuidTaskList.value = res.data.data.taskList
            theSameUuidTaskListTotal.value = res.data.data.total
        }
        else {
            const msg = res.data.message
            ElMessage({
                type: 'error',
                message: msg,
            })
        }
    })

    loadingOpen.value = false
}
const onSubmit = async () => {
    refuseLoad.value = true
    let allAcceptflag = true

    // 使用 for...of 代替 forEach 以便使用 await
    for (let index = 0; index < theSameUuidTaskList.value.length; index++) {
        const task = theSameUuidTaskList.value[index]

        if (task.state === 2) {
            allAcceptflag = false
            try {
                const res = await axios.post('/api/MPC/handleTaskInvitations', {
                    id: task.id,
                    dataPath: task.dataPath,
                    credits: task.credits,
                    state: 1
                }, {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                })

                if (res.data.code === 1000) {
                    if (index === theSameUuidTaskList.value.length - 1) {
                        ElMessage({
                            type: 'success',
                            message: '已拒绝'
                        })
                        emits('initMyJoin')

                    }
                } else {
                    ElMessage({
                        type: 'error',
                        message: res.data.message,
                    })
                }
            } catch (error) {
                ElMessage({
                    type: 'error',
                    message: '请求失败，请重试',
                })
            }
        }
    }

    refuseLoad.value = false

    if (allAcceptflag) {
        ElMessage({ type: 'warning', message: '所有 credits 已上传，您已接受，拒绝失败' })
        handleClose()
    }
}
</script>
