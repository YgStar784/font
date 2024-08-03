<template>
    <el-card>
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <el-input placeholder="请输入搜索的用户名" clearable v-model="queryForm.queryName"></el-input></el-col>
            <el-button type="primary" :icon="Search" @click="getUsers">{{ $t('table.search') }}</el-button>
            <el-button type="primary" v-if="level === '0'" @click="handleDialogValue({})">{{ $t('table.adduser')
                }}</el-button>

        </el-row>
        <el-table :data="tableData" stripe style="width: 100%">
            <el-table-column fixed type="index" label="序号" align="center" width="60">
                <template #default="{ $index }">
                    {{ (queryForm.page - 1) * queryForm.pageSize + $index + 1 }}
                </template>
            </el-table-column>

            <el-table-column :width="item.width" align="center" :prop="item.prop" :label="item.label"
                v-for="(item, index) in options" :key="item.id">
                <template v-slot="{ row }" v-if="item.label === '状态'">
                    <template v-if="level === '0'">
                        <el-switch v-model="row.valid" :active-value="0" :inactive-value="1"
                            @change="changeState(row)" />
                    </template>
                    <template v-else>
                        <el-switch v-model="row.valid" :active-value="0" :inactive-value="1" disabled />
                    </template>
                </template>
            </el-table-column>
            <!--             <el-table-column v-if="level === '0'" label="操作">
                <template #default="{ row }">
                    <el-button type="primary" size="small" :icon="Edit" @click="handleDialogValue(row)">编辑</el-button>
                    <el-button type="danger" size="small" :icon="Delete" @click="delUser(row)">删除</el-button>
                </template>
            </el-table-column> -->
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
import { ElMessage } from 'element-plus'
import Dialog from './components/dialog.vue'
import { onMounted, ref } from 'vue'
import { Search, Edit, Setting, Delete } from '@element-plus/icons-vue'
import { getUsersAPI } from '@/apis/users';
import { options } from './options'
import { changeStateAPI } from '@/apis/users'
import { isNULL } from '@/utils/filters'
import { ElMessageBox } from 'element-plus'
import { delUserAPI } from '@/apis/users'
import { useUserStore } from '@/stores/user';
const level = localStorage.getItem('level')
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 2
})
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
const getUsers = async () => {
    const res = await getUsersAPI(queryForm.value)
    console.log(res)
    if (res.code === 1000) {
        tableData.value = res.data.userList
        console.log(tableData.value)
        total.value = res.data.total
    }
    else {
        const msg = res.message
        ElMessage({
            type: 'error',
            message: msg,
        })
    }
}
const handleSizeChange = (pagesize) => {
    queryForm.value.page = 1
    queryForm.value.pageSize = pagesize
    getUsers()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.page = pageNum
    getUsers()
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

const delUser = async (row) => {
    ElMessageBox.confirm(
        '确定删除该用户吗？',
        'Warning',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            const res = await delUserAPI(row.id)
            if (res.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '删除成功！',
                }

                )
                getUsers()
            } else {
                ElMessage({
                    type: 'danger',
                    message: '删除失败！',
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

onMounted(() => getUsers())
</script>
<style scoped lang="scss">
.header {
    padding-bottom: 16px;
    box-sizing: border-box;
}

::v-deep.el-pagination {
    padding-top: 16px;
    box-sizing: border-box;
    justify-content: right;

}

/* 修改Element UI中el-switch开启状态的背景颜色 */
.el-switch .el-switch__core,
.el-switch .el-switch__label {
    transition: 0.3s linear;
}

.el-switch .el-switch__core::after {
    transition: 0.3s linear;
}

/* 这里设置为蓝色 */
::v-deep.el-switch.is-checked .el-switch__core {
    transition: 0.3s linear;
    border-color: #43be4c;
    background-color: #43be4c;

}

/* 如果需要修改开启时候的按钮颜色 */
.el-switch.is-checked .el-switch__core::after {
    left: unset;
    right: 2px;

}
</style>