<template>
    <div class="search-container">
        <div class="search">
            <el-row :gutter="20" class="header2" type="flex" justify="end">
                <el-col :span="7">
                    <el-input placeholder="请输入数据源名称" clearable v-model="queryForm.queryName"></el-input></el-col>
                <el-button type="primary" :icon="Search" @click="getAuthDataSource">{{ $t('table.search') }}</el-button>

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
    </el-table>
    <div class="pagination-container">
        <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
            :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled" :background="background"
            layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { options } from '../options'
import { Search } from '@element-plus/icons-vue'
import { getAuthDataSourceAPI } from '@/apis/dataSource'
import { ElMessage } from 'element-plus';
const tableData = ref([])
const total = ref(0)
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
const getAuthDataSource = async () => {
    const res = await getAuthDataSourceAPI(queryForm.value)
    if (res.code === 1000) {
        tableData.value = res.data.dataSourceList
        total.value = res.data.total
    } else {
        ElMessage({
            type: 'error',
            message: res.message
        })
    }
}
const handleSizeChange = (pagesize) => {
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    getAuthDataSource()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    getAuthDataSource()
}
onMounted(() => getAuthDataSource())
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