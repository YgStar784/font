<script setup>
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useVueFlow } from '@vue-flow/core'
import { computed } from 'vue'

const props = defineProps({
    id: {
        type: String,
        required: true,
    },
    sourceX: {
        type: Number,
        required: true,
    },
    sourceY: {
        type: Number,
        required: true,
    },
    targetX: {
        type: Number,
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    targetY: {
        type: Number,
        required: true,
    },
    sourcePosition: {
        type: String,
        required: true,
    },
    targetPosition: {
        type: String,
        required: true,
    },
    markerEnd: {
        type: String,
        required: false,
    },
    style: {
        type: Object,
        required: false,
    },
})

const { removeEdges } = useVueFlow()

const path = computed(() => getBezierPath(props))
</script>

<script>
export default {
    inheritAttrs: false,
}
</script>

<template>
    <!-- You can use the `BaseEdge` component to create your own custom edge more easily -->
    <BaseEdge :class="{ selected: props.selected }" :id="id" :style="style" :path="path[0]" :marker-end="markerEnd" />

    <!-- Use the `EdgeLabelRenderer` to escape the SVG world of edges and render your own custom label in a `<div>` ctx -->
    <EdgeLabelRenderer>
        <div :style="{
            pointerEvents: 'all',
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${path[1]}px,${path[2]}px)`,
        }" class="nodrag nopan">
            <el-button class="edgebutton" size="small" @click="" round>{{ props.label }}</el-button>
        </div>
    </EdgeLabelRenderer>
</template>


<style lang="scss" scoped>
.selected {
    stroke: '#409EFF', // Selected stroke color

}
</style>