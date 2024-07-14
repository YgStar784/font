<template>
    <el-card>
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <h3>
                    匿踪查询
                </h3>
            </el-col>
        </el-row>
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <el-input placeholder="请输入搜索的任务名称" clearable v-model="queryForm.queryName"></el-input></el-col>
            <el-button type="primary" :icon="Search" @click="getMyTask">{{ $t('table.search') }}</el-button>
            <el-button type="primary" @click="handleAddTask">
                <el-icon style="margin-right: 10px">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-icon>匿踪查询</el-button>

        </el-row>
        <el-table :data="tableData" stripe style="width: 100%" border>
            <el-table-column fixed type="index" label="序号" align="center" width="60">
                <template #default="{ $index }">
                    {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                </template>
            </el-table-column>

            <el-table-column :width="item.width" align="center" :prop="item.prop" :label="item.label"
                v-for="(item, index) in taskOptions" :key="index">
                <template v-slot="{ row }" v-if="item.label === '任务状态'">
                    <template v-if="row.taskState === 0">
                        <el-check-tag checked="true" type="success">成功</el-check-tag>

                    </template>
                    <template v-else-if="row.taskState === 1">
                        <el-check-tag checked="true" type="error">失败</el-check-tag>

                    </template>
                    <template v-else="row.taskState===2">
                        <el-check-tag checked="true" type="warning">进行中</el-check-tag>
                    </template>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center">
                <template #default="{ row }">
                    <el-tooltip class="item" effect="light" :content="row.fileName" placement="right">
                        <el-button type="primary" size="small" icon="Download" label="下载"
                            @click="handleDownLoad(row)" />
                    </el-tooltip>

                    <!--     <el-button type="primary" size="small" :icon="Edit" @click="handleDialogValue(row)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="delUser(row)">删除</el-button> -->
                    、 </template>
            </el-table-column>
        </el-table>
        <div class="pagination-container">
            <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
                :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled" :background="background"
                layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                @current-change="handleCurrentChange" />
        </div>
    </el-card>
    <Dialog v-model="dialogVisible" :dialogValue="dialogValue" v-if="dialogVisible" @initUserList="getUsers"
        :dialogTableValue="dialogTableValue" />

</template>
<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'

import { getMyTaskAPI, downloadResultByUuidAPI } from '@/apisLittle/task'
import { ElMessage } from 'element-plus'
import { onMounted, ref } from 'vue'
import { Search, Edit, Setting, Delete } from '@element-plus/icons-vue'
import { getUsersAPI } from '@/apis/users';
import { taskOptions } from './taskOptions'
import { changeStateAPI } from '@/apis/users'
import { isNULL } from '@/utils/filters'
import { ElMessageBox } from 'element-plus'
import { delUserAPI } from '@/apis/users'
import { useUserStore } from '@/stores/user';
const link = document.createElement('a')
const level = localStorage.getItem('level')
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 2
})
const router = useRouter()

const idForm = ref({ id: 0 })
const dialogValue = ref('')
const dialogVisible = ref(false)
const tableData = ref([])
const total = ref(0)
const dialogTableValue = ref({})
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

    axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
        + '/api' + '/getMyTask', queryForm.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                tableData.value = res.data.data.taskList
                console.log(tableData.value)
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

const handleSizeChange = (pagesize) => {
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    getMyTask()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    getMyTask()
}
const handleAddTask = () => {
    router.replace({ name: 'stealthqueryAdd' })

}
const getIndex = (index) => {
    return (queryForm.page - 1) * queryForm.pageSize + index + 1
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
            axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
                + '/api' + '/downloadResultByUuid', { taskUuid: row.taskUuid }
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

onMounted(() => getMyTask())
</script>
<style scoped lang="scss">
.header {
    padding-bottom: 20px;
    box-sizing: border-box;
}

::v-deep .el-pagination {
    padding-top: 16px;
    box-sizing: border-box;
    justify-content: right;

}
</style>