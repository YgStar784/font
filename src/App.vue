<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'
//export const url = ref('https://' + localStorage.getItem('nodeIp') + ':' + localStorage.getItem('nodePort') + '/api')



</script>
<template>

  <transition name="fade">
    <RouterView />
  </transition>

</template>

<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity .5s;
  /* 过渡效果的样式和持续时间 */
}

.fade-enter,
.fade-leave-to

/* 进入和离开的样式 */
  {
  opacity: 0;
}

/* 初始状态为透明 */
</style>