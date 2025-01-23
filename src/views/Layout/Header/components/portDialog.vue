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
import { useRouter } from 'vue-router'
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
        {
            pattern: /^([1-9][0-9]{0,4}|0)$/,
            message: '端口号必须是0到65535之间的数字',
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
            } else if (res.code === 1006) {
                ElMessage({ type: 'warning', message: 'token过期，请重新登录' })
                handleClose()
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
            }
            else {
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