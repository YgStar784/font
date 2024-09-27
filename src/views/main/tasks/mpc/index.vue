<template>

    <div class="flex justify-between items-center flex-wrap">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>
                        <h2>
                            安全多方计算
                        </h2>
                    </span>
                </div>
            </template>

            <el-tabs v-model="activeName" type="card" @tab-click="handleClick">

                <el-tab-pane class="demo-tabs" name="myUpload">
                    <template #label>
                        我发起的
                        <span>&nbsp;({{ mytotal }})&nbsp;</span>
                        <!--                         <el-badge v-if="begin != 0" type="warning" :value="begin" size="mini"></el-badge>
 --> </template>
                    <div style="max-width: 1250px;">
                        <el-row :gutter="20" type="flex" jusify="end" style="text-align: right;" class="header">

                            <el-col :span="7">
                                <el-input placeholder="请输入搜索的任务名称" clearable
                                    v-model="queryForm.queryName"></el-input></el-col>
                            <el-button type="primary" :icon="Search" @click="getMyTask">{{ $t('table.search')
                                }}</el-button>

                            <el-button type="primary" @click="handleDialog">
                                <el-icon style="margin-right: 10px">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                </el-icon>安全多方计算
                            </el-button>


                        </el-row>
                        <el-table :data="tableData" stripe
                            :header-cell-style="{ background: '#f5f7fa', color: '#606266', border: 0 }"
                            :cell-style="cellStyleMy" style="max-width: 1250px;" border>
                            <el-table-column type="index" label="序号" width="60">
                                <template #default="{ $index }">
                                    {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                                </template>
                            </el-table-column>

                            <el-table-column :width="item.width" :prop="item.prop" :label="item.label"
                                v-for="(item, index) in taskOptions" :key="index">
                                <template v-slot="{ row }" align="center" v-if="item.label === '任务状态'">
                                    <template v-if="row.taskState === 0">
                                        <el-check-tag checked="true" type="success" effect="dark">成功</el-check-tag>

                                    </template>
                                    <template v-else-if="row.taskState === 1">
                                        <el-check-tag checked="true" type="error" effect="dark">失败</el-check-tag>

                                    </template>
                                    <template v-else-if="row.taskState === 2" effect="dark">
                                        <el-check-tag checked="true" type="primary">进行中</el-check-tag>
                                    </template>
                                    <template v-else-if="row.taskState === 3" effect="dark">
                                        <el-check-tag checked="true" type="info">待确认</el-check-tag>
                                    </template>
                                    <template v-else-if="row.taskState === 4" effect="dark">
                                        <el-check-tag checked="true" type="warning">可进行</el-check-tag>
                                    </template>
                                    <template v-else-if="row.taskState === 5" effect="dark">
                                        <el-check-tag checked="true" type="danger">拒绝</el-check-tag>
                                    </template>
                                </template>
                                <template v-slot="{ row }" align="center" v-if="item.label === '任务类型'">
                                    <template v-if="row.tasktype === 0">
                                        <span>安全多方计算</span>
                                    </template>

                                </template>
                            </el-table-column>
                            <el-table-column fixed="right" label="操作" width="160px" align="center">
                                <template #default="{ row }">
                                    <el-tooltip class="item" effect="light" content="参与者信息" placement="top">
                                        <el-button type="success" size="small" icon="Search" label="查看"
                                            @click="handlePlayerInfo(row)" />
                                    </el-tooltip>
                                    <el-tooltip v-if="row.taskState === 0" class="item" effect="light"
                                        :content="row.fileName" placement="right">
                                        <el-button type="danger" size="small" icon="Download" label="下载"
                                            @click="handleDownLoad(row)" />
                                    </el-tooltip>
                                    <el-tooltip v-if="row.taskState === 4" class="item" effect="light" content="开始进行"
                                        placement="top">
                                        <el-button type="warning" size="small" icon="CaretRight" label="进行"
                                            @click="beginTask(row)" />
                                    </el-tooltip>
                                    <!--     <el-button type="primary" size="small" :icon="Edit" @click="handleDialogValue(row)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="delUser(row)">删除</el-button> -->
                                </template>
                            </el-table-column>

                        </el-table>
                        <div class="pagination-container">
                            <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
                                :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled"
                                :background="background" layout="mytotal, sizes, prev, pager, next, jumper"
                                :total="mytotal" @size-change="handleSizeChange"
                                @current-change="handleCurrentChange" />
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="我参与的">
                    <template #label>
                        我参与的
                        <span>&nbsp;({{ jointotal }})&nbsp;</span>
                        <!--                         <el-badge v-if="pending != 0" :value="pending" size="mini"></el-badge>
 --> </template>
                    <el-row :gutter="20" type="flex" jusify="end" style="text-align: right;" class="header">

                        <el-col :span="7">
                            <el-input placeholder="请输入搜索的任务名称" clearable
                                v-model="queryFormJoin.queryName"></el-input></el-col>
                        <el-button type="primary" :icon="Search" @click="getMyTaskJoin">{{ $t('table.search')
                            }}</el-button>



                    </el-row>
                    <el-table :data="tableDataJoin" stripe
                        :header-cell-style="{ background: '#f5f7fa', color: '#606266', border: 0 }"
                        style="max-width: 1250px;" :cell-style="cellStyleJoin" :row-class-name="tableRowClassName"
                        border>
                        <el-table-column type="index" label="序号" width="60">
                            <template #default="{ $index }">
                                {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                            </template>
                        </el-table-column>

                        <el-table-column :width="item.width" :prop="item.prop" :label="item.label"
                            v-for="(item, index) in taskOptionsJoin" :key="index">
                            <template v-slot="{ row }" align="center" v-if="item.label === '编号'" v-show="false">

                            </template>
                            <template v-slot="{ row }" align="center" v-if="item.label === '状态'">
                                <template v-if="row.state === 0">
                                    <span class="state accept">已接受</span>
                                </template>
                                <template v-if="row.state === 1">
                                    <span class="state reject">已拒绝</span>
                                </template>
                                <template v-if="row.state === 2">
                                    <span class="state wait">待确认</span>
                                </template>
                            </template>

                            <template v-slot="{ row }" align="center" style="background-color: #79bbff;"
                                v-if="item.label === '状态' && item.state === 2">
                            </template>
                        </el-table-column>
                        <el-table-column fixed="right" label="操作" width="160px" align="center">
                            <template #default="{ row }">
                                <el-button v-if="row.state === 0" type="success" size="small">已接受</el-button>
                                <el-button v-if="row.state === 1" type="danger" size="small">已拒绝</el-button>
                                <el-button v-if="row.state === 2" type="success" size="small"
                                    @click="handleAccept(row)">接受</el-button>
                                <el-button v-if="row.state === 2" type="danger" size="small"
                                    @click="handleReject(row)">拒绝</el-button>


                                <!--     <el-button type="primary" size="small" :icon="Edit" @click="handleDialogValue(row)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="delUser(row)">删除</el-button> -->
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="pagination-container" style="max-width: 1250px;">
                        <el-pagination v-model:current-page="queryFormJoin.page"
                            v-model:page-size="queryFormJoin.pageSize" :page-sizes="[2, 5, 10, 15]" :small="small"
                            :disabled="disabled" :background="background"
                            layout="mytotal, sizes, prev, pager, next, jumper" :total="jointotal"
                            @size-change="handleSizeChangeJoin" @current-change="handleCurrentChangeJoin" />
                    </div>
                </el-tab-pane>

            </el-tabs>

        </el-card>
        <MpcDialog v-model="dialogVisible" @initTaskList="getMyTask" v-if="dialogVisible" />
        <PlayerDialog v-model="dialogVisiblePlayer" :dialogTableValue="taskPlayerList" v-if="dialogVisiblePlayer"
            :taskName="taskName" :taskUuid="taskUuid" :createTime="createTime" :taskDescription="taskDescription" />
        <HandleTaskInvitationsDialoag v-model="dialogVisibleAccept" :taskInfo="taskInfo" @initMyJoin="getMyTaskJoin" />
        <HandleRejectDialog v-model="centerDialogVisible" :taskInfo="taskInfo" @initMyJoin="getMyTaskJoin" />
    </div>

</template>
<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'
import MpcDialog from './components/MpcUploadDialogCanvas.vue'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch, onBeforeUnmount } from 'vue'
import { Search, Edit, Setting, Delete } from '@element-plus/icons-vue'
import { taskOptions } from '../taskOptions'
import { taskOptionsJoin } from '../taskOptionsJoinMPC'
import PlayerDialog from './components/playerInfoDialog.vue'
import HandleTaskInvitationsDialoag from './components/handleTaskInvitationsDialoag.vue'
import HandleRejectDialog from './components/handleRejectDialog.vue'
import { changeStateAPI } from '@/apis/users'
import { isNULL } from '@/utils/filters'
import { ElMessageBox } from 'element-plus'

const link = document.createElement('a')
const pending = ref(0)
const level = localStorage.getItem('level')
const taskName = ref('')
const taskUuid = ref('')
const createTime = ref('')
const taskDescription = ref('')
const taskInfo = ref({})
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 2
})
const queryFormJoin = ref({
    queryName: '',
    page: 1,
    pageSize: 2
})
const queryFormPlayer = ref({
    uuid: '',
    page: 1,
    pageSize: 10
})
const activeName = ref('myUpload')
const router = useRouter()
const dialogVisibleAccept = ref(false)
const idForm = ref({ id: 0 })
const dialogValue = ref('')
const dataDesc = ref('')
const dialogVisible = ref(false)
const dialogVisiblePlayer = ref(false)
const centerDialogVisible = ref(false)
const tableData = ref([])
const mytotal = ref(0)
const jointotal = ref(0)
const tableDataJoin = ref([])
const dialogTableValue = ref({})
const taskPlayerList = ref([])
const playertotal = ref(0)
const begin = ref(0)
const handleDialog = () => {
    dialogVisible.value = true
}
const handleDialogValue = (row) => {
    if (isNULL(row)) {
        dialogValue.value = '添加用户'
        dialogTableValue.value = {}
    } else {
        dialogValue.value = '编辑用户'
        dialogTableValue.value = JSON.parse(JSON.stringify(row))
        console.log(dialogTableValue.value)
    }
    dialogVisible.value = true

}

