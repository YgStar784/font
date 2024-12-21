<template>
    <div class="form-header">
        <h3>编辑--{{ formTitle }}</h3>
        <div class="form-container">
            <a-form :model="props.algInfo" style="margin-top: 10px;" :label-col="{ span: 8 }"
                :wrapper-col="{ span: 14 }" label-align="left">

                <a-form-item v-if="props.algInfo.name" label="名称">
                    <a-input v-model:value="props.algInfo.name" type="text" disabled />
                </a-form-item>
                <a-form-item v-if="props.algInfo.params.algorithm_type === 'FedProx'" label="mu">
                    <a-input-number v-model:value="props.algInfo.params.mu" :min="0" :step="0.01"></a-input-number>
                </a-form-item>
                <a-form-item v-if="props.algInfo.params.algorithm_type === 'Krum'" label="n_malicious">
                    <a-input-number v-model:value="props.algInfo.params.n_malicious" :min="0"
                        :step="1"></a-input-number>
                </a-form-item>
                <a-form-item v-if="props.algInfo.params.algorithm_type === 'FoolsGold'" label="confidence">
                    <a-input-number v-model:value="props.algInfo.params.confidence" :min="0.1" :max="1"
                        :step="0.1"></a-input-number>
                </a-form-item>
                <a-form-item :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }"
                    v-if="props.algInfo.params.algorithm_type === 'FedMut'" label="early_round_threshold">
                    <a-input-number v-model:value="props.algInfo.params.early_round_threshold" :min="1"
                        :step="5"></a-input-number>
                </a-form-item>
                <a-form-item v-if="props.algInfo.params.algorithm_type === 'DFedAvgM'" label="momentum">
                    <a-input-number v-model:value="props.algInfo.params.momentum" :min="0" :max="1"
                        :step="0.1"></a-input-number>
                </a-form-item>
                <a-form-item v-if="props.algInfo.params.algorithm_type === 'TrimmedMeanAggr'" label="alpha">
                    <a-input-number v-model:value="props.algInfo.params.alpha" :min="0" :max="1"
                        :step="0.1"></a-input-number>
                </a-form-item>
                <a-form-item :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }"
                    v-if="props.algInfo.params.algorithm_type === 'FedMR'" label="early_round_threshold">
                    <a-input-number v-model:value="props.algInfo.params.early_round_threshold" :min="1"
                        :step="5"></a-input-number>
                </a-form-item>
                <div v-if="props.algInfo.params.algorithm_type === 'MOON'">
                    <a-form-item label="tau">
                        <a-input-number v-model:value="props.algInfo.params.tau" :min="0" :max="1"
                            :step="0.1"></a-input-number>
                    </a-form-item>
                    <a-form-item label="mu">
                        <a-input-number v-model:value="props.algInfo.params.mu" :min="0" :step="0.01"></a-input-number>
                    </a-form-item>
                </div>

                <div v-if="props.algInfo.params.algorithm_type === 'pFedMe'">
                    <a-form-item label="beta">
                        <a-input-number v-model:value="props.algInfo.params.beta" :min="0" :max="1"
                            :step="0.01"></a-input-number>
                    </a-form-item>
                    <a-form-item label="lambda">
                        <a-input-number v-model:value="props.algInfo.params.lambda" :min="1" :max="30"
                            :step="1"></a-input-number>
                    </a-form-item>
                    <a-form-item label="nu">
                        <a-input-number v-model:value="props.algInfo.params.nu" :min="0" :max="1"
                            :step="0.01"></a-input-number>
                    </a-form-item>
                </div>
                <div v-if="props.algInfo.params.algorithm_type === 'FedCross'">
                    <a-form-item label="cross_mode">

                        <a-select ref="select" v-model:value="props.algInfo.params.cross_mode" @focus="focus"
                            @change="handleChange">
                            <a-select-option value="in_order">in_order</a-select-option>
                            <a-select-option value="highest_similarity">highest_similarity</a-select-option>
                            <a-select-option value="lowest_similarity">lowest_similarity</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item label="alpha">
                        <a-input-number v-model:value="props.algInfo.params.alpha" :min="0" :max="1"
                            :step="0.1"></a-input-number>
                    </a-form-item>
                </div>
                <div v-if="props.algInfo.params.algorithm_type === 'QuantizedDFedAvgM'">
                    <a-form-item label="momentum">
                        <a-input-number v-model:value="props.algInfo.params.momentum" :min="0" :max="1"
                            :step="0.1"></a-input-number>
                    </a-form-item>
                    <a-form-item label="q_step">
                        <a-input-number v-model:value="props.algInfo.params.q_step" :min="0" :max="1"
                            :step="0.1"></a-input-number>
                    </a-form-item>
                    <a-form-item label="q_bit">
                        <a-input-number v-model:value="props.algInfo.params.q_bit" :min="4" :max="32"
                            :step="1"></a-input-number>
                    </a-form-item>
                </div>
                <div v-if="props.algInfo.params.algorithm_type === 'MedianAggr'">
                    <a-form-item label="cross_mode">

                        <a-select ref="select" v-model:value="props.algInfo.params.method" @focus="focus"
                            @change="handleChange">
                            <a-select-option value="marginal_median">marginal_median</a-select-option>
                            <a-select-option value="trimmed_median">trimmed_median</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item label="n_malicious">
                        <a-input-number v-model:value="props.algInfo.params.n_malicious" :min="0"
                            :step="1"></a-input-number>
                    </a-form-item>
                </div>
                <div v-if="props.algInfo.params.algorithm_type === 'Bulyan'">
                    <a-form-item label="cross_mode">

                        <a-select ref="select" v-model:value="props.algInfo.params.aggr_rule" @focus="focus"
                            @change="handleChange">
                            <a-select-option value="median">median</a-select-option>
                            <a-select-option value="krum">krum</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item label="n_malicious">
                        <a-input-number v-model:value="props.algInfo.params.n_malicious" :min="0"
                            :step="1"></a-input-number>
                    </a-form-item>
                </div>
                <div v-if="props.algInfo.params.algorithm_type === 'DPAvg'">
                    <a-form-item label="total_epsilon">
                        <a-input-number v-model:value="props.algInfo.params.total_epsilon" :min="0" :max="1"
                            :step="0.1"></a-input-number>
                    </a-form-item>
                    <a-form-item label="delta">
                        <a-input-number v-model:value="props.algInfo.params.total_epsilon" :min="0" :max="1e-7"
                            :step="0.1"></a-input-number>
                    </a-form-item>
                    <a-form-item label="target">

                        <a-select ref="select" v-model:value="props.algInfo.params.target" @focus="focus"
                            @change="handleChange">
                            <a-select-option value="['weights']">['weights']</a-select-option>
                            <a-select-option value="['x']">['x']</a-select-option>
                            <a-select-option value="['x']">['x']</a-select-option>
                            <a-select-option value="['x', 'y', 'weights']">['x', 'y', 'weights']</a-select-option>
                        </a-select>
                    </a-form-item>
                    <a-form-item label="dp_alg">
                        <a-select ref="select" v-model:value="props.algInfo.params.dp_alg" @focus="focus"
                            @change="handleChange">
                            <a-select-option value="gaussian">gaussian</a-select-option>
                            <a-select-option value="laplace">laplace</a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
                <div v-if="props.algInfo.params.algorithm_type === 'BatchCrypt'">
                    <a-form-item label="batch_encode_size">
                        <a-input v-model:value="props.algInfo.params.distribution" type="text"></a-input>
                    </a-form-item>
                    <a-form-item label="batch_encode_size">
                        <a-input-number v-model:value="props.algInfo.params.batch_encode_size" :min="0"
                            :step="32"></a-input-number>
                    </a-form-item>
                    <a-form-item label="bit_width">
                        <a-input-number v-model:value="props.algInfo.params.bit_width" :min="0"
                            :step="8"></a-input-number>
                    </a-form-item>



                </div>
            </a-form>
            <div class="form-but">
                <a-form-item>
                    <a-popconfirm :title='`你确定要刷新${formTitle}吗？`' ok-text="Yes" cancel-text="No"
                        @confirm="refreshConfirm(props.algInfo.id)" @cancel="cancel">
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
    </div>

</template>

<script setup>
import VueSelect from "vue3-select-component";

import { ref } from 'vue'
import { menu } from '../../menu'
const props = defineProps({
    algInfo: {
        type: Object,
        required: true,
    }
})
const emits = defineEmits(['updateAlgInfo'])
const selectedDimension = ref(0)
console.log('props.algInfo', props.algInfo);
const formTitle = '聚合算法'
//刷新节点信息
const refreshConfirm = (id) => {
    const initValue = ref({})
    menu.forEach(item => {
        item.children.forEach(child => {
            if (child.id === id) {
                console.log('child', child);
                initValue.value = child
                console.log('props.algInfo', props.algInfo);
                emits('updatealgInfo', initValue.value);
            }
        })
    })

};
const cancel = e => {
    console.log(e);
};
const onSubmit = () => {
    // 使用 `emit` 触发事件，将 `updatedFormula` 传递给父组件
    emits('updatealgInfo', props.algInfo);

};

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
    padding: 10px;
}
</style>