<template>
    <el-dialog class="dialog" :model-value="dialogVisible" title="用户授权" width="1100" @close="handleClose"
        :append-to-body="true">
        <el-card>
            <h3 style="padding-bottom:16px">{{ name }}</h3>
            <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
                <el-tab-pane label="已授权的用户" name="Authorized">
                    <UserTable v-if="valid === 0" :Uuid="Uuid" tableValue="Authorized" />

                </el-tab-pane>
                <el-tab-pane label="未被授权的用户" name="unAuthorized">
                    <UserTable v-if="valid === 1" :Uuid="Uuid" tableValue="unAuthorized" />

                </el-tab-pane>
            </el-tabs>
            <!--      <UserTable v-show="activeName === 'Authorized'" :Uuid="Uuid" :tableValue="activeName" />
            <UserTable v-show="activeName === 'unAuthorized'" :Uuid="Uuid" :tableValue="activeName" />
 -->
        </el-card>

    </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

import UserTable from './userTable.vue'
import { getMyDataSourceAuthUserAPI, getMyDataSourceUnAuthUserAPI } from '@/apis/dataSource'
// import { changeGlobalNodesTarget } from 'element-plus/es/utils'
const emits = defineEmits(['update:modelValue'])
const activeName = ref('Authorized')
const name = ref('')
const Uuid = ref('')
const valid = ref(0)
const props = defineProps({
    dialogValue: {
        type: String,
        default: '',
        required: true
    },
    Uuid: {
        type: String,
        default: '',
        required: true
    },
    name: {
        type: String,
        default: '',
        required: true
    }
})

name.value = props.name
Uuid.value = props.Uuid
console.log(name.value, Uuid.value)
const handleClick = () => {
    activeName.value = activeName.value === 'Authorized' ? 'unAuthorized' : 'Authorized'
    valid.value = valid.value === 0 ? 1 : 0
}
const handleClose = () => {
    emits('update:modelValue', false)
}




</script>

<style lang="scss" scoped>
.dialog {
    padding-top: 10px;
}
</style>