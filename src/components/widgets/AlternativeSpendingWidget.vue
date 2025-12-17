<template>
  <div class="alternative-spending-widget">
    <h3 class="widget-title">
      What You Could've Had Instead
    </h3>
    <p class="couldve-intro">
      <span v-if="totalLoss > 0">
        Your net loss of <strong class="negative">${{totalLoss.toFixed(2)}}</strong> could've been...
      </span>
      <span v-else-if="totalProfit > 0">
        You're up <strong class="positive">${{totalProfit.toFixed(2)}}</strong> You can now buy
      </span>
      <span v-else>
        Start tracking your visits to see what you could've spent your money on instead.
      </span>
    </p>
    <div v-if="totalLoss > 0 || totalProfit > 0">
      <div class="item-display">
        <div class="item-suggestion">
          <span class="item-quantity">{{ currentItem.num }} x </span>
          <span class="item-name-large">{{ currentItem.name }}</span>
        </div>
      </div>
      <div class="regenerate-section">
        <Button
          label="Show Me Another"
          icon="pi pi-refresh"
          @click="regenerateItem"
          size="small"
          outlined
        />
      </div>
      <div class="grid-2col">
        <div class="couldve-items">
          <Skeleton v-for="i in 2" :key="i" height="32px" />
        </div>
        <div class="couldve-quotes">
          <Skeleton v-for="i in 2" :key="i" height="32px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { computed, ref } from 'vue';
import { items } from './whatYouCouldaHad.json';
import Button from 'primevue/button';

const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
});

// calculate total profit/loss
const totalProfit = computed(() => {
  if (!props.visits || props.visits.length === 0) return 0

  return props.visits.reduce((sum, visit) => {
    const profit = visit.profit || 0
    return sum + profit
  }, 0)
});

const totalLoss = computed(() => {
  return totalProfit.value < 0 ? -totalProfit.value : 0
});

//generate a new random item on total loss
const generateRandomItem = () => {
  const net_change = Math.abs(totalProfit.value)
  const rand = Math.floor(Math.random() * items.length);
  let price = items[rand].price;
  let num_items = Math.floor(net_change / price);
  console.log("Generated item price: ", price, " num_items: ", num_items);
  if( num_items < 1) {
    price = items[0].price;
    num_items = net_change / price;
    return { num: num_items, name: items[0].name };
  }
  return { num: num_items, name: items[rand].name };
};

const currentItem = ref(generateRandomItem());

const regenerateItem = () => {
  currentItem.value = generateRandomItem();
};

</script>

<style scoped>
.alternative-spending-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-color-secondary, #ffffff);
  margin: 0 0 1rem 0;
}

.title-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.couldve-intro {
  margin: 0 0 1.5rem 0;
  color: var(--text-color);
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.negative {
  color: var(--red-500);
}

.positive {
  color: var(--green-500);
}

.item-display {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--primary-500);
  border-radius: 8px;
}

.item-suggestion {
  text-align: center;
}

.item-quantity {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.item-name-large {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.regenerate-section {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  margin-top: 1rem;
}
</style>
