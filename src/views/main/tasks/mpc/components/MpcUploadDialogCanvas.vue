<template>

    <el-dialog class="dialog" :model-value="dialogVisible" width="auto" @close="handleClose" @opened="onDialogOpened"
        append-to-body>
        <!-- 功能按钮栏，仅当选中组件时显示 -->
        <div class="toolbar">
            <div class="left-buttons">
                <el-button :disabled="!selectedComponent" type="primary" @click="connectComponent">连接</el-button>
                <el-button :disabled="!selectedComponent" type="danger" @click="deleteComponent">删除</el-button>
                <el-button :disabled="!selectedComponent" type="warning" @click="moveToTop">置顶</el-button>
            </div>

            <div class="right-buttons">
                <!--                 <el-button color="#626aef" @click="handleConfirm">发起</el-button> -->
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


                <!-- 组件信息栏 -->
                <div class="sidebar-section components-section">
                    <div class="sidebar-title">公式</div>
                    <div class="component-list">
                        <div v-for="(formula, index) in groupedConnections" :key="index" class="formula-item"
                            draggable="true">
                            {{ formula }}
                        </div>
                    </div>
                </div>
                <!-- 公式模版栏 -->
                <div class="sidebar-section templates-section">
                    <div class="sidebar-title">公式模版</div>
                    <div class="template-list">
                        <div v-for="(template, index) in formulaTemplates" :key="index" class="template-item"
                            draggable="true" @dragstart="onDragStartTemplate(template)">
                            {{ template.content }}
                        </div>
                    </div>
                </div>

            </div>
            <div class="canvas-area">
                <!-- 画布区域 -->
                <div class="canvas-container">
                    <canvas ref="canvasRef" @drop="onDrop" @click="onCanvasClick" @contextmenu.prevent="onRightClick"
                        width="800" height="700" @dragover.prevent @mousedown="onMouseDown" @mousemove="onMouseMove"
                        @mouseup="onMouseUp" :class="{ 'connecting': isConnecting }"></canvas>

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
                <div v-for="(component, index) in currentUsersList" :key="index" class="user-item" draggable="true"
                    @dragstart="onDragStart(component)">
                    {{ component.username }}
                    {{ component.nodeIp }}:{{ component.nodePort }}

                </div>
            </div>

        </div>
        <!-- 将预览对话框移到外部 -->
        <el-dialog v-model="isPreviewVisible" width="50%">
            <img :src="previewImage" alt="Canvas Preview" style="max-width: 100%" />
        </el-dialog>
    </el-dialog>


</template>
<script setup>
import { nowDate } from '../../date'
import SomeTools from '@/utils/someTools'
import { ElMessage, ElDrawer, ElMessageBox } from 'element-plus';
import axios from 'axios'
import { Transition, onMounted, ref, watch, nextTick, onBeforeUnmount, computed } from 'vue';



// 定义用户组件的状态变化控制
const animationState = new Map();  // 存储每个组件的动画状态

// 定义初始和目标状态
const initialScale = 1; // 初始缩放比例
const targetScale = 1.02; // 悬停时的目标缩放比例

const initialColor = '#f0f8ff'; // 初始背景色
const hoverColor = '#e6f7ff'; // 悬停时的背景色

// 渐变动画的时间
const transitionDuration = 300; // 过渡时间 300ms

