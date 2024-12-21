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

        <a-badge-ribbon :text="cardState.content" :color="cardState.color">
            <a-card style="margin-top: 30px;" class="my-card">
                <el-form ref="formRef" :model="form" label-position="left">
                    <el-form-item v-if="props.taskInfo.taskType === 'carbon_green_life'" label="数据源路径:" prop="dataPath">
                        <el-input v-model="form.dataPath" placeholder="请输入相应的路径">
                        </el-input>
                    </el-form-item>
                    <!--credits弃用-->
                    <!--                 <n-form-item v-if="props.taskInfo && props.taskInfo.taskType !== 'carbon_green_life'" label="credits:"
                    prop="credits">

                    <a-row class='credits-container'>

                        <a-col class="credits" :span="11" v-for="(task, index) in theSameUuidTaskList" :key="task.id">
                            <a-tooltip :get-popup-container="getPopupContainer" :title="task.dataDescription"
                                color="blue" placement="top">
                                <a-checkable-tag class="dataDescription">
                                    {{ task.dataDescription }}
                                </a-checkable-tag>
                            </a-tooltip>
                            <a-input-number :id="task.id" v-model:value="task.credits" :min="0"
                                :readonly="singleIconArr[index] === CheckOutlined" />
                            <a-button :type="singleTypeButArr[index]" :loading="singleLoadArr[index]" shape="circle"
                                :icon="h(singleIconArr[index])" @click="singleSend(task, index)" />

                        </a-col>
                    </a-row>
                </n-form-item> -->
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

                <!--             <el-form v-else-if="theSameUuidTaskList[0].state === 0" ref="formRef" :model="form" label-position="left"
                :rules="rules">
                <el-form-item v-if="props.taskInfo.taskType === 'carbon_green_life'" label="数据源路径:" prop="dataPath">
                    <el-input v-model="form.dataPath" placeholder="请输入相应的路径" readonly>
                    </el-input>
                </el-form-item>
                <el-form-item v-if="props.taskInfo.taskType !== 'carbon_green_life'" label="credits:" prop="credits">
                    <div class="credits">
                        <a-input-number v-for="(task, index) in theSameUuidTaskList" :id="task.id"
                            v-model:value="task.credits" :min="0" readonly />
                    </div>
                </el-form-item>
            </el-form> -->
            </a-card>
        </a-badge-ribbon>
        <template #footer>
            <div class="footer">


                <div class="select-but">

                    <a-button type="primary" v-if="waitingCount != 0" :loading="handleButLoad"
                        @click="handleBut('sendAll')">sendAll</a-button>
                    <a-popconfirm v-if="waitingCount != 0" placement="bottom" title="确定拒绝吗？" trigger="click"
                        ok-text="Yes" cancel-text="No" @confirm="handleBut('refuse')" :loading="handleButLoad"
                        @cancel="cancel" :getPopupContainer="getDialogContainer">
                        <a-button type="primary" danger>
                            refuse
                        </a-button>
                    </a-popconfirm>
                </div>

                <a-button tyep="text" @click="handleClose">关闭</a-button>
            </div>
        </template>
    </el-dialog>

