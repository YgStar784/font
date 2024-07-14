<template>
    <div class="search-container">
        <div class="search">
            <el-row :gutter="20" class="header2" type="flex" justify="end">
                <el-col :span="7">
                    <el-input placeholder="请输入数据源名称" clearable v-model="queryForm.queryName"></el-input></el-col>
                <el-button type="primary" :icon="Search" @click="getMyDataSource">{{ $t('table.search') }}</el-button>

            </el-row>
        </div>
    </div>
    <el-table :data="tableData" stripe style="width: 100%" :header-cell-style="{ 'text-align': 'center' }"
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
                <el-tooltip content="用户授权" placement="bottom" effect="light">
                    <el-button type="primary" size="small" :icon="User" @click="handleUserbut(row)" />
                </el-tooltip>
                <el-tooltip content="删除" placement="bottom" effect="light">
                    <el-button type="danger" size="small" :icon="Delete" @click="delMyDataSource(row)" />
                </el-tooltip>
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination-container">
        <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
            :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled" :background="background"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
    </div>
    <Dialog v-model="dialogVisible" v-if="dialogVisible" :name="name" :Uuid="Uuid" />
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'

import { ref, onMounted } from 'vue'
import { options } from '../options'
import { getMyDataSourceAPI, delMyDataSourceAPI } from '@/apis/dataSource'
import { Search, User, Delete } from '@element-plus/icons-vue'
import Dialog from './userDialog.vue'
const dialogVisible = ref(false)
const tableData = ref([])
const name = ref('')
const Uuid = ref('')
const total = ref(0)
const del_form = ref({
    dataSourceUuid
        : ''
})
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
    const res = await getMyDataSourceAPI(queryForm.value)
    console.log(res)
    if (res.code === 1000) {
        tableData.value = res.data.dataSourceList
        console.log(tableData.value)
        total.value = res.data.total
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
    getMyDataSource()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    getMyDataSource()
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
            const res = await delMyDataSourceAPI(del_form.value)

            if (res.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '删除成功',
                }

                )
                getMyDataSource()
            } else {
                ElMessage({
                    type: 'danger',
                    message: '删除失败',
                }

                )
            }
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '删除取消',
            })
        })
}
onMounted(() => getMyDataSource())
</script>
<style scoped lang="scss">
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
</style>