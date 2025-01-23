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
                router.push({ name: 'federatedLearning' }).then(() => {
                    window.location.reload();  // 刷新当前页面
                });;

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
</script>

<style lang="scss" scoped>
.demonstration {
    color: var(--el-text-color-secondary);
}

.el-carousel__item h3 {
    color: #475669;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
    text-align: center;
}

.el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n + 1) {
    background-color: #d3dce6;
}
</style>