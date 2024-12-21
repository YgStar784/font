<template>

    <el-dialog v-model="taskInfoShow" title="任务信息" @close="handleClose" width="1000" top="5vh" append-to-body>
        <vue-json-pretty :data="showJsonCode" :showLineNumbers="true" theme="monokai" :deep="2" /> <template #footer>
            <div class="dialog-footer">
                <el-button @click="handleClose">Cancel</el-button>
                <el-button type="primary" @click="createtask">
                    确认
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>
<script setup>
import { ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { ElMessage } from 'element-plus';
import axios from 'axios'
const emits = defineEmits(['update:modelValue'])
import { useRouter } from 'vue-router';

const props = defineProps({
    nodesInfo: {
        type: Object,
        required: true,
    }
})
const router = useRouter();

const showJsonCode = ref(props.nodesInfo)
console.log('nodesInfo', props.nodesInfo);
const handleClose = () => {
    emits('update:modelValue', false)
}
const createtask = async () => {
    await axios.post(
        '/api/FL/createTrainTask', props.nodesInfo
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
                handleClose()
                router.push({ name: 'federatedLearning' });

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
</script>