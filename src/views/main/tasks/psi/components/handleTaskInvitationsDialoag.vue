<template>
    <el-dialog class="psi-invi-dialog" v-loading="loadingOpen" @open="handleOpen" width="800"
        :model-value="props.dialogVisibleAccept" @close="handleClose" append-to-body>

        <a-descriptions bordered>
            <a-descriptions-item label="任务Uuid" :span="3">
                <div>{{ props.taskInfo.taskUuid }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="任务ID">{{ props.taskInfo.id }}</a-descriptions-item>
            <a-descriptions-item label="任务名称" :span="2">{{ props.taskInfo.taskName }}</a-descriptions-item>


            <a-descriptions-item label="任务描述" :span="3">{{ props.taskInfo.taskDescription }}</a-descriptions-item>
            <a-descriptions-item label="任务类型">{{ props.taskInfo.taskType }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ props.taskInfo.createTime }}</a-descriptions-item>
            <!--             <a-descriptions-item v-if="theSameUuidTaskList[0].sourceIp" label="发起方Ip">{{
                theSameUuidTaskList[0].sourceIp }}</a-descriptions-item> -->
            <!--             <a-descriptions-item label="Status" :span="3">
                <a-badge status="processing" text="Running" />
            </a-descriptions-item> -->

        </a-descriptions>
        <a-badge-ribbon :text="cardState.content" :color="cardState.color">
            <a-card style="margin-top: 20px;">
                <el-form :model="form" ref="formRef" label-position="left" style="max-width: 600px;padding-left: 30px"
                    label-width="120px">



                    <el-form-item label="导入类型:" prop="type">
                        <el-radio-group v-model="form.type" class="ml-4" :disabled="read">
                            <el-radio :value="0" size="large" :readonly="read">Excel</el-radio>
                            <el-radio :value="1" size="large" :readonly="read">MySQL</el-radio>
                            <!--                     <el-radio :value="2" size="large">达梦数据库</el-radio>
                    <el-radio :value="3" size="large">Oracle</el-radio> -->
                        </el-radio-group>
                    </el-form-item>
                    <div v-show="form.type === 0">

                        <el-form-item label="Excel文件路径:" prop="path">
                            <el-input placeholder="请输入文件在节点的路径,如'./ns_bank.xlsx'" v-model="form.path"
                                :readonly="read" />
                        </el-form-item>
                    </div>
                    <div v-show="form.type != 0">
                        <el-form-item label="数据库名称:" prop="dbName">
                            <el-input placeholder="请输入数据库名称" v-model="form.dbName" :readonly="read" :bordered="!read" />
                        </el-form-item>
                        <el-row>
                            <el-col :span="16">
                                <el-form-item label="数据库IP:" prop="dbIp">
                                    <el-input placeholder="请输入数据库IP" v-model="form.dbIp" :readonly="read" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="2"></el-col>
                            <el-col :span="6">

                                <el-form-item label="端口:" prop="dbPort" label-width="50px">
                                    <a-input-number placeholder="端口号" v-model="form.dbPort" :readonly="read" />
                                </el-form-item></el-col>
                        </el-row>
                        <el-form-item label="数据表名称:" prop="tbName">
                            <el-input placeholder="请输入数据表名称" v-model="form.tbName" :readonly="read" :bordered="!read" />

                        </el-form-item>
                        <el-row>

                            <el-col :span="12" label-width=""> <el-form-item label="数据库用户名:" prop="uname">
                                    <el-input placeholder="请输入数据库用户名" v-model="form.uname" :readonly="read"
                                        :bordered="!read" />
                                </el-form-item></el-col>
                            <el-col :span="2"></el-col>
                            <el-col :span="10">

                                <el-form-item label="密码:" prop="upwd" label-width="50">
                                    <a-tooltip v-if="read" :get-popup-container="getPopupContainer" :title="form.upwd"
                                        color="blue">
                                        <el-input placeholder="请输入数据库用户密码" v-model="form.upwd" show-password
                                            :readonly="read" />
                                    </a-tooltip>
                                    <el-input v-else placeholder="请输入数据库用户密码" v-model="form.upwd" show-password
                                        :readonly="read" />
                                </el-form-item></el-col>
                        </el-row>

                    </div>

                    <el-form-item label="字段索引选择:" prop="fieldName">
                        <div class="fieldict-container">
                            <div class="fieldict" v-for="(value, key) in form.fieldDict">
                                <a-tag class="fieldict-tag">{{ key }}</a-tag><el-icon>
                                    <Sort />
                                </el-icon><a-input-number :min="0" style="text-align: center;" class="fieldict-input"
                                    size="small" v-model:value="form.fieldDict[key]" :bordered="!read"
                                    :readonly="read" />
                            </div>
                        </div>
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

            </a-card>
        </a-badge-ribbon>
        <template v-if="!read" #footer>
            <div style="display: flex; flex-direction: row-reverse;gap: 50px;justify-self: center;">
                <a-button type="primary" :loading="handleClickLoad" @click="onSubmit('accept')">导入</a-button>
                <a-popconfirm v-if="waitingCount != 0" placement="bottom" title="确定拒绝吗？" trigger="click" ok-text="Yes"
                    cancel-text="No" @confirm="onSubmit('reject')" :loading="handleClickLoad" @cancel="cancel"
                    :getPopupContainer="getDialogContainer">
                    <a-button type="primary" danger>
                        拒绝
                    </a-button>
                </a-popconfirm>
            </div>

        </template>
    </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import SomeTools from '@/utils/someTools'
