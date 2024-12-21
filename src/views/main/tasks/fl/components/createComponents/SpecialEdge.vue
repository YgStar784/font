<template>
    <div class="special-edge">
        <p>{{ data.hello }}</p>
    </div>
</template>

<script setup>
const props = defineProps(['data'])
</script>

<style scoped>
.special-edge {
    stroke: red;
    stroke-width: 2;
}
</style>