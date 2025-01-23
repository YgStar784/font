<template>
    <div
        style="width: 100%; padding: 10px;padding-right: 20px; display: flex;flex-wrap: nowrap;flex-direction: row;justify-content: space-between; column-gap: 10px; height: 50px;align-items: center;background-color:#FAFCFF">
        <div
            style="display: flex;flex-wrap: nowrap;flex-direction: row;height: 100%;justify-content: center;align-items: center;gap: 5px;">
            <el-button width="30" @click="handleClose" :icon="ArrowLeftBold" circle />
            <span class="mx-1" style="font-size: 16px;font-weight: 900;">任务信息</span>
        </div>
        <el-button-group v-if="taskState === '0'">
            <el-button type="primary" size="small" @click="handleDownLoad(taskUuid, 1)">模型下载</el-button>
            <el-button type="default" size="small" @click="handleDownLoad(taskUuid, 2)">数据下载</el-button>

        </el-button-group>
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
            <el-descriptions title="参与者信息" v-loading="playerInfoLoading" :column="4">
                <template #extra>

                    <!--                     <el-button-group>
                        <el-button :type="isCard === true ? 'default' : 'primary'" size="small"
                            @click="isCard = !isCard" :icon="DocumentRemove
                                " />
                        <el-button :type="isCard === true ? 'primary' : 'default'" size="small"
                            @click="isCard = !isCard" :icon="Menu" />

                    </el-button-group>
 -->
                </template>

                <div v-if="!isCard" v-for="(item, index) in taskPlayerList">
                    <el-descriptions-item :span="1" :label='`参与者 ${index}-IP`'>{{ item.playerIp
                        }}</el-descriptions-item>
                    <el-descriptions-item :span="1" label="数据源描述">{{ item.dataDescription }}</el-descriptions-item>
                    <el-descriptions-item :span="1" label="角色">
                        <span v-if="item.role === 1" style="color:red;">Server</span>
                        <span v-if="item.role === 2" style="color:green;">Client</span>
                    </el-descriptions-item>
                    <el-descriptions-item :span="1" class="break-word" label="状态" v-if="item.playerState === 0">
                        <span style="color: #529b2e;">已接受</span>
                    </el-descriptions-item>
                    <el-descriptions-item :span="1" class="break-word" label="状态" v-if="item.playerState === 1">
                        <span style="color: #c45656;">已拒绝</span>

                    </el-descriptions-item>
                    <el-descriptions-item :span="1" class="break-word" label="状态" v-if="item.playerState === 2">
                        <span style="color: #303133;">待确认</span>
                    </el-descriptions-item>
                    <el-descriptions-item :span="2" v-show="item.playerState === 0 && item.role === 2"
                        label="trainDataSourceUuid">
                        {{ item.trainDataSourceUuid }}
                    </el-descriptions-item>
                    <el-descriptions-item :span="2" v-show="item.playerState === 0" label="evalDataSourceUuid">
                        {{ item.evalDataSourceUuid }}
                    </el-descriptions-item>

                    <br>
                </div>

            </el-descriptions>
        </el-card>
        <br>

        <el-card v-if="taskState === '0'" style="position: relative;">
            <div class="result-container"
                style=" display: flex;flex-direction: row;flex-wrap: nowrap;justify-content: space-between;">
                <h2 style="font-size: 16px;font-weight:bold;">任务结果</h2>
                <!--   <el-select v-model="type" style="width: 120px" @change="handleChange">
                    <el-option label="总图" :value="0"></el-option>
                    <el-option label="Accuracy" :value="1"></el-option>
                    <el-option label="Error-Label" :value="2"></el-option>
                    <el-option label="Loss" :value="3"></el-option> </el-select> -->
                <canvas class="particle-bg" ref="particleCanvas"></canvas>
            </div>
            <div v-loading="chartLoading">

                <!-- 粒子背景 -->


                <el-carousel class="carousel" :interval="4000" type="card" height="600px" arrow="always">

                    <!-- 总图 -->
                    <el-carousel-item class="carousel-item">
                        <div class="carousel-item-wrapper">
                            <div class="chart-container" ref="chartContainer"></div>
                        </div>
                    </el-carousel-item>
                    <!-- Accuracy 图表 -->
                    <el-carousel-item class="carousel-item">
                        <div class="carousel-item-wrapper">
                            <div class="chart-container" ref="accuracyChartContainer"></div>
                        </div>
                    </el-carousel-item>
                    <!-- Error 和 Labels 图表 -->
                    <el-carousel-item class="carousel-item">
                        <div class="carousel-item-wrapper">
                            <div class="chart-container" ref="errorChartContainer"></div>
                        </div>
                    </el-carousel-item>
                    <!-- Loss 图表 -->
                    <el-carousel-item class="carousel-item">
                        <div class="carousel-item-wrapper">
                            <div class="chart-container" ref="lossChartContainer"></div>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>
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
import { showMore } from '../isCreate';
import { column } from 'mathjs';
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ElMessage, ElMessageBox } from 'element-plus'

