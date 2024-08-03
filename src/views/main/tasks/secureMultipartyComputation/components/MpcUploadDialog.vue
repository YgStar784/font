<template>

    <el-dialog class="dialog" :model-value="dialogVisible" @close="handleClose">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>
                        <h3 class="title">
                            任务添加-安全多方计算
                        </h3>
                    </span>
                </div>
            </template>
            <div class="form">
                <el-form ref="formRef" style="max-width: 600px" label-width="auto" label-position="left">
                    <el-form-item label="任务名称:">

                        <el-input class="myinput" v-model="form.taskName" style="width: 200px;" placeholder="请输入任务名称" />

                    </el-form-item>
                    <el-form-item label="任务描述:">

                        <el-input class="myinput" v-model="form.taskDescription" style="width: 240px" autosize
                            type="textarea" placeholder="相关任务描述" />

                    </el-form-item>
                    <el-form-item label="参与方数量:">
                        <el-input-number v-model="form.nodeNum" controls-position="right" @change="handleNumChange"
                            :min="1" :max="10" style="width:88px;">
                        </el-input-number>
                    </el-form-item>
                    <el-form-item>

                    </el-form-item>
                    <div v-for="(item, index) in form.nodeInfo">
                        <el-form-item class="users" :label='`节点-${index}:`'>
                            <el-select class="custom-select" v-model="item.nodeAddress" placeholder="请选择节点"
                                @change="handleUserSelectChange(index)">
                                <el-option class="option" v-for="item in currentUsersList" :key="item.id"
                                    :label='`${item.username}:${item.nodeIp}:${item.nodePort}`'
                                    :value='`${item.nodeIp}:${item.nodePort}`'>
                                </el-option>
                                <div class="pagination-container">
                                    <el-pagination v-model:current-page="queryFormUsers.page"
                                        v-model:page-size="queryFormUsers.pageSize" :small="small" :disabled="disabled"
                                        :background="background" layout="prev, pager, next" :total="totalUser"
                                        @size-change="handleUserSizeChange" @current-change="handleUserCurrentChange" />
                                </div>
                            </el-select>
                        </el-form-item>

                        <el-form-item class="datasource" :label='`数据源-${index}:`'>
                            <el-select v-model="item.dataSourceUuid" placeholder="请选择数据源"
                                @change="handleDatasourceSelectChange" @click="handleClick(index)" v-loading="loading">
                                <el-option class="option" v-for="item in currentDatasourceList" :key="item.id"
                                    :label='`${item.dataSourceName}: ${item.dataSourceUuid}`'
                                    :value="item.dataSourceUuid">
                                </el-option>
                                <div class="pagination-container">
                                    <el-pagination v-model:current-page="queryFormDataSource.page"
                                        v-model:page-size="queryFormDataSource.pageSize" :small="small"
                                        :disabled="disabled" :background="background" layout="prev, pager, next"
                                        :total="totalDataSource" @size-change="handleDataSourceSizeChange"
                                        @current-change="handleDataSourceCurrentChange" />
                                </div>
                            </el-select>
                        </el-form-item>

                        <el-form-item />
                    </div>


                </el-form>
            </div>
            <template #footer>
                <div style="text-align: right;">
                    <el-button style="margin-right: 40px;" type="primary" @click="handleConfirm">发起</el-button>

                </div>
            </template>
        </el-card>
    </el-dialog>
</template>
<script setup>
import { nowDate } from '../../date'
import SomeTools from '@/utils/someTools'
import { ElMessage } from 'element-plus';
import axios from 'axios'
import { create } from 'js-md5';
import { onMounted, ref } from 'vue';
import { getUsersAPI } from '@/apis/users.js';
import { getMpcDataSourceAPI } from '@/apis/dataSource.js'
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const formRef = ref(null)
const emits = defineEmits(['update:modelValue', 'initTaskList'])
const totalUser = ref(0)
const loading = ref(false)
const totalDataSource = ref(0)
const currentDatasourceList = ref([])
const userInfoStore = ref({
    userInfoList: []
})
const currentUsersList = ref([])
const queryFormUsers = ref({
    queryName: '',
    page: 1,
    pageSize: 10
})

const queryFormDataSource = ref({
    queryName: '',
    page: 1,
    pageSize: 10,
    targetUserId: null,
})
const sendForm = ref({
    taskName: '',
    taskUuid: '',
    createTime: '',
    taskDescription: '',
    taskParams: {
        task_id: '',
        task_name: '',
        nodeNum: 1,
        nodeAddressList: [],
        dataSourceUuidList: [],
    }
})

