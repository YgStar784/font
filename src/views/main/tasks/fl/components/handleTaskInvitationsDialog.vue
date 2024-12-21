<template>
    <el-dialog class="fl-invi-dialog" v-loading="loadingOpen" @open="handleOpen" width="1200"
        :model-value="props.dialogVisibleAccept" @close="handleClose" top=5vh append-to-body destroy-on-close>

        <a-descriptions size="small" class="descriptions" bordered>
            <a-descriptions-item label="任务Uuid" :span="3">
                <div>{{ props.taskInfo.taskUuid }}</div>
            </a-descriptions-item>
            <a-descriptions-item label="任务ID">{{ props.taskInfo.id }}</a-descriptions-item>
            <a-descriptions-item label="任务名称" :span="2">{{ props.taskInfo.taskName }}</a-descriptions-item>


            <a-descriptions-item label="任务描述" :span="3">{{ props.taskInfo.taskDescription }}</a-descriptions-item>
            <a-descriptions-item label="任务类型">{{ props.taskInfo.taskType }}</a-descriptions-item>
            <a-descriptions-item label="创建时间">{{ props.taskInfo.createTime }}</a-descriptions-item>


            <!--             <a-descriptions-item v-if="theSameUuidTaskList[0].sourceIp" label="发起方Ip">{{
                theSameUuidTaskList[0].sourceIp }}</a-descriptions-item> -->
            <!--             <a-descriptions-item label="Status" :span="3">
                <a-badge status="processing" text="Running" />
            </a-descriptions-item> -->

        </a-descriptions>
        <div class="maniplulate-data-container">
            <hr class="layui-border-black">
            <div class="maniplulate-data">
                <h4 class="title">配置数据</h4>
                <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
                    <el-tab-pane v-for="(flTaskInfo, index) in taskList" :label='`id-${flTaskInfo.id}`' :name="index">
                        <div :disabled="flTaskInfo.state != 2">
                            <div>
                                <el-radio-group v-model="trainOReval">
                                    <el-radio-button label="Train" value="train" :disabled="flTaskInfo.role === 1" />
                                    <el-radio-button label="Eval" value="eval" />
                                </el-radio-group>
                            </div>
                            <div class="data-type">数据类型</div>
                            <a-space>
                                <a-select v-if="trainOReval === 'train'" v-model:value="trainSelectedType"
                                    style="width: 120px" :options="dataType" @focus="focus" @change="handleChange"
                                    :getPopupContainer="getDialogContainer"></a-select>
                                <a-select v-if="trainOReval === 'eval'" v-model:value="evalSelectedType"
                                    style="width: 120px" :options="dataType" @focus="focus" @change="handleChange"
                                    :getPopupContainer="getDialogContainer"></a-select>
                            </a-space>


                            <div v-if="trainOReval === 'train'" class="data-container">
                                <JsonEditorVue class="json-show my-json-editor" v-model="trainMysql"
                                    :validator="mysqlValidator" :editable="editableTrigger"
                                    :onRenderContextMenu="handleRenderContextMenu" :onChange="handleJsonChange"
                                    :mainMenuBar="false" :navigationBar="false"
                                    :class="{ disabled: trainSelectedType !== 'MySQL' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                                <JsonEditorVue class="json-show my-json-editor" v-model="trainCsv"
                                    :editable="editableTrigger" :onRenderContextMenu="handleRenderContextMenu"
                                    :onChange="handleJsonChange" theme="light" :mainMenuBar="false"
                                    :navigationBar="false" :class="{ disabled: trainSelectedType !== 'CSV' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                                <JsonEditorVue class="json-show my-json-editor" v-model="trainExcel"
                                    :editable="editableTrigger" :onRenderContextMenu="handleRenderContextMenu"
                                    :onChange="handleJsonChange" theme="light" :mainMenuBar="false"
                                    :navigationBar="false" :class="{ disabled: trainSelectedType !== 'Excel' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                                <JsonEditorVue class="json-show my-json-editor" v-model="trainImageZip"
                                    :editable="editableTrigger" :onRenderContextMenu="handleRenderContextMenu"
                                    :onChange="handleJsonChange" theme="light" :mainMenuBar="false"
                                    :navigationBar="false" :class="{ disabled: trainSelectedType !== 'ImageZip' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                            </div>

                            <div v-if="trainOReval === 'eval'" class="data-container">
                                <JsonEditorVue class="json-show my-json-editor" v-model="evalMysql"
                                    :validator="mysqlValidator" :editable="editableTrigger"
                                    :onRenderContextMenu="handleRenderContextMenu" :onChange="handleJsonChange"
                                    :mainMenuBar="false" theme="dark" :navigationBar="false"
                                    :class="{ disabled: evalSelectedType !== 'MySQL' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                                <JsonEditorVue class="json-show my-json-editor" v-model="evalCsv"
                                    :editable="editableTrigger" :onRenderContextMenu="handleRenderContextMenu"
                                    :onChange="handleJsonChange" theme="dark" :mainMenuBar="false"
                                    :navigationBar="false" :class="{ disabled: evalSelectedType !== 'CSV' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                                <JsonEditorVue class="json-show my-json-editor" v-model="evalExcel"
                                    :editable="editableTrigger" :onRenderContextMenu="handleRenderContextMenu"
                                    :onChange="handleJsonChange" theme="light" :mainMenuBar="false"
                                    :navigationBar="false" :class="{ disabled: evalSelectedType !== 'Excel' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                                <JsonEditorVue class="json-show my-json-editor" v-model="evalImageZip"
                                    :editable="editableTrigger" :onRenderContextMenu="handleRenderContextMenu"
                                    :onChange="handleJsonChange" theme="light" :mainMenuBar="false"
                                    :navigationBar="false" :class="{ disabled: evalSelectedType !== 'ImageZip' }"
                                    @selectedChange="nodeselectedChange"
                                    style="background-color: rgb(246, 248, 250); border: none;" />
                            </div>
                            <hr class="layui-border-black">
                            <h4 class="title">数据预处理</h4>
                            <div class="pre-process" v-for="(item, index) in preProcessList">
                                <a-form class="pre-process-form" layout="vertical">
                                    <a-form-item label="类型">
                                        <a-select ref="pre-process-select" v-model:value="item.name"
                                            style="width: 120px" :options="processOptions" @focus="focus"
                                            @change="handlePreProcessSelectChange(item)"
                                            :getPopupContainer="getDialogContainer"></a-select>
                                    </a-form-item>
                                    <div v-if="item.name === '标准化'" style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="mean">
                                            <a-input-number v-model:value="item.params.mean"></a-input-number>
                                        </a-form-item>
                                        <a-form-item label="std">
                                            <a-input-number v-model:value="item.params.std"></a-input-number>
                                        </a-form-item>
                                    </div>
                                    <div v-if="item.name === 'min max缩放'"
                                        style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="min">
                                            <a-input-number v-model:value="item.params.min"></a-input-number>
                                        </a-form-item>
                                        <a-form-item label="max">
                                            <a-input-number v-model:value="item.params.max"></a-input-number>
                                        </a-form-item>
                                    </div>
                                    <div v-if="item.name === 'norm缩放'"
                                        style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="norm">
                                            <a-select ref="norm-select" v-model:value="item.params.norm"
                                                style="width: 120px" :options="normOptions" @focus="focus"
                                                @change="handleNormChange"
                                                :getPopupContainer="getDialogContainer"></a-select>

                                        </a-form-item>
                                    </div>
                                    <div v-if="item.name === 'pad'" style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="mode">
                                            <a-select ref="mode-select" v-model:value="item.params.mode"
                                                style="width: 120px" :options="modeOptions" @focus="focus"
                                                @change="handleModeChange"
                                                :getPopupContainer="getDialogContainer"></a-select>

                                        </a-form-item>
                                    </div>
                                    <div v-if="item.name === '随机横向翻转'"
                                        style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="prob">
                                            <a-input-number v-model:value="item.params.prob" :min=0 :max="1"
                                                :step="0.1"></a-input-number>
                                        </a-form-item>
                                    </div>
                                    <div v-if="item.name === '随机纵向翻转'"
                                        style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="prob">
                                            <a-input-number v-model:value="item.params.prob" :min=0 :max="1"
                                                :step="0.1"></a-input-number>
                                        </a-form-item>
                                    </div>
                                    <div v-if="item.name === 'one hot编码'"
                                        style="display: flex;flex-direction: row;gap:50px;">
                                        <a-form-item label="参数分量数量">
                                            <a-input-number v-model:value="item.params.numbers"
                                                :min="2"></a-input-number>
                                        </a-form-item>
                                    </div>
                                    <a-form-item label=" ">
                                        <a-tooltip placement="top" :getPopupContainer="getDialogContainer">
                                            <template #title>
                                                <span>删除</span>
                                            </template>
                                            <a-button size="small" @click="delPreProcessItem(index)" shape="circle"
                                                danger>
                                                <template #icon>
                                                    <CloseOutlined />
                                                </template>
                                            </a-button>
                                        </a-tooltip>
                                    </a-form-item>
                                </a-form>

                            </div>


                            <div class="pre-process-add">
                                <n-float-button class="pre-process-add-but" @click="toggleAddBut" position="relative"
                                    tertiary>
                                    <n-icon size="24">
                                        <svg v-if="addButHover === false" xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 512 512">
                                            <path
                                                d="M368.5 240H272v-96.5c0-8.8-7.2-16-16-16s-16 7.2-16 16V240h-96.5c-8.8 0-16 7.2-16 16 0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7H240v96.5c0 4.4 1.8 8.4 4.7 11.3 2.9 2.9 6.9 4.7 11.3 4.7 8.8 0 16-7.2 16-16V272h96.5c8.8 0 16-7.2 16-16s-7.2-16-16-16z" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32">
                                            <path
                                                d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z"
                                                fill="currentColor" />
                                        </svg>
                                    </n-icon>
                                </n-float-button>
                                <transition name="fade-slide">
                                    <div v-if="addButHover" class="pre-process-list">
                                        <n-button-group vertical>
                                            <n-button round @click="handlePreProcessNameClick('标准化')">
                                                标准化
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('min max缩放')">
                                                min max缩放
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('norm缩放')">
                                                norm缩放
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('pad')">
                                                pad
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('中心剪切')">
                                                中心剪切
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('随机剪切')">
                                                随机剪切
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('随机旋转')">
                                                随机旋转
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('随机横向翻转')">
                                                随机横向翻转
                                            </n-button>
                                            <n-button ghost @click="handlePreProcessNameClick('随机纵向翻转')">
                                                随机纵向翻转
                                            </n-button>
                                            <n-button ghost round @click="handlePreProcessNameClick('one hot编码')">
                                                one hot编码
                                            </n-button>
                                        </n-button-group>
                                    </div>
                                </transition>
                            </div>
                            <div style="display: flex; flex-direction: row-reverse;gap: 50px;justify-self: center;">
                                <a-button type="primary" :loading="handleClickLoad"
                                    @click="onSubmit('accept')">导入</a-button>
                                <a-popconfirm v-if="waitingCount != 0" placement="bottom" title="确定拒绝吗？" trigger="click"
                                    ok-text="Yes" cancel-text="No" @confirm="onSubmit('reject')"
                                    :loading="handleClickLoad" @cancel="cancel" :getPopupContainer="getDialogContainer">
                                    <a-button type="primary" danger>
                                        拒绝
                                    </a-button>
                                </a-popconfirm>
                            </div>

                        </div>
                    </el-tab-pane>
                </el-tabs>


            </div>



        </div>


    </el-dialog>
