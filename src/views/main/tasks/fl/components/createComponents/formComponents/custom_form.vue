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
                        <a-radio-button value="javascript" disabled>JS</a-radio-button>
                        <a-radio-button value="python" disabled>Python</a-radio-button>
                        <a-radio-button value="json">JSON</a-radio-button>
                    </a-radio-group>
                </a-space></a-form-item>
        </div>

        <div class="op-but">
            <!--             <a-button @click="">导出</a-button>
 --> <a-button type="primary" @click="createtask"> 发送</a-button>
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
import { ref, reactive, computed, watch, shallowRef } from 'vue'
import { menu } from '../../menu'
import SomeTools from '@/utils/someTools'
import { nowDate } from '../../../../date'
import { ElMessage } from 'element-plus'
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
import axios from 'axios'
import { useRouter } from 'vue-router';

const props = defineProps({
    customInfo: {
        type: Object,
        required: true,
    }
})
const router = useRouter();

const fileList = ref([]);
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
extendRightForm.value = true
const formTitle = ref(props.customInfo.data.info.params.type === 'codeEdit' ? 'code' : 'upload')
const emits = defineEmits(['updateLayerInfo'])
console.log('props.customInfo', props.customInfo);
// 编辑器内容绑定

// 使用 Pinia Store
const id = props.customInfo.id;

const codeStore = useCodeStore();
const storedCode = codeStore.getCodeById(id);
const code = ref(`{
    "taskName": "FL训练任务",
    "taskDescription": "FL训练任务测试",
    "taskParams": {
        "name": "FL训练任务",
        "serverNode": {
            "address": "120.48.255.3:8000",
            "dataDescription": "server训练数据"
        },
        "clientNodes": [
            {
                "address": "120.48.18.15:8000",
                "dataDescription": "client0训练数据"
            },
            {
                "address": "106.13.196.201:8000",
                "dataDescription": "client1训练数据"
            }
        ],
        "n_rounds": 5,
        "alg": 1,
        "model_config": {
            "tag": "mnist_cnn",
            "device": "cuda",
            "task_type": "multi_classification",
            "model_type": "fed_model",
            "n_components": 1,
            "n_epochs": 1,
            "batch_size": 32,
            "optimizer": "sgd",
            "learning_rate": 0.1,
            "loss": "ce",
            "layers": [
                {
                    "type": "conv2d",
                    "in_channels": 1,
                    "out_channels": 32,
                    "kernel_size": 3,
                    "padding": 1,
                    "stride": 1
                },
                {
                    "type": "relu"
                },
                {
                    "type": "maxpool",
                    "kernel_size": 2,
                    "stride": 2,
                    "padding": 0
                },
                {
                    "type": "conv2d",
                    "in_channels": 32,
                    "out_channels": 64,
                    "kernel_size": 3,
                    "padding": 1,
                    "stride": 1
                },
                {
                    "type": "relu"
                },
                {
                    "type": "maxpool",
                    "kernel_size": 2,
                    "stride": 2,
                    "padding": 0
                },
                {
                    "type": "reshape",
                    "shape": [-1, 3136]
                },
                {
                    "type": "linear",
                    "in_features": 3136,
                    "out_features": 128
                },
                {
                    "type": "linear",
                    "in_features": 128,
                    "out_features": 10
                },
                {
                    "type": "softmax",
                    "dim": 1
                }
            ]
        }
    }
}
    `)

// 日志和状态信息
const logs = ref([]);
const stateInfo = ref({
    cursor: 0,
    selectedLength: 0,
    totalLength: 0,
    totalLines: 0,
});

// 当前语言的名称，默认是 "python"
const currentLanguage = ref('json');
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

