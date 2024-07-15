<template>
    <el-card>
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <h3>
                    联邦学习
                </h3>
            </el-col>
        </el-row>
        <el-steps :active="currentSteps" align-center class="steps">
            <el-step title="基本信息" />
            <el-step title="配置数据源" />
            <el-step title="字段对齐" />
            <el-step title="流程编排" />
            <el-step title="模型输出" />

        </el-steps>
        <div class="container">
            <el-form :model="form" ref="formRef" label-position="left" label-width="auto" title="联邦学习"
                style=" max-width: 700px">
                <el-form-item v-show="currentSteps === 0" label="名称:" prop="pipeName">
                    <el-input placeholder="请输入流水线名称" style="width: 600px" v-model="form.pipeName" />
                </el-form-item>
                <el-form-item v-show="currentSteps === 0" label="算法类型:" prop="algorithmCode">
                    <el-input style="width: 100px" v-model="form.algorithmCode" />
                </el-form-item>
                <el-form-item v-show="currentSteps === 0" label="数据源个数:" prop="participants">
                    <el-input-number v-model="form.participants" :min="1" :max="10" @change="handleNumChange" />
                </el-form-item>
                <el-form-item v-show="currentSteps === 1" :label='`数据源-${index1 + 1} :`'
                    v-for="(node, index1) in form.nodeList" prop="nodeinfo" :key="index1">
                    <el-row>
                        <el-col :span="8">
                            <el-select style="width: 150px;" v-model="node.nodeUUid" :key="index1" placeholder="请选择节点名称"
                                @click="getNodeInfo(index1)" @change="handleUserSelectChange">
                                <el-option v-for="(user, index2) in node.node_options"
                                    :label='`${user.username}:${user.nodeIp}`' :value="user.id" :key="index2">
                                </el-option>
                                <div class="pagination-container">
                                    <el-pagination v-model:current-page="queryFormUser.page"
                                        v-model:page-size="queryFormUser.pageSize" :small="small" :disabled="disabled"
                                        :background="background" layout="prev, pager, next" :total="usertotal"
                                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                                </div>
                            </el-select>
                        </el-col>
                        <el-col :span="8" style="margin-left: 30px;width:400px">
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
                    </el-row>
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

                    </el-col>
                </el-form-item>
                <el-form-item v-show="currentSteps === 1" label="误报率:" prop="pipeName">
                    <el-input-number v-model="form.falseAlarmParams" :precision="1" :step="0.1" :min="0.1" :max="1" />
                </el-form-item>
                <div v-show="currentSteps === 2">
                    <el-form-item v-for="(item, index6) in standArry" :label='`标准字段 - ${index6 + 1}`'>
                        <el-select style="width: 150px;" v-model="form.samplealignParams[index6].standDataSourceField"
                            :key="index1" placeholder="请选择节点名称">
                            <el-option v-for="(stand, index7) in item"
                                :label='`${stand.standDataSourceField}:${stand.standDataSourceUuid}`'
                                :value="stand.standDataSourceField" :key="index7">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </div>
            </el-form>
        </div>
        <div class="butContainer">
            <el-button v-show="currentSteps != 0" @click="preStep">上一步</el-button>
            <el-button v-show="currentSteps != 4" type="primary" style="margin-left: 50px"
                @click="nextStep">下一步</el-button>
            <el-button v-show="currentSteps === 4" type="primary" style="margin-left: 50px"
                @click="onSubmit">提交</el-button>
        </div>
    </el-card>