import axios from 'axios';
import { NCarousel, NCarouselItem } from 'naive-ui';
import { CloseBold } from '@element-plus/icons-vue'
import { convertLegacyProps } from 'ant-design-vue/es/button/buttonTypes';
echarts.use([LineChart, TooltipComponent, GridComponent, TitleComponent, LegendComponent, CanvasRenderer]);
const router = useRouter()
const loading = ref(false)
const isCard = ref(false)
const type = ref(0)
const handleClose = () => {
    showMore.value = 'false'
    localStorage.setItem('showMore', 'false')
    router.push({ name: 'federatedLearning' })
}
const taskPlayerList = ref([])
const taskUuid = ref('')
const taskName = ref('')
const createTime = ref('')
const taskDescription = ref('')
const taskInfoError = ref('')
const taskState = ref('')
const playerInfoLoading = ref(false)
// 容器 ref
const chartContainer = ref(null);
const accuracyChartContainer = ref(null);
const errorChartContainer = ref(null);
const lossChartContainer = ref(null);
const chartLoading = ref(false)
// 数据
const accuracies = ref([]);
const losses = ref([]);
const errors = ref([]);
const labels = ref([]);
// 自定义关闭图标


/* const handleClick = (tab) => {
    console.log('触发 tab 点击事件:', tab);
    nextTick(() => {
        console.log('tab.index in nextTick:', tab.index);
        if (tab.index === 0) {
            renderAccuracyChart();
        }
        if (tab.index === 1) {
            renderErrorChart();
            console.log('renderErrorChart');
        }
        if (tab.index === 2) {
            renderLossChart();
        }
    });
}; */

// 选项数据
const optionData = ref(['Accuracy', 'Loss']);
const handleChange = (index) => {
    console.log('index', index);
    chartLoading.value = true
    nextTick(() => {
        if (index === 0) {
            renderMainChart()
        }
        if (index === 1) {
            renderAccuracyChart();

        }
        if (index === 2) {
            renderErrorChart();

        }
        if (index === 3) {
            renderLossChart();
        }
    })
    chartLoading.value = false
}
const option = ref({
    animationDuration: 3000,
    title: { text: 'Result' },
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '20%', containLabel: true },
    xAxis: {
        type: 'category', name: '训练轮数', nameLocation: 'middle', nameGap: 25,
        boundaryGap: true  // 开启 X 轴两端留白
        , data: []
    },
    yAxis: [
        { type: 'value', name: 'Accuracy / Error', min: 0, max: 1, position: 'left', axisLabel: { formatter: '{value}' } },
        { type: 'value', name: 'Loss', min: Math.min(...losses.value) - 0.1, max: Math.max(...losses.value) + 0.1, position: 'right', axisLabel: { formatter: '{value}' } },

    ],
    series: [
        {
            name: 'Accuracy',
            type: 'line',
            data: accuracies.value,
            smooth: true,
            showSymbol: false,
            clip: false,  // 允许 endLabel 超出边界

            yAxisIndex: 0,
            endLabel: {
                show: true, formatter: (params) => `Accuracy: ${params.value}`,
                labelLayout: {
                    moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                }, overflow: 'break',  // 允许标签在图表外部显示

            }

        },
        {
            name: 'Loss',
            type: 'line',
            data: losses.value,
            smooth: true,
            showSymbol: false,
            clip: false,  // 允许 endLabel 超出边界

            yAxisIndex: 1,
            endLabel: {
                show: true, formatter: (params) => `Loss: ${params.value.toFixed(3)}`,
                labelLayout: {
                    moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                }
            },

        }
    ]
});
const particleCanvas = ref(null);

