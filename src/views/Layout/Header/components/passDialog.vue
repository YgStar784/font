<template>
    <el-dialog title="修改密码" width="500" @close="handleClose">
        <el-form ref="formRef" :model="form" label-width="auto" style="max-width: 600px" :rules="rules">
            <el-form-item label="旧密码" prop="oldpassword">
                <el-input v-model="form.oldpassword" type="password" placeholder="请输入旧密码" />
            </el-form-item>
            <el-form-item label="新密码" prop="newpassword">
                <el-input v-model="form.newpassword" placeholder="请输入新密码" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newpasswordAgin">
                <el-input v-model="form.newpasswordAgin" type="password" placeholder="请再次输入新密码" />
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
import { changePasswordAPI } from '@/apis/users'
import { sha256 } from 'js-sha256'

const emits = defineEmits(['update:modelValue'])
const form = ref({
    oldpassword: '',
    newpassword: '',
    newpasswordAgin: '',
})
const formRef = ref(null)
const rules = ref({
    oldpassword: [
        {
            required: true,

            message: '请输入旧密码',
            trigger: 'blur',
        },
    ],
    newpassword: [
        {
            required: true,
            message: '请输入新密码',
            trigger: 'blur',
        },
        {
            required: true,
            transform: (value) => value && value.trim(),
            message: '密码不能为空',
            trigger: 'blur'
        }

    ],
    newpasswordAgin: [
        {
            required: true,
            message: '请再次输入新密码',
            trigger: 'blur',
        },
    ],

})

const handleClose = () => {
    emits('update:modelValue', false)
}


const handleConfirm = () => {
    //console.log(form.value)
    const password = localStorage.getItem('password')
    console.log(form.value.oldpassword)
    const oldPassword = sha256(form.value.oldpassword)
    console.log(oldPassword)
    if (oldPassword != password) {
        ElMessage({
            message: '旧密码输入错误！',
            type: 'warning',
        })
    } else if (form.value.newpassword != form.value.newpasswordAgin) {
        ElMessage({
            message: '两次输入的新密码不一致！',
            type: 'warning',
        })
    } else {
        formRef.value.validate(async (valid) => {
            if (valid) {
                const newPassword = sha256(form.value.newpassword)
                console.log(newPassword)
                const res = await changePasswordAPI({ oldPassword, newPassword })
                //console.log(res)
                localStorage.setItem('password', newPassword)
                ElMessage({
                    message: '修改密码成功！',
                    type: 'success',
                })
                handleClose()
            } else {
                console.log('内部错误！')
                return false
            }
        })
    }

}

</script>
