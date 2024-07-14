<template>
    <el-container class="app-wrapper">
        <el-aside :width="isCollapse ? '210px' : '67px'" class="sidebar-container">
            <Menu />
        </el-aside>
        <el-container class="container" :class="{ hidderContainer: !isCollapse }">
            <el-header>
                <Header />
            </el-header>
            <el-main>
                <router-view />
            </el-main>
        </el-container>
    </el-container>

</template>

<script setup>
import router from "@/router";
import Menu from "./Menu/index.vue"
import Meuns from './Menu/menu.vue'
import { useCategoryStore } from '@/stores/category'
import { onMounted, computed } from 'vue';
import Header from './Header/index.vue'
import { isCollapse } from './Menu/isCollapse'
const cateStore = useCategoryStore()
/* const sideWidth = computed(() => {
    return isCollapse ? sideBarWidth : hideSideBarWidth
}) */

/* const asideWith = computed(() => {
    return isCollapse ? SideBarWidth : hideSideBarWidth
}) */
// onMounted(() => cateStore.getCategory())

</script>


<style lang="scss" scoped>
.app-container {
    position: relative;
    width: 100%;
    height: 100%;
}

.container {
    width: calc(100% - $sideBarWidth);
    height: 100%;

    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    transition: all 0.28s;

    &.hidderContainer {
        width: calc(100% - $hideSideBarWidth);
    }
}

::v-deep.el-header {
    padding: 0;
}
</style>
