<template>

    <el-dialog class="dialog" :model-value="dialogVisible" @close="handleClose">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>
                        <h3 class="title">
                            任务添加-匿踪查询
                        </h3>
                    </span>
                </div>
            </template>
            <el-form :model="form" ref="formRef" title="数据源导入" label-position="left" label-width="auto"
                style="max-width: 700px">
                <el-form-item label="任务名称:" prop="taskName">
                    <el-input placeholder="请输入任务名称" v-model="form.taskName" />
                </el-form-item>
                <el-form-item label="任务描述:" prop="taskDescription">
                    <el-input placeholder="请输入相关的任务描述" v-model="form.taskDescription" />
                </el-form-item>
                <!--                 <el-form-item label="匿踪查询名称:" prop="task_name">
                    <el-input placeholder="请输入匿踪查询名称" v-model="form.task_name" />
                </el-form-item> -->
                <el-form-item label="节点名称" prop="query_id">
                    <el-select v-model="form.serverAddress" placeholder="请选择节点名称" @click="getNodeInfo"
                        @change="handleUserSelectChange">
                        <el-option v-for="item in node_options" :key="item.id"
                            :label='`${item.username}:${item.nodeIp}:${item.nodePort}`'
                            :value='`${item.nodeIp}:${item.nodePort}`'>
                        </el-option>
                        <div class="pagination-container">
                            <el-pagination v-model:current-page="queryFormUser.page"
                                v-model:page-size="queryFormUser.pageSize" :small="small" :disabled="disabled"
                                :background="background" layout="prev, pager, next" :total="total"
                                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item label="需求数据描述:" prop="taskDescription">
                    <el-input placeholder="需求数据描述" v-model="form.requireDataDescription" />
                </el-form-item>
                <!--    <el-form-item label="节点端口:" prop="ip_port">
                    <el-input placeholder="请输入端口号" v-model="form.ip_port" />
                </el-form-item> 
                <el-form-item label="数据源:" prop="dataSourceUuid">
                    <el-select v-model="form.dataSourceUuid" placeholder="请选择数据源" @click="getUserDataSource"
                        @change="handleDataSourceSelectChange">
                        <el-option v-for="item in dataSource_options" :key="item.dataSourceUuid"
                            :label='`${item.dataSourceName}:${item.dataSourceUuid}`' :value="item.dataSourceName">
                        </el-option>
                        <div class="pagination-container">
                            <el-pagination v-model:current-page="queryFormDataSource.page"
                                v-model:page-size="queryFormDataSource.pageSize" :small="small" :disabled="disabled"
                                :background="background" layout="prev, pager, next" :total="total"
                                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item label="字段选择:" prop="keyField">
                    <el-select v-model="form.keyField" placeholder="请选择要查询的字段信息" @change="handleChange"
                        @click="getDataSource">
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
                        <el-checkbox-button v-for="(item, index) in column_options" :key="index" :value="item">

                            {{ item }}
                        </el-checkbox-button>

                    </el-checkbox-group> </el-form-item> -->
                <el-form-item class="subButton" style="float:right">


                    <el-button type="primary" @click="onSubmit">发起</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </el-dialog>
</template>
<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ref } from 'vue'
import { nowDate } from '../../date'
import SomeTools from '@/utils/someTools'
import { ElMessage, ElMessageBox } from 'element-plus'
const id = ref(0)
const formRef = ref()
const dataSourceName = ref('')
const query_ip = ref('')
const node_options = ref([])
const dataSource_options = ref([])
const column_options = ref([])
const checkboxGroup = ref([])
const allUserList = ref([])
const allDataSourceLost = ref([])
const Degree = ref()
const total = ref(0)
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const tiemStr = ref('')
const route = useRouter()
const emits = defineEmits(['update:modelValue', 'initTaskList'])

const queryFormUser = ref({
    queryName: '',
    page: 1,
    pageSize: 5
})
const queryFormDataSource = ref({
    queryName: '',
    page: 1,
    pageSize: 5,
    targetUserId: 0
})
const form = ref({
    taskName: '',
    taskDescription: '',
    query_id: null,
    ip_port: '',
    task_id: '',
    nodeUuid: 0,
    serverAddress: '',
    dataSourceUuid: '',
    keyField: '',
    keyWord: '',
    degree: null,
    queryFields: [],
    requireDataDescription: '',
})
const taskParams = ref({
    task_id: '',
    task_name: '',
    nodeUuid: 0,
    serverAddress: '',
    dataSourceUuid: '',
    keyField: '',
    keyWord: '',
    degree: null,
    queryFields: [],
})
const sendForm = ref({
    taskName: '',
    taskUuid: '',
    createTime: '',
    taskDescription: '',
    taskParams: {},
})
const handleClose = () => {
    emits('update:modelValue', false)
}

