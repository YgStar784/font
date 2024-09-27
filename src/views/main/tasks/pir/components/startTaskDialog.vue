<template>
    <el-dialog class="dialog" @opened="onDialogOpened" :model-value="props.dialogVisibleStartTask" @close="handleClose">
        <el-card>

            <el-form :model="form" ref="formRef" label-position="left" label-width="auto" style="max-width: 700px">

                <el-form-item label="字段选择:" prop="keyField">
                    <el-select v-model="form.keyField" @change="handleChange" placeholder="请选择要查询的字段信息">
                        <el-option v-for="item in column_options" :label="item" :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="字段值:" prop="keyWord">
                    <el-input placeholder="请输入要查询的字段值" v-model="form.keyWord" />
                </el-form-item>
                <el-form-item label="不可区分度:" prop="degree">
                    <el-input type="number" placeholder="请输入不可区分度" v-model="form.degree" />
                </el-form-item>
                <el-form-item v-if="form.keyField != ''" label="查询字段:" prop="queryFields">
                    <el-checkbox-group v-model="checkboxGroup" size="large">
                        <el-checkbox-button v-for="(item, index) in left_options" :key="index" :value="item">

                            {{ item }}
                        </el-checkbox-button>

                    </el-checkbox-group> </el-form-item>
                <el-form-item class="subButton" style="float:right">


                    <el-button type="primary" @click="onSubmit">开始</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </el-dialog>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { log } from 'mathjs';
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const left_options = ref([])
const column_options = ref([])
const formRef = ref()
const form = ref({
    taskUuid: props.taskInfo.taskUuid,
    keyField: '',
    keyWord: '',
    degree: '',
    queryFields: [],
    //dataSourceDescription: '',
})
const checkboxGroup = ref([])

const rules = ref({
    dataPath: [{
        required: true,
        message: '路径不能为空',
        trigger: 'blur',
    }]
})
const emits = defineEmits(['update:modelValue', 'initMyJoin'])

const handleChange = (value) => {
    console.log(value);
    left_options.value = column_options.value.filter(item => item !== value);

}
const handleClose = () => {
    emits('update:modelValue', false)
}
const onDialogOpened = () => {
    column_options.value = props.taskInfo.fieldName.split(',');
}
const onSubmit = async () => {
    let temp
    form.value.taskUuid = props.taskInfo.taskUuid
    checkboxGroup.value.forEach((item) => {
        temp = { fieldName: item, standFieldName: item }
        form.value.queryFields.push(temp)
    })
    form.value.degree = Number(form.value.degree)

    formRef.value.validate(async (valid) => {
        if (valid) {
            await axios.post('/api/PIR/startTask', form.value
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {
                        ElMessage({
                            type: 'success',
                            message: '开始成功'
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