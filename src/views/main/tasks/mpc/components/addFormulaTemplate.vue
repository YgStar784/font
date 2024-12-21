<template>
    <el-dialog :style="{ paddingRight: '0' }" width="1000" :model-value="dialogAddFormulaTemplateVisible"
        @close="handleClose" title="公式生成" append-to-body>

        <div class="formula-editor">
            <div class="tag-container">
                <div class="funcRightTag">
                    <div class="addTag" @click="addOperand">
                        <el-icon class="plus-icon" style="color: aliceblue;padding-left: 3px">
                            <plus />
                        </el-icon>
                    </div>
                    <div class="delTag" @click="delLastOperand">
                        <el-icon class="minus-icon" style="color: black;padding-left: 3px">
                            <Minus />
                        </el-icon>
                    </div>
                    <div class="refreshTag" @click="refreshOperand">
                        <el-icon class="refresh-icon" style="color: aliceblue;padding-left: 3px">
                            <RefreshLeft />
                        </el-icon>
                    </div>
                </div>


            </div>
            <div class="expression" ref="expressionContainer">
                <!-- 遍历表达式字符串并渲染操作数和操作符 -->
                <template v-for="(item, index) in parsedExpression" :key="index">
                    <div v-if="item.type === 'operand'" class="operand-container"
                        @mouseenter="toggleBracketSelection(index, true)"
                        @mouseleave="delayedHideBracketSelection(index)">
                        <div class="operand" @click="toggleBracketSelection(index)">
                            {{ item.value }}
                        </div>
                        <div v-show="showBracketOptions[index]" class="bracket-options"
                            @mouseenter="cancelHideBracketSelection(index)"
                            @mouseleave="delayedHideBracketSelection(index)">
                            <button @click="addBracket(index, '(')">（</button>
                            <button @click="addBracket(index, ')')">）</button>
                        </div>
                    </div>
                    <div v-else class="operator-container" @mouseenter="toggleOperatorSelection(index, true)"
                        @mouseleave="delayedHideOperatorSelection(index)" @click="toggleOperatorSelection(index, true)">
                        <div class="operator-wrapper">
                            <div class="operator">{{ item.value }}</div>
                            <div v-show="showOperatorOptions[index]" class="operator-options"
                                @mouseenter="cancelHideOperatorSelection(index)"
                                @mouseleave="delayedHideOperatorSelection(index)">
                                <button v-for="op in operatorOptions" :key="op" @click="replaceOperator(index, op)">
                                    {{ op }}
                                </button>
                            </div>
                        </div>
                    </div>
                </template>
            </div>
        </div>
        <!-- 显示当前公式的部分 -->
        <!-- 显示当前公式的部分 -->
        <div class="current-formula">
            <p>当前公式：{{ getCurrentFormula() }}</p>
        </div>
        <template #footer>
            <div class="submit-but" style="text-align: right; padding-right:25px;">
                <n-button type="info" @click="submitFormula" plain>提交</n-button>
            </div>

        </template>
        <n-dialog title="确认" @close="handleRefreshClose" v-if="refreshDialogShow" type="info"
            content="你确定重置公式为'A+B+C'吗？" negative-text="取消" positive-text="确认" @positive-click="handlePositiveClick"
            @negative-click="handleNegativeClick"
            style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);" append-to-body />
    </el-dialog>

</template>

<script setup>
import { ref, computed, watchEffect, nextTick } from 'vue'
import { ElMessage } from 'element-plus';
import { NButton, useDialog, useMessage, NDialog } from 'naive-ui'
import { isValidFormula } from '@/utils/utils.js'
const dialogWidth = ref(400); // 初始宽度
const expressionContainer = ref(null);
const dialogAddFormulaTemplateVisible = ref(false)
const emits = defineEmits(['update:modelValue', 'update:formula'])
const handleClose = () => {
    emits('update:modelValue', false)
}
const regex = /(\({0,}\w+\){0,})|[\+\-\*\/]/g;
const expressionString = ref("A+B+C");
const refreshDialogShow = ref(false)
const operatorOptions = ["+", "-", "*", "/"];
let hideTimeout = null;
const props = defineProps({
    formula: {
        type: String,
        default: '',
        required: true
    }
})
const message = useMessage()
const dialog = useDialog()

