<template>
    <div class="form-header">
        <h3>编辑--{{ formTitle }}</h3>
    </div>
    <div class="form-container">
        <a-form :model="CurrentTaskInfo" style="margin-top: 10px;">



            <a-form-item label="任务id ">
                <a-tooltip :title="CurrentTaskInfo.taskUuid" placement="top" :key="tipColor" :color="tipColor">
                    <a-input class="text-ellipsis" v-model:value="CurrentTaskInfo.taskUuid" type="text"
                        placeholder="Uid" disabled>
                        <template #prefix>
                            <ItalicOutlined />
                        </template>
                    </a-input>
                </a-tooltip>

            </a-form-item>
            <a-form-item label="任务名称 ">
                <a-tooltip :v-if="!CurrentTaskInfo.name" :title="CurrentTaskInfo.name" placement="top" :key="tipColor"
                    :color="tipColor">

                    <a-input class="text-ellipsis" v-model:value="CurrentTaskInfo.name" placeholder="任务名称">
                        <template #prefix>
                            <SendOutlined />
                        </template>
                    </a-input>
                </a-tooltip>

            </a-form-item>
            <a-form-item label="训练轮数 ">
                <a-input class="text-ellipsis" v-model:value="CurrentTaskInfo.n_rounds" type="number"
                    placeholder="训练轮数">
                    <template #prefix>
                        <HeatMapOutlined />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="需求描述 ">
                <a-textarea type="text" v-model:value="CurrentTaskInfo.taskDescription"
                    placeholder="请输入需求描述"></a-textarea>
            </a-form-item>
            <div class="form-but">
                <a-form-item>
                    <a-popconfirm :title='`你确定要重置${formTitle}吗？`' ok-text="Yes" cancel-text="No"
                        @confirm="refreshConfirm" @cancel="cancel">
                        <a-button>重置</a-button>
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
import { reactive, ref } from 'vue';
import SomeTools from '@/utils/someTools'
import { SendOutlined, ItalicOutlined, HeatMapOutlined } from '@ant-design/icons-vue';
const formTitle = '任务信息'

const props = defineProps({
    taskInfo: {
        type: Object,
        required: true,
    }
})
const CurrentTaskInfo = ref(props.taskInfo)

const tipColor = ref('#108ee9')
const emits = defineEmits(['updateTaskInfo'])
const refreshForm = () => {

}
const refreshConfirm = e => {
    console.log(e);
    CurrentTaskInfo.value.name = ''
    CurrentTaskInfo.value.n_rounds = 1
    CurrentTaskInfo.value.taskDescription = ''
};
const cancel = e => {
    console.log(e);
};
const onSubmit = () => {
    // 使用 `emit` 触发事件，将 `updatedFormula` 传递给父组件
    emits('updateTaskInfo', CurrentTaskInfo.value);
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

.text-ellipsis {
    text-overflow: ellipsis;
}

.form-container {
    width: 100%;
    padding: 10px;
}
</style>