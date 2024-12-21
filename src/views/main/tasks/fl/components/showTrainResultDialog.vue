<template>
    <el-dialog v-loading="diaLoading" class="fl-res-dialog" :model-value="resultDialogValue" @open="openFun"
        width="1000px" @close="handleClose" append-to-body destroy-on-close>

        <div class="resPic" ref="chartContainer" style="width: 100%; height: 500px;"></div>


    </el-dialog>
</template>

<script setup>


import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TooltipComponent, GridComponent, TitleComponent, LegendComponent } from 'echarts/components';  // 导入 LegendComponent
import { CanvasRenderer } from 'echarts/renderers';
import { nextTick, onMounted, ref } from 'vue';
import axios from 'axios'

const props = defineProps({
    taskUuid: {
        type: String,
        required: true,
    }
})
const emits = defineEmits(['update:modelValue'])
const handleClose = () => {
    emits('update:modelValue', false)
}
const chartContainer = ref(null);
// 注册组件
echarts.use([LineChart, TooltipComponent, GridComponent, TitleComponent, LegendComponent, CanvasRenderer]);
// 这里使用 Vue 3 Composition API
const accuracies = ref([]);  // 准确度
const losses = ref([])  // 损失
const errors = ref([])  // 错误率
const labels = ref([]);  // 标签
const errorSeries = ref([])
const optionData = ref(['Accuracy', 'Loss'])
const diaLoading = ref(false)
const getAccuracytData = async () => {
    option.value = {
        animationDuration: 10000,

        title: {
            text: '模型训练结果',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {
            data: [],
            top: '10%'  // 放置legend的位置
        },
        grid: {
            left: '5%',
            right: '5%',
            bottom: '10%',
            top: '20%'
        },
        xAxis: {
            type: 'category',
            name: '训练轮数',
            nameLocation: 'middle',  // 将name位置设置到x轴正下方
            nameGap: 25,  // 控制name与x轴的距离
            data: [],
        },
        yAxis: [
            {
                type: 'value',
                name: 'Accuracy / Error',
                min: 0,
                max: 1,
                position: 'left',
                axisLabel: {
                    formatter: '{value}'
                }
            },
            {
                type: 'value',
                name: 'Loss',

                min: 0,
                max: 5,
                position: 'right',
                axisLabel: {
                    formatter: '{value}'
                }
            }
        ],
        series: [
            {
                name: 'Accuracy',
                type: 'line',
                data: accuracies.value,
                smooth: true,
                showSymbol: false,

                endLabel: {
                    show: true,
                    formatter: function (params) {
                        return 'Loss' + ': ' + params.value;
                    }
                },
                emphasis: {
                    focus: 'series'
                },
                yAxisIndex: 0,
            },
            {
                name: 'Loss',
                type: 'line',
                data: losses.value,
                smooth: true,
                showSymbol: false,

                emphasis: {
                    focus: 'series'
                },
                endLabel: {
                    show: true,
                    formatter: function (params) {
                        return 'Loss' + ': ' + params.value;
                    }
                },
                yAxisIndex: 1,
            },

        ]
    }
    await axios.post('/api/FL/getTrainResultParamsByUuid', { paramsType: 1, taskUuid: props.taskUuid }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                accuracies.value = res.data.data.accuracies
                option.value.series[0].data = accuracies.value
                accuracies.value.forEach((accuracy, index) => {
                    option.value.xAxis.data.push(`${index + 1}`)
                })
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
}
const getErrortData = async () => {

    await axios.post('/api/FL/getTrainResultParamsByUuid', { paramsType: 3, taskUuid: props.taskUuid }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                labels.value = res.data.data.labels
                errors.value = res.data.data.errors
                labels.value.forEach((label, index) => {
                    optionData.value.push(`Eorrr-${label}`)
                    option.value.series.push({
                        name: `Eorrr-${label}`,
                        type: 'line',
                        data: errors.value[index],
                        showSymbol: false,
                        smooth: true,
                        endLabel: {
                            show: true,
                            formatter: function (params) {
                                return 'Loss' + ': ' + params.value;
                            }
                        },
                        emphasis: {
                            focus: 'series'
                        },
                        yAxisIndex: 0,
                    })
                })
                option.value.legend.data = optionData.value

            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
}
const getLosstData = async () => {
    await axios.post('/api/FL/getTrainResultParamsByUuid', { paramsType: 2, taskUuid: props.taskUuid }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                losses.value = res.data.data.losses
                option.value.series[1].data = losses.value

            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })
}

const option = ref({
    animationDuration: 10000,

    title: {
        text: '模型训练结果',
    },
    tooltip: {
        trigger: 'axis',
        axisPointer: {
            type: 'cross'
        }
    },
    legend: {
        data: [],
        top: '50%'  // 放置legend的位置
    },
    grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '20%'
    },
    xAxis: {
        type: 'category',
        name: '训练轮数',
        nameLocation: 'middle',  // 将name位置设置到x轴正下方
        nameGap: 25,  // 控制name与x轴的距离
        data: [],
    },
    yAxis: [
        {
            type: 'value',
            name: 'Accuracy / Error',
            min: 0,
            max: 1,
            position: 'left',
            axisLabel: {
                formatter: '{value}'
            }
        },
        {
            type: 'value',
            name: 'Loss',

            min: 0,
            max: 5,
            position: 'right',
            axisLabel: {
                formatter: '{value}'
            }
        }
    ],
    series: [
        {
            name: 'Accuracy',
            type: 'line',
            data: accuracies.value,
            smooth: true,
            showSymbol: false,

            endLabel: {
                show: true,
                formatter: function (params) {
                    return 'Loss' + ': ' + params.value;
                }
            },

            labelLayout: {
                moveOverlap: 'shiftY'
            },
            emphasis: {
                focus: 'series'
            },
            yAxisIndex: 0,
        },
        {
            name: 'Loss',
            type: 'line',
            data: losses.value,
            smooth: true,
            showSymbol: false,

            emphasis: {
                focus: 'series'
            },
            labelLayout: {
                moveOverlap: 'shiftY'
            },
            endLabel: {
                show: true,
                formatter: function (params) {
                    return 'Loss' + ': ' + params.value;
                }
            },
            yAxisIndex: 1,
        },

    ]
})
const openFun = async () => {
    diaLoading.value = true
    await getAccuracytData()
    await getLosstData()
    await getErrortData()
    nextTick(() => {
        console.log('option.value', option.value);
        const myChart = echarts.init(chartContainer.value);
        myChart.setOption(option.value);
    })
    diaLoading.value = false
}

</script>
<style lang="scss" scoped>
.res-container {
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
}
</style>