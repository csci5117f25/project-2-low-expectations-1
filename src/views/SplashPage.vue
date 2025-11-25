<script setup>
import LogInButton from '@/components/LogInButton.vue';
</script>

<template>
  <div class="container">
    <div class="content">
      <h1 class="title">gamblr</h1>
      <p class="subtitle">Please log in to manage your tasks</p>
      <div class="login">
        <LogInButton></LogInButton>
      </div>
    </div>
  </div>
</template>
<style scoped>
  .container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  font-family: var(--font-family);
}

.content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.subtitle {
  color: var(--p-text-muted-color);
}

.login {
  display: flex;
  justify-content: center;
}
</style>