const form = ref({
    taskName: '',
    taskDescription: '',
    nodeNum: 1,
    nodeInfo: [{
        nodeAddress: '',
        dataSourceUuid: ''
    }],
})
const handleClick = (index) => {

    queryFormDataSource.value.targetUserId = userInfoStore.value.userInfoList[index].id
    getDataSource()
}
const getUsers = async () => {
    const res = await getUsersAPI(queryFormUsers.value)
    if (res.code === 1000) {

        currentUsersList.value = res.data.userList
        console.log(currentUsersList.value);
        totalUser.value = res.data.total
    } else {
        ElMessage({
            type: 'error',
            message: '获取用户信息失败'
        })
    }
}
const getDataSource = async () => {
    const res = await getMpcDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        currentDatasourceList.value = []
        currentDatasourceList.value = res.data.dataSourceList
        totalDataSource.value = res.data.total
        return true
    } else {
        ElMessage({
            type: 'error',
            message: '获取数据源信息失败'
        })
        return false
    }
}
const handleUserSizeChange = (pagesize) => {
    queryFormUsers.value.page = 1
    queryFormUsers.value.pageSize = pagesize
    getUsers()
}
const handleUserCurrentChange = (pageNum) => {
    queryFormUsers.value.page = pageNum
    getUsers()
}
const handleDataSourceSizeChange = (pagesize) => {
    queryFormDataSource.value.page = 1
    queryFormDataSource.value.pageSize = pagesize
    getDataSource()
}
const handleDataSourceCurrentChange = (pageNum) => {
    queryFormDataSource.value.page = pageNum

    getDataSource()
}
const findUser = (addr, index) => {
    var i
    const list = currentUsersList.value
    for (i = 0; i < list.length; i++) {
        console.log(addr, list[i].nodeIp + ':' + list[i].nodePort)
        if (addr === list[i].nodeIp + ':' + list[i].nodePort) {
            console.log(list[i])
            userInfoStore.value.userInfoList[index] = list[i]
            console.log(userInfoStore.value.userInfoList[index])
        }
    }
}
const handleUserSelectChange = (index) => {
    console.log(index);
    findUser(form.value.nodeInfo[index].nodeAddress, index)
    console.log(userInfoStore.value.userInfoList)
}
const handleDatasourceSelectChange = (row) => {
    console.log(row);

}
const handleClose = () => {
    emits('update:modelValue', false)
}
const getNodeInfo = async (index) => {

    const res = await getUsersAPI(queryFormUser.value)

    if (res.code === 1000) {
        form.value.nodeList[index].node_options = []

        form.value.nodeList[index].node_options = res.data.userList
        UserList.value = res.data.userList
        console.log(index, form.value.nodeList[index].node_options)
        total.value = res.data.total
    }
}
const handleNodeInfo = () => {
    var i
    for (i = 0; i < form.value.nodeInfo.length; i++) {
        sendForm.value.taskParams.nodeAddressList.push(form.value.nodeInfo[i].nodeAddress)
        sendForm.value.taskParams.dataSourceUuidList.push(form.value.nodeInfo[i].dataSourceUuid)

    }
}

const handleConfirm = async () => {
    const temp = sendForm.value
    console.log(form.value.nodeInfo)
    sendForm.value.taskName = form.value.taskName
    sendForm.value.taskParams.nodeNum = form.value.nodeNum
    sendForm.value.taskParams.task_name = "carbon_green_life"
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.taskDescription = form.value.taskDescription
    sendForm.value.taskParams.task_id = sendForm.value.taskUuid
    sendForm.value.createTime = nowDate(time)
    handleNodeInfo()
    console.log(sendForm.value)

    await axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
        + '/api' + '/MPC' + '/createTask', sendForm.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '任务发起成功'
                })
                emits('initTaskList')
                handleClose()
            }
            else {
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: '任务发起失败'
                })
            }
        })


}

const handleNumChange = (row) => {

    var i
    if (row > form.value.nodeInfo.length) {
        for (i = form.value.nodeInfo.length; i < row; i++) {
            //console.log(1)
            const node = ref({
                nodeAddress: '',
                dataSourceUuid: ''
            })
            form.value.nodeInfo.push(node.value)
            userInfoStore.value.userInfoList.push({})
        }
    } else if (row < form.value.nodeInfo.length) {
        // console.log(2)

        for (i = form.value.nodeInfo.length; i > row; i--) {
            form.value.nodeInfo.splice(i - 1, 1)
            userInfoStore.value.userInfoList.splice(i - 1, 1)

        }
    }
    console.log(row, form.value.nodeInfo.length)
}
onMounted(() => {
    getUsers()
})
</script>

<style lang="scss" scoped>
.form input.el-input_inner {
    border: none;
}

.el-dialog {
    padding: 0;
}


::v-deep.myinput {
    display: flex;
}

::v-deep.el-pagination {

    //padding-top: 5px;
    box-sizing: border-box;
    justify-content: center;

    .el-card {
        box-shadow: 0 0 10px black;
    }

    .el-pager li {
        padding: 0;
    }

    .el-pager li.is-active {
        color: #337ecc;
        cursor: default;
        font-size: 14px;
        font-weight: normal;
        font-weight: 500;

    }
}







.el-select-dropdown__item.is-hovering {
    background-color: #d9ecff;
}

.el-select-dropdown__item.is-selected {
    color: rgb(37, 192, 37);
    font-weight: normal;
    background-color: #d9ecff;
    opacity: 1;

}


.el-select:focus {
    .el-select__selected-item {
        font-weight: 900;
        color: black;
    }

}
</style>
