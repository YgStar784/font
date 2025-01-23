<template>
    <div class="form-header">
        <h3>编辑--{{ formTitle }}</h3>
    </div>
    <div class="form-container">
        <a-form :model="localModelInfo" style="margin-top: 10px;">

            <a-form-item label="任务类型 ">
                <a-input class=" text-ellipsis borderInput" v-model:value="localModelInfo.params.task_type"
                    placeholder="cpu_capacity" readonly>

                </a-input>
            </a-form-item>
            <a-form-item label="训练轮数 ">

                <a-input-number v-model:value="localModelInfo.params.n_epochs" :min="1" :step="1" />

            </a-form-item>
            <a-form-item label="optimizer ">
                <VueSelect v-model="localModelInfo.params.optimizer" :options="[
                    { label: 'adam', value: 'adam' },
                    { label: 'sgd', value: 'sgd' },
                ]" placeholder="Select an optimizer" />
                <!--                 <a-input class="text-ellipsis borderInput" v-model:value="props.modelInfo.params.storage_capacity"
                    type="text" placeholder="storage_capacity" readonly>

                </a-input> -->
            </a-form-item>
            <a-form-item label="学习率 ">
                <a-input-number v-model:value="localModelInfo.params.learning_rate" :min="0" :max="1" :step="0.01" />
            </a-form-item>
            <a-form-item label="损失函数 ">
                <VueSelect v-model="localModelInfo.params.loss" :options="[
                    { label: 'cross_entropy', value: 'ce' },
                    { label: 'mse', value: 'mse' },
                ]" placeholder="loss function" />
            </a-form-item>
            <a-form-item label="批量 ">

                <a-input-number v-model:value="localModelInfo.params.batch_size" :min="1" :step="5" />

            </a-form-item>
            <a-form-item label="标签(可选) ">
                <a-input type="text" v-model:value="localModelInfo.params.tag" placeholder="tag"> </a-input>
            </a-form-item>
            <a-form-item label="设备 ">
                <VueSelect v-model="localModelInfo.params.device" :options="[
                    { label: 'cpu', value: 'cpu' },
                    { label: 'cuda', value: 'cuda' },
                ]" placeholder="device" />
            </a-form-item>
            <a-form-item label="n_components">
                <a-input-number v-model:value="localModelInfo.params.n_components" :min="1" :step="5" />

            </a-form-item>

            <div class="form-but">
                <a-form-item>
                    <a-popconfirm :title='`你确定要刷新${formTitle}吗？`' ok-text="Yes" cancel-text="No"
                        @confirm="refreshConfirm" @cancel="cancel">
                        <a-button>刷新</a-button>
                    </a-popconfirm>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" @click="onSubmit">
                        保存
                    </a-button>
                </a-form-item>
            </div>
        </a-form>
    </div>
</template>
<script setup>
import { watch, reactive, ref, defineProps } from 'vue';
import SomeTools from '@/utils/someTools'
import VueSelect from "vue3-select-component";

import { SendOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, ItalicOutlined, HeatMapOutlined } from '@ant-design/icons-vue';
const formTitle = '整体配置'
const taskInfo = ref({
    name: '',
    task_id: '',
    n_rounds: 1,
});
// 深拷贝创建本地副本

const tipColor = ref('#108ee9')
const emits = defineEmits(['updateModelInfo'])
const props = defineProps({
    modelInfo: {
        type: Object,
        required: true,
    }
})
const localModelInfo = reactive(JSON.parse(JSON.stringify(props.modelInfo)));

// 刷新逻辑：回退到初始值
const refreshConfirm = () => {
    Object.assign(localModelInfo, JSON.parse(JSON.stringify(props.modelInfo))); // 回退到初始值
};
const cancel = e => {
    console.log(e);
};
const onSubmit = () => {
    // 使用 `emit` 触发事件，将 `updatedFormula` 传递给父组件
    emits('updateModelInfo', JSON.parse(JSON.stringify(localModelInfo)));

};

// 监听父组件传递的新数据，更新本地副本
watch(
    () => props.modelInfo,
    (newValue) => {
        Object.assign(localModelInfo, JSON.parse(JSON.stringify(newValue)));
    },
    { deep: true, immediate: true }
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

.text-ellipsis {
    text-overflow: ellipsis;
}

.form-container {
    width: 100%;
    padding: 10px;
}

.borderInput {
    border: none;
    box-shadow: none;
}
</style>