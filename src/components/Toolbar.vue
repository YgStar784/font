<template>
  <div>
    <div :class="isDarkMode ? 'dark toolbar' : 'toolbar'">
      <el-button @click="onAceEditorChange">JSON</el-button>
      <el-button @click="onImportJSON">导入</el-button>
      <el-button @click="onExportJSON">导出</el-button>
      <el-button @click="undo">撤消</el-button>
      <el-button @click="redo">重做</el-button>
      <label for="input" class="insert">
        插入图片
        <input id="input" type="file" hidden @change="handleFileChange" />
      </label>

      <el-button style="margin-left: 10px" @click="preview(false)"> 预览 </el-button>
      <el-button @click="save">保存</el-button>
      <el-button @click="clearCanvas">清空画布</el-button>
      <el-button :disabled="!areaData.components.length" @click="compose"> 组合 </el-button>
      <el-button :disabled="!curComponent || curComponent.isLock || curComponent.component != 'Group'"
        @click="decompose">
        拆分
      </el-button>

      <el-button :disabled="!curComponent || curComponent.isLock" @click="lock"> 锁定 </el-button>
      <el-button :disabled="!curComponent || !curComponent.isLock" @click="unlock"> 解锁 </el-button>
      <el-button @click="preview(true)">截图</el-button>

      <div class="canvas-config">
        <span>画布大小</span>
        <input v-model="canvasStyleData.width" />
        <span>*</span>
        <input v-model="canvasStyleData.height" />
      </div>
      <div class="canvas-config">
        <span>画布比例</span>
        <input v-model="scale" @input="handleScaleChange" />
        %
      </div>
      <el-switch v-model="switchValue" class="dark-mode-switch" active-icon-class="el-icon-sunny"
        inactive-icon-class="el-icon-moon" active-color="#000" @change="handleToggleDarkMode"></el-switch>
      <el-dropdown v-if="showComponentAlign" :hide-on-click="false" class="align-dropdown" trigger="click"
        @command="handleComponentAlign">
        <el-button type="primary">
          对齐方式
          <i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-for="item in alignList" :key="item.value" :command="item.value"
            :disabled="item.isDisabled ? areaData.components.length < 3 : false">
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 预览 -->
    <Preview v-if="isShowPreview" :is-screenshot="isScreenshot" @close="handlePreviewChange" />
    <AceEditor v-if="isShowAceEditor" @closeEditor="closeEditor" />

    <el-dialog :title="isExport ? '导出数据' : '导入数据'" :visible.sync="isShowDialog" :close-on-press-escape="false"
      :close-on-click-modal="false" width="600">
      <el-input v-model="jsonData" type="textarea" :rows="20" placeholder="请输入 JSON 数据"></el-input>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-upload v-show="!isExport" action="/" :before-upload="beforeUpload" :show-file-list="false"
          accept="application/json">
          <el-button type="primary">选择 JSON 文件</el-button>
        </el-upload>
        <el-button type="primary" @click="processJSON">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>


<script>
import { ref, computed, onMounted, watch, inject } from 'vue'
import { useStore } from 'vuex'
import generateID from '@/utils/generateID'
import toast from '@/utils/toast'
import Preview from '@/components/Editor/Preview.vue'
import AceEditor from '@/components/Editor/AceEditor.vue'
import { commonStyle, commonAttr } from '@/custom-component/component-list'
import changeComponentsSizeWithScale, { changeComponentSizeWithScale } from '@/utils/changeComponentsSizeWithScale'
import { getComponentRotatedStyle } from '@/utils/style'
import mitt from 'mitt'

const eventBus = mitt()

