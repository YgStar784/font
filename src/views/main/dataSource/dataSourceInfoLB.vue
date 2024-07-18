<template>
    <el-card>
        <el-row :gutter="20" class="header1">
            <el-col :span="7">
                <h3>
                    数据源-联邦学习
                </h3>
            </el-col>
        </el-row>
        <!--         <div class="search-container">
            <div class="search">
                <el-row :gutter="20" class="header2" type="flex" justify="end">
                    <el-col :span="7">
                        <el-input placeholder="请输入数据源名称" clearable v-model="queryForm.queryName"></el-input></el-col>
                    <el-button type="primary" :icon="Search" @click="">{{ $t('table.search') }}</el-button>

                </el-row>
            </div>
        </div> -->
        <el-tabs v-model="activeName" type="card" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane :label='`我导入的 (${mytotal})`' name="myUpload">
                <div class="search-container">
                    <div class="search">
                        <el-row :gutter="20" class="header2" type="flex" justify="end">
                            <el-col :span="2">
                                <el-button class="addbut" icon="plus" type="primary">
                                </el-button>



                            </el-col>
                            <el-col :span="7">

                                <el-input placeholder="请输入数据源名称" clearable
                                    v-model="queryForm.queryName"></el-input></el-col>
                            <el-button type="primary" :icon="Search" @click="getMyDataSource">{{ $t('table.search')
                                }}</el-button>

                        </el-row>
                    </div>
                </div>
                <el-table :data="myTableData" stripe style="width: 100%" :header-cell-style="{ 'text-align': 'center' }"
                    :cell-style="{ 'text-align': 'center' }" border>
                    <el-table-column fixed type="index" label="序号" align="center" width="60">
                        <template #default="{ $index }">
                            {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                        </template>
                    </el-table-column>
                    <el-table-column :width="item.width" align="center" :prop="item.prop" :label="item.label"
                        v-for="(item, index) in options" :key="item.id">
                        <template v-slot="{ row }" v-if="item.label === '字段信息'" :show-overflow-tooltip="true">
                            {{ row.fieldName }}

                        </template>
                        <template v-slot="{ row }" v-if="item.label === '类型'">
                            {{ type[row.type] }}

                        </template>

                    </el-table-column>
                    <el-table-column label="操作">
                        <template #default="{ row }">
                            <!--                             <el-tooltip content="用户授权" placement="bottom" effect="light">
                                <el-button type="primary" size="small" :icon="User" @click="handleUserbut(row)" />
                            </el-tooltip> -->
                            <el-tooltip content="删除" placement="bottom" effect="light">
                                <el-button type="danger" size="small" :icon="Delete" @click="delMyDataSource(row)" />
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination-container">
                    <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
                        :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled" :background="background"
                        layout="total, sizes, prev, pager, next, jumper" :total="mytotal"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </div>
            </el-tab-pane>
            <el-tab-pane :label='`其他用户的 (${otherstotal})`' name="others">
                <div class="search-container">
                    <div class="search">
                        <el-row :gutter="20" class="header2" type="flex" justify="end">
                            <el-col :span="2">
                                <el-button class="addbut" icon="plus" type="primary">
                                </el-button>



                            </el-col>
                            <el-col :span="7">
                                <el-input placeholder="请输入数据源名称" clearable
                                    v-model="queryForm.queryName"></el-input></el-col>
                            <el-button type="primary" :icon="Search" @click="getAuthDataSource">{{ $t('table.search')
                                }}</el-button>

                        </el-row>
                    </div>
                </div>
                <el-table :data="othersTableData" stripe style="width: 100%"
                    :header-cell-style="{ 'text-align': 'center' }" :cell-style="{ 'text-align': 'center' }" border>
                    <el-table-column fixed type="index" label="序号" align="center" width="60">
                        <template #default="{ $index }">
                            {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                        </template>
                    </el-table-column>
                    <el-table-column :width="item.width" align="center" :prop="item.prop" :label="item.label"
                        v-for="(item, index) in options" :key="item.id">
                        <template v-slot="{ row }" v-if="item.label === '字段信息'" :show-overflow-tooltip="true">
                            {{ row.fieldName }}

                        </template>
                        <template v-slot="{ row }" v-if="item.label === '类型'">
                            {{ type[row.type] }}

                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination-container">
                    <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
                        :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled" :background="background"
                        layout="total, sizes, prev, pager, next, jumper" :total="otherstotal"
                        @size-change="handleSizeChange" @current-change="handleCurrentChange" />
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    <uploadDialog v-model="dialogVisible" :taskType="taskType" :dialogValue="dialogValue"
        @initdataSource="getMyDataSource" v-if="dialogVisible" />
</template>

<script setup>
const activeName = ref('myUpload')

/* import MyCreate from './components/myCreate.vue'
import MyAuthorized from './components/myAuthorized.vue' */
import { ElMessage, ElMessageBox } from 'element-plus'
import uploadDialog from './components/dataSourceUploadDialog.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

import { ref, onMounted } from 'vue'
import { options } from './options'
import { getMyFlDataSourceAPI, getOthersFlDataSourceAPI } from '@/apis/dataSource'
import { delMyDataSourceAPI } from '@/apisLittle/dataSource'
import { Search, User, Delete } from '@element-plus/icons-vue'
import { littleUrl } from '@/views/Login/littleUrlSet';
const dialogVisible = ref(false)
const myTableData = ref([])
const name = ref('')
const Uuid = ref('')
const taskType = ref('')
const router = useRouter()
const dialogValue = ref(null)

const mytotal = ref(0)
const otherstotal = ref(0)
const othersTableData = ref([])
const del_form = ref({
    dataSourceUuid: ''
})
console.log(littleUrl.value)
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 2
})
const type = ref([
    'Excel',
    'MySQL',
    '达梦数据库',
    'Oracle'
])
const getMyDataSource = async () => {
    const res = await getMyFlDataSourceAPI(queryForm.value)
    console.log(res)
    if (res.code === 1000) {
        myTableData.value = res.data.dataSourceList
        mytotal.value = res.data.total
    }
    else {
        const msg = res.message
        ElMessage({
            type: 'warning',
            message: msg,
        })
    }
}
const handleSizeChange = (pagesize) => {
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    if (activeName.value === 'myUpload') {
        getMyDataSource()
    } else {
        getOthersDataSource()

    }
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    if (activeName.value === 'myUpload') {
        getMyDataSource()
    } else {
        getOthersDataSource()

    }
}

