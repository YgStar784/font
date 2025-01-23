<template>

    <el-dialog class="dialog" v-loading="dialogLoading" :model-value="dialogVisible" width="auto" @close="handleClose"
        @opened="onDialogOpened" top=3vh append-to-body>
        <!-- 功能按钮栏，仅当选中组件时显示 -->
        <div class="toolbar">
            <div class="left-buttons">
                <el-button
                    :disabled="!selectedComponent || (selectedComponent.type != 'users' && selectedComponent.type != 'function')"
                    type="primary" @click="connectComponent">连接</el-button>
                <el-button :disabled="!selectedComponent" type="danger" @click="deleteComponent">删除</el-button>
                <el-button :disabled="!selectedComponent" type="warning" @click="moveToTop">置顶</el-button>
            </div>
            <div class="selectedComponet">
                <transition name="fade" mode="out-in">
                    <div class="selectedComponent-user" v-if="selectedComponent && selectedComponent.type === 'users'"
                        :key="selectedComponent.value.username">
                        <el-button type="primary" link><el-text class="mx-1" type="primary"
                                size="large">USER</el-text></el-button>
                        <el-button type="primary" size="medium" text bg>{{ selectedComponent.value.username
                            }}</el-button>
                        <el-button type="primary" size="medium" text bg>{{ selectedComponent.value.nodeIp }}</el-button>
                    </div>
                </transition>

                <transition name="fade" mode="out-in">
                    <div class="selectedComponent-operators"
                        v-if="selectedComponent && selectedComponent.type === 'operators'"
                        :key="selectedComponent.value">
                        <el-button type="danger" link><span>OPERATORS</span></el-button>
                        <el-button type="danger" text bg>{{ selectedComponent.value }}</el-button>
                    </div>
                </transition>

                <transition name="fade" mode="out-in">
                    <div class="selectedComponent-conn" v-if="selectedComponent && selectedComponent.type === 'conn'"
                        :key="selectedComponent.value.source.value.username">
                        <el-button type="success" link><span>CONNECTION</span></el-button>
                        <el-button text bg>{{ selectedComponent.value.source.value.username }}</el-button>
                        <el-button type="primary" size="large" link>
                            <svg width="100" height="50">
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5"
                                        orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                                    </marker>
                                </defs>
                                <line x1="10" y1="25" x2="90" y2="25" stroke="black" stroke-width="2"
                                    marker-end="url(#arrowhead)" />
                                <text x="50" y="20" font-size="16" text-anchor="middle" fill="red">{{
                                    selectedComponent.value.circleContent }}</text>
                            </svg>
                        </el-button>
                        <el-button text bg>{{ selectedComponent.value.target.value.username }}</el-button>
                    </div>
                </transition>
                <transition name="fade" mode="out-in">
                    <div class="selectedComponent-func"
                        v-if="selectedComponent && selectedComponent.type === 'function'">
                        <el-button type="warning" link><span>Function</span></el-button>
                        <el-button text bg>{{ selectedComponent.value }}</el-button>
                    </div>
                </transition>
            </div>
            <div class="right-buttons">

                <el-button color="#626aef" @click="handleConfirm">发起</el-button>
                <el-button type="success" @click="confirmSaveCanvas">保存</el-button>
                <el-button type="info" @click="showPreview">预览</el-button>
            </div>

        </div>
        <div class="app">

            <!-- 左侧侧边栏 -->
            <div class="sidebar left">
                <!-- 运算符栏 -->
                <div class="sidebar-section operators-section">
                    <div class="sidebar-title">运算符</div>
                    <div class="operator-list">
                        <div v-for="(operator, index) in operators" :key="index" class="operator-item" draggable="true"
                            @dragstart="onDragStart(operator)">
                            {{ operator }}
                        </div>
                    </div>
                </div>

                <!-- 公式模版栏 -->
                <div class="sidebar-section templates-section">
                    <div class="sidebar-title">模版</div>
                    <div class="template-list">
                        <div v-for="(template, index) in formulaTemplates" :key="index" class="template-item"
                            draggable="true" @dragstart="onDragStartTemplate(template)">
                            {{ template.content }}
                        </div>
                    </div>
                    <div class="add-template"
                        style="display: flex;flex-direction: row;flex-direction: row-reverse;align-items: center;">
                        <n-button class="add-template-but" strong secondary type="warning" plain
                            @click="showAddTemplate" circle>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                                <g fill="none">
                                    <path
                                        d="M8.5 2.75a.75.75 0 0 0-1.5 0V7H2.75a.75.75 0 0 0 0 1.5H7v4.25a.75.75 0 0 0 1.5 0V8.5h4.25a.75.75 0 0 0 0-1.5H8.5V2.75z"
                                        fill="currentColor">
                                    </path>
                                </g>
                            </svg>
                        </n-button>
                    </div>
                    <AddFormulaTemplate v-model="dialogAddFormulaTemplateVisible" :formula="formula"
                        @update:formula="handleFormulaUpdate">
                    </AddFormulaTemplate>
                </div>
                <!-- 组件信息栏 -->
                <div class="sidebar-section components-section">
                    <div class="sidebar-title">公式</div>
                    <div class="component-list">
                        <div v-for="(formula, index) in groupedConnections" :key="index" class="formula-item">
                            {{ formula }}
                        </div>
                    </div>
                </div>

            </div>
            <div class="canvas-area">
                <!-- 画布区域 -->
                <div ref="canvasDiv" class="canvas-container">
                    <canvas ref="canvasRef" class="canvas" @drop="onDrop" @click="onCanvasClick"
                        @contextmenu.prevent="onRightClick" @dragover.prevent @mousedown="onMouseDown"
                        @mousemove="onMouseMove" @mouseup="onMouseUp" :class="{ 'connecting': isConnecting }"></canvas>

                    <!-- 自定义右键菜单 -->
                    <div v-if="showContextMenu" class="context-menu"
                        :style="{ top: `${contextMenuY}px`, left: `${contextMenuX}px` }">
                        <el-button style="margin: 0;display: block;" @click="deleteComponent">删除</el-button>
                        <el-button style="margin: 0;display: block;" @click="moveToTop">置顶</el-button>
                    </div>
                </div>

            </div>

            <!-- 遍历组件数组生成可拖拽的组件 -->
            <div class="sidebar right">
                <div class="sidebar-title">用户列表</div>
                <div class="user-container">
                    <div v-for="(component, index) in currentUsersList" :key="index" class="user-item" draggable="true"
                        @dragstart="onDragStart(component)">
                        {{ component.username }}
                        {{ component.nodeIp }}:{{ component.nodePort }}

                    </div>
                </div>
                <div class="search-user">
                    <a-pagination v-model:current="queryFormUsers.page" v-model:page-size="queryFormUsers.pageSize"
                        @change="handlePageChange" simple :total="totalUser" />

                    <a-input-search v-model:value="searchUserName" placeholder="输入用户名" @search="SearchUser" />
                </div>
            </div>

        </div>
        <!-- 将预览对话框移到外部 -->
        <el-dialog v-model="isPreviewVisible" title="Preview" width="80%">
            <img :src="previewImage" alt="Preview" style="max-width: 100%; height: auto;">
        </el-dialog>
        <el-dialog title="填写任务信息" v-model="taskInfoDialogVisible" width="600px">
            <el-form :model="taskInfoForm" label-width="100px">
                <el-form-item label="任务名称" required>
                    <el-input v-model="taskInfoForm.taskName" placeholder="请输入任务名称"></el-input>
                </el-form-item>
                <!-- 添加任务描述字段 -->
                <el-form-item label="任务描述">
                    <el-input type="textarea" v-model="taskInfoForm.taskDescription" placeholder="请输入任务描述"
                        rows="3"></el-input>
                </el-form-item>
                <!--                 <el-form-item label="任务类型" required>
                    <el-radio-group v-model="taskInfoForm.taskType">
                        <el-radio label="carbon">碳账户计算</el-radio>
                        <el-radio label="formula" checked>公式计算</el-radio>
                    </el-radio-group>
                </el-form-item> -->

                <!-- 添加提示信息 -->
                <!--                 <el-alert v-if="taskInfoForm.taskType === 'carbon'" title="碳账户计算将提取选择的用户信息根据固定公式进行计算" type="warning"
                    show-icon :closable="false" style="margin-top: 10px;"></el-alert> -->

                <!-- 添加 Collapse 折叠面板 -->
                <el-collapse v-model="activeCollapse" style="margin-top: 20px;">
                    <el-collapse-item v-for="(group, index) in uniqueGroupUserList" :key="index"
                        :title="`公式 ${index + 1}: ${group.formula}`" :name="index">
                        <!-- 在每个分组中遍历 users -->

                        <el-form-item class="form-item" v-for="(user, userIndex) in group.users" :key="userIndex"
                            :label="user.nodeName" label-width="120px">
                            <div class="desc-input">
                                <el-input v-for="(desc, index) in user.requireDataDescription"
                                    v-model="user.requireDataDescription[index]" placeholder="数据描述"></el-input>
                            </div>
                        </el-form-item>

                        <el-form-item class="form-item" label="结果接收" style="padding-left: 20px;">
                            <n-space item-style="display: flex;">
                                <n-checkbox v-for="(user, userIndex) in group.users" :key="userIndex"
                                    v-model:checked="user.isReceiveResult">
                                    {{ user.nodeName }}
                                </n-checkbox>
                            </n-space>
                        </el-form-item>
                    </el-collapse-item>
                </el-collapse>
            </el-form>
            <template #footer>
                <el-button @click="taskInfoDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitTaskInfo">确认</el-button>
            </template>
        </el-dialog>
    </el-dialog>


</template>
<script setup>
import { nowDate } from '../../date'
import SomeTools from '@/utils/someTools'
import { ElMessage, ElDrawer, ElMessageBox } from 'element-plus';
import axios from 'axios'
import { Transition, onMounted, ref, watch, nextTick, onBeforeUnmount, computed } from 'vue';
import { log, log10 } from 'mathjs';
import _, { repeat } from 'lodash';
import { $, compareOperatorSequences, validateFormula, extractUsernames, extractUsernamesWithFunc, isValidFormula } from '@/utils/utils'
import AddFormulaTemplate from './addFormulaTemplate.vue'
import { NFormItem, NButton, NCheckbox, NCheckboxGroup, NSpace } from 'naive-ui'
import { useRouter } from 'vue-router';
// 定义用户组件的状态变化控制
const animationState = new Map();  // 存储每个组件的动画状态
// 定义初始和目标状态
const router = useRouter()
const initialScale = 1; // 初始缩放比例
const targetScale = 1.02; // 悬停时的目标缩放比例
const initialColor = '#f0f8ff'; // 初始背景色
const hoverColor = '#e6f7ff'; // 悬停时的背景色
const dialogLoading = ref(false)
// 渐变动画的时间
const transitionDuration = 300; // 过渡时间 300ms
const taskInfoDialogVisible = ref(false);
// 线性插值函数，用于计算颜色和尺寸的渐变
const lerp = (start, end, t) => start + (end - start) * t;
// 公式模版列表
const formulaTemplates = ref([
    { name: 'arithmetic', content: '(A + B) * C' },
    { name: 'arithmetic', content: 'A * (B + C)' },
    // 可以根据需要添加更多模版
]);

