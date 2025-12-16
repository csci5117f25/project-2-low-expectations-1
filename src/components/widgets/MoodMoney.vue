<script setup>
import { ref, watch } from 'vue'
import Card from 'primevue/card'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

// Props
const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
})

const chartData = ref(null)
const chartUpdated = ref(0)
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Mood',
      },
      grid: { display: false },
      border: { display: false },
    },
    y: {
      ticks: {
        callback: function (value) {
          return '$' + value.toLocaleString()
        },
      },
      grid: {
        drawTicks: false,
        drawBorder: false,
        color: 'rgba(200,200,200,0.2)',
      },
      border: { display: false },
    },
  },
})

function loadData(logs) {
  const trackNetResult = [0, 0, 0, 0, 0]
  const moodCounter = [0, 0, 0, 0, 0]

  //keep track of each mood's net result
  for (let i = 0; i < logs.length; i++) {
    const mood = Number(logs[i].mood)
    const netResult = Number(logs[i].profit)
    if (mood >= 1 && mood <= 5) {
      const idx = mood - 1
      trackNetResult[idx] += netResult
      moodCounter[idx] += 1
    }
  }
  //average out the net result
  for (let i = 0; i < 5; i++) {
    if (moodCounter[i] > 0) {
      trackNetResult[i] = trackNetResult[i] / moodCounter[i]
    }
  }
  //color of the bars determined by positive or negative net result values
  const barColors = []
  for (let i = 0; i < 5; i++) {
    if (trackNetResult[i] > 0) {
      barColors.push('rgba(34, 197, 94, 0.7)') //positive = green
    } else {
      barColors.push('rgba(239, 68, 68, 0.7)') //negative = red
    }
  }
  //dynamically change the y-max and y-min values based on data
  let max = trackNetResult[0]
  let min = trackNetResult[0]
  for (let i = 1; i < 5; i++) {
    if (trackNetResult[i] > max) {
      max = trackNetResult[i]
    }
    if (trackNetResult[i] < min) {
      min = trackNetResult[i]
    }
  }
  chartOptions.value.scales.y.max = max
  chartOptions.value.scales.y.min = min
  chartData.value = {
    labels: ['1', '2', '3', '4', '5'],
    datasets: [
      {
        label: 'Avg. Net Result',
        data: trackNetResult,
        backgroundColor: barColors,
        borderRadius: 8,
        borderColor: '#999',
      },
    ],
  }
}

//watch for updates in visit logs and update the bar chart
watch(
  () => props.visits,
  (logs) => {
    if (!logs || logs.length === 0) return
    loadData(logs)
    chartUpdated.value++ //forces the chart to update
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="mood-money-chart">
    <Bar
      v-if="chartData"
      class="mood-money-chart-canvas"
      :key="chartUpdated"
      :data="chartData"
      :options="chartOptions"
    />
  </div>
</template>
<style>
.mood-money-chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.mood-money-chart-canvas {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
</style>
