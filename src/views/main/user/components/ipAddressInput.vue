<template>
    <div class="ipInput">
        <template v-for="index in 4" :key="index">
            <el-input v-model.number="ipAddress[`ip` + index]" maxlength="3" :ref="el => setItemRef(el, index)"
                @paste="handlePaste(index, $event)" @keyup="keyupEvent(index, $event)" @blur="submitIp"
                @input="val => handleInpIp(val, index)"></el-input>
            <span class="dot" v-if="index !== 4">.</span>
        </template>
    </div>
</template>
<script setup>
import { ref, nextTick, reactive, onMounted, onBeforeUnmount } from 'vue'
import Message from '@/utils/message.js'
let props = defineProps(['value'])

const emits = defineEmits(['update:value'])

const ipAddress = reactive({
    ip1: '',
    ip2: '',
    ip3: '',
    ip4: ''
})

let ipRefs = ref({})
const setItemRef = (el, key) => {
    ipRefs.value[key] = el
}

//利用复制粘贴的方式输入ip地址
function handlePaste(index, event) {
    const e = event || window.event
    let ipValue = e.clipboardData.getData('Text')

    if (ipValue != null && ipValue != undefined && ipValue !== '') {
        let reg =
            /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
        //IP地址格式不正确
        if (!reg.test(ipValue)) {
            Message.error('请输入正确的IP地址！')
            setTimeout(() => {
                ipAddress.ip1 = null
                ipAddress.ip2 = null
                ipAddress.ip3 = null
                ipAddress.ip4 = null
            }, 600)
            ipRefs.value[index - 1].value.focus()
        } else {
            let ipList = ipValue.split('.')
            setTimeout(() => {
                ipAddress.ip1 = ipList[0]
                ipAddress.ip2 = ipList[1]
                ipAddress.ip3 = ipList[2]
                ipAddress.ip4 = ipList[3]
                ipRefs.value[4].focus()
            }, 5)
        }
    }
}

//监听键盘（按键盘上的.跳到下一个输入框，或者也可以使用其他按键跳转到下一个输入框）
function keyupEvent(index, e) {
    //不同键盘键位对应 . 的值 87键->190  104键->110
    if (e.keyCode === 110 || e.keyCode === 190) {
        index < 4 && ipRefs.value[index + 1].focus()
        ipAddress['ip' + index + 1] = ''
    }

    //按下backspace删除键
    if (e.keyCode == 8) {
        let ipVal = ipAddress['ip' + index]
        if (ipVal === '' || (ipVal == null && index !== 1)) {
            ipRefs.value[index - 1].focus()
        }
    }

    //按下left
    if (e.keyCode == 37) {
        if (e.srcElement.selectionStart === 0) {
            ipRefs.value[index - 1].focus()
        }
    }

    //按下right
    if (e.keyCode == 39) {
        if (e.srcElement.selectionStart === e.srcElement.value.length) {
            ipRefs.value[index + 1].focus()
        }
    }
}

//输入框输入时
function handleInpIp(val, key) {
    //判断输入的ip值，如果输入值超过255，则显示为255，并且跳到下一个输入框
    if (parseInt(val) > 255) {
        ipAddress[`ip` + key] = 255
        key < 4 && ipRefs.value[key + 1].focus()
    }
    //如果输入的是三位数，且范围在100到255之间，则自动跳到下一个输入值
    else if (parseInt(val) <= 255 && parseInt(val) >= 100) {
        key < 4 && ipRefs.value[key + 1].focus()
    }
}

// 输入框失去焦点时
function submitIp() {
    const invalidIpPart = Object.values(ipAddress).some(part => part == null || part === '')
    if (invalidIpPart) {
        emits('update:value', '')
    } else {
        const ipVal = Object.values(ipAddress).join('.')
        if (!ipVal.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
            Message.error('请输入正确的 IP 地址！')
            Object.keys(ipAddress).forEach(key => (ipAddress[key] = null))
            nextTick(() => ipRefs.value[0].focus())
        } else {
            emits('update:value', ipVal)
        }
    }
}

onMounted(() => {
    // 初始化 IP 地址
    if (props.value) {
        const ipList = props.value.split('.')
        Object.keys(ipAddress).forEach((key, index) => (ipAddress[key] = ipList[index]))
    }
})
onBeforeUnmount(() => {
    localStorage.setItem('showMore', 'false')

})
</script>

<style lang="scss" scoped>
.ipInput {
    width: 200px;
    height: 34px;
    display: flex;
    align-items: center;
    border: 1px solid #dcdfe6;
    border-radius: var(--el-input-border-radius, var(--el-border-radius-base));

    .item {
        display: flex;
        align-items: center;

        .point {
            user-select: none;
        }
    }

    :deep(.el-input .el-input__wrapper) {
        border: none !important;
        box-shadow: none !important;
        padding: 0px 10px !important;
    }

    :deep(.el-input__inner) {
        width: 100%;
        padding: 0 !important;
    }
}
</style>