<template>

    <div class="flex justify-between items-center flex-wrap">
        <el-card>
            <template #header>
                <div class="card-header">
                    <span>
                        <h2>
                            联邦预测
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

                            <el-button type="primary" @click="createTask">
                                <el-icon style="margin-right: 10px">
                                    <el-icon>
                                        <Plus />
                                    </el-icon>
                                </el-icon>联邦预测
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
                                        <a-badge status="success" text="成功" />

                                    </template>
                                    <template v-else-if="row.taskState === 1">
                                        <a-badge status="error" text="失败" />

                                    </template>
                                    <template v-else-if="row.taskState === 2">
                                        <a-badge status="processing" text="进行中" /> </template>
                                    <template v-else-if="row.taskState === 3">
                                        <a-badge state="processing" color="purple" text="待确认" />
                                    </template>
                                    <template v-else-if="row.taskState === 4" effect="dark">
                                        <a-badge status="processing" color="yellow" text="可进行" />
                                    </template>
                                    <template v-else-if="row.taskState === 5" effect="dark">
                                        <a-badge color="magenta" text="拒绝"></a-badge>
                                    </template>
                                </template>
                                <template v-slot="{ row }" align="center" v-if="item.label === '任务类型'">

                                    <span>联邦预测</span>

                                </template>
                            </el-table-column>
                            <el-table-column fixed="right" label="操作" width="160px" align="center">
                                <template #default="{ row }">
                                    <el-tooltip v-if="row.taskState === 0" class="item" effect="light" content="结果展示"
                                        placement="top">
                                        <el-button size="small" icon="PictureRounded" label="结果展示"
                                            @click="showPredictResult(row)" />
                                    </el-tooltip>
                                    <el-tooltip v-if="row.taskState === 0" class="item" effect="light" content="下载"
                                        placement="top">
                                        <el-button type="danger" size="small" icon="Download" label="下载"
                                            @click="handleDownLoad(row)" />
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

            </el-tabs>

        </el-card>


    </div>
    <CreateTaskDialog v-model="dialogVisible" @initTaskList="getMyTask" />
    <ShowPredictDialog v-model="resultDialogValue" :taskUuid="taskUuid"></ShowPredictDialog>
</template>

<script setup>
import { taskOptions } from '../taskOptions'

import { NButton } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import CreateTaskDialog from './components/createTask.vue'
import ShowPredictDialog from './components/showPredictDialog.vue'
import axios from 'axios'
const router = useRouter()
const route = useRoute()
const jointotal = ref(0)
const mytotal = ref(0)
const activeName = ref('myUpload')
const resultDialogValue = ref(false)
const tableDataJoin = ref([])
const tableData = ref([])
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 10
})
const begin = ref(0)
const taskInfo = ref(null)
const dialogVisible = ref(false)
const dialogVisibleAccept = ref(false)
const queryFormJoin = ref({
    queryName: '',
    page: 1,
    pageSize: 10
})
const taskUuid = ref('')
const pending = ref(0)
const createTask = () => {

    dialogVisible.value = true

}

const getMyTask = async () => {

    axios.post('/api/FL/getMyPredictionTask', queryForm.value
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
            } else if (res.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
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
const handleBegin = async (row) => {
    /*     queryFormPlayer.value.uuid = row.taskUuid
        await axios.post('/api/FL/getMyTaskPlayers', queryFormPlayer.value
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
        taskInfo.value = taskPlayerList.value[0]
        await nextTick()
        dialogVisibleStartTask.value = true */

    await axios.post('/api/FL/startTrainTask', { taskUuid: row.taskUuid }
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

const showUploadDataSourceInfo = (row) => {
    dialogVisibleDataSource.value = true

    taskInfo.value = row
    console.log(taskInfo.value);
}
const handleReject = (row) => {
    centerDialogVisible.value = true
    taskInfo.value = row
}
const handleAddTask = () => {
    router.replace({ name: 'stealthqueryAdd' })

}
const handleDownLoad = async (row) => {
    ElMessageBox.confirm(
        '确定下载' + row.taskName + '-' + row.taskUuid + '的结果文件吗?',
        '下载',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',

        }
    )
        .then(async () => {
            let fileType = 'application/octet-stream'; // 通用二进制文件类型
            let fileExtension = '.h5';
            let filePrefix = 'flPredict-';
            //const res = await downloadResultByUuidAPI({ taskUuid: row.taskUuid })
            await axios.post('/api/FL/downloadPredictionResultByUuid', { taskUuid: row.taskUuid }
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
                        const blob = new Blob([data], { type: fileType })
                        const objectUrl = URL.createObjectURL(blob) // 创建URL

                        const link = document.createElement('a');
                        link.href = objectUrl;

                        link.download = filePrefix + row.taskUuid + fileExtension// 自定义文件名
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
const getIndex = (index) => {
    return (queryForm.page - 1) * queryForm.pageSize + index + 1
}
const beginTask = async (row) => {
    await axios.post('/api/PIR/startTask', { taskUuid: row.taskUuid }
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
    await axios.post('/api/FL/getMyTrainTaskPlayers', queryFormPlayer.value
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

const showPredictResult = async (row) => {
    taskUuid.value = row.taskUuid
    resultDialogValue.value = true
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
    await axios.post('/api/FL/getMyTrainTaskInvitations', queryFormJoin.value
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
            } else if (res.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
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


onMounted(() => {
    getMyTask()


})
onMounted(() => {

})
</script>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity .5s;
    /* 过渡效果的样式和持续时间 */
}

.fade-enter,
.fade-leave-to

/* 进入和离开的样式 */
    {
    opacity: 0;
}

.create {
    width: 100%;
    height: 100%;
}

.index {
    box-sizing: border-box;
    padding: 20px;
}

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
    transition: all .5s linear;

}

.el-tabs::v-deep .el-tabs__item.is-active {
    color: rgb(22, 119, 255);
    font-weight: bold;
    border-bottom: 1px solid #1677ff;
    transition: all .5s linear;

}

.el-tabs::v-deep .el-tabs__item.is-active span {
    color: rgb(243, 43, 43);


}

/* 初始状态为透明 */
</style>