const handleUserbut = (info) => {
    name.value = info.dataSourceName
    Uuid.value = info.dataSourceUuid
    dialogVisible.value = true

}
const delMyDataSource = (info) => {
    ElMessageBox.confirm(
        '确定删除该数据源吗？',
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            del_form.value.dataSourceUuid = info.dataSourceUuid
            axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
                + '/api' + taskType.value + '/delMyDataSource', del_form.value
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    console.log(res)
                    if (res.data.code === 1000) {
                        ElMessage({
                            type: 'success',
                            message: '删除成功',
                        })
                        getMyDataSource()
                    } else {
                        ElMessage({
                            type: 'error',
                            message: res.message,
                        })
                    }
                })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '删除取消',
            })
        })
}
const dialogValueJug = () => {
    console.log(router.currentRoute.value.fullPath);
    if (router.currentRoute.value.fullPath == '/datasourceinfoAQ') {
        dialogValue.value = '数据源导入-安全多方计算'
        taskType.value = '/MPC'
    } else if (router.currentRoute.value.fullPath == '/datasourceinfoLB') {
        dialogValue.value = '数据源导入-联邦学习'
        taskType.value = '/FL'

    } else if (router.currentRoute.value.fullPath == '/datasourceinfoNZ') {
        dialogValue.value = '数据源导入-匿踪查询'
        taskType.value = '/PIR'

    } else {
        dialogValue.value = '数据源导入-隐私求交'
        taskType.value = '/PSI'

    }
}
const getOthersDataSource = async () => {
    const res = await getOthersFlDataSourceAPI(queryForm.value)
    if (res.code === 1000) {
        othersTableData.value = res.data.dataSourceList
        otherstotal.value = res.data.total
    } else {
        ElMessage({
            type: 'error',
            message: res.message
        })
    }
}

onMounted(() => {
    getMyDataSource()
    dialogValueJug()
})
onMounted(() => getOthersDataSource())

</script>


<style lang="scss" scoped>
.addbut {
    display: flex;
    border-radius: 10px;
    margin-right: 35px;
    background-color: #409EFF;
}

.header1 {
    padding-bottom: 20px;
    box-sizing: border-box;
    left: 5px;
}

::v-deep.el-pagination {
    padding-top: 16px;
    box-sizing: border-box;
    justify-content: right;

}

.header2 {
    padding-bottom: 20px;
    box-sizing: border-box;
    right: 20px;
}

.demo-tabs>.el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
}
</style>