const loadingOpen = ref(true)
const cardState = ref({ content: '待处理', color: 'blue' })
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const handleClickLoad = ref(false)
const theSameUuidTaskList = ref([])
const theSameUuidTaskListTotal = ref(0)
const formRef = ref(null)
const read = ref(false)
const form = ref({
    id: props.taskInfo.id,
    taskName: '',
    dataSourceName: '',
    taskUuid: '',
    createTime: '',
    dataSourceUuid: '',
    taskDescription: '',
    sourceIp: '',
    dataDescription: '',
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
    FieldDictString: '',
    fieldDict: {},
    //dataSourceDescription: '',
})

const rules = ref({
    dataPath: [{
        required: true,
        message: '路径不能为空',
        trigger: 'blur',
    }]
})
const getDialogContainer = () => document.querySelector('.psi-invi-dialog')

const emits = defineEmits(['update:modelValue', 'initMyJoin'])
const handleOpen = async () => {
    cardState.value = { content: '待处理', color: 'blue' }
    read.value = false
    loadingOpen.value = true
    try {
        const response = await axios.post('/api/PSI/getMyTaskInvitationsDetailByUuid', {
            uuid: props.taskInfo.taskUuid,
            page: 1,
            pageSize: 30
        }, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });

        if (response.data.code === 1000) {
            theSameUuidTaskList.value = response.data.data.taskList;
            theSameUuidTaskListTotal.value = response.data.data.total;
            form.value = theSameUuidTaskList.value[0]
            console.log('form.value', form.value);
            // 第一次解析：将字符串还原成正确的 JSON 格式

            // 第二次解析：将 JSON 字符串解析为对象
            form.value.fieldDict = JSON.parse(form.value.FieldDictString);
            console.log('form.value.fieldDict ', form.value.fieldDict);
        } else {
            ElMessage({ type: 'error', message: response.data.message });
        }
    } catch (error) {
        ElMessage({ type: 'error', message: '请求失败，请重试' });

    } finally {
        loadingOpen.value = false; // 关闭加载状态
        if (form.value.state != 2) {
            read.value = true
            if (form.value.state === 0) {
                cardState.value = { content: '已接受', color: 'green' }
            } else if (form.value.state === 1) {
                cardState.value = { content: '已拒绝', color: 'red' }
            }
        }
        loadingOpen.value = false
    }
};

const handleClose = () => {
    emits('update:modelValue', false)
}
const getPopupContainer = trigger => {
    return trigger.parentElement;
};
const onSubmit = async (flag) => {
    handleClickLoad.value = true
    form.value.dataSourceUuid = SomeTools.guid()
    form.value.id = props.taskInfo.id
    formRef.value.validate(async (valid) => {
        if (valid) {
            const sendForm = ref({})
            sendForm.value.id = form.value.id
            sendForm.value.dataSourceUuid = form.value.dataSourceUuid
            sendForm.value.dbIp = form.value.dbIp
            sendForm.value.dbName = form.value.dbName
            sendForm.value.dbPort = form.value.dbPort
            sendForm.value.orcl = form.value.orcl
            sendForm.value.path = form.value.path
            sendForm.value.tbName = form.value.tbName
            sendForm.value.fieldDict = form.value.fieldDict
            sendForm.value.type = form.value.type
            sendForm.value.uname = form.value.uname
            sendForm.value.upwd = form.value.upwd
            if (flag === 'accept') {
                sendForm.value.state = 0
            }
            else if (flag === 'reject') {
                sendForm.value.state = 1
            }
            await axios.post('/api/PSI/handleTaskInvitations', sendForm.value
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {
                        ElMessage({
                            type: 'success',
                            message: flag
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
    handleClickLoad.value = false
}

</script>
<style scoped>
.fieldict-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 30px;
    justify-content: flex-start;
    align-items: center;
    height: 80px;

}

.fieldict {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-self: start;
    gap: 5px;

}

.fieldict-input {
    width: 55px;
    text-align: center;
}



.fieldict-tag {
    margin: 0;
    width: 55px;
    text-align: center;
}

:deep(.my-label) {
    background: var(--el-color-success-light-9) !important;
}

:deep(.my-content) {
    background: var(--el-color-danger-light-9);
}
</style>

<style lang="scss">
.ant-input-number .ant-input-number-input {
    text-align: center;
}
</style>