<template>
    <!-- 安全多方计算 -->
    <div class="header header-MPC">
        <el-row align="middle" class="grid-content">
            <el-col :span="24">
                <h3 class="title">安全多方计算</h3>
            </el-col>
        </el-row>
        <div class="info clearfix">
            <div class="port leftfix">
                <span>端口:</span>
                <input type="text" class="but" disabled>
            </div>
            <div class="datasource leftfix">数据源:</div>
            <div class="task leftfix">任务:</div>
        </div>
    </div>
    <!-- 匿踪查询 -->
    <!--     <div class="header header-PIR">
        <el-row align="middle" class="grid-content">
            <el-col :span="24">
                <h3 class="title">匿踪查询</h3>
            </el-col>
        </el-row>
        <div class="info clearfix">
            <div class="port leftfix">
                <span>端口: </span>
                <span class="number">8000</span>
            </div>
            <div class="datasource leftfix">
                <span>数据源: </span>
                <a href="#">3</a>
            </div>
            <div class="task leftfix">
                <span>任务: </span>
                <a href="#">4</a>
            </div>
        </div>
    </div> -->
    <!-- 安全多方计算 -->
    <!--     <div class="header header-MPC">
        <el-row align="middle" class="grid-content">
            <el-col :span="24">
                <h3 class="title">安全多方计算</h3>
            </el-col>
        </el-row>
        <div class="info clearfix">
            <div class="port leftfix">
                <span>端口:</span>
                <input type="text" class="but" disabled>
            </div>
            <div class="datasource leftfix">数据源:</div>
            <div class="task leftfix">任务:</div>
        </div>
    </div> -->
    <!-- 联邦学习 -->
    <!-- 
        <el-row align="middle" class="grid-content">
            <el-col :span="24">
                <h3 class="title">联邦学习</h3>
            </el-col>
        </el-row>
        <div class="info clearfix">
            <div class="port leftfix"> <span>端口:</span>
                <input type="text" class="but" disabled>
            </div>
            <div class="datasource leftfix">数据源:</div>
            <div class="task leftfix">
                <span>任务: </span>
                <a href="#"></a>
            </div>
        </div>
    </div> -->
    <!-- 隐私求交 -->
    <!--     <div class="header header-PSI">
        <el-row align="middle" class="grid-content">
            <el-col :span="24">
                <h3 class="title">隐私求交</h3>
            </el-col>
        </el-row>
        <div class="info clearfix">
            <div class="port leftfix"> <span>端口:</span>
                <input type="text" class="but" disabled>
            </div>
            <div class="datasource leftfix">数据源:</div>
            <div class="task leftfix">任务:</div>
        </div>
    </div> -->
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
.leftfix {
    float: left;
}

.rightfix {
    float: right;
}

.clearfix::after {
    clear: both;
}

.header .title {
    padding-left: 5px;
    border-left: 10px solid #337ecc;

}

.info {
    height: 100px;
    font-size: 14px;
    padding: 10px;
    padding-left: 20px;
    box-sizing: content-box;
}

.port,
.datasource,
.task {
    width: 300px;
    height: 50px;
    line-height: 50px;

}

.port .number {

    color: #337ecc;
    font-weight: 700;
    background-color: white;


}

.port .but {
    opacity: 0;
    width: 50px;
    background-color: #409EFF;
    background-clip: text;
}

.datasource a {
    color: #409EFF;
}

.task a {
    color: rgb(239, 179, 68);
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