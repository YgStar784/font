<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
import { NMessageProvider, NDialogProvider } from 'naive-ui'

//export const url = ref('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api')



</script>
<template>

  <transition name="fade" mode="out-in">
    <n-message-provider>
      <n-dialog-provider>
        <RouterView />
      </n-dialog-provider>
    </n-message-provider>
  </transition>

</template>

<style lang="scss" scoped></style>