export default {
  components: { Preview, AceEditor },
  setup() {
    const store = useStore()
    const isShowPreview = ref(false)
    const isShowAceEditor = ref(false)
    const timer = ref(null)
    const isScreenshot = ref(false)
    const scale = ref(100)
    const switchValue = ref(false)
    const isShowDialog = ref(false)
    const jsonData = ref('')
    const isExport = ref(false)

    const componentData = computed(() => store.state.componentData)
    const canvasStyleData = computed(() => store.state.canvasStyleData)
    const areaData = computed(() => store.state.areaData)
    const curComponent = computed(() => store.state.curComponent)
    const curComponentIndex = computed(() => store.state.curComponentIndex)
    const isDarkMode = computed(() => store.state.isDarkMode)

    const showComponentAlign = computed(() => {
      return (curComponent.value && !curComponent.value.isLock) || areaData.value.components.length > 1
    })

    onMounted(() => {
      eventBus.on('preview', preview)
      eventBus.on('save', save)
      eventBus.on('clearCanvas', clearCanvas)

      scale.value = canvasStyleData.value.scale
      const savedMode = JSON.parse(localStorage.getItem('isDarkMode'))
      if (savedMode) {
        handleToggleDarkMode(savedMode)
      }
    })

    const handleComponentAlign = (command) => {
      store.commit(command)
      store.commit('recordSnapshot')
      let top = Infinity,
        left = Infinity
      let right = -Infinity,
        bottom = -Infinity

      if (areaData.value.components.length > 1) {
        areaData.value.components.forEach((component) => {
          let style = getComponentRotatedStyle(component.style)
          if (style.left < left) left = style.left
          if (style.top < top) top = style.top
          if (style.right > right) right = style.right
          if (style.bottom > bottom) bottom = style.bottom
        })
        store.commit('setAreaData', {
          style: {
            left,
            top,
            width: right - left,
            height: bottom - top,
          },
          components: areaData.value.components,
        })
      }
    }

    const handleToggleDarkMode = (value) => {
      if (value !== null) {
        store.commit('toggleDarkMode', value)
        switchValue.value = value
      }
    }

    const handleScaleChange = () => {
      clearTimeout(timer.value)
      store.commit('setLastScale', scale.value)
      timer.value = setTimeout(() => {
        scale.value = ~~scale.value || 1
        changeComponentsSizeWithScale(scale.value)
      }, 1000)
    }

    const onAceEditorChange = () => {
      isShowAceEditor.value = !isShowAceEditor.value
    }

    const closeEditor = () => {
      onAceEditorChange()
    }

    const lock = () => {
      store.commit('lock')
    }

    const unlock = () => {
      store.commit('unlock')
    }

    const compose = () => {
      store.commit('compose')
      store.commit('recordSnapshot')
    }

    const decompose = () => {
      store.commit('decompose')
      store.commit('recordSnapshot')
    }

    const undo = () => {
      store.commit('undo')
    }

    const redo = () => {
      store.commit('redo')
    }

    const handleFileChange = (e) => {
      const file = e.target.files[0]
      if (!file.type.includes('image')) {
        toast('只能插入图片')
        return
      }

      const reader = new FileReader()
      reader.onload = (res) => {
        const fileResult = res.target.result
        const img = new Image()
        img.onload = () => {
          const component = {
            ...commonAttr,
            id: generateID(),
            component: 'Picture',
            label: '图片',
            icon: '',
            propValue: {
              url: fileResult,
              flip: {
                horizontal: false,
                vertical: false,
              },
            },
            style: {
              ...commonStyle,
              top: 0,
              left: 0,
              width: img.width,
              height: img.height,
            },
          }

          changeComponentSizeWithScale(component)
          store.commit('addComponent', { component })
          store.commit('recordSnapshot')
        }

        img.src = fileResult
      }

      reader.readAsDataURL(file)
    }

    const preview = (isScreenshot) => {
      isScreenshot.value = isScreenshot
      isShowPreview.value = true
      store.commit('setEditMode', 'preview')
    }

    const save = () => {
      localStorage.setItem('canvasData', JSON.stringify(componentData.value))
      localStorage.setItem('canvasStyle', JSON.stringify(canvasStyleData.value))
      toast('保存成功')
    }

    const clearCanvas = () => {
      store.commit('setCurComponent', {
        component: null,
        index: null,
      })
      store.commit('setComponentData', [])
      store.commit('recordSnapshot')
    }

    const handlePreviewChange = () => {
      isShowPreview.value = false
      store.commit('setEditMode', 'edit')
    }

    const onImportJSON = () => {
      jsonData.value = ''
      isExport.value = false
      isShowDialog.value = true
    }

    const processJSON = () => {
      try {
        const data = JSON.parse(jsonData.value)
        if (!Array.isArray(data)) {
          toast('数据格式错误，组件数据必须是一个数组')
          return
        }

        if (isExport.value) {
          downloadFileUtil(jsonData.value, 'application/json', 'data.json')
        } else {
          store.commit('setComponentData', data)
        }

        isShowDialog.value = false
      } catch (error) {
        toast('数据格式错误，请传入合法的 JSON 格式数据')
      }
    }

    const onExportJSON = () => {
      isShowDialog.value = true
      isExport.value = true
      jsonData.value = JSON.stringify(componentData.value, null, 4)
    }

    const downloadFileUtil = (data, type, fileName = '') => {
      const url = window.URL.createObjectURL(new Blob([data], { type }))
      const link = document.createElement('a')

      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }

    return {
      isShowPreview,
      isShowAceEditor,
      timer,
      isScreenshot,
      scale,
      switchValue,
      isShowDialog,
      jsonData,
      isExport,
      componentData,
      canvasStyleData,
      areaData,
      curComponent,
      curComponentIndex,
      isDarkMode,
      showComponentAlign,
      handleComponentAlign,
      handleToggleDarkMode,
      handleScaleChange,
      onAceEditorChange,
      closeEditor,
      lock,
      unlock,
      compose,
      decompose,
      undo,
      redo,
      handleFileChange,
      preview,
      save,
      clearCanvas,
      handlePreviewChange,
      onImportJSON,
      processJSON,
      onExportJSON,
      downloadFileUtil
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  padding: 15px 10px;
  white-space: nowrap;
  overflow-x: auto;
  background: var(--main-bg-color);
  border-color: var(--ace-bg-color);
  border-bottom: 1px solid var(--border-color);

  .align-dropdown {
    margin-left: 10px;
  }

  .canvas-config {
    display: inline-block;
    margin-left: 10px;
    font-size: 14px;
    color: var(--text-color);

    input {
      width: 50px;
      margin-left: 4px;
      outline: none;
      padding: 0 5px;
      border: 1px solid var(--border-color);
      color: #606266;
    }

    span {
      margin-left: 10px;
    }
  }

  .el-button--small {
    background: var(--main-bg-color);
    border: 1px solid var(--toolbar-border-color);
    color: var(--button-text-color);
  }

  .el-button--small:hover {
    background: var(--button-active-text-color);
    border-color: var(--actived-bg-color);
    color: var(--main-bg-color);
  }

  .insert {
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var(--toolbar-border-color);
    color: var(--text-color);
    appearance: none;
    text-align: center;
    box-sizing: border-box;
    outline: 0;
    margin: 0;
    transition: 0.1s;
    font-weight: 500;
    padding: 9px 15px;
    font-size: 12px;
    border-radius: 3px;
    margin-left: 10px;
  }

  .insert {
    background: var(--main-bg-color);
    border: 1px solid var(--toolbar-border-color);
    color: var(--button-text-color);

    &:active {
      background: var(--button-active-text-color);
      border-color: var(--actived-bg-color);
      color: var(--main-bg-color);
    }

    &:hover {
      background: var(--button-active-text-color);
      border-color: var(--actived-bg-color);
      color: var(--main-bg-color);
    }
  }

  .el-button.is-disabled {
    color: var(--disable-text-color);
    border-color: var(--disable-border-color);
    background: var(--main-bg-color);

    &:hover {
      background: var(--main-bg-color);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;

  &>* {
    margin-left: 10px;
  }
}
</style>
