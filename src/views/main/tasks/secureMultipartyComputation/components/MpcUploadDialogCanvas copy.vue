<template>

    <el-dialog class="dialog" :model-value="dialogVisible" width="auto" @close="handleClose" append-to-body>
        <div :class="!isDarkMode ? 'home' : 'home dark'">
            <Toolbar />

            <main>
                <!-- 左侧组件列表 -->
                <section :class="leftList ? 'left active' : 'left inactive'">
                    <ComponentList />
                    <RealTimeComponentList />
                </section>
                <el-button title="show-list-btn" class="btn show-list left-btn"
                    :icon="leftList ? 'el-icon-arrow-left' : 'el-icon-arrow-right'" @click="isShowLeft">
                </el-button>
                <!-- 中间画布 -->
                <section class="center" :style="rightList ? 'margin-right:288px' : 'margin-right:10px'">
                    <div class="content" @drop="handleDrop" @dragover="handleDragOver" @mousedown="handleMouseDown"
                        @mouseup="deselectCurComponent">
                        <Editor />
                    </div>
                </section>
                <!-- 右侧属性列表 -->
                <section :class="rightList ? 'right active' : 'right inactive'">
                    <el-tabs v-if="curComponent" v-model="activeName">
                        <el-tab-pane label="属性" name="attr">
                            <component :is="curComponent.component + 'Attr'" />
                        </el-tab-pane>
                        <el-tab-pane label="动画" name="animation" style="padding-top: 20px">
                            <AnimationList />
                        </el-tab-pane>
                        <el-tab-pane label="事件" name="events" style="padding-top: 20px">
                            <EventList />
                        </el-tab-pane>
                    </el-tabs>
                    <CanvasAttr v-else></CanvasAttr>
                </section>
                <el-button title="show-list-btn" class="btn show-list right-btn"
                    :icon="rightList ? 'el-icon-arrow-right' : 'el-icon-arrow-left'" @click="isShowRight">
                </el-button>
            </main>
        </div>

    </el-dialog>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Editor from '@/components/Editor/index.vue'
import ComponentList from '@/components/ComponentList.vue'
import AnimationList from '@/components/AnimationList.vue'
import EventList from '@/components/EventList.vue'
import componentList from '@/custom-component/component-list'
import Toolbar from '@/components/Toolbar.vue'
import { deepCopy } from '@/utils/utils'
import generateID from '@/utils/generateID'
import { listenGlobalKeyDown } from '@/utils/shortcutKey'
import RealTimeComponentList from '@/components/RealTimeComponentList.vue'
import CanvasAttr from '@/components/CanvasAttr.vue'
import { changeComponentSizeWithScale } from '@/utils/changeComponentsSizeWithScale'
import { setDefaultcomponentData } from '@/store/snapshot'

export default {
    components: { Editor, ComponentList, AnimationList, EventList, Toolbar, RealTimeComponentList, CanvasAttr },

    setup() {
        const store = useStore()

        // 使用 ref 来创建响应式数据
        const activeName = ref('attr')
        const reSelectAnimateIndex = ref(undefined)
        const leftList = ref(true)

        // 通过 computed 来映射 Vuex 状态
        const componentData = computed(() => store.state.componentData)
        const curComponent = computed(() => store.state.curComponent)
        const isClickComponent = computed(() => store.state.isClickComponent)
        const canvasStyleData = computed(() => store.state.canvasStyleData)
        const rightList = computed(() => store.state.rightList)
        const isDarkMode = computed(() => store.state.isDarkMode)

        const restore = () => {
            // 用保存的数据恢复画布
            if (localStorage.getItem('canvasData')) {
                setDefaultcomponentData(JSON.parse(localStorage.getItem('canvasData')))
                store.commit('setComponentData', JSON.parse(localStorage.getItem('canvasData')))
            }

            if (localStorage.getItem('canvasStyle')) {
                store.commit('setCanvasStyle', JSON.parse(localStorage.getItem('canvasStyle')))
            }
        }

        const handleDrop = (e) => {
            e.preventDefault()
            e.stopPropagation()

            const index = e.dataTransfer.getData('index')
            const rectInfo = document.querySelector('.editor').getBoundingClientRect() // editor 的获取方式可能需要调整
            if (index) {
                const component = deepCopy(componentList[index])
                component.style.top = e.clientY - rectInfo.y
                component.style.left = e.clientX - rectInfo.x
                component.id = generateID()

                // 根据画面比例修改组件样式比例
                changeComponentSizeWithScale(component)

                store.commit('addComponent', { component })
                store.commit('recordSnapshot')
            }
        }

        const handleDragOver = (e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
        }

        const handleMouseDown = (e) => {
            e.stopPropagation()
            store.commit('setClickComponentStatus', false)
            store.commit('setInEditorStatus', true)
        }

        const deselectCurComponent = (e) => {
            if (!isClickComponent.value) {
                store.commit('setCurComponent', { component: null, index: null })
            }

            // 0 左击 1 滚轮 2 右击
            if (e.button != 2) {
                store.commit('hideContextMenu')
            }
        }

        const isShowLeft = () => {
            leftList.value = !leftList.value
        }

        const isShowRight = () => {
            store.commit('isShowRightList')
        }

        // 使用 onMounted 替代 created 生命周期钩子
        onMounted(() => {
            restore()
            listenGlobalKeyDown()

            const savedMode = localStorage.getItem('isDarkMode')
            if (savedMode !== null) {
                store.commit('toggleDarkMode', JSON.parse(savedMode))
            } else {
                store.commit('toggleDarkMode', false)
            }
        })

        return {
            activeName,
            reSelectAnimateIndex,
            leftList,
            componentData,
            curComponent,
            isClickComponent,
            canvasStyleData,
            rightList,
            isDarkMode,
            handleDrop,
            handleDragOver,
            handleMouseDown,
            deselectCurComponent,
            isShowLeft,
            isShowRight
        }
    }
}
</script>

