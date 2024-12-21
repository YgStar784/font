<template>
    <el-dialog v-loading="diaLoading" class="flPr-res-dialog" :model-value="resultDialogValue" @open="openFun"
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
const predictions = ref([])
const diaLoading = ref(false)
const getPredictData = async () => {
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
            data: ['prediction'],
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
                name: 'value',
                position: 'left',
                axisLabel: {
                    formatter: '{value}'
                }
            },
        ],
        series: [
        ]
    }
    await axios.post('/api/FL/getPredictionResultParamsByUuid', { paramsType: 1, taskUuid: props.taskUuid }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                predictions.value = res.data.data.predictions
                option.value.series.push({
                    name: 'prediction',
                    type: 'line',
                    data: predictions.value,
                    smooth: true,
                    showSymbol: false,

                    endLabel: {
                        show: true,
                        formatter: function (params) {
                            return 'Prediction' + ': ' + params.value;
                        }
                    }
                }
                )
                predictions.value.forEach((prediction, index) => {
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
            name: 'value',
            min: 0,
            max: 1,
            position: 'left',
            axisLabel: {
                formatter: '{value}'
            }
        },
    ],
    series: [
    ]
})
const openFun = async () => {
    diaLoading.value = true
    await getPredictData()
    nextTick(() => {
        console.log('option.value', option.value);
        const myChart = echarts.init(chartContainer.value);
        myChart.setOption(option.value);
    })
    diaLoading.value = false
}

</script>
<style lang="scss" scoped></style>