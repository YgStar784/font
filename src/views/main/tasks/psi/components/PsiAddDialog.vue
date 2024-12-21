<template>

    <el-dialog class="add-dialog" :style="{ padding: '0' }" :model-value="dialogVisible" @close="handleClose">
        <template #header="{ close, titleId, titleClass }">
        </template>
        <el-card class="card">
            <el-row :gutter="20" class="header">
                <el-col :span="7">
                    <h3>
                        隐私求交
                    </h3>
                </el-col>
            </el-row>
            <div class="container">
                <el-form :model="form" ref="formRef" label-position="left" label-width="auto" title="隐私求交"
                    :rules="rules" style="max-width: 700px">
                    <el-form-item label="任务名称:" prop="taskName">
                        <el-input placeholder="请输入任务名称" style="width: 600px" v-model="form.taskName" />
                    </el-form-item>
                    <el-form-item label="任务描述:" prop="taskDescription">
                        <el-input placeholder="请输入任务描述" style="width: 600px" v-model="form.taskDescription" />
                    </el-form-item>
                    <el-form-item label="数据参与方人数:" prop="participants">
                        <el-input-number v-model="form.participants" controls-position="right" @change="handleNumChange"
                            :min="1" :max="10" label="描述文字"></el-input-number>
                    </el-form-item>
                    <el-form-item :label='`PARTY-${index1} :`' v-for="(node, index1) in form.nodeList" prop="nodeinfo"
                        :key="index1">
                        <el-col :span="11">
                            <el-select v-model="node.nameAndAddr" :key="index1" placeholder="请选择节点名称"
                                @click="getNodeInfo(index1)" @change="handleUserSelectChange">
                                <el-option v-for="(user, index2) in node.node_options"
                                    :label='`${user.username}:${user.nodeIp}`'
                                    :value='`${user.username}:${user.nodeIp}`' :key="index2">
                                </el-option>
                                <div class="pagination-container">
                                    <el-pagination v-model:current-page="queryFormUser.page"
                                        v-model:page-size="queryFormUser.pageSize" :small="small" :disabled="disabled"
                                        :background="background" layout="prev, pager, next" :total="usertotal"
                                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                                </div>
                            </el-select>
                        </el-col>
                        <el-col :span="11" style="margin-left: 30px">

                            <el-input v-model="node.requireDataDescription" style="margin" type="text"
                                placeholder="请输入数据信息描述"></el-input>

                        </el-col>

                        <!--                         <el-col :span="11" style="margin-left: 30px">
                            <el-select v-model="node.dataSourceInfo" :key="index1" placeholder="请选择数据源"
                                @click="getUserDataSource(index1)" @change="handleDataSourceSelectChange">
                                <el-option v-for="(data, index3) in node.dataSource_options"
                                    :label='`${data.dataSourceName}:${data.dataSourceUuid}`' :value="data"
                                    :key="index3">
                                </el-option>
                                <div class="pagination-container">
                                    <el-pagination v-model:current-page="queryFormDataSource.page"
                                        v-model:page-size="queryFormDataSource.pageSize" :small="small"
                                        :disabled="disabled" :background="background" layout="prev, pager, next"
                                        :total="datasourcetotal" @size-change="handleSizeChange"
                                        @current-change="handleCurrentChange" />
                                </div>
                            </el-select>
                        </el-col>
                        <el-col>
                            <el-checkbox-group :key="index1" v-model="node.dataSourceFields" size="large">

                                <el-checkbox v-for="(item, index4) in node.column_options" style="padding-top: 30px"
                                    :key="index4" :value="item"
                                    @change="handleBox(form.nodeList[index1].checkedList[index4], item, index1, index4)">
                                    {{ item }}

                                    <el-tag v-if="handleState(item, index1)" type="danger">{{
                                        form.nodeList[index1].dataSourceFields.indexOf(item) + 1 }}</el-tag>

                                </el-checkbox>
                            </el-checkbox-group>
                        </el-col> -->
                    </el-form-item>
                    <!--                    <div style="padding-top: 30px">
                        <el-form-item v-if="form.nodeList[0].dataSourceFields != []" :label='`标准字段 - ${index5 + 1} :`'
                            v-for="(item, index5) in form.nodeList[0].dataSourceFields" prop="standFields">


                            <el-col :span="8">
                                <el-input :placeholder='` ${form.nodeList[0].dataSourceFields[index5]} ,... `'
                                    v-model="form.standPsiField[index5].standFieldName" />
                            </el-col>
                            <el-col :span="6" style="margin-left: 50px">
                                <el-select v-model="form.standPsiField[index5].type" placeholder="请选择字段类型">
                                    <el-option v-for="item in type_options" :key="item.value" :label="item.label"
                                        :value="item.value">
                                    </el-option>
                                </el-select>
                            </el-col>
                        </el-form-item>
                    </div> -->
                    <el-form-item label="求交字段描述:"> <lay-tag-input v-model="form.psiFieldList"
                            v-model:inputValue="standfield" allow-clear :min="1" :minCollapsedNum="3" size="md"
                            placeholder="请输入" collapseTagsTooltip
                            :tagProps="{ color: '#409EFF', variant: 'light' }"></lay-tag-input>
                    </el-form-item>
                    <el-form-item v-if="form.nodeList[0].nameAndAddr != ''" class="form-item" label="结果接收"
                        style="padding-left: 20px;">
                        <n-space item-style="display: flex;">
                            <n-checkbox v-for="(node, nodeIndex) in form.nodeList" :key="nodeIndex"
                                v-model:checked="node.isReceiveResult">
                                {{ node.nameAndAddr }}
                            </n-checkbox>
                        </n-space>
                    </el-form-item>
                    <el-form-item class="subButton" style="float:right">
                        <el-button type="info" round @click="handleClose">取 消</el-button>
                        <el-button type="primary" @click="onsubmit" round>发 起</el-button>
                    </el-form-item>

                </el-form>
            </div>
        </el-card>

    </el-dialog>