//是否接受任务结果的复选框
const checkAll = ref(false)
const checkedUsers = ref([''])
const isIndeterminate = ref(true)
const searchUserName = ref('')
const taskInfoForm = ref({
    taskName: '',
    taskDescription: '', // 添加任务描述字段
    taskType: 'formula', // 'carbon' 或 'formula'
});
const groupedFormulaUsers = ref([]) //一个索引代表一个公式中的用户信息（包括username，Ip）
const requireDataDescriptionMap = new Map()
const userIcon = new Image()
const waitIcon = new Image()
const SuccessIcon = new Image()
const RefuseIcon = new Image()
waitIcon.src = require('@/assets/iconInCanvas/daichuli.png')
userIcon.src = require('@/assets/iconInCanvas/User.png')
SuccessIcon.src = require('@/assets/iconInCanvas/Success.png')
RefuseIcon.src = require('@/assets/iconInCanvas/refuse.png')
// 组件信息列表
const components = ref([
    { label: '组件 A', type: 'componentA' },
    { label: '组件 B', type: 'componentB' },
    // 可以根据需要添加更多组件
]);
let formula = ref('')
const dialogAddFormulaTemplateVisible = ref(false) //增加公式的dialog是否显示
const previewImage = ref('');  // 用于存储预览的图片
const isPreviewVisible = ref(false);  // 控制预览弹窗的显示与隐藏
const canvasRef = ref(null); // 引用 canvas DOM
const ctx = ref(null); // 保存 Canvas 的上下文
const draggingComponent = ref(null); // 当前拖拽的组件
const componentsOnCanvas = ref([]); // 画布中的组件
const dragging = ref(false); // 是否处于拖动状态
const dragOffset = ref({ x: 0, y: 0 }); // 拖动的偏移量
const selectedComponent = ref(null); // 当前选中的组件
const operators = ref(['+', '-', '*', '/', '(', ')', 'Max', 'Min', 'Min_Value', 'Max_Value']);
const alphabet = ref(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
const isDragging = ref(false); // 是否正在拖动
const isRightMouseDown = ref(false); // 是否右键按下
const isConnecting = ref(false); // 是否处于连接状态
const connections = ref([]); // 保存连接的组件对
const reverseconnections = ref([]);
const currentMousePosition = { x: 0, y: 0 }; // 用于记录当前鼠标位置
const formulaLine = ref([])
// 控制左右侧边栏的显示和隐藏
const isLeftSidebarVisible = ref(true);
const isRightSidebarVisible = ref(true);
// 组件列表（要生成的组件）
const userComponents = ref([
    { label: '组件 A', type: 'componentA' },
    { label: '组件 B', type: 'componentB' },
]);

const handlePageChange = async () => {
    await getUsers()
}
// 上下文菜单控制
const formulaOp = ref([])
const showContextMenu = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);
const hoverComponent = ref(null); // 鼠标悬停的组件
const isCtrlOrCmdPressed = ref(false); // 标识是否按下了 Ctrl 或 Command 键
const groupedConnections = ref([])
const tempUserList = ref([])
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const formRef = ref(null)
const emits = defineEmits(['update:modelValue', 'initTaskList', 'initMyInivList'])
const formulaTemplateName = ref('')  //任务提交时模版字符串的代号
const userSelectedList = ref([])
const totalUser = ref(0)
const mapUserInfo = new Map();
const totalDataSource = ref(0)
const currentDatasourceList = ref([])
const isRealSourceConn = ref([])
const userInfoStore = ref({
    userInfoList: []
})
const selsectedUserList = ref([])
const formBasic = ref({
    taskName: '',
    taskDescription: '',

})
const currentX = ref(0)
const currentY = ref(0)
const noSamequeryFormUsers = ref([])
const tempPage = ref(null)
const bracketRec = ref([])
const formulaUserMap = new Map()
const map = new Map();
const inputRefs = ref([]);
const taskBasicInfoShow = ref(false)
const currentUsersList = ref([])
const queryFormUsers = ref({
    queryName: '',
    page: 1,
    pageSize: 15,
})
const noSelected = ref(false)
const handleSubOpenLoading = ref(true)
const formLabelWidth = '80px'
let connId = 0
let timer
const table = ref(false)
const dialog = ref(false)
const loading = ref(false)
const currentCanvasInfo = ref({})
const form = ref({
    taskName: '',
    taskDescription: '',
    nodeNum: 1,
    nodeInfo: [{
        nodeAddress: '',
        dataSourceDesc: ''
    }],
})
const uniqueGroupUserList = ref([])
const queryFormDataSource = ref({
    queryName: '',
    page: 1,
    pageSize: 10,
    targetUserId: null,
})
const canvasDiv = ref(null)
const sendForm = ref({
    taskName: '',
    taskUuid: '',
    createTime: '',
    taskDescription: '',
    taskParams: [],
})


//对多个相同的用户的处理，即需要对queryFormUsers进行处理

const getnoSamequeryFormUsers = () => {
    noSamequeryFormUsers.value = []
    groupedFormulaUsers.value.forEach(item => {

        const index = noSamequeryFormUsers.value.findIndex(item => item.userinfo === user)
        if (!index) {
            noSamequeryFormUsers.value.push({ userinfo: user, repeat: 0 })
        } else {
            noSamequeryFormUsers.value[index].repeat++;
        }
    })
    console.log('noSamequeryFormUsers.value', noSamequeryFormUsers.value);
}
const mergeUniqueToGrouped = () => {
    uniqueGroupUserList.value.forEach((uniqueGroup, groupIndex) => {
        // 获取对应索引的 originalGroup
        const originalGroup = groupedFormulaUsers.value[groupIndex];

        uniqueGroup.users.forEach(uniqueUser => {
            // 找到 originalGroup 中匹配的用户列表
            const matchingUsers = originalGroup.users.filter(user => user.nodeName === uniqueUser.nodeName);

            // 确保在 matchingUsers 中，只有一条数据的 isReceiveResult 为 true
            let isReceiveResultSet = false;

            matchingUsers.forEach((originalUser, index) => {
                originalUser.requireDataDescription = uniqueUser.requireDataDescription[index] || '';

                // 复制其他属性
                originalUser.nodeAddress = uniqueUser.nodeAddress;

                // 确保只有一个 isReceiveResult 为 true
                if (uniqueUser.isReceiveResult && !isReceiveResultSet) {
                    originalUser.isReceiveResult = true;
                    isReceiveResultSet = true; // 标记已经设置过 isReceiveResult 为 true
                } else {
                    originalUser.isReceiveResult = false;
                }
            });
        });
    });
};
//显示增加公式的dialog
const showAddTemplate = () => {
    dialogAddFormulaTemplateVisible.value = true
}
const handleCheckAllChange = (val) => {
    const userLists = extractUsernames(formula)
    checkedUsers.value = val ? userLists : []
    isIndeterminate.value = false
}
const handleCheckedCitiesChange = (value) => {
    const checkedCount = value.length
    const userLists = extractUsernames(formula)

    checkAll.value = checkedCount === userLists.length
    isIndeterminate.value = checkedCount > 0 && checkedCount < userLists.length
}
// 过渡钩子函数
const beforeEnter = (el) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(10px)';
};

const enter = (el, done) => {
    setTimeout(() => {
        el.style.opacity = 1;
        el.style.transform = 'translateY(0)';
        done();
    }, 300); // 延迟淡入时间，确保离开动画完成后再进入
};

const leave = (el, done) => {
    el.style.opacity = 1;
    el.style.transform = 'translateY(0)';
    setTimeout(() => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(10px)';
        done();
    }, 300);
};

const generateFormula = (formulaStr, x, y) => {
    let userCount = 0; // 用于计数操作数
    let i = 0; // 初始化索引

    while (i < formulaStr.length) {
        // 检查当前字符是否为字母
        if (alphabet.value.includes(formulaStr[i])) {
            userCount++;
            let leftBracket = '';
            let rightBracket = '';

            // 向左查找所有左括号
            let leftIndex = i - 1;
            while (leftIndex >= 0 && formulaStr[leftIndex] === '(') {
                leftBracket = '(' + leftBracket;
                leftIndex--;
            }

            // 向右查找所有右括号
            let rightIndex = i + 1;
            while (rightIndex < formulaStr.length && formulaStr[rightIndex] === ')') {
                rightBracket += ')';
                rightIndex++;
            }

            // 将找到的括号与当前字母拼接
            let bracketEl = {
                rank: userCount,
                value: formulaStr[i],
                bracket: leftBracket + rightBracket // 记录左右括号
            };

            // 将结果推入 bracketRec 数组
            bracketRec.value.push(bracketEl);

            // 跳过已遍历的右括号
            i = rightIndex;
        } else if (formulaStr[i] !== ' ' && formulaStr[i] !== '(' && formulaStr[i] !== ')') {
            // 检查是否为操作符
            formulaOp.value.push(formulaStr[i]);
            i++;
        } else {
            // 跳过空格和括号
            i++;
        }
    }
};

//搜索用户
const SearchUser = async () => {
    tempPage.value =
        await getUsers()
}



const formulaUsersDraw = (formulaStr, x, y) => {
    let first = {
        type: 'users',
        template: formulaStr,
        value: { username: bracketRec.value[0].value },
        x,
        y,
        width: 190,
        height: 40,
        bracket: bracketRec.value[0].bracket,
        state: 2,
    };
    componentsOnCanvas.value.push(first)
    let sec, i = 0
    bracketRec.value.forEach((item, index) => {
        x += 120
        if (index != 0) {
            sec = {
                type: 'users',
                template: formulaStr,
                value: { username: item.value },
                x,
                y,
                width: 190,
                height: 40,
                bracket: item.bracket,
                state: 2,
            };
            componentsOnCanvas.value.push(sec)
            console.log('item', item.value);
            connections.value.push({ source: first, target: sec, circleContent: formulaOp.value[i], connId: connId++ })
            i++
            first = sec
            x += 140
        }
    })
    console.log('formula', bracketRec.value, formulaOp.value, connections.value);
    bracketRec.value = []
    formulaOp.value = []

}

const onDragStartTemplate = (template) => {
    // 记录当前拖拽的模板
    draggingComponent.value = {
        type: 'template',
        content: template.content,
    };
};
const handleFormulaUpdate = (newFormula) => {
    // 子组件传递的 `newFormula` 被接收
    formula.value = newFormula;
    console.log('Updated Formula:', newFormula);

    formulaTemplates.value.push({ name: 'arithmetic', content: formula.value },
    )
};
// 切换左侧边栏的显示状态
const toggleLeftSidebar = () => {
    isLeftSidebarVisible.value = !isLeftSidebarVisible.value;
    // 调整画布尺寸
    nextTick(() => {
        resizeCanvas();
    });
};

// 切换右侧边栏的显示状态
const toggleRightSidebar = () => {
    isRightSidebarVisible.value = !isRightSidebarVisible.value;
    // 调整画布尺寸
    nextTick(() => {
        resizeCanvas();
    });
};

// 保存画布为图像文件
const saveCanvas = () => {
    const canvas = canvasRef.value;
    const dataURL = canvas.toDataURL("image/png");  // 将画布转为图片数据URL
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'canvas_image.png';  // 下载文件名
    a.click();
};

// 询问用户是否保存画布
const confirmSaveCanvas = () => {
    ElMessageBox.confirm(
        '是否确认保存当前画布内容？',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(() => {
        saveCanvas();  // 如果用户点击确定，则保存
        ElMessage({
            type: 'success',
            message: '画布已保存',
        });
    }).catch(() => {
        ElMessage({
            type: 'info',
            message: '已取消保存',
        });
    });
};



const showPreview = async () => {
    await nextTick();  // 等待 DOM 更新完成
    const canvas = canvasRef.value;
    if (canvas) {
        previewImage.value = canvas.toDataURL("image/png");  // 获取画布图像数据
        console.log('Preview Image Data:', previewImage.value);
        isPreviewVisible.value = true;  // 打开预览弹窗
        console.log('isPreviewVisible after setting to true:', isPreviewVisible.value);
    } else {
        ElMessage({
            type: 'error',
            message: '无法获取画布内容',
        });
    }
};

const groupConnections = (connections) => {

    connections.value.forEach((conn1) => {
        let isRealSource = true
        connections.value.forEach((conn2) => {
            if (conn1.connId != conn2.connId && conn1.source === conn2.target) {
                isRealSource = false
            }
        })
        if (isRealSource === true) {
            isRealSourceConn.value.push(conn1)
        }
    })
    //console.log(isRealSourceConn.value);
}

// 监听键盘按下事件
const keydownHandler = (event) => {
    //console.log('keyDOwn');
    if ((event.key === 'Control' || event.key === 'Meta') && selectedComponent && (selectedComponent.value.type === 'users' || selectedComponent.value.type === 'function')) {
        isCtrlOrCmdPressed.value = true;
        isConnecting.value = true
    }
};



// 将十六进制颜色转换为 RGB 数组
const hexToRgb = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
};

