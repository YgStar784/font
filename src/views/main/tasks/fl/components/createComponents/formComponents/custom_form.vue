<template>
    <div class="form-header">

        <h3>编辑--{{ formTitle }}</h3>
    </div>

    <div v-if="props.customInfo.data.info.params.type === 'codeEdit'" class="code">

        <codemirror v-model="code" placeholder="Code goes here..." :style="{ height: '500px' }" :autofocus="true"
            :indent-with-tab="true" :tab-size="2" :extensions="[languageExtension, oneDark]" @ready="handleReady" />
        <div class="code-type">

            <a-form-item label="代码类型"> <a-space direction="vertical">
                    <a-radio-group v-model:value="currentLanguage">
                        <a-radio-button value="javascript">JS</a-radio-button>
                        <a-radio-button value="python">Python</a-radio-button>
                        <a-radio-button value="json">JSON</a-radio-button>
                    </a-radio-group>
                </a-space></a-form-item>
        </div>

        <div class="op-but">
            <a-button @click="">导出</a-button>
            <a-button type="primary" @click=""> 发送</a-button>
        </div>


    </div>
    <div v-else-if="props.customInfo.data.info.params.type === 'fileUpload'" class="fileUpload">
        <a-upload-dragger v-model:fileList="fileList" name="file" :multiple="true" :customRequest="customRequest"
            :accept="'.py'" @change="handleChange" @drop="handleDrop">
            <p class="ant-upload-drag-icon">
                <inbox-outlined />
            </p>
            <p class="ant-upload-text">Click or drag file to this area to upload</p>
            <p class="ant-upload-hint">
                Support for uploading Python (.py) files only. Drag files or click to upload.
            </p>
        </a-upload-dragger>

    </div>
    <!--     <div class="form-but">
        <a-form-item>
            <a-popconfirm :title='`你确定要刷新${formTitle}吗？`' ok-text="Yes" cancel-text="No"
                @confirm="refreshConfirm(props.layerInfo.id)" @cancel="cancel">
                <a-button>刷新</a-button>
            </a-popconfirm>
        </a-form-item>
        <a-form-item>
            <a-button type="primary" @click="onSubmit">
                保存
            </a-button>
        </a-form-item>

    </div> -->

</template>

<script setup>
import { ref, computed, watch, shallowRef } from 'vue'
import { menu } from '../../menu'
import { Codemirror } from 'vue-codemirror';
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { extendRightForm } from '../rightBarExtend.js'
import { python } from '@codemirror/lang-python'
import { javascript } from '@codemirror/lang-javascript'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { useCodeStore } from '@/stores/codeStore';
import { InboxOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps({
    customInfo: {
        type: Object,
        required: true,
    }
})
const fileList = ref([]);

extendRightForm.value = true
const formTitle = ref(props.customInfo.data.info.params.type === 'codeEdit' ? 'code' : 'upload')
const emits = defineEmits(['updateLayerInfo'])
console.log('props.customInfo', props.customInfo);
// 编辑器内容绑定

// 使用 Pinia Store
const id = props.customInfo.id;

const codeStore = useCodeStore();
const storedCode = codeStore.getCodeById(id);
const code = ref(storedCode || `console.log('Hello, world!');`);

// 日志和状态信息
const logs = ref([]);
const stateInfo = ref({
    cursor: 0,
    selectedLength: 0,
    totalLength: 0,
    totalLines: 0,
});

// 当前语言的名称，默认是 "python"
const currentLanguage = ref('python');
// Codemirror 的语言扩展
const languageExtension = ref(python());
const extensions = [currentLanguage, oneDark]

// 主题和语言切换
const isDarkTheme = ref(true);


// Codemirror 编辑器实例
const view = shallowRef(null);

// 编辑器准备完成
const handleReady = (payload) => {
    view.value = payload.view;
};
// 保存代码到 Store
const saveCodeToStore = () => {
    codeStore.saveCode(id, code.value);
};

// 记录事件日志
const logEvent = (eventName, eventPayload) => {
    logs.value.push(`${new Date().toLocaleTimeString()} - Event: ${eventName}`);
    console.log(eventName, eventPayload);
};

// 上传状态反馈
const handleChange = info => {
    const status = info.file.status;
    if (status !== 'uploading') {
        console.log(info.file, info.fileList);
    }
    if (status === 'done') {
        message.success(`${info.file.name} uploaded successfully.`);
    } else if (status === 'error') {
        message.error(`${info.file.name} upload failed.`);
    }
};
// 自定义上传逻辑
const customRequest = options => {
    const { file, onSuccess, onError } = options;
    const formData = new FormData();
    formData.append('file', file);

    fetch('https://your-api-endpoint', {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (response.ok) {
                onSuccess(response);
                message.success('Upload successful!');
            } else {
                onError(response);
                message.error('Upload failed. Please try again.');
            }
        })
        .catch(error => {
            onError(error);
            message.error('Network error. Please check your connection.');
        });
};
// 获取编辑器状态信息
const getCodemirrorStates = () => {
    if (view.value) {
        const state = view.value.state;
        const ranges = state.selection.ranges;
        const selectedLength = ranges.reduce((r, range) => r + range.to - range.from, 0);
        const cursor = ranges[0].anchor;
        const totalLength = state.doc.length;
        const totalLines = state.doc.lines;

        stateInfo.value = {
            cursor,
            selectedLength,
            totalLength,
            totalLines,
        };
    }
};

// 切换主题
const toggleTheme = () => {
    isDarkTheme.value = !isDarkTheme.value;
};

// 切换语言
const switchLanguage = (lang) => {
    currentLanguage.value = lang === 'javascript' ? javascript() : python();
};
const refreshConfirm = (id) => {
    const initValue = ref({})
    menu.forEach(item => {
        item.children.forEach(child => {
            if (child.id === id) {
                console.log('child', child);
                initValue.value = child
                console.log('props.layerInfo', props.layerInfo);
                emits('updateLayerInfo', initValue.value);
            }
        })
    })

};
// 监听 `currentLanguage` 的变化，根据选中语言切换 Codemirror 的扩展
watch(currentLanguage, (newLang) => {
    switch (newLang) {
        case 'javascript':
            languageExtension.value = javascript();
            break;
        case 'python':
            languageExtension.value = python();
            break;
        case 'json':
            languageExtension.value = json();
            break;
        default:
            languageExtension.value = python();
    }
});

// 监听编辑器内容变化并保存
watch(code, (newCode) => {
    saveCodeToStore();
});
const cancel = e => {
    console.log(e);
};
const onSubmit = () => {
    // 使用 `emit` 触发事件，将 `updatedFormula` 传递给父组件
    emits('updateLayerInfo', props.layerInfo);

};

</script>

<style lang="scss" scoped>
.form-header {
    width: 100%;
    height: 30px;
    background-color: rgb(243.9, 244.2, 244.8);
    line-height: 30px;
    padding: 8px;
    padding-left: 16px;
    box-sizing: content-box;
    margin-bottom: 0;
}

.form-but {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: space-around;
}

.code {
    gap: 5px;
    margin-top: 0px;
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;

    overflow: auto;
}

.code-type {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    justify-content: flex-end;
}

.op-but {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    /* 子元素靠右对齐 */
    gap: 10px;
    /* 按钮间距 */
    padding-right: 10px;
    /* 添加右边的内边距可选 */
}

.fileUpload {
    width: 100%;
    box-sizing: border-box;
    padding: 8px;
}
</style>