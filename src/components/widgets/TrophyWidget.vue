<script setup>
import { ref, watch } from 'vue'
import Card from 'primevue/card'

// Props
const props = defineProps({
  visits: {
    type: Array,
    default: () => []
  }
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
  
  props.visits.forEach(visit => {
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
  <div class="grid-2col">
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

<style>
.icons {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.max,
.min {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.max i,
.min i {
  font-size: 2.5rem;
}
</style>
