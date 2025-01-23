<template>
    <div class="form-header">
        <h3>编辑--{{ formTitle }}</h3>

    </div>
    <div class="form-container">
        <a-form :model="layerInfo" style="margin-top: 10px;" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }"
            label-align="left">

            <a-form-item v-if="layerInfo.params.type" label="名称">
                <a-input v-model:value="layerInfo.params.type" type="text" disabled />
            </a-form-item>


            <!-- conv1d -->
            <div v-if="layerInfo.params.type === 'conv1d'" class="conv1d">
                <a-form-item label="in_channels">
                    <a-input-number v-model:value="layerInfo.params.in_channels" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="out_channels">
                    <a-input-number v-model:value="layerInfo.params.out_channels" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="kernel_size">
                    <a-input-number v-model:value="layerInfo.params.kernel_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="stride">
                    <a-input-number v-model:value="layerInfo.params.stride" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="padding">
                    <a-input-number v-model:value="layerInfo.params.padding" :min="0" :step="1" />
                </a-form-item>
            </div>

            <div v-else-if="layerInfo.params.type === 'conv2d'" class="conv2d">
                <a-form-item label="in_channels">
                    <a-input-number v-model:value="layerInfo.params.in_channels" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="out_channels">
                    <a-input-number v-model:value="layerInfo.params.out_channels" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="kernel_size">
                    <a-input-number v-model:value="layerInfo.params.kernel_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="stride">
                    <a-input-number v-model:value="layerInfo.params.stride" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="padding">
                    <a-input-number v-model:value="layerInfo.params.padding" :min="0" :step="1" />
                </a-form-item>
            </div>
            <!-- conv2d -->


            <!-- linear -->
            <div v-else-if="layerInfo.params.type === 'linear'" class="linear">
                <a-form-item label="in_features">
                    <a-input-number v-model:value="layerInfo.params.in_features" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="out_features">
                    <a-input-number v-model:value="layerInfo.params.out_features" :min="1" :step="1" />
                </a-form-item>
            </div>

            <!-- transformer -->
            <div v-else-if="layerInfo.params.type === 'transformer'" class="transformer">
                <a-form-item label="d_model">
                    <a-input-number v-model:value="layerInfo.params.d_model" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="nhead">
                    <a-input-number v-model:value="layerInfo.params.nhead" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="num_encoder_layers">
                    <a-input-number v-model:value="layerInfo.params.num_encoder_layers" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="num_decoder_layers">
                    <a-input-number v-model:value="layerInfo.params.num_decoder_layers" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="dim_feedforward">
                    <a-input-number v-model:value="layerInfo.params.dim_feedforward" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="dropout">
                    <a-input-number v-model:value="layerInfo.params.dropout" :min="0" :max="1" :step="0.01" />
                </a-form-item>
                <a-form-item label="activation">
                    <a-select v-model:value="layerInfo.params.activation" style="width: 200px">
                        <a-select-option value="relu">ReLU</a-select-option>
                        <a-select-option value="gelu">GELU</a-select-option>
                    </a-select>
                </a-form-item>
            </div>

            <!-- lstm -->
            <div v-else-if="layerInfo.params.type === 'lstm'" class="lstm">
                <a-form-item label="input_size">
                    <a-input-number v-model:value="layerInfo.params.input_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="hidden_size">
                    <a-input-number v-model:value="layerInfo.params.hidden_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="num_layers">
                    <a-input-number v-model:value="layerInfo.params.num_layers" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="batch_first">
                    <a-switch v-model:value="layerInfo.params.batch_first" />
                </a-form-item>
                <a-form-item label="dropout">
                    <a-input-number v-model:value="layerInfo.params.dropout" :min="0" :max="1" :step="0.01" />
                </a-form-item>
                <a-form-item label="bidirectional">
                    <a-switch v-model:value="layerInfo.params.bidirectional" />
                </a-form-item>
            </div>

            <!-- maxpool -->
            <div v-else-if="layerInfo.params.type === 'maxpool'" class="maxpool">
                <a-form-item label="kernel_size">
                    <a-input-number v-model:value="layerInfo.params.kernel_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="stride">
                    <a-input-number v-model:value="layerInfo.params.stride" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="padding">
                    <a-input-number v-model:value="layerInfo.params.padding" :min="0" :step="1" />
                </a-form-item>
            </div>

            <!-- batchnorm1d -->
            <div v-else-if="layerInfo.params.type === 'batchnorm1d'" class="batchnorm1d">
                <a-form-item label="num_features">
                    <a-input-number v-model:value="layerInfo.params.num_features" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="eps">
                    <a-input-number v-model:value="layerInfo.params.eps" :min="0.00001" :step="0.00001" />
                </a-form-item>
                <a-form-item label="momentum">
                    <a-input-number v-model:value="layerInfo.params.momentum" :min="0" :max="1" :step="0.01" />
                </a-form-item>
            </div>
            <!-- batchnorm1d -->
            <div v-else-if="layerInfo.params.type === 'reshape'" class="reshape">
                <!-- Select 下拉框 -->
                <!-- 选择 shape 的维度 -->
                <a-form-item label="shape"> <a-input-group compact>
                        <!-- 选择 shape 的维度 -->
                        <a-select v-model:value="selectedDimension" style="width: 60%">
                            <a-select-option :key="0" :value="0">batch_size</a-select-option>
                            <a-select-option :key="1" :value="1">num_channels</a-select-option>
                            <a-select-option :key="2" :value="2">height</a-select-option>
                            <a-select-option :key="3" :value="3">width</a-select-option>
                        </a-select>

                        <!-- 输入 shape 的值 -->
                        <a-input-number v-model:value="layerInfo.params.shape[selectedDimension]" style="width: 30%"
                            placeholder="Enter value" />
                    </a-input-group></a-form-item>
            </div>
            <!-- dropout -->
            <div v-else-if="layerInfo.params.type === 'dropout'" class="dropout">
                <a-form-item label="p">
                    <a-input-number v-model:value="layerInfo.params.p" :min="0" :max="1" :step="0.01" />
                </a-form-item>
            </div>
            <!-- softmax -->
            <div v-else-if="layerInfo.params.type === 'softmax'" class="softmax">
                <a-form-item label="dim">
                    <a-input-number v-model:value="layerInfo.params.dim" :min="0" :max="1" :step="1" />
                </a-form-item>
            </div>

            <!-- lazy_conv1d -->
            <div v-else-if="layerInfo.params.type === 'lazy_conv1d'" class="lazy_conv1d">
                <a-form-item label="out_channels">
                    <a-input-number v-model:value="layerInfo.params.out_channels" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="kernel_size">
                    <a-input-number v-model:value="layerInfo.params.kernel_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="stride">
                    <a-input-number v-model:value="layerInfo.params.stride" :min="1" :step="1"
                        placeholder="Default: 1" />
                </a-form-item>
                <a-form-item label="padding">
                    <a-input-number v-model:value="layerInfo.params.padding" :min="0" :step="1"
                        placeholder="Default: 0" />
                </a-form-item>
            </div>

            <!-- lazy_conv2d -->
            <div v-else-if="layerInfo.params.type === 'lazy_conv2d'" class="lazy-conv2d">
                <a-form-item label="out_channels">
                    <a-input-number v-model:value="layerInfo.params.out_channels" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="kernel_size">
                    <a-input-number v-model:value="layerInfo.params.kernel_size" :min="1" :step="1" />
                </a-form-item>
                <a-form-item label="stride">
                    <a-input-number v-model:value="layerInfo.params.stride" :min="1" :step="1"
                        placeholder="Default: 1" />
                </a-form-item>
                <a-form-item label="padding">
                    <a-input-number v-model:value="layerInfo.params.padding" :min="0" :step="1"
                        placeholder="Default: 0" />
                </a-form-item>
            </div>

            <!-- lazy_linear -->
            <div v-else-if="layerInfo.params.type === 'lazy_linear'" class="lazy-linear">
                <a-form-item label="out_features">
                    <a-input-number v-model:value="layerInfo.params.out_features" :min="1" :step="1" />
                </a-form-item>
            </div>
        </a-form>



        <div class="form-but">
            <a-form-item>
                <a-popconfirm :title='`你确定要刷新${formTitle}吗？`' ok-text="Yes" cancel-text="No"
                    @confirm="refreshConfirm(layerInfo.id)" @cancel="cancel">
                    <a-button>刷新</a-button>
                </a-popconfirm>
            </a-form-item>
            <a-form-item>
                <a-button type="primary" @click="onSubmit">
                    保存
                </a-button>
            </a-form-item>
        </div>

    </div>

