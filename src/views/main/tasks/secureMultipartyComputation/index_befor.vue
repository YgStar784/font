<template>
    <el-card>
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <h3>
                    安全多方计算
                </h3>
            </el-col>
        </el-row>
        <div class="container">
            <el-form :model="form" ref="formRef" label-position="left" label-width="auto" title="安全多方计算" :rules="rules"
                style="max-width: 700px">
                <el-form-item label="任务名称:" prop="task_name">
                    <el-input placeholder="请输入任务名称" style="width: 600px" v-model="form.task_name" />
                </el-form-item>
                <el-form-item label="数据参与方人数:" prop="participants">
                    <el-input-number v-model="form.participants" @change="handleNumChange" :min="1" :max="10"
                        label="描述文字"></el-input-number>
                </el-form-item>
                <el-form-item :label='`PARTY-${index1} :`' v-for="(node, index1) in form.nodeList" prop="nodeinfo"
                    :key="index1">
                    <el-col :span="11">
                        <el-select v-model="node.nodeUUid" :key="index1" placeholder="请选择节点名称"
                            @click="getNodeInfo(index1)" @change="handleUserSelectChange">
                            <el-option v-for="(user, index2) in node.node_options"
                                :label='`${user.username}:${user.nodeIp}`' :value="user.id" :key="index2">
                            </el-option>
                            <div class="pagination-container">
                                <el-pagination v-model:current-page="queryFormUser.page"
                                    v-model:page-size="queryFormUser.pageSize" :small="small" :disabled="disabled"
                                    :background="background" layout="prev, pager, next" :total="total"
                                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                            </div>
                        </el-select>
                    </el-col>
                    <el-col :span="11" style="margin-left: 30px">
                        <el-select v-model="node.dataSourceInfo" :key="index1" placeholder="请选择数据源"
                            @click="getUserDataSource(index1)" @change="handleDataSourceSelectChange">
                            <el-option v-for="(data, index3) in node.dataSource_options"
                                :label='`${data.dataSourceName}:${data.dataSourceUuid}`' :value="data" :key="index3">
                            </el-option>
                            <div class="pagination-container">
                                <el-pagination v-model:current-page="queryFormDataSource.page"
                                    v-model:page-size="queryFormDataSource.pageSize" :small="small" :disabled="disabled"
                                    :background="background" layout="prev, pager, next" :total="total"
                                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                            </div>
                        </el-select>
                    </el-col>
                    <el-col>
                        <el-checkbox-group :key="index1" v-model="node.dataSourceFields" size="large">
                            <el-checkbox v-for="(item, index4) in node.column_options" :key="index4" :value="item">
                                {{ item }}
                            </el-checkbox>
                        </el-checkbox-group>
                    </el-col>
                </el-form-item>
                <el-form-item label="算法内容:" prop="algorithmContent">
                    <el-input placeholder="请输入算法内容" type="textarea" :rows="5" style="width: 600px"
                        v-model="form.algorithmContent" />
                </el-form-item>
                <el-form-item class="subButton" style="float:right">
                    <el-button type="info" round>清 空</el-button>
                    <el-button type="primary" @click="onsubmit" round>完 成</el-button>
                </el-form-item>
            </el-form>
        </div>
    </el-card>

</template>

<script setup>
import { getUsersAPI, getlUserIpAPI } from '@/apis/users';
import { rowContextKey } from 'element-plus';
import { getMpcDataSourceAPI } from '@/apis/dataSource'
import { getUserSourceAPI } from '@/apis/dataSource'
import SomeTools from '@/utils/someTools'
import { ref } from 'vue'
import { compileScript } from 'vue/compiler-sfc';
import { ElMessage, ElMessageBox } from 'element-plus'

const id = ref(0)
const total = ref(0)
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
    task_id: '',
    task_name: '',
    algorithmUuid: '',
    algorithmContent: '',
    participants: 0,
    nodeList: [],
})
const form = ref({
    query_id: null,
    task_name: '',
    participants: 1,
    algorithmContent: '',
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
    }],
})
const party = form.value.participants
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
    algorithmContent: [{
        required: true,
        message: '请输入算法',
        trigger: 'blur',

    }],

})
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
                column_options: []
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
        total.value = res.data.total
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
    const res = await getMpcDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        form.value.nodeList[index].dataSource_options = []
        form.value.nodeList[index].dataSource_options = res.data.dataSourceList
        indexColumn.value = index
        console.log(index, form.value.nodeList[index].dataSource_options)
    }
}
const getDataSource = async (index) => {
    console.log(index)
    queryFormDataSource.value.queryName = dataSourceName.value
    console.log(queryFormDataSource.value.queryName)
    const res = await getMpcDataSourceAPI(queryFormDataSource.value)
    if (res.code === 1000) {
        form.value.nodeList[index].column_options = []
        const str_column = res.data.dataSourceList[0].fieldName
        console.log(str_column, res.data.fieldName, res)
        form.value.nodeList[index].column_options = str_column.split(',')
        console.log(index, form.value.nodeList[index].column_options)
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
                dataSourceFields: [],
            }
        )
        nodeInfo.value.nodeAddress = form.value.nodeList[i].nodeAddress
        nodeInfo.value.nodeUUid = form.value.nodeList[i].nodeUUid
        nodeInfo.value.party = form.value.nodeList[i].party
        nodeInfo.value.dataSourceUuid = form.value.nodeList[i].dataSourceInfo.dataSourceUuid
        nodeInfo.value.dataSourceFields = form.value.nodeList[i].dataSourceFields
        sendForm.value.nodeList.push(nodeInfo.value)
    }
}
const onsubmit = () => {
    console.log(form.value)
    const flag = isRepeat()
    console.log(flag)
    /*    if (flag === false) {
           ElMessage({
               type: 'warning', message: '引用的数据源重复'
           })
           return
       } */
    sendForm.value.task_id = SomeTools.guid()
    sendForm.value.task_name = form.value.task_name
    sendForm.value.algorithmUuid = SomeTools.guid()
    sendForm.value.algorithmContent = form.value.algorithmContent
    sendForm.value.participants = form.value.participants
    handleAddress()
    copyForm()

    console.log(sendForm.value)
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

/* ::v-deep.el-form-item__label-wrap {
    margin-left: 0px !important;
} */
</style>