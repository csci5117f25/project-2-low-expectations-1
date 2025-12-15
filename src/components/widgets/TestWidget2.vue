<template>
  <div class="test-widget">
    <h3>Test Widget 2</h3>
    <p>Another half-width test component</p>
  </div>
</template>

<script setup>
</script>

<style scoped>
.test-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(76, 175, 80, 0.1);
  border: 2px dashed #4caf50;
  border-radius: 8px;
}

.test-widget h3 {
  margin: 0 0 0.5rem 0;
  font-family: 'Cinzel', serif;
  color: var(--text-color);
}

.test-widget p {
  margin: 0;
  font-family: 'Oswald', sans-serif;
  color: var(--text-color-secondary);
}
</style>
