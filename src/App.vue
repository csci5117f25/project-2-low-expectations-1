<script setup>
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast'
</script>

<template>
  <Toast />
  <RouterView />
</template>

<style scoped>
  body, #app {
  position: relative;
  z-index: 1;
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  background: white !important;
}
</style>
