<template>
    <el-table :data="props.tableData" stripe :header-cell-style="{ background: '#f5f7fa', color: '#606266', border: 0 }"
        style="width: 100%" border>
        <el-table-column type="index" label="序号" width="60">
            <template #default="{ $index }">
                {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
            </template>
        </el-table-column>

        <el-table-column :width="item.width" :prop="item.prop" :label="item.label" v-for="(item, index) in taskOptions"
            :key="index">
            <template v-slot="{ row }" align="center" v-if="item.label === '状态'">
                <template v-if="row.state === 0">
                    <el-check-tag checked="true" type="success">接受</el-check-tag>

                </template>
                <template v-else-if="row.state === 1">
                    <el-check-tag checked="true" type="error">拒绝</el-check-tag>

                </template>
                <template v-else="row.state===2">
                    <el-check-tag checked="true" type="warning">待确认</el-check-tag>
                </template>

            </template>

        </el-table-column>
        <el-table-column fixed="right" label="操作" width="160px" align="center">
            <template #default="{ row }">
                <el-tooltip class="item" effect="light" :content="row.fileName" placement="right">
                    <el-button type="primary" size="small" icon="Download" label="下载" @click="handleDownLoad(row)" />
                </el-tooltip>

                <!--     <el-button type="primary" size="small" :icon="Edit" @click="handleDialogValue(row)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="delUser(row)">删除</el-button> -->
            </template>
        </el-table-column>
    </el-table>
    <div class="pagination-container">
        <el-pagination v-model:current-page="queryForm.page" v-model:page-size="queryForm.pageSize"
            :page-sizes="[2, 5, 10, 15]" :small="small" :disabled="disabled" :background="background"
            layout="mytotal, sizes, prev, pager, next, jumper" :total="mytotal" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" />
    </div>

</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 2
})
const props = defineProps({
    tableData: {
        type: Array,
        default: [],
        required: true
    },
    dialogTableValue: {
        type: Object,
        default: () => { }
    }
})
</script>