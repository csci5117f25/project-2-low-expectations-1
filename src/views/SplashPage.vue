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
<style>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }

.container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.container::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url('/casino-bg.jpg') center/cover no-repeat;
  filter: blur(8px);
  z-index: -1;
}

.content {
  text-align: center;
  max-width: 400px;
  width: 100%;
  background: #282828d2;
  padding: 40px;
  border-radius: 20px;
}

.title{
  margin-top: 0px;
}

.subtitle {
  color: var(--p-text-muted-color);
}

.login {
  display: flex;
  justify-content: center;
}
</style>
