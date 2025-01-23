<template>

    <el-dialog v-loading="loadingOpen" @open="handleOpen" width="1200" class="mpc-invi-dialog"
        :model-value="props.dialogVisibleAccept" top=5vh @close="handleClose" destroy-on-close append-to-body>

        <a-descriptions class="descriptions" size="small" bordered>
            <a-descriptions-item label="任务Uuid" :span="3">
                <div>{{ props.taskInfo.taskUuid }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="任务ID">{{ props.taskInfo.id }}</a-descriptions-item>
            <a-descriptions-item label="任务名称" :span="2">{{ props.taskInfo.taskName }}</a-descriptions-item>


            <a-descriptions-item label="任务描述" :span="3">{{ props.taskInfo.taskDescription }}</a-descriptions-item>
            <a-descriptions-item label="任务类型">{{ props.taskInfo.taskType }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ props.taskInfo.createTime }}</a-descriptions-item>
            <!--             <a-descriptions-item label="发起方Ip">{{ theSameUuidTaskList[0].sourceIp }}</a-descriptions-item>
 --> <!--             <a-descriptions-item label="Status" :span="3">
                <a-badge status="processing" text="Running" />
            </a-descriptions-item> -->

        </a-descriptions>
        <div class="maniplulate-data-container">
            <hr class="layui-border-black">
            <div class="maniplulate-data">
                <h4 class="title">配置数据</h4>
            </div>

            <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
                <el-tab-pane v-for="(mpcTaskInfo, index) in theSameUuidTaskList" :label='`id-${mpcTaskInfo.id}`'
                    :name="index">

                    <div class="data-header">
                        <el-radio-group v-model="dataSourceType">
                            <el-radio-button label="CSV/Excel" :value="1" />
                            <el-radio-button label="MySQL" :value="2" />
                        </el-radio-group>

                        <div>
                            <span class="title-data">数据描述</span>:
                            <span style="">{{ mpcTaskInfo.dataDescription }}</span>
                        </div>

                    </div>
                    <a-badge-ribbon :text="cardState[mpcTaskInfo.state].content"
                        :color="cardState[mpcTaskInfo.state].color">
                        <a-card style="margin-top:30px;">
                            <div :disabled="mpcTaskInfo.state != 2" class="content" v-if="dataSourceType === 1">
                                <el-form :ref="(el) => setCSVFormRef(el, index)" :model="dataPathArr[activeName]"
                                    :rules="csvRules" :inline="true"
                                    style="display:flex;flex-direction: row;justify-content:space-between">

                                    <el-form-item label="数据源路径:" prop="dataPath">
                                        <el-input style="width:400px;" v-model="dataPathArr[activeName].dataPath"
                                            placeholder="请输入数据源路径" :readonly="mpcTaskInfo.state != 2">
                                            <a-input-number v-model:value=dataPathArr[activeName].column
                                                :readonly="mpcTaskInfo.state != 2"></a-input-number>
                                        </el-input>

                                    </el-form-item>
                                    <el-form-item label="列号:" prop="column" label-width="100px">
                                        <a-input-number placeholder="数据列号"
                                            v-model:value="dataPathArr[activeName].column" />
                                    </el-form-item>

                                </el-form>
                            </div>
                            <div class="content" v-if="dataSourceType === 2">
                                <el-form :ref="(el) => setMySQLFormRef(el, index)" :model="MysqlArr[activeName]"
                                    :rules="mysqlRules" label-position="left" label-width="100px">
                                    <el-row>
                                        <el-col :span="16">
                                            <el-form-item label-width="120" label="数据库名称:" prop="mysqlDbName">
                                                <el-input style="width:30%" placeholder="请输入数据库名称"
                                                    v-model="MysqlArr[activeName].mysqlDbName"
                                                    :readonly="mpcTaskInfo.state != 2" :bordered="!read" />
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="4"></el-col>
                                        <el-col :span="4">

                                            <el-form-item label="列号:" prop="column" label-width="70px">
                                                <a-input-number placeholder="数据列号"
                                                    v-model:value="MysqlArr[activeName].column"
                                                    :readonly="mpcTaskInfo.state != 2" />
                                            </el-form-item></el-col>
                                    </el-row>
                                    <el-row>
                                        <el-col :span="16">
                                            <el-form-item label-width="120" label-positon="right" label="数据库IP:"
                                                prop="mysqlDbIp">
                                                <el-input placeholder="请输入数据库IP"
                                                    v-model="MysqlArr[activeName].mysqlDbIp"
                                                    :readonly="mpcTaskInfo.state != 2" />
                                            </el-form-item>
                                        </el-col>
                                        <el-col :span="4"></el-col>
                                        <el-col :span="4">

                                            <el-form-item width="120px" label="端口:" prop="mysqlDbPort"
                                                label-width="70px">
                                                <el-input placeholder="端口号" v-model="MysqlArr[activeName].mysqlDbPort"
                                                    :readonly="mpcTaskInfo.state != 2" />
                                            </el-form-item></el-col>
                                    </el-row>
                                    <el-form-item label-width="120" label="数据表名称:" prop="mysqlTbName">
                                        <el-input style="width:30%" placeholder="请输入数据表名称"
                                            v-model="MysqlArr[activeName].mysqlTbName"
                                            :readonly="mpcTaskInfo.state != 2" :bordered="!read" />

                                    </el-form-item>
                                    <el-row>

                                        <el-col :span="12"> <el-form-item label-width="120" label="数据库用户名:"
                                                prop="mysqlUser">
                                                <el-input placeholder="请输入数据库用户名"
                                                    v-model="MysqlArr[activeName].mysqlUser"
                                                    :readonly="mpcTaskInfo.state != 2" :bordered="!read" />
                                            </el-form-item></el-col>
                                        <el-col :span="2"></el-col>
                                        <el-col :span="10">

                                            <el-form-item label="密码:" prop="mysqlPassword" label-width="70px">
                                                <a-tooltip v-if="mpcTaskInfo.state === 0"
                                                    :get-popup-container="getPopupContainer"
                                                    :title="MysqlArr[activeName].mysqlPassword" color="blue">
                                                    <el-input placeholder="请输入数据库用户密码"
                                                        v-model="MysqlArr[activeName].mysqlPassword" show-password
                                                        :readonly="mpcTaskInfo.state != 2" />
                                                </a-tooltip>
                                                <el-input v-else placeholder="请输入数据库用户密码"
                                                    v-model="MysqlArr[activeName].mysqlPassword" show-password
                                                    :readonly="mpcTaskInfo.state != 2" />
                                            </el-form-item></el-col>
                                    </el-row>

                                </el-form>
                            </div>
                            <div style="margin-top:20px;" v-if="mpcTaskInfo.state === 2">


                                <div class="select-but">

                                    <a-button type="primary" :loading="handleButLoad"
                                        @click="handleBut('send', activeName)">接受</a-button>
                                    <a-popconfirm placement="bottom" title="确定拒绝吗？" trigger="click" ok-text="Yes"
                                        cancel-text="No" @confirm="handleBut('refuse')" :loading="handleButLoad"
                                        @cancel="cancel" :getPopupContainer="getDialogContainer">
                                        <a-button type="primary" danger>
                                            拒绝
                                        </a-button>
                                    </a-popconfirm>
                                </div>

                            </div>
                        </a-card>
                    </a-badge-ribbon>

                    <!--                     <div style="display: flex; flex-direction: row-reverse; " v-if="mpcTaskInfo.state === 0">
                        <el-result style="width:20px;font-size:20px" icon="success">
                        </el-result>
                    </div>
                    <div style="display: flex; flex-direction: row-reverse; " v-if="mpcTaskInfo.state === 1">
                        <el-result style="width:20px;font-size:20px" icon="error">
                        </el-result>
                    </div> -->
                </el-tab-pane>
            </el-tabs>

            <hr class="layui-border-black">

        </div>
        <!--         <a-badge-ribbon :text="cardState.content" :color="cardState.color">
            <a-card style="margin-top: 30px;" class="my-card">
                <el-form ref="formRef" :model="form" label-position="left">
                    <el-form-item v-if="props.taskInfo.taskType === 'carbon_green_life'" label="数据源路径:" prop="dataPath">
                        <el-input v-model="form.dataPath" placeholder="请输入相应的路径">
                        </el-input>
                    </el-form-item>
            
                    <n-form-item v-if="props.taskInfo && props.taskInfo.taskType !== 'carbon_green_life'" label="path:"
                        prop="credits">

                        <a-row class='credits-container'>

                            <a-col class="credits" :span="24" v-for="(task, index) in theSameUuidTaskList"
                                :key="task.id">
                                <a-tooltip :get-popup-container="getPopupContainer" :title="task.dataDescription"
                                    color="blue" placement="top">
                                    <a-checkable-tag class="dataDescription">
                                        {{ task.dataDescription }}
                                    </a-checkable-tag>
                                </a-tooltip>
                                <a-input :id="task.id" v-model:value="task.dataPath" placeholder="请输入对应数据描述所需数据的路径"
                                    :readonly="singleIconArr[index] === CheckOutlined" />
                                <a-button :type="singleTypeButArr[index]" :loading="singleLoadArr[index]" shape="circle"
                                    :icon="h(singleIconArr[index])" @click="singleSend(task, index)" />

                            </a-col>
                        </a-row>
                    </n-form-item>
                </el-form>
                <a-tag v-if="showInfo && allIsAccept" closable @close="closeInfo" color="success" class="info">
                    <template #icon>
                        <CheckOutlined />
                    </template>