const handlePositiveClick = () => {
    expressionString.value = 'A+B+C'
    // 重置括号和操作符选项的显示状态
    showBracketOptions.value = parsedExpression.value.map(() => false);
    showOperatorOptions.value = parsedExpression.value.map(() => false);
    message.success('重置成功')
    refreshDialogShow.value = false

}
const handleNegativeClick = () => {
    message.info('取消重置')
    refreshDialogShow.value = false
}
const handleRefreshClose = () => {
    refreshDialogShow.value = false

}
//增加动态调整对话框宽度的函数 adjustDialogWidth
const adjustDialogWidth = () => {
    nextTick(() => {
        const container = expressionContainer.value;
        if (container) {
            const containerWidth = container.scrollWidth;
            if (containerWidth > dialogWidth.value) {
                // 动态扩大对话框宽度，以适应公式内容的宽度
                dialogWidth.value = containerWidth + 20; // 适当增加一些余量
            }
        }
    });
};
const parsedExpression = computed(() => {
    const parsed = [];
    let match;
    // 使用改进的正则表达式来匹配包含括号的整体操作数，以及不带括号的普通操作数和操作符
    const regex = /(\({0,}\w+\){0,})|[\+\-\*\/]/g;
    while ((match = regex.exec(expressionString.value)) !== null) {
        const value = match[0];
        if (/[\+\-\*\/]/.test(value)) {
            parsed.push({ type: "operator", value });
        } else {
            parsed.push({ type: "operand", value });
        }
    }
    return parsed;
});
//使用 watchEffect 监听 parsedExpression 的变化并调用 adjustDialogWidth
watchEffect(() => {
    adjustDialogWidth();
});
const showBracketOptions = ref(parsedExpression.value.map(() => false));
const showOperatorOptions = ref(parsedExpression.value.map(() => false));
// 切换括号选择框显示
const toggleBracketSelection = (index, isHovered) => {
    showBracketOptions.value = showBracketOptions.value.map((v, i) =>
        i === index ? isHovered : false
    );
};

// 延迟隐藏括号选择框
const delayedHideBracketSelection = (index) => {
    hideTimeout = setTimeout(() => {
        showBracketOptions.value[index] = false;
    }, 500); // 延迟 500 毫秒隐藏，可以根据需要调整
};


//重置操作数的括号
const refreshOperand = () => {
    refreshDialogShow.value = true
};
// 取消隐藏括号选择框
const cancelHideBracketSelection = (index) => {
    clearTimeout(hideTimeout);
    showBracketOptions.value[index] = true;
};
//获取当前的公式
const getCurrentFormula = () => {
    return parsedExpression.value.map(item => item.value).join('');
};
// 为操作数添加括号
const addBracket = (index, bracket) => {
    const current = parsedExpression.value[index];
    if (bracket === "(") {
        current.value = `(${current.value}`;
    } else {
        current.value = `${current.value})`;
    }
    showBracketOptions.value[index] = false;
};
const addOperand = () => {
    // 获取当前公式字符串
    let formula = getCurrentFormula();
    expressionString.value = formula;

    // 使用正则去除括号，并只提取实际的最后一个字母
    const match = formula.match(/[A-Z](?!.*[A-Z])/);  // 匹配最后一个字母，不管是否有括号
    const lastOperand = match ? match[0] : "A"; // 获取最后有效的操作数

    // 计算下一个操作数
    const nextOperand = String.fromCharCode(lastOperand.charCodeAt(0) + 1);

    // 增加新的操作符“+”和新的操作数
    expressionString.value += `+${nextOperand}`;

    // 重新生成选择框的状态
    showBracketOptions.value = parsedExpression.value.map(() => false);
    showOperatorOptions.value = parsedExpression.value.map(() => false);
};
const delLastOperand = () => {
    // 获取当前公式字符串
    let formula = getCurrentFormula();
    expressionString.value = formula
    // 匹配所有操作数（包括带括号的情况）和所有操作符
    const operands = formula.match(/[A-Z]+|\([A-Z]+\)|\([A-Z]+\)/g);
    const operators = formula.match(/[\+\-\*\/]/g);

    // 如果操作数数量少于等于1，或者没有操作符，则不进行删除
    if (!operands || operands.length <= 1 || !operators || operators.length === 0) {
        ElMessage({
            message: '无法删除，当前仅剩一个操作数或没有操作符',
            type: 'warning',
        });
        return;
    }

    // 删除最后一个操作符和操作数（保留其他部分）
    const lastOperand = operands.pop(); // 删除最后一个操作数
    const lastOperator = operators.pop(); // 删除最后一个操作符

    // 找到最后的操作数和操作符的位置并移除它们
    const lastMatch = `${lastOperator}${lastOperand}`;
    expressionString.value = formula.slice(0, formula.lastIndexOf(lastMatch));

    // 重新生成选择框的长度
    showBracketOptions.value = parsedExpression.value.map(() => false);
    showOperatorOptions.value = parsedExpression.value.map(() => false);
};
const toggleOperatorSelection = (index, isHovered) => {
    // 如果点击或悬浮，显示对应选择框
    showOperatorOptions.value = showOperatorOptions.value.map((v, i) =>
        i === index ? isHovered : false
    );
};

const delayedHideOperatorSelection = (index) => {
    hideTimeout = setTimeout(() => {
        showOperatorOptions.value[index] = false;
    }, 600); // 延迟 200 毫秒隐藏，可以根据需要调整
};

