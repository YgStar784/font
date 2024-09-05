<template>
    <div class="login-container">
        <div class="body">
            <div class="login-wrap">
                <div class="intro">
                    <h3>Manage System</h3>


                </div>
                <div class="login-form">
                    <el-form ref="formRef" :rules="rules" :model="form" auto-complete="on">
                        <div class="title-container">
                            <h3 class="title">登录</h3>
                        </div>
                        <el-form-item prop="username">
                            <div class="svg-container">
                                <el-icon>
                                    <Avatar />
                                </el-icon>
                            </div>
                            <el-input placeholder="请输入用户名" class="user" v-model="form.username" />
                        </el-form-item>
                        <el-form-item prop="password">
                            <div class="svg-container">
                                <el-icon>
                                    <Lock />
                                </el-icon>
                            </div>
                            <el-input type="password" placeholder="请输入密码" class="pwd" v-model="form.password" />
                        </el-form-item>
                        <el-button style="width: 100%; margin-bottom: 10px;padding: 20px 0;" type="primary"
                            class="login-button" @click="handleLogin" @keydown.enter="keyDown()">登录
                        </el-button>
                    </el-form>
                </div>
            </div>
            <div class="footer">

            </div>
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


const form = ref({ username: '', password: '' })
const sha256 = require("js-sha256").sha256; //引入sha256库

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


                //console.log(littleUrl.value)
                //littleUrl.value = littleUrlSetAPI(littleUrl.value)
                //console.log(littleUrl.value)
                //2.跳转首页
                router.replace({ path: '/' })
                return
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
        return
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

.login-container {
    width: 100vw;
    height: 100vh;
    background-color: #d9ecff;
    background-position: 50%;
    background-size: cover;
    background-repeat: no-repeat;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.login-container .body {
    position: absolute;
    top: 50%;
    left: 50%;

    transform: translate3d(-50%, -50%, 0);
}

.intro {
    position: relative;
    width: 50%;
    color: #fff;
    text-align: center;
    height: 500px;
    line-height: 500px;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    background: linear-gradient(-60deg, #ecf5ff, #409EFF, #337ecc);
    //background: radial-gradient(circle, #ecf5ff, #409EFF);
    /*     background: linear-gradient(#a0cfff, #409EFF, #ecf5ff) */
}

.intro h3 {
    font-size: 30px;
    vertical-align: middle;
    font-style: italic;
    text-shadow: 0 0 5px black;

}

.login-container .login-wrap {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-flex: 1;
    -ms-flex-positive: 1;
    flex-grow: 1;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    position: relative;
    background-color: #fff;
    border-radius: 10px;
    -webkit-box-shadow: 0 16px 32px 0 rgba(0, 0, 0, .08);
    box-shadow: 0 16px 32px 0 rgba(0, 0, 0, .08);
    margin-top: 30px;
    width: 1000px;
    height: 500px;
}

.login-container .login-form {
    width: 50%;
    padding: 80px 59px;
    max-width: 100%;
    margin: 0 auto;
    overflow: hidden;
    box-sizing: border-box;
}

.login-container .title-container {
    position: relative;
}

.login-container .title-container .title {
    font-size: 26px;
    color: #000;
    margin: 0 auto 40px auto;
    text-align: left;
    font-weight: 700;
}

.login-container .el-form-item {
    border: 1px solid rgba(0, 0, 0, .1);
    border-radius: 5px;
    color: #454545;


}

::v-deep.el-form-item .el-form-item__content {
    line-height: 40px;
    position: relative;
    font-size: 14px;
}

.login-container .svg-container {
    color: #889aa4;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
}

.el-icon {
    width: 1em;
    height: 1em;
    vertical-align: -.15em;
    fill: currentColor;
    overflow: hidden;
}

.el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
}




.el-input ::v-deep .el-input__wrapper {

    display: inline-block;
    width: 100%;
    height: 47px;
    padding: 0;
    text-align: center;
    border: 0;
    box-shadow: 0 0 0 0;
}

.el-form-item.is-error ::v-deep .el-input__wrapper,
.el-form-item.is-error ::v-deep .el-input__wrapper.is-focus,
.el-form-item.is-error ::v-deep .el-input__wrapper:focus,
.el-form-item.is-error ::v-deep .el-input__wrapper:hover,
.el-form-item.is-error ::v-deep .el-select__wrapper,
.el-form-item.is-error ::v-deep .el-select__wrapper.is-focus,
.el-form-item.is-error ::v-deep .el-select__wrapper:focus,
.el-form-item.is-error ::v-deep .el-select__wrapper:hover,
.el-form-item.is-error ::v-deep .el-textarea__inner,
.el-form-item.is-error ::v-deep .el-textarea__inner.is-focus,
.el-form-item.is-error ::v-deep .el-textarea__inner:focus,
.el-form-item.is-error ::v-deep .el-textarea__inner:hover {
    box-shadow: 0 0 0 0px var(--el-color-danger) inset;
}

.el-input ::v-deep input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #fff inset !important;
    box-shadow: inset 0 0 0 1000px #fff !important;
    -webkit-text-fill-color: #000 !important;
}




.el-input ::v-deep input {
    background: transparent;
    border: 0;
    appearance: none;
    border-radius: 0;
    padding: 12px 5px 12px 15px;
    color: #000;
    height: 47px;
    caret-color: #000;

}

::v-deep .el-input__inner {
    appearance: none;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;

    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    color: #666;
    display: inline-block;
    font-size: inherit;
    height: 40px;
    line-height: 40px;
    outline: 0;
    padding: 0 15px;
    -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
    width: 100%;
}


/* 
    .el-input ::v-deep .el-input__inner {
        appearance: none;
        background-color: #fff;
        background-image: none;
        border-radius: 4px;

        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        color: #666;
        display: inline-block;
        font-size: inherit;
        height: 40px;
        line-height: 40px;
        outline: 0;
        padding: 0 15px;
        -webkit-transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
        transition: border-color .2s cubic-bezier(.645, .045, .355, 1);
        width: 100%;
 */


/* .back-ground {
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
} */
</style>
