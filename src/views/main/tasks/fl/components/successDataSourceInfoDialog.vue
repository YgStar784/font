<el-dialog v-loading="loadingOpen" class="fl-success-dialog" :model-value="successInfoShow" @close="handleClose"
    @open="handleOpen" width="500px" append-to-body destroy-on-close>


</el-dialog>

<script setup>
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import axios from 'axios'
const propsInfo = defineProps({
    index: {
        type: Number,
        required: true
    },
    taskInfo: {
        type: Object,
        required: true
    }
})
const loadingOpen = ref(false); // 定义加载状态
const theSameUuidTaskListTotal = ref(0); // 定义总数
const successDataSourceInfo = ref(null); // 定义选中的任务详情
const emits = defineEmits(['update:modelValue']);
const taskList = ref([])
const handleClose = () => {
    emits('update:modelValue', false)
}
const handleOpen = async () => {
    try {
        const response = await axios.post('/api/FL/getMyTrainTaskInvitationsDetailByUuid', {
            uuid: props.taskInfo.taskUuid,
            page: 1,
            pageSize: 30
        }, {
            headers: {
                Authorization: localStorage.getItem('token')
            }
        });

        if (response.data.code === 1000) {

            taskList.value = response.data.data.taskList;
            theSameUuidTaskListTotal.value = response.data.data.total;
            successDataSourceInfo.value = taskList.value[props.index]

            console.log('successDataSourceInfo.value ', successDataSourceInfo.value);

        } else if (response.data.code === 1006) {
            ElMessage({ type: 'warning', message: 'Token过期，请重新登录' })
            handleClose()
            setTimeout(() => {
                router.push({ path: '/login' }); // 确保路径和名称正确
            }, 500); // 避免动画加载导致页面阻塞
            return
        }
        else {
            ElMessage({ type: 'error', message: response.data.message });
        }
    } catch (error) {
        ElMessage({ type: 'error', message: '请求失败，请重试' });

    } finally {
        loadingOpen.value = false; // 关闭加载状态

    }
}
</script>