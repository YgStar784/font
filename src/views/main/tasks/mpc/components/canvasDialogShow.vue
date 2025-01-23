<template>
    <el-dialog title="画布展示" v-model="canvasShowDialogValue" @open="OpenLoading" height="500" @close="handleClose"
        width="1000" append-to-body destroy-on-close>
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

        <div class="formulaShow">
            <n-card hoverable>

                <n-skeleton v-if="loading" text :repeat="2" />
                <template v-else>
                    <n-space>
                        <n-tag :bordered="false" type="info">
                            公 式
                        </n-tag>
                        <n-tag :bordered="false">
                            {{ formulaInfo.mapString }}
                        </n-tag>
                    </n-space>
                </template>
            </n-card>
            <n-spin :show="loadingState">

                <n-card style="margin-top: 10px;" hoverable>
                    <template #header>
                        <n-gradient-text type="info">
                            状 态
                        </n-gradient-text>
                    </template>
                    <n-skeleton v-if="loadingState" text :repeat="3" />


                    <n-space v-else vertical style="width: 100%;">
                        <n-descriptions label-placement="left" style="width: 100%;" :column="4">


                            <n-descriptions-item v-for="(user, index) in userStateList" :key="index">
                                <template #label>
                                    <n-gradient-text :gradient="{
                                        from: 'rgb(85, 85, 85)',
                                        to: 'rgb(170, 170, 170)',
                                    }">
                                        {{ user.value }}
                                    </n-gradient-text>

                                </template>
                                <n-badge v-if="user.state === 0" :value="user.stateCount" type="success">

                                    <n-tag type="success">
                                        已确认
                                        <template #icon>
                                            <n-icon :component="CheckmarkCircle" />
                                        </template>
                                    </n-tag>

                                </n-badge>
                                <n-badge v-if="user.state === 1" :value="user.stateCount" type="error">

                                    <n-tag type="error">
                                        已拒绝
                                        <template #icon>
                                            <n-icon :component="ErrorFilled" />
                                        </template>
                                    </n-tag>

                                </n-badge>
                                <n-badge v-if="user.state === 2" :value="user.stateCount" type="warning">


                                    <n-tag type="warning">
                                        待处理
                                        <template #icon>
                                            <n-icon :component="ChartPie" />
                                        </template>
                                    </n-tag>

                                </n-badge>
                            </n-descriptions-item>

                        </n-descriptions>
                    </n-space>

                </n-card>
            </n-spin>

        </div>
    </el-dialog>
</template>