</template>
<script setup>
import { ref, watch } from 'vue'
import { NIcon, NButton, NFloatButton, NButtonGroup } from 'naive-ui'
import axios from 'axios'
import { CloseCircleOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { ElMessage } from 'element-plus'
import SomeTools from '@/utils/someTools'
import VueJsonPretty from 'vue-json-pretty';
import JsonEditorVue from 'json-editor-vue'
import { e, log } from 'mathjs'
/* import { createAjvValidator } from 'svelte-jsoneditor' */


const addButHover = ref(false)
const loadingOpen = ref(true)
const cardState = ref({ content: '待处理', color: 'blue' })
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const preProcessList = ref([])
const handleClickLoad = ref(false)
const theSameUuidTaskList = ref([])
const theSameUuidTaskListTotal = ref(0)
const formRef = ref(null)
const read = ref(false)
const taskList = ref([])
const trainOReval = ref('train')
const editorOptions = {
    mode: "tree", // 使用 Tree 模式
    navigationBar: false, // 隐藏顶部导航栏
    mainMenuBar: false, // 隐藏主要菜单
    enableSort: false, // 禁止排序
    enableTransform: false, // 禁止转换
};
const regexInputCol = /^\/data_info\/input_cols\/[0-99]\d*$/;
const regexImageRul = /^\/data_info\/image_rules\/.+$/;
const trainMysql = ref({
    type: 1,
    data_info: {
        data_uuid: "123e4567",
        data_count: 123,
        db_ip: "192.168.1.1",
        db_port: 3306,
        db_name: "my_database",
        db_user: "username",
        db_password: "password",
        tb_name: "my_table",
        input_cols: ["feature1", "feature2"],
        output_col: "value",
        input_type: "float",
        output_type: "long",
        buffer_size: 1000,
    },
})
const activeName = ref(0)
const evalMysql = ref({
    type: 1,
    data_info: {
        data_uuid: "123e4567",
        data_count: 123,
        db_ip: "192.168.1.1",
        db_port: 3306,
        db_name: "my_database",
        db_user: "username",
        db_password: "password",
        tb_name: "my_table",
        input_cols: ["feature1", "feature2"],
        output_col: "value",
        input_type: "float",
        output_type: "long",
        buffer_size: 1000,
    },
})
/* const originalMysqlData = JSON.parse(JSON.stringify(mysql.value));
 */
const flTaskInfo = ref({})
const mysqlSchema = {
    type: "object",
    properties: {
        type: { type: "integer" },
        data_info: {
            type: "object",
            properties: {
                data_uuid: { type: "string", readOnly: true }, // 只读字段
                data_count: { type: "integer" },
                db_ip: { type: "string" },
                db_port: { type: "integer" },
                db_name: { type: "string" },
                db_user: { type: "string" },
                db_password: { type: "string" },
                tb_name: { type: "string" },
                input_cols: {
                    type: "array",
                    items: { type: "string" },
                },
                output_col: { type: "string" },
                input_type: { type: "string" },
                output_type: { type: "string" },
                buffer_size: { type: "integer" },
            },
            required: [
                "data_uuid",
                "data_count",
                "db_ip",
                "db_port",
                "db_name",
                "db_user",
                "db_password",
                "tb_name",
                "input_cols",
                "output_col",
                "input_type",
                "output_type",
                "buffer_size",
            ],
        },
    },
    required: ["type", "data_info"],
};
const nodeSelectable = (node) => {
    console.log('nodeSelectable', node);
    if (node.key === "data_uuid") {
        return false
    }
    else return true
}
/* const mysqlValidator = createAjvValidator({ mysqlSchema }); */
const trainCsv = ref({
    type: 2,
    data_info: {
        data_uuid: "123e4567",
        data_count: 123,
        file_path: "./xxx/aaa.csv",
        delimiter: ",",
        input_cols: ["feature1", "feature2"],
        output_col: "value",
        input_type: "float",
        output_type: "long",
    },
})
const evalCsv = ref({
    type: 2,
    data_info: {
        data_uuid: "123e4567",
        data_count: 123,
        file_path: "./xxx/aaa.csv",
        delimiter: ",",
        input_cols: ["feature1", "feature2"],
        output_col: "value",
        input_type: "float",
        output_type: "long",
    },
})
const trainExcel = ref({
    type: 3,
    data_info: {
        data_uuid: "123e4567",
        data_count: 123,
        file_path: "./xxx/aaa.xls",
        input_cols: ["feature1", "feature2"],
        output_col: "value",
        input_type: "float",
        output_type: "long",
    },
})
const evalExcel = ref({
    type: 3,
    data_info: {
        data_uuid: "123e4567",
        data_count: 123,
        file_path: "./xxx/aaa.xls",
        input_cols: ["feature1", "feature2"],
        output_col: "value",
        input_type: "float",
        output_type: "long",
    },
})
const trainImageZip = ref({
    type: 4,
    data_info: {
        data_uuid: "mnist",
        data_count: 1000,
        file_path: "./xxx/aaa.zip",
        image_format: "gray",
        input_type: "float",
        output_type: "long",
        image_rules: {
            zero: 0,
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
        },
    },
})
const evalImageZip = ref({
    type: 4,
    data_info: {
        data_uuid: "mnist",
        data_count: 1000,
        file_path: "./xxx/aaa.zip",
        image_format: "gray",
        input_type: "float",
        output_type: "long",
        image_rules: {
            zero: 0,
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
        },
    },
})
const evalSelectedType = ref('MySQL')
const trainSelectedType = ref('MySQL')
const dataType = ref([{ value: 'MySQL', label: 'MySQL' }
    ,
{ value: 'CSV', label: 'CSV' },
{ value: 'Excel', label: 'Excel' }
    , { value: 'ImageZip', label: 'ImageZip' },
])
const processOptions = ref([{ value: '标准化', label: '标准化' },
{ value: 'min max缩放', label: 'min max缩放' },

{ value: 'norm缩放', label: 'norm缩放' },
{ value: 'pad', label: 'pad' },
{ value: '中心剪切', label: '中心剪切' },

{ value: '随机剪切', label: '随机剪切' },
{ value: '随机旋转', label: '随机旋转' },
{ value: '随机横向翻转', label: '随机横向翻转' },
{ value: '随机纵向翻转', label: '随机纵向翻转' },
{ value: 'one hot编码', label: 'one hot编码' },
])
const normOptions = ref([{ value: 1, label: 1 }, { value: 2, label: 2 }, { value: Infinity, label: '∞' }])
const modeOptions = ref([{ value: 'constant', label: 'constant' }, { value: 'reflect', label: 'reflect' }, { value: 'edge', label: 'edge' }])
const emits = defineEmits(['update:modelValue', 'initMyJoin'])
//dataUuid =ref()
const dataUuid = ref('123e4567')
const rules = ref({
    dataPath: [{
        required: true,
        message: '路径不能为空',
        trigger: 'blur',
    }]
})

const getDialogContainer = () => document.querySelector('.fl-invi-dialog')
const nodeChange = (newVal, oldVal) => {
    console.log('newVal,oldVal', newVal, oldVal);
}
const renderNodeValue = ({ node, defaultValue }) => {
    console.log('node', { node, defaultValue });

}
const handleTabClick = (tab, event) => {
    console.log('tab, event', tab, event)
    console.log('activeName');
    trainMysql.value.data_info.data_uuid = taskList.value[activeName.value].trainDataSourceUuid
    trainCsv.value.data_info.data_uuid = taskList.value[activeName.value].trainDataSourceUuid
    trainExcel.value.data_info.data_uuid = taskList.value[activeName.value].trainDataSourceUuid
    trainImageZip.value.data_info.data_uuid = taskList.value[activeName.value].trainDataSourceUuid
    evalMysql.value.data_info.data_uuid = taskList.value[activeName.value].evalDataSourceUuid
    evalCsv.value.data_info.data_uuid = taskList.value[activeName.value].evalDataSourceUuid
    evalExcel.value.data_info.data_uuid = taskList.value[activeName.value].evalDataSourceUuid
    evalImageZip.value.data_info.data_uuid = taskList.value[activeName.value].evalDataSourceUuid

}
const handleJsonChange = (content, previousContent, changeStatus) => {
    const { contentErrors, patchResult } = changeStatus;
    console.log('patchResult', patchResult);
    if ((patchResult.redo[0].from && !regexImageRul.test(patchResult.redo[0].path)) || (patchResult.redo[0].op === 'remove' && (!regexInputCol.test(patchResult.redo[0].path) && !regexImageRul.test(patchResult.redo[0].path))) || (patchResult.redo[0].op === 'add' && (!regexInputCol.test(patchResult.redo[0].path) && !regexImageRul.test(patchResult.redo[0].path)))) {
        ElMessage({ type: 'warning', message: '无效操作' })
        console.log('regexInputCol.test(patchResult.redo[0].path)', regexInputCol.test(patchResult.redo[0].path));

        content.json = previousContent.json
        console.log(patchResult.redo[0].op);

    }


    // 禁止修改 `data_uuid` 的值
    if (
        content.json.data_info &&
        content.json.data_info.data_uuid !== previousContent.json.data_info.data_uuid
    ) {
        content.json.data_info.data_uuid = previousContent.json.data_info.data_uuid;
    }

};
const nodeselectedChange = (newVal, oldVal) => {
    console.log('Selected changed from:', oldVal, 'to:', newVal);

}
// 切换悬浮和点击状态
const toggleAddBut = () => {
    addButHover.value = !addButHover.value;
};
const handleDataUpdateMysql = (newData) => {

    trainMysql.value = newData


}
const editableTrigger = ({ path, type }) => {
    // type 可以是 'key' 或 'value'
    if (type === 'key') {
        return false; // 禁止键名的编辑
    }
    return true; // 允许值的编辑
};
const handleDataUpdateCsv = (newData) => {

    trainCsv.value = newData

}
function filterMenuItems(items) {
    // 定义我们需要保留的按钮的 text
    const allowedTexts = ["Remove", "Value"];

    // 定义递归函数来处理嵌套的 items
    const filterItems = (itemList) => {
        return itemList
            .map(item => {
                // 如果是 "row" 或 "column" 类型，递归处理其 items
                if (item.type === "row" || item.type === "column") {
                    const filteredItems = filterItems(item.items);
                    // 仅当过滤后的子项不为空时保留此行或列
                    if (filteredItems.length > 0) {
                        return { ...item, items: filteredItems };
                    }
                }

                // 如果是 "button" 类型，检查 text 是否符合
                if (item.type === "button" && allowedTexts.includes(item.text)) {
                    return item;
                }

                // 如果是 "dropdown-button"，处理主按钮和子按钮
                if (item.type === "dropdown-button") {
                    const filteredDropdownItems = filterItems(item.items);
                    if (
                        allowedTexts.includes(item.main.text) ||
                        filteredDropdownItems.length > 0
                    ) {
                        return {
                            ...item,
                            items: filteredDropdownItems,
                            main: item.main,
                        };
                    }
                }

                // 其他类型或不符合条件的内容直接过滤掉
                return null;
            })
            .filter(item => item !== null); // 去掉 null 的项
    };

    // 调用递归函数处理顶层 items
    return filterItems(items);
}

// 隐藏指定菜单项
const handleRenderContextMenu = (items, context) => {
    const path = context.selection?.path || [];

    // 使用正则表达式判断路径是否匹配 data_info.input_cols.数字
    const isInputColsPath = /^data_info\.input_cols\.[1-99]\d*$/.test(path.join('.'));
    const isImageRulesPath = /^data_info\.image_rules\..+/.test(path.join('.')); console.log('path', path);
    if (isInputColsPath || isImageRulesPath) {
        // 仅保留 `Remove` 和 `+Value` 按钮
        console.log('true');
        console.log('items', items);

        return filterMenuItems(items)
    }

    // 如果不在 input_cols 的路径下，则不显示上下文菜单
    return false;
};
const handleDataUpdateExcel = (newData) => {

    trainExcel.value = newData

}
const handleDataUpdateImageZip = (newData) => {

    trainImageZip.value = newData
}
const handlePreProcessNameClick = (name) => {
    if (name === '标准化') {
        preProcessList.value.push({ name: '标准化', params: { mean: 0, std: 1.0 } })
    }
    if (name === 'min max缩放') {
        preProcessList.value.push({ name: 'min max缩放', params: { min: 0.0, max: 1.0 } })
    }
    if (name === 'norm缩放') {
        preProcessList.value.push({ name: 'norm缩放', params: { norm: 2 } })

    }
    if (name === 'pad') {
        preProcessList.value.push({ name: 'pad', params: { mode: 'constant', data: 0 } })

    }
    if (name === '中心剪切') {
        preProcessList.value.push({ name: '中心剪切', params: {} })

    } if (name === '随机剪切') {
        preProcessList.value.push({ name: '随机剪切', params: {} })

    }
    if (name === '随机旋转') {
        preProcessList.value.push({ name: '随机旋转', params: {} })

    }
    if (name === '随机横向翻转') {
        preProcessList.value.push({ name: '随机横向翻转', params: { prob: 0.5 } })

    }
    if (name === '随机纵向翻转') {
        preProcessList.value.push({ name: '随机纵向翻转', params: { prob: 0.5 } })
    }
    if (name === 'one hot编码') {
        preProcessList.value.push({ name: 'one hot编码', params: { numbers: 10 } })

    }
    addButHover.value = false
}
const handlePreProcessSelectChange = (item) => {
    console.log('item', item);
    if (item.name === '标准化') {
        item.params = { mean: 0, std: 1.0 }; // 初始化标准化的参数
    } else if (item.name === 'min max缩放') {
        item.params = { min: 0.0, max: 1.0 }; // 初始化 min-max 缩放的参数
    } else if (item.name === 'norm缩放') {
        item.params = { norm: 2 }; // 初始化 norm 缩放的参数
    } else if (item.name === 'pad') {
        item.params = { mode: 'constant', data: 0 }; // 初始化 pad 的参数
    } else if (item.name === '中心剪切') {
        item.params = {}; // 中心剪切不需要额外参数
    } else if (item.name === '随机剪切') {
        item.params = {}; // 随机剪切不需要额外参数
    } else if (item.name === '随机旋转') {
        item.params = {}; // 随机旋转不需要额外参数
    } else if (item.name === '随机横向翻转') {
        item.params = { prob: 0.5 }; // 初始化随机横向翻转的参数
    } else if (item.name === '随机纵向翻转') {
        item.params = { prob: 0.5 }; // 初始化随机纵向翻转的参数
    } else if (item.name === 'one hot编码') {
        item.params = { numbers: 10 }; // 初始化 one hot 编码的参数
    } else {
        item.params = {}; // 如果没有匹配的name，清空参数
    }
};
const delPreProcessItem = (index) => {
    preProcessList.value.splice(index, 1)
}
const handleOpen = async () => {

    loadingOpen.value = true
    try {
        const response = await axios.post('/api/FL/getMyTaskInvitationsDetailByUuid', {
            uuid: props.taskInfo.taskUuid,
            page: 1,
            pageSize: 30
        }, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });

        if (response.data.code === 1000) {
            taskList.value = response.data.data.taskList;
            theSameUuidTaskListTotal.value = response.data.data.total;
            flTaskInfo.value = taskList.value[0]
            trainMysql.value.data_info.data_uuid = flTaskInfo.value.trainDataSourceUuid
            trainCsv.value.data_info.data_uuid = flTaskInfo.value.trainDataSourceUuid
            trainExcel.value.data_info.data_uuid = flTaskInfo.value.trainDataSourceUuid
            trainImageZip.value.data_info.data_uuid = flTaskInfo.value.trainDataSourceUuid
            if (flTaskInfo.value.role === 2) {
                evalMysql.value.data_info.data_uuid = flTaskInfo.value.evalDataSourceUuid
                evalCsv.value.data_info.data_uuid = flTaskInfo.value.evalDataSourceUuid
                evalExcel.value.data_info.data_uuid = flTaskInfo.value.evalDataSourceUuid
                evalImageZip.value.data_info.data_uuid = flTaskInfo.value.evalDataSourceUuid
                if (flTaskInfo.value.evalDataSourceType === 1) {
                    evalSelectedType.value = 'MySQL'
                }
                if (flTaskInfo.value.evalDataSourceType === 2) {
                    evalSelectedType.value = 'CSV'
                }
                if (flTaskInfo.value.evalDataSourceType === 3) {
                    evalSelectedType.value = 'Excel'
                }
                if (flTaskInfo.value.evalDataSourceType === 4) {
                    evalSelectedType.value = 'ImageZip'
                }
            }
            if (flTaskInfo.value.trainDataSourceType === 1) {
                trainSelectedType.value = 'MySQL'
            } if (flTaskInfo.value.trainDataSourceType === 2) {
                trainSelectedType.value = 'CSV'
            } if (flTaskInfo.value.trainDataSourceType === 3) {
                trainSelectedType.value = 'Excel'
            } if (flTaskInfo.value.trainDataSourceType === 4) {
                trainSelectedType.value = 'ImageZip'
            }

        } else {
            ElMessage({ type: 'error', message: response.data.message });
        }
    } catch (error) {
        ElMessage({ type: 'error', message: '请求失败，请重试' });

    } finally {
        loadingOpen.value = false; // 关闭加载状态

    }
};