// 线性插值函数，用于计算颜色和尺寸的渐变
const lerp = (start, end, t) => start + (end - start) * t;
// 公式模版列表
const formulaTemplates = ref([
    { name: '模版一', content: '(A + B) * C' },
    // 可以根据需要添加更多模版
]);
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
const previewImage = ref('');  // 用于存储预览的图片
const isPreviewVisible = ref(false);  // 控制预览弹窗的显示与隐藏
const canvasRef = ref(null); // 引用 canvas DOM
const ctx = ref(null); // 保存 Canvas 的上下文
const draggingComponent = ref(null); // 当前拖拽的组件
const componentsOnCanvas = ref([]); // 画布中的组件
const dragging = ref(false); // 是否处于拖动状态
const dragOffset = ref({ x: 0, y: 0 }); // 拖动的偏移量
const selectedComponent = ref(null); // 当前选中的组件
const operators = ref(['+', '-', '*', '/', '(', ')']);
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
// 上下文菜单控制
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
const emits = defineEmits(['update:modelValue', 'initTaskList'])
const userSelectedList = ref([])
const totalUser = ref(0)
const mapUserInfo = new Map();
const totalDataSource = ref(0)
const currentDatasourceList = ref([])
const isRealSourceConn = ref([])
const userInfoStore = ref({
    userInfoList: []
})
const formBasic = ref({
    taskName: '',
    taskDescription: '',

})
const map = new Map();
const inputRefs = ref([]);
const taskBasicInfoShow = ref(false)
const currentUsersList = ref([])
const queryFormUsers = ref({
    queryName: '',
    page: 1,
    pageSize: 8,
})
const formLabelWidth = '80px'
let connId = 0
let timer
const table = ref(false)
const dialog = ref(false)
const loading = ref(false)
const currentCanvasInfo = ref('')
const form = ref({
    taskName: '',
    taskDescription: '',
    nodeNum: 1,
    nodeInfo: [{
        nodeAddress: '',
        dataSourceDesc: ''
    }],
})
const queryFormDataSource = ref({
    queryName: '',
    page: 1,
    pageSize: 10,
    targetUserId: null,
})
const sendForm = ref({
    taskName: '',
    taskUuid: '',
    createTime: '',
    taskDescription: '',
    taskParams: {
        taskId: '',
        taskName: '',
        nodeNum: 1,
        nodeAddressList: [],
        requireDataDescriptionList: [],
    }
})
const onClick = () => {
    loading.value = true
    setTimeout(() => {
        handleConfirm()
        loading.value = false
        dialog.value = false

    }, 400)
}
const pointToLineDistance = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    const param = len_sq !== 0 ? dot / len_sq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
};
const addConnectionAsComponent = (x, y) => {
    const tolerance = 5; // 允许的点击距离误差
    let clickedConnection = null;

    // 遍历所有 connections，检查是否点击了某条连接线
    connections.value.forEach((conn) => {
        const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);

        // 计算点到线段的距离
        const distance = pointToLineDistance(x, y, startPoint.x, startPoint.y, endPoint.x, endPoint.y);

        // 如果距离小于容差，说明点击了这条线
        if (distance <= tolerance) {
            clickedConnection = conn;

            // 在连接线的中点添加组件
            const midX = (startPoint.x + endPoint.x) / 2;
            const midY = (startPoint.y + endPoint.y) / 2;

            const newComponent = {
                type: 'operator',
                value: conn.circleContent || '+', // 操作符（如果有的话）
                x: midX - 25, // 设置为合理的组件位置
                y: midY - 25,
                width: 50,
                height: 50,
            };

            // 将新组件加入画布
            componentsOnCanvas.value.push(newComponent);
            selectedComponent.value = newComponent; // 选中新组件

            drawCanvas(); // 重新绘制画布
        }
    });
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
    if ((event.key === 'Control' || event.key === 'Meta') && selectedComponent && selectedComponent.value.type === 'users') {
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
    if (selectedComponent && selectedComponent.value.type == 'users') {
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
        selectedComponent.value.type == 'users' &&
        targetComponent.type == 'users' &&
        selectedComponent.value !== targetComponent
    ) {
        // 检查是否会形成环
        if (wouldCreateCycle(selectedComponent.value, targetComponent)) {
            ElMessage({
                type: 'error',
                message: '不能形成环路连接！',
            });
            isConnecting.value = false; // 退出连接模式
            return;
        }

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
        selectedComponent.value = targetComponent;
        drawCanvas();
    }
};


const onDragStart = (component) => {
    // 记录当前拖拽的组件类型
    draggingComponent.value = component;
    // console.log(onDragStart, component);
};

