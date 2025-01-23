<template>

    <el-dialog class="psi-start-dialog" :style="{ padding: '0' }" width="1000" @open="handleOpen"
        :model-value="props.dialogVisibleStartTask" :show-close="false" @close="handleClose" append-to-body
        destroy-on-close>
        <el-card :style="{ marginTop: '10px' }">
            <el-table :data="taskPlayerList" table-layout="auto">
                <el-table-column prop="playerIp" label="playerIp" />
                <el-table-column prop="dataSourceUuid" label="dataSourceUuid" />
                <el-table-column prop="fields" label="fieldName">
                    <template #default="{ row, $index }">
                        <VueDraggable class="draagable" v-model="row.fieldsInfo" animation="150" ghostClass="ghost"
                            :group="{
                                name: 'fields-' + $index,
                                pull: true,
                                put: isCanReturn(row.dataSourceUuid) ? true : false,
                            }" @update="onUpdate" @start="onDragStart" @remove="remove">
                            <div v-for="(fieldInfo, index) in row.fieldsInfo" :key="index" class="draggble-item">
                                <a-tag class="draggable-tag" :color="fieldInfo.color" size="large">
                                    {{ fieldInfo.field }}
                                </a-tag>
                            </div>
                        </VueDraggable>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <n-card :style="{ marginTop: '10px' }" hoverable>
            <template #title>

            </template>
            <!-- 新增的 selected-areas 区域 -->
            <div v-for="(area, index) in selectedAreas" :key="index" class="selected-area">
                <FloatLabel variant="in">
                    <InputText id="in_label" class="stand-input" v-model="area.standField" variant="filled" />
                    <label for="in_label">标准字段</label>
                </FloatLabel>
                <VueDraggable @start="onDragStart" class="draagable selected-draagable" v-model="area.fields"
                    animation="150" :group="{
                        name: 'shared',
                        pull: true,
                        put: isExited(index) ? true : false,
                    }" ghostClass="ghost">
                    <div class="selected-tag-container">
                        <a-tooltip class="selected-tag" v-for="(field, fieldIndex) in area.fields"
                            :get-popup-container="getPopupContainer" :key='`${index}-${fieldIndex}`'
                            :title="field.dataSourceUuid" :color="field.color">

                            <a-tag class="draggable-tag selected-item" :key='`${index}-${fieldIndex}`'
                                :color="field.color" @close="handleTagClose(index, fieldIndex)"
                                :disable-transitions="false" closable>



                                {{ field.field }}


                            </a-tag>
                        </a-tooltip>
                    </div>
                    <!-- 条件渲染：如果 items 为空，显示占位文本 -->
                    <div v-if="area.fields.length === 0" class="placeholder">
                        请将 fieldName 拖拽至此
                    </div>
                </VueDraggable>

                <!-- 仅显示最后一个区域的 “+” 按钮 -->
                <div :class="{ hidden: index !== selectedAreas.length - 1 }" class="add-but" @click="addSelectedArea">
                    <el-button ref="InputRef" type="primary" round>
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </el-button>
                </div>
            </div>
            <template #footer>
                <div class="footer-but">

                    <n-button type="info" @click="submitDialogVisiable = true">
                        确定
                    </n-button>

                    <a-popconfirm placement="bottom" title="确定关闭吗？" trigger="click" ok-text="Yes" cancel-text="No"
                        @confirm="confirm" @cancel="cancel" :getPopupContainer="getDialogContainer">
                        <n-button quaternary>
                            取消
                        </n-button>
                    </a-popconfirm>
                </div>
            </template>

            <el-dialog v-model="submitDialogVisiable" class="submit-info-psi-dialog" :style="{ padding: '0' }"
                width="auto" @open="handleSubOpen" :show-close="false" @close="submitDialogVisiable = false"
                append-to-body>

                <el-card :style="{ marginTop: '10px' }">

                    <div class="json-columns">
                        <!-- 循环 selectedAreas 数组，每个元素作为一列显示 -->
                        <div v-for="(area, index) in selectedAreas" :key="index" class="json-column">
                            <vue-json-pretty :data="area" :showLineNumbers="true" theme="monokai" />
                        </div>
                    </div>

                    <template #footer>
                        <div class="footer-but">
                            <a-button type="primary" @click="onSubmit" :loading="loadingSub">提交</a-button>


                            <!--                             <a-popconfirm placement="bottom" title="确定取消吗？" trigger="click" ok-text="Yes"
                                cancel-text="No" @confirm="subConfirm" @cancel="cancel"
                                :getPopupContainer="getSubDialogContainer"> -->
                            <n-button @click="subConfirm" quaternary>
                                取消
                            </n-button>
                            <!--                             </a-popconfirm> -->
                        </div>
                    </template>
                </el-card>
            </el-dialog>
        </n-card>

    </el-dialog>

