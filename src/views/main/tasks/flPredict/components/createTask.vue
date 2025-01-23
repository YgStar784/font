<template>
    <el-dialog v-loading="loading" class="flPr-add-dialog" @open="handleOpen" width="1200" :model-value="dialogVisible"
        @close="handleClose" top="5vh" title="联邦预测-任务创建" append-to-body destroy-on-close>

        <el-form class="form-container" label-position="right" label-width="120px" :model="form" :rules="rules"
            ref="formRef">
            <div>
                <el-form-item label="任务名称:" label-position="left" prop="taskName">
                    <el-input style="width: 240px" v-model="form.taskName"></el-input>
                </el-form-item>
                <el-form-item label="任务描述:" label-position="right">
                    <el-input v-model="form.taskDescription" style="width: 240px" autosize type="textarea"
                        placeholder="请输入任务描述" /> </el-form-item>
                <el-form-item label="模型文件:" prop="model">
                    <el-upload ref="modelUpload" v-model:file-list="modelList" :limit="1" class="upload-demo" action="#"
                        :http-request="httpRequest" :before-upload="beforeUploadModel" :on-exceed="handleModelExceed"
                        :on-change="handleFileChange('model')" :auto-upload="false" accept=".pth">
                        <el-button type="primary">点击上传</el-button>
                        <template #tip>
                            <div class="el-upload__tip">
                                文件后缀名".pth"
                            </div>
                        </template>
                    </el-upload>
                </el-form-item>

                <el-form-item label="输入文件:" prop="input">
                    <el-upload ref="inputUpload" v-model:file-list="inputList" class="upload-demo"
                        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
                        :before-upload="beforeUploadInput" :limit="1" :on-exceed="handleInputExceed"
                        :http-request="httpRequest" :on-change="handleFileChange('input')" :auto-upload="false"
                        accept=".zip,.csv,.xls,.sql">
                        <el-button type="primary">点击上传</el-button>
                        <template #tip>
                            <div class="el-upload__tip">
                                文件后缀名"zip",".xls",".csv",".sql"
                            </div>
                        </template>
                    </el-upload>

                </el-form-item>
                <el-row>
                    <el-form-item label="输入数据类型 :">
                        <a-select v-model:value="SelectedType" style="width: 120px" :options="dataType" @focus="focus"
                            @change="handleChange" :getPopupContainer="getDialogContainer"></a-select>
                    </el-form-item>
                    <el-form-item v-if="SelectedType === 4" label="image_format">
                        <a-select v-model:value="selectedFormat" id="image-format" :options="imageForamtType"
                            @focus="focus" style="width: 120px" :getPopupContainer="getDialogContainer">
                        </a-select>
                    </el-form-item>
                </el-row>
                <el-form-item label="聚合算法:">
                    <a-select v-model:value="selectedAlg" style="width:150px" :getPopupContainer="getDialogContainer"
                        :options="algOptions" @focus="focus"></a-select>
                </el-form-item>

            </div>
            <div style="height: 100%;">
                <el-form-item label="模型配置：" style="height: 100%;" prop="modelConfig">
                    <JsonEditorVue v-model="modelConfig" :mode="'tree'"
                        style=" border: none;width:500px; max-height: 500px;  overflow-y: auto;" />
                </el-form-item>
            </div>
        </el-form>


        <div class="sub-but">
            <el-button type="primary" @click="submitForm">提交</el-button>
            <el-button @click="handleClose">取消</el-button>
        </div>
    </el-dialog>
</template>