const cancelHideOperatorSelection = (index) => {
    clearTimeout(hideTimeout);
    showOperatorOptions.value[index] = true;
};
const keepOperatorSelection = (index) => {
    // 保持选择框的显示状态，避免在从操作符移动到选择框时消失
    showOperatorOptions.value[index] = true;
};

// 替换操作符
const replaceOperator = (index, newOperator) => {
    parsedExpression.value[index].value = newOperator;
    showOperatorOptions.value[index] = false;
};
const submitFormula = () => {
    const updatedFormula = getCurrentFormula();
    const flag = isValidFormula(updatedFormula)
    // 使用 `emit` 触发事件，将 `updatedFormula` 传递给父组件
    if (!flag) {
        message.error('公式不合法')
        return
    }
    emits('update:formula', updatedFormula);
    handleClose()

}
</script>

<style scoped>
.funcRightTag {
    display: flex;
    flex-direction: column;
    /* 按行排列 */

    gap: 3px;

    /* 允许换行 */
    align-items: flex-end;
    /* 让每个元素靠右 */

}

.addTag,
.delTag,
.refreshTag {
    text-align: center;
    width: 30px;
    height: 30px;
    border-radius: 15px 0 0 15px;
    /* 假设按钮高度为 30px，使用一半的高度作为圆角 */
    line-height: 30px;
    transition: width 0.3s ease, background-color 0.3s ease;
    /* 动画效果 */
}

.addTag:hover,
.delTag:hover,
.refreshTag:hover {
    width: 60px;
    cursor: pointer;
}

.addTag {
    background-color: #F56C6C;
}

.delTag {
    background-color: #e0e0e0;
}

.refreshTag {
    background-color: #409eff;
}

.plus-icon,
.minus-icon,
.refresh-icon {
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease;
    /* 动画持续时间为0.5秒，可以根据需要调整 */
    /* 图标旋转动画 */
}

.addTag:hover .plus-icon,
.delTag:hover .minus-icon,
.refreshTag:hover .refresh-icon {
    transform: rotate(360deg);
    /* 悬浮时旋转一整圈 */
    /* 悬浮时旋转图标 */
}

.tag-container {
    width: 100px;
}

.formula-editor {
    display: flex;
    flex-direction: row-reverse;
    justify-content: space-between;
    padding: 20px;
    padding-right: 0;
    padding-top: 20px;
}

h2 {
    font-weight: normal;
}

.expression {

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;

    /* 防止换行，确保所有内容在一行显示 */
    /* 当内容超出时显示横向滚动条 */
    gap: 0px;
    padding-right: 30px;
    /* 调整为更小的间距，例如 8px */
}

/* 操作数样式 */
.operand-container {
    position: relative;
}

/* 操作数样式 */
.operand {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f0f0;
    border-radius: 8px;
    font-size: 18px;
    /* 适当调整字体大小 */
    line-height: 1;
    /* 确保行高为 1，防止内容偏移 */
    cursor: pointer;
    transition: background-color 0.3s;
}

.operand:hover {
    background-color: #e0e0e0;

}

/* 括号选择框样式 */
.bracket-options {
    position: absolute;
    top: -50px;
    /* 相对于 operand 的位置，可以根据需要调整 */
    left: 50%;
    transform: translateX(-50%);
    /* 水平居中对齐 */
    display: flex;
    gap: 5px;

}

.bracket-options button {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
}

.bracket-options button:hover {
    background-color: #ccc;
}

/* 操作符样式 */
.operator-container {
    position: relative;
}

.operator {
    width: 40px;
    /* 调整操作符的宽度 */
    height: 40px;
    /* 调整操作符的高度 */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #409eff;
    color: white;
    border-radius: 50%;
    /* 保持圆形 */
    font-size: 18px;
    /* 调整操作符的字体大小 */
    cursor: pointer;
    transition: background-color 0.3s;
}

/* 操作符父容器，用于扩大悬浮检测范围 */
.operator-wrapper {
    position: relative;
    padding: 10px;
    /* 添加适当的内边距以扩大悬浮范围 */
}

.bracket-options,
.operator-options {
    position: absolute;
    /* 绝对定位 */
    z-index: 1000;
    /* 确保选择框位于上层 */
    top: 100%;
    /* 设置在父元素的下方，可以根据需要调整 */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
    background-color: #fff;
    /* 背景色以便于区分 */
    border-radius: 4px;
    margin-bottom: 0px;
    /* 圆角调整 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    /* 阴影效果，提升视觉层次 */
}

.operator-options {
    position: absolute;
    top: -30px;
    /* 相对于操作符的位置，可以根据需要调整 */
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 5px;
}

.operator-options button {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background-color: #fff;
    cursor: pointer;
    transition: background-color 0.3s;
}

.operator-options button:hover {
    background-color: #ccc;
}

.el-dialog {
    padding-right: 0 !important;
}

.current-formula {
    text-align: center;
    margin-top: 20px;
    font-size: 18px;
    font-weight: bold;
    color: #333;
}
</style>