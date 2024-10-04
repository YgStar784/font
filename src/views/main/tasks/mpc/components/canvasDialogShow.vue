<template>
    <el-dialog title="画布展示" @open="handleOpen" v-model="canvasShowDialogValue" height="500" @close="handleClose"
        width="1000" append-to-body>
        <!-- 画布区域 -->
        <!--         <div class="icon-description">
            <el-tag closable> <span>
                    <img :src="waitIcon.src" alt="待处理" width="20" height="20"> 待处理，
                    <img :src="SuccessIcon.src" alt="已接受" width="20" height="20"> 已接受，
                    <img :src="RefuseIcon.src" alt="已拒绝" width="20" height="20"> 已拒绝
                </span></el-tag>
        </div> -->
        <div ref="canvasDiv" class="canvas-container" v-loading="loading" element-loading-text="Loading..."
            :element-loading-spinner="svg" element-loading-svg-view-box="-10, -10, 50, 50"
            element-loading-background="rgba(122, 122, 122, 0.8)">
            <canvas ref="canvasRef" width="3600" height="1800" class="canvas" @drop="onDrop" @click="onCanvasClick"
                @contextmenu.prevent="onRightClick" @dragover.prevent @mousedown="onMouseDown" @mousemove="onMouseMove"
                @mouseup="onMouseUp" :class="{ 'connecting': isConnecting }"></canvas>


        </div>
    </el-dialog>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue';
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { extractUsernamesAndBracket, extractOperators } from '@/utils/utils'
import { log } from 'mathjs';
const ctx = ref(null); // 保存 Canvas 的上下文
const formulaInfo = ref({})
const componentsOnCanvas = ref([])
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const isRealSourceConn = ref([])
const svg = `
        <path class="path" d="
          M 30 15
          L 28 17
          M 25.61 25.61
          A 15 15, 0, 0, 1, 15 30
          A 15 15, 0, 1, 1, 27.99 7.5
          L 15 15
        " style="stroke-width: 4px; fill: rgba(0, 0, 0, 0)"/>
      `
const operators = ref(['+', '-', '*', '/', '(', ')']);
const alphabet = ref(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);
const connections = ref([])
const formulaOp = ref([])
const bracketRec = ref([])
const canvasRef = ref(null)
let connId = 0
const canvasDiv = ref(null)
let loading = ref(true)
const userIcon = new Image()
const waitIcon = new Image()
const SuccessIcon = new Image()
const RefuseIcon = new Image()
waitIcon.src = require('@/assets/iconInCanvas/daichuli.png')
userIcon.src = require('@/assets/iconInCanvas/User.png')
SuccessIcon.src = require('@/assets/iconInCanvas/Success.png')
RefuseIcon.src = require('@/assets/iconInCanvas/refuse.png')
const emits = defineEmits(['update:modelValue'])
const handleClose = () => {
    emits('update:modelValue', false)
}




