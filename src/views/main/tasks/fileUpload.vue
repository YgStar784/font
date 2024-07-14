<template>
    <!-- <h3 style="padding-bottom: 16px">文件上传</h3>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="文件名称">
            <el-input v-model="form.filename" />
        </el-form-item>
        <el-upload v-model:file-list="fileList" class="upload-demo" :http-request="uploadFile" auto-upload="false"
            action="" :limit="1" :on-exceed="handleExceed" :before-upload="beforeUpload">

            <el-button type="primary">Click to upload</el-button>
            <template #tip>
                <div class="el-upload__tip">
                    jpg/png files with a size less than 500KB.
                </div>
            </template>
</el-upload>
<el-button type="primary" @click="onSubmit">Create</el-button>

</el-form> -->
</template>

<script setup>
import { ref } from 'vue'
import { fileUploadAPI } from '@/apis/upload'
import { ElMessage, ElMessageBox } from 'element-plus'

const form = ref({
    filename: '',
    file: '',
})


const fileList = ref([

])


const uploadFile = (params) => {
    console.log(params)
    form.value.file = params.file
}

const handleExceed = () => {
    ElMessage({
        type: 'warning',
        message: '超出最大问文件数',
    })
}
const beforeUpload = (file) => {
    //类型限制 大小限制
    const isJPG = file.type === 'image/jpeg' ? true : false
    const isLt20M = file.size / 1024 / 1024 < 10 ? true : false
    console.log(isJPG, isLt20M)
    if (!isJPG) {
        ElMessage({
            type: 'warning',
            message: '类型错误',
        })
    }
    if (!isLt20M) {
        ElMessage({
            type: 'warning',
            message: '大小限制',
        })
    }
    return isJPG && isLt20M
}
const fileUpload = async () => {
    console.log(form.value.file)
    let formdata = new FormData()
    formdata.append('name', form.value.filename)
    formdata.append('file', form.value.file)
    const res = await fileUploadAPI(formdata)
    console.log(res)
}
const onSubmit = () => {
    console.log(form.value)
    fileUpload()
}
</script>