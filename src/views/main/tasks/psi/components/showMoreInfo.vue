<template>
    <div
        style="width: 100%; padding: 10px;padding-right: 20px; display: flex;flex-wrap: nowrap;flex-direction: row;justify-content: space-between; column-gap: 10px; height: 50px;align-items: center;background-color:#FAFCFF">
        <div
            style="display: flex;flex-wrap: nowrap;flex-direction: row;height: 100%;justify-content: center;align-items: center;gap: 5px;">
            <el-button width="30" @click="handleClose" :icon="ArrowLeftBold" circle />
            <span class="mx-1" style="font-size: 16px;font-weight: 900;">任务信息</span>
        </div>
        <!--    <el-button-group v-if="taskState === '0'">
            <el-button type="primary" size="small" @click="handleDownLoad(taskUuid)">结果下载</el-button>

        </el-button-group> -->
    </div>
    <div style="padding: 20px;box-sizing: border-box;padding-top: 0;">
        <el-card v-loading="playerInfoLoading">
            <el-descriptions title="基本信息" :column="4">
                <el-descriptions-item label="任务ID" :span="1">{{ taskUuid }}</el-descriptions-item>
                <el-descriptions-item label="任务名称" :span="1">{{ taskName }}</el-descriptions-item>

                <el-descriptions-item label="角色" :span="1">任务发起方</el-descriptions-item>
                <el-descriptions-item label="创建时间" :span="2">{{ createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述" :span="3">{{ taskDescription }}</el-descriptions-item>
                <el-descriptions-item label="任务状态" :span="1">
                    <template v-if="taskState === '0'">
                        <a-badge status="success" text="成功" />

                    </template>
                    <template v-else-if="taskState === '1'">
                        <a-badge status="error" text="失败" />

                    </template>
                    <template v-else-if="taskState === '2'">
                        <a-badge status="processing" text="进行中" /> </template>
                    <template v-else-if="taskState === '3'">
                        <a-badge state=" processing" color="purple" text="待确认" />
                    </template>
                    <template v-else-if="taskState === '4'" effect="dark">
                        <a-badge status="processing" color="yellow" text="可进行" />
                    </template>
                    <template v-else-if="taskState === '5'" effect="dark">
                        <a-badge color="magenta" text="拒绝"></a-badge>
                    </template></el-descriptions-item>


                <el-descriptions-item v-if="taskInfoError" :span="4">
                    <template #label>
                        <span>失败原因</span>
                    </template>
                    <el-text class="mx-1" type="danger">{{ taskInfoError }}</el-text>
                </el-descriptions-item>
            </el-descriptions>
        </el-card>
        <br>
        <el-card>
            <el-descriptions :column="5" v-loading="playerInfoLoading" title="参与者信息">
                <div v-for="(item, index) in taskPlayerList">
                    <el-descriptions-item :span="1" :label='`参与者 ${index}-IP`'>{{ item.playerIp
                        }}</el-descriptions-item>
                    <el-descriptions-item :span="2" label="数据源Uuid">{{ item.dataSourceUuid }}</el-descriptions-item>
                    <!--                     <el-descriptions-item label="字段">{{ item.fieldName }}</el-descriptions-item>
 --> <el-descriptions-item :span="1" label="内网计算IP">{{ item.privateComputingAddress }}</el-descriptions-item>
                    <el-descriptions-item :span="1" class="break-word" label="状态" v-if="item.playerState === 0">
                        <span style="color: #529b2e;">已接受</span>
                    </el-descriptions-item>
                    <el-descriptions-item :span="1" class="break-word" label="状态" v-if="item.playerState === 1">
                        <span style="color: #c45656;">已拒绝</span>

                    </el-descriptions-item>
                    <el-descriptions-item :span="1" class="break-word" label="状态" v-if="item.playerState === 2">
                        <span style="color: #303133;">待确认</span>
                    </el-descriptions-item>
                    <br>
                </div>

            </el-descriptions>
        </el-card> <br>

        <el-card>
            <template #header>
                <div class="card-header">
                    <span style="font-weight: 900;font-size: 16px;">字段对齐</span>
                </div>
            </template>
            <el-table :data="tableData" border style="width: 100% ;margin-top:20px;" :span-method="mergeCells">
                <!-- 第一列：求交字段 -->
                <el-table-column fixed prop="label" label="" width="100">
                    <template #default="scope">
                        <span class="field-label">{{ scope.row.label }}</span>
                    </template>
                </el-table-column>
                <!-- 参与者列 -->
                <el-table-column v-for="(value, index) in maxLength" width="100" :key="index"
                    :label="`参与者 ${index + 1}`">
                    <template #default="scope">
                        <span>{{ scope.row.values[index] || '-' }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>

</template>

<script setup>
import {
    ArrowLeft,
    ArrowRight,
    Delete,
    Edit,
    Share,
    DocumentRemove,
    Menu,
    ArrowLeftBold
} from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
import { showMore } from '../../fl/isCreate';
import { column } from 'mathjs';
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ElMessage, ElMessageBox } from 'element-plus'

import axios from 'axios';
import { NCarousel, NCarouselItem } from 'naive-ui';
import { CloseBold } from '@element-plus/icons-vue'
import { convertLegacyProps } from 'ant-design-vue/es/button/buttonTypes';
const router = useRouter()
const loading = ref(false)
const isCard = ref(false)
const type = ref(0)
const handleClose = () => {
    showMore.value = 'false'
    localStorage.setItem('showMore', 'false')
    router.push({ name: 'privateSetIntersection' })
}
const isOutputCompleted = ref('')
const taskPlayerList = ref([])
const taskUuid = ref('')
const taskName = ref('')
const createTime = ref('')
const taskDescription = ref('')
const taskInfoError = ref('')
const taskState = ref('')
const playerInfoLoading = ref(false)
const fieldDictArray = ref([])
const tableData = computed(() => fieldDictArray.value);

// 获取最大参与方数量以动态渲染列数
const maxLength = computed(() => {
    if (fieldDictArray.value.length === 0) return 0; // 如果为空，返回 0
    return Math.max(...fieldDictArray.value.map((item) => item.values.length));
});
const extractFieldDictArray = (taskList) => {
    // 用来存储所有的字段键和值
    const fieldDictMap = new Map();

    taskList.forEach((task) => {
        try {
            // 解析 FieldDictString 为对象
            const fieldDict = JSON.parse(task.FieldDictString);

            Object.keys(fieldDict).forEach((key) => {
                if (!fieldDictMap.has(key)) {
                    // 如果 map 中没有这个 key，就初始化为数组
                    fieldDictMap.set(key, []);
                }
                // 将对应的值加入到该 key 下的数组中
                fieldDictMap.get(key).push(fieldDict[key]);
            });
        } catch (error) {
            console.error(`解析失败: ${task.FieldDictString}`, error);
        }
    });

    // 转换 map 为数组格式
    const result = Array.from(fieldDictMap, ([label, values]) => ({ label, values }));

    return result;
}


const handleDownLoad = async (uuid) => {
    ElMessageBox.confirm(
        '确定下载' + taskName.value + '-' + uuid + '的结果文件吗?',
        '下载',
        {
            confirmButtonText: '确认',
            cancelButtonText: '取消',

        }
    )
        .then(async () => {

            if (isOutputCompleted.value === '0' || isOutputCompleted === '1') {
                let outcome;
                if (isOutputCompleted.value === '0') {
                    outcome = 0
                } else {
                    outcome = 1
                }
                await axios.post('/api/PSI/downloadResultByUuid', { taskUuid: uuid, paramsType: outcome }
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
                        } else if (res.data.code === 1006) {
                            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                            setTimeout(() => {
                                router.push({ path: '/login' }); // 确保路径和名称正确
                            }, 500); // 避免动画加载导致页面阻塞
                            return
                        }
                        else {
                            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                            const objectUrl = URL.createObjectURL(blob) // 创建URL
                            link.href = objectUrl
                            link.download = `psi-${outcome}-` + uuid// 自定义文件名
                            link.click() // 下载文件
                            URL.revokeObjectURL(objectUrl); // 释放内存
                        }
                    })
            }
            if (isOutputCompleted.value === '2') {
                await axios.post('/api/PSI/downloadResultByUuid', { taskUuid: uuid, paramsType: 0 }
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
                        } else if (res.data.code === 1006) {
                            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                            setTimeout(() => {
                                router.push({ path: '/login' }); // 确保路径和名称正确
                            }, 500); // 避免动画加载导致页面阻塞
                            return
                        }
                        else {
                            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                            const objectUrl = URL.createObjectURL(blob) // 创建URL
                            link.href = objectUrl
                            link.download = 'psi-0-' + uuid// 自定义文件名
                            link.click() // 下载文件
                            URL.revokeObjectURL(objectUrl); // 释放内存
                        }
                    })

                await axios.post('/api/PSI/downloadResultByUuid', { taskUuid: uuid, paramsType: 1 }
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
                        } else if (res.data.code === 1006) {
                            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                            setTimeout(() => {
                                router.push({ path: '/login' }); // 确保路径和名称正确
                            }, 500); // 避免动画加载导致页面阻塞
                            return
                        }
                        else {
                            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
                            const objectUrl = URL.createObjectURL(blob) // 创建URL
                            link.href = objectUrl
                            link.download = 'psi-1-' + row.taskUuid// 自定义文件名
                            link.click() // 下载文件
                            URL.revokeObjectURL(objectUrl); // 释放内存
                        }
                    })
            }
            //const res = await downloadResultByUuidAPI({ taskUuid: row.taskUuid })

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


