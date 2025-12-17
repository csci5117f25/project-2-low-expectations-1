<template>
  <header class="header">
    <div class="header-left">
      <img src="/playing-cards.png" class="logo" alt="Playing cards logo" />
      <div class="header-title">
        <h1>GAMBLR</h1>
        <p>Track your gambling habits responsibly</p>
      </div>
    </div>

    <div class="header-right">
      <Button label="+ Log Visit" severity="secondary" @click="logVisitFormVisible = true" />
      <LogOutButton />
      <LogVisitForm v-model:visible="logVisitFormVisible" />
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import LogVisitForm from '@/components/LogVisitForm.vue'
import LogOutButton from '@/components/LogOutButton.vue'

const logVisitFormVisible = ref(false)
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--surface-border);
  background: var(--surface-card);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 45px;
  height: 45px;
}

.header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>