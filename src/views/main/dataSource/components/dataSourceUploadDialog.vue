<template>

    <el-dialog :model-value="dialogVisible" :title="props.dialogValue" @close="handleClose">
        <el-row />
        <el-form :model="form" ref="formRef" label-position="left" style="max-width: 600px;padding-left: 40px"
            label-width="120px">

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
                <el-form-item label="数据库用户密码:" prop="upwd">
                    <el-input placeholder="请输入数据库用户密码" v-model="form.upwd" show-password />
                </el-form-item>
            </div>

            <el-form-item label="数据源字段信息:" prop="fieldName">
                <el-input placeholder="请输入数据源的各个字段(以“，”隔开),例'id,银行名称,客户姓名,贷款金额,客户年龄,历史逾期天数'" v-model="form.fieldName"
                    type="textarea" />
            </el-form-item>
            <el-form-item label="数据源描述:" prop="dataSourceDescription">
                <el-input placeholder="请输入数据源描述,例'银行用数据源'" v-model="form.dataSourceDescription" />
            </el-form-item>
            <!--             <el-form-item label="任务类型:">
                <el-radio-group v-model="radio">
                    <el-radio :value="0">匿踪查询</el-radio>
                    <el-radio :value="1">联邦学习</el-radio>
                    <el-radio :value="2">安全多方计算</el-radio>
                    <el-radio :value="3">隐私求交</el-radio>
                </el-radio-group></el-form-item> -->

        </el-form>
        <template #footer>
            <el-button type="primary" @click="onSubmit">导入</el-button>
        </template>
    </el-dialog>
</template>

<script setup>

import { ref } from 'vue'
import SomeTools from '@/utils/someTools'
import { uploadDataSourceAPI } from '@/apisLittle/dataSource'
import { ElMessage } from 'element-plus'
import https from 'path-browserify'
import axios from 'axios'
/* 
const express = require('express');
const axios = require('axios');
const app = express();
const port = 5173;
app.use(express.json()); */
const emits = defineEmits(['update:modelValue'])

const radio = ref(4)
const formRef = ref()
const props = defineProps({
    dialogValue: {
        type: String,
        default: '',
        required: true
    },
    taskType: {
        type: String,
        default: '',
        required: true
    }

})

const form = ref({
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
    type: 0,
    dataSourceDescription: '',
})

console.log(props.dialogValue)
const handleClose = () => {
    emits('update:modelValue', false)
}
const onSubmit = async () => {
    console.log(form.value)
    form.value.dataSourceUuid = SomeTools.guid()
    console.log(form.value.type)
    if (form.value.type === 3) {
        console.log(true)
        form.value.orcl = 'orcl'
    }
    axios.post('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
        + '/api' + props.taskType + '/uploadDataSource', form.value
        , {
            headers: {
                Authorization: localStorage.getItem('token'),
            }
        }).then(res => {
            console.log(res)
            if (res.data.code === 1000) {
                ElMessage({
                    type: 'success',
                    message: '导入成功！',
                })
                formRef.value.resetFields()
            } else {
                ElMessage({
                    type: 'error',
                    message: res.message,
                })
            }
        })

}
/* app.get('/api/data', async (req, res) => {
    try {
        await axios.post('http://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort')
            + '/api' + '/uploadDataSource', form.value
            , {
                // httpsAgent: new https.Agent({
                //     rejectUnauthorized: true
                // })
            }).then(response => {
                console.log(response)
                if (response.code === 1000) {
                    ElMessage({
                        type: 'success',
                        message: '导入成功！',
                    })
                    formRef.value.resetFields()
                } else {
                    ElMessage({
                        type: 'error',
                        message: res.message,
                    })
                }
            })
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from the target server' });
    }
});

app.listen(port, () => {
    console.log(`Proxy server is running on http://localhost:${port}`);
}); */

/* const onSubmit = async () => {
    console.log(form.value)
    form.value.dataSourceUuid = SomeTools.guid()
    console.log(form.value.type)
    if (form.value.type === 3) {
        console.log(true)
        form.value.orcl = 'orcl'
    }
    console.log(form.value.orcl)
    const res = await uploadDataSourceAPI(form.value)
    console.log(res)
    if (res.code === 1000) {
        ElMessage({
            type: 'success',
            message: '导入成功！',
        })
        formRef.value.resetFields()
    } else {
        ElMessage({
            type: 'error',
            message: res.message,
        })
    }
} */
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    justify-content: center;
}

.el-radio {
    background-color: transparent;
    border-radius: 40px;
}

.header {
    padding-bottom: 16px;
    box-sizing: border-box;
    padding-left: 20px;
}

.subButton {
    padding-top: 16px;
    box-sizing: border-box;
}
</style>