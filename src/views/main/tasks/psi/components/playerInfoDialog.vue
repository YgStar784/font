<template>

    <el-dialog class="dialog" :model-value="props.dialogVisiblePlayer" width="1000px" @open="handlePlayerInfo"
        @close="handleClose" append-to-body>
        <el-card v-loading="playerInfoLoading">
            <el-descriptions title="基本信息" :column="4">
                <el-descriptions-item label="任务ID" :span="2">{{ props.taskUuid }}</el-descriptions-item>
                <el-descriptions-item label="任务名称" :span="1">{{ props.taskName }}</el-descriptions-item>
                <el-descriptions-item label="角色" :span="1">任务发起方</el-descriptions-item>
                <el-descriptions-item label="创建时间" :span="2">{{ props.createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述" :span="2">{{ props.taskDescription }}</el-descriptions-item>
                <el-descriptions-item v-if="props.taskInfoError" :span="4">
                    <template #label>
                        <span>失败原因</span>
                    </template>
                    <el-text class="mx-1" type="danger">{{ props.taskInfoError }}</el-text>

                </el-descriptions-item>



            </el-descriptions>
        </el-card>
        <br>
        <el-card>
            <el-descriptions title="参与者信息">
                <div v-for="(item, index) in dialogTableValue">
                    <el-descriptions-item :label='`参与者 ${index}-IP`'>{{ item.playerIp }}</el-descriptions-item>
                    <el-descriptions-item label="数据源Uuid">{{ item.dataSourceUuid }}</el-descriptions-item>
                    <!--                     <el-descriptions-item label="字段">{{ item.fieldName }}</el-descriptions-item>
 --> <el-descriptions-item label="内网计算IP">{{ item.privateComputingAddress }}</el-descriptions-item>
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
        </el-card> <br>

        <el-card>
            <template #header>
                <div class="card-header">
                    <span style="font-weight: 900;font-size: 16px;">字段对齐</span>
                </div>
                <el-table :data="tableData" border style="width: 100% ;margin-top:20px;" :span-method="mergeCells">
                    <!-- 第一列：求交字段 -->
                    <el-table-column fixed prop="label" label="" width="100">
                        <template #default="scope">
                            <span class="field-label">{{ scope.row.label }}</span>
                        </template>
                    </el-table-column>
                    <!-- 参与者列 -->
                    <el-table-column v-for="(value, index) in maxLength" width="100" :key="index"
                        :label="`参与者 ${index + 1}`">
                        <template #default="scope">
                            <span>{{ scope.row.values[index] || '-' }}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </template>
        </el-card>
    </el-dialog>
</template>


<script setup>
import { onMounted, ref, computed } from 'vue'
import axios from 'axios'
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
    taskInfoError: {
        type: String,
        default: '',
    }
})
const fieldDictArray = ref([])
const emits = defineEmits(['update:modelValue'])
console.log('dialogTableValue', props.dialogTableValue);
const handleClose = () => {
    emits('update:modelValue', false)
}
const queryFormTask = ref({
    uuid: '',
    page: 1,
    pageSize: 30
})
const playerInfoLoading = ref(false)

const extractFieldDictArray = (taskList) => {
    // 用来存储所有的字段键和值
    const fieldDictMap = new Map();

    taskList.forEach((task) => {
        try {
            // 解析 FieldDictString 为对象
            const fieldDict = JSON.parse(task.FieldDictString);

            Object.keys(fieldDict).forEach((key) => {
                if (!fieldDictMap.has(key)) {
                    // 如果 map 中没有这个 key，就初始化为数组
                    fieldDictMap.set(key, []);
                }
                // 将对应的值加入到该 key 下的数组中
                fieldDictMap.get(key).push(fieldDict[key]);
            });
        } catch (error) {
            console.error(`解析失败: ${task.FieldDictString}`, error);
        }
    });

    // 转换 map 为数组格式
    const result = Array.from(fieldDictMap, ([label, values]) => ({ label, values }));

    return result;
}
const tableData = computed(() => fieldDictArray.value);

// 获取最大参与方数量以动态渲染列数
const maxLength = computed(() => {
    return Math.max(...fieldDictArray.value.map((item) => item.values.length));
});
const handlePlayerInfo = async () => {
    playerInfoLoading.value = true
    queryFormTask.value.uuid = props.taskUuid


}
onMounted(() => {
    fieldDictArray.value = extractFieldDictArray(props.dialogTableValue)

})

</script>

<style scoped>
.break-word {
    word-break: break-all;
    /* 允许在单词内换行 */
    white-space: normal;
    /* 允许换行后的空白处理 */
}

.field-label {
    font-weight: bold;
    /* 加粗 */
    /* 设置字体颜色 */
    font-size: 14px;
    /* 调整字号 */
}
</style>