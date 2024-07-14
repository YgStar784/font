<template>
    <div class="hamburger-container">
        <el-icon @click="isCollapse = !isCollapse">
            <Expand v-show="isCollapse" />
            <Fold v-show="!isCollapse" />
        </el-icon>
        <h3></h3>
    </div>
</template>

<script setup>
import { isCollapse } from '../../Menu/isCollapse'
</script>

<style lang="scss" scoped>
.hamburger-container {
    padding-top: 4px;
    margin-left: 5px;
    margin-right: 16px;
    box-sizing: border-box;
    cursor: pointer;

}
</style>
