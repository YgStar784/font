<template>
    <el-dialog class="dialog" :model-value="props.dialogVisibleAccept" @close="handleClose">
        <el-card style=" padding-top: 20px; margin-bottom: 20px;">
            <el-descriptions title="基本信息">
                <el-descriptions-item label="任务ID">{{ props.taskInfo.id }}</el-descriptions-item>
                <el-descriptions-item label="任务名称">{{ props.taskInfo.taskName }}</el-descriptions-item>
                <el-descriptions-item label="角色">任务参与方</el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ props.taskInfo.createTime }}</el-descriptions-item>
                <el-descriptions-item label="任务描述">{{ props.taskInfo.taskDescription }}</el-descriptions-item>
                <el-descriptions-item label="数据源描述" label-class-name="my-label" class-name="my-content">{{
                    props.taskInfo.dataDescription }}</el-descriptions-item>
            </el-descriptions>
        </el-card>

        <el-card>
            <el-form :model="form" ref="formRef" :rules="dynamicRules" label-position="left"
                style="max-width: 600px;padding-left: 30px" label-width="130px">

                <el-form-item label="数据源名称:" prop="dataSourceName">
                    <el-input placeholder="请输入数据源名称" v-model="form.dataSourceName" />
                </el-form-item>

                <el-form-item label="导入类型:" prop="type">
                    <el-radio-group v-model="form.type" class="ml-4">
                        <el-radio :value="0" size="large">Excel</el-radio>
                        <el-radio :value="1" size="large">MySQL</el-radio>
                        <!--                     <el-radio :value="2" size="large">达梦数据库</el-radio>
                    <el-radio :value="3" size="large">Oracle</el-radio> -->
                    </el-radio-group>
                </el-form-item>
                <div v-show="form.type === 0">

                    <el-form-item label="Excel文件路径:" prop="path">
                        <el-input placeholder="请输入文件在节点的路径,如'./ns_bank.xlsx'" v-model="form.path" />
                    </el-form-item>
                </div>
                <div v-show="form.type != 0">
                    <el-form-item label="数据库名称:" prop="dbName">
                        <el-input placeholder="请输入数据库名称" v-model="form.dbName" />
                    </el-form-item>
                    <el-form-item label="数据库IP:" prop="dbIp">
                        <el-input placeholder="请输入数据库IP" v-model="form.dbIp" />
                    </el-form-item>

                    <el-form-item label="数据库端口:" prop="dbPort">
                        <el-input placeholder="请输入数据库端口" v-model="form.dbPort" />
                    </el-form-item>
                    <el-form-item label="数据表名称:" prop="tbName">
                        <el-input placeholder="请输入数据表名称" v-model="form.tbName" />

                    </el-form-item>
                    <el-form-item label="数据库用户名:" prop="uname">
                        <el-input placeholder="请输入数据库用户名" v-model="form.uname" />
                    </el-form-item>
                    <el-form-item label-width="130px" label="数据库用户密码:" prop="upwd">
                        <el-input placeholder="请输入数据库用户密码" v-model="form.upwd" show-password />
                    </el-form-item>
                </div>

                <el-form-item label="数据源字段信息:" label-width="130px" prop="fieldName">
                    <el-input placeholder="请输入数据源的各个字段(以“，”隔开),例'id,银行名称,客户姓名,贷款金额,客户年龄,历史逾期天数'"
                        v-model="form.fieldName" type="textarea" />
                </el-form-item>
                <!--               <el-form-item label="数据源描述:" prop="dataSourceDescription">
                    <el-input placeholder="请输入数据源描述,例'银行用数据源'" v-model="form.dataSourceDescription" />
                </el-form-item> -->
                <!--             <el-form-item label="任务类型:">
                <el-radio-group v-model="radio">
                    <el-radio :value="0">匿踪查询</el-radio>
                    <el-radio :value="1">联邦学习</el-radio>
                    <el-radio :value="2">安全多方计算</el-radio>
                    <el-radio :value="3">隐私求交</el-radio>
                </el-radio-group></el-form-item> -->

            </el-form>
            <template #footer>

                <div style="text-align: right;">
                    <el-button type="defeault" @click="handleClose">返回</el-button>

                    <el-button type="primary" @click="onSubmit">导入</el-button>
                </div>
            </template>
        </el-card>
    </el-dialog>
