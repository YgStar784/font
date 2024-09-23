<template>

    <el-dialog class="dialog" :model-value="dialogVisible" width="1000px" @close="handleClose" append-to-body>

        <div class="container">
            <!--             <div class="tip" style="width:700px">
            <el-alert title="提示：你可以进行拖拽" type="success" effect="light" />
        </div> -->

            <div class="user-selected" style="border-radius:10px">
                <div
                    style="{margin:0 auto;text-align:center;padding:5px;border-radius:10px 10px 0 0;background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);}">
                    <h3>已选择</h3>
                </div>
                <VueDraggable animation="1000" tag="transition-group" group="list" style="{ width: 800px;height:600px;  overflow: auto ; display: flex; flex-wrap: wrap ;
                      flex-direction:row;align-content:flex-start;}" name="fade" v-model="userSelectedList">
                    <div class="card-wrapper" v-for="(item, index) in userSelectedList" :key="index">

                        <el-card class="card card-selected list-item" :style="{ background: map.get(item.username) }">
                            <el-row style="{display:flex;justify-content:flex-end;margin:0;border-radius:10px}">
                                <el-button icon="delete" type="danger" size="small" style="{}"
                                    @click="deleteSelectedUserList(index)" circle />

                            </el-row>
                            <el-row><span>用户名</span> : {{ item.username }}</el-row>
                            <el-row><span>IP</span> : {{ item.nodeIp }}:{{ item.nodePort }}</el-row>
                            <el-row><span>描述</span>: <input class="desc-input" ref="inputRefs" type=“text”
                                    v-model="item.desc" /></el-row>
                        </el-card>

                    </div>




                </VueDraggable>
            </div>
            <div class="user" style="border-radius:10px">
                <div style="{margin:0 auto;text-align:center;padding:5px;margin-bottom:5px;}">
                    <h3>用户列表</h3>
                </div>
                <VueDraggable animation="1000"
                    style="{width:300px;height:520px; overflow:auto;display:flex;flex-wrap:wrap; margin:0 8px;flex-direction:row; justify-content:center;align-content: flex-start;}"
                    v-model="currentUsersList" tag="transition-group" name="fade" group="list" @scroll="handleScroll">
                    <div class="card-wrapper" v-for="(item, index) in currentUsersList" :key="item">



                        <el-card class="card card-unsel list-item"
                            :style="map.get(item.username) ? { background: map.get(item.username) } : { background: randomColor(item.username) }">

                            <el-row style="{display:flex;justify-content:flex-end;margin:0;}">
                                <el-button icon="plus" size="small" style="{}" @click="AddSelectedUserList(index)"
                                    circle />
                            </el-row>
                            <el-row><span>用户名</span>: {{ item.username }}</el-row>
                            <el-row><span>IP</span>:{{ item.nodeIp }}:{{ item.nodePort }}</el-row>
                        </el-card>


                    </div>

                </VueDraggable>
                <div class="driver"></div>
                <div style="{margin:0 auto;justify-content:center;text-align:center;}">
                    <el-row>
                        <input class="search-input" type=“text” placeholder="搜索的用户名" v-model="queryFormUsers.queryName"
                            @mouseover="handleMouseEnter" @mouseout="handleMouseLeave" />
                        <el-button type="primary" icon="search" @click="searchUser"></el-button>
                    </el-row>
                </div>
            </div>
        </div>
        <div class="dialog-footer" style="justify-content:center;text-align:center;margin-top:15px;">

            <el-button style="{margin:0 auto;}" type="primary" @click="dialog = true">
                Confirm
            </el-button>
        </div>
        <el-drawer v-model="dialog" title="基本信息" :before-close="handleCloseBaisc" direction="rtl" class="demo-drawer">
            <div class="demo-drawer__content">
                <el-form :model="formBasic">
                    <el-form-item label="任务名称" :label-width="formLabelWidth">
                        <el-input v-model="formBasic.taskName" autocomplete="off" />
                    </el-form-item>
                    <el-form-item label="描述" :label-width="formLabelWidth">
                        <el-input v-model="formBasic.taskDescription" placeholder="请输入任务描述">
                        </el-input>
                    </el-form-item>

                </el-form>
                <div class="demo-drawer__footer">
                    <el-button @click="cancelForm">Cancel</el-button>
                    <el-button type="primary" :loading="loading" @click="onClick">
                        {{ loading ? 'Submitting ...' : 'Submit' }}
                    </el-button>
                </div>
            </div>
        </el-drawer>
        <!--       <el-card>
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

            <el-input class="myinput" v-model="form.taskDescription" style="width: 240px" autosize type="textarea"
                placeholder="相关任务描述" />

        </el-form-item>
        <el-form-item label="参与方数量:">
            <el-input-number v-model="form.nodeNum" controls-position="right" @change="handleNumChange" :min="1"
                :max="10" style="width:88px;">
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

            <el-form-item class="datasource" :label='`数据源描述-${index}:`'>
                <el-input placeholder="请输入所期望的数据源描述信息" v-model="item.dataSourceDesc"></el-input>
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
</el-card> -->
    </el-dialog>