const createParticleEffect = () => {
    const canvas = particleCanvas.value;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;  // 获取设备像素比，默认 1

    let particles = [];
    const particleCount = 100;  // 粒子数量

    // 调整画布尺寸，保证高清
    const resizeCanvas = () => {
        const { offsetWidth: width, offsetHeight: height } = canvas;
        canvas.width = width * dpr;  // 实际宽度乘以像素比
        canvas.height = height * dpr;  // 实际高度乘以像素比
        ctx.scale(dpr, dpr);  // 缩放 context 以保证在高分辨率设备上的清晰度
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width / dpr;  // 乘以设备像素比
            this.y = Math.random() * canvas.height / dpr;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = 1.5 + Math.random();  // 调整粒子半径，适当减小
            this.opacity = Math.random();
            this.fadeSpeed = Math.random() * 0.01 + 0.005;
        }

        move() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width / dpr) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height / dpr) this.vy *= -1;

            this.opacity += this.fadeSpeed;
            if (this.opacity >= 1 || this.opacity <= 0) {
                this.fadeSpeed *= -1;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(64, 158, 255, ${this.opacity})`;  // Element Plus 蓝色
            ctx.shadowBlur = 4;  // 较小的阴影模糊度
            ctx.shadowColor = "rgba(144, 202, 249, 0.5)";
            ctx.fill();
            ctx.shadowBlur = 0;  // 重置阴影
        }
    }

    // 初始化粒子
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    const drawLines = () => {
        ctx.beginPath();
        ctx.lineWidth = 0.6;  // 更细的线条
        ctx.strokeStyle = "rgba(144, 202, 249, 0.15)";  // 更浅淡的线条颜色
        ctx.shadowBlur = 2;  // 适度的阴影
        ctx.shadowColor = "rgba(144, 202, 249, 0.2)";
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < 100) {
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                }
            }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;  // 重置阴影
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // 清空画布，保持透明背景

        particles.forEach((particle) => {
            particle.move();
            particle.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    };

    // 延迟 3 秒开始动画
    setTimeout(() => {
        animate();
    }, 3000); // 延迟 3 秒（3000ms）

};
// 请求数据
const fetchChartData = async (paramsType) => {
    return await axios.post('/api/FL/getTrainResultParamsByUuid', { paramsType, taskUuid: taskUuid.value }, {
        headers: { Authorization: localStorage.getItem('token') }
    }).then((res) => {
        if (res.data.code === 1000) {
            return res.data.data;
        } else if (res.data.code === 1006) {
            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' });
            handleClose();
            router.push({ path: '/login' });
            return null;
        } else {
            ElMessage({ type: 'error', message: res.data.message });
            return null;
        }
    });
};

const getAccuracytData = async () => {
    const data = await fetchChartData(1);
    if (data) {
        accuracies.value = data.accuracies;
        option.value.series[0].data = accuracies.value;
        accuracies.value.forEach((_, index) => {
            option.value.xAxis.data.push(`${index + 1}`);
        });
    }
};

const getErrortData = async () => {
    const data = await fetchChartData(2);
    if (data) {
        labels.value = data.labels;
        errors.value = data.errors;
        option.value.series = [
            {
                name: 'Accuracy',
                type: 'line',
                data: accuracies.value,
                smooth: true,
                showSymbol: false,
                yAxisIndex: 0,
                clip: false,  // 允许 endLabel 超出边界

                endLabel: {
                    show: true, formatter: (params) => `Accuracy: ${params.value}`,
                    labelLayout: {
                        moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                    }, overflow: 'break',  // 允许标签在图表外部显示

                }
            },
            {
                name: 'Loss',
                type: 'line',
                data: losses.value,
                smooth: true,
                showSymbol: false,
                yAxisIndex: 1,
                clip: false,  // 允许 endLabel 超出边界

                endLabel: {
                    show: true, formatter: (params) => `Loss: ${params.value.toFixed(3)}`,
                    labelLayout: {
                        moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                    }, overflow: 'break',  // 允许标签在图表外部显示

                },

            }
        ]
        labels.value.forEach((label, index) => {
            optionData.value.push(`Error-${label}`);
            option.value.series.push({
                name: `Error-${label}`,
                type: 'line',
                data: errors.value[index],
                showSymbol: false,
                smooth: true,
                endLabel: {
                    show: true,
                    formatter: (params) => `Error-${label}: ${params.value}`,
                    labelLayout: {
                        moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                    },
                    overflow: 'break',  // 允许标签在图表外部显示

                },
                yAxisIndex: 0,
            });
        });
    }
};

const getLosstData = async () => {
    const data = await fetchChartData(3);
    if (data) {
        losses.value = data.losses;
        option.value.series[1].data = losses.value;
    }
};
const handleDownLoad = async (uuid, resultType) => {
    let fileType = ''; // 文件类型
    let fileExtension = ''; // 文件扩展名
    let filePrefix = ''; // 文件前缀

    if (resultType === 1) {
        fileType = 'application/octet-stream'; // 通用二进制文件类型
        fileExtension = '.pth';
        filePrefix = 'model-';
        ElMessageBox.confirm(
            '确定下载' + taskName.value + '-' + uuid + '的模型文件吗?',
            '下载',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
            }
        ).then(async () => {
            axios.post('/api/FL/downloadTrainResultByUuid', { resultType: 1, taskUuid: uuid }, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
                responseType: 'blob',
            }).then(res => {
                console.log(res);
                const data = res.data;
                if (data.hasOwnProperty('code')) {
                    ElMessage({
                        type: 'error',
                        message: '下载失败',
                    });

                }
                else {
                    const blob = new Blob([data], { type: fileType });
                    const objectUrl = URL.createObjectURL(blob); // 创建 URL
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filePrefix + uuid + fileExtension; // 自定义文件名
                    link.click(); // 下载文件
                    URL.revokeObjectURL(objectUrl); // 释放内存
                }
            });
        });
    }

    if (resultType === 2) {
        fileType = 'application/octet-stream'; // 通用二进制文件类型
        fileExtension = '.h5';
        filePrefix = 'data-';
        ElMessageBox.confirm(
            '确定下载' + taskName.value + '-' + uuid + '的数据文件吗?',
            '下载',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
            }
        ).then(async () => {
            axios.post('/api/FL/downloadTrainResultByUuid', { resultType: 2, taskUuid: uuid }, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
                responseType: 'blob',
            }).then(res => {
                console.log(res);
                const data = res.data;
                if (data.hasOwnProperty('code')) {
                    ElMessage({
                        type: 'error',
                        message: '下载失败',
                    });
                } else {
                    const blob = new Blob([data], { type: fileType });
                    const objectUrl = URL.createObjectURL(blob); // 创建 URL
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = filePrefix + uuid + fileExtension; // 自定义文件名
                    link.click(); // 下载文件
                    URL.revokeObjectURL(objectUrl); // 释放内存
                }
            });
        });
    }
};
// 渲染总图
const renderMainChart = () => {
    const myChart = echarts.init(chartContainer.value);
    myChart.setOption(option.value);
};

// 渲染 Accuracy 图表
const renderAccuracyChart = () => {
    const chartInstance = echarts.init(accuracyChartContainer.value);
    chartInstance.setOption({
        ...option.value,
        grid: { right: '12%', containLabel: true },
        yAxis: [
            { type: 'value', name: 'Accuracy', min: 0, max: 1, position: 'left', axisLabel: { formatter: '{value}' } },
        ],
        title: { text: 'Accuracy' },
        series: [
            {
                name: 'Accuracy',
                type: 'line',
                data: accuracies.value,
                smooth: true,
                showSymbol: false,

                endLabel: {
                    show: true,
                    formatter: (params) => `Accuracy: ${params.value.toFixed(3)}`,
                    labelLayout: {
                        moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                    }, overflow: 'auto',  // 允许标签在图表外部显示

                }
            }
        ]
    });
};

// 渲染 Error 图表
const renderErrorChart = () => {
    const chartInstance = echarts.init(errorChartContainer.value);
    chartInstance.setOption({
        ...option.value,
        grid: { right: '10%' },
        yAxis: [
            { type: 'value', name: 'Error', min: 0, max: 1, position: 'left', axisLabel: { formatter: '{value}' } },
        ],
        title: { text: 'Error' },
        series: labels.value.map((label, index) => ({
            name: `Error-${label}`,
            type: 'line',
            data: errors.value[index],
            smooth: true,
            showSymbol: false,
            clip: false,  // 允许 endLabel 超出边界

            endLabel: {
                show: true,
                formatter: (params) => `Error-${label}: ${params.value.toFixed(3)}`,
                labelLayout: {
                    moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                }, overflow: 'break',  // 允许标签在图表外部显示

            }
        }))
    });
};

// 渲染 Loss 图表
const renderLossChart = () => {
    const chartInstance = echarts.init(lossChartContainer.value);
    chartInstance.setOption({
        ...option.value,

        title: { text: 'Loss ' },
        yAxis: {
            type: 'value',
            name: 'Loss',
            min: losses.value.length > 0 ? (Math.min(...losses.value) - 0.1).toFixed(3) : 0,
            max: losses.value.length > 0 ? (Math.max(...losses.value) + 0.1).toFixed(3) : 1,

            axisLabel: {
                formatter: (value) => value.toFixed(3) // 右侧 Y 轴（Loss）格式化为 3 位小数
            }
        },
        series: [{
            name: 'Loss',
            type: 'line',
            data: losses.value,
            smooth: true,
            showSymbol: false,
            clip: false,  // 允许 endLabel 超出边界

            endLabel: {
                show: true,
                formatter: (params) => `Loss: ${params.value.toFixed(3)}`,
                labelLayout: {
                    moveOverlap: 'shiftY' // 当标签重叠时，在 Y 轴方向上调整位置
                }, overflow: 'break',  // 允许标签在图表外部显示

            }
        }]
    });
};
onBeforeUnmount(() => {
    localStorage.setItem('showMore', 'false')
})
onMounted(async () => {
    playerInfoLoading.value = true
    taskUuid.value = localStorage.getItem('taskUuid')
    taskInfoError.value = localStorage.getItem('taskInfoError')

    taskState.value = localStorage.getItem('taskState')
    taskName.value = localStorage.getItem('taskName')
    createTime.value = localStorage.getItem('createTime')
    taskDescription.value = localStorage.getItem('taskDescription')
    await axios.post('/api/FL/getMyTrainTaskPlayers', {
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
    playerInfoLoading.value = false
    if (taskState.value === '0') {
        option.value.xAxis.data = []
        /*     createParticleEffect();
         */
        createParticleEffect()
        await getAccuracytData();
        await getLosstData();
        await getErrortData();
        nextTick(() => {
            renderMainChart();

            renderAccuracyChart()
            renderErrorChart()
            renderLossChart()
        });

        option.value.yAxis = [
            { type: 'value', name: 'Accuracy / Error', min: 0, max: 1, position: 'left', axisLabel: { formatter: '{value}' } },
            {
                type: 'value',
                name: 'Loss',
                min: losses.value.length > 0 ? (Math.min(...losses.value) - 0.1).toFixed(3) : 0,
                max: losses.value.length > 0 ? (Math.max(...losses.value) + 0.1).toFixed(3) : 1,
                position: 'right',
                clip: false,  // 允许 endLabel 超出边界

                axisLabel: {
                    formatter: (value) => value.toFixed(3) // 右侧 Y 轴（Loss）格式化为 3 位小数
                }
            },

        ]
    }
})  
</script>
<style lang="scss" scoped>
/* 父容器 */
.carousel-item-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    /* 父容器与图表之间的 padding */
    height: 100%;
    width: 100%;
}



/* 图表容器 */
.chart-container {
    background-color: #f8f9fa;
    width: 800px;
    /* 宽度固定为 600px */
    height: 500px;
    /* 高度固定为 500px */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 10px;
    /* 图表容器内部的 padding */
}

.el-carousel__mask {
    background-color: transparent;
    /* 设置背景为透明 */

}

.particle-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    background-color: transparent;
    /* 透明背景 */
}

.carousel {
    background-color: transparent;
    width: 100%;
    height: 600px;
    overflow: hidden;
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