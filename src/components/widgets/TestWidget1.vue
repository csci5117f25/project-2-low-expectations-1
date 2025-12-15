<template>
  <div class="test-widget">
    <h3>Test Widget 1</h3>
    <p>This is a half-width test component</p>
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
  background: rgba(94, 21, 125, 0.1);
  border: 2px dashed var(--primary-color);
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