</template>
<script setup>
import { nextTick, ref, h } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { ArrowUpOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons-vue';
import { NFormItem } from 'naive-ui'
import { log } from 'mathjs';
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const showInfo = ref(true)
const formRef = ref()
const theSameUuidTaskList = ref([])
const theSameUuidTaskListTotal = ref(0)
const form = ref({
    dataPath: '',
    credits: undefined,
})
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
const waitingCount = ref(0)
const cardState = ref({ content: '待处理', color: 'blue' })
const sendAllLoad = ref(false)
const loadingOpen = ref(true)
const handleButLoad = ref(false)
const handleBut = async (flag) => {
    handleBut.value = ref(true)
    if (flag === 'sendAll') {
        await sendAll()
    }
    else if (flag === 'refuse') {
        await refuse()
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
                    singleLoadArr.value.push(false);
                    singleTypeButArr.value.push('success');
                    singleIconArr.value.push(CheckOutlined);
                } else if (task.state === 1) {
                    acceptFlag = false
                    refuseFlag = true
                    singleLoadArr.value.push(false);
                    singleTypeButArr.value.push('error');
                    singleIconArr.value.push(CloseOutlined);
                } else if (task.state === 2) {
                    waitingCount.value = waitingCount.value + 1;
                    console.log('waitingItem', waitingItem.value);
                    waitingFlag = true
                    acceptFlag = false
                    singleLoadArr.value.push(false);
                    singleTypeButArr.value.push('primary');
                    singleIconArr.value.push(ArrowUpOutlined);
                }
            });
        } else {
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

const sendAll = async () => {


    if (props.taskInfo.taskType === 'carbon_green_life') {
        if (form.value.credits === undefined) {
            form.value.credits = 0
        }
    }

    else {
        let doFlag = false
        sendAllLoad.value = true

        for (let i = 0; i < theSameUuidTaskList.value.length; i++) {
            if (singleIconArr.value[i] === CheckOutlined) continue;
            singleLoadArr.value[i] = true
            doFlag = true
            await axios.post('/api/MPC/handleTaskInvitations', { id: theSameUuidTaskList.value[i].id, dataPath: theSameUuidTaskList.value[i].dataPath, credits: theSameUuidTaskList.value[i].credits, state: 0 }
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {
                        waitingCount.value = waitingCount.value - 1;

                        singleLoadArr.value[i] = false
                        singleIconArr.value[i] = CheckOutlined
                        singleTypeButArr.value[i] = 'success'
                        if (i === theSameUuidTaskList.value.length - 1) {
                            console.log('i', i)

                            ElMessage({
                                type: 'success',
                                message: 'AllSend',
                            })
                            sendAllLoad.value = false

                            singleLoadArr.value[i] = false
                            waitingCount.value = 0
                            cardState.value = { content: '已接受', color: 'green' }

                            emits('initMyJoin')
                        }
                    }
                    else {

                        const msg = res.data.message
                        ElMessage({
                            type: 'error',
                            message: msg,
                        })
                        sendAllLoad.value = false
                        singleLoadArr.value[i] = false

                        return
                    }
                })

        }
        if (!doFlag) {
            ElMessage({
                type: 'info',
                message: 'All is sent'
            })
            sendAllLoad.value = false
            return
        }

    }
}
const refuse = async () => {

    let doFlag = true
    if (props.taskInfo.taskType === 'carbon_green_life') {
        if (form.value.credits === undefined) {
            form.value.credits = 0
        }
    }

    else {
        refuseLoad.value = true
        let doFlag = false

        for (let i = 0; i < theSameUuidTaskList.value.length; i++) {
            if (singleIconArr.value[i] === CheckOutlined) continue;
            singleLoadArr.value[i] = true
            doFlag = true
            await axios.post('/api/MPC/handleTaskInvitations', { id: theSameUuidTaskList.value[i].id, dataPath: theSameUuidTaskList.value[i].dataPath, credits: theSameUuidTaskList.value[i].credits, state: 1 }
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {

                        singleLoadArr.value[i] = false

                        singleIconArr.value[i] = CloseOutlined
                        singleTypeButArr.value[i] = 'error'
                        if (i === theSameUuidTaskList.value.length - 1) {
                            console.log('i', i);
                            singleIconArr.value[i] = CloseOutlined
                            singleTypeButArr.value[i] = 'error'
                            ElMessage({
                                type: 'success',
                                message: 'AllRefuse',
                            })
                            waitingCount.value = 0
                            cardState.value = { content: '已拒绝', color: 'red' }
                            refuseLoad.value = false
                            singleLoadArr.value[i] = false


                            emits('initMyJoin')


                        }
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

        }
        if (!doFlag) {
            ElMessage({
                type: 'info',
                message: 'All is sent'
            })
            sendAllLoad.value = false

        }

    }
}
const getPopupContainer = trigger => {
    return trigger.parentElement;
};
const getDialogContainer = () => document.querySelector('.mpc-invi-dialog')

</script>
<style scoped>
.footer {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;

}

.select-but {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    gap: 10px;
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