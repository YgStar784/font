<template>
    <div>
        <el-breadcrumb separator=">">
            <template v-for="(item, index) in breadcrumbItems" :key="index">
                <el-breadcrumb-item>
                    <!-- 判断是否为最后一级面包屑 -->
                    <span v-if="index === breadcrumbItems.length - 1">
                        {{ item.breadcrumbName }}
                    </span>
                    <span v-else>
                        <!-- 仅一级菜单项支持 el-dropdown -->
                        <el-dropdown v-if="item.children && item.children.length && index === 0" trigger="hover"
                            @command="navigateTo">
                            <router-link :to="item.path">{{ item.breadcrumbName }}</router-link>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item v-for="(child, childIndex) in item.children" :key="childIndex"
                                        :command="child.fullPath">
                                        {{ child.breadcrumbName }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                        <!-- 普通的非下拉链接 -->
                        <router-link v-else :to="item.path">
                            {{ item.breadcrumbName }}
                        </router-link>
                    </span>
                </el-breadcrumb-item>
            </template>
        </el-breadcrumb>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { watch } from 'vue'
import { isCreate, showCreate } from '@/views/main/tasks/fl/isCreate'

const route = useRoute()
const router = useRouter()

// 动态生成面包屑数据结构
const breadcrumbItems = computed(() => {
    return route.matched
        .filter((matchedRoute) => matchedRoute.path !== '/') // 过滤掉根路径
        .map((matchedRoute, index) => ({
            path: matchedRoute.redirect || matchedRoute.path, // 使用 redirect 或 path
            breadcrumbName: matchedRoute.meta.breadcrumbName || matchedRoute.path,
            children: index === 0 && matchedRoute.children // 仅在一级菜单时包含 children
                ? matchedRoute.children.map((child) => ({
                    fullPath: `/fl/${child.path.replace(/^\/?/, '')}`, // 确保是绝对路径
                    breadcrumbName: child.meta?.breadcrumbName || child.path
                }))
                : []
        }))
})

// 监听路由变化，添加额外逻辑
watch(() => route.fullPath, (newPath, oldPath) => {
    console.log('route.fullPath', route.fullPath, newPath, oldPath)
    if (newPath === '/fl/federatedLearning') {
        // 执行某些操作 
        isCreate.value = false
        localStorage.setItem('isCreate', 'false')
        showCreate.value = 'false'
    }
})

// 导航到选定路径
const navigateTo = (path) => {
    router.push(path)
}
</script>