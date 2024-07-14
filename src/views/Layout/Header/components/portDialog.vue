<template>
    <el-dialog title="修改端口" width="500" @close="handleClose">
        <el-form ref="formRef" :model="form" label-width="auto" style="max-width: 600px" :rules="rules">
            <el-form-item label="当前端口号" prop="oldPort" readonly="true">
                <el-input v-model="form.oldPort" />
            </el-form-item>
            <el-form-item label="新的端口号" prop="newPort">
                <el-input v-model="form.newPort" placeholder="请输入新端口号" />
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
import { ref } from 'vue'

import { ElMessage } from 'element-plus'
import { changePortAPI } from '@/apis/users'

const emits = defineEmits(['update:modelValue'])
const form = ref({
    oldPort: localStorage.getItem('nodePort'),
    newPort: '',
})
const formRef = ref(null)
const rules = ref({
    newPort: [
        {
            required: true,
            message: '端口号不能为空',
            trigger: 'blur',
        },


    ],

})

const handleClose = () => {
    emits('update:modelValue', false)
}


const handleConfirm = () => {
    //console.log(form.value)

    formRef.value.validate(async (valid) => {
        if (valid) {
            const res = await changePortAPI({ newPort: form.value.newPort })
            //console.log(res)
            if (res.code === 1000) {
                localStorage.setItem('nodePort', form.value.newPort)
                ElMessage({
                    message: '修改端口成功！',
                    type: 'success',
                })
                handleClose()
            } else {
                ElMessage({
                    message: res.message,
                    type: 'error',
                })
            }
        } else {
            console.log('内部错误！')
            return false
        }
    })


}

</script>