<template>
    <div class="index" v-if="showCreate === 'false' && showMore === 'false'">

        <div class="flex justify-between items-center flex-wrap">
            <el-card>
                <template #header>
                    <div class="card-header">
                        <span>
                            <h2>
                                联邦建模
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
                                    </el-icon>联邦建模
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

                                        <span>联邦建模</span>


                                    </template>
                                </el-table-column>
                                <el-table-column fixed="right" label="操作" width="160px" align="center">
                                    <template #default="{ row }">

                                        <div class="op-but">
                                            <!--                                             <el-tooltip effect="light" content="参与者信息" placement="top">
                                                <el-button type="success" size="small" icon="Search" label="查看"
                                                    @click="handlePlayerInfo(row)" />
                                            </el-tooltip>

                                            <el-tooltip v-if="row.taskState === 4" effect="light" content="开始进行"
                                                placement="top">
                                                <el-button type="warning" size="small" icon="CaretRight" label="进行"
                                                    @click="handleBegin(row)" />
                                            </el-tooltip>
                                            <el-tooltip v-if="row.taskState === 0" effect="light" content="训练结果"
                                                placement="top">
                                                <el-button size="small" icon="PictureRounded" label="训练结果"
                                                    @click="showTrainResult(row)" />
                                            </el-tooltip> -->
                                            <el-tooltip effect="light" content="更多" placement="top">
                                                <el-button type="success" size="small" icon="Search" label="查看"
                                                    @click="showMoreInfo(row)" />
                                            </el-tooltip>
                                            <el-tooltip v-if="row.taskState === 4" effect="light" content="开始进行"
                                                placement="top">
                                                <el-button type="warning" size="small" icon="CaretRight" label="进行"
                                                    @click="handleBegin(row)" />
                                            </el-tooltip>
                                            <!--       <el-tooltip v-if="row.taskState === 0" effect="light" content="模型下载"
                                                placement="top">
                                                <el-button type="warning" size="small" icon="Coin" label="模型下载"
                                                    @click="handleDownLoad(row, 1)" />
                                            </el-tooltip>
                                            <el-tooltip v-if="row.taskState === 0" effect="light" content="数据下载"
                                                placement="top">
                                                <el-button type="danger" size="small" icon="DocumentCopy" label="数据下载"
                                                    @click="handleDownLoad(row, 2)" />
                                            </el-tooltip> -->


                                        </div>

                                        <!--     <el-button type="primary" size="small" :icon="Edit" @click="handleDialogValue(row)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="delUser(row)">删除</el-button> -->
                                    </template>
                                </el-table-column>

                            </el-table>
                            <div class="pagination-container">
                                <el-pagination v-model:current-page="queryForm.page"
                                    v-model:page-size="queryForm.pageSize" :page-sizes="[2, 5, 10, 15]" :small="small"
                                    :disabled="disabled" :background="background"
                                    layout="mytotal, sizes, prev, pager, next, jumper" :total="mytotal"
                                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
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
                                <template v-slot="{ row }" align="center" v-if="item.label === '结果接收'">
                                    <template v-if="row.isReceiveResult === 0">
                                        <el-icon>
                                            <Close />
                                        </el-icon></template>
                                    <template v-else-if="row.isReceiveResult === 1 || row.isReceiveResult === 2">
                                        <el-icon>
                                            <Check />
                                        </el-icon></template>

                                </template>
                            </el-table-column>
                            <el-table-column label="任务类型" width="auto" align="center">
                                <template #default="{ row }">
                                    <span>联邦建模</span>
                                </template>
                            </el-table-column>
                            <el-table-column fixed="right" label="操作" width="160px" align="center">
                                <template #default="{ row }">
                                    <el-tooltip class="item" effect="light" content="处理" placement="top">
                                        <el-button type="primary" size="small" @click="handleAccept(row)"><el-icon>
                                                <Edit />
                                            </el-icon></el-button>
                                    </el-tooltip>
                                    <el-button v-if="row.state === 0" type="success"
                                        @click="showUploadDataSourceInfo(row)" size="small">数据源</el-button>
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


        </div>
        <HandleTaskInvitationsDialog v-model="dialogVisibleAccept" :taskInfo="taskInfo" @initMyJoin="getMyTaskJoin">
        </HandleTaskInvitationsDialog>
        <PlayerInfoDialog v-model="dialogVisiblePlayer" :taskName="taskName" :taskUuid="taskUuid"
            :createTime="createTime" :taskInfoError="taskInfoError" :taskDescription="taskDescription">
        </PlayerInfoDialog>
        <TrainResultDialog v-model="resultDialogValue" :taskUuid="taskUuid"></TrainResultDialog>
    </div>
    <div class="create" v-if="showCreate === 'true'">

        <transition name="fade" mode="out-in">

            <RouterView />

        </transition>

    </div>
    <div class="more-info" v-if="showMore === 'true'">
        <transition name="fade" mode="out-in">

            <RouterView />

        </transition>
    </div>
</template>

