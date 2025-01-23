<template>
    <el-dialog v-loading="diaLoading" class="fl-res-dialog" :model-value="resultDialogValue" @open="openFun"
        width="1200px" height="800px" @close="handleClose" append-to-body destroy-on-close>
        <!-- 粒子背景 -->
        <canvas class="particle-bg" ref="particleCanvas"></canvas>

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
    </el-dialog>
</template>
<script setup>
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { ref, nextTick, onMounted } from 'vue';
import axios from 'axios';
import { NCarousel, NCarouselItem } from 'naive-ui';
import { CloseBold } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router';
echarts.use([LineChart, TooltipComponent, GridComponent, TitleComponent, LegendComponent, CanvasRenderer]);
const router = useRouter();
const props = defineProps({
    taskUuid: {
        type: String,
        required: true,
    }
});
const alwaysShowArrow = ref(true);  // 是否始终显示箭头

const emits = defineEmits(['update:modelValue']);
const diaLoading = ref(false);
const handleClose = () => {
    emits('update:modelValue', false);
};

// 容器 ref
const chartContainer = ref(null);
const accuracyChartContainer = ref(null);
const errorChartContainer = ref(null);
const lossChartContainer = ref(null);

// 数据
const accuracies = ref([]);
const losses = ref([]);
const errors = ref([]);
const labels = ref([]);
// 自定义关闭图标




// 选项数据
const optionData = ref(['Accuracy', 'Loss']);

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
    return await axios.post('/api/FL/getTrainResultParamsByUuid', { paramsType, taskUuid: props.taskUuid }, {
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

// 打开弹窗时加载数据并渲染图表
const openFun = async () => {
    diaLoading.value = true;
    option.value.xAxis.data = []
    createParticleEffect();

    await getAccuracytData();
    await getLosstData();
    await getErrortData();
    nextTick(() => {
        renderMainChart();
        renderAccuracyChart();
        renderErrorChart();
        renderLossChart();
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
    diaLoading.value = false;
};


</script>
<style scoped>
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
    width: 600px;
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

.chart-container {
    position: relative;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;
    padding: 10px;
}

.carousel {
    background-color: transparent;
    width: 100%;
    height: 600px;
    overflow: hidden;
}

/* 动态点缀的粒子 */
.dot {
    position: absolute;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    animation: float 5s infinite ease-in-out;
}

.dot-1 {
    width: 10px;
    height: 10px;
    top: 20%;
    left: 10%;
}

.dot-2 {
    width: 15px;
    height: 15px;
    top: 50%;
    left: 70%;
}

.dot-3 {
    width: 8px;
    height: 8px;
    top: 80%;
    left: 30%;
}

/* 粒子上下浮动动画 */
@keyframes float {
    0% {
        transform: translateY(0px);
        opacity: 0.8;
    }

    50% {
        transform: translateY(-10px);
        opacity: 1;
    }

    100% {
        transform: translateY(0px);
        opacity: 0.8;
    }
}
</style>
<style>
.el-carousel__mask {
    background-color: transparent;
    /* 设置背景为透明 */

}

.el-dialog__body {
    position: relative;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
}

.fl-res-dialog .el-dialog__header.show-close {
    padding: 0;
}

.fl-res-dialog .el-dialog__close {
    color: #409EFF;
    /* 修改图标颜色为蓝色 */
    font-size: 28px;
    /* 可调整大小 */
    transition: color 0.3s;
    z-index: 20;
}

.fl-res-dialog .el-dialog__close:hover {
    color: #66b1ff;
    /* 鼠标悬浮时的颜色 */
    z-index: 20;

}

.fl-res-dialog.el-dialog {
    padding: 0;
}
</style>