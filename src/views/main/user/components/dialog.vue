<template>
    <el-dialog :model-value="dialogVisible" :title="dialogValue" width="500" @close="handleClose">
        <el-form ref="formRef" :model="form" label-width="auto" style="max-width: 600px" :rules="rules">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" />
            </el-form-item>
            <el-form-item label="节点IP" prop="nodeIp">
                <el-input v-model="form.nodeIp" />
            </el-form-item>
            <el-form-item label="节点端口" prop="nodePort">
                <el-input v-model="form.nodePort" />
            </el-form-item>
            <!-- <el-form-item label="节点描述" prop="nodeDescription">
                <el-input v-model="form.nodeDescription" />
            </el-form-item> -->
            <el-form-item label="节点描述" prop="nodeDescription">
                <el-select v-model="form.nodeDescription" placeholder="请选择">
                    <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>

        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">取消</el-button>
                <el-button type="primary" @click="handleConfirm">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

import { ElMessage } from 'element-plus'
import { editUserAPI } from '@/apis/users'
import { registerUserAPI } from '@/apis/users'
import { compileScript } from 'vue/compiler-sfc'
// import { changeGlobalNodesTarget } from 'element-plus/es/utils'
const emits = defineEmits(['update:modelValue', 'initUserList'])
const form = ref({
    username: '',
    nodeIP: '',
    nodeDescription: '',
    nodePort: '',
})
const formRef = ref(null)

const options = [{
    value: "普通用户",
    label: "普通用户"
}, {
    value: "管理员",
    label: "管理员"
}]


const rules = ref({
    username: [
        {
            required: true,
            message: '请输入要创建的用户名',
            trigger: 'blur',
        },
    ],
    nodeIp: [
        {
            required: true,
            message: '请输入要创建的节点IP地址',
            trigger: 'blur',
        },
    ],
    nodePort: [
        {
            required: true,
            message: '请输入要创建的节点IP端口',
            trigger: 'blur',
        },
    ],
    nodeDescription: [
        {
            required: true,
            message: '请输入要创建的节点描述',
            trigger: 'blur',
        },
    ],

})
const props = defineProps({
    dialogValue: {
        type: String,
        default: '',
        required: true
    },
    dialogTableValue: {
        type: Object,
        default: () => { }
    }
})
console.log(props.dialogValue)
watch(() => props.dialogTableValue, () => {
    console.log(props.dialogTableValue)
    form.value = props.dialogTableValue
    console.log(form.value.nodeIP)

}, { deep: true, immediate: true })
const handleClose = () => {
    emits('update:modelValue', false)
}


const handleConfirm = () => {
    console.log(form.value)
    formRef.value.validate(async (valid) => {
        if (valid) {
            const res = await registerUserAPI(form.value)
            if (res.code === 1000) {
                ElMessage({
                    message: '注册成功！',
                    type: 'success',
                })
                emits('initUserList')
                handleClose()
            } else if (res.code === 1002) {
                ElMessage({
                    message: '用户名重复！',
                    type: 'warning',
                })
            } else if (res.code === 1005) {
                ElMessage({
                    message: '服务器繁忙！',
                    type: 'warning',
                })
            }
        } else {
            console.log('未知错误！')
            return false
        }
    })

}

</script>