const handleClose = () => {
    emits('update:modelValue', false)
}
const getPopupContainer = trigger => {
    return trigger.parentElement;
};
const onSubmit = async (flag) => {
    handleClickLoad.value = true
    form.value.dataSourceUuid = SomeTools.guid()
    form.value.id = props.taskInfo.id
    formRef.value.validate(async (valid) => {
        if (valid) {

            const trainValue = ref({})
            const evalValue = ref({})
            if (trainSelectedType.value === 'MySQL') {
                trainValue.value = {
                    trainDataSourceUuid: trainMysql.value.data_info.data_uuid,
                    trainDataSourceType: 1,
                    trainDataCount: trainMysql.value.data_info.data_count,
                    trainInputCols: trainMysql.value.data_info.input_cols,
                    trainOutputCol: trainMysql.value.data_info.output_col,
                    trainInputType: trainMysql.value.data_info.input_type,
                    trainOutputType: trainMysql.value.data_info.output_type,
                    trainDbIp: trainMysql.value.data_info.db_ip,
                    trainDbPort: trainMysql.value.data_info.db_port,
                    trainDbName: trainMysql.value.data_info.db_name,
                    trainDbUser: trainMysql.value.data_info.db_user,
                    trainDbPassword: trainMysql.value.data_info.db_password,
                    trainTbName: trainMysql.value.data_info.tb_name,
                    trainTbName: trainMysql.value.tb_name,
                    trainBufferSize: trainMysql.value.buffer_size,
                }
            } else if (trainSelectedType.value === 'CSV') {
                trainValue.value = {
                    trainDataSourceUuid: trainCsv.value.data_info.data_uuid,
                    trainDataSourceType: 2,
                    trainDataCount: trainCsv.value.data_info.data_count,
                    trainFilePath: trainCsv.value.data_info.file_path,
                    trainDelimiter: trainCsv.value.data_info.delimiter,
                    trainInputCols: trainCsv.value.data_info.input_cols,
                    trainOutputCol: trainCsv.value.data_info.output_col,
                    trainInputType: trainCsv.value.data_info.input_type,
                    trainOutputType: trainCsv.value.data_info.output_type,
                }
            } else if (trainSelectedType.value === 'Excel') {
                trainValue.value = {
                    trainDataSourceUuid: trainExcel.value.data_info.data_uuid,
                    trainDataSourceType: 3,
                    trainDataCount: trainExcel.value.data_info.data_count,
                    trainFilePath: trainExcel.value.data_info.file_path,
                    trainInputCols: trainExcel.value.data_info.input_cols,
                    trainOutputCol: trainExcel.value.data_info.output_col,
                    trainInputType: trainExcel.value.data_info.input_type,
                    trainOutputType: trainExcel.value.data_info.output_type,
                }
            } else if (trainSelectedType.value === 'ImageZip') {
                trainValue.value = {
                    trainDataSourceUuid: trainImageZip.value.data_info.data_uuid,
                    trainDataSourceType: 4,
                    trainDataCount: trainImageZip.value.data_info.data_count,
                    trainFilePath: trainImageZip.value.data_info.file_path,
                    trainImageFormat: trainImageZip.value.data_info.image_format,
                    trainInputType: trainImageZip.value.data_info.input_type,
                    trainOutputType: trainImageZip.value.data_info.output_type,
                    trainImageRules: trainImageZip.value.data_info.image_rules,
                }
            }
            if (flTaskInfo.value.role === 2) {
                if (evalSelectedType.value === 'MySQL') {
                    evalValue.value = {
                        evalDataSourceUuid: evalMysql.value.data_info.data_uuid,
                        evalDataSourceType: 1,
                        evalDataCount: evalMysql.value.data_info.data_count,
                        evalInputCols: evalMysql.value.data_info.input_cols,
                        evalOutputCol: evalMysql.value.data_info.output_col,
                        evalInputType: evalMysql.value.data_info.input_type,
                        evalOutputType: evalMysql.value.data_info.output_type,
                        evalDbIp: evalMysql.value.data_info.db_ip,
                        evalDbPort: evalMysql.value.data_info.db_port,
                        evalDbName: evalMysql.value.data_info.db_name,
                        evalDbUser: evalMysql.value.data_info.db_user,
                        evalDbPassword: evalMysql.value.data_info.db_password,
                        evalTbName: evalMysql.value.data_info.tb_name,
                        evalTbName: evalMysql.value.tb_name,
                        evalBufferSize: evalMysql.value.buffer_size,
                    }
                } else if (evalSelectedType.value === 'CSV') {
                    evalValue.value = {
                        evalDataSourceUuid: evalCsv.value.data_info.data_uuid,
                        evalDataSourceType: 2,
                        evalDataCount: evalCsv.value.data_info.data_count,
                        evalFilePath: evalCsv.value.data_info.file_path,
                        evalDelimiter: evalCsv.value.data_info.delimiter,
                        evalInputCols: evalCsv.value.data_info.input_cols,
                        evalOutputCol: evalCsv.value.data_info.output_col,
                        evalInputType: evalCsv.value.data_info.input_type,
                        evalOutputType: evalCsv.value.data_info.output_type,
                    }
                } else if (evalSelectedType.value === 'Excel') {
                    evalValue.value = {
                        evalDataSourceUuid: evalExcel.value.data_info.data_uuid,
                        evalDataSourceType: 3,
                        evalDataCount: evalExcel.value.data_info.data_count,
                        evalFilePath: evalExcel.value.data_info.file_path,
                        evalInputCols: evalExcel.value.data_info.input_cols,
                        evalOutputCol: evalExcel.value.data_info.output_col,
                        evalInputType: evalExcel.value.data_info.input_type,
                        evalOutputType: evalExcel.value.data_info.output_type,
                    }
                } else if (evalSelectedType.value === 'ImageZip') {
                    evalValue.value = {
                        evalDataSourceUuid: evalImageZip.value.data_info.data_uuid,
                        evalDataSourceType: 4,
                        evalDataCount: evalImageZip.value.data_info.data_count,
                        evalFilePath: evalImageZip.value.data_info.file_path,
                        evalImageFormat: evalImageZip.value.data_info.image_format,
                        evalInputType: evalImageZip.value.data_info.input_type,
                        evalOutputType: evalImageZip.value.data_info.output_type,
                        evalImageRules: evalImageZip.value.data_info.image_rules,
                    }
                }
            }

            if (flag === 'accept') {
                if (flTaskInfo.value.role === 1) {
                    sendForm.value = {
                        id: flTaskInfo.value.id,
                        state: 0,
                        trainValue
                    }
                }
                if (flTaskInfo.value.role === 2) {
                    sendForm.value = {
                        id: flTaskInfo.value.id,
                        state: 0,
                        trainValue,
                        evalValue
                    }
                }
            }
            else if (flag === 'reject') {
                sendForm.value = {
                    id: flTaskInfo.value.id,
                    state: 1,
                }
            }
            await axios.post('/api/FL/handleTaskInvitations', sendForm.value
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),
                    }
                }).then(res => {
                    if (res.data.code === 1000) {
                        ElMessage({
                            type: 'success',
                            message: flag
                        })
                        formRef.value.resetFields()
                        emits('initMyJoin')
                        handleClose()
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
        else {
            ElMessage({ type: 'error', message: '繁忙，请稍后再试' })
        }
    })
    handleClickLoad.value = false
}
watch(trainMysql, () => {
    console.log('trainMysql', trainMysql.value);
})
</script>
<style scoped>
.fieldict-container {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    gap: 30px;
    justify-content: flex-start;
    align-items: center;
    height: 80px;

}

.fieldict {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: center;
    justify-self: start;
    gap: 5px;

}

.json-show.disabled {
    pointer-events: none;
    /* 禁用点击 */
    opacity: 0.5;
    /* 设置灰度效果 */
    filter: grayscale(100%);
}

.data-container {
    box-sizing: border-box;
    padding: 8px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 10px;
}

.fieldict-input {
    width: 55px;
    text-align: center;
}

.data-type-select {
    z-index: 10;
}

.fieldict-tag {
    margin: 0;
    width: 55px;
    text-align: center;
}

.descriptions {
    margin-bottom: 30px;
}

:deep(.my-label) {
    background: var(--el-color-success-light-9) !important;
}

:deep(.my-content) {
    background: var(--el-color-danger-light-9);
}

.demo-tabs {
    padding-left: 16px;
    padding-right: 16px;
    overflow: visible;
}
</style>

<style lang="scss">
.demo-tabs>.el-tabs__content {
    overflow: visible;
}

.ant-input-number .ant-input-number-input {
    text-align: center;
}

.jse-tip {
    display: none !important;
}

/* 隐藏菜单按钮 */
.svelte-jsoneditor .jse-contextmenu,
.svelte-jsoneditor .jse-context-menu-button {
    display: none !important;
}

.title {
    font-family: 'Arial';
    font-size: 16px;
    box-sizing: border-box;
    padding: 5px;
    color: black;
    font-weight: 900;
    padding-bottom: 10px;
}

.data-type {
    font-family: 'Arial';
    color: rgb(60, 60, 60);
    box-sizing: border-box;
    padding: 5px;
}

.json-show {

    --jse-theme-color: #F6F8FA;

    background-color: rgb(246, 248, 250);
    border: none !important;
    /* Remove any border */

}

.my-json-editor {
    /* define a custom theme color */

    background-color: rgb(246, 248, 250);

    --jse-theme-color: rgb(246, 248, 250);
    --jse-theme-color-highlight: #687177;

    border: none;
}

.pre-process {
    width: 100%;
    box-sizing: border-box;
    padding-left: 8px;
}

.pre-process-form {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 50px;
}

.pre-process-add {
    position: relative;
    padding-left: 8px;
}

.pre-process-add-but {
    position: relative;
    color: black;

}

.pre-process-list {
    font-style: normal;
    position: absolute;
    top: 50%;
    /* 相对于父容器垂直居中 */
    left: 45px;
    /* 位于 "+" 按钮的右侧 */
    transform: translateY(-50%);
    /* 修正垂直居中位置 */
    display: flex;
    /* 默认隐藏 */
    flex-direction: column;
    width: 120px;
    z-index: 100;
    /* 防止被其他内容遮挡 */
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 8px;
}

/* 从右到左 + 淡入淡出效果 */
.fade-slide-enter-active,
.fade-slide-leave-active {
    transition: all 0.5s ease;
}

.fade-slide-enter {
    opacity: 0;
    transform: translateX(100%);
    /* 从右侧滑入 */
}

.fade-slide-leave-to {
    opacity: 0;
    transform: translateX(-100%);
    /* 向左侧滑出 */
}

.fade-slide-enter-from,
.fade-slide-leave-to {
    opacity: 0;
    transform: translateY(-10%);
}
</style>