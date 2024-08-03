<template>
    <el-dropdown>
        <span class="el-dropdown-link">
            <el-avatar :shape="square" :size="40" :src="squareUrl"></el-avatar>
        </span>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item>{{ userStore.userInfo.username }}</el-dropdown-item>
                <el-dropdown-item @click="dialogPwdVisible = true">修改密码</el-dropdown-item>
                <el-dropdown-item @click="dialogPortVisible = true">修改端口</el-dropdown-item>
                <el-dropdown-item divided @click="loginout">退出</el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
    <DialogPwd v-model="dialogPwdVisible" :dialogValue="dialogValue" v-if="dialogPwdVisible" />
    <DialogPort v-model="dialogPortVisible" :dialogValue="dialogValue" v-if="dialogPortVisible" />

</template>
<script setup>
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DialogPwd from './passDialog.vue'
import DialogPort from './portDialog.vue'
const dialogPwdVisible = ref(false)
const dialogPortVisible = ref(false)
const route = useRouter()
const userStore = useUserStore()
const squareUrl = ref(
    'https://img0.baidu.com/it/u=1056811702,4111096278&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
)
const loginout = () => {
    userStore.clearUserInfo()
    route.replace('/login')
}
</script>

<style>
.el-dropdown-menu__item {
    white-space: nowrap;
}

::v-depp.el-avatar {
    border: 0;
}
</style>