const generateFormula = (formulaStr, x, y) => {

    let userCount = 0, i
    for (i = 0; i < formulaStr.length; i++) {

        console.log(formulaStr[i]); // 输出每个字符
        if (alphabet.value.includes(formulaStr[i])) {
            userCount++;
            if (i === 0 || i === formulaStr.length - 1) {
                let bracketEl = { rank: userCount, value: formulaStr[i], bracket: '' }
                bracketRec.value.push(bracketEl)

            }
            else if (formulaStr[i - 1] === '(') {
                let bracketEl = { rank: userCount, value: formulaStr[i], bracket: '(' }
                bracketRec.value.push(bracketEl)
            } else if (formulaStr[i + 1] === ')') {
                let bracketEl = { rank: userCount, value: formulaStr[i], bracket: ')' }
                bracketRec.value.push(bracketEl)

            } else {
                let bracketEl = { rank: userCount, value: formulaStr[i], bracket: '' }
                bracketRec.value.push(bracketEl)
            }
        } else if (formulaStr[i] != ' ' && formulaStr[i] != '(' && formulaStr[i] != ')') {
            formulaOp.value.push(formulaStr[i])
        }
    }
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
                state: props.taskInfo.playerState,
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
// 重置画布尺寸为初始默认值
const resetCanvasSize = () => {
    const canvas = canvasRef.value;
    const defaultCanvasWidth = 1000; // 设置默认宽度
    const defaultCanvasHeight = 200;  // 设置默认高度

    canvas.width = defaultCanvasWidth;
    canvas.height = defaultCanvasHeight;
};
const generateComponentsOnCanvas = (users, operators, playerState) => {
    const canvas = canvasRef.value;
    const initialCanvasWidth = canvas.width; // 初始画布宽度
    const initialCanvasHeight = canvas.height; // 初始画布高度
    console.log('initialCanvasWidth', initialCanvasWidth, 'initialCanvasHeight', initialCanvasHeight);
    const componentWidth = 190; // 每个用户组件的宽度
    const componentHeight = 40; // 每个用户组件的高度
    const operatorWidth = 50; // 每个操作符组件的宽度


    let x = 50 // 初始化x坐标，居中
    let y = initialCanvasHeight / 2; // 初始化y坐标，居中
    console.log('x,y', x, y);
    let maxX = 0; // 记录组件的最大X值
    let maxY = 0; // 记录组件的最大Y值

    componentsOnCanvas.value = []; // 清空画布上的组件

    let first = {
        type: 'users',
        value: { username: users[0].username },
        x,
        y,
        width: componentWidth,
        height: componentHeight,
        bracket: users[0].bracket,
        state: playerState[0],
    };
    componentsOnCanvas.value.push(first);

    // 初始化连接线数组
    connections.value = [];
    let prevComponent = first;
    let connId = 0;

    // 更新最大X和Y值
    maxX = Math.max(maxX, x + componentWidth);
    maxY = Math.max(maxY, y + componentHeight);

    for (let i = 1; i < users.length; i++) {
        x += componentWidth + 120;

        let userComponent = {
            type: 'users',
            value: { username: users[i].username },
            x,
            y,
            width: componentWidth,
            height: componentHeight,
            bracket: users[i].bracket,
            state: playerState[i],
        };
        componentsOnCanvas.value.push(userComponent);

        // 添加连接线
        connections.value.push({
            source: prevComponent,
            target: userComponent,
            circleContent: operators[i - 1], // 操作符与用户之间
            connId: connId++,
        });

        prevComponent = userComponent;

        // 更新最大X和Y值
        maxX = Math.max(maxX, x + componentWidth);
        maxY = Math.max(maxY, y + componentHeight);
    }

    // 根据最大X和最大Y调整画布的宽度和高度

    console.log('canvasRef.value.width before', canvasRef.value.width);
    if (maxX + 50 > initialCanvasWidth) {
        canvasRef.value.style.width = `${maxX + 50}px`;
    }
    if (maxY + 50 > initialCanvasHeight) {
        canvasRef.value.style.height = `${maxY + 50}px`;
    }

    if (initialCanvasWidth < maxX + 50) {
        canvasDiv.value.classList.add('overflow-x-auto')
    }
    if (initialCanvasHeight < maxY + 50) {
        canvasDiv.value.classList.add('overflow-y-auto')
    }
    console.log('canvasDiv.value', canvasDiv.value);
    // 重新绘制画布
    setCanvasResolution(); // 调整分辨率（如需要）
    drawCanvas(); // 初次绘制画布
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

const handleOpen = async () => {
    console.log('open');
    //获取任务的公式以及用户状态
    await getMapAndState()
    console.log(window.devicePixelRatio);
    await nextTick(); // 确保 DOM 更新完成
    console.log(formulaInfo.value);
    //获取表达式的用户名与括号
    const users = extractUsernamesAndBracket(formulaInfo.value.mapString)
    const operators = extractOperators(formulaInfo.value.mapString)
    resetCanvasSize()

    generateComponentsOnCanvas(users, operators, formulaInfo.value.playerState)
    console.log(users, operators);
    //获取表达式的操作符

    if (canvasRef.value) {
        ctx.value = canvasRef.value.getContext('2d');
        drawCanvas(); // 初次绘制画布
    } else {
        console.error('Canvas element not found');
    }
    loading.value = false
}
const getMapAndState = async () => {
    //发起任务
    console.log('props.taskInfo.taskUuid', props.taskInfo);
    await axios.post(
        '/api/MPC/drawTaskMap', { taskUuid: props.taskInfo.taskUuid }
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                formulaInfo.value = res.data.data
                console.log('formulaInfo.value', formulaInfo.value);
            }
            else {
                const msg = res.data.message
                ElMessage({
                    type: 'error',
                    message: '获取信息失败'
                })
            }
        })

}
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
// 绘制连接线
const drawConnections = () => {

    ctx.value.lineWidth = 2;
    ctx.value.strokeStyle = '#4682b4'; // 线条颜色
    ctx.value.fillStyle = '#4682b4'; // 箭头颜色
    // 使用方法
    // 示例 usage

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

        ctx.value.fillStyle = '#f0f8ff'; // 默认背景颜色

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
            ctx.value.font = '20px Arial bold'; // 更大的字体
            ctx.value.fillStyle = 'red'; // 突出的颜色
            ctx.value.textAlign = 'center';
            ctx.value.textBaseline = 'middle';

            if (component.bracket === '(') {
                ctx.value.fillText(component.bracket, component.x - 15, component.y + component.height / 2); // 左侧括号
            } else if (component.bracket === ')') {
                ctx.value.fillText(component.bracket, component.x + component.width + 15, component.y + component.height / 2); // 右侧括号
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




        }
        // 如果该组件被选中，绘制选中框
        /*         if (selectedComponent.value === component) {
                    drawSelectionBox(ctx, component);
                } */
    });
    // 绘制连接线
    drawConnections();


};

</script>

<style lang="scss" scoped>
/* 中间的 canvas 区域 */
.canvas-container {
    width: 100%;
    height: 200px;
    /* 中间区域占据剩余空间 */
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    /* 允许滚动 */
    overflow: hidden;

}

// 在 CSS 中定义一个类
.overflow-x-auto {

    overflow-x: auto;
}

// 在 CSS 中定义一个类
.overflow-y-auto {

    overflow-y: auto;
}

.canvas {
    width: 1000px;
    height: 500px;
    box-sizing: border-box;

    border: 1px solid #ccc;
    border-right: 1px solid #ccc;

}

.icon-description {
    margin-top: 10px;
    text-align: center;
}

.icon-description img {
    vertical-align: middle;
}
</style>