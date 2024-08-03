<template>
    <link rel="stylesheet" href="//at.alicdn.com/t/c/font_4626062_48kmnd4lc4m.css">
    <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/' }">
            <i class="iconfont icon-user"></i>
        </el-breadcrumb-item>

        <el-breadcrumb-item>{{ $t(`menus.${$route.path}`) }}</el-breadcrumb-item>
    </el-breadcrumb>
</template>
<!-- {{ $t(`menus.${route.path}`) }}-->
<script setup>
import { useCategoryStore } from '@/stores/category'

import { useRouter, onBeforeRouteUpdate } from 'vue-router';


onBeforeRouteUpdate((to) => {
    console.log('onBeforeRouteUpdate', to.path);
});
const route = useRouter()
console.log(route.currentRoute.value.fullPath)
</script>