</template>

<script setup>
import { ref, nextTick } from 'vue'
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel'
import { Button, message, Popconfirm } from 'ant-design-vue'
import { useDialog, useMessage, NTooltip } from "naive-ui";
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import axios from 'axios'
import { NCard, NButton } from 'naive-ui'
import { VueDraggable } from 'vue-draggable-plus'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

import { row } from 'mathjs'
const router = useRouter()
const loadingSub = ref(false);
const loadingSubIcon = ref(false);
const jsonData = ref(null)
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    },
    dialogVisibleStartTask: {
        type: Boolean,
        required: true
    }
})
const sendForm = ref({
    taskUuid: '',
    fields: [],
})
const submitDialogVisiable = ref(false)
const queryFormPlayer = ref({
    uuid: '',
    page: 1,
    pageSize: 10
})
const colors = ["pink", "red", 'orange', 'green', 'cyan', 'blue', 'purple', '#f50', '#2db7f5', '#87d068', '#108ee9'] // 定义一些可能的颜色
// 定义列配置
const columns = ref([
    {
        title: '标准字段',
        key: 'standField',
        width: 150
    },
    {
        title: '所选字段',
        key: 'fields',
        width: 300,
        render(row) {
            return row.fields
                .map(
                    field =>
                        `字段: ${field.field}, IP: ${field.playerIp}, UUID: ${field.dataSourceUuid}`
                )
                .join(' | ')
        }
    }
])

const pagination = ref({ pageSize: 5 })
const draggingValue = ref(null)

const taskPlayerList = ref([])
const selectedFields = ref([])
const inputValue = ref('')

const inputVisible = ref(false)
const Nmessage = useMessage({ teleport: '.psi-start-dialog' }
);
const Ndialog = useDialog({ teleport: '.psi-start-dialog' })
const emits = defineEmits(['update:modelValue', 'initMyJoin'])
const selectedAreas = ref([{ standField: '', fields: [] }]) // 初始化一个 selected-area


const handleClose = () => {
    emits('update:modelValue', false)
    selectedAreas.value = [{ standField: '', fields: [] }]
}





const handleOpen = async () => {
    await handleBegin()
}
const isCanReturn = (dataSourceUuid) => {

    // 检查 draggingValue.value 是否存在
    if (draggingValue.value && draggingValue.value.dataSourceUuid) {
        return draggingValue.value.dataSourceUuid === dataSourceUuid;
    }
    return false; // 如果 draggingValue.value 不存在，返回 false
}
const isExited = (index) => {
    const reslut = selectedAreas.value[index].fields.find(field => field.dataSourceUuid === draggingValue.value.dataSourceUuid)

    return reslut === undefined ? true : false;
}
const confirm = e => {
    console.log(e);
    handleClose()
};
const handleSubOpen = () => {
    jsonData.value = addSelectedArea.value
}

const subConfirm = e => {
    submitDialogVisiable.value = false
}
const cancel = e => {
    console.log(e);
};
const handleBegin = async () => {
    queryFormPlayer.value.uuid = props.taskInfo.taskUuid
    await axios.post('/api/PSI/getMyTaskPlayers', queryFormPlayer.value, {
        headers: { Authorization: localStorage.getItem('token') }
    }).then(res => {
        if (res.data.code === 1000) {
            taskPlayerList.value = res.data.data.taskList
            taskPlayerList.value.forEach(row => {
                row.fieldsInfo = []
                row.fields = row.fieldName.split(',') // 确保 fields 是数组
                assignRandomColor(row) // 分配随机颜色
                row.fields.forEach(field => {
                    row.fieldsInfo.push({ color: row.color, dataSourceUuid: row.dataSourceUuid, playerIp: row.playerIp, field: field })
                })



            })
        } else if (res.data.code === 1006) {
            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
            handleClose()

            setTimeout(() => {
                router.push({ path: '/login' }); // 确保路径和名称正确
            }, 500); // 避免动画加载导致页面阻塞
            return
        } else {
            ElMessage({ type: 'error', message: res.data.message })
        }
    })
}

const getDialogContainer = () => document.querySelector('.psi-start-dialog')
const getSubDialogContainer = () => document.querySelector('.submit-info-psi-dialog')

// 检查是否允许将该字段拖拽到 selected-area
const isAllowedToPut = (area) => {
    return (draggedField) => {
        // 如果 selected-area 中已经存在相同 dataSourceUuid，返回 false 禁止拖拽
        return !area.fields.some(field => field.dataSourceUuid === draggedField.dataSourceUuid)
    }
}
//随机分配颜色
const assignRandomColor = (row) => {

    row.color = colors[Math.floor(Math.random() * colors.length)]

}

