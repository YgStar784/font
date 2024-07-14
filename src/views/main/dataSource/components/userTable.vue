<template>
    <el-table :data="tableData" stripe style="width: 100%">
        <el-table-column fixed type="index" label="序号" align="center" width="60">
            <template #default="{ $index }">
                {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
            </template>
        </el-table-column>
        <el-table-column prop="username" align="center" label="用户名" width="auto">
        </el-table-column>
        <el-table-column prop="nodeDescription" align="center" label="节点描述">
        </el-table-column>
        <el-table-column align="center" label="操作">
            <template #default="{ row }">
                <el-button v-if="props.tableValue === 'Authorized'" type="info" size="small" :icon="SemiSelect"
                    @click="noAuthMyDataSource(row)" round>撤销</el-button>
                <el-button v-else type="danger" size="small" :icon="StarFilled" @click="authMyDataSource(row)"
                    round>授权</el-button>
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
import { ref, onMounted } from 'vue'
import { noAuthMyDataSourceAPI, getMyDataSourceAuthUserAPI, getMyDataSourceUnAuthUserAPI, authMyDataSourceAPI } from '@/apis/dataSource'
import { StarFilled, SemiSelect } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const tableData = ref([])

const props = defineProps({

    Uuid: {
        type: String,
        default: '',
        required: true
    },
    tableValue: {
        type: String,
        default: '',
        required: true
    },

})
const Uuid = ref('')
Uuid.value = props.Uuid
const total = ref(0)
const queryForm = ref({
    dataSourceUuid: Uuid.value,
    page: 1,
    pageSize: 2
})
const authData = ref({
    dataSourceUuid: props.Uuid,
    targetUserId: 0,
})
const noAuthData = ref({
    dataSourceUuid: props.Uuid,
    targetUserId: 0,
})
console.log(props.tableValue)
const handletableValue = async () => {
    if (props.tableValue === 'Authorized') {
        const res = await getMyDataSourceAuthUserAPI(queryForm.value)
        if (res.code === 1000) {
            tableData.value = res.data.userList
            total.value = res.data.total
        } else {
            ElMessage({
                type: 'warning',
                message: res.message,
            })
        }
    }
    if (props.tableValue === 'unAuthorized') {
        const res = await getMyDataSourceUnAuthUserAPI(queryForm.value)
        if (res.code === 1000) {
            tableData.value = res.data.userList
            total.value = res.data.total
        } else {
            ElMessage({
                type: 'warning',
                message: res.message,
            })
        }

    }
}
const handleSizeChange = (pagesize) => {
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    handletableValue()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    handletableValue()
}
const authMyDataSource = async (info) => {
    authData.value.targetUserId = info.id
    const res = await authMyDataSourceAPI(authData.value)
    if (res.code === 1000) {
        ElMessage({
            type: 'success',
            message: '授权成功'
        })
    } else {
        ElMessage({
            type: 'error',
            message: res.message
        })
    }
    handletableValue()

}
const noAuthMyDataSource = async (info) => {
    noAuthData.value.targetUserId = info.id
    const res = await noAuthMyDataSourceAPI(noAuthData.value)
    if (res.code === 1000) {
        ElMessage({
            type: 'success',
            message: '撤销成功'
        })
    } else {
        ElMessage({
            type: 'error',
            message: res.message
        })
    }
    handletableValue()
}
onMounted(() => handletableValue())
</script>

<style lang="scss" scoped>
::v-deep.el-pagination {
    padding-top: 16px;
    box-sizing: border-box;
    justify-content: right;

}
</style>