</template>
<script setup>
import { nowDate } from '../../date'
import SomeTools from '@/utils/someTools'
import { ElMessage, ElDrawer, ElMessageBox } from 'element-plus';
import axios from 'axios'
import { backendPort } from '../../backendPort';
import { Transition, onMounted, ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import TaskBasicInfo from './taskBasicInfo.vue'
import { getMpcDataSourceAPI } from '@/apis/dataSource.js'
const tempUserList = ref([])
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const formRef = ref(null)
const emits = defineEmits(['update:modelValue', 'initTaskList'])
const userSelectedList = ref([])
const totalUser = ref(0)
const mapUserInfo = new Map();
const totalDataSource = ref(0)
const currentDatasourceList = ref([])
const userInfoStore = ref({
    userInfoList: []
})
const formBasic = ref({
    taskName: '',
    taskDescription: '',

})
const map = new Map();
const inputRefs = ref([]);
const taskBasicInfoShow = ref(false)
const currentUsersList = ref([])
const queryFormUsers = ref({
    queryName: '',
    page: 1,
    pageSize: 8,
})
const formLabelWidth = '80px'

let timer
const table = ref(false)
const dialog = ref(false)
const loading = ref(false)

const form = ref({
    taskName: '',
    taskDescription: '',
    nodeNum: 1,
    nodeInfo: [{
        nodeAddress: '',
        dataSourceDesc: ''
    }],
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
        taskId: '',
        taskName: '',
        nodeNum: 1,
        nodeAddressList: [],
        requireDataDescriptionList: [],
    }
})
const onClick = () => {
    loading.value = true
    setTimeout(() => {
        handleConfirm()
        loading.value = false
        dialog.value = false

    }, 400)
}

const handleCloseBaisc = (done) => {
    if (loading.value) {
        return
    }
    ElMessageBox.confirm('Do you want to submit?')
        .then(() => {
            loading.value = true
            timer = setTimeout(() => {
                done()
                // 动画关闭需要一定的时间
                handleConfirm()
                setTimeout(() => {
                    loading.value = false
                }, 400)
            }, 2000)

        })
        .catch(() => {
            // catch error
        })
}

const cancelForm = () => {
    loading.value = false
    dialog.value = false
    clearTimeout(timer)
}

const handleClick = (index) => {

    queryFormDataSource.value.targetUserId = userInfoStore.value.userInfoList[index].id
    getDataSource()
}

