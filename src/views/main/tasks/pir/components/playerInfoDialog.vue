<template>

    <el-dialog class="dialog" :model-value="props.dialogVisiblePlayer" width="1000px" @close="handleClose"
        append-to-body>
        <el-card>
            <el-descriptions title="基本信息">
                <el-descriptions-item label="任务ID">{{ props.taskUuid }}</el-descriptions-item>
                <el-descriptions-item label="任务名称">{{ props.taskName }}</el-descriptions-item>
                <el-descriptions-item label="角色">任务发起方</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ props.createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述">{{ props.taskDescription }}</el-descriptions-item>



            </el-descriptions>
        </el-card>
        <br>
        <el-card>
            <el-descriptions title="参与者信息">
                <div v-for="(item, index) in dialogTableValue">
                    <el-descriptions-item :label='`参与者 ${index}-IP`'>{{ item.playerIp }}</el-descriptions-item>
                    <el-descriptions-item label="数据源Uuid">{{ item.dataSourceUuid }}</el-descriptions-item>
                    <el-descriptions-item label="字段">{{ item.fieldName }}</el-descriptions-item>
                    <el-descriptions-item label="内网计算IP">{{ item.privateComputingAddress }}</el-descriptions-item>
                    <el-descriptions-item :span="20" class="break-word" label="状态" v-if="item.playerState === 0">
                        <span style="color: #529b2e;">已接受</span>
                    </el-descriptions-item>
                    <el-descriptions-item :span="20" class="break-word" label="状态" v-if="item.playerState === 1">
                        <span style="color: #c45656;">已拒绝</span>

                    </el-descriptions-item>
                    <el-descriptions-item :span="20" class="break-word" label="状态" v-if="item.playerState === 2">
                        <span style="color: #303133;">待确认</span>
                    </el-descriptions-item>
                    <br>
                </div>

            </el-descriptions>
        </el-card>
    </el-dialog>
</template>


<script setup>
const props = defineProps({
    dialogValue: {
        type: String,
        default: '',
        required: true
    },
    dialogTableValue: {
        type: Array,
        default: [],
        required: true
    },
    taskUuid: {
        type: String,
        default: '',
        required: true
    },
    taskName: {
        type: String,
        default: '',
        required: true
    },
    createTime: {
        type: String,
        default: '',
        required: true
    },
    taskDescription: {
        type: String,
        default: '',
        required: true
    },
})
const emits = defineEmits(['update:modelValue'])

const handleClose = () => {
    emits('update:modelValue', false)
}
</script>

<style scoped>
.break-word {
    word-break: break-all;
    /* 允许在单词内换行 */
    white-space: normal;
    /* 允许换行后的空白处理 */
}
</style>