<script setup>
import SomeTools from '@/utils/someTools'
import { nowDate } from '../../date'
import { ref, reactive } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus';
import { genFileId } from 'element-plus'
import { menu } from '../../fl/components/menu.js'
import JsonEditorVue from 'json-editor-vue'
import axios from 'axios'
import { useRouter } from 'vue-router';
const router = useRouter()
const emits = defineEmits(['update:modelValue', 'initTaskList'])
const modelUpload = ref(null)
const inputUpload = ref(null)
const dialogVisible = ref(false)
const formRef = ref(null)
const loading = ref(false)
const form = reactive({
    taskName: '',
    taskDescription: '',
    model: null,
    input: null,
    data: {},
    modelConfig: {}
})
var getTime = new Date().getTime(); //获取到当前时间戳
var time = new Date(getTime); //创建一个日期对象
const modelList = ref([])
const inputList = ref([])
const handleClose = () => {
    emits('update:modelValue', false)
}
const selectedAlg = ref(1)
const algOptions = ref([
    { label: 'FedSGD', value: 1 },
    { label: 'FedAvg', value: 2 },
    { label: 'FedProx', value: 1001 },
    { label: 'Scaffold', value: 1002 },
    { label: 'Fednova', value: 1003 },
    { label: 'MOON', value: 1004 },
    { label: 'pFedMe', value: 1005 },
    { label: 'IFCA', value: 1006 },
    { label: 'FedEM', value: 1007 },
    { label: 'FedMut', value: 1008 },
    { label: 'FedCross', value: 1009 },
    { label: 'FedMR', value: 1010 },
    { label: 'DFedAvgM', value: 2001 },
    { label: 'QuantizedDFedAvgM', value: 2002 },
    { label: 'DisPFL', value: 2003 },
    { label: 'NET-FLEET', value: 2004 },
    { label: 'MPCAvg', value: 3001 },
    { label: 'Krum', value: 3002 },
    { label: 'MedianAggr', value: 3003 },
    { label: 'TrimmedMeanAggr', value: 3004 },
    { label: 'Bulyan', value: 3005 },
    { label: 'DPAvg', value: 3006 },
    { label: 'PaillierAvg', value: 3007 },
    { label: 'FoolsGold', value: 3008 },
    { label: 'BatchCrypt', value: 3009 },
]);
const modelConfig = ref()

const SelectedType = ref(1)
const selectedFormat = ref('gray')
const dataType = ref([{ value: 1, label: 'MySQL' }
    ,
{ value: 2, label: 'CSV' },
{ value: 3, label: 'Excel' }
    , { value: 4, label: 'ImageZip' },
])

const imageForamtType = ref([{ value: 'gray', label: 'gray' }, { value: 'rgb', label: 'rgb' }, { value: 'rgba', label: 'rgba' }, { value: 'jpeg', label: 'jpeg' }, { value: 'png', label: 'png' }])
// 移动函数定义到引用前面
const validateModelFile = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('模型文件是必填项'))
    }
    if (!value[0].name.endsWith('.pth')) {
        return callback(new Error('仅支持 .pth 文件'))
    }
    callback()
}

const validateInputFile = (rule, value, callback) => {
    if (!value) {
        return callback(new Error('输入文件是必填项'))
    }
    if (!value[0].name.endsWith('.zip')) {
        return callback(new Error('仅支持 .zip 文件'))
    }
    callback()
}

const validateJSON = (rule, value, callback) => {
    try {
        JSON.parse(value)
        callback()
    } catch (e) {
        callback(new Error('无效的 JSON 数据'))
    }
}

