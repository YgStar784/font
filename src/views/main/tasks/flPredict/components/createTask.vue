<template>
    <el-dialog v-loading="loading" class="flPr-add-dialog" @open="handleOpen" width="1200" :model-value="dialogVisible"
        @close="handleClose" top="5vh" title="联邦预测-任务创建" append-to-body destroy-on-close>
        <el-form label-position="right" label-width="120px" :model="form" :rules="rules" ref="formRef">
            <el-form-item label="任务名称:" label-position="left" prop="taskName">
                <el-input style="width: 240px" v-model="form.taskName"></el-input>
            </el-form-item>
            <el-form-item label="任务描述:" label-position="right">
                <el-input v-model="form.taskDescription" style="width: 240px" autosize type="textarea"
                    placeholder="请输入任务描述" /> </el-form-item>
            <el-form-item label="模型文件:" prop="model">
                <el-upload ref="modelUpload" v-model:file-list="modelList" :limit="1" class="upload-demo" action="#"
                    :http-request="httpRequest" :before-upload="beforeUploadModel" :on-exceed="handleModelExceed"
                    :on-change="handleFileChange('model')" :auto-upload="false" accept=".pth">
                    <el-button type="primary">点击上传</el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            文件后缀名".pth"
                        </div>
                    </template>
                </el-upload>
            </el-form-item>

            <el-form-item label="输入文件:" prop="input">
                <el-upload ref="inputUpload" v-model:file-list="inputList" class="upload-demo"
                    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                    :before-upload="beforeUploadInput" :limit="1" :on-exceed="handleInputExceed"
                    :http-request="httpRequest" :on-change="handleFileChange('input')" :auto-upload="false"
                    accept=".zip,.csv,.xls,.sql">
                    <el-button type="primary">点击上传</el-button>
                    <template #tip>
                        <div class="el-upload__tip">
                            文件后缀名"zip",".xls",".csv",".sql"
                        </div>
                    </template>
                </el-upload>

            </el-form-item>
            <el-form-item label="输入数据类型 :">
                <a-select v-model:value="SelectedType" style="width: 120px" :options="dataType" @focus="focus"
                    @change="handleChange" :getPopupContainer="getDialogContainer"></a-select>
            </el-form-item>
            <el-form-item v-if="SelectedType === 4" label="image_format">
                <a-select v-model:value="selectedFormat" id="image-format" :options="imageForamtType" @focus="focus"
                    style="width: 120px" :getPopupContainer="getDialogContainer">
                </a-select>
            </el-form-item>
            <el-form-item label="JSON 数据:" prop="data">
                <el-input v-model="form.data" type="textarea" placeholder="请输入模型配置"></el-input>
            </el-form-item>

        </el-form>

        <div class="sub-but">
            <el-button type="primary" @click="submitForm">提交</el-button>
            <el-button @click="handleClose">取消</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import SomeTools from '@/utils/someTools'
import { nowDate } from '../../date'
import { ref, reactive } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { genFileId } from 'element-plus'
const emits = defineEmits(['update:modelValue', 'initTaskList'])
const modelUpload = ref(null)
const inputUpload = ref(null)
const dialogVisible = ref(false)
const formRef = ref(null)
const loading = ref(false)
const form = reactive({
    taskName: '',
    taskDescription: '',
    model: null,
    input: null,
    data: '',
})
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const modelList = ref([])
const inputList = ref([])
const handleClose = () => {
    emits('update:modelValue', false)
}
const SelectedType = ref(1)
const selectedFormat = ref('gray')
const dataType = ref([{ value: 1, label: 'MySQL' }
    ,
{ value: 2, label: 'CSV' },
{ value: 3, label: 'Excel' }
    , { value: 4, label: 'ImageZip' },
])

const imageForamtType = ref([{ value: 'gray', label: 'gray' }, { value: 'rgb', label: 'rgb' }, { value: 'rgba', label: 'rgba' }, { value: 'jpeg', label: 'jpeg' }, { value: 'png', label: 'png' }])
// 移动函数定义到引用前面
const validateModelFile = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('模型文件是必填项'))
    }
    if (!value[0].name.endsWith('.pth')) {
        return callback(new Error('仅支持 .pth 文件'))
    }
    callback()
}

const validateInputFile = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('输入文件是必填项'))
    }
    if (!value[0].name.endsWith('.zip')) {
        return callback(new Error('仅支持 .zip 文件'))
    }
    callback()
}

const validateJSON = (rule, value, callback) => {
    try {
        JSON.parse(value)
        callback()
    } catch (e) {
        callback(new Error('无效的 JSON 数据'))
    }
}

const rules = reactive({
    taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }
    ],
    model: [{ required: true, message: '请上传模型文件', trigger: 'blur' }],
    input: [{ required: true, message: '请上传输入文件', trigger: 'blur' }],
    data: [
        { required: true, message: '请输入 JSON 数据', trigger: 'blur' },
        { validator: validateJSON, trigger: 'blur' }
    ]
})

const getDialogContainer = () => document.querySelector('.flPr-add-dialog')

const beforeUploadModel = (file) => {
    console.log('file', file);
    const isPth = file.name.endsWith('.pth')
    if (!isPth) {
        ElMessage({ type: 'error', message: '只能上传 .pth 文件' })

    }
    return isPth
}

const beforeUploadInput = (file) => {
    const isZip = file.type === 'application/zip' && file.name.endsWith('.zip')
    if (!isZip) {
        ElMessage({ type: 'error', message: '上传的文件格式不符' })
    }
    return isZip
}

const handleFileChange = (field) => {
    console.log('field', field);
}
const handleModelExceed = (files) => {
    modelUpload.value.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    modelUpload.value.handleStart(file);
};
const handleInputExceed = (files) => {
    inputUpload.value.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    inputUpload.value.handleStart(file);
};
const submitForm = () => {
    console.log('model,input', modelList.value[0], inputList.value);
    form.model = modelList.value[0],
        form.input = inputList.value[0]
    if (!formRef.value) return
    formRef.value.validate((valid) => {
        const data = reactive({})
        data.name = form.taskName
        data.taskUuid = SomeTools.guid()
        data.taskDescription = form.taskDescription
        data.createTime = nowDate(time)
        data.task_id = data.taskUuid
        if (inputList.value[0].raw.name.endsWith('.zip')) {
            data.type = 4
        } else if (inputList.value[0].raw.name.endsWith('.csv')) {
            data.type = 2
        } else if (inputList.value[0].raw.name.endsWith('.xls')) {
            data.type = 3
        } else if (inputList.value[0].raw.name.endsWith('.sql')) {
            data.type = 1
        }
        if (valid) {
            loading.value = true
            const formData = new FormData()
            formData.append('model', modelList.value[0].raw)
            formData.append('input', inputList.value[0].raw)
            formData.append('data', form.data)
            for (let [key, value] of formData.entries()) {
                console.log(key, value); // 遍历 FormData 并打印内容
            }

        } else {
            console.log('表单验证失败')
        }
    })
}

</script>

<style lang="scss" scoped>
.sub-but {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 20px;
}
</style>