Accept</a-tag>
<a-tag v-if="showInfo && isRefuse" closable @close="closeInfo" color="error" class="info">
    <template #icon>
                        <CloseOutlined />
                    </template>Refuse</a-tag>

</a-card>
</a-badge-ribbon> -->
        <template #footer>
            <div class="footer">
                <a-button tyep="text" @click="handleClose">关闭</a-button>
            </div>
        </template>
    </el-dialog>

</template>
<script setup>
import { nextTick, ref, h, reactive } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowUpOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { NFormItem } from 'naive-ui'
import { log } from 'mathjs';
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const formRefs = ref({})
const showInfo = ref(true)
const formRef = ref()
const theSameUuidTaskList = ref([])
const mysqlForm = ref(null)
const csvForm = ref(null)
const theSameUuidTaskListTotal = ref(0)
const form = ref({
    dataPath: '',
    credits: undefined,
})
const activeName = ref(0)
const setMySQLFormRef = (el, index) => {
    if (el) {
        formRefs.value[`MySQLForm_${index}`] = el;
    }
};
const setCSVFormRef = (el, index) => {
    if (el) {
        formRefs.value[`CSVForm_${index}`] = el;
    }
};

const waitingItem = ref(true)
const allIsAccept = ref(false)
const isRefuse = ref(false)
const isContentLoaded = ref(false)
const singleLoadArr = ref([])
const singleTypeButArr = ref([])
const singleIconArr = ref([])
const emits = defineEmits(['update:modelValue', 'initMyJoin'])
const refuseLoad = ref(false)
const handleClose = () => {
    emits('update:modelValue', false)
}