<script setup>
import { NTag, NBadge, NSpin, NIcon, NSpace, NCard, NSkeleton, NDescriptions, NDescriptionsItem, NGradientText } from 'naive-ui'
import { ref, nextTick, onMounted } from 'vue';
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { extractUsernamesAndBracket, extractUsernamesAndBracketIncludeMaxOrMin, extractOperators } from '@/utils/utils'
import { log } from 'mathjs';
import { CheckmarkCircle } from '@vicons/ionicons5'
import { ErrorFilled, ChartPie } from '@vicons/carbon';
import { useRouter } from 'vue-router';
const router = useRouter()
const uniqueBracketRec = ref([])
const ctx = ref(null); // 保存 Canvas 的上下文
const formulaInfo = ref({})
const componentsOnCanvas = ref([])
const loadingState = ref(true)
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const userStateList = ref([])
const queryFormUsers = ref({
    queryName: '',
    page: 1,
    pageSize: 8,
})
const usersList = ref()
const isRealSourceConn = ref([])
const currentUserInfo = ref({})
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
const mapStringState = ref([])
waitIcon.src = require('@/assets/iconInCanvas/daichuli.png')
userIcon.src = require('@/assets/iconInCanvas/User.png')
SuccessIcon.src = require('@/assets/iconInCanvas/Success.png')
RefuseIcon.src = require('@/assets/iconInCanvas/refuse.png')
const emits = defineEmits(['update:modelValue'])
const handleClose = () => {
    emits('update:modelValue', false)
}
const getUser = async (username) => {
    queryFormUsers.value.queryName = username
    await axios.post('https://120.48.18.15:7000/api/getAllUser', queryFormUsers.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            // console.log(res)
            if (res.data.code === 1000) {
                currentUserInfo.value = res.data.data.userList[0]
                // console.log(currentUsersList.value);
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
function countNormalUsersInFunc(funcStr) {
    // 递归提取函数中的正常用户数
    const regex = /[a-zA-Z\u4e00-\u9fa5]+/g; // 匹配中文或英文的用户名
    const matches = funcStr.match(regex) || [];
    return matches.length;
}
function extractUserStates(formulaStr, stateList) {
    const operatorChars = ['+', '-', '*', '/', '＋', '－', '＊', '／'];
    const funcNames = ['min', 'max', 'max_value', 'min_value']; // 函数名
    let i = 0; // 状态列表索引
    let userStates = {}; // 存储用户的状态信息

    // **1. 去掉 max(、min( 并替换为 (
    funcNames.forEach((func) => {
        const regex = new RegExp(`\\b${func}\\(`, 'g'); // 匹配完整单词
        formulaStr = formulaStr.replace(regex, '(');
    });

    console.log('处理后的公式:', formulaStr);

    // **2. 遍历公式字符串，提取用户名
    let username = '';
    for (let j = 0; j < formulaStr.length; j++) {
        const char = formulaStr[j];

        if (operatorChars.includes(char) || char === '(' || char === ')' || char === ',' || char.trim() === '') {
            // 遇到操作符、括号、逗号或空格，提交已累积的用户名
            if (username.length > 0) {
                if (!(username in userStates)) {
                    userStates[username] = [];
                }
                userStates[username].push(stateList[i]); // 将状态赋予用户
                i++;
                username = ''; // 重置用户名
            }
        } else {
            // 累积字符为用户名
            username += char;
        }
    }

    // **3. 提交最后一个用户名
    if (username.length > 0) {
        if (!(username in userStates)) {
            userStates[username] = [];
        }
        userStates[username].push(stateList[i]);
    }

    // **4. 统计每个用户的最高状态和其数量
    const result = Object.entries(userStates).map(([username, states]) => {
        const stateCounts = { 0: 0, 1: 0, 2: 0 }; // 状态出现次数
        states.forEach((s) => {
            stateCounts[s]++;
        });

        let highestState = 0;
        if (stateCounts[1] > 0) {
            highestState = 1; // 拒绝
        } else if (stateCounts[2] > 0) {
            highestState = 2; // 待处理
        }

        return {
            value: username,
            state: highestState,
            stateCount: stateCounts[highestState],
        };
    });

    console.log('result', result);
    return result;
}
function extractFunctionUsername(formulaStr, i) {
    const funcNames = ['min', 'max', 'min_value', 'max_value']; // 增加 "min_value" 和 "max_value"
    let funcName = ''; // 存储函数名
    let name = ''; // 存储完整用户名
    let startIndex = i;

    // 提取可能的函数名 "min"、"max"、"min_value" 或 "max_value"
    while (i < formulaStr.length && /[a-zA-Z_]/.test(formulaStr[i])) {  // 增加对下划线 "_" 的支持
        funcName += formulaStr[i];
        i++;
    }

    // 判断是否为函数名
    if (!funcNames.includes(funcName.toLowerCase())) {
        return { name: null, newIndex: startIndex }; // 不是函数，返回原始索引
    }

    name = funcName; // 初始用户名包含函数名
    let bracketBalance = 0; // 括号配对计数

    // 检测第一个左括号 "("
    if (formulaStr[i] === '(') {
        name += '(';
        bracketBalance++;
        i++;
    } else {
        return { name: null, newIndex: startIndex }; // 函数后面没有左括号，不是合法函数
    }

    // 提取函数内容，直到括号匹配完成
    while (i < formulaStr.length && bracketBalance > 0) {
        name += formulaStr[i];
        if (formulaStr[i] === '(') bracketBalance++;
        if (formulaStr[i] === ')') bracketBalance--;
        i++;
    }

    return { name, newIndex: i }; // 返回完整用户名和更新后的索引
}
const generateFormula = (formulaStr, playerState) => {
    let userCount = 0; // 用于计数操作数
    let funcUserCount = 0;
    let i = 0; // 初始化索引

    // 定义操作符字符（包括全角和半角）
    const operatorChars = ['+', '＋', '-', '－', '*', '＊', '/', '／'];
    const whitespaceChars = [' '];

    while (i < formulaStr.length) {
        // 检查当前字符是否为用户名的起始字符（字母或汉字）
        if (!operatorChars.includes(formulaStr[i]) && formulaStr[i] !== '(' && formulaStr[i] !== ')' && formulaStr[i] !== ' ') {
            userCount++;
            let leftBracket = '';
            let rightBracket = '';
            let username = '';
            const funcNames = ['min', 'max', 'min_value', 'max_value'];

            // 向左查找所有左括号
            let leftIndex = i - 1;
            while (leftIndex >= 0 && formulaStr[leftIndex] === '(') {
                leftBracket = '(' + leftBracket;
                leftIndex--;
            }

            // 提取用户名，直到遇到操作符、括号或空格为止
            while (
                i < formulaStr.length &&
                !operatorChars.includes(formulaStr[i]) &&
                formulaStr[i] !== '(' &&
                formulaStr[i] !== ')' &&
                !whitespaceChars.includes(formulaStr[i])
            ) {

                const { name, newIndex } = extractFunctionUsername(formulaStr, i);
                console.log('name', name);
                if (name != null) {
                    username = name
                    i = newIndex
                }
                else {
                    username += formulaStr[i];
                    i++;
                }
            }

            // 向右查找所有右括号
            let rightIndex = i;
            while (rightIndex < formulaStr.length && formulaStr[rightIndex] === ')') {
                rightBracket += ')';
                rightIndex++;
            }

            let bracketEl = {}
            // 检测是否为 `min` 或 `max` 函数
            if (funcNames.includes(username.toLowerCase())) {
                console.log('username', username);
                // 将找到的括号与当前用户名拼接
                bracketEl = {
                    rank: userCount,
                    value: username, // 记录完整的用户名
                    bracket: leftBracket + rightBracket, // 记录左右括号

                };
                funcUserCount += countNormalUsersInFunc(username)
            }
            else {
                // 将找到的括号与当前用户名拼接
                bracketEl = {
                    rank: userCount,
                    value: username, // 记录完整的用户名
                    bracket: leftBracket + rightBracket, // 记录左右括号
                    state: playerState[userCount + funcUserCount - 1],
                };
            }

            // 将结果推入 bracketRec 数组
            bracketRec.value.push(bracketEl);
            console.log('leftIndex', leftIndex);
            console.log('i', formulaStr[i]);
            console.log('rightIndex', rightIndex);
            // 跳过已遍历的右括号
            i = rightIndex;
        } else if (operatorChars.includes(formulaStr[i])) {
            // 检查是否为操作符
            formulaOp.value.push(formulaStr[i]);
            i++;
        } else {
            // 跳过空格和括号
            i++;
        }
    }
    console.log('bracketRec.value', bracketRec.value);
};
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
    console.log('bracketRec.value', bracketRec.value);
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
function getStringWidth(text, font = '16px Arial') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = font; // 设置字体样式
    const width = context.measureText(text).width; // 测量文本宽度
    return width;
}
const extractUsernamesFromFunc = (funcStr) => {
    console.log('funcStr', funcStr);
    const funcNames = ['min', 'max', 'min_value', 'max_value'];
    funcStr = funcStr.trim(); // 去除首尾空格

    // 检查括号匹配
    const checkBracketsBalanced = (str) => {
        let balance = 0;
        for (let char of str) {
            if (char === '(') balance++;
            if (char === ')') balance--;
            if (balance < 0) return false;
        }
        return balance === 0;
    };

    if (!checkBracketsBalanced(funcStr)) {
        throw new Error('括号不匹配，请检查表达式格式');
    }

    const regex = /^(\w+)\((.*)\)$/;
    const match = funcStr.match(regex);
    if (!match || !funcNames.includes(match[1].toLowerCase())) {
        throw new Error('输入不是合法的 max 或 min 函数表达式');
    }

    const content = match[2];
    let bracketBalance = 0;
    let subExpression = '';
    let usernames = [];

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (char === '(') bracketBalance++;
        if (char === ')') bracketBalance--;
        if (char === ',' && bracketBalance === 0) {
            if (subExpression.trim().length > 0) {
                usernames = usernames.concat(extractUsernames(subExpression.trim()));
            }
            subExpression = '';
        } else {
            subExpression += char;
        }
    }

    if (subExpression.trim().length > 0) {
        usernames = usernames.concat(extractUsernames(subExpression.trim()));
    }

    return usernames;
};

const extractUsernames = (expr) => {
    const funcNames = ['min', 'max', 'min_value', 'max_value'];
    const match = expr.match(/^(\w+)\((.*)\)$/);

    if (match && funcNames.includes(match[1].toLowerCase())) {
        return extractUsernamesFromFunc(expr);
    } else {
        return [expr];
    }
};

const generateComponentsOnCanvas = (playerState) => {
    const canvas = canvasRef.value;
    const initialCanvasWidth = canvas.width; // 初始画布宽度
    const initialCanvasHeight = canvas.height; // 初始画布高度
    console.log('initialCanvasWidth', initialCanvasWidth, 'initialCanvasHeight', initialCanvasHeight);
    const componentWidth = 190; // 每个用户组件的宽度
    const componentHeight = 40; // 每个用户组件的高度
    const operatorWidth = 50; // 每个操作符组件的宽度

    const funcNames = ['min', 'max', 'min_value', 'max_value']
    let x = 50 // 初始化x坐标，居中
    let y = initialCanvasHeight / 2; // 初始化y坐标，居中
    console.log('x,y', x, y);
    let maxX = 0; // 记录组件的最大X值
    let maxY = 0; // 记录组件的最大Y值
    bracketRec.value = []
    formulaOp.value = []
    generateFormula(formulaInfo.value.mapString, playerState)
    componentsOnCanvas.value = []; // 清空画布上的组件
    let first = {}
    const funcName = bracketRec.value[0].value.trim().split('(')[0].toLowerCase();
    let totalWidth = 50
    if (funcNames.includes(funcName)) {
        if (funcName === 'max_value' || funcName === 'min_value') {
            first = {
                type: 'function',
                value: bracketRec.value[0].value.substring(0, 9),
                users: [bracketRec.value[0].value.slice(10, -1)],
                x,
                y,
                width: getStringWidth(bracketRec.value[0].value, '16px Arial'),
                height: componentHeight,
                bracket: bracketRec.value[0].bracket,
            }
        }
        else {
            first = {
                type: 'function',
                value: bracketRec.value[0].value[0] + bracketRec.value[0].value[1] + bracketRec.value[0].value[2],
                users: [bracketRec.value[0].value.slice(4, -1)],
                x,
                y,
                width: getStringWidth(bracketRec.value[0].value, '16px Arial'),
                height: componentHeight,
                bracket: bracketRec.value[0].bracket,
            }
        }
    }
    else {
        first = {
            type: 'users',
            value: { username: bracketRec.value[0].value },
            x,
            y,
            width: componentWidth,
            height: componentHeight,
            bracket: bracketRec.value[0].bracket,
            state: bracketRec.value[0].state,
        };
    }

    componentsOnCanvas.value.push(first);
    totalWidth += first.width
    // 初始化连接线数组
    connections.value = [];
    let prevComponent = first;
    let connId = 0;

    // 更新最大X    和Y值
    maxX = Math.max(maxX, x + componentWidth);
    maxY = Math.max(maxY, y + componentHeight);

    for (let i = 1; i < bracketRec.value.length; i++) {
        let userComponent = {}
        const funcName = bracketRec.value[i].value.trim().split('(')[0].toLowerCase();
        console.log('funcNames.includes(bracketRec.value[i].value)', funcNames.includes(bracketRec.value[i].value));
        if (funcNames.includes(funcName)) {
            console.log('bracketRec.value[i].value', bracketRec.value[i].value);
            if (funcName === 'max_value' || funcName === 'min_value') {

                userComponent = {
                    type: 'function',
                    value: bracketRec.value[i].value.substring(0, 9),
                    users: [bracketRec.value[i].value.slice(10, -1)],
                    x: totalWidth + 100,
                    y: y - 20,
                    width: getStringWidth(bracketRec.value[i].value, '16px Arial'),
                    height: componentHeight,
                    bracket: bracketRec.value[i].bracket,
                }
            }
            else {
                userComponent = {
                    type: 'function',
                    value: bracketRec.value[i].value[0] + bracketRec.value[i].value[1] + bracketRec.value[i].value[2],
                    users: [bracketRec.value[i].value.slice(4, -1)],
                    x: totalWidth + 100,
                    y,
                    width: getStringWidth(bracketRec.value[i].value, '16px Arial'),
                    height: componentHeight,
                    bracket: bracketRec.value[i].bracket,
                }
            }

        }
        else {
            userComponent = {
                type: 'users',
                value: { username: bracketRec.value[i].value },
                x: totalWidth + 100,
                y,
                width: componentWidth,
                height: componentHeight,
                bracket: bracketRec.value[i].bracket,
                state: bracketRec.value[i].state,
            };
        }
        componentsOnCanvas.value.push(userComponent);

        // 添加连接线
        connections.value.push({
            source: prevComponent,
            target: userComponent,
            circleContent: formulaOp.value[i - 1], // 操作符与用户之间
            connId: connId++,
        });

        prevComponent = userComponent;

        // 更新最大X和Y值
        maxX = Math.max(maxX, x + componentWidth);
        maxY = Math.max(maxY, y + componentHeight);
        totalWidth += userComponent.width + 50
        console.log('totalWidth', totalWidth);
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
    console.log('componentsOnCanvas', componentsOnCanvas.value);
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


const mapState = async () => {
    let mapIndex;
    mapStringState.value = []
    /*     const usersList = extractUsernames(formulaInfo.value.mapString);
    
        for (const username of usersList) {
            await getUser(username); // 等待 getUser 执行完毕
            console.log('currentUserInfo.value.nodeIp', currentUserInfo.value);
    
            mapIndex = formulaInfo.value.playerIpList.findIndex((item) => item === currentUserInfo.value.nodeIp);
            console.log('mapIndex', mapIndex);
            console.log('formulaInfo.value.playerStateList[mapIndex]', formulaInfo.value.playerStateList[mapIndex]);
    
            mapStringState.value.push(formulaInfo.value.playerStateList[mapIndex]);
        }
    
        console.log('mapStringState', mapStringState.value); */
    mapStringState.value = formulaInfo.value.playerStateList
    console.log(' mapStringState.value', mapStringState.value);
};
const handleOpen = async () => {
    console.log('open');
    //获取任务的公式以及用户状态
    await getMapAndState()
    console.log(window.devicePixelRatio);
    await mapState();
    await nextTick(); // 确保 DOM 更新完成
    console.log(formulaInfo.value);
    //获取表达式的用户名与括号
    userStateList.value = []
    const users = extractUsernamesAndBracketIncludeMaxOrMin(formulaInfo.value.mapString)
    console.log('users', users);
    const operators = extractOperators(formulaInfo.value.mapString)
    console.log('operators', operators);
    resetCanvasSize()
    console.log('mapStringState.value', mapStringState.value);
    generateComponentsOnCanvas(mapStringState.value)
    userStateList.value = extractUserStates(formulaInfo.value.mapString, mapStringState.value)
    console.log('bracketRec', bracketRec.value);
    uniqueBracketRec.value = []
    uniqueBracketRec.value = bracketRec.value.filter((item, index, self) =>
        index === self.findIndex((t) => t.value === item.value)
    );
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
            } else if (res.data.code === 1006) {
                ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                handleClose()
                setTimeout(() => {
                    router.push({ path: '/login' }); // 确保路径和名称正确
                }, 500); // 避免动画加载导致页面阻塞
                return
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
        if (component.type === 'function') {
            // 绘制 function 形状
            let circleRadius = 20; // 圆的半径
            if (component.value.includes('max_value') || component.value.includes('min_value')) {
                circleRadius = 40
            }
            // 动态计算矩形宽度和文本
            console.log('component', component);
            const userText = component.users.length > 0
                ? `( ${component.users.join(', ')} )`
                : "请将用户拖拽至此"; // 动态提示文本
            ctx.value.font = '14px Arial'; // 设置字体


            const rectWidth = Math.max(ctx.value.measureText(userText).width + 20, 140); // 确保宽度准确
            const rectHeight = 40; // 矩形高度
            // 绘制圆形
            ctx.value.beginPath();

            ctx.value.arc(component.x + circleRadius, component.y + circleRadius, circleRadius, 0, 2 * Math.PI);
            ctx.value.fillStyle = '#add8e6';
            ctx.value.fill();
            ctx.value.strokeStyle = '#4682b4';
            ctx.value.stroke();

            /*             if (component.value === 'max_value' || component.value === 'min_vlaue') {
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
                        else {
                            ctx.value.beginPath();
                            ctx.value.arc(component.x + circleRadius, component.y + circleRadius, circleRadius, 0, 2 * Math.PI);
                            ctx.value.fillStyle = '#add8e6';
                            ctx.value.fill();
                            ctx.value.strokeStyle = '#4682b4';
                            ctx.value.stroke();
            
                        } */
            // 绘制圆内的文本
            ctx.value.font = '16px Arial';
            ctx.value.fillStyle = 'black';
            ctx.value.textAlign = 'center';
            ctx.value.textBaseline = 'middle';
            ctx.value.fillText(component.value, component.x + circleRadius, component.y + circleRadius);

            // 绘制矩形
            let rectX = component.x + circleRadius * 2;
            console.log('component.value', component.value);
            /*             if (component.value === 'max_value' || component.value === 'min_value') {
                            rectX = component.x + circleRadius * 3;
                        } */
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
            component.height = Math.max(circleRadius * 2, rectHeight); // 确保高度为圆形或矩形中较大的那个
        }
        // 如果组件有括号，则在组件外部绘制括号并突出显示
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
const OpenLoading = async () => {
    loading.value = true
    loadingState.value = true
    // 等待 DOM 渲染完成后再关闭加载状态
    await handleOpen()
    nextTick(() => {
        loadingState.value = false;
    })
}
/* onMounted(() => {
    loading.value = true
    loadingState.value = true
    // 等待 DOM 渲染完成后再关闭加载状态
    nextTick(() => {
        loadingState.value = false;
    })
}) */
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
    overflow-y: hidden;
    overflow-x: auto;
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
    width: 3600px;
    height: 500px;
    box-sizing: border-box;

    border: 1px solid #ccc;
    border-right: 1px solid #ccc;
    overflow-x: auto;
    overflow-y: hidden;
}

.icon-description {
    margin-top: 10px;
    text-align: center;
}

.icon-description img {
    vertical-align: middle;
}

.formulaShow {
    width: 100%;
    margin-top: 20px;
}
</style>