</template>
<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import SomeTools from '@/utils/someTools'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
    taskInfo: {
        type: Object,
        default: {},
        required: true
    }
})
const formRef = ref()
const form = ref({
    id: props.taskInfo.id,
    dataSourceName: '',
    dataSourceUuid: '',
    dbIp: '',
    dbName: '',
    dbPort: '',
    tbName: '',
    uname: '',
    upwd: '',
    orcl: '',
    path: '',
    fieldName: '',
    type: 1,
    state: 0,
    //dataSourceDescription: '',
})


const emits = defineEmits(['update:modelValue', 'initMyJoin'])

const handleClose = () => {
    emits('update:modelValue', false)
}
// IP 地址校验正则
const ipPattern =
    /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

const rules = ref({
    dataSourceName: [{ required: true, message: '数据源名称不能为空', trigger: 'blur' }],
    path: [
        {
            required: true,
            message: 'Excel文件路径不能为空',
            trigger: 'blur',
        },
        {
            pattern: /^\.\/[\w\-.]+\.xlsx$/,
            message: '文件路径格式错误，应以 "./" 开头并以 ".xlsx" 结尾',
            trigger: 'blur',
        },
    ],
    fieldName: [{ required: true, message: '数据源字段信息不能为空', trigger: 'blur' }],
    dbName: [{ required: true, message: '数据库名称不能为空', trigger: 'blur' }],
    dbIp: [
        { required: true, message: '数据库IP不能为空', trigger: 'blur' },
        { pattern: ipPattern, message: '请输入有效的 IP 地址', trigger: 'blur' },
    ],
    dbPort: [
        { required: true, message: '数据库端口不能为空', trigger: 'blur' },
        { pattern: /^[0-9]+$/, message: '端口号必须为数字', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value < 0 || value > 65535) {
                    callback(new Error('端口号必须在 0-65535 之间'));
                } else {
                    callback();
                }
            },
            trigger: 'blur',
        },
    ],
    tbName: [{ required: true, message: '数据表名称不能为空', trigger: 'blur' }],
    uname: [{ required: true, message: '数据库用户名不能为空', trigger: 'blur' }],
    upwd: [{ required: true, message: '数据库用户密码不能为空', trigger: 'blur' }],
});
const dynamicRules = computed(() => {
    return form.value.type === 0
        ? {
            dataSourceName: rules.value.dataSourceName,
            path: rules.value.path,
            fieldName: rules.value.fieldName,
        }
        : {
            dataSourceName: rules.value.dataSourceName,
            dbName: rules.value.dbName,
            dbIp: rules.value.dbIp,
            dbPort: rules.value.dbPort,
            tbName: rules.value.tbName,
            uname: rules.value.uname,
            upwd: rules.value.upwd,
            fieldName: rules.value.fieldName,
        };
});
// 根据类型动态设置校验
const getDynamicRules = () => {
    return form.value.type === 0
        ? {
            dataSourceName: rules.value.dataSourceName,
            path: rules.value.path,
            fieldName: rules.value.fieldName,
        }
        : {
            dataSourceName: rules.value.dataSourceName,
            dbName: rules.value.dbName,
            dbIp: rules.value.dbIp,
            dbPort: rules.value.dbPort,
            tbName: rules.value.tbName,
            uname: rules.value.uname,
            upwd: rules.value.upwd,
            fieldName: rules.value.fieldName,
        };
};

// 提交表单
const onSubmit = async () => {
    form.value.dataSourceUuid = SomeTools.guid();
    form.value.id = props.taskInfo.id;
    console.log('当前动态校验规则:', dynamicRules.value);
    formRef.value.validate(async (valid) => {
        if (valid) {
            // 校验成功后的逻辑
            await axios.post('/api/PIR/handleTaskInvitations', form.value, {
                headers: {
                    Authorization: localStorage.getItem('token'),
                },
            }).then((res) => {
                if (res.data.code === 1000) {
                    ElMessage({
                        type: 'success',
                        message: '导入成功',
                    });
                    formRef.value.resetFields();
                    emits('initMyJoin');
                    handleClose();
                } else if (res.data.code === 1006) {
                    ElMessage({ type: 'warning', message: 'Token过期，请重新登录' });
                    handleClose();
                    setTimeout(() => {
                        router.push({ path: '/login' });
                    }, 500);
                } else {
                    ElMessage({
                        type: 'error',
                        message: res.data.message,
                    });
                }
            });
        }
    });
};
</script>
<style scoped>
:deep(.my-label) {
    background: var(--el-color-success-light-9) !important;
}

:deep(.my-content) {
    background: var(--el-color-danger-light-9);
}
</style>