const dataSourceType = ref(1)
const waitingCount = ref(0)
const cardState = [{ content: '已接受', color: 'green' }, { content: '已拒绝', color: 'red' }, { content: '待处理', color: 'blue' }]
const sendAllLoad = ref(false)
const loadingOpen = ref(true)
const dataPathArr = ref([])
const MysqlArr = ref([])
const handleButLoad = ref(false)
const handleBut = async (flag, index) => {
    handleBut.value = ref(true)
    if (flag === 'send') {
        await send(index)
    }
    else if (flag === 'refuse') {
        await refuse(index)
    }
    handleBut.value = false
}

const singleSend = async (task, index) => {
    if (singleIconArr.value[index] === CheckOutlined || singleIconArr.value[index] === CloseOutlined) return
    singleLoadArr.value[index] = true

    await axios.post('/api/MPC/handleTaskInvitations', { id: task.id, dataPath: task.dataPath, credits: task.credits, state: 0 }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            if (res.data.code === 1000) {
                waitingCount.value = waitingCount.value - 1;
                if (waitingCount.value === 0) {
                    cardState.value = { content: '已接受', color: 'green' }
                }
                singleTypeButArr.value[index] = 'success'
                singleIconArr.value[index] = CheckOutlined
                singleLoadArr.value[index] = false
                ElMessage({
                    type: 'success',
                    message: '发送成功'
                })

            } else if (res.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                handleClose()
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
                singleLoadArr.value[index] = false

            }
        })

}
const handleTabClick = (tab, e) => {

    if (theSameUuidTaskList.value[tab.index].state === 0) {
        dataSourceType.value = theSameUuidTaskList.value[tab.index].dataSourceType
    }
}
const closeInfo = () => {
    showInfo.value = false
}
const handleOpen = async () => {
    cardState.value = { content: '待处理', color: 'blue' }
    waitingCount.value = 0
    allIsAccept.value = false
    isRefuse.value = false
    waitingItem.value = false
    loadingOpen.value = true; // 打开加载状态
    singleLoadArr.value = [];
    singleTypeButArr.value = [];
    singleIconArr.value = [];
    dataPathArr.value = []
    MysqlArr.value = []
    let acceptFlag = true, refuseFlag = false;
    let waitingFlag = false
    try {
        const response = await axios.post('/api/MPC/getMyTaskInvitationsDetailByUuid', {
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

            theSameUuidTaskList.value.forEach(task => {

                if (task.state === 0) {
                    if (task.dataSourceType === 1) {
                        dataPathArr.value.push({ dataPath: task.dataPath, column: task.column })
                        MysqlArr.value.push({})
                    } else {
                        dataPathArr.value.push({})
                        MysqlArr.value.push({
                            mysqlDbIp: task.mysqlDbIp,
                            mysqlDbPort: task.mysqlDbPort,
                            mysqlUser: task.mysqlUser,
                            mysqlPassword: task.mysqlPassword,
                            mysqlDbName: task.mysqlDbName,
                            mysqlTbName: task.mysqlTbName,
                            column: task.column
                        })
                    }
                    singleLoadArr.value.push(false);
                    singleTypeButArr.value.push('success');
                    singleIconArr.value.push(CheckOutlined);
                } else if (task.state === 1) {
                    MysqlArr.value.push({})
                    dataPathArr.value.push({})
                    acceptFlag = false
                    refuseFlag = true
                    singleLoadArr.value.push(false);
                    singleTypeButArr.value.push('error');
                    singleIconArr.value.push(CloseOutlined);
                } else if (task.state === 2) {
                    dataPathArr.value.push({ dataPath: '', column: null })
                    MysqlArr.value.push({
                        mysqlDbIp: '',
                        mysqlDbPort: '',
                        mysqlUser: '',
                        mysqlPassword: '',
                        mysqlDbName: '',
                        mysqlTbName: '',
                        column: null
                    })
                    waitingCount.value = waitingCount.value + 1;

                    console.log('waitingItem', waitingItem.value);
                    waitingFlag = true
                    acceptFlag = false
                    singleLoadArr.value.push(false);
                    singleTypeButArr.value.push('primary');
                    singleIconArr.value.push(ArrowUpOutlined);
                }
            });
            if (theSameUuidTaskList.value[0].state === 0) {
                dataSourceType.value = theSameUuidTaskList.value[0].dataSourceType
            }
        } else if (response.data.code === 1006) {
            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
            handleClose()
            setTimeout(() => {
                router.push({ path: '/login' }); // 确保路径和名称正确
            }, 500); // 避免动画加载导致页面阻塞
            return
        }
        else {
            ElMessage({ type: 'error', message: response.data.message });
        }
    } catch (error) {
        ElMessage({ type: 'error', message: '请求失败，请重试' });
    } finally {
        loadingOpen.value = false; // 关闭加载状态
        if (waitingFlag === true) {
            waitingItem.value = true
            cardState.value = { content: '待处理', color: 'blue' }
            return
        }
        else if (acceptFlag === true) {
            allIsAccept.value = true
            cardState.value = { content: '已接受', color: 'green' }
            return
        }
        else if (refuseFlag === true) {
            isRefuse.value = true
            cardState.value = { content: '已拒绝', color: 'red' }
            return
        }
    }
};
const csvRules = {
    dataPath: [
        {
            required: true,
            message: '请输入CSV/Excel文件路径',
            trigger: 'blur',
        },
        {
            pattern: /^(.*)\.(csv|xlsx|xls)$/,
            message: '请输入合法的文件路径（如 example.csv、example.xlsx、example.xls）',
            trigger: 'blur',
        },
    ],
    column: [
        {
            required: true,
            message: '数据列号不能为空',
            trigger: 'blur',
        },
    ],
};

const mysqlRules = {
    mysqlDbName: [{ required: true, message: '数据库名称不能为空', trigger: 'blur' }],
    mysqlDbIp: [
        {
            required: true,
            message: '数据库IP不能为空',
            trigger: 'blur',
        },
        {
            pattern: /^(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})(\.(25[0-5]|2[0-4]\d|1\d{2}|\d{1,2})){3}$/,
            message: '请输入合法的IP地址（如 192.168.1.1）',
            trigger: 'blur',
        },
    ],
    mysqlDbPort: [{ required: true, message: '端口号不能为空', trigger: 'blur' }],
    mysqlTbName: [{ required: true, message: '数据表名称不能为空', trigger: 'blur' }],
    mysqlUser: [{ required: true, message: '数据库用户名不能为空', trigger: 'blur' }],
    mysqlPassword: [{ required: true, message: '数据库密码不能为空', trigger: 'blur' }],
    column: [{ required: true, message: '数据列号不能为空', trigger: 'blur' }],
};
const send = async (index) => {
    loadingOpen.value = true
    let acceptForm = {}
    let formKey;
    let formInstance;
    let isValid = true
    if (dataSourceType.value === 1) {
        formKey = `CSVForm_${activeName.value}`;
        formInstance = formRefs.value[formKey]
        console.log('formKey', formKey);
        if (formInstance) {
            try {
                await formInstance.validate();
                console.log('训练表单校验通过');
            } catch {
                isTrainValid = false;
                ElMessage({ type: 'warning', message: `请完善表单信息` });
            }
        }
        if (isValid = false) {
            return
        }
        acceptForm = {
            id: theSameUuidTaskList.value[index].id,
            dataSourceType: 1,
            column: dataPathArr.value[index].column,
            dataPath: dataPathArr.value[index].dataPath,
            mysqlDbIp: '',
            mysqlDbPort: '',
            mysqlUser: '',
            mysqlPassword: '',
            mysqlDbName: '',
            mysqlTbName: '',
            state: 0
        }
    }
    if (dataSourceType.value === 2) {

        formKey = `MySQLForm_${activeName.value}`;
        formInstance = formRefs.value[formKey]
        console.log('formKey', formKey);
        console.log('formRefs.value[formKey]', formRefs.value[formKey]);
        console.log('formInstance', formInstance);
        if (formInstance) {
            try {
                await formInstance.validate();
                console.log('评估表单校验通过');
            } catch {
                isValid = false;
                ElMessage({ type: 'warning', message: `请完善表单信息` });
            }
        }
        if (isValid === false) {
            return
        }
        acceptForm = {
            id: theSameUuidTaskList.value[index].id,
            dataSourceType: 2,
            column: MysqlArr.value[index].column,
            dataPath: '',
            mysqlDbIp: MysqlArr.value[index].mysqlDbIp,
            mysqlDbPort: MysqlArr.value[index].mysqlDbPort,
            mysqlUser: MysqlArr.value[index].mysqlUser,
            mysqlPassword: MysqlArr.value[index].mysqlPassword,
            mysqlDbName: MysqlArr.value[index].mysqlDbName,
            mysqlTbName: MysqlArr.value[index].mysqlTbName,
            state: 0
        }
    }
    await axios.post('/api/MPC/handleTaskInvitations', acceptForm, {
        headers: {
            Authorization: localStorage.getItem('token')
        }
    }).then(res => {
        if (res.data.code === 1000) {

            ElMessage({ type: 'success', message: '发送成功' })
            theSameUuidTaskList.value[index].state = 0
            theSameUuidTaskList.value = [...theSameUuidTaskList.value]
        } else if (res.data.code === 1006) {
            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
            handleClose()
            setTimeout(() => {
                router.push({ path: '/login' }); // 确保路径和名称正确
            }, 500); // 避免动画加载导致页面阻塞
            return
        }

        else {

            const msg = res.data.message
            ElMessage({
                type: 'error',
                message: msg,
            })

            return
        }
    }
    )
    loadingOpen.value = false
}
const refuse = async (index) => {

    loadingOpen.value = true

    const refuseForm = {
        id: theSameUuidTaskList.value[index].id,
        dataSourceType: 1,
        column: 1,
        dataPath: '',
        mysqlDbIp: '',
        mysqlDbPort: '',
        mysqlUser: '',
        mysqlPassword: '',
        mysqlDbName: '',
        mysqlTbName: '',
        state: 1
    }
    await axios.post('/api/MPC/handleTaskInvitations', refuseForm
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            if (res.data.code === 1000) {


                ElMessage({
                    type: 'success',
                    message: '已拒绝',
                })
                theSameUuidTaskList.value[index].state = 1


            } else if (res.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                handleClose()
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
            }

            else {

                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
                singleLoadArr.value[i] = false

                refuseLoad.value = false
                return
            }
        })
    loadingOpen.value = false

}
const getPopupContainer = trigger => {
    return trigger.parentElement;
};
const getDialogContainer = () => document.querySelector('.mpc-invi-dialog')

