<template>
    <el-dialog class="dialog" :model-value="props.dialogVisibleDataSouce" @close="handleClose">
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
            <el-form :model="form" ref="formRef" label-position="left" style="max-width: 600px;padding-left: 30px"
                label-width="120px">

                <!--                 <el-form-item label="数据源名称:" prop="dataSourceName">
                    <el-input placeholder="数据源名称" v-model="props.taskInfo.dbName" readonly="true" />
                </el-form-item> -->
                <el-form-item label="数据源Uuid:" prop="dataSourceUuid">
                    <el-input placeholder="数据源Uuid" v-model="props.taskInfo.dataSourceUuid" readonly="true" />
                </el-form-item>
                <el-form-item label="发起方IP:" prop="dbIp">
                    <el-input placeholder="发起方IP" v-model="props.taskInfo.sourceIp" readonly="true" />
                </el-form-item>
                <el-form-item v-if="props.taskInfo.type === 1" label="数据库名称:" prop="dbName">
                    <el-input placeholder="数据库名称" v-model="props.taskInfo.dbName" readonly="true" />
                </el-form-item>

                <el-form-item label="类型:" prop="type">
                    <el-radio-group v-model="props.taskInfo.type" class="ml-4">
                        <el-radio :value="0" v-if="props.taskInfo.type === 0" size="large"
                            readonly="true">Excel</el-radio>
                        <el-radio :value="1" v-if="props.taskInfo.type === 1" size="large"
                            readonly="true">MySQL</el-radio>
                        <div v-if="props.taskInfo.type === 1">
                            <el-form-item label="数据库IP:" prop="dbIp">
                                <el-input placeholder="数据库IP" v-model="props.taskInfo.dbIp" readonly="true" />
                            </el-form-item>
                            <el-form-item label="数据库端口:" prop="dbPort">
                                <el-input placeholder="数据库端口" v-model="props.taskInfo.dbPort" readonly="true" />
                            </el-form-item>
                        </div>

                        <!--                     <el-radio :value="2" size="large">达梦数据库</el-radio>
                    <el-radio :value="3" size="large">Oracle</el-radio> -->
                    </el-radio-group>
                </el-form-item>
                <div v-show="props.taskInfo.type === 0">
                    <el-form-item label="Excel文件路径:" prop="path">
                        <el-input placeholder="Excel文件路径" v-model="props.taskInfo.path" readonly="true" />
                    </el-form-item>
                </div>
                <div v-if="props.taskInfo.type === 1">
                    <el-form-item label="数据表名称:" prop="tbName">
                        <el-input placeholder="数据表名称" v-model="props.taskInfo.tbName" readonly="true" />

                    </el-form-item>
                    <el-form-item label="数据库用户名:" prop="uname">
                        <el-input placeholder="数据库用户名" v-model="props.taskInfo.uname" readonly="true" />
                    </el-form-item>
                    <el-form-item label="数据库用户密码:" prop="upwd">
                        <el-input placeholder="数据库用户密码" v-model="props.taskInfo.upwd" show-password readonly="true" />
                    </el-form-item>


                </div>
                <el-form-item label="数据源字段信息:" prop="fieldName">
                    <el-input placeholder="数据源字段信息" v-model="props.taskInfo.fieldName" readonly="true" />
                </el-form-item>
                <!--               <el-form-item label="数据源描述:" prop="dataSourceDescription">
                    <el-input placeholder="请输入数据源描述,例'银行用数据源'" v-model="form.dataSourceDescription" />
                </el-form-item> -->
                <!--             <el-form-item label="任务类型:">
                <el-radio-group v-model="radio">
                    <el-radio :value="0">匿踪查询</el-radio>
                    <el-radio :value="1">联邦学习</el-radio>
                    <el-radio :value="2">安全多方计算</el-radio>
                    <el-radio :value="3">隐私求交</el-radio>
                </el-radio-group></el-form-item> -->

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
    state: 0,
    //dataSourceDescription: '',
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
            await axios.post('/api/PIR/handleTaskInvitations', form.value
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {
                        ElMessage({
                            type: 'success',
                            message: '导入成功'
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