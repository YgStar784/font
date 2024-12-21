<template>
    <div class="form-header">
        <h3>编辑--{{ formTitle }}</h3>
    </div>
    <div class="form-container">
        <a-form class="form" :model="props.nodeInfo" style="margin-top: 10px;">


            <a-form-item label="类型 ">
                <a-input class="text-ellipsis" v-model:value="props.nodeInfo.type" type="text" placeholder="type"
                    disabled>

                </a-input>
            </a-form-item>
            <a-form-item label="名称 ">
                <a-input class="text-ellipsis" v-model:value="props.nodeInfo.name" type="text" placeholder="name"
                    disabled>
                    <template #prefix>
                        <User />
                    </template>
                </a-input>
            </a-form-item>
            <a-form-item label="节点算力 ">
                <a-input class=" text-ellipsis borderInput" v-model:value="props.nodeInfo.params.cpu_capacity"
                    placeholder="cpu_capacity" readonly>

                </a-input>
            </a-form-item>
            <a-form-item label="节点内存 ">
                <a-input class="text-ellipsis borderInput" v-model:value="props.nodeInfo.params.memory_capacity"
                    placeholder="memory_capacity" readonly>

                </a-input>
            </a-form-item>
            <a-form-item label="节点存储 ">
                <a-input class="text-ellipsis borderInput" v-model:value="props.nodeInfo.params.storage_capacity"
                    type="text" placeholder="storage_capacity" readonly>

                </a-input>
            </a-form-item>
            <a-form-item label="节点带宽 ">
                <a-input class="text-ellipsis borderInput" v-model:value="props.nodeInfo.params.net_throughput"
                    type="text" placeholder="net_throughput" readonly>

                </a-input>
            </a-form-item>
            <a-form-item label="状态 ">
                <template v-if="props.nodeInfo.params.state && props.nodeInfo.params.state === 'success'">
                    <a-tag color="success">
                        <template #icon>
                            <check-circle-outlined />
                        </template>
                        在线
                    </a-tag>
                </template>
                <template v-else-if="props.nodeInfo.params.state && props.nodeInfo.params.state === 'failed'">
                    <a-tag color="error">
                        <template #icon>
                            <close-circle-outlined />
                        </template>
                        在线
                    </a-tag>
                </template>
            </a-form-item>
            <a-form-item v-if="props.nodeInfo.type === 'node'" label="需求描述 ">
                <a-textarea type="text" v-model:value="CurrentNodeInfo.dataDescription"
                    placeholder="训练数据集的需求，比如需要xx数据，min/max为多少等" allow-clear></a-textarea>
            </a-form-item>
            <a-form-item v-if="props.nodeInfo.type === 'polymer'" label="需求描述 ">
                <a-textarea v-model:value="CurrentNodeInfo.dataDescription" type="text"></a-textarea>
            </a-form-item>
            <!--             <a-form-item v-if="props.nodeInfo.type === 'starter'" label="需求描述 ">
                <a-textarea v-model:value="CurrentNodeInfo.dataDescription" type="text"></a-textarea>
            </a-form-item> -->
            <div class="form-but">
                <a-form-item>
                    <a-popconfirm :title='`你确定要刷新${formTitle}吗？`' ok-text="Yes" cancel-text="No"
                        @confirm="refreshConfirm" @cancel="cancel">
                        <a-button>刷新</a-button>
                    </a-popconfirm>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" @click="onSubmit" disabled>
                        保存
                    </a-button>
                </a-form-item>
            </div>
        </a-form>
    </div>
</template>
<script setup>
import { reactive, ref, defineProps } from 'vue';
import SomeTools from '@/utils/someTools'
import { SendOutlined, CheckCircleOutlined, CloseCircleOutlined, UserOutlined, ItalicOutlined, HeatMapOutlined } from '@ant-design/icons-vue';
const formTitle = '节点信息'
const taskInfo = ref({
    name: '',
    task_id: '',
    n_rounds: 1,
});

taskInfo.value.task_id = SomeTools.guid()
const tipColor = ref('#108ee9')
const emits = defineEmits(['updateNodeInfo'])
const props = defineProps({
    nodeInfo: {
        type: Object,
        required: true,
    }
})
const CurrentNodeInfo = ref(props.nodeInfo)
console.log(props.nodeInfo);
//刷新节点信息
const refreshConfirm = e => {
    console.log(e);
    taskInfo.value.name = ''
    taskInfo.value.n_rounds = 1
};
const cancel = e => {
    console.log(e);
};
const onSubmit = () => {
    // 使用 `emit` 触发事件，将 `updatedFormula` 传递给父组件
    emits('updateNodeInfo', CurrentNodeInfo.value);
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

.borderInput {
    border: none;
    box-shadow: none;
}

.form-container {
    width: 100%;
    padding: 10px;
}

.form {
    width: 100%;
}
</style>