</script>
<style scoped>
.footer {
    display: flex;
    flex-direction: row-reverse;
    flex-wrap: nowrap;
    justify-content: space-between;

}

.select-but {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: center;
    gap: 30px;
}

.credits-container {
    width: 100%;
    padding: 30px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 20px;
}

.descriptions {
    margin-bottom: 30px;
}

.data-header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    row-gap: 20px;
}

.demo-tabs {
    padding-left: 16px;
    padding-right: 16px;
    overflow: visible;
}

.dataDescription {
    width: 160px;
    line-height: 30px;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    /* 保证元素可以缩小以显示省略号 */
    white-space: nowrap;

}

.title {
    font-family: 'Arial';
    font-size: 16px;
    box-sizing: border-box;
    padding: 5px;
    color: black;
    font-weight: 900;
    padding-bottom: 10px;
}

.cell-item {
    display: flex;
    align-items: center;
}



.info {
    position: absolute;
    bottom: 10px;
    /* 距离底部的距离，可根据需要调整 */
    right: 10px;
    /* 距离右侧的距离，可根据需要调整 */
    font-size: 12px;
    /* 调整文本大小 */
    color: #888;
    /* 设置文本颜色 */
}

.credits {

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 5px;
}

.content {
    box-sizing: border-box;
    padding: 10px 50px;
    padding-top: 20px;
}

:deep(.my-label) {
    background: var(--el-color-success-light-9) !important;
}

:deep(.my-content) {
    background: var(--el-color-danger-light-9);
}

.my-card {
    position: relative;
    /* 为绝对定位的子元素提供参考 */
}
</style>

<style>
.invi-dialog {
    .el-dialog__header {
        display: none;
    }
}
</style>