const onDrop = (event) => {
    // 确保 canvas 已经挂载并渲染
    if (canvasRef.value) {

        const canvasRect = canvasRef.value.getBoundingClientRect();
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;
        //console.log(draggingComponent.value);
        ctx.value.font = '16px Arial'
        // 根据拖拽的类型创建组件
        let newComponent;
        if (operators.value.includes(draggingComponent.value)) {
            newComponent = {
                type: 'operators',
                value: draggingComponent.value,
                x,
                y,
                width: 50,
                height: 50,

            };
            if (draggingComponent.value === '(' || draggingComponent.value === ')') {
                // 检测是否将括号拖拽到用户组件上
                let isBracketAdded = false;
                componentsOnCanvas.value.forEach((component) => {
                    if (component.type === 'users' && x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {
                        if (draggingComponent.value === '(' || draggingComponent.value === ')') {
                            component.bracket = draggingComponent.value;  // 给组件增加括号
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
    // 删除与该组件相关的所有连接
    connections.value = connections.value.filter(conn => conn.source !== selectedComponent.value && conn.target !== selectedComponent.value);

    componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);
    //console.log(componentsOnCanvas.value);
    selectedComponent.value = null;
    hideContextMenu();
    drawCanvas(); // 重新绘制画布
};

// 置顶组件
const moveToTop = () => {
    if (!selectedComponent.value) return;

    // 将组件移到数组末尾（表示在最顶层绘制）
    componentsOnCanvas.value = componentsOnCanvas.value.filter(component => component !== selectedComponent.value);


    componentsOnCanvas.value.push(selectedComponent.value);

    hideContextMenu();
    drawCanvas(); // 重新绘制画布
}

// 画布网格背景绘制
const drawGrid = () => {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext('2d');
    const gridSize = 20;

    // 绘制网格
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }

    ctx.stroke();
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
// 检查鼠标是否悬停在圆形按钮上
const hoverButton = (midX, midY, radius) => {
    const canvasRect = canvasRef.value.getBoundingClientRect();
    const mouseX = currentMousePosition.x - canvasRect.left;
    const mouseY = currentMousePosition.y - canvasRect.top;

    const distance = Math.sqrt(Math.pow(mouseX - midX, 2) + Math.pow(mouseY - midY, 2));

    return distance <= radius;
};
// 绘制连接线
const drawConnections = () => {
    isRealSourceConn.value = []
    groupedConnections.value = []
    ctx.value.lineWidth = 2;
    ctx.value.strokeStyle = '#4682b4'; // 线条颜色
    ctx.value.fillStyle = '#4682b4'; // 箭头颜色
    currentCanvasInfo.value = ''
    // 使用方法
    // 示例 usage



    groupConnections(connections)
    getFormulaGroup(isRealSourceConn.value)
    console.log(groupedConnections.value);
    connections.value.forEach(conn => {
        if (conn.target) {
            //console.log(conn.source);
            const { startPoint, endPoint } = findClosestEdgePoints(conn.source, conn.target);

            // 绘制带箭头的连接线，并在中间嵌入圆形按钮

            drawArrowLine(startPoint.x, startPoint.y, endPoint.x, endPoint.y, conn.circleContent);
        }

    });
};

const getFormulaGroup = (isRealSourceConns) => {
    isRealSourceConns.forEach((isRealSourceConn) => {
        let currConn = isRealSourceConn
        let formulaLine = ''
        let finalConn = currConn
        console.log(currConn.source.value.username, noTarget(currConn));
        if (currConn.source.bracket === '(') {
            formulaLine = formulaLine + currConn.source.bracket
        }
        currConn.circleContent === undefined ? currConn.circleContent = '+' : currConn.circleContent
        formulaLine = formulaLine + currConn.source.value.username
        if (currConn.source.bracket === ')') {
            formulaLine = formulaLine + currConn.source.bracket
        }
        formulaLine = formulaLine + currConn.circleContent
        while (!noTarget(currConn)) {

            currConn = findNextConn(currConn)
            console.log('currConn', currConn);
            if (currConn === undefined) {
                break
            }
            finalConn = currConn
            if (currConn.source.bracket === '(') {
                formulaLine = formulaLine + currConn.source.bracket
            }
            currConn.circleContent === undefined ? currConn.circleContent = '+' : currConn.circleContent
            formulaLine = formulaLine + currConn.source.value.username
            if (currConn.source.bracket === ')') {
                formulaLine = formulaLine + currConn.source.bracket

            }
            formulaLine = formulaLine + currConn.circleContent


        }
        if (finalConn.target.bracket === '(') {
            formulaLine = formulaLine + finalConn.target.bracket

        }
        formulaLine = formulaLine + finalConn.target.value.username
        if (finalConn.target.bracket === ')') {
            formulaLine = formulaLine + finalConn.target.bracket

        }
        groupedConnections.value.push(formulaLine)
    })
    //console.log(groupedConnections.value);
}
const noTarget = (goalConn) => {
    let flag = true
    connections.value.forEach((conn) => {
        if (conn.source === goalConn.target && conn.connId != goalConn.connId) {
            console.log(conn.source.value.username, goalConn.target.value.username);
            flag = false
        }
    })
    return flag
}
let findNextConn = (currConn) => {
    let tempConn = undefined
    connections.value.forEach((conn) => {
        console.log(conn.source.value.username, currConn.target.value.username);
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


const drawCanvas = () => {
    if (!ctx.value) return;

    const canvas = canvasRef.value;
    const devicePixelRatio = window.devicePixelRatio || 1;

    // 在每次绘制前重新设置缩放
    ctx.value.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    // 清除画布
    ctx.value.clearRect(0, 0, canvas.width / devicePixelRatio, canvas.height / devicePixelRatio);
    ctx.value.fillStyle = '#f5deb3'; // 米黄色
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


        if (component.type != 'operators') {

            // 设置背景和边框

            ctx.value.lineWidth = 1;

            // 绘制用户组件的圆角矩形
            drawRoundedRect(ctx, component.x, component.y, component.width, component.height, 10); // 圆角矩形

            // 绘制竖线
            const lineMargin = 8; // 上下空隙
            ctx.value.fillStyle = '#c6e2ff'; // 亮白色
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
            // 如果组件有括号，则在组件外部绘制括号并突出显示
            if (component.bracket) {
                ctx.value.font = '20px Arial bold'; // 更大的字体
                ctx.value.fillStyle = 'red'; // 突出的颜色
                ctx.value.textAlign = 'center';
                ctx.value.textBaseline = 'middle';

                if (component.bracket === '(') {
                    ctx.value.fillText(component.bracket, component.x - 15, component.y + component.height / 2); // 左侧括号
                } else if (component.bracket === ')') {
                    ctx.value.fillText(component.bracket, component.x + component.width + 15, component.y + component.height / 2); // 右侧括号
                }
            }
        } else {

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




        }
        // 如果该组件被选中，绘制选中框
        /*         if (selectedComponent.value === component) {
                    drawSelectionBox(ctx, component);
                } */
    });
    // 绘制连接线
    drawConnections();
    // 绘制选中框
    if (selectedComponent.value) {
        ctx.value.strokeStyle = 'red';
        ctx.value.lineWidth = 2;
        ctx.value.strokeRect(selectedComponent.value.x - 5, selectedComponent.value.y - 5, selectedComponent.value.width + 10, selectedComponent.value.height + 10);
    }
    currentCanvasInfo.value = ''
    connections.value.forEach((conn, index) => {
        // console.log(conn.circleContent);

        if (conn.circleContent === undefined) {
            currentCanvasInfo.value = currentCanvasInfo.value + ' ' + conn.source.value.username + '__' + ' ' + conn.target.value.username

        } else {
            currentCanvasInfo.value = currentCanvasInfo.value + ' ' + conn.source.value.username + '__' + ' ' + conn.target.value.username

        }
    })

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

const onCanvasClick = (event) => {
    hideContextMenu(); // 隐藏上下文菜单

    const canvasRect = canvasRef.value.getBoundingClientRect();
    const x = event.clientX - canvasRect.left;
    const y = event.clientY - canvasRect.top;
    // 检测是否点击了连接线，并将其作为组件添加
    addConnectionAsComponent(x, y);

    let clickedComponent = null;

    // 检查是否点击了某个组件
    componentsOnCanvas.value.forEach(component => {
        if (x >= component.x && x <= component.x + component.width && y >= component.y && y <= component.y + component.height) {
            clickedComponent = component;
        }
    });

    // 如果处于连接模式，且点击了第二个组件，则完成连接
    if (isConnecting.value && clickedComponent && clickedComponent.type == 'users') {
        completeConnection(clickedComponent);

    } else if (isCtrlOrCmdPressed.value && selectedComponent.value && clickedComponent && clickedComponent.type === 'users') {
        // console.log(isCtrlOrCmdPressed.value);
        completeConnection(clickedComponent); // 直接连接选中的组件和当前点击的组件

    }
    else {
        // 正常选择组件
        isConnecting.value = false
        selectedComponent.value = clickedComponent;
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
    if (isDragging.value && selectedComponent.value && selectedComponent.value.type === 'operators') {
        const canvasRect = canvasRef.value.getBoundingClientRect();
        const x = event.clientX - canvasRect.left;
        const y = event.clientY - canvasRect.top;

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
    axios.post('https://120.48.18.15:7000/api/getAllUser', queryFormUsers.value
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

const handleConfirm = async () => {
    const temp = sendForm.value
    console.log(form.value.nodeInfo)
    sendForm.value.taskName = formBasic.value.taskName
    sendForm.value.taskParams.nodeNum = userSelectedList.value.length
    sendForm.value.taskParams.taskName = "carbon_green_life"
    sendForm.value.taskUuid = SomeTools.guid()
    sendForm.value.taskDescription = formBasic.value.taskDescription
    sendForm.value.taskParams.taskId = sendForm.value.taskUuid
    sendForm.value.createTime = nowDate(time)
    handleNodeInfo()
    console.log(sendForm.value, userSelectedList.value)

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
                handleClose()
            }
            else {
                const msg = res.message
                ElMessage({
                    type: 'error',
                    message: '任务发起失败'
                })
            }
        })


}

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

    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
}

.sidebar.right {
    padding: 8px;
    overflow-y: auto;

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

.sidebar-section:last-child {
    box-shadow: none;
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
    overflow-y: auto;
    background-color: #f5f5f5;

    justify-content: center;
    justify-items: center;
    align-items: center;


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
    width: 48%;
    /* 每行显示两个，占据一半宽度 */
    margin-bottom: 10px;
    padding: 10px;
    background-color: #e6f7ff;
    border: 1px solid #91d5ff;
    text-align: center;
    font-size: 24px;
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

/* 中间的 canvas 区域 */
.canvas-container {

    height: 100%;
    /* 中间区域占据剩余空间 */
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;


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

canvas {
    width: 100%;
    height: 100%;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;

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
    width: 120px;
    border: none;
    background-color: transparent;
    text-overflow: ellipsis;

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
</style>