onBeforeUnmount(() => {
    localStorage.setItem('showMore', 'false')
})
onMounted(async () => {
    playerInfoLoading.value = true
    taskUuid.value = localStorage.getItem('taskUuid')
    taskInfoError.value = localStorage.getItem('taskInfoError')
    isOutputCompleted.value = localStorage.getItem('isOutputCompleted')
    taskState.value = localStorage.getItem('taskState')
    taskName.value = localStorage.getItem('taskName')
    createTime.value = localStorage.getItem('createTime')
    taskDescription.value = localStorage.getItem('taskDescription')
    await axios.post('/api/PSI/getMyTaskPlayers', {
        uuid: taskUuid.value,
        page: 1,
        pageSize: 30
    }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                taskPlayerList.value = res.data.data.taskList
                console.log(taskPlayerList.value)
            } else if (response.data.code === 1006) {
                playerInfoLoading.value = false
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
    fieldDictArray.value = extractFieldDictArray(taskPlayerList.value)
    playerInfoLoading.value = false

})  
</script>
<style lang="scss" scoped>
.chart-container {
    background-color: #F2F6FC;
    width: 800px;
    /* 宽度固定为 600px */
    height: 500px;
    /* 高度固定为 500px */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    /* 图表容器内部的 padding */
}
</style>

<style>
.custom.demo-tabs>.el-tabs__content {
    padding: 32px;
    color: #6b778c;
    font-size: 32px;
    font-weight: 600;
}

.custom .el-tabs__active-bar {
    background-color: transparent !important;
    /* 设置背景色为透明，并使用 !important 提升优先级 */
}


.el-tabs--right .el-tabs__content,
.el-tabs--left .el-tabs__content {
    height: 100%;
}

::deep(.custom.el-tabs__active-bar) {
    background: transparent !important;
}
</style>