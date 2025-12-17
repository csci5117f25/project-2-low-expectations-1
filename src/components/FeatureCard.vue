<script setup>
import Card from 'primevue/card'
defineProps({
  icon: String,
  title: String,
  description: String,
})
</script>

<template>
  <Card class="card">
    <template #title>
      <p class="title">
        <i :class="icon" class="inline-icon"></i> {{ title }}
      </p>
    </template>
    <template #content>
      <p class="content">
        {{ description }}
      </p>
    </template>
  </Card>
</template>

<style scoped>
.card {
  height: auto;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  color: white;
}

.inline-icon {
  margin-right: 10px;
  font-size: 20px;
}
.title {
  font-family: 'Oswald', sans-serif;
  margin-bottom: -10px;
  font-size: 600;
  display: flex;
  align-items: center;
}
.content {
  font-family: 'Oswald', sans-serif;
  font-size: 400;
}
</style>
