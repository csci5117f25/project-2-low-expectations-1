<script setup>
import { ref, watch } from 'vue'
import Card from 'primevue/card'

// Props
const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
})

const maxValue = ref(0)
const minValue = ref(0)

// Calculate max and min values from visits
const calculateValues = () => {
  if (!props.visits || props.visits.length === 0) {
    maxValue.value = 0
    minValue.value = 0
    return
  }
  let max = 0
  let min = 0

  props.visits.forEach((visit) => {
    const profit = visit.profit || 0
    if (profit > max) {
      max = profit
    }
    if (profit < min) {
      min = profit
    }
  })
  maxValue.value = max
  minValue.value = min
}

// Watch for changes in visits
watch(() => props.visits, calculateValues, { immediate: true, deep: true })
</script>

<template>
  <div class="trophy-widget-container">
    <Card>
      <template #title> Biggest Win and Loss </template>
      <template #content>
        <div class="icons">
          <div class="max">
            <i class="pi pi-sort-up-fill" style="color: green"></i>
            <p>{{ maxValue }}</p>
          </div>
          <div class="min">
            <i class="pi pi-sort-down-fill" style="color: red"></i>
            <p>{{ minValue }}</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.trophy-widget-container {
  width: 100%;
  max-width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.trophy-widget-container :deep(.p-card) {
  width: 100%;
  max-width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.trophy-widget-container :deep(.p-card-title) {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-color-secondary, #ffffff);
  margin: 0 0 1rem 0;
}

.trophy-widget-container :deep(.p-card-body),
.trophy-widget-container :deep(.p-card-content) {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  flex-wrap: wrap;
  width: 100%;
}

.max,
.min {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  min-width: 100px;
}

.max i,
.min i {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.max p,
.min p {
  margin: 0;
  font-family: 'Oswald', sans-serif;
}

@media (max-width: 768px) {
  .trophy-widget-container :deep(.p-card-title) {
    font-size: 1rem;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
  }

  .icons {
    gap: 2rem;
  }

  .max,
  .min {
    font-size: 1.25rem;
    min-width: 80px;
  }

  .max i,
  .min i {
    font-size: 2rem;
    margin-bottom: 0.4rem;
  }
}

@media (max-width: 480px) {
  .trophy-widget-container :deep(.p-card-title) {
    font-size: 0.9rem;
    text-align: center;
  }

  .trophy-widget-container :deep(.p-card-body),
  .trophy-widget-container :deep(.p-card-content) {
    padding: 0.75rem;
  }

  .icons {
    gap: 1.5rem;
    flex-direction: row;
  }

  .max,
  .min {
    font-size: 1.1rem;
    min-width: 70px;
  }

  .max i,
  .min i {
    font-size: 1.75rem;
    margin-bottom: 0.3rem;
  }
}

@media (max-width: 360px) {
  .icons {
    gap: 1rem;
  }

  .max,
  .min {
    font-size: 1rem;
    min-width: 60px;
  }

  .max i,
  .min i {
    font-size: 1.5rem;
  }
}
</style>