</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsersAPI, getlUserIpAPI } from '@/apis/users';
import { getFlDataSourceAPI } from '@/apis/dataSource'
const currentSteps = ref(0)
const id = ref(0)
const usertotal = ref(0)
const datasourcetotal = ref(0)
//const node_options = ref([])
const dataSourceName = ref('')
//const dataSource_options = ref([])
//const column_options = ref([])
const indexColumn = ref(0)

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
const sendForm = ref({
    taskId: '',
    taskName: '',
    participants: 0,
    nodeList: [],
    standPsiField: []
})
const form = ref({
    algorithmCode: null,
    pipeName: '',
    falseAlarmParams: 0.1,
    participants: 1,
    nodeList: [{
        isReceiveResult: false,
        nodeAddress: '',
        nodeUUid: null,
        party: 0,
        dataSourceUuid: '',
        dataSourceFields: [],
        node_options: [],
        dataSource_options: [],
        column_options: [],
        dataSourceInfo: null,
        columnCh: [],
        checkedList: []
    }],
    standPsiField: [],
    samplealignParams: [],
})
const party = form.value.participants
const standArry = ref([])
const rules = ref({
    task_name: [
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
    nodeinfo: [
        {
            required: true,
            trigger: 'blur',
        }
    ],

})

const nodeListInfo = () => {
    if (form.value.nodeList.length < form.value.participants) {
        var i
        for (i = form.value.nodeList.length; i < form.value.participants; i++) {
            const nodeInfo = ref({
                nodeAddress: '',
                nodeUuid: '',
                isLocal: false,
                isReceiveResult: false,
            })
            form.value.nodeList.push(nodeInfo.value)
        }
    }
    if (form.value.nodeList.length > form.value.participants) {
        var i
        for (i = form.value.nodeList.length; i > form.value.participants; i--) {
            form.value.nodeList.splice(i - 1, 1)
        }
    }
    //console.log(form.value.nodeList.length)
}
const preStep = () => {
    currentSteps.value = currentSteps.value - 1
}
const nextStep = () => {
    currentSteps.value = currentSteps.value + 1
    if (currentSteps.value === 2) {
        handleFields()
    }
    nodeListInfo()
}
const handleNumChange = () => {

    console.log(form.value.nodeList.length, form.value.participants)
    if (form.value.participants > form.value.nodeList.length) {
        var i = form.value.nodeList.length
        for (; i < form.value.participants; i++) {
            const Node = ref({
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

    const res = await getUsersAPI(queryFormUser.value)

    if (res.code === 1000) {
        form.value.nodeList[index].node_options = []

        form.value.nodeList[index].node_options = res.data.userList
        UserList.value = res.data.userList
        console.log(index, form.value.nodeList[index].node_options)
        usertotal.value = res.data.total
    }
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
const handleFields = () => {
    standArry.value = [],
        form.value.samplealignParams = []
    var i, j
    for (i = 0; i < form.value.nodeList[0].dataSourceFields.length; i++) {
        const fields = ref([])
        const matchInfo = ref([])
        const standDataSourceField = ref('')
        const standDataSourceUuid = ref('')
        for (j = 0; j < form.value.nodeList.length; j++) {
            if (j >= 1) {
                const match = ref({
                    matchDataSourceField: '',
                    matchDataSourceUuid: ''
                })
                matchInfo.value.push(match.value)
            }
            fields.value.push({ standDataSourceField: form.value.nodeList[j].dataSourceFields[i], standDataSourceUuid: form.value.nodeList[j].dataSourceInfo.dataSourceUuid })

        }
        standArry.value.push(fields.value)
        form.value.samplealignParams.push({ standDataSourceField: standDataSourceField.value, standDataSourceUuid: standDataSourceUuid.value, matchInfo: matchInfo.value })
        console.log(standArry.value, form.value.samplealignParams)
    }
    console.log(standArry.value)
}
const getUserDataSource = async (index) => {
    console.log(index)

    queryFormDataSource.value.targetUserId = form.value.nodeList[index].nodeUUid
    console.log(queryFormDataSource.value.targetUserId)
    const res = await getFlDataSourceAPI(queryFormDataSource.value)
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
    const res = await getFlDataSourceAPI(queryFormDataSource.value)
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
                nodeUUid: null,
                party: 0,
                dataSourceUuid: '',
                psiField: [],
            }
        )
        nodeInfo.value.nodeAddress = form.value.nodeList[i].nodeAddress
        nodeInfo.value.nodeUUid = form.value.nodeList[i].nodeUUid
        nodeInfo.value.party = form.value.nodeList[i].party
        nodeInfo.value.dataSourceUuid = form.value.nodeList[i].dataSourceInfo.dataSourceUuid
        nodeInfo.value.psiField = form.value.nodeList[i].dataSourceFields
        sendForm.value.nodeList.push(nodeInfo.value)
    }
}
const isShowStand = () => {
    const len = form.value.nodeList[0].dataSourceFields.length
    if (len != 0) {
        var i
        for (i = 1; i < form.value.nodeList.length; i++) {
            if (len != form.value.nodeList[i].dataSourceFields.length) {
                return false
            }
        }
        return true
    }
    else {
        return false
    }
}
const standFieldsCopy = () => {
    var i
    for (i = 0; form.value.standPsiField[i].standFieldName != ''; i++) {
        sendForm.value.standPsiField.push(form.value.standPsiField[i])
    }
}
const onSubmit = () => {
    console.log(form.value)
    const flag = isRepeat()
    console.log(flag)
    /*    if (flag === false) {
           ElMessage({
               type: 'warning', message: '引用的数据源重复'
           })
           return
       } */
    sendForm.value.taskId = SomeTools.guid()
    sendForm.value.taskName = form.value.taskName
    sendForm.value.participants = form.value.participants
    handleAddress()
    copyForm()
    standFieldsCopy()
    console.log(sendForm.value)
}
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    justify-content: center;
}

.header {
    padding-bottom: 40px;
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

.steps {
    padding-bottom: 40px;

}

.butContainer {
    padding-top: 40px;
    text-align: center;

}
</style>