</template>

<script setup>
import { NFormItem, NButton, NCheckbox, NCheckboxGroup, NSpace } from 'naive-ui'
import { nowDate } from '../../date'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { getUsersAPI, getlUserIpAPI } from '@/apis/users';
import { rowContextKey } from 'element-plus';
import { getPsiDataSourceAPI } from '@/apis/dataSource'
import { getUserSourceAPI } from '@/apis/dataSource'
import SomeTools from '@/utils/someTools'
import { ref } from 'vue'
import { compileScript } from 'vue/compiler-sfc';
import { ElMessage, ElMessageBox } from 'element-plus'
import FloatLabel from 'primevue/floatlabel'

import axios from 'axios'
import { log } from 'mathjs';
const id = ref(0)
const usertotal = ref(0)
const datasourcetotal = ref(0)
//const node_options = ref([])
const dataSourceName = ref('')
//const dataSource_options = ref([])
//const column_options = ref([])
const indexColumn = ref(0)
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const emits = defineEmits(['update:modelValue', 'initTaskList'])
const standfield = ref('')
const queryFormUser = ref({
    queryName: '',
    page: 1,
    pageSize: 5
})
const UserList = ref([])
const queryFormDataSource = ref({
    queryName: '',
    page: 1,
    pageSize: 5,
    targetUserId: 0
})
const taskParams = ref({
    taskId: '',
    taskName: '',
    participants: 0,
    nodeList: [],
    psiFieldList: [],
    //standPsiField: []
})
const form = ref({
    query_id: null,
    taskName: '',
    participants: 1,
    psiFieldList: [],
    nodeList: [{
        nameAndAddr: '',
        isReceiveResult: false,
        nodeAddress: '',
        nodeUUid: null,
        nodeName: '',
        party: 0,
        dataSourceUuid: '',
        dataSourceFields: [],
        node_options: [],
        dataSource_options: [],
        column_options: [],
        dataSourceInfo: null,
        columnCh: [],
        checkedList: [],
        requireDataDescription: '',
    }],
    standPsiField: []
})
const party = form.value.participants
const rules = ref({
    taskName: [
        {
            required: true,
            message: '请输入任务名称',
            trigger: 'blur',
        }
    ],
    participants: [
        {
            required: true,
            message: '请输入参与人数',
            trigger: 'blur',
        }
    ],


})
const type_options = [
    {
        value: "int",
        label: "整数(int)",
    },
    {
        value: "boolean",
        label: "布尔(boolean)",
    },
    {
        value: "float",
        label: "单精度浮点数(float)",
    }, {
        value: "double",
        label: "双精度浮点数(double)",
    }, {
        value: "boolean",
        label: "布尔(boolean)",
    }, {
        value: "str",
        label: "字符串(str)",
    },
]
const handleNumChange = () => {

    console.log(form.value.nodeList.length, form.value.participants)
    if (form.value.participants > form.value.nodeList.length) {
        var i = form.value.nodeList.length
        for (; i < form.value.participants; i++) {
            const Node = ref({
                nodeName: '',
                isReceiveResult: false,
                nodeAddress: '',
                nodeUUid: null,
                party: 0,
                dataSourceUuid: '',
                dataSourceFields: [],
                node_options: [],
                dataSource_options: [],
                column_options: [],
                columnCh: [],
                checkedList: []
            })
            console.log(form.value.nodeList[i - 1].party)
            Node.value.party = form.value.nodeList[i - 1].party + 1
            console.log(Node.value.party, i)
            form.value.nodeList.push(Node.value)
        }
    }
    if (form.value.participants < form.value.nodeList.length) {
        var i = form.value.nodeList.length
        // console.log('222222')
        for (; i >= form.value.participants; i--) {
            form.value.nodeList.splice(i, 1)

        }
    }
    console.log(form.value.nodeList)

    //console.log(form.value.nodeList.length)
}