<style lang="scss" scoped>
.home {
    height: 100vh;
    background: var(--main-bg-color);

    main {
        height: calc(100% - 64px);
        position: relative;
        background: var(--secondary-bg-color);

        .show-list {
            position: absolute;
            z-index: 9;
            top: 40%;
            transition: all 0.3s;
        }

        .left-btn,
        .right-btn {
            background: var(--main-bg-color);
            color: var(--button-text-color);
            border: 1px;
        }

        .left-btn {
            margin-left: 200px;
            border-radius: 0 50% 50% 0;
            padding: 9px 4px 9px 2px;
        }

        .right-btn {
            right: 0;
            margin-right: 288px;
            border-radius: 50% 0 0 50%;
            padding: 9px 2px 9px 4px;
        }

        .left,
        .right {
            position: absolute;
            height: 100%;
            top: 0;
            transition: all 0.3s;
            background: var(--main-bg-color);
            color: var(--text-color);
        }

        .left {
            width: 200px;
            left: 0;

            .real-time-component-list .list:hover {
                color: var(--text-color);
            }

            .real-time-component-list .actived.list {
                color: var(--actived-text-color);
                background-color: var(--actived-bg-color);
            }

            .real-time-component-list .list {
                color: var(--text-color);
            }

            &>div {
                overflow: auto;

                &:first-child {
                    border-bottom: 1px solid var(--border-color);
                }
            }
        }

        .center {
            margin: 0 288px 0 200px;
            background: var(--secondary-bg-color);
            height: 100%;
            overflow: auto;
            padding: 20px;
            transition: all 0.3s;
        }

        .placeholder {
            text-align: center;
            color: var(--placeholder-text-color);
        }

        .left.inactive {
            width: 10px;
            overflow: hidden;

            div {
                opacity: 0;
            }
        }

        .left.inactive~.center,
        .left.inactive~.btn.left-btn {
            margin-left: 10px;
        }

        .right {
            position: absolute;
            height: 100%;
            width: 288px;
            right: 0;
            top: 0;
            transition: all 0.3s;
            background-color: var(--main-bg-color);

            .el-select {
                width: 100%;
            }

            .el-form-item__label {
                color: var(--text-color);
            }

            .el-tabs__item.is-top {
                color: var(--text-color);

                &.is-active {
                    color: var(--actived-text-color);
                }
            }

            .el-input__inner {
                background-color: var(--placeholder-bg-color);
                color: var(--text-color);
                border-color: var(--border-color);
            }

            textarea.el-textarea__inner {
                background-color: var(--placeholder-bg-color);
                color: var(--text-color);
            }

            .el-select-dropdown__item {
                color: var(--text-color);
            }

            .linkage-container .linkage-component {
                border-color: var(--border-color);

                .div-guanbi {
                    color: var(--border-color);
                    border-color: var(--border-color);
                }
            }
        }

        .right.inactive {
            width: 10px;
            overflow: hidden;

            div {
                opacity: 0;
            }
        }

        .right.inactive~.btn.right-btn {
            margin-right: 10px;
        }

        .center {
            margin-left: 200px;
            margin-right: 288px;
            background: var(--secondary-bg-color);
            height: 100%;
            overflow: auto;
            padding: 20px;
            transition: all 0.3s;

            .content {
                width: 100%;
                height: 100%;
                overflow: auto;
            }
        }
    }

    .placeholder {
        text-align: center;
        color: var(--placeholder-text-color);
    }

    .global-attr {
        padding: 10px;
    }

    .el-collapse {
        border-color: var(--border-color);
    }

    .el-collapse-item__header,
    .el-collapse-item__wrap {
        border-color: var(--border-color);
        background-color: var(--main-bg-color);
        color: var(--text-color);
    }

    .el-collapse-item__header.is-active {
        border-bottom-color: transparent !important;
    }

    .el-tabs__item {
        color: var(--text-color);
    }

    .animation-list {
        .el-tabs.el-tabs--top {
            background-color: var(--main-bg-color);
        }

        .el-scrollbar__view {
            margin-top: 30px;
        }
    }

    .ace {
        background: var(--ace-bg-color);
        border-color: var(--main-bg-color);

        .ace_editor,
        .ace_gutter {
            background-color: var(--main-bg-color);
            color: var(--text-color);
        }
    }
}
</style>
