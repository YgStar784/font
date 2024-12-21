<template>
    <path :d="getPath()" class="custom-edge" />
</template>

<script setup>
const edge = defineProps();

// Function to generate a simple path between source and target nodes
const getPath = () => {
    return `M ${edge.sourceX},${edge.sourceY} L ${edge.targetX},${edge.targetY}`;
};
</script>

<style scoped>
.custom-edge {
    stroke: #3498db;
    stroke-width: 2;
    fill: none;
}
</style>