<script setup>
import { taskOptions } from '../taskOptions'
import { taskOptionsJoin } from '../taskOptionsJoinFL'
import { isCreate, showCreate, showMore } from './isCreate.js'
import { NButton } from 'naive-ui'
import { useRouter, useRoute } from 'vue-router'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HandleTaskInvitationsDialog from './components/handleTaskInvitationsDialog.vue'
import PlayerInfoDialog from './components/playerInfoDialog.vue'
import TrainResultDialog from './components/showTrainResultDialog.vue'
import axios from 'axios'
const taskName = ref('')
const taskUuid = ref('')
const createTime = ref('')
const taskDescription = ref('')
const router = useRouter()
const route = useRoute()
const jointotal = ref(0)
const mytotal = ref(0)
const activeName = ref('myUpload')
const tableDataJoin = ref([])
const tableData = ref([])
const dialogVisiblePlayer = ref(false)
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 10
})
const resultDialogValue = ref(false)
const begin = ref(0)
const taskInfo = ref(null)
const dialogVisibleAccept = ref(false)
const queryFormJoin = ref({
    queryName: '',
    page: 1,
    pageSize: 10
})
const taskInfoError = ref('')
const pending = ref(0)
const createTask = () => {
    // 设置 isCreate 为 true（如果需要）
    isCreate.value = true;
    localStorage.setItem('isCreate', 'true')
    showCreate.value = 'true'
    // 跳转到 flCreate 界面
    router.push({ name: 'flCreate' });

}
const showMoreInfo = (row) => {
    localStorage.setItem('showMore', 'true')
    showMore.value = 'true'
    localStorage.setItem('taskUuid', row.taskUuid)
    localStorage.setItem('taskName', row.taskName)
    localStorage.setItem('createTime', row.createTime)
    localStorage.setItem('taskDescription', row.taskDescription)
    localStorage.setItem('taskInfoError', row.errorMessage)
    localStorage.setItem('taskState', row.taskState)
    router.push({ name: 'flTaskDetail' });


}
const getMyTask = async () => {

    axios.post('/api/FL/getMyTrainTask', queryForm.value
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
const getIndex = (index) => {
    return (queryForm.page - 1) * queryForm.pageSize + index + 1
}
const beginTask = async (row) => {
    await axios.post('/api/PIR/startTrainTask', { taskUuid: row.taskUuid }
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

    taskName.value = row.taskName
    taskUuid.value = row.taskUuid
    console.log('taskUuid.value', taskUuid.value);
    createTime.value = row.createTime
    taskDescription.value = row.taskDescription
    taskInfoError.value = row.errorMessage
    dialogVisiblePlayer.value = true


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

const handleDownLoad = async (row, resultType) => {
    let fileType = ''; // 文件类型
    let fileExtension = ''; // 文件扩展名
    let filePrefix = ''; // 文件前缀

    if (resultType === 1) {
        fileType = 'application/octet-stream'; // 通用二进制文件类型
        fileExtension = '.pth';
        filePrefix = 'model-';
        ElMessageBox.confirm(
            '确定下载' + row.taskName + '-' + row.taskUuid + '的模型文件吗?',
            '下载',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
            }
        ).then(async () => {
            axios.post('/api/FL/downloadTrainResultByUuid', { resultType: 1, taskUuid: row.taskUuid }, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
                responseType: 'blob',
            }).then(res => {
                console.log(res);
                const data = res.data;
                if (data.hasOwnProperty('code')) {
                    ElMessage({
                        type: 'error',
                        message: '下载失败',
                    });

                }
                else {
                    const blob = new Blob([data], { type: fileType });
                    const objectUrl = URL.createObjectURL(blob); // 创建 URL
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filePrefix + row.taskUuid + fileExtension; // 自定义文件名
                    link.click(); // 下载文件
                    URL.revokeObjectURL(objectUrl); // 释放内存
                }
            });
        });
    }

    if (resultType === 2) {
        fileType = 'application/octet-stream'; // 通用二进制文件类型
        fileExtension = '.h5';
        filePrefix = 'data-';
        ElMessageBox.confirm(
            '确定下载' + row.taskName + '-' + row.taskUuid + '的数据文件吗?',
            '下载',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
            }
        ).then(async () => {
            axios.post('/api/FL/downloadTrainResultByUuid', { resultType: 2, taskUuid: row.taskUuid }, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
                responseType: 'blob',
            }).then(res => {
                console.log(res);
                const data = res.data;
                if (data.hasOwnProperty('code')) {
                    ElMessage({
                        type: 'error',
                        message: '下载失败',
                    });
                } else {
                    const blob = new Blob([data], { type: fileType });
                    const objectUrl = URL.createObjectURL(blob); // 创建 URL
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filePrefix + row.taskUuid + fileExtension; // 自定义文件名
                    link.click(); // 下载文件
                    URL.revokeObjectURL(objectUrl); // 释放内存
                }
            });
        });
    }
};
const showTrainResult = async (row) => {
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
const beforeEnter = () => {
    console.log("before enter");
    // 在这里可以处理"联邦建模"页面消失前的动画或者逻辑
};

const afterLeave = () => {
    console.log("after leave");
    // "联邦建模" 页面完全消失时，延迟显示 "联邦预测" 页面
    setTimeout(() => {
        showCreate.value = true; // 切换到联邦预测
    }, 500); // 延迟时间，确保动画时长一致
};


onMounted(() => {
    getMyTask()
    getMyTaskJoin()

})
onBeforeUnmount(() => {
    localStorage.setItem('showMore', 'false')

})
onMounted(() => {
    if (!localStorage.getItem('isCreate')) {
        localStorage.setItem('isCreate', 'false')
    }
    if (!localStorage.getItem('showMore')) {
        localStorage.setItem('showMore', 'false')
    }

    showCreate.value = localStorage.getItem('isCreate')
    showMore.value = localStorage.getItem('showMore')
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

.op-but {
    padding: 10px;
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    row-gap: 5px;
    column-gap: 5px;
}

.op-but .el-button {
    box-sizing: border-box;
    margin: 0;
    /* 取消默认按钮的 margin */
    padding: 12px;
    /* 如果需要，可以调整按钮的 padding */
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