//获取拖拽时的元素值

const onDragStart = (event) => {
    console.log(event);
    draggingValue.value = event.clonedData
}

// 处理拖拽到 selected-area 的事件
const onAddToSelectedArea = (row, index) => {
    return (event) => {
        const draggedItem = row.fieldsInfo[event.oldIndex]

        // 禁止相同 dataSourceUuid 的字段再拖拽到任何 selected-area
        selectedAreas.value.forEach(area => {
            if (area.fields.some(field => field.dataSourceUuid === draggedItem.dataSourceUuid)) {
                row.fieldsInfo.splice(event.newIndex, 1) // 移除已拖拽项
            }
        })
    }
}

const handleTagClose = async (index, fieldIndex) => {
    // 从 selectedAreas 中移除元素
    const deleteItem = selectedAreas.value[index].fields[fieldIndex]
    console.log('deleteItem', deleteItem);
    selectedAreas.value[index].fields.splice(fieldIndex, 1)
    // 根据 dataSourceUuid 找到对应的 taskPlayerList 行并恢复元素
    const targetRow = taskPlayerList.value.find(row => row.dataSourceUuid === deleteItem.dataSourceUuid)
    if (targetRow) {
        targetRow.fieldsInfo.push(deleteItem) // 将元素添加回 fieldsInfo
    }
    await nextTick()
}

// 新增 selected-area 函数
const addSelectedArea = () => {
    selectedAreas.value.push({ standField: '', fields: [] }) // 新增一个空的 selected-area
}
const getPopupContainer = trigger => {
    return trigger.parentElement;
};
const onSubmit = async () => {
    loadingSub.value = true

    sendForm.value.taskUuid = props.taskInfo.taskUuid
    selectedAreas.value.forEach(area => {
        sendForm.value.fields.push(area.standField)
    })
    console.log(sendForm.value);
    await axios.post('/api/PSI/startTask', sendForm.value, {
        headers: { Authorization: localStorage.getItem('token') }
    }).then(res => {
        if (res.data.code === 1000) {

            Nmessage.success('提交成功')
            submitDialogVisiable.value = false
            handleClose()

        } else if (res.data.code === 1006) {
            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
            handleClose()

            setTimeout(() => {
                router.push({ path: '/login' }); // 确保路径和名称正确
            }, 500); // 避免动画加载导致页面阻塞
            return
        }
        else {
            ElMessage({ type: 'error', message: res.data.message })
        }
    })
    loadingSub.value = false

}




</script>

<style scoped>
.draggable-item {

    cursor: move;

}

.drop-zone {
    margin-top: 20px;
    padding: 10px;
    border: 2px dashed #ccc;
    min-height: 50px;
}

.draagable {

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
}

.draggable-tag {
    height: 100%;
    cursor: move;
    text-align: center;


}


.selected-item {
    display: inline-block;
}

.footer-but {
    display: flex;
    flex-direction: row-reverse;
    gap: 16px;
}

.tag-input {
    width: 30px;

}

.stand-input {
    border: none;
    border-bottom: 1px solid black;
    height: 100%;

}


.selected-area {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;

    height: 50px;

    padding: 5px;
    box-sizing: border-box;
    gap: 10px;
    margin-bottom: 5px;
}

.selected-draagable {
    background-color: rgb(235.9, 245.3, 255);
    width: 100%;
    border-bottom: 1px solid #409EFF;
    overflow-x: auto;
}

.json-columns {
    display: flex;
    gap: 20px;
    /* 设置列之间的间距 */
}

.placeholder {
    color: #888;
    font-size: 16px;
}

.json-column {
    flex: 1;
}

.add-but {
    width: 50px;
    margin-top: 10px;

}

.hidden {
    visibility: hidden;
    /* 保留宽度但隐藏内容 */
}

.selected-tag {

    height: 80%;


    /* 调整标签的内边距，以容纳关闭按钮 */


}

.selected-tag .anticon-close {
    position: absolute;
    top: -4px;
    /* 根据需要调整位置 */
    right: -4px;
    /* 根据需要调整位置 */
    font-size: 12px;
    /* 调整关闭按钮的大小 */
}

.vertical-table .n-data-table {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.vertical-table .n-data-table-table-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.vertical-table .n-data-table-row {
    display: flex;
    flex-direction: column;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fafafa;
}

.field-item {
    margin-bottom: 8px;
    padding: 4px;
    border-bottom: 1px solid #ddd;
}
</style>

<style lang="scss">
.psi-start-dialog,
.submit-info-psi-dialog {
    .el-dialog__header {
        margin: 0;
        padding: 0;
    }
}
</style>