const getMyTask = async () => {

    axios.post('/api/MPC/getMyTask', queryForm.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                tableData.value = res.data.data.taskList
                console.log(tableData.value)
                mytotal.value = res.data.data.total
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
const tableRowClassName = ({ row, rowIndex }) => {
    if (row.state === 2) {
        return "waitRow";
    }
    return "";
}
// 根据data返回的每一行的数据判断,再修改这一行的样式
const cellStyleJoin = (data) => {
    if (data.row.state === 2) {
        return {

            background: "#ecf5ff",
        };
    }
};
const cellStyleMy = (data) => {
    if (data.row.taskState === 4) {
        return {

            background: "#fdf6ec",
        };
    }
};

const handleSizeChange = (pagesize) => {
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    getMyTask()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    getMyTask()
}
const handleSizeChangeJoin = (pagesize) => {
    queryFormJoin.value.page = 1
    queryFormJoin.value.pageSize = pagesize
    getMyTaskJoin()
}
const handleCurrentChangeJoin = (pageNum) => {
    queryFormJoin.value.page = pageNum
    getMyTaskJoin()
}
const handleAccept = (row) => {
    dialogVisibleAccept.value = true
    taskInfo.value = row

}
const handleReject = (row) => {
    centerDialogVisible.value = true
    taskInfo.value = row
}
const handleAddTask = () => {
    router.replace({ name: 'stealthqueryAdd' })

}
const getIndex = (index) => {
    return (queryForm.page - 1) * queryForm.pageSize + index + 1
}
const beginTask = async (row) => {
    await axios.post('/api/MPC/startTask', { taskUuid: row.taskUuid }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            if (res.data.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '开启任务'
                })
                getMyTask()
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
}
const changeState = async (info) => {
    const state = info.valid
    idForm.value.id = info.id
    const res = await changeStateAPI(idForm.value)
    if (res.code === 1000) {
        if (state === 1) {
            ElMessage({
                message: "用户冻结成功！",
                type: 'success'
            })
        } else {
            ElMessage({
                message: "用户激活成功！",
                type: 'success'
            })
        }
    } else {
        ElMessage({
            message: res.message,
            type: 'error'
        })
    }
    // console.log(res)
}

const handlePlayerInfo = async (row) => {
    /*     router.push({
            path: '/mpcplayerinfo',
            query: {
                taskUuid: row.taskUuid,
                taskName: row.taskName,
                taskDescription: row.taskDescription,
                createTime: row.createTime,
                type: 'mpc',
            }
        }) */
    queryFormPlayer.value.uuid = row.taskUuid
    await axios.post('/api/MPC/getMyTaskPlayers', queryFormPlayer.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                taskPlayerList.value = res.data.data.taskList
                console.log(taskPlayerList.value)
                playertotal.value = res.data.data.total
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
    dialogVisiblePlayer.value = true
    queryFormPlayer.value.uuid = row.taskUuid
    taskName.value = row.taskName
    taskUuid.value = row.taskUuid
    createTime.value = row.createTime
    taskDescription.value = row.taskDescription


}
const pendingCount = () => {
    pending.value = 0
    tableDataJoin.value.forEach((item, index) => {
        if (item.state === 2) {
            pending.value = pending.value + 1
        }
    })
    console.log(pending.value)
}
const beginCount = () => {
    begin.value = 0
    tableData.value.forEach((item, index) => {
        if (item.taskState === 4) {
            begin.value = begin.value + 1
        }
    })
    console.log(begin.value)
}
watch(() => tableDataJoin.value, pendingCount)
watch(() => tableData.value, beginCount)

const handleDownLoad = async (row) => {
    ElMessageBox.confirm(
        '确定下载' + '"' + row.fileName + '"' + '吗?',
        '下载',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',

        }
    )
        .then(async () => {
            //const res = await downloadResultByUuidAPI({ taskUuid: row.taskUuid })
            axios.post('/api/MPC/downloadResultByUuid', { taskUuid: row.taskUuid }
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    },
                    responseType: 'blob',
                }).then(res => {
                    console.log(res)
                    const data = res.data
                    if (data.hasOwnProperty('code')) {
                        ElMessage({
                            type: 'error',
                            message: '下载失败'
                        })
                    }
                    else {
                        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                        const objectUrl = URL.createObjectURL(blob) // 创建URL
                        link.href = objectUrl
                        link.download = row.fileName// 自定义文件名
                        link.click() // 下载文件
                        URL.revokeObjectURL(objectUrl); // 释放内存
                    }
                })
            /*  const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
             const objectUrl = URL.createObjectURL(blob) // 创建URL
             link.href = objectUrl
             link.download = row.fileName// 自定义文件名
             link.click() // 下载文件
             URL.revokeObjectURL(objectUrl); // 释放内 */
            /*             if (res.code === 1000) {
            
                            ElMessage({
                                type: 'success',
                                message: '下载成功！',
                            }
            
                            )
                            getMyTask()
                        } else {
                            ElMessage({
                                type: 'danger',
                                message: '下载失败！',
                            }
            
                            )
                        } */
        })
}