const getNodeInfo = async () => {
    axios.post('https://120.48.18.15:7000/api/getAllUser', queryFormUser.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            // console.log(res)
            if (res.data.code === 1000) {
                node_options.value = res.data.data.userList
                // console.log(currentUsersList.value);
                total.value = res.data.data.total
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
const handleUserSelectChange = (value) => {
    console.log(JSON.stringify(value))
    id.value = value
    console.log(id.value)
}
const find_userInfo = () => {
    const userList = node_options.value
    var i
    for (i = 0; i < userList.length; i++) {
        if (userList[i].id === id.value) {
            console.log(userList[i])
            query_ip.value = userList[i].nodeIp + ':' + form.value.ip_port
            console.log(query_ip.value)
        }
    }

}




const find_dataSourceInfo = () => {
    const dataSourceList = dataSource_options.value
    var i
    for (i = 0; i < dataSourceList.length; i++) {
        if (dataSourceList[i].dataSourceName === dataSourceName.value) {
            console.log(dataSourceList[i])
            form.value.dataSourceUuid = dataSourceList[i].dataSourceUuid
            console.log(form.value.dataSourceUuid)
        }
    }
}
const keyField_find = () => {
    const list = column_options.value
    var i
    for (i = 0; i < list.length; i++) {
        if (list[i] === form.value.keyField) {
            console.log(list[i])
            return i
        }
    }
}
const handleSizeChange = (pagesize) => {
    queryFormUser.value.page = 1
    queryFormUser.value.pageSize = pagesize
    getNodeInfo()
}
const handleCurrentChange = (pageNum) => {
    queryFormUser.value.page = pageNum
    getNodeInfo()
}

const copy_arr = () => {
    const list = checkboxGroup.value
    var i
    for (i = 0; i < list.length; i++) {
        form.value.queryFields.push({
            fieldName: list[i],
            standFieldName: list[i]
        })
    }
}


const onSubmit = async () => {
    sendForm.value.taskName = form.value.taskName
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.createTime = nowDate(time)
    sendForm.value.taskDescription = form.value.taskDescription
    taskParams.value.queryFields = []
    find_userInfo()
    find_dataSourceInfo()
    taskParams.value.serverAddress = query_ip.value
    /*  if (taskParams.value.serverAddress === '') {
         ElMessage({
             type: 'warning',
             message: 'ip或port不能为空'
         })
         return
     } */
    taskParams.value.task_name = form.value.taskName
    /*     if (taskParams.value.task_name === '') {
            ElMessage({
                type: 'warning',
                message: '任务名不能为空'
            })
            return
        } */
    const ID = localStorage.getItem('id')
    taskParams.value.nodeUuid = Number(ID)
    taskParams.value.task_id = sendForm.value.taskUuid
    taskParams.value.degree = Number(form.value.degree)

    taskParams.value.keyField = form.value.keyField
    taskParams.value.keyWord = form.value.keyWord
    taskParams.value.dataSourceUuid = form.value.dataSourceUuid
    console.log(form.value.serverAddress)
    console.log(checkboxGroup.value)
    copy_arr()
    taskParams.value.queryFields = form.value.queryFields
    /*     if (taskParams.value.queryFields.length === 0) {
            ElMessage({
                type: 'warning',
                message: '请至少选择一个要查询的字段'
            })
            return
        } */
    console.log(taskParams.value)
    //sendForm.value.taskParams = taskParams.value
    console.log(sendForm.value)
    sendForm.value.taskParams.taskId = sendForm.value.taskUuid
    sendForm.value.taskParams.taskName = form.value.taskName
    sendForm.value.taskParams.nodeUuid = taskParams.value.nodeUuid
    sendForm.value.taskParams.serverAddress = form.value.serverAddress
    axios.post(
        '/api/PIR/createTask', sendForm.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),

            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '添加成功'
                })
                formRef.value.resetFields()
                checkboxGroup.value = []
                emits('initTaskList')
                handleClose()

            }
            else {
                ElMessage({
                    type: 'warning',
                    message: '查询失败'
                })
            }
        })

}
</script>


<style lang="scss" scoped>
.header {
    padding-bottom: 20px;
    box-sizing: border-box;
    padding-left: 10px;
}

.subButton {
    padding-top: 16px;
    box-sizing: border-box;
}

.el-form-item {
    margin-bottom: 20px;

}

::v-deep.el-pagination {
    //padding-top: 5px;
    box-sizing: border-box;
    justify-content: center;

}

.el-select__selected-item {
    color: #337ecc;
}

.el-select-dropdown__item.is-hovering {
    background-color: #d9ecff;
}

.el-select-dropdown__item.is-selected {
    color: rgb(37, 192, 37);
    font-weight: normal;
    background-color: #d9ecff;
}



::v-deep.el-select__selected-item {
    color: #337ecc;
}

.example-showcase .el-loading-mask {
    z-index: 9;
}
</style>