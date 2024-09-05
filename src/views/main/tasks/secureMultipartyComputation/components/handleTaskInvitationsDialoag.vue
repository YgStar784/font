<template>
    <el-dialog class="dialog" :model-value="props.dialogVisibleAccept" @close="handleClose">
        <el-card style=" padding-top: 20px; margin-bottom: 20px;">
            <el-descriptions title="基本信息">
                <el-descriptions-item label="任务ID">{{ props.taskInfo.id }}</el-descriptions-item>
                <el-descriptions-item label="任务名称">{{ props.taskInfo.taskName }}</el-descriptions-item>
                <el-descriptions-item label="角色">任务参与方</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ props.taskInfo.createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述">{{ props.taskInfo.taskDescription }}</el-descriptions-item>
                <el-descriptions-item label="数据源描述" label-class-name="my-label" class-name="my-content">{{
                    props.taskInfo.dataDescription }}</el-descriptions-item>
            </el-descriptions>
        </el-card>

        <el-card>
            <el-form ref="formRef" :model="form" label-position="left" :rules="rules">
                <el-form-item label="数据源路径:" prop="dataPath">
                    <el-input v-model="form.dataPath" placeholder="请输入相应的路径">
                    </el-input>
                </el-form-item>
                <el-form-item style="float:right">
                    <el-button type="primary" @click="onSubmit">发送</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const formRef = ref()
const form = ref({
    dataPath: '',
})
const rules = ref({
    dataPath: [{
        required: true,
        message: '路径不能为空',
        trigger: 'blur',
    }]
})
const emits = defineEmits(['update:modelValue', 'initMyJoin'])

const handleClose = () => {
    emits('update:modelValue', false)
}
const onSubmit = async () => {

    formRef.value.validate(async (valid) => {
        if (valid) {
            await axios.post('/api/MPC/handleTaskInvitations', { id: props.taskInfo.id, dataPath: form.value.dataPath, state: 0 }
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {
                        ElMessage({
                            type: 'success',
                            message: '发送成功'
                        })
                        formRef.value.resetFields()
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
        else {
            ElMessage({ type: 'error', message: '繁忙，请稍后再试' })
        }
    })

}
</script>
<style scoped>
:deep(.my-label) {
    background: var(--el-color-success-light-9) !important;
}

:deep(.my-content) {
    background: var(--el-color-danger-light-9);
}
</style>