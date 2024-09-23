<template>
    <el-drawer
    :model-value="props.taskBasicInfoShow"
    title="基本信息"
    :before-close="handleClose"
    direction="rtl"
    class="demo-drawer"
  >
    <div class="demo-drawer__content">
      <el-form :model="form">
        <el-form-item label="任务名称" :label-width="formLabelWidth">
          <el-input v-model="form.taskName" autocomplete="off" />
        </el-form-item>
        <el-form-item label="描述" :label-width="formLabelWidth">
          <el-input
            v-model="form.taskDescription"
            placeholder="请输入任务描述"
          >
          </el-input>
        </el-form-item>

      </el-form>
      <div class="demo-drawer__footer">
        <el-button @click="cancelForm">Cancel</el-button>
        <el-button type="primary" :loading="loading" @click="onClick">
          {{ loading ? 'Submitting ...' : 'Submit' }}
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElDrawer, ElMessageBox } from 'element-plus'

const formLabelWidth = '80px'
const props = defineProps({
    taskBasicInfoShow: {
        type: Boolean,
        default: false,
        required: true
    }
})
let timer
const table = ref(false)
const dialog = ref(false)
const loading = ref(false)
const emits = defineEmits(['update:modelValue'])
const form = reactive({
  taskName: '',
  taskDescription: '',

})


const onClick = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    dialog.value = false
  }, 400)
}

const handleClose = (done) => {
  if (loading.value) {
    return
  }
  ElMessageBox.confirm('Do you want to submit?')
    .then(() => {
      loading.value = true
      timer = setTimeout(() => {
        done()
        // 动画关闭需要一定的时间
        setTimeout(() => {
          loading.value = false
        }, 400)
      }, 2000)
      
    })
    .catch(() => {
      // catch error
    })
}

const cancelForm = () => {
  loading.value = false
  emits('update:modelValue', false)
  clearTimeout(timer)
}
</script>