const getUsers = async () => {
    axios.post('https://120.48.18.15:7000/api/getAllUser', queryFormUsers.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                currentUsersList.value = res.data.data.userList
                console.log(currentUsersList.value);
                totalUser.value = res.data.data.total
            }
            else {
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })


}
const handleScroll = async (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    // 当滚动条到达底部时，触发
    console.log(clientHeight);
    if (scrollTop + clientHeight === scrollHeight) {
        queryFormUsers.value.page = queryFormUsers.value.page + 1;
        await axios.post('https://120.48.18.15:7000/api/getAllUser', queryFormUsers.value
            , {
                headers: {
                    Authorization: localStorage.getItem('token'),
                }
            }).then(res => {
                console.log(res)
                if (res.data.code === 1000) {
                    tempUserList.value = res.data.data.userList
                    console.log(tempUserList.value);
                    totalUser.value = res.data.data.total
                }
                else {
                    const msg = res.message
                    ElMessage({
                        type: 'error',
                        message: msg,
                    })
                }
            })
        if (tempUserList.value.length > 0) {
            console.log(tempUserList.value);
            let i
            for (i = 0; i < tempUserList.value.length; i++) {
                currentUsersList.value.push(tempUserList.value[i])
            }
        }
        else {
            queryFormUsers.value.page = queryFormUsers.value.page - 1;
        }
        // 执行到达最底部的操作

    }

};
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
const handleMouseEnter = () => {

    /*     if(queryFormUsers.value.queryName === ''){
            tempUserList.value = currentUsersList.value
        }
        console.log('mouse in',queryFormUsers.queryName, tempUserList.value,currentUsersList.value); */
}
const handleMouseLeave = () => {

    /*     if(queryFormUsers.value.queryName === ''){
            currentUsersList.value = tempUserList.value
            tempUserList.value=[]
        }
        console.log('mouse out', queryFormUsers.queryName,tempUserList.value,currentUsersList.value); */
}
watch(() => inputRefs.value.length, (newValue, oldValue) => {
    console.log(newValue, oldValue);

    if (newValue > oldValue) {
        console.log(newValue, oldValue, inputRefs.value);
        const lastInput = inputRefs.value[inputRefs.value.length - 1];
        console.log(inputRefs.value.length - 1);
        console.log(lastInput);
        lastInput && lastInput.focus(); // 新增输入框获取焦点

    }
})
const handleNodeInfo = () => {
    let i
    sendForm.value.taskParams.nodeAddressList = []
    sendForm.value.taskParams.requireDataDescriptionList = []
    console.log(form.value.nodeInfo.length, sendForm.value.taskParams.nodeAddressList)
    for (i = 0; i < userSelectedList.value.length; i++) {
        sendForm.value.taskParams.nodeAddressList.push(userSelectedList.value[i].nodeIp + ':' + userSelectedList.value[i].nodePort)
        sendForm.value.taskParams.requireDataDescriptionList.push(userSelectedList.value[i].desc)

    }
}
const deleteSelectedUserList = (index) => {

    const temp = userSelectedList.value[index]
    console.log(temp);
    userSelectedList.value.splice(index, 1)
    currentUsersList.value.push(temp)
}
const searchUser = () => {
    console.log(queryFormUsers.value.queryName);
    getUsers()
    console.log(currentUsersList.value)
}
const AddSelectedUserList = (index) => {

    const temp = currentUsersList.value[index]
    //console.log(temp);
    currentUsersList.value.splice(index, 1)
    userSelectedList.value.push(temp)
}
const handleConfirm = async () => {
    const temp = sendForm.value
    console.log(form.value.nodeInfo)
    sendForm.value.taskName = formBasic.value.taskName
    sendForm.value.taskParams.nodeNum = userSelectedList.value.length
    sendForm.value.taskParams.taskName = "carbon_green_life"
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.taskDescription = formBasic.value.taskDescription
    sendForm.value.taskParams.taskId = sendForm.value.taskUuid
    sendForm.value.createTime = nowDate(time)
    handleNodeInfo()
    console.log(sendForm.value, userSelectedList.value)

    await axios.post(
        '/api/MPC/createTask', sendForm.value
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
const randomColor = (username) => {
    let first = Math.floor(Math.random() * 256);
    let second = Math.floor(Math.random() * 256);
    let third = Math.floor(Math.random() * 256);
    let forth = Math.floor(Math.random() * 256);
    let fifth = Math.floor(Math.random() * 256);
    let sixth = Math.floor(Math.random() * 256);
    map.set(username, `linear-gradient(45deg,rgba(${first},${second},${third},0.2),rgba(${forth},${fifth},${sixth},0.2)`);
    console.log(map.get(username))
    //return `rgba(${first},${second},${third} ,0.3)`;
    return `linear-gradient(45deg,rgba(${first},${second},${third},0.2),rgba(${forth},${fifth},${sixth},0.2)`;
}

const handleNumChange = (row) => {

    var i
    if (row > form.value.nodeInfo.length) {
        for (i = form.value.nodeInfo.length; i < row; i++) {
            //console.log(1)
            const node = ref({
                nodeAddress: '',
                dataSourceDesc: ''
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


.card {
    margin: 5px;
    border-radius: 10px;
    height: 100px;
    width: 200px;
}

.driver {

    width: 100%;
    height: 2px;
    background-color: #fff;
    background-image: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);
    background-size: 30px 30px;
    transform: skewX(35deg);
    margin: 10px 0;
}


.card:hover {
    cursor: pointer;
}

.card-selected {
    height: 120px;
    border: none;
}

.card-unsel {
    margin: 0px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all .5s ease, transform 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

.container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

}

.dragging {
    /* 设置被拖拽元素的样式 */
    background-color: #d1ecf1;
    border-color: #17a2b8;
    opacity: 0.6;
    transition: width 2s, height 2s, background-color 1s;

}

.list-item {}

.desc-input {
    width: 120px;
    border: none;
    background-color: transparent;
    text-overflow: ellipsis;

}

.search-input {
    margin: 15px;
    width: 140px;
    border: none;
    border-bottom: 1px solid black;
    background-color: transparent;
    text-overflow: ellipsis;
    font-size: 14px;
}

.search-input:focus {
    border: none;
    border-bottom: 1px solid black;
    outline: none;
}

.desc-input:focus {
    border: none;
    border-bottom: 1px solid white;
    outline: none;
}

.user {
    width: 240px;
    background-color: #ecf5ff;
    transition: all .3s ease;
}

.user-selected {
    width: 700px;
    margin-right: 10px;
    background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
    transition: all .3s ease;
}

.el-dialog__header {
    background-color: blue !important;
}

.el-card {
    --el-card-padding: 10px;
}

.el-dialog {
    --el-dialog-width: 50%;
    --el-dialog-margin-top: 15vh;
    --el-dialog-bg-color: red;
    --el-dialog-box-shadow: var(--el-box-shadow);
    --el-dialog-title-font-size: var(--el-font-size-large);
    --el-dialog-content-font-size: 14px;
    --el-dialog-font-line-height: var(--el-font-line-height-primary);
    --el-dialog-padding-primary: 16px;
    --el-dialog-border-radius: var(--el-border-radius-small);
    background: var(--el-dialog-bg-color);
    border-radius: var(--el-dialog-border-radius);
    box-shadow: var(--el-dialog-box-shadow);
    box-sizing: border-box;
    margin: var(--el-dialog-margin-top, 15vh) auto 50px;
    overflow-wrap: break-word;
    padding: var(--el-dialog-padding-primary);
    position: relative;
    width: var(--el-dialog-width, 50%);
}


.vuedraggable .card {
    background-color: white;
}

.vuedraggable .card.dragging {
    background-color: #f0f0f0;
    /* 拖动时改变背景 */
    opacity: 0.7;
}

::v-deep .el-dialog__header {
    display: none;
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
