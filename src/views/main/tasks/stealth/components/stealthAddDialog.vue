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
                    <el-select v-model="form.query_id" placeholder="请选择节点名称" @click="getNodeInfo"
                        @change="handleUserSelectChange">
                        <el-option v-for="item in node_options" :key="item.id"
                            :label='`${item.username}:${item.nodeIp}:${item.nodePort}`' :value="item.id">
                        </el-option>
                        <div class="pagination-container">
                            <el-pagination v-model:current-page="queryFormUser.page"
                                v-model:page-size="queryFormUser.pageSize" :small="small" :disabled="disabled"
                                :background="background" layout="prev, pager, next" :total="total"
                                @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                        </div>
                    </el-select>
                </el-form-item>
                <el-form-item label="节点端口:" prop="ip_port">
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

                    </el-checkbox-group> </el-form-item>
                <el-form-item class="subButton" style="float:right">


                    <el-button type="primary" @click="onSubmit">查询</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </el-dialog>
</template>
<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'

import { ref } from 'vue'
import { getUsersAPI, getlUserIpAPI } from '@/apis/users';
import { getPirDataSourceAPI } from '@/apis/dataSource'
import { getUserSourceAPI } from '@/apis/dataSource'
import { compileScript } from 'vue/compiler-sfc';
import { nowDate } from '../../date'
import { componentSizeMap, tagEmits } from 'element-plus';
import SomeTools from '@/utils/someTools'
import { END_ALIGNMENT } from 'element-plus/es/components/virtual-list/src/defaults';
import { ElMessage, ElMessageBox } from 'element-plus'
import { stealthAddAPI } from '@/apisLittle/stealth';
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
    taskParams: {}
})
const handleClose = () => {
    emits('update:modelValue', false)
}
const find_user = async () => {
    const res = await getlUserIpAPI({ id: Number(form.value.query_id) })
    if (res.code === 1000) {
        query_ip.value = res.data.nodeIp
    }
}
const getNodeInfo = async () => {
    const res = await getUsersAPI(queryFormUser.value)
    if (res.code === 1000) {
        node_options.value = res.data.userList
        total.value = res.data.total
    }
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
const handleBut = () => {
    console.log(route.currentRoute.value.fullPath)
    route.replace({ name: 'stealthquery' })
}
const getUserDataSource = async () => {
    queryFormDataSource.value.targetUserId = id.value
    console.log(queryFormDataSource.value.targetUserId)
    const res = await getDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        dataSource_options.value = res.data.dataSourceList
    }
}
const handleDataSourceSelectChange = (value) => {
    console.log(JSON.stringify(value))
    dataSourceName.value = value
    console.log(dataSourceName.value)
}
const getDataSource = async () => {
    queryFormDataSource.value.queryName = dataSourceName.value
    console.log(queryFormDataSource.value.queryName)
    const res = await getPirDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        const str_column = res.data.dataSourceList[0].fieldName
        column_options.value = str_column.split(',')
        console.log(column_options.value)
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
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    getNodeInfo()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    getNodeInfo()
}
const handleChange = (value) => {
    const list = column_options.value
    const index = keyField_find()
    console.log(index)
    list.splice(index, 1)
    column_options.value = list
    console.log(column_options.value)
}
/* const getUserDataSource = async () => {
    find_Ip()
    const res = await getUserSourceAPI(queryForm)
    if (res.code === 1000) {
        dataSource_options.value = res.data.dataSourceList
    }
}
const getDataSource = async () => {
    const res = await getDataSourceAPI({ dataSourceUuid: form.value.dataSourceUuid })
    if (res.code === 1000) {
        const str_column = res.data.fieldName
        column_options.value = str_column.split(',')
        console.log(column_options.value)
    }
} */
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

/* const query = async () => {
    const res = await queryAPI(taskParams.value)
    return res
} */

const onSubmit = async () => {
    sendForm.value.taskName = form.value.taskName
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.createTime = nowDate(time)
    taskParams.value.queryFields = []
    find_userInfo()
    find_dataSourceInfo()
    taskParams.value.serverAddress = query_ip.value
    if (taskParams.value.serverAddress === '') {
        ElMessage({
            type: 'warning',
            message: 'ip或port不能为空'
        })
        return
    }
    taskParams.value.task_name = form.value.taskName
    if (taskParams.value.task_name === '') {
        ElMessage({
            type: 'warning',
            message: '任务名不能为空'
        })
        return
    }
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
    if (taskParams.value.queryFields.length === 0) {
        ElMessage({
            type: 'warning',
            message: '请至少选择一个要查询的字段'
        })
        return
    }
    console.log(taskParams.value)
    sendForm.value.taskParams = taskParams.value
    console.log(sendForm.value)

    axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
        + '/api' + '/PIR' + '/createTask', sendForm.value
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