// 将 RGB 数组转换为十六进制颜色
const rgbToHex = (r, g, b) => `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

// 动画更新函数
const updateAnimationState = () => {
    componentsOnCanvas.value.forEach((component) => {
        if (component.type === 'users') {
            let state = animationState.get(component) || {
                scale: initialScale,
                color: initialColor,
                startTime: null
            };

            const isHovered = hoverComponent.value === component; // 判断是否悬停
            const targetScaleValue = isHovered ? targetScale : initialScale;
            const targetColorValue = isHovered ? hoverColor : initialColor;

            // 获取当前时间
            const currentTime = performance.now();

            // 如果没有开始时间，设置开始时间
            if (!state.startTime) {
                state.startTime = currentTime;
            }

            // 计算时间差，确定当前动画进度
            const elapsedTime = currentTime - state.startTime;
            const t = Math.min(elapsedTime / transitionDuration, 1); // 过渡时间最大为 1（即完成）

            // 更新 scale 和颜色
            state.scale = lerp(state.scale, targetScaleValue, t);
            const [r1, g1, b1] = hexToRgb(state.color);
            const [r2, g2, b2] = hexToRgb(targetColorValue);
            const r = Math.round(lerp(r1, r2, t));
            const g = Math.round(lerp(g1, g2, t));
            const b = Math.round(lerp(b1, b2, t));
            state.color = rgbToHex(r, g, b);

            // 更新动画状态
            animationState.set(component, state);

            // 如果动画完成，重置开始时间
            if (t >= 1) {
                state.startTime = null;
            }
        }
    });

    // 每帧更新动画状态
    requestAnimationFrame(updateAnimationState);
};
// 定义一个函数，检测鼠标点击是否在连接线附近
// 判断点是否在连接线的椭圆形区域内
const isPointInEllipse = (px, py, x1, y1, x2, y2, threshold = 10) => {
    // 计算线段的中点
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // 计算线段的长度和旋转角度
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 将点击点 (px, py) 转换到椭圆的坐标系（以 midX, midY 为中心，并旋转椭圆到水平）
    const cosAngle = Math.cos(-angle);
    const sinAngle = Math.sin(-angle);

    const translatedX = cosAngle * (px - midX) - sinAngle * (py - midY);
    const translatedY = sinAngle * (px - midX) + cosAngle * (py - midY);

    // 椭圆的长轴和短轴
    const halfLineLength = lineLength / 2;
    const halfThreshold = threshold;

    // 判断点是否在椭圆内，公式：(x/a)^2 + (y/b)^2 <= 1
    return (translatedX ** 2) / (halfLineLength ** 2) + (translatedY ** 2) / (halfThreshold ** 2) <= 1;
};
// 在连接线上绘制带边框或高亮显示
const drawHighlightedArrowLine = (x1, y1, x2, y2, circleContent = '+') => {
    const arrowLength = 10;
    const arrowAngle = Math.PI / 6;
    const circleRadius = 15;
    const hoverRadius = 20;

    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 绘制加粗的线条
    ctx.value.lineWidth = 4; // 加粗线条
    ctx.value.strokeStyle = '#ff0000'; // 高亮颜色
    ctx.value.beginPath();
    ctx.value.moveTo(x1, y1);
    ctx.value.lineTo(x2, y2);
    ctx.value.stroke();

    // 重新绘制箭头
    const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle);
    const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle);

    ctx.value.fillStyle = '#ff0000'; // 高亮箭头颜色
    ctx.value.beginPath();
    ctx.value.moveTo(x2, y2);
    ctx.value.lineTo(arrowX1, arrowY1);
    ctx.value.lineTo(arrowX2, arrowY2);
    ctx.value.closePath();
    ctx.value.fill();

    // 绘制圆形按钮
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.value.beginPath();
    ctx.value.arc(midX, midY, circleRadius, 0, 2 * Math.PI);
    ctx.value.fillStyle = '#ffcccc'; // 圆形按钮背景色
    ctx.value.fill();
    ctx.value.strokeStyle = '#ff0000'; // 圆形按钮边框颜色
    ctx.value.stroke();

    ctx.value.font = '18px Arial';
    ctx.value.fillStyle = 'red';
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillText(circleContent, midX, midY);
};



// 监听键盘释放事件
const keyupHandler = (event) => {
    // console.log('keyup');

    if (event.key === 'Control' || event.key === 'Meta') {
        isCtrlOrCmdPressed.value = false;
    }
};
// 环路检测函数
const wouldCreateCycle = (source, target) => {
    const visited = new Set();

    const dfs = (node) => {
        if (node === source) {
            // 找到了一条返回到源节点的路径，形成环
            return true;
        }
        visited.add(node);

        // 遍历所有以当前节点为源的连接
        for (let conn of connections.value) {
            if (conn.source === node && !visited.has(conn.target)) {
                if (dfs(conn.target)) {
                    return true;
                }
            }
        }
        return false;
    };

    return dfs(target);
};

// 功能按钮行为
const connectComponent = () => {
    // 如果当前有选中的组件，进入连接模式
    if (selectedComponent && (selectedComponent.value.type === 'users' || selectedComponent.value.type === 'function')) {
        isConnecting.value = true; // 开启连接模式
        //console.log('进入连接模式，选择另一个组件进行连接');
    }
};
/* const handleConnectionsLine = () => {
    if (connections.value != []) {
        let i
        for (i = connections.value.length; i >= 0; i--) {
            if (i === 0 || (i != 0 && connections.value[i].source.value != connections.value[i - 1].target.value)) {
                if (i != 0 && connections.value[i].)
            }
        }

    }
} */

// 修改 completeConnection 函数
const completeConnection = (targetComponent) => {
    if (
        selectedComponent &&
        targetComponent &&
        (selectedComponent.value.type === 'users' || selectedComponent.value.type === 'function') &&
        (targetComponent.type === 'users' || targetComponent.type === 'function') &&
        selectedComponent.value !== targetComponent
    ) {
        //检查是否已经存在该连线
        let isDraw = false
        connections.value.forEach((conn) => {
            if (_.isEqual(conn.source, selectedComponent.value) && _.isEqual(conn.target, targetComponent)) {
                isDraw = true;
                console.log('isDraw', isDraw);
            }
        });
        if (isDraw === true) {
            ElMessage({
                type: 'error',
                message: '已存在连接线',
            });
            isConnecting.value = false; // 退出连接模式
            return
        }
        // 检查是否会形成环
        if (wouldCreateCycle(selectedComponent.value, targetComponent)) {
            ElMessage({
                type: 'error',
                message: '不能形成环路连接！',
            });
            isConnecting.value = false; // 退出连接模式
            return;
        }
        //在用户组件中记录连接线的connId   

        // 保存连接信息
        connections.value.push({
            source: selectedComponent.value,
            target: targetComponent,
            connId: connId++,
        });

        // 连接完成后退出连接模式
        if (!isCtrlOrCmdPressed.value) {
            isConnecting.value = false;

        }
        console.log('connections', connections.value);
        selectedComponent.value = targetComponent;
        drawCanvas();
    }
};


const onDragStart = (component) => {
    // 记录当前拖拽的组件类型
    draggingComponent.value = component;
    console.log('draggingComponent.value', draggingComponent.value);
    // console.log(onDragStart, component);
};

const onDrop = (event) => {
    // 确保 canvas 已经挂载并渲染

    if (canvasRef.value) {
        if (draggingComponent.value.username) {
            selsectedUserList.value.push(draggingComponent.value);
        }
        const canvasRect = canvasRef.value.getBoundingClientRect();
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;
        //console.log(draggingComponent.value);
        if (draggingComponent.value.type === 'template') {
            // 解析模板内容，生成组件和连接
            generateFormula(draggingComponent.value.content, x, y)
            formulaUsersDraw(draggingComponent.value.content, x, y)
            drawCanvas()
            return
        }
        ctx.value.font = '16px Arial'
        // 根据拖拽的类型创建组件
        let newComponent;
        if (operators.value.includes(draggingComponent.value)) {
            if (draggingComponent.value === 'Max' || draggingComponent.value === 'Min' || draggingComponent.value === 'Max_Value' || draggingComponent.value === 'Min_Value') {
                newComponent = {
                    type: 'function',
                    value: draggingComponent.value,
                    users: [],
                    bracket: '',
                    x,
                    y,
                    width: 50,
                    height: 50,
                };
            }
            else {
                newComponent = {
                    type: 'operators',
                    value: draggingComponent.value,
                    users: [],
                    x,
                    y,
                    width: 50,
                    height: 50,
                };
            }

            if (draggingComponent.value === '(' || draggingComponent.value === ')') {
                // 检测是否将括号拖拽到用户组件上
                let isBracketAdded = false;
                componentsOnCanvas.value.forEach((component) => {
                    if ((component.type === 'users' || component.type === 'function') && x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {
                        if (draggingComponent.value === '(' || draggingComponent.value === ')') {
                            component.bracket = draggingComponent.value + component.bracket;  // 给组件增加括号
                            console.log('component.bracket', component.bracket);
                            isBracketAdded = true
                        }
                    }
                });
                // 如果括号成功添加，重新绘制画布并返回
                if (isBracketAdded) {
                    drawCanvas(); // 重新绘制画布，显示更新后的用户组件
                    return;
                }
            }
            // 遍历所有连接线，检查是否将操作符拖拽到圆形按钮上
            let isReplaced = false;  // 用于标记操作符是否被替换
            connections.value.forEach(conn => {
                const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);
                const midX = (startPoint.x + endPoint.x) / 2;
                const midY = (startPoint.y + endPoint.y) / 2;
                const distance = Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2));

                // 如果组件拖拽到圆形按钮上
                if (distance <= 20) { // 20 代表允许的距离范围，可以调整
                    // 将圆形的“+”替换为操作符的 value
                    conn.circleContent = newComponent.value;

                    // 标记为已替换
                    isReplaced = true;
                }
            });

            // 如果操作符已被成功替换，返回，不再添加到画布
            if (isReplaced) {
                return;  // 阻止继续添加到画布
            }
        } else {
            // 检查是否将组件拖放到模板组件或者函数组件上
            let targetTemplateComponent = null;
            let isAddedToFunction = false;
            componentsOnCanvas.value.forEach(component => {
                if (component.type === 'users' && component.template) {
                    if (
                        x >= component.x &&
                        x <= component.x + component.width &&
                        y >= component.y &&
                        y <= component.y + component.height
                    ) {
                        targetTemplateComponent = component;
                    }
                }
                if (
                    component.type === 'function' &&
                    x >= component.x &&
                    x <= component.x + component.width &&
                    y >= component.y &&
                    y <= component.y + component.height
                ) {
                    // 将用户组件的 username 添加到 function 组件的 users 数组中

                    component.users.push(draggingComponent.value.username);
                    isAddedToFunction = true;
                }

            });

            if (targetTemplateComponent) {
                // 执行替换操作

                replaceTemplateWithUserFromExternal(draggingComponent.value, targetTemplateComponent);
                drawCanvas();
                return;
            }
            if (isAddedToFunction) {
                drawCanvas(); // 重新绘制画布
                return;
            }

            else {
                newComponent = {
                    type: 'users',
                    value: draggingComponent.value,
                    x,
                    y,
                    width: 190,
                    height: 40,
                    bracket: '',
                    state: 2,
                };
            }

        }
        // 将新组件添加到组件列表
        componentsOnCanvas.value.push(newComponent);

        // 自动选中新添加的组件
        selectedComponent.value = newComponent;

        // 重新绘制画布，显示新组件并选中
        drawCanvas();
    } else {
        console.error('Canvas element not found');
    }
};
const replaceTemplateWithUserFromExternal = (userComponentValue, templateComponent) => {
    // 创建一个新的用户组件，基于外部组件的值
    const newUserComponent = {
        type: 'users',
        value: userComponentValue,
        x: templateComponent.x,
        y: templateComponent.y,
        width: templateComponent.width,
        height: templateComponent.height,
        bracket: templateComponent.bracket,
        state: 2, // 设置初始状态
    };

    // 如果不希望新的组件被视为模板组件，删除 'template' 属性
    delete newUserComponent.template;

    // 在组件列表中替换模板组件
    const index = componentsOnCanvas.value.findIndex(component => component === templateComponent);
    if (index !== -1) {
        componentsOnCanvas.value.splice(index, 1, newUserComponent);
    }

    // 更新连接关系
    connections.value.forEach(conn => {
        if (conn.source === templateComponent) {
            conn.source = newUserComponent;
        }
        if (conn.target === templateComponent) {
            conn.target = newUserComponent;
        }
    });
};
// 处理右键点击事件，显示上下文菜单
const onRightClick = (event) => {

    event.preventDefault();
    if (isConnecting.value) {

        isConnecting.value = false
        return
    }
    const canvasRect = canvasRef.value.getBoundingClientRect();

    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;


    // 设置菜单的位置
    selectedComponent.value = null; // 重置选中组件

    // 遍历连接线，检测是否点击了某条连接线
    let clickedConnection = null;

    // 遍历连接线，检测是否点击了某条连接线
    connections.value.forEach(conn => {
        if (conn.target) {
            const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);

            // 使用 isPointInEllipse 函数判断是否点击了椭圆区域
            if (isPointInEllipse(x, y, startPoint.x, startPoint.y, endPoint.x, endPoint.y, 15)) {
                clickedConnection = conn;
                // 如果检测到点击的连接线，绘制椭圆形边框
                console.log('Clicked connection:', conn);
            }
        }
    });

    // 如果检测到点击的连接线，可以进行后续操作
    if (clickedConnection) {
        currentCanvasInfo.value = clickedConnection;
        selectedComponent.value = { type: 'conn', value: clickedConnection }
    }

    componentsOnCanvas.value.forEach((component) => {
        if (x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {
            selectedComponent.value = component; // 选中该组件

        }
    });

    if (selectedComponent.value) {
        //console.log(selectedComponent.value);
        drawCanvas()// 重新绘制画布，显示选中框
        // console.log(selectedComponent.value);
        contextMenuX.value = x + 80;
        contextMenuY.value = y + 50;
        showContextMenu.value = true; // 显示
        isDragging.value = false
    }

}
// 隐藏上下文菜单
const hideContextMenu = () => {
    showContextMenu.value = false;
}
// 删除组件
const deleteComponent = () => {
    //console.log(selectedComponent.value);
    if (!selectedComponent.value) return;
    if (isConnecting.value) {

        isConnecting.value = false

    }

    if (selectedComponent.value.type === 'users' || selectedComponent.value.type === 'function') {
        // 删除与该组件相关的所有连接
        connections.value = connections.value.filter(conn => conn.source !== selectedComponent.value && conn.target !== selectedComponent.value);
        selsectedUserList.value = selsectedUserList.value.filter(user => user === selectedComponent.value)
        componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);
        //console.log(componentsOnCanvas.value);
        selectedComponent.value = null;
    } else if (selectedComponent.value.type === 'operators') {
        componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);
        selectedComponent.value = null;

    } /* else if (selectedComponent.value.type === 'function') {
        componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);
        selectedComponent.value = null;

    }  */else if (selectedComponent.value.type === 'conn') {
        connections.value = connections.value.filter(conn => conn !== selectedComponent.value.value);
        selectedComponent.value = null;
    }
    hideContextMenu();
    drawCanvas(); // 重新绘制画布
};

// 置顶组件
const moveToTop = () => {
    if (!selectedComponent.value) return;

    if (selectedComponent.value.type !== 'conn') {
        // 将组件移到数组末尾（表示在最顶层绘制）
        componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);


        componentsOnCanvas.value.push(selectedComponent.value);
    } else {
        connections.value = connections.value.filter(conn => conn !== selectedComponent.value.value);
        connections.value.push(selectedComponent.value.value)
    }

    hideContextMenu();
    drawCanvas(); // 重新绘制画布
}

// 画布网格背景绘制
const drawGrid = () => {
    const canvas = canvasRef.value;

    const gridSize = 20;

    // 绘制网格 
    ctx.value.clearRect(0, 0, canvas.width, canvas.height);

    ctx.value.beginPath();
    ctx.value.strokeStyle = '#e0e0e0';
    ctx.value.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.value.moveTo(x, 0);
        ctx.value.lineTo(x, canvas.height);
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.value.moveTo(0, y);
        ctx.value.lineTo(canvas.width, y);
    }

    ctx.value.stroke();
};
// 计算组件的四个边缘中点
const getEdgePoints = (component) => {
    const top = { x: component.x + component.width / 2, y: component.y }; // 上边中点
    const bottom = { x: component.x + component.width / 2, y: component.y + component.height }; // 下边中点
    const left = { x: component.x, y: component.y + component.height / 2 }; // 左边中点
    const right = { x: component.x + component.width, y: component.y + component.height / 2 }; // 右边中点
    return [top, bottom, left, right];
};

// 计算两点之间的距离
const getDistance = (point1, point2) => {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
};

// 找到两个组件之间最近的两个边缘点
const findClosestEdgePoints = (source, target) => {
    const sourcePoints = getEdgePoints(source);
    const targetPoints = getEdgePoints(target);

    let minDistance = Infinity;
    let closestSourcePoint = null;
    let closestTargetPoint = null;

    // 遍历 source 和 target 的每个边缘点，找到距离最短的两点
    sourcePoints.forEach(sp => {
        targetPoints.forEach(tp => {
            const distance = getDistance(sp, tp);
            if (distance < minDistance) {
                minDistance = distance;
                closestSourcePoint = sp;
                closestTargetPoint = tp;
            }
        });
    });

    return { startPoint: closestSourcePoint, endPoint: closestTargetPoint };
};

// 绘制带箭头的连接线
const drawArrowLine = (x1, y1, x2, y2, circleContent = '+') => {
    const arrowLength = 10; // 箭头长度
    const arrowAngle = Math.PI / 6; // 箭头角度
    const circleRadius = 15; // 普通状态下圆的半径
    const hoverRadius = 20; // 悬停状态下圆的半径
    let isHovered = false; // 是否悬停在按钮上

    // 计算直线的角度
    const angle = Math.atan2(y2 - y1, x2 - x1);

    // 绘制直线
    ctx.value.beginPath();
    ctx.value.moveTo(x1, y1);
    ctx.value.lineTo(x2, y2);
    ctx.value.stroke();

    // 计算箭头的两个侧点
    const arrowX1 = x2 - arrowLength * Math.cos(angle - arrowAngle);
    const arrowY1 = y2 - arrowLength * Math.sin(angle - arrowAngle);
    const arrowX2 = x2 - arrowLength * Math.cos(angle + arrowAngle);
    const arrowY2 = y2 - arrowLength * Math.sin(angle + arrowAngle);

    // 绘制箭头
    ctx.value.fillStyle = '#4682b4';
    ctx.value.beginPath();
    ctx.value.moveTo(x2, y2);
    ctx.value.lineTo(arrowX1, arrowY1);
    ctx.value.lineTo(arrowX2, arrowY2);
    ctx.value.closePath();
    ctx.value.fill();

    // 计算连线的中点
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // 检查鼠标是否悬停在圆形按钮上
    if (hoverButton(midX, midY, hoverRadius)) {
        isHovered = true;
    }

    // 绘制中点的圆形按钮
    ctx.value.beginPath();
    ctx.value.arc(midX, midY, isHovered ? hoverRadius : circleRadius, 0, 2 * Math.PI);
    ctx.value.fillStyle = isHovered ? '#e0e0e0' : '#ffffff'; // 背景颜色，悬停时变亮
    ctx.value.fill(); // 填充按钮
    ctx.value.strokeStyle = '#4682b4'; // 按钮边框颜色
    ctx.value.stroke(); // 绘制按钮边框

    // 在按钮中绘制操作符或者“+”号
    ctx.value.font = isHovered ? '24px Arial' : '18px Arial'; // 悬停时字体变大
    ctx.value.fillStyle = 'red'; // 字符的颜色
    ctx.value.textAlign = 'center';
    ctx.value.textBaseline = 'middle';
    ctx.value.fillText(circleContent, midX, midY); // 替换圆形中的“+”为传递的内容
};

// 绘制连接线
const drawConnections = () => {
    isRealSourceConn.value = []
    groupedConnections.value = []
    ctx.value.lineWidth = 2;
    ctx.value.strokeStyle = '#4682b4'; // 线条颜色
    ctx.value.fillStyle = '#4682b4'; // 箭头颜色
    // 使用方法
    // 示例 usage
    groupConnections(connections)
    getFormulaGroup(isRealSourceConn.value)

    const removePercentC = (text) => {
        return text.replace(/%c/g, '');
    };
    componentsOnCanvas.value.forEach(component => {
        if (component.type === 'function') {
            let isHaveConnec = false
            connections.value.forEach(conn => {
                if (conn.source === component || conn.target === component) {
                    isHaveConnec = true
                }
            })

            if (!isHaveConnec) {
                const funcString = removePercentC(component.value + `( ${component.users.join(',')} )`)

                groupedConnections.value.push(funcString)
            }
        }
    })
    // console.log(groupedConnections.value);
    connections.value.forEach(conn => {
        if (conn.target) {
            //console.log(conn.source);
            const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);

            // 绘制带箭头的连接线，并在中间嵌入圆形按钮

            drawArrowLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, conn.circleContent);
        }

    });
};
// 检查鼠标是否悬停在圆形按钮上
const hoverButton = (midX, midY, radius) => {
    const canvasRect = canvasRef.value.getBoundingClientRect();
    const mouseX = currentMousePosition.x - canvasRect.left;
    const mouseY = currentMousePosition.y - canvasRect.top;

    const distance = Math.sqrt(Math.pow(mouseX - midX, 2) + Math.pow(mouseY - midY, 2));

    return distance <= radius;
};
const getFormulaGroup = (isRealSourceConns) => {
    isRealSourceConns.forEach((isRealSourceConn) => {
        let currConn = isRealSourceConn
        let formulaLine = ''
        let finalConn = currConn
        //console.log(currConn.source.value.username, noTarget(currConn));
        //寻找每个左括号
        if (currConn.source.bracket) {
            for (const char of currConn.source.bracket) {
                if (char === '(') {
                    formulaLine = formulaLine + char

                }
            }
        }
        currConn.circleContent === undefined ? currConn.circleContent = '+' : currConn.circleContent
        if (currConn.source.type === 'function') {
            formulaLine = formulaLine + currConn.source.value + `(${currConn.source.users.join(', ')})`
        }
        else {
            formulaLine = formulaLine + currConn.source.value.username

        }
        /*         if (currConn.source.bracket === ')') {
                    formulaLine = formulaLine + currConn.source.bracket
                } */
        //寻找每个右括号
        if (currConn.source.bracket) {
            for (const char of currConn.source.bracket) {
                if (char === ')') {
                    formulaLine = formulaLine + char

                }
            }
        }
        formulaLine = formulaLine + currConn.circleContent
        while (!noTarget(currConn)) {

            currConn = findNextConn(currConn)
            // console.log('currConn', currConn);
            if (currConn === undefined) {
                break
            }
            finalConn = currConn
            if (currConn.source.bracket) {
                for (const char of currConn.source.bracket) {
                    if (char === '(') {
                        formulaLine = formulaLine + char

                    }
                }
            }
            currConn.circleContent === undefined ? currConn.circleContent = '+' : currConn.circleContent
            if (currConn.source.type === 'function') {
                formulaLine = formulaLine + currConn.source.value + `(${currConn.source.users.join(', ')})`
            }
            else {
                formulaLine = formulaLine + currConn.source.value.username

            }
            if (currConn.source.bracket) {
                for (const char of currConn.source.bracket) {
                    if (char === ')') {
                        formulaLine = formulaLine + char

                    }
                }
            }
            formulaLine = formulaLine + currConn.circleContent


        }
        /*         if (finalConn.target.bracket === '(') {
                    formulaLine = formulaLine + finalConn.target.bracket
        
                } */
        //finalConn寻找每个做括号
        if (finalConn.target.bracket) {
            for (const char of finalConn.target.bracket) {
                if (char === '(') {
                    formulaLine = formulaLine + char

                }
            }
        }
        if (finalConn.target.type === 'function') {
            formulaLine = formulaLine + finalConn.target.value + `(${finalConn.target.users.join(', ')})`
        }
        else {
            formulaLine = formulaLine + finalConn.target.value.username

        }
        /*         if (finalConn.target.bracket === ')') {
                    formulaLine = formulaLine + finalConn.target.bracket
        
                } */
        //finalConn寻找每个右括号
        if (finalConn.target.bracket) {
            for (const char of finalConn.target.bracket) {
                if (char === ')') {
                    formulaLine = formulaLine + char

                }
            }
        }
        formulaLine = formulaLine.replace(/%c/g, "");
        groupedConnections.value.push(formulaLine)
    })


    //console.log(groupedConnections.value);
}
const noTarget = (goalConn) => {
    let flag = true
    connections.value.forEach((conn) => {
        if (conn.source === goalConn.target && conn.connId != goalConn.connId) {
            //  console.log(conn.source.value.username, goalConn.target.value.username);
            flag = false
        }
    })
    return flag
}
let findNextConn = (currConn) => {
    let tempConn = undefined
    connections.value.forEach((conn) => {
        //console.log(conn.source.value.username, currConn.target.value.username);
        if (currConn.target === conn.source && currConn.connId != conn.connId) {
            tempConn = conn
        }
    })
    return tempConn === undefined ? currConn : tempConn
}
// 调整 canvas 尺寸使其适应 flex 布局
const resizeCanvas = () => {
    const canvas = canvasRef.value;
    const parent = canvas.parentNode; // 获取父元素

    const devicePixelRatio = window.devicePixelRatio || 1;

    // 获取父容器的宽度和高度
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    // 设置 canvas 尺寸为父容器的尺寸
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    // 缩放 canvas 以适应设备像素比
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.value = canvas.getContext('2d');
    ctx.value.scale(devicePixelRatio, devicePixelRatio);

    drawCanvas(); // 在调整尺寸后重新绘制画布
};
//获取画布中最右边的坐标与最下面的坐标
const getMaxDimensions = (components) => {
    let maxX = 0;
    let maxY = 0;

    components.forEach(component => {
        const componentRightEdge = component.x + component.width;
        const componentBottomEdge = component.y + component.height;

        // 更新最大X和最大Y值
        if (componentRightEdge > maxX) {
            maxX = componentRightEdge;
        }

        if (componentBottomEdge > maxY) {
            maxY = componentBottomEdge;
        }
    });

    return { maxX, maxY };
};

const drawCanvas = () => {
    if (!ctx.value) return;
    const { maxX, maxY } = getMaxDimensions(componentsOnCanvas.value);

    const canvas = canvasRef.value;
    const initialCanvasWidth = canvas.clientWidth; // 初始画布宽度
    const initialCanvasHeight = canvas.clientHeight; // 初始画布高度
    if (maxX + 50 > initialCanvasWidth) {
        canvasRef.value.style.width = `${maxX + 50}px`;
        canvasDiv.value.classList.add('overflow-x-auto')

    }
    if (maxY + 50 > initialCanvasHeight) {
        canvasRef.value.style.height = `${maxY + 50}px`;
        canvasDiv.value.classList.add('overflow-y-auto')

    }
    const devicePixelRatio = window.devicePixelRatio || 1;
    setCanvasResolution()
    // 在每次绘制前重新设置缩放
    ctx.value.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    // 清除画布
    ctx.value.clearRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
    ctx.value.fillStyle = '#ecf5ff';
    ctx.value.fillRect(0, 0, canvas.width, canvas.height); // 填充整个 canvas
    // 设置阴影效果

    drawGrid();
    // 绘制在 Canvas 上的每个组件  
    componentsOnCanvas.value.forEach((component) => {
        if (hoverComponent.value === component) {
            // 悬浮时的渐变效果

            const gradient = ctx.value.createLinearGradient(component.x, component.y, component.x + component.width, component.y + component.height);
            gradient.addColorStop(0, '#add8e6'); // 浅蓝色
            gradient.addColorStop(1, '#f0f8ff'); // 浅蓝色
            ctx.value.fillStyle = gradient; // 使用渐变填充背景
        } else {
            ctx.value.fillStyle = '#f0f8ff'; // 默认背景颜色
        }

        ctx.value.strokeStyle = '#4682b4'; // 边框颜色
        ctx.value.lineWidth = 2;

        // 绘制圆角矩形


        if (component.type === 'users') {

            // 设置背景和边框

            ctx.value.lineWidth = 1;
            if (component.template) {
                ctx.value.fillStyle = '#fef7e8'
            }
            else {
                ctx.value.fillStyle = '#ecf5ff'

            }
            // 绘制用户组件的圆角矩形
            drawRoundedRect(ctx, component.x, component.y, component.width, component.height, 10); // 圆角矩形

            if (component.template) {
                // 绘制用户名
                ctx.value.font = '16px Arial';
                ctx.value.fillStyle = '#303133';
                ctx.value.textAlign = 'left';
                ctx.value.textBaseline = 'middle';
                ctx.value.color = 'gray'
                const displayText = component.value.username;
                const textX = component.x + 50; // 在图标后面显示用户名，调整X位置
                const textY = component.y + component.height / 2 + 2; // 文本垂直居中

                ctx.value.fillText(displayText, textX, textY);


            }
            else {
                // 绘制竖线
                const lineMargin = 8; // 上下空隙
                ctx.value.fillStyle = '#337ecc'
                const lineX = component.x + 10; // 离组件左侧10px处绘制竖线
                const lineY = component.y + lineMargin; // 离组件上下留出一些空隙
                const lineHeight = component.height - 2 * lineMargin; // 竖线高度
                ctx.value.fillRect(lineX + 120, lineY, 2, lineHeight); // 绘制竖线，宽度2px



                // 绘制用户图标
                const iconSize = 30;
                const iconY = component.y + (component.height - iconSize) / 2; // 垂直居中图标
                ctx.value.drawImage(userIcon, component.x + 10, iconY, iconSize, iconSize); // 绘制图标

                // 绘制用户名
                ctx.value.font = '16px Arial';
                ctx.value.fillStyle = '#303133';
                ctx.value.textAlign = 'left';
                ctx.value.textBaseline = 'middle';
                ctx.value.color = 'gray'
                const displayText = component.value.username;
                const textX = component.x + 50; // 在图标后面显示用户名，调整X位置
                const textY = component.y + component.height / 2 + 2; // 文本垂直居中

                ctx.value.fillText(displayText, textX, textY);
                //绘制状态
                if (component.state === 2) {
                    ctx.value.drawImage(waitIcon, component.x + 145, iconY, iconSize, iconSize); // 绘制图标

                } else if (component.state === 1) {
                    ctx.value.drawImage(RefuseIcon, component.x + 145, iconY, iconSize, iconSize); // 绘制图标

                } if (component.state === 0) {
                    ctx.value.drawImage(SuccessIcon, component.x + 145, iconY, iconSize, iconSize); // 绘制图标

                }

            }
            // 如果组件有括号，则在组件外部绘制括号并突出显示
            if (component.bracket) {
                let leftCount = 0, rightCount = 0;
                ctx.value.fillStyle = 'red'; // 突出的颜色
                ctx.value.textAlign = 'center';
                ctx.value.textBaseline = 'middle';
                for (const char of component.bracket) {
                    console.log('char', char);
                    if (char === '(') {
                        ctx.value.font = `${20 + leftCount * 4}px Arial bold`; // 更大的字体
                        ctx.value.fillText(char, component.x - 15 - 15 * leftCount, component.y + component.height / 2); // 左侧括号
                        leftCount++;
                    } else if (char === ')') {
                        ctx.value.font = `${20 + rightCount * 4}px Arial bold`; // 更大的字体
                        ctx.value.fillText(char, component.x + component.width + 15 + 15 * rightCount, component.y + component.height / 2); // 右侧括号
                        rightCount++;
                    }
                }
            }
        } else if (component.type === 'operators') {

            // 绘制圆形边框
            const radius = 25; // 定义圆的半径
            ctx.value.beginPath();
            ctx.value.arc(component.x + radius, component.y + radius, radius, 0, 2 * Math.PI); // 圆心(x + 半径, y + 半径)
            ctx.value.fill(); // 填充圆形



            // 绘制操作符文本
            ctx.value.font = '20px Arial';
            ctx.value.fillStyle = 'rgba(139, 0, 0,.5)';
            ctx.value.textAlign = 'center';
            ctx.value.textBaseline = 'middle';
            ctx.value.fillText(component.value, component.x + radius, component.y + radius);




        } else if (component.type === 'function') {
            // 绘制 function 形状
            let circleRadius = 25
            /*             if (component.value === 'Max_Value' || component.value === 'Min_Value') {
                            circleRadius = 50
                        } */
            // 动态计算矩形宽度和文本
            const userText = component.users.length > 0
                ? `( ${component.users.join(', ')} )`
                : "请将用户拖拽至此"; // 动态提示文本
            ctx.value.font = '14px Arial'; // 设置字体

            const rectWidth = Math.max(ctx.value.measureText(userText).width + 20, 140); // 确保宽度准确
            const rectHeight = 40; // 矩形高度
            // 绘制圆形
            if (component.value === 'Max' || component.value === 'Min') {
                ctx.value.beginPath();
                ctx.value.arc(component.x + circleRadius, component.y + circleRadius, circleRadius, 0, 2 * Math.PI);
                ctx.value.fillStyle = '#add8e6';
                ctx.value.fill();
                ctx.value.strokeStyle = '#4682b4';
                ctx.value.stroke();

            } else {
                ctx.value.beginPath();
                ctx.value.ellipse(
                    component.x + circleRadius,  // 圆心的 x 坐标
                    component.y + circleRadius,  // 圆心的 y 坐标
                    circleRadius * 2,          // 水平半径，调整为比垂直半径大一些以形成椭圆
                    circleRadius,                // 垂直半径
                    0,                           // 旋转角度
                    0,                           // 开始角度
                    2 * Math.PI                  // 结束角度
                );
                ctx.value.fillStyle = '#add8e6';
                ctx.value.fill();
                ctx.value.strokeStyle = '#4682b4';
                ctx.value.stroke();
            }
            // 绘制圆内的文本
            ctx.value.font = '16px Arial';
            ctx.value.fillStyle = 'black';
            ctx.value.textAlign = 'center';
            ctx.value.textBaseline = 'middle';
            ctx.value.fillText(component.value, component.x + circleRadius, component.y + circleRadius);

            // 绘制矩形
            let rectX = component.x + circleRadius * 2
            if (component.value === 'Max_Value' || component.value === 'Min_Value') {
                rectX = component.x + circleRadius * 3
            }
            const rectY = component.y + (circleRadius - rectHeight / 2);
            ctx.value.fillStyle = '#f0f8ff';
            ctx.value.fillRect(rectX, rectY, rectWidth, rectHeight);
            ctx.value.strokeRect(rectX, rectY, rectWidth, rectHeight);

            // 绘制矩形内的用户值
            ctx.value.fillStyle = component.users.length > 0 ? 'black' : 'gray'; // 提示文本为灰色
            ctx.value.font = component.users.length > 0 ? '14px Arial' : 'italic 14px Arial'; // 提示文本为斜体
            ctx.value.textAlign = 'left';
            if (component.users.length === 0) {
                ctx.value.fillText(userText, rectX + 10, rectY + rectHeight / 2);


            }
            else {
                drawUserTextWithColor(ctx.value, userText, rectX + 10, rectY + rectHeight / 2)

            }
            component.width = circleRadius * 2 + rectWidth; // 包括圆形和矩形的总宽度

            if (component.value === 'Max_Value' || component.value === 'Min_Value') {
                component.width = circleRadius * 4 + rectWidth; // 包括圆形和矩形的总宽度
            }
            component.height = Math.max(circleRadius * 2, rectHeight); // 确保高度为圆形或矩形中较大的那个
            if (component.bracket) {
                let leftCount = 0, rightCount = 0;
                ctx.value.fillStyle = 'red'; // 突出的颜色
                ctx.value.textAlign = 'center';
                ctx.value.textBaseline = 'middle';
                for (const char of component.bracket) {
                    console.log('char', char);
                    if (char === '(') {
                        ctx.value.font = `${20 + leftCount * 4}px Arial bold`; // 更大的字体
                        ctx.value.fillText(char, component.x - 15 - 15 * leftCount, component.y + component.height / 2); // 左侧括号
                        leftCount++;
                    } else if (char === ')') {
                        ctx.value.font = `${20 + rightCount * 4}px Arial bold`; // 更大的字体
                        ctx.value.fillText(char, component.x + component.width + 15 + 15 * rightCount, component.y + component.height / 2); // 右侧括号
                        rightCount++;
                    }
                }
            }
        }
        // 如果该组件被选中，绘制选中框
        /*         if (selectedComponent.value === component) {
                    drawSelectionBox(ctx, component);
                } */
    });
    // 绘制连接线
    drawConnections();
    // 绘制选中框
    if (selectedComponent.value && selectedComponent.value.type != 'conn') {
        ctx.value.strokeStyle = 'red';
        ctx.value.lineWidth = 2;


        if (selectedComponent.value.value === 'Max_Value' || selectedComponent.value.value === 'Min_Value') {
            ctx.value.strokeRect(selectedComponent.value.x - 30, selectedComponent.value.y - 5, selectedComponent.value.width + 10, selectedComponent.value.height + 10);

        } else {
            ctx.value.strokeRect(selectedComponent.value.x - 5, selectedComponent.value.y - 5, selectedComponent.value.width + 10, selectedComponent.value.height + 10);
        }
    } else if (selectedComponent.value && selectedComponent.value.type === 'conn') {
        const { startPoint, endPoint } = findClosestEdgePoints(selectedComponent.value.value.source, selectedComponent.value.value.target);
        // 如果检测到点击的连接线，绘制椭圆形边框
        drawEllipseAroundLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, 15);

    }


};

const drawUserTextWithColor = (ctx, userText, x, y) => {
    const fontSize = 14; // 字体大小
    ctx.font = `${fontSize}px Arial`; // 设置字体
    ctx.textBaseline = 'middle'; // 文本基线

    let currentX = x; // 起始 X 坐标

    // 正则表达式匹配 `%c` 标记
    const parts = userText.split(/(%c.*?%c)/);

    parts.forEach((part) => {
        if (part.startsWith('%c') && part.endsWith('%c')) {
            // 红色部分：去掉 %c 标记
            const text = part.slice(2, -2);
            ctx.fillStyle = 'red'; // 设置字体颜色为红色
            ctx.fillText(text, currentX, y); // 绘制文本
            currentX += ctx.measureText(text).width; // 更新 X 坐标
        } else {
            // 普通文本
            ctx.fillStyle = 'black'; // 设置字体颜色为黑色
            ctx.fillText(part, currentX, y); // 绘制文本
            currentX += ctx.measureText(part).width; // 更新 X 坐标
        }
    });
};
// 绘制线段
const drawLine = (ctx, x1, y1, x2, y2) => {
    ctx.value.beginPath();
    ctx.value.moveTo(x1, y1);
    ctx.value.lineTo(x2, y2);
    ctx.value.strokeStyle = '#4682b4'; // 线的颜色
    ctx.value.lineWidth = 2;
    ctx.value.stroke();
};

// 绘制椭圆形边框以高亮显示点击的连接线
const drawEllipseAroundLine = (x1, y1, x2, y2, threshold) => {
    const midX = (x1 + x2) / 2; // 计算线段的中点
    const midY = (y1 + y2) / 2; // 计算线段的中点
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2); // 计算线段长度
    const angle = Math.atan2(y2 - y1, x2 - x1); // 计算线段的角度

    ctx.value.save(); // 保存当前画布状态
    ctx.value.translate(midX, midY); // 将坐标系移动到椭圆的中心点
    ctx.value.rotate(angle); // 旋转坐标系，使椭圆与线段对齐

    // 绘制椭圆，长轴为线段长度的一半，短轴为阈值
    ctx.value.beginPath();
    ctx.value.ellipse(0, 0, lineLength / 2, threshold, 0, 0, 2 * Math.PI);
    ctx.value.strokeStyle = 'red'; // 椭圆的边框颜色
    ctx.value.lineWidth = 2; // 椭圆边框的宽度
    ctx.value.stroke();

    ctx.value.restore(); // 恢复画布状态到之前的状态
};
const onCanvasClick = (event) => {
    hideContextMenu(); // 隐藏上下文菜单

    const canvasRect = canvasRef.value.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    // 遍历连接线，检测是否点击了某条连接线
    let clickedConnection = null;

    // 遍历连接线，检测是否点击了某条连接线
    connections.value.forEach(conn => {
        if (conn.target) {
            const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);

            // 使用 isPointInEllipse 函数判断是否点击了椭圆区域
            if (isPointInEllipse(x, y, startPoint.x, startPoint.y, endPoint.x, endPoint.y, 15)) {
                clickedConnection = conn;
                // 如果检测到点击的连接线，绘制椭圆形边框
                console.log('Clicked connection:', conn);
            }
        }
    });

    // 如果检测到点击的连接线，可以进行后续操作
    if (clickedConnection) {
        currentCanvasInfo.value = clickedConnection;
        selectedComponent.value = { type: 'conn', value: clickedConnection }
        drawCanvas()
        return
    }

    let clickedComponent = null;

    // 检查是否点击了某个组件
    componentsOnCanvas.value.forEach(component => {
        if (x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {
            clickedComponent = component;
        }
    });

    // 如果处于连接模式，且点击了第二个组件，则完成连接
    if (isConnecting.value && clickedComponent && (clickedComponent.type == 'users' || clickedComponent.type == 'function')) {
        completeConnection(clickedComponent);

    } else if (isCtrlOrCmdPressed.value && selectedComponent.value && clickedComponent && clickedComponent.type === 'users') {
        // console.log(isCtrlOrCmdPressed.value);
        completeConnection(clickedComponent); // 直接连接选中的组件和当前点击的组件

    }
    else {
        // 正常选择组件
        isConnecting.value = false
        selectedComponent.value = clickedComponent;
        console.log(selectedComponent.value);
        drawCanvas(); // 重新绘制画布
    }

};

const onMouseDown = (event) => {
    if (canvasRef.value) {
        const canvasRect = canvasRef.value.getBoundingClientRect();
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;
        if (!isConnecting.value) {

            // 判断是否点击到了某个组件
            selectedComponent.value = componentsOnCanvas.value.find(
                (component) =>
                    x >= component.x &&
                    x <= component.x + component.width &&
                    y >= component.y &&
                    y <= component.y + component.height
            );

            if (selectedComponent.value) {
                currentX.value = selectedComponent.value.x
                currentY.value = selectedComponent.value.y
                // 记录鼠标与组件的偏移量
                dragOffset.value.x = x - selectedComponent.value.x;
                dragOffset.value.y = y - selectedComponent.value.y;
                isDragging.value = true;
            }
        }
    }
    //console.log('mouseodwn', isConnecting.value, selectedComponent.value)

};
const onMouseMove = (event) => {
    console.log();
    const canvasRect = canvasRef.value.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    currentMousePosition.x = event.clientX;
    currentMousePosition.y = event.clientY;
    let hoveredComponent = null;

    if (isDragging.value && selectedComponent.value) {
        // 更新组件的位置
        selectedComponent.value.x = x - dragOffset.value.x;
        selectedComponent.value.y = y - dragOffset.value.y;


    } else {
        // 检查鼠标是否悬停在某个组件上
        componentsOnCanvas.value.forEach(component => {
            if (x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {
                hoveredComponent = component;
            }
        });

        // 如果悬停的组件发生变化，重新绘制画布
        if (hoverComponent.value !== hoveredComponent) {
            hoverComponent.value = hoveredComponent;

        }
        // 动态修改鼠标样式：如果悬停在组件上，显示 "pointer" 样式，否则恢复默认样式
        if (hoverComponent.value) {
            canvasRef.value.style.cursor = 'pointer'; // 鼠标悬浮在组件上时
        } else {
            canvasRef.value.style.cursor = 'default'; // 鼠标离开组件时恢复默认样式
        }
    }
    drawCanvas();
};
const onMouseUp = (event) => {
    // 判断是否是没有 template 属性的用户组件
    if (isDragging.value && selectedComponent && selectedComponent.value.type === 'users' && !selectedComponent.value.template) {
        let targetTemplateComponent = null;

        // 遍历组件，查找接近的模板组件
        componentsOnCanvas.value.forEach(component => {
            if (component !== selectedComponent.value && component.type === 'users' && component.template) {

                // 计算拖拽组件与模板组件的距离
                const distance = Math.sqrt(Math.pow(selectedComponent.value.x - component.x, 2) + Math.pow(selectedComponent.value.y - component.y, 2));
                if (distance < 50) { // 距离阈值，可以根据需要调整
                    targetTemplateComponent = component;
                }
            }
        });

        if (targetTemplateComponent) {
            // 执行替换操作
            replaceTemplateWithUser(selectedComponent.value, targetTemplateComponent);

            // 停止拖拽状态
            isDragging.value = false;

            // 重新绘制画布
            drawCanvas();
            return; // 退出函数
        }
    }
    if (isDragging.value && selectedComponent && selectedComponent.value.type === 'users') {
        // 判断是否拖拽到了 function 类型的组件附近
        let targetFunctionComponent = null;

        componentsOnCanvas.value.forEach(component => {

            if (component.type === 'function') {

                if (selectedComponent.value.x >= component.x - 30 &&
                    selectedComponent.value.x <= component.x + component.width + 30 &&
                    selectedComponent.value.y >= component.y - 30 &&
                    selectedComponent.value.y <= component.y + component.height + 30) { // 距离阈值，可以根据需要调整
                    targetFunctionComponent = component;
                }
            }
        });

        if (targetFunctionComponent) {
            // 将用户名加入到 function 组件的 users 列表中
            targetFunctionComponent.users.push(selectedComponent.value.value.username);
            connections.value.forEach((conn, index) => {
                if (conn.source === selectedComponent.value) {
                    conn.source = targetFunctionComponent
                }
                if (conn.target === selectedComponent.value) {
                    conn.target = targetFunctionComponent
                }
                if (conn.source === conn.target) {
                    connections.value.splice(index, 1)
                    ElMessage({ type: 'warning', message: '由于拖拽形成环路，连线删除' })
                }
            })
            componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);

            // 停止拖拽状态
            isDragging.value = false;

            // 重新绘制画布
            drawCanvas();
            return; // 退出函数
        }
    }
    if (isDragging.value && selectedComponent && selectedComponent.value.type === 'function') {



        // 判断是否拖拽到了 function 类型的组件附近
        let targetFunctionComponent = null;

        componentsOnCanvas.value.forEach(component => {
            if (component.type === 'function' && component != selectedComponent.value) {

                if (selectedComponent.value.x >= component.x - 30 &&
                    selectedComponent.value.x <= component.x + component.width + 30 &&
                    selectedComponent.value.y >= component.y - 30 &&
                    selectedComponent.value.y <= component.y + component.height + 30) {
                    if (selectedComponent.value.users.length === 0) {
                        ElMessage({ type: 'warning', message: '请至少在函数中填入一个用户' })
                        selectedComponent.value.x = currentX.value
                        selectedComponent.value.y = currentY.value
                        isDragging.value = false;
                        return
                    }// 距离阈值，可以根据需要调整
                    targetFunctionComponent = component;
                }
            }
        });

        if (targetFunctionComponent) {
            // 将用户名加入到 function 组件的 users 列表中
            // 将当前函数转为字符串并存储到目标函数的 users 中
            const userText = `( ${selectedComponent.value.users.join(', ')} )`;
            const funcToStr = `%c${selectedComponent.value.value}%c${userText}`;
            targetFunctionComponent.users.push(funcToStr);
            connections.value.forEach((conn, index) => {

                if (conn.source === selectedComponent.value) {
                    console.log('conn.source', conn.source);
                    conn.source = targetFunctionComponent
                }
                if (conn.target === selectedComponent.value) {
                    console.log('conn.target', conn.target);

                    conn.target = targetFunctionComponent
                }
                if (conn.source === conn.target) {

                    connections.value.splice(index, 1)
                    ElMessage({ type: 'warning', message: '由于拖拽形成环路，连线删除' })
                }
            })
            componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);

            // 停止拖拽状态
            isDragging.value = false;

            // 重新绘制画布
            drawCanvas();
            return; // 退出函数
        }
    }
    if (isDragging.value && selectedComponent.value && selectedComponent.value.type === 'operators') {
        const canvasRect = canvasRef.value.getBoundingClientRect();
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;
        if (selectedComponent.value.value === '(' || selectedComponent.value.value === ')') {
            // 检测是否将括号拖拽到用户组件上
            let isBracketAdded = false;
            componentsOnCanvas.value.forEach((component) => {
                if ((component.type === 'users' || component.type === 'function') && x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {

                    component.bracket = selectedComponent.value.value + component.bracket;  // 给组件增加括号
                    console.log('component.bracket', component.bracket);
                    isBracketAdded = true

                }
            });
            // 如果括号成功添加，重新绘制画布并返回
            if (isBracketAdded) {
                componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);
                isDragging.value = false; // 停止拖拽状态

                drawCanvas(); // 重新绘制画布，显示更新后的用户组件
                return;
            }
        }
        // 遍历所有连接线，检查是否将操作符拖拽到圆形按钮上
        connections.value.forEach(conn => {
            const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);
            const midX = (startPoint.x + endPoint.x) / 2;
            const midY = (startPoint.y + endPoint.y) / 2;
            const distance = Math.sqrt(Math.pow(x - midX, 2) + Math.pow(y - midY, 2));

            // 如果组件拖拽到圆形按钮上
            if (distance <= 30) { // 检测是否在圆形按钮范围内
                // 将圆形的“+”替换为操作符的 value
                conn.circleContent = selectedComponent.value.value;
                // console.log(conn.circleContent);
                // 删除掉该操作符组件
                componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);
            }
        });
    }

    isDragging.value = false; // 停止拖拽状态
    drawCanvas(); // 重新绘制画布

};
const replaceTemplateWithUser = (userComponent, templateComponent) => {
    // 移动用户组件到模板组件的位置和尺寸
    userComponent.x = templateComponent.x;
    userComponent.y = templateComponent.y;
    userComponent.width = templateComponent.width;
    userComponent.height = templateComponent.height;
    userComponent.bracket = templateComponent.bracket;

    // 从组件列表中删除模板组件
    componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== templateComponent);

    // 更新连接关系
    connections.value.forEach(conn => {
        if (conn.source === templateComponent) {
            conn.source = userComponent;
        }
        if (conn.target === templateComponent) {
            conn.target = userComponent;
        }
    });
};

// 绘制更加圆润的矩形
const drawRoundedRect = (ctx, x, y, width, height, radius) => {
    ctx.value.beginPath();
    ctx.value.moveTo(x + radius, y); // 从左上角开始

    // 直线到右上角
    ctx.value.lineTo(x + width, y);

    // 直线到右下角
    ctx.value.lineTo(x + width, y + height);

    // 圆弧到左下角
    ctx.value.arcTo(x, y + height, x, y + height - radius, radius);

    // 直线到左上角
    ctx.value.arcTo(x, y, x + radius, y, radius);

    ctx.value.closePath();
    ctx.value.fill(); // 填充矩形

};

// 设置 canvas 的尺寸和分辨率以防止模糊
const setCanvasResolution = () => {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');

    const devicePixelRatio = window.devicePixelRatio || 1;

    // 获取 canvas 的显示尺寸
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // 设置实际渲染尺寸，考虑设备像素比
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;

    // 缩放 canvas 以适应设备像素比
    ctx.scale(devicePixelRatio, devicePixelRatio);
}



const getUsers = async () => {
    await axios.post('/api/getAllUserPublic', queryFormUsers.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            // console.log(res)
            if (res.data.code === 1000) {
                currentUsersList.value = res.data.data.userList
                // console.log(currentUsersList.value);
                totalUser.value = res.data.data.total
            } else if (res.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                handleClose()
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
            }
            else {
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: msg,
                })
            }
        })


}



const findUser = (addr, index) => {
    var i
    const list = currentUsersList.value
    for (i = 0; i < list.length; i++) {
        //console.log(addr, list[i].nodeIp + ':' + list[i].nodePort)
        if (addr === list[i].nodeIp + ':' + list[i].nodePort) {
            //console.log(list[i])
            userInfoStore.value.userInfoList[index] = list[i]
            // console.log(userInfoStore.value.userInfoList[index])
        }
    }
}

const handleClose = () => {
    emits('update:modelValue', false)
}



/* watch(() => inputRefs.value.length, (newValue, oldValue) => {
     onsole.log(newValue, oldValue);
 
     f (newValue > oldValue) {
         onsole.log(newValue, oldValue, inputRefs.value);
         onst lastInput = inputRefs.value[inputRefs.value.length - 1];
         onsole.log(inputRefs.value.length - 1);
         onsole.log(lastInput);
         astInput && lastInput.focus(); // 新增输入框获取焦点
 
     
}) */
const handleNodeInfo = () => {
    let i
    sendForm.value.taskParams.nodeAddressList = []
    sendForm.value.taskParams.requireDataDescriptionList = []
    console.log(form.value.nodeInfo.length, sendForm.value.taskParams.nodeAddressList)
    for (i = 0; i < userSelectedList.value.length; i++) {
        sendForm.value.taskParams.nodeAddressList.push(userSelectedList.value[i].nodeIp + ':' + userSelectedList.value[i].nodePort)
        sendForm.value.taskParams.requireDataDescriptionList.push(userSelectedList.value[i].desc)

    }
}

const handleConfirm = () => {
    dialogLoading.value = true
    let inValidFlag = false
    groupedConnections.value.forEach(formula => {
        if (!validateFormula(formula)
        ) {
            inValidFlag = true
        }
    })
    if (inValidFlag === true) {
        ElMessage({ type: 'error', message: '存在不合法公式！' })
        dialogLoading.value = false
        return
    }
    /*     groupConnections.value.forEach(formula => {
            if (formula)
         }) */

    groupedFormulaUsers.value = [];
    // 初始化 uniqueGroupUserList
    uniqueGroupUserList.value = [];
    console.log('selsectedUserList.value', selsectedUserList.value);
    let isExsitFlag = false
    groupedConnections.value.forEach((formula) => {
        const formulaUsersInfo = [];
        const userLists = extractUsernamesWithFunc(formula);

        console.log('userLists', userLists);

        userLists.forEach((username) => {
            const user = selsectedUserList.value.find((userItem) => userItem.username === username);

            if (user) {
                formulaUsersInfo.push({
                    isReceiveResult: false,
                    nodeName: user.username,
                    nodeAddress: user.nodeIp + ':' + user.nodePort,
                    requireDataDescription: '',
                });
            } else {
                // 如果用户未找到，可以添加提示或处理逻辑
                isExsitFlag = true
                return
            }
        });

        groupedFormulaUsers.value.push({
            formula,
            users: formulaUsersInfo,
        });
    });
    if (isExsitFlag) {
        ElMessage({ type: 'warning', message: `存在非法用户，请重试` });
        dialogLoading.value = false
        return
    }
    taskInfoDialogVisible.value = true;

    //生成唯一不存在相同用户名的数组
    // 遍历 groupedFormulaUsers 中的每个对象
    uniqueGroupUserList.value = groupedFormulaUsers.value.map(group => {
        const uniqueUsers = [];

        group.users.forEach(user => {
            // 检查 uniqueUsers 中是否已存在相同 nodeName 的用户
            const existingUser = uniqueUsers.find(u => u.nodeName === user.nodeName);

            if (existingUser) {
                // 如果存在，合并 requireDataDescription
                if (!Array.isArray(existingUser.requireDataDescription)) {
                    existingUser.requireDataDescription = [existingUser.requireDataDescription];
                }
                existingUser.requireDataDescription.push(user.requireDataDescription);
            } else {
                // 如果不存在，直接添加用户对象，但 requireDataDescription 初始化为数组
                uniqueUsers.push({
                    ...user,
                    requireDataDescription: [user.requireDataDescription]
                });
            }
        });

        return {
            formula: group.formula,
            users: uniqueUsers
        };
    });

    console.log('groupedFormulaUsers.value', groupedFormulaUsers.value);
    console.log('uniqueGroupUserList.value', uniqueGroupUserList.value);
};
const checkFormulaType = (formula) => {
    // 转换为小写，确保不区分大小写匹配
    const lowerCaseFormula = formula.toLowerCase();
    // 检查是否包含 "max" 或 "min"
    if (lowerCaseFormula.includes("max")) {
        return "max";
    } else if (lowerCaseFormula.includes("min")) {
        return "min";
    } else if (lowerCaseFormula.includes("max_value")) {
        return "max_value";
    } else if (lowerCaseFormula.includes("min_value")) {
        return "min_value";
    }
    else {
        return "arithmetic";
    }
}
function normalizeString(input) {
    // 转换为小写，并移除所有空格
    return input.toLowerCase().replace(/\s+/g, "");
}
const submitTaskInfo = async () => {
    if (!taskInfoForm.value.taskName || !taskInfoForm.value.taskType) {
        ElMessage({
            type: 'warning',
            message: '请填写完整的任务信息',
        });
        return;
    }
    sendForm.value.taskName = taskInfoForm.value.taskName
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.createTime = nowDate(time)
    sendForm.value.taskDescription = taskInfoForm.value.taskDescription
    // 关闭对话框
    taskInfoDialogVisible.value = false;
    // 遍历 groupedFormulaUsers 的每个元素
    /*     groupedFormulaUsers.value.forEach((group, groupIndex) => {
            // 找到 uniqueGroupUserList 中对应的对象
            const uniqueGroup = uniqueGroupUserList.value.find(
                unique => unique.formula === group.formula
            );
    
            // 如果找到对应的 uniqueGroup
            if (uniqueGroup) {
                // 遍历当前 group 中的 users 数组
                group.users.forEach((user, userIndex) => {
                    // 根据 nodeName 在 uniqueGroup.users 中找到对应的 user
                    const uniqueUser = uniqueGroup.users.find(
                        uniqueUser => uniqueUser.nodeName === user.nodeName
                    );
    
                    // 如果找到对应的 uniqueUser，将 uniqueUser 的值赋给当前 user
                    if (uniqueUser) {
                        group.users[userIndex] = { ...uniqueUser };
                    }
                });
            }
        }); */
    mergeUniqueToGrouped()
    console.log('groupedFormulaUsers.value', groupedFormulaUsers.value);
    //针对每个公式，进行共同的参数复制
    groupedFormulaUsers.value.forEach((formulaInfo, index) => {
        const taskParams = ref({
            taskId: '',
            taskName: '',
            mapString: '',
            nodeNum: 0,
            nodeInfoList: [],
        })
        taskParams.value.taskId = sendForm.value.taskUuid
        taskParams.value.mapString = normalizeString(formulaInfo.formula)
        taskParams.value.nodeNum = formulaInfo.users.length
        formulaInfo.users.forEach((user) => {
            taskParams.value.nodeInfoList.push(user)
            console.log(user);
        })
        //针对用户的选择，以及公式对taskName参数进行操作
        console.log('formulaInfo', formulaInfo);
        taskParams.value.taskName = checkFormulaType(formulaInfo.formula)
        //将taskParams.value推入到数组中
        console.log('taskParams.value', taskParams.value);
        sendForm.value.taskParams.push(taskParams.value)
    })
    //在只有一个公式的情况之下，taskParams目前还是一个对象需重新赋值
    const taskParams = sendForm.value.taskParams[0]
    delete sendForm.value.taskParams
    sendForm.value.taskParams = taskParams
    console.log(' sendForm.value', sendForm.value);
    sendForm.value.taskParams.nodeInfoList.forEach(node => {
        node.uuid = SomeTools.guid()
    })
    //发起任务
    await axios.post(
        '/api/MPC/createTask', sendForm.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '任务发起成功'
                })
                emits('initTaskList')
                emits('initMyInivList')
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
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: '任务发起失败'
                })
            }
            sendForm.value = {
                taskName: '',
                taskUuid: '',
                createTime: '',
                taskDescription: '',
                taskParams: [],
            }
        })

};
onMounted(async () => {
    getUsers()
    console.log("Mounted and setting dialogVisible to true.");
    console.log("Dialog opened, checking canvas...");
    console.log(window.devicePixelRatio);
    await nextTick(); // 确保 DOM 更新完成

    // 输出 canvas DOM 元素的引用状态
    console.log("canvasRef value after nextTick:", canvasRef.value);
    setCanvasResolution()
    if (canvasRef.value) {
        ctx.value = canvasRef.value.getContext('2d');
        drawCanvas(); // 初次绘制画布
    } else {
        console.error('Canvas element not found');
    }
    // 确保所有 DOM 操作完成
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas); // 窗口大小变化时重新调整 canvas 尺寸
    window.addEventListener('keydown', keydownHandler);
    window.addEventListener('keyup', keyupHandler);

})
// 移除 resize 监听器
onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeCanvas);
    window.removeEventListener('keydown', keydownHandler);
    window.removeEventListener('keyup', keyupHandler);
});
</script>

<style lang="scss" scoped>
/* 主容器使用 Flexbox 布局 */
.app {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    height: 100vh;
    min-width: 0;
    /* 允许容器缩小到比内容小的宽度 */

    /* 让布局充满整个视口高度 */
}

/* 左侧和右侧的 sidebar */
.sidebar {
    width: 15%;
    height: 100%;
    /* 侧边栏的宽度 */
    background-color: #f5f5f5;
    padding: 20px;
    display: flex;
    flex-wrap: wrap;
    /* 允许项目换行 */
    justify-content: space-between;
    /* 让内容靠左对齐 */
    align-content: flex-start;
    /* 控制行与行之间的对齐方式 */
}

/* 左侧侧边栏 */
.sidebar.left {
    padding: 0;
    width: 15%;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
}

.sidebar.right {
    width: 18%;
    padding: 8px;
    align-items: center
}

.search-user {
    box-sizing: border-box;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    height: 10%;
}


/* 侧边栏的每个部分 */
.sidebar-section {
    width: 100%;

    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    height: 33.3%;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-container {
    overflow-y: auto;
    overflow-x: hidden;
    height: 85%;
}

.sidebar-section:last-child {
    box-shadow: none;
}

// 在 CSS 中定义一个类
.overflow-x-auto {

    overflow-x: auto;
}

// 在 CSS 中定义一个类
.overflow-y-auto {

    overflow-y: auto;
}

/* 标题样式 */
.sidebar-title {
    width: 100%;
    font-weight: bold;
    font-size: 16px;
    text-align: center;
    margin-bottom: 10px;

}

/* 不同部分的背景色 */
.operators-section {
    width: 100%;

    background-color: #e8f4fc;
}

.templates-section {
    width: 100%;
    background-color: #f9f0e6;
}

.components-section {
    width: 100%;
    background-color: #e6f9ec;
}

/* 列表样式 */
.operator-list,
.template-list,
.component-list {
    flex: 1;
    overflow-y: auto;
}

.operator-list {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
}



/* 列表项样式 */
.operator-item,
.template-item,
.component-item {
    width: 100%;

    padding: 10px;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    margin-bottom: 5px;
    text-align: center;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);

    cursor: pointer;
    transition: transform 0.2s;
}

.template-item {
    background-color: #fff7e6;
    /* 浅橙色，与模板部分背景色匹配 */
    border: 1px solid #ffd591;
    border: none;
    /* 边框颜色稍深 */
}


.component-item {
    padding: 10px;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    text-align: center;
    border: none;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    /* 添加阴影使其更美观 */
    transition: transform 0.2s;
}

.formula-item {
    padding: 10px;
    background-color: #f6ffed;
    /* 浅绿色，与公式部分背景色匹配 */
    border: 1px solid #b7eb8f;
    /* 边框颜色稍深 */
    text-align: center;
    font-size: 12px;
    margin-bottom: 5px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    /* 添加阴影使其更美观 */
    transition: transform 0.2s;
    text-overflow: ellipsis;

}

.operator-item:hover,
.template-item:hover,
.component-item:hover {
    transform: scale(1.05);
}

.formula-item:hover {
    transform: scale(1.05);
}

/* 右侧侧边栏 */
.sidebar.right {
    padding: 8px;
    background-color: #f5f5f5;
    justify-content: center;
    justify-items: center;
    align-items: center;
    overflow-y: auto;
}

/* 用户列表项样式 */
.user-item {
    width: 100%;
    padding: 10px;
    background-color: #ffffff;
    /* 与侧边栏背景色有轻微对比 */
    margin-bottom: 5px;
    text-align: center;
    font-size: 14px;
    color: #333;
    /* 深灰色字体 */
    cursor: pointer;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
    /* 轻微阴影 */
    transition: transform 0.2s;
}

.user-item:hover {
    transform: scale(1.02);
    background-color: #e6f7ff;
    /* 悬停时背景色变为浅蓝色 */
}

/* 添加底部边框阴影 */
.sidebar-section {
    position: relative;
}

.sidebar-section::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 5px;
    box-shadow: 0 5px 5px -5px rgba(0, 0, 0, 0.2);
}

.sidebar-section:last-child::after {
    display: none;
}

/* 侧边栏滚动条美化（可选） */
.sidebar-section::-webkit-scrollbar {
    width: 6px;
}

.sidebar-section::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.context-menu {
    position: absolute;
    background-color: transparent;
    z-index: 1000;

    /* 菜单宽度 */
}

.operator-item {
    width: 30%;

    box-sizing: border-box;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    text-align: center;
    font-size: 18px;
    cursor: pointer;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    /* 添加阴影使其更美观 */
    transition: transform 0.2s;
    /* 增加拖拽效果 */
}

.operator-item:hover {
    transform: scale(1.05);
    /* 鼠标悬停时稍微放大 */
}



canvas.connecting {
    cursor: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" height="32" width="32"><path d="M2 16h28M16 2v28" stroke="black" stroke-width="2" stroke-linecap="round"/></svg>'), auto;
}

/* 上部功能栏 */
.toolbar {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    /* 垂直居中 */
    background-color: #fff;
    padding: 10px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    height: 50px;
}

.left-buttons,
.right-buttons {
    display: flex;
    gap: 5px;
    /* 按钮之间的间距 */
}

.right-buttons {
    margin-left: auto;
    /* 将右侧按钮组推到右边 */
}

.selectedComponet {
    padding: 0;
    height: 50px;
    width: 67%;
    margin: 0 auto;
    margin-left: 7px;
    background-color: rgb(221, 209, 209);
    display: flex;
    color: white;
    justify-content: center;
    background-color: #f0f0f0;
    /* 淡灰色背景 */
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 10px;

    /* 过渡效果，持续时间为0.5秒 */

}

.selectedComponent-user,
.selectedComponent-operators,
.selectedComponent-conn {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
    /* 为内部元素添加过渡效果 */

}

.selectedComponent-func {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;
}

/* 定义淡入淡出的过渡效果 */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}

.fade-enter-to {
    opacity: 1;
    transform: translateY(0);
}

.fade-leave {
    opacity: 1;
    transform: translateY(0);
}

.fade-leave-active {
    opacity: 0;
    transform: translateY(10px);
}

/* 下部展示区域 */
.display-area {

    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    /* 允许垂直滚动 */



    .area-btn {
        width: 100%;

        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
        border-radius: 15px;
        border: 0;
        display: flex;
        flex-direction: column;
        /* 让子元素垂直排列，每行一个公式 */
        justify-content: center;
        /* 从顶部开始排列 */
        align-items: center;
        /* 水平居中 */
        text-align: center;
        /* 垂直居中 */
        background-color: #d9ecff;
        color: black;
        font-style: italic;
        overflow-y: auto;
        /* 允许垂直滚动 */
        /* 允许文字换行 */



    }
}

.formula-show {
    width: 100%;
    /* 自动换行 */
}

.canvas-area {
    flex: 1 1 auto;
    min-width: 0;
    /* 防止内容溢出 */
    display: flex;
    flex-direction: column;
}

/* 中间的 canvas 区域 */
.canvas-container {
    width: 100%;
    height: 100%;
    /* 中间区域占据剩余空间 */
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;

    /* 显示滚动条 */
    /* 垂直滚动条 */
    overflow: hidden;
    /* 允许滚动 */


}

.canvas {


    box-sizing: border-box;

    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;

}

// 在 CSS 中定义一个类
.overflow-x-auto {

    overflow-x: auto;
}

// 在 CSS 中定义一个类
.overflow-y-auto {

    overflow-y: auto;
}

.form input.el-input_inner {
    border: none;
}


.card {
    margin: 5px;
    border-radius: 10px;
    height: 100px;
    width: 200px;
}

.driver {

    width: 100%;
    height: 2px;
    background-color: #fff;
    background-image: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);
    background-size: 30px 30px;
    transform: skewX(35deg);
    margin: 10px 0;
}


.card:hover {
    cursor: pointer;
}

.card-selected {
    height: 120px;
    border: none;
}

.card-unsel {
    margin: 0px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all .5s ease, transform 0.5s ease;
}

.fade-enter,
.fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
}

.container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

}

.dragging {
    /* 设置被拖拽元素的样式 */
    background-color: #d1ecf1;
    border-color: #17a2b8;
    opacity: 0.6;
    transition: width 2s, height 2s, background-color 1s;

}



.desc-input {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 5px;
}

.search-input {
    margin: 15px;
    width: 140px;
    border: none;
    border-bottom: 1px solid black;
    background-color: transparent;
    text-overflow: ellipsis;
    font-size: 14px;
}

.search-input:focus {
    border: none;
    border-bottom: 1px solid black;
    outline: none;
}

.desc-input:focus {
    border: none;
    border-bottom: 1px solid white;
    outline: none;
}

.user {
    width: 240px;
    background-color: #ecf5ff;
    transition: all .3s ease;
}

.user-selected {
    width: 700px;
    margin-right: 10px;
    background-image: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
    transition: all .3s ease;
}

/* 如果您使用的是 scoped 样式，需要使用 ::v-deep 进行深度选择 */
::v-deep .el-dialog__header {
    display: none;
}

.el-card {
    --el-card-padding: 10px;
}

.el-dialog {
    --el-dialog-width: 50%;
    --el-dialog-margin-top: 15vh;
    --el-dialog-bg-color: red;
    --el-dialog-box-shadow: var(--el-box-shadow);
    --el-dialog-title-font-size: var(--el-font-size-large);
    --el-dialog-content-font-size: 14px;
    --el-dialog-font-line-height: var(--el-font-line-height-primary);
    --el-dialog-padding-primary: 16px;
    --el-dialog-border-radius: var(--el-border-radius-small);
    background: var(--el-dialog-bg-color);
    border-radius: var(--el-dialog-border-radius);
    box-shadow: var(--el-dialog-box-shadow);
    box-sizing: border-box;
    margin: var(--el-dialog-margin-top, 15vh) auto 50px;
    overflow-wrap: break-word;
    padding: var(--el-dialog-padding-primary);
    position: relative;
    width: var(--el-dialog-width, 50%);
}


.vuedraggable .card {
    background-color: white;
}

.vuedraggable .card.dragging {
    background-color: #f0f0f0;
    /* 拖动时改变背景 */
    opacity: 0.7;
}

::v-deep .el-dialog__header {
    display: none;
}

::v-deep.myinput {
    display: flex;
}

::v-deep.el-pagination {

    //padding-top: 5px;
    box-sizing: border-box;
    justify-content: center;

    .el-card {
        box-shadow: 0 0 10px black;
    }

    .el-pager li {
        padding: 0;
    }

    .el-pager li.is-active {
        color: #337ecc;
        cursor: default;
        font-size: 14px;
        font-weight: normal;
        font-weight: 500;

    }
}




/* 移除对话框主体的内边距 */
::v-deep.el-dialog {
    --el-dialog-padding-primary: 0;
    /* 将主内边距设置为 0 */
}

.el-select-dropdown__item.is-hovering {
    background-color: #d9ecff;
}

.el-select-dropdown__item.is-selected {
    color: rgb(37, 192, 37);
    font-weight: normal;
    background-color: #d9ecff;
    opacity: 1;

}


.el-select:focus {
    .el-select__selected-item {
        font-weight: 900;
        color: black;
    }

}

.add-template-but svg {
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
}
</style>
