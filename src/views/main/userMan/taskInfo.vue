<template>
    <!-- 匿踪查询 -->
    <div>
        <el-row align="middle" class="grid-content">
            <el-col :span="24">

                匿踪查询
            </el-col>
        </el-row>
        <div>
            <el-row>
                <el-col :span="1">
                    <div style="padding-top: 5px;">
                        <el-text style="padding-left: 20px;">端口:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="1">
                    <el-input v-model="port" disabled />

                </el-col>
                <el-col :span="4">

                </el-col>
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="primary" style="padding-left: 20px">已发布: {{ total }}
                        </el-text>
                    </div>
                </el-col>
                <!--                 <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="success" style="padding-left: 20px">成功:
                        </el-text>
                    </div>
                </el-col>
                <el-col :span="2">
                </el-col>
                <el-col :span="1" />
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="danger" style="padding-left: 20px">失败:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />

                <el-col :span="3">
                    <div style="padding-top: 5px;">
                        <el-text type="warning" style="padding-left: 20px">进行中:

                        </el-text>
                    </div>


                </el-col> -->
            </el-row>
        </div>
    </div>
    <el-row />
    <el-row />
    <!-- 安全多方计算 -->

    <div>
        <el-row align="middle" class="grid-content">
            <el-col :span="24">

                安全多方计算
            </el-col>
        </el-row>
        <div>
            <el-row>
                <el-col :span="1">
                    <div style="padding-top: 5px;">
                        <el-text style="padding-left: 20px;">端口:

                        </el-text>
                    </div>
                </el-col>

                <el-col :span="1">
                    <el-input v-model="port" disabled />

                </el-col>
                <el-col :span="4" />
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="primary" style="padding-left: 20px">已发布:

                        </el-text>
                    </div>
                </el-col>

                <!--  <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="success" style="padding-left: 20px">成功:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="danger" style="padding-left: 20px">失败:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />

                <el-col :span="3">
                    <div style="padding-top: 5px;">
                        <el-text type="warning" style="padding-left: 20px">进行中:

                        </el-text>
                    </div>
                    <el-col :span="2" />

                </el-col> -->
            </el-row>
        </div>
    </div>
    <el-row />
    <el-row />
    <!-- 联邦学习 -->

    <div>
        <el-row align="middle" class="grid-content">
            <el-col :span="24">

                联邦学习
            </el-col>
        </el-row>
        <div>
            <el-row>
                <el-col :span="1">
                    <div style="padding-top: 5px;">
                        <el-text style="padding-left: 20px;">端口:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="1">
                    <el-input v-model="port" disabled />

                </el-col>
                <el-col :span="4">

                </el-col>
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="primary" style="padding-left: 20px">已发布:

                        </el-text>
                    </div>
                </el-col>
                <!--               <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="success" style="padding-left: 20px">成功:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="danger" style="padding-left: 20px">失败:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />

                <el-col :span="3">
                    <div style="padding-top: 5px;">
                        <el-text type="warning" style="padding-left: 20px">进行中:

                        </el-text>
                    </div>
                    <el-col :span="2" />

                </el-col> -->
            </el-row>
        </div>
    </div>
    <el-row />
    <el-row />
    <!-- 隐私求交 -->

    <div>
        <el-row align="middle" class="grid-content">
            <el-col :span="24">

                隐私求交
            </el-col>
        </el-row>
        <div>
            <el-row>
                <el-col :span="1">
                    <div style="padding-top: 5px;">
                        <el-text style="padding-left: 20px;">端口:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="1">
                    <el-input v-model="port" disabled />

                </el-col>
                <el-col :span="4">

                </el-col>
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="primary" style="padding-left: 20px">已发布:

                        </el-text>
                    </div>
                </el-col>
                <!--   <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="success" style="padding-left: 20px">成功:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />
                <el-col :span="2">
                    <div style="padding-top: 5px;">
                        <el-text type="danger" style="padding-left: 20px">失败:

                        </el-text>
                    </div>
                </el-col>
                <el-col :span="3" />

                <el-col :span="3">
                    <div style="padding-top: 5px;">
                        <el-text type="warning" style="padding-left: 20px">进行中:

                        </el-text>
                    </div>
                    <el-col :span="2" />

                </el-col> -->
            </el-row>
        </div>
    </div>
</template>


<script setup>
import axios from 'axios'
import { getMyTaskAPI } from '@/apisLittle/task';
import { onMounted, ref } from 'vue'
const tableData = ref([])
const port = localStorage.getItem('nodePort')
const total = ref(0)
const queryForm = ref({
    queryName: '',
    page: 1,
    pageSize: 5
})

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
onMounted(() => {
    getMyTask()
})


</script>

<style lang="scss" scoped>
.el-row {
    margin-bottom: 20px;
}

.el-row:last-child {
    margin-bottom: 0;
}

.el-col {
    border-radius: 4px;
}

.grid-content {
    display: flex;
    border-radius: 4px;
    min-height: 50px;
    background-color: #F0F2F5;
    padding-left: 15px;
    font-size: 16px;
    font-family: '微软雅黑';
}
</style>