const rules = reactive({
    taskName: [{ required: true, message: '请输入任务名称', trigger: 'blur' }
    ],
    model: [{ required: true, message: '请上传模型文件', trigger: 'blur' }],
    input: [{ required: true, message: '请上传输入文件', trigger: 'blur' }],
    data: [
        { required: true, message: '请输入 JSON 数据', trigger: 'blur' },
        { validator: validateJSON, trigger: 'blur' }
    ],
    modelConfig: [
        {
            validator: (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('模型配置不能为空'));
                }

                // 检查 tag
                if (!value.tag || typeof value.tag !== 'string') {
                    return callback(new Error('tag 字段不能为空，且应为字符串'));
                }

                // 检查 device
                if (!['cpu', 'cuda'].includes(value.device)) {
                    return callback(new Error('device 字段只能是 "cpu" 或 "cuda"'));
                }

                // 检查 task_type
                if (!['multi_classification', 'binary_classification', 'regression'].includes(value.task_type)) {
                    return callback(new Error('task_type 字段无效，请选择有效任务类型'));
                }

                // 检查 n_components
                if (!Number.isInteger(value.n_components) || value.n_components < 1) {
                    return callback(new Error('n_components 必须是大于等于 1 的整数'));
                }

                // 检查 n_epochs
                if (!Number.isInteger(value.n_epochs) || value.n_epochs < 1) {
                    return callback(new Error('n_epochs 必须是大于等于 1 的整数'));
                }

                // 检查 batch_size
                if (!Number.isInteger(value.batch_size) || value.batch_size <= 0) {
                    return callback(new Error('batch_size 必须是大于 0 的整数'));
                }

                // 检查 optimizer
                if (!['sgd', 'adam', 'rmsprop'].includes(value.optimizer)) {
                    return callback(new Error('optimizer 字段无效，请选择 "sgd"、"adam"、"rmsprop" 等优化器'));
                }

                // 检查 learning_rate
                if (typeof value.learning_rate !== 'number' || value.learning_rate <= 0 || value.learning_rate >= 1) {
                    return callback(new Error('learning_rate 必须是 0 到 1 之间的数值'));
                }

                // 检查 loss
                if (!value.loss || typeof value.loss !== 'string') {
                    return callback(new Error('loss 字段不能为空，且应为字符串'));
                }

                // 检查 layers
                if (!Array.isArray(value.layers) || value.layers.length === 0) {
                    return callback(new Error('layers 字段必须为非空数组'));
                }

                const validLayerTypes = [
                    'conv1d', 'conv2d', 'relu', 'maxpool', 'reshape', 'linear', 'softmax',
                    'sigmoid', 'batchnorm1d', 'flatten', 'transformer', 'lstm',
                    'lazyconv2d', 'lazy_linear', 'lazy_conv2d', 'linear'
                ];

                for (let i = 0; i < value.layers.length; i++) {
                    const layer = value.layers[i];

                    if (!layer.type || typeof layer.type !== 'string') {
                        return callback(new Error(`第 ${i + 1} 层的 type 字段不能为空，且应为字符串`));
                    }

                    if (!validLayerTypes.includes(layer.type.toLowerCase())) {
                        return callback(new Error(`第 ${i + 1} 层的 type 无效，应为 ${validLayerTypes.join('、')}`));
                    }

                    // 检查具体参数配置
                    switch (layer.type.toLowerCase()) {
                        case 'conv1d':
                        case 'conv2d':
                        case 'lazyconv2d':
                            if (!Number.isInteger(layer.in_channels) || layer.in_channels <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 in_channels 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.out_channels) || layer.out_channels <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 out_channels 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.kernel_size) || layer.kernel_size <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 kernel_size 必须为大于 0 的整数`));
                            }
                            if (typeof layer.stride !== 'number' || layer.stride < 0) {
                                return callback(new Error(`第 ${i + 1} 层的 stride 必须为非负数`));
                            }
                            if (typeof layer.padding !== 'number' || layer.padding < 0) {
                                return callback(new Error(`第 ${i + 1} 层的 padding 必须为非负数`));
                            }
                            break;

                        case 'transformer':
                            if (typeof layer.d_model !== 'number' || layer.d_model <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 d_model 必须为正整数`));
                            }
                            if (!Number.isInteger(layer.nhead) || layer.nhead <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 nhead 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.num_encoder_layers) || layer.num_encoder_layers <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 num_encoder_layers 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.num_decoder_layers) || layer.num_decoder_layers <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 num_decoder_layers 必须为大于 0 的整数`));
                            }
                            if (typeof layer.dim_feedforward !== 'number' || layer.dim_feedforward <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 dim_feedforward 必须为正整数`));
                            }
                            if (typeof layer.Dropout !== 'number' || layer.Dropout < 0 || layer.Dropout > 1) {
                                return callback(new Error(`第 ${i + 1} 层的 Dropout 必须是 0 到 1 之间的数值`));
                            }
                            if (!['relu', 'gelu'].includes(layer.activation.toLowerCase())) {
                                return callback(new Error(`第 ${i + 1} 层的 activation 字段无效，应为 'relu' 或 'gelu'`));
                            }
                            break;

                        case 'lstm':
                            if (!Number.isInteger(layer.input_size) || layer.input_size <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 input_size 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.hidden_size) || layer.hidden_size <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 hidden_size 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.num_layers) || layer.num_layers <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 num_layers 必须为大于 0 的整数`));
                            }
                            if (typeof layer.batch_first !== 'boolean') {
                                return callback(new Error(`第 ${i + 1} 层的 batch_first 必须为布尔值`));
                            }
                            if (typeof layer.Dropout !== 'number' || layer.Dropout < 0 || layer.Dropout > 1) {
                                return callback(new Error(`第 ${i + 1} 层的 Dropout 必须是 0 到 1 之间的数值`));
                            }
                            if (typeof layer.bidirectional !== 'boolean') {
                                return callback(new Error(`第 ${i + 1} 层的 bidirectional 必须为布尔值`));
                            }
                            break;

                        case 'linear':
                            if (!Number.isInteger(layer.in_features) || layer.in_features <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 in_features 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.out_features) || layer.out_features <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 out_features 必须为大于 0 的整数`));
                            }
                            break;

                        case 'maxpool':
                            if (!Number.isInteger(layer.kernel_size) || layer.kernel_size <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 kernel_size 必须为大于 0 的整数`));
                            }
                            if (!Number.isInteger(layer.stride) || layer.stride <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 stride 必须为大于 0 的整数`));
                            }
                            if (typeof layer.padding !== 'number' || layer.padding < 0) {
                                return callback(new Error(`第 ${i + 1} 层的 padding 必须为非负数`));
                            }
                            break;

                        case 'batchnorm1d':
                            if (!Number.isInteger(layer.num_features) || layer.num_features <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 num_features 必须为大于 0 的整数`));
                            }
                            if (typeof layer.eps !== 'number' || layer.eps <= 0) {
                                return callback(new Error(`第 ${i + 1} 层的 eps 必须为正数`));
                            }
                            if (typeof layer.momentum !== 'number' || layer.momentum < 0 || layer.momentum > 1) {
                                return callback(new Error(`第 ${i + 1} 层的 momentum 必须是 0 到 1 之间的数值`));
                            }
                            break;

                        case 'reshape':
                            if (!Array.isArray(layer.shape) || layer.shape.length === 0) {
                                return callback(new Error(`第 ${i + 1} 层的 shape 必须为非空数组`));
                            }
                            break;

                        case 'flatten':
                        case 'relu':
                        case 'sigmoid':
                        case 'softmax':
                            break; // 这些层不需要其他参数
                    }
                }

                callback(); // 校验通过
            },
            trigger: 'change'
        }
    ]
})

const getDialogContainer = () => document.querySelector('.flPr-add-dialog')
function unifyJsonFormat(input) {
    // 尝试解析输入为对象
    try {
        // 如果输入是对象，直接返回
        if (typeof input === "object" && input !== null) {
            return input;
        }

        // 如果输入是字符串，尝试解析 JSON
        if (typeof input === "string") {
            return JSON.parse(input);
        }
    } catch (error) {
        console.error("Failed to parse JSON:", error.message);
    }

    // 如果解析失败，返回 null 或抛出错误
    console.error("Invalid input, unable to unify format");
    return null;
}

const beforeUploadModel = (file) => {
    console.log('file', file);
    const isPth = file.name.endsWith('.pth')
    if (!isPth) {
        ElMessage({ type: 'error', message: '只能上传 .pth 文件' })

    }
    return isPth
}

const beforeUploadInput = (file) => {
    const isZip = file.type === 'application/zip' && file.name.endsWith('.zip')
    if (!isZip) {
        ElMessage({ type: 'error', message: '上传的文件格式不符' })
    }
    return isZip
}

const handleFileChange = (field) => {
    console.log('field', field);
}
const handleModelExceed = (files) => {
    modelUpload.value.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    modelUpload.value.handleStart(file);
};
const handleInputExceed = (files) => {
    inputUpload.value.clearFiles();
    const file = files[0];
    file.uid = genFileId();
    inputUpload.value.handleStart(file);
};
const submitForm = async () => {
    console.log('model,input', modelList.value[0], inputList.value);
    form.model = modelList.value[0],
        form.input = inputList.value[0]
    if (!formRef.value) return
    form.modelConfig = unifyJsonFormat(modelConfig.value)
    formRef.value.validate(async (valid) => {
        const data = reactive({})
        data.name = form.taskName
        data.taskUuid = SomeTools.guid()
        data.taskDescription = form.taskDescription
        data.createTime = nowDate(time)
        data.task_id = data.taskUuid
        data.alg = selectedAlg.value
        data.image_format = selectedFormat.value
        data.model_config = unifyJsonFormat(modelConfig.value)
        console.log('data.model_config', data.model_config);


        console.log('data', data);
        if (inputList.value[0].raw.name.endsWith('.zip')) {
            data.type = 4
        } else if (inputList.value[0].raw.name.endsWith('.csv')) {
            data.type = 2
        } else if (inputList.value[0].raw.name.endsWith('.xls')) {
            data.type = 3
        } else if (inputList.value[0].raw.name.endsWith('.sql')) {
            data.type = 1
        }
        if (valid) {
            const formData = new FormData()
            formData.append('model', modelList.value[0].raw)
            formData.append('input', inputList.value[0].raw)

            // 将 data 对象转换为 JSON 字符串
            formData.append('data', JSON.stringify(data));

            console.log([...formData.entries()]);
            await axios.post('/api/FL/startPredictionTask', formData
                , {
                    headers: {
                        Authorization: localStorage.getItem('token'),

                    }
                }).then(res => {
                    console.log(res)
                    if (res.data.code === 1000) {
                        ElMessage({ type: 'success', message: '发起成功' })
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
                        const msg = res.data.message
                        ElMessage({
                            type: 'error',
                            message: msg,
                        })
                    }
                })
        } else {
            console.log('表单验证失败')
        }
    })
}
/* const submitForm = async () => {
    console.log('model,input', modelList.value[0], inputList.value);

    form.model = modelList.value[0];
    form.input = inputList.value[0];

    if (!formRef.value) return;

    formRef.value.validate(async (valid) => {
        if (!valid) {
            console.log('表单验证失败');
            return;
        }

        const data = {
            name: form.taskName,
            taskUuid: SomeTools.guid(),
            taskDescription: form.taskDescription,
            createTime: nowDate(time),
            task_id: SomeTools.guid(),
            alg: selectedAlg.value,
            image_format: selectedFormat.value,
            model_config: modelConfig.value,
            type: null,
        };

        // 根据文件后缀设置 data.type
        const fileName = inputList.value[0].raw.name;
        if (fileName.endsWith('.zip')) {
            data.type = 4;
        } else if (fileName.endsWith('.csv')) {
            data.type = 2;
        } else if (fileName.endsWith('.xls')) {
            data.type = 3;
        } else if (fileName.endsWith('.sql')) {
            data.type = 1;
        }

        console.log('data', data);

        // 创建 FormData 对象
        const formData = new FormData();
        formData.append('model', modelList.value[0].raw);
        formData.append('input', inputList.value[0].raw);
        formData.append('data', JSON.stringify(data)); // 将 data 转为 JSON 字符串

        try {

            const response = await axios.post('/api/FL/startPredictionTask', formData, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            });

            if (response.data.code === 1000) {
                ElMessage({ type: 'success', message: '发起成功' });
            } else {
                ElMessage({ type: 'error', message: response.data.message });
            }
        } catch (error) {
            console.error('请求失败', error);
            ElMessage({ type: 'error', message: '请求失败，请重试' });
        }
    });
};  */
</script>

<style lang="scss" scoped>
.sub-but {
    display: flex;
    flex-direction: row;
    justify-content: center;
    flex-wrap: nowrap;
    gap: 20px;
}

.form-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: space-around;
}
</style>