/* const sendToOtherFont = async () => {
    axios.post('http://127.0.0.1:5173/createtask'
        , queryForm.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                tableData.value = res.data.data.taskList
                console.log(tableData.value)
                mytotal.value = res.data.data.total
            }
            else {
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
} */

const getMyTaskJoin = async () => {
    await axios.post('/api/MPC/getMyTaskInvitations', queryFormJoin.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                tableDataJoin.value = res.data.data.taskList
                console.log(tableDataJoin.value)
                jointotal.value = res.data.data.total
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })

}
/* const { createServer } = require('http');

const HOST = 'localhost';
const PORT = '8080';

const server = createServer((req, resp) => {
    // the first param is status code it returns
    // and the second param is response header info
    resp.writeHead(200, { 'Content-Type': 'text/plain' });

    console.log('server is working...');

    // call end method to tell server that the request has been fulfilled
    resp.end('hello nodejs http server');
});

server.listen(PORT, HOST, (error) => {
    if (error) {
        console.log('Something wrong: ', error);
        return;
    }

    console.log(`server is listening on http://${HOST}:${PORT} ...`);
});

 */
let timer = setInterval(() => {
    getMyTask()
    getMyTaskJoin()
}, 10 * 1000);
onBeforeUnmount(() => {
    clearInterval(timer)
})
onMounted(() => {
    getMyTask()
    getMyTaskJoin()

})

</script>
<style scoped lang="scss">
.card-header {
    padding-left: 10px;
    border-left: 10px solid #409EFF;

}


.header {
    padding-bottom: 20px;
    box-sizing: border-box;
}

.demo-tabs template span {
    color: red($color: #000000)
}

.state {
    font-weight: 900;
    padding: 1px 5px;

}

.accept {
    color: rgb(126, 192, 80, .8);
}

.reject {
    color: rgba(228, 116, 112, 0.8);
}

.wait {
    color: gray;
}

.waitRow {
    background-color: #a0cfff;
}

::v-deep .el-pagination {
    padding-top: 16px;
    box-sizing: border-box;
    justify-content: right;

}

.el-tabs::v-deep .el-tabs__item {

    color: gray;
    transition: all .2s linear;

}

.el-tabs::v-deep .el-tabs__item.is-active {
    color: rgb(22, 119, 255);
    font-weight: bold;
    border-bottom: 1px solid #1677ff;
    transition: all .2s linear;

}

.el-tabs::v-deep .el-tabs__item.is-active span {
    color: rgb(243, 43, 43);


}
</style>