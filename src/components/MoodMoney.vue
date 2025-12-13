<script setup>
import { ref, watch, computed } from 'vue'
import { collection } from 'firebase/firestore'
import { db } from '../firebase_conf'
import { useCurrentUser, useCollection } from 'vuefire'
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

const user = useCurrentUser()
const chartData = ref(null)
const chartUpdated = ref(0)
const chartOptions = ref({
  responsive: true,
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
    },
    y: {
      ticks: { display: false },
      grid: {
        drawTicks: false,
        drawBorder: false,
        color: (context) => (context.tick.value === 0 ? '#999' : 'transparent'),
      },
    },
  },
})

async function loadData(logs) {
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

//reactive ref to the current user's 'casinoVisits' collection
const visits = computed(() => {
  if (!user.value) return null
  return useCollection(collection(db, 'users', user.value.uid, 'casinoVisits'))
})

//watch for updates in visit logs and update the bar chart
watch(
  () => visits.value?.value,
  (logs) => {
    if (!logs) return
    loadData(logs)
    chartUpdated.value++ //forces the chart to update
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="grid-2col">
    <Card>
      <template #title> Mood vs Money </template>
      <template #content>
        <Bar v-if="chartData" :key="chartUpdated" :data="chartData" :options="chartOptions" />
      </template>
    </Card>
  </div>
</template>
