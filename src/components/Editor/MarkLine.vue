<template>
  <div class="mark-line">
    <div v-for="line in lines" v-show="lineStatus[line] || false" :key="line" :ref="line" class="line"
      :class="line.includes('x') ? 'xline' : 'yline'"></div>
  </div>
</template>
<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import mitt from 'mitt'
import { getComponentRotatedStyle } from '@/utils/style'

const eventBus = mitt()

export default {
  setup() {
    const store = useStore()

    const lines = ref(['xt', 'xc', 'xb', 'yl', 'yc', 'yr']) // 分别对应三条横线和三条竖线
    const diff = ref(3) // 相距 diff 像素将自动吸附
    const lineStatus = ref({
      xt: false,
      xc: false,
      xb: false,
      yl: false,
      yc: false,
      yr: false,
    })

    const curComponent = computed(() => store.state.curComponent)
    const componentData = computed(() => store.state.componentData)

    onMounted(() => {
      eventBus.on('move', (isDownward, isRightward) => {
        showLine(isDownward, isRightward)
      })

      eventBus.on('unmove', () => {
        hideLine()
      })
    })

    const hideLine = () => {
      Object.keys(lineStatus.value).forEach((line) => {
        lineStatus.value[line] = false
      })
    }

    const showLine = (isDownward, isRightward) => {
      const linesRef = document.querySelectorAll('[ref]') // 获取 line 元素引用
      const components = componentData.value
      const curComponentStyle = getComponentRotatedStyle(curComponent.value.style)
      const curComponentHalfwidth = curComponentStyle.width / 2
      const curComponentHalfHeight = curComponentStyle.height / 2

      hideLine()

      components.forEach((component) => {
        if (component === curComponent.value) return
        const componentStyle = getComponentRotatedStyle(component.style)
        const { top, left, bottom, right } = componentStyle
        const componentHalfwidth = componentStyle.width / 2
        const componentHalfHeight = componentStyle.height / 2

        const conditions = {
          top: [
            {
              isNearly: isNearly(curComponentStyle.top, top),
              lineNode: linesRef[0], // xt
              line: 'xt',
              dragShift: top,
              lineShift: top,
            },
            {
              isNearly: isNearly(curComponentStyle.bottom, top),
              lineNode: linesRef[0], // xt
              line: 'xt',
              dragShift: top - curComponentStyle.height,
              lineShift: top,
            },
            {
              // 组件与拖拽节点的中间是否对齐
              isNearly: isNearly(curComponentStyle.top + curComponentHalfHeight, top + componentHalfHeight),
              lineNode: linesRef[1], // xc
              line: 'xc',
              dragShift: top + componentHalfHeight - curComponentHalfHeight,
              lineShift: top + componentHalfHeight,
            },
            {
              isNearly: isNearly(curComponentStyle.top, bottom),
              lineNode: linesRef[2], // xb
              line: 'xb',
              dragShift: bottom,
              lineShift: bottom,
            },
            {
              isNearly: isNearly(curComponentStyle.bottom, bottom),
              lineNode: linesRef[2], // xb
              line: 'xb',
              dragShift: bottom - curComponentStyle.height,
              lineShift: bottom,
            },
          ],
          left: [
            {
              isNearly: isNearly(curComponentStyle.left, left),
              lineNode: linesRef[3], // yl
              line: 'yl',
              dragShift: left,
              lineShift: left,
            },
            {
              isNearly: isNearly(curComponentStyle.right, left),
              lineNode: linesRef[3], // yl
              line: 'yl',
              dragShift: left - curComponentStyle.width,
              lineShift: left,
            },
            {
              // 组件与拖拽节点的中间是否对齐
              isNearly: isNearly(curComponentStyle.left + curComponentHalfwidth, left + componentHalfwidth),
              lineNode: linesRef[4], // yc
              line: 'yc',
              dragShift: left + componentHalfwidth - curComponentHalfwidth,
              lineShift: left + componentHalfwidth,
            },
            {
              isNearly: isNearly(curComponentStyle.left, right),
              lineNode: linesRef[5], // yr
              line: 'yr',
              dragShift: right,
              lineShift: right,
            },
            {
              isNearly: isNearly(curComponentStyle.right, right),
              lineNode: linesRef[5], // yr
              line: 'yr',
              dragShift: right - curComponentStyle.width,
              lineShift: right,
            },
          ],
        }

        const needToShow = []
        const { rotate } = curComponent.value.style
        Object.keys(conditions).forEach((key) => {
          conditions[key].forEach((condition) => {
            if (!condition.isNearly) return

            store.commit('setShapeSingleStyle', {
              key,
              value: rotate !== 0 ? translatecurComponentShift(key, condition, curComponentStyle) : condition.dragShift,
            })

            condition.lineNode.style[key] = `${condition.lineShift}px`
            needToShow.push(condition.line)
          })
        })

        if (needToShow.length) {
          chooseTheTrueLine(needToShow, isDownward, isRightward)
        }
      })
    }

    const translatecurComponentShift = (key, condition, curComponentStyle) => {
      const { width, height } = curComponent.value.style
      if (key === 'top') {
        return Math.round(condition.dragShift - (height - curComponentStyle.height) / 2)
      }
      return Math.round(condition.dragShift - (width - curComponentStyle.width) / 2)
    }

    const chooseTheTrueLine = (needToShow, isDownward, isRightward) => {
      if (isRightward) {
        if (needToShow.includes('yr')) {
          lineStatus.value.yr = true
        } else if (needToShow.includes('yc')) {
          lineStatus.value.yc = true
        } else if (needToShow.includes('yl')) {
          lineStatus.value.yl = true
        }
      } else {
        if (needToShow.includes('yl')) {
          lineStatus.value.yl = true
        } else if (needToShow.includes('yc')) {
          lineStatus.value.yc = true
        } else if (needToShow.includes('yr')) {
          lineStatus.value.yr = true
        }
      }

      if (isDownward) {
        if (needToShow.includes('xb')) {
          lineStatus.value.xb = true
        } else if (needToShow.includes('xc')) {
          lineStatus.value.xc = true
        } else if (needToShow.includes('xt')) {
          lineStatus.value.xt = true
        }
      } else {
        if (needToShow.includes('xt')) {
          lineStatus.value.xt = true
        } else if (needToShow.includes('xc')) {
          lineStatus.value.xc = true
        } else if (needToShow.includes('xb')) {
          lineStatus.value.xb = true
        }
      }
    }

    const isNearly = (dragValue, targetValue) => {
      return Math.abs(dragValue - targetValue) <= diff.value
    }

    return {
      lines,
      diff,
      lineStatus,
      curComponent,
      componentData,
      hideLine,
      showLine,
      translatecurComponentShift,
      chooseTheTrueLine,
      isNearly
    }
  },
}
</script>
<style lang="scss" scoped>
.mark-line {
  height: 100%;
}

.line {
  background: #59c7f9;
  position: absolute;
  z-index: 1000;
}

.xline {
  width: 100%;
  height: 1px;
}

.yline {
  width: 1px;
  height: 100%;
}
</style>
