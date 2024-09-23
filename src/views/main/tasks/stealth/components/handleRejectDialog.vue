<template>
    <el-dialog v-model="centerDialogVisible" title="确认" width="500" @close="handleClose" align-center center>
        <span>
            确定要拒绝任务“{{ props.taskInfo.taskName }}”吗？
        </span>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" @click="onSubmit">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
const emits = defineEmits(['update:modelValue', 'initMyJoin'])
const handleClose = () => {
    emits('update:modelValue', false)
}
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const form = ref({
    id: props.taskInfo.id,
    dataSourceName: '',
    dataSourceUuid: props.taskInfo.dataSourceUuid,
    dbIp: '',
    dbName: '',
    dbPort: '',
    tbName: '',
    uname: '',
    upwd: '',
    orcl: '',
    path: '',
    fieldName: '',
    type: 0,
    state: 1,
    //dataSourceDescription: '',
})
const onSubmit = async () => {
    await axios.post('/api/PIR/handleTaskInvitations', form.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            if (res.data.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '已拒绝'
                })
                emits('initMyJoin')
                handleClose()
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
</script>