const getNodeInfo = async (index) => {
    await axios.post('/api/getAllUserPublic', queryFormUser.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            // console.log(res)
            if (res.data.code === 1000) {
                form.value.nodeList[index].node_options = []

                form.value.nodeList[index].node_options = res.data.data.userList
                UserList.value = res.data.data.userList
                console.log(index, form.value.nodeList[index].node_options)
                usertotal.value = res.data.data.total
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
const handleBox = (checked, value, nodeIndex, checkedIndex) => {
    //console.log(checked)
    form.value.nodeList[nodeIndex].checkedList[checkedIndex] = !checked
    var i
    for (i = 0; i < form.value.nodeList[nodeIndex].columnCh.length; i++) {
        if (value === form.value.nodeList[nodeIndex].columnCh[i].name) {
            break
        }
    }
    if (checked === false) {
        form.value.nodeList[nodeIndex].columnCh[i].state = true
        console.log(form.value.nodeList[nodeIndex].columnCh[i].state, form.value.nodeList[nodeIndex].columnCh[i].name)
    } else {
        form.value.nodeList[nodeIndex].columnCh[i].state = false
        console.log(form.value.nodeList[nodeIndex].columnCh[i].state, form.value.nodeList[nodeIndex].columnCh[i].name)


    }

}
const handleState = (value, index) => {
    var i
    for (i = 0; i < form.value.nodeList[index].columnCh.length; i++) {
        if (value === form.value.nodeList[index].columnCh[i].name) {
            console.log(form.value.nodeList[index].columnCh[i].state)
            return form.value.nodeList[index].columnCh[i].state
        }
    }
}
const handleUserSelectChange = (value) => {
    console.log(JSON.stringify(value))
    id.value = value
    console.log(id.value)
}
const find_userInfo = (id, index) => {
    const userList = UserList.value
    var i
    for (i = 0; i < userList.length; i++) {
        if (userList[i].id === id) {
            console.log(userList[i])
            form.value.nodeList[index].nodeAddress = userList[i].nodeIp
        }
    }

}

const getUserDataSource = async (index) => {
    console.log(index)

    queryFormDataSource.value.targetUserId = form.value.nodeList[index].nodeUUid
    console.log(queryFormDataSource.value.targetUserId)
    const res = await getPsiDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        form.value.nodeList[index].dataSource_options = []
        form.value.nodeList[index].dataSource_options = res.data.dataSourceList
        datasourcetotal.value = res.data.total
        console.log(res.data)
        console.log(datasourcetotal.value)
        indexColumn.value = index
        console.log(index, form.value.nodeList[index].dataSource_options)
    }
}
const getDataSource = async (index) => {
    console.log(index)
    queryFormDataSource.value.queryName = dataSourceName.value
    console.log(queryFormDataSource.value.queryName)
    const res = await getPsiDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        form.value.nodeList[index].column_options = []
        const str_column = res.data.dataSourceList[0].fieldName
        console.log(str_column, res.data.fieldName, res)
        form.value.nodeList[index].column_options = str_column.split(',')
        console.log(index, form.value.nodeList[index].column_options)
        var i
        for (i = 0; i < form.value.nodeList[index].column_options.length; i++) {
            const ob = ref({
                name: form.value.nodeList[index].column_options[i],
                state: false
            })
            form.value.nodeList[index].columnCh.push(ob.value)
            form.value.nodeList[index].checkedList.push(false)
        }
        console.log(form.value.nodeList[index].columnCh)
        if (index === 0) {
            var i
            for (i = 0; i < form.value.nodeList[0].column_options.length; i++) {
                const standField = ref({
                    standFieldName: '',
                    type: ''
                })
                form.value.standPsiField.push(standField.value)
            }
        }
    }

}
const handleDataSourceSelectChange = (value) => {
    console.log(JSON.stringify(value))
    dataSourceName.value = value.dataSourceName
    console.log(dataSourceName.value)
    getDataSource(indexColumn.value)
    console.log(indexColumn.value)
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
const isRepeat = () => {
    var i, j
    for (i = 0; i < form.value.nodeList.length - 1; i++) {
        const p = form.value.nodeList[i].dataSourceUuid
        for (j = i + 1; j < form.value.nodeList.length; j++) {
            const q = form.value.nodeList[j].dataSourceUuid
            if (p === q) {
                return true
            }
        }
    }
    return false
}
const handleAddress = () => {
    var i
    for (i = 0; i < form.value.nodeList.length; i++) {
        find_userInfo(form.value.nodeList[i].nodeUUid, i)
    }
    console.log(form.value.nodeList)
}
const copyForm = () => {
    var i
    for (i = 0; i < form.value.nodeList.length; i++) {
        const nodeInfo = ref(
            {
                isReceiveResult: false,
                nodeAddress: '',
                nodeUUid: SomeTools.guid(),
                //party: 0,
                // dataSourceUuid: '',
                //psiField: [],
                requireDataDescription: '',
            }
        )

        const regex = /^(.+):([\d.]+)$/; // 正则表达式：匹配 `字符串:IP` 格式
        const match = form.value.nodeList[i].nameAndAddr.match(regex);

        if (match) {
            const username = match[1];
            const nodeIp = match[2];
            console.log(username); // 输出: "能源局"
            console.log(nodeIp);   // 输出: "120.48.255.3"
            nodeInfo.value.nodeAddress = match[2] + ':' + '8000'
        }
        nodeInfo.value.isReceiveResult = form.value.nodeList[i].isReceiveResult
        // nodeInfo.value.party = form.value.nodeList[i].party
        //nodeInfo.value.dataSourceUuid = form.value.nodeList[i].dataSourceInfo.dataSourceUuid
        // nodeInfo.value.psiField = form.value.nodeList[i].dataSourceFields
        nodeInfo.value.requireDataDescription = form.value.nodeList[i].requireDataDescription
        taskParams.value.nodeList.push(nodeInfo.value)
    }
}
const standFieldsCopy = () => {
    var i
    for (i = 0; form.value.standPsiField[i].standFieldName != ''; i++) {
        taskParams.value.standPsiField.push(form.value.standPsiField[i])
    }
}
const handleClose = () => {
    emits('update:modelValue', false)
}

const onsubmit = async () => {
    console.log(form.value)
    //const flag = isRepeat()
    //console.log(flag)
    /*    if (flag === false) {
           ElMessage({
               type: 'warning', message: '引用的数据源重复'
           })
           return
       } */
    taskParams.value.taskId = SomeTools.guid()
    taskParams.value.taskName = form.value.taskName
    taskParams.value.participants = form.value.participants
    taskParams.value.psiFieldList = form.value.psiFieldList
    //handleAddress()
    copyForm()
    //standFieldsCopy()
    const sendForm = ref({
        taskName: taskParams.value.taskName,
        taskUuid: taskParams.value.taskId,
        createTime: nowDate(time),
        taskDescription: form.value.taskDescription,
        taskParams: taskParams.value,
    })

    console.log('sendForm.value', sendForm.value)
    await axios.post(
        '/api/PSI/createTask', sendForm.value
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
                form.value = {
                    query_id: null,
                    taskName: '',
                    participants: 1,
                    nodeList: [{
                        nameAndAddr: '',
                        isReceiveResult: false,
                        nodeAddress: '',
                        nodeUUid: null,
                        nodeName: '',
                        party: 0,
                        dataSourceUuid: '',
                        dataSourceFields: [],
                        node_options: [],
                        dataSource_options: [],
                        column_options: [],
                        dataSourceInfo: null,
                        columnCh: [],
                        checkedList: [],
                        requireDataDescription: '',
                    }],
                    standPsiField: []
                }
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
    //padding-left: 10px;
}

.no-wrap {
    white-space: nowrap;
    width: 250px;
}

::v-deep.el-pagination {
    //padding-top: 5px;
    box-sizing: border-box;
    justify-content: center;

}

:deep(.el-dialog__body) {
    padding: 0;
}

.el-dialog__header {
    height: 0;
    padding: 0;
    margin: 0;
    display: none;
}

.dialog-header {
    display: none;
}

:deep(.el-dialog__header) {
    padding-bottom: 0;
}

.card .el-card__body {
    padding: 0;
}

/* ::v-deep.el-form-item__label-wrap {
    margin-left: 0px !important;
} */
</style>

<style lang="scss">
.add-dialog {
    .el-dialog__header {
        margin: 0;
        padding: 0;
    }
}
</style>