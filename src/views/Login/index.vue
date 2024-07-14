<template>
    <div class="back-ground">
        <div class="login-container">
            <el-form ref="formRef" :rules="rules" :model="form" class="login-form">
                <div class="title-container">
                    <h3 class="title">用户登录</h3>
                </div>
                <el-form-item prop="username">
                    <el-input prefix-icon="User" v-model="form.username" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input prefix-icon="Lock" v-model="form.password" show-password />
                </el-form-item>
            </el-form>
            <el-button type="primary" class="login-button" @click="handleLogin" @keydown.enter="keyDown()">登 录
            </el-button>
        </div>
    </div>
</template>

<script setup>
import { getCurrentInstance } from "vue";// 获取当前实例，在当前实例充当vue2 中的this

import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import 'element-plus/theme-chalk/el-message.css'
import { login } from '@/apis/login'
import { setTokenTime } from '@/utils/auth'
import { sha256 } from 'js-sha256'
import { url } from '../../littleUrlGet'
import { littleUrl } from './littleUrlSet'
const form = ref({ username: '', password: '' })

//const { ctx } = getCurrentInstance()
const rules = ref({
    username: [
        {
            required: true,
            message: '请输入用户名',
            trigger: 'blur',
        }
    ],
    password: [{
        required: true,
        message: '请输入密码',
        trigger: 'blur',
    }]
})

const formRef = ref(null)
const router = useRouter()
const handleLogin = () => {
    formRef.value.validate(async (valid) => {
        if (valid) {
            //TODO LOGIN
            const username = form.value.username
            const mpassword = form.value.password
            const password = sha256(mpassword)
            console.log(password)
            const res = await login({ username: form.value.username, password: sha256(form.value.password) })
            console.log(res)
            if (res.code === 1000) {
                localStorage.setItem('token', res.data.token)
                localStorage.setItem('nodeIp', res.data.nodeIp)
                localStorage.setItem('nodePort', res.data.nodePort)
                setTokenTime()
                localStorage.setItem('password', password)
                localStorage.setItem('level', res.data.level)
                //1.提示用户
                ElMessage({ type: 'success', message: '登录成功！' })
                // ctx.$littleBaseUrl = littleUrlSetAPI()
                //console.log(ctx.$littleBaseUrl)
                const url = littleUrl
                console.log(url)
                //console.log(littleUrl.value)
                //littleUrl.value = littleUrlSetAPI(littleUrl.value)
                //console.log(littleUrl.value)
                //2.跳转首页
                router.replace({ path: '/' })
                return localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api'
            } else {
                ElMessage({
                    type: 'error',
                    message: res.message
                })
                return ''
            }
        } else if (form.value.username === '' || form.value.password === '') {
            ElMessage({ type: 'warning', message: '用户名和或密码不能为空！' })

        }
        else {
            ElMessage({ type: 'error', message: '未知错误！' })
        }
        return ''
    })
}
//点击回车键登录
const keyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 100) {
        handleLogin()
    }
}
onMounted(() => {
    //绑定监听事件
    window.addEventListener('keydown', keyDown)
});
onUnmounted(() => {
    //销毁事件
    window.removeEventListener('keydown', keyDown, false)
});

</script>


<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;


.back-ground {
    display: flex;
    justify-content: center;
    align-items: stretch;
    //background-image: url("../../assets/login_images/350.jpg");
    background-color: #2d3a4b;
    background-size: 100% 100%;
    height: 100%;
    width: 100%;
    position: fixed;
}

.login-container {
    //min-height: 100%;
    //width: 100%;
    //background-color: $bg;
    //overflow: hidden;

    .login-form {
        position: relative;
        width: 520px;
        max-width: 100%;
        padding: 160px 35px 0;
        margin: 0 auto;
        overflow: hidden;
    }

    .tips {
        font-size: 14px;
        color: #fff;
        margin-bottom: 10px;

        span {
            &:first-of-type {
                margin-right: 16px;
            }
        }
    }

    .login-button {
        width: 50%;
        display: block;
        margin: 0 auto;

    }

    .svg-container {
        padding: 6px 5px 6px 15px;
        color: $dark_gray;
        vertical-align: middle;
        width: 30px;
        display: inline-block;
    }

    .title-container {
        position: relative;

        .title {
            font-size: 26px;
            color: $light_gray;
            margin: 0px auto 40px auto;
            text-align: center;
            font-weight: bold;
        }
    }

    .show-pwd {
        position: absolute;
        right: 10px;
        top: 7px;
        font-size: 16px;
        color: $dark_gray;
        cursor: pointer;
        user-select: none;
    }
}
</style>
