<template>

    <el-dialog :model-value="dialogVisible" title="任务添加-安全多方计算" @close="handleClose">
        <el-card>
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
                        <el-form-item :label='`节点-${index}:`'>
                            <el-input v-model="item.nodeAddress" style="width: 300px;"></el-input>
                        </el-form-item>
                        <el-form-item label="节点数据地址:">
                            <el-input v-model="item.nodeDataPath" style="width: 400px;"></el-input>
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
import { ref } from 'vue';
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const formRef = ref(null)
const emits = defineEmits(['update:modelValue', 'initTaskList'])

const sendForm = ref({
    taskName: '',
    taskUuid: '',
    createTime: '',
    taskParams: {
        task_id: '',
        task_name: '',
        nodeNum: 1,
        nodeAddressList: [],
        nodeDataPathList: [],
    }
})
const form = ref({
    taskName: '',
    taskDescription: '',
    nodeNum: 1,
    nodeInfo: [{
        nodeAddress: '',
        nodeDataPath: ''
    }],
})
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
        sendForm.value.taskParams.nodeDataPathList.push(form.value.nodeInfo[i].nodeDataPath)

    }
}
const handleConfirm = () => {
    const temp = sendForm.value
    console.log(form.value.nodeInfo)
    sendForm.value.taskName = form.value.taskName
    sendForm.value.taskParams.nodeNum = form.value.nodeNum
    sendForm.value.taskParams.task_name = "carbon_green_life"
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.taskParams.task_id = sendForm.value.taskUuid
    sendForm.value.createTime = nowDate(time)
    handleNodeInfo()
    console.log(sendForm.value)

    axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
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
                nodeDataPath: ''
            })
            form.value.nodeInfo.push(node.value)
        }
    } else if (row < form.value.nodeInfo.length) {
        // console.log(2)

        for (i = form.value.nodeInfo.length; i > row; i--) {
            form.value.nodeInfo.splice(i - 1, 1)
        }
    }
    console.log(row, form.value.nodeInfo.length)
}
</script>

<style lang="scss" scoped>
.form input.el-input_inner {
    border: none;
}

::v-deep.myinput {
    display: flex;
}
</style>