</template>

<script setup>
import VueSelect from "vue3-select-component";

import { onMounted, ref, reactive, watch } from 'vue'
import { menu } from '../../menu'
const props = defineProps({
    layerInfo: {
        type: Object,
        required: true,
    }
})
const layerInfo = reactive(JSON.parse(JSON.stringify(props.layerInfo))); // 深拷贝创建副本
const emits = defineEmits(['updateLayerInfo'])
const selectedDimension = ref(0)
console.log('props.layerInfo', props.layerInfo);
const formTitle = 'layer'
//刷新节点信息
const refreshConfirm = (id) => {
    const initValue = ref({})
    menu.forEach(item => {
        item.children.forEach(child => {
            if (child.id === id) {
                console.log('child', child);
                initValue.value = child
                console.log('props.layerInfo', props.layerInfo);
                emits('updateLayerInfo', initValue.value);
            }
        })
    })

};
const cancel = e => {
    console.log(e);
};
const onSubmit = () => {
    const updatedLayerInfo = JSON.parse(JSON.stringify(layerInfo));

    // 检查和保留 ico 字段
    if (props.layerInfo.info && props.layerInfo.info.ico) {
        updatedLayerInfo.info.ico = props.layerInfo.info.ico;
    }

    emits('updateLayerInfo', updatedLayerInfo);

};
// 监听父组件传递的新数据，更新本地副本
watch(
    () => props.layerInfo,
    (newValue) => {
        Object.assign(layerInfo, JSON.parse(JSON.stringify(newValue))); // 同步初始值
    },
    { deep: true }
);
</script>

<style lang="scss" scoped>
.form-header {
    width: 100%;
    height: 30px;
    background-color: rgb(243.9, 244.2, 244.8);
    line-height: 30px;
    padding: 8px;
    padding-left: 16px;
    box-sizing: content-box;

}

.form-but {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: space-around;
}

.form-container {
    width: 100%;
    padding: 20px;
}
</style>