function validateCodeObject(codeObject) {
    const errors = [];

    // 任务基本信息校验
    if (!codeObject.taskName || codeObject.taskName.length < 1 || codeObject.taskName.length > 50) {
        errors.push('任务名称不能为空');
    }

    // 服务端节点校验
    const serverNode = codeObject.taskParams?.serverNode;
    if (!serverNode) {
        errors.push('服务端节点信息缺失');
    } else {
        if (!serverNode.address || !/^(\d{1,3}\.){3}\d{1,3}:\d+$/.test(serverNode.address)) {
            errors.push('服务端地址格式不正确，应为 IP:PORT 格式');
        }


    }

    // 客户端节点校验
    const clientNodes = codeObject.taskParams?.clientNodes || [];
    if (clientNodes.length === 0) {
        errors.push('至少需要一个客户端节点');
    } else {
        clientNodes.forEach((node, index) => {
            if (!node.address || !/^(\d{1,3}\.){3}\d{1,3}:\d+$/.test(node.address)) {
                errors.push(`客户端节点 ${index + 1} 地址格式不正确`);
            }

        });
    }

    // 训练参数校验
    if (!Number.isInteger(codeObject.taskParams?.n_rounds) || codeObject.taskParams.n_rounds <= 0) {
        errors.push('训练轮数必须为大于 0 的整数');
    }
    if (codeObject.taskParams.alg == null) {
        errors.push('聚合算法编号不能为空');
    }

    // 模型配置校验
    const modelConfig = codeObject.taskParams?.model_config;
    if (!modelConfig) {
        errors.push('模型配置缺失');
    } else {
        if (!modelConfig.tag || !modelConfig.device || !modelConfig.task_type || !modelConfig.model_type) {
            errors.push('模型配置的 tag、device、task_type 和 model_type 不能为空');
        }
        if (!Number.isInteger(modelConfig.n_epochs) || modelConfig.n_epochs <= 0) {
            errors.push('训练 epoch 数必须为大于 0 的整数');
        }
        if (modelConfig.learning_rate <= 0) {
            errors.push('学习率必须大于 0');
        }
        if (!modelConfig.layers || modelConfig.layers.length === 0) {
            errors.push('模型 layers 不能为空');
        } else {
            const validLayerTypes = [
                'conv1d', 'conv2d', 'relu', 'maxpool', 'reshape', 'linear', 'softmax', 'sigmoid',
                'batchnorm1d', 'flatten', 'transformer', 'lstm', 'lazyconv2d', 'lazy_linear', 'lazy_conv2d'
            ];

            modelConfig.layers.forEach((layer, index) => {
                if (!layer.type || typeof layer.type !== 'string') {
                    errors.push(`第 ${index + 1} 层的 type 字段不能为空，且应为字符串`);
                }

                if (!validLayerTypes.includes(layer.type.toLowerCase())) {
                    errors.push(`第 ${index + 1} 层的 type 无效，应为 ${validLayerTypes.join('、')}`);
                }

                // 针对不同层的参数校验
                switch (layer.type.toLowerCase()) {
                    case 'conv1d':
                    case 'conv2d':
                    case 'lazyconv2d':
                        if (!Number.isInteger(layer.in_channels) || layer.in_channels <= 0) {
                            errors.push(`第 ${index + 1} 层的 in_channels 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.out_channels) || layer.out_channels <= 0) {
                            errors.push(`第 ${index + 1} 层的 out_channels 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.kernel_size) || layer.kernel_size <= 0) {
                            errors.push(`第 ${index + 1} 层的 kernel_size 必须为大于 0 的整数`);
                        }
                        if (typeof layer.stride !== 'number' || layer.stride < 0) {
                            errors.push(`第 ${index + 1} 层的 stride 必须为非负数`);
                        }
                        if (typeof layer.padding !== 'number' || layer.padding < 0) {
                            errors.push(`第 ${index + 1} 层的 padding 必须为非负数`);
                        }
                        break;

                    case 'transformer':
                        if (typeof layer.d_model !== 'number' || layer.d_model <= 0) {
                            errors.push(`第 ${index + 1} 层的 d_model 必须为正整数`);
                        }
                        if (!Number.isInteger(layer.nhead) || layer.nhead <= 0) {
                            errors.push(`第 ${index + 1} 层的 nhead 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.num_encoder_layers) || layer.num_encoder_layers <= 0) {
                            errors.push(`第 ${index + 1} 层的 num_encoder_layers 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.num_decoder_layers) || layer.num_decoder_layers <= 0) {
                            errors.push(`第 ${index + 1} 层的 num_decoder_layers 必须为大于 0 的整数`);
                        }
                        if (typeof layer.dim_feedforward !== 'number' || layer.dim_feedforward <= 0) {
                            errors.push(`第 ${index + 1} 层的 dim_feedforward 必须为正整数`);
                        }
                        if (typeof layer.Dropout !== 'number' || layer.Dropout < 0 || layer.Dropout > 1) {
                            errors.push(`第 ${index + 1} 层的 Dropout 必须是 0 到 1 之间的数值`);
                        }
                        if (!['relu', 'gelu'].includes(layer.activation?.toLowerCase())) {
                            errors.push(`第 ${index + 1} 层的 activation 字段无效，应为 'relu' 或 'gelu'`);
                        }
                        break;

                    case 'lstm':
                        if (!Number.isInteger(layer.input_size) || layer.input_size <= 0) {
                            errors.push(`第 ${index + 1} 层的 input_size 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.hidden_size) || layer.hidden_size <= 0) {
                            errors.push(`第 ${index + 1} 层的 hidden_size 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.num_layers) || layer.num_layers <= 0) {
                            errors.push(`第 ${index + 1} 层的 num_layers 必须为大于 0 的整数`);
                        }
                        if (typeof layer.batch_first !== 'boolean') {
                            errors.push(`第 ${index + 1} 层的 batch_first 必须为布尔值`);
                        }
                        if (typeof layer.Dropout !== 'number' || layer.Dropout < 0 || layer.Dropout > 1) {
                            errors.push(`第 ${index + 1} 层的 Dropout 必须是 0 到 1 之间的数值`);
                        }
                        if (typeof layer.bidirectional !== 'boolean') {
                            errors.push(`第 ${index + 1} 层的 bidirectional 必须为布尔值`);
                        }
                        break;

                    case 'linear':
                        if (!Number.isInteger(layer.in_features) || layer.in_features <= 0) {
                            errors.push(`第 ${index + 1} 层的 in_features 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.out_features) || layer.out_features <= 0) {
                            errors.push(`第 ${index + 1} 层的 out_features 必须为大于 0 的整数`);
                        }
                        break;

                    case 'maxpool':
                        if (!Number.isInteger(layer.kernel_size) || layer.kernel_size <= 0) {
                            errors.push(`第 ${index + 1} 层的 kernel_size 必须为大于 0 的整数`);
                        }
                        if (!Number.isInteger(layer.stride) || layer.stride <= 0) {
                            errors.push(`第 ${index + 1} 层的 stride 必须为大于 0 的整数`);
                        }
                        if (typeof layer.padding !== 'number' || layer.padding < 0) {
                            errors.push(`第 ${index + 1} 层的 padding 必须为非负数`);
                        }
                        break;

                    case 'batchnorm1d':
                        if (!Number.isInteger(layer.num_features) || layer.num_features <= 0) {
                            errors.push(`第 ${index + 1} 层的 num_features 必须为大于 0 的整数`);
                        }
                        if (typeof layer.eps !== 'number' || layer.eps <= 0) {
                            errors.push(`第 ${index + 1} 层的 eps 必须为正数`);
                        }
                        if (typeof layer.momentum !== 'number' || layer.momentum < 0 || layer.momentum > 1) {
                            errors.push(`第 ${index + 1} 层的 momentum 必须是 0 到 1 之间的数值`);
                        }
                        break;

                    case 'reshape':
                        if (!Array.isArray(layer.shape) || layer.shape.length === 0) {
                            errors.push(`第 ${index + 1} 层的 shape 必须为非空数组`);
                        }
                        break;

                    case 'flatten':
                    case 'relu':
                    case 'sigmoid':
                    case 'softmax':
                        break; // 这些层不需要其他参数
                }
            });
        }
    }

    // 返回校验结果
    if (errors.length > 0) {
        errors.forEach((err) => ElMessage({ type: 'error', message: err }));
        return false; // 校验未通过
    }

    return true; // 校验通过
}
const createtask = async () => {
    const codeObject = reactive({})


    try {
        // 使用 Object.assign 将解析的 JSON 赋值到 `codeObject` 中
        Object.assign(codeObject, JSON.parse(code.value));
        console.log("转换后的对象格式：", codeObject);
    } catch (error) {
        ElMessage({ type: 'error', message: '请输入正确的 JSON 格式' });
    }
    codeObject.taskUuid = SomeTools.guid()
    codeObject.createTime = nowDate(time)
    codeObject.taskParams.name = code.taskName
    codeObject.taskParams.taskId = code.taskUuid
    if (codeObject.taskParams.serverNode) {
        codeObject.taskParams.serverNode.uuid = SomeTools.guid()
    }
    if (codeObject.taskParams.clientNodes) {
        codeObject.taskParams.clientNodes.forEach(
            node => {
                node.uuid = SomeTools.guid()
            }
        )
    }
    if (validateCodeObject(codeObject)) {
        // 校验通过，发起请求
        console.log('提交成功，发起任务');
        await axios.post(
            '/api/FL/createTrainTask', codeObject
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
                    router.push({ name: 'federatedLearning' });

                } else if (res.data.code === 1006) {
                    ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
                    setTimeout(() => {
                        router.push({ path: '/login' }); // 确保路径和名称正确
                    }, 500); // 避免动画加载导致页面阻塞
                    return
                }
                else {
                    const msg = res.message
                    ElMessage({
                        type: 'error',
                        message: '任务发起失败,请重试'
                    })
                }
            })
    }


}
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