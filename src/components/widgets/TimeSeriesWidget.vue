<template>
  <div class="time-series-widget">
    <div class="widget-header">
      <h2 class="widget-title">Net Result Over Time</h2>
      <div class="widget-controls">
        <Button
          :label="showCumulative ? 'Cumulative' : 'Session'" 
          @click="toggleView" 
          size="small"
          outlined
        />
      </div>
    </div>
    
    <div class="chart-container">
      <Chart 
        type="line" 
        :data="chartData" 
        :options="chartOptions" 
        class="chart"
      />
    </div>

    <div class="legend-info">
      <div class="legend-item profit">
        <span class="legend-indicator"></span>
        <span class="legend-text">Profit</span>
      </div>
      <div class="legend-item loss">
        <span class="legend-indicator"></span>
        <span class="legend-text">Loss</span>
      </div>
      <div class="legend-item breakeven">
        <span class="legend-indicator"></span>
        <span class="legend-text">Break Even</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Chart from 'primevue/chart';
import Button from 'primevue/button';
// Firebase imports - commented out for static data demo
// import { useCurrentUser } from 'vuefire';
// import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
// import { db } from '../firebase_conf';

// Props
const props = defineProps({
  sessions: {
    type: Array,
    default: () => []
  }
});

// State
const showCumulative = ref(true);
const chartData = ref({});
const chartOptions = ref({});
// const user = useCurrentUser(); // Commented out for static data demo

// Static demo data - replace with Firebase data when ready
const sessionsData = ref([
  {
    id: '1',
    timestamp: new Date('2024-11-01'),
    netResult: -150,
    buyIn: 200,
    cashOut: 50
  },
  {
    id: '2',
    timestamp: new Date('2024-11-05'),
    netResult: 75,
    buyIn: 100,
    cashOut: 175
  },
  {
    id: '3',
    timestamp: new Date('2024-11-10'),
    netResult: -50,
    buyIn: 150,
    cashOut: 100
  },
  {
    id: '4',
    timestamp: new Date('2024-11-15'),
    netResult: 200,
    buyIn: 300,
    cashOut: 500
  },
  {
    id: '5',
    timestamp: new Date('2024-11-20'),
    netResult: -75,
    buyIn: 200,
    cashOut: 125
  },
  {
    id: '6',
    timestamp: new Date('2024-11-25'),
    netResult: 100,
    buyIn: 150,
    cashOut: 250
  },
  {
    id: '7',
    timestamp: new Date('2024-11-30'),
    netResult: -25,
    buyIn: 100,
    cashOut: 75
  }
]);

// Fetch sessions from Firestore - commented out for static data demo
// const fetchSessions = async () => {
//   if (!user.value) return;
  
//   try {
//     const sessionsRef = collection(db, `users/${user.value.uid}/logs`);
//     const q = query(sessionsRef, orderBy('timestamp', 'asc'));
//     const querySnapshot = await getDocs(q);
    
//     sessionsData.value = querySnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//       timestamp: doc.data().timestamp?.toDate() || new Date()
//     }));
    
//     updateChart();
//   } catch (error) {
//     console.error('Error fetching sessions:', error);
//   }
// };

// Computed properties
const activeSessions = computed(() => {
  return props.sessions.length > 0 ? props.sessions : sessionsData.value;
});

// Toggle between cumulative and session view
const toggleView = () => {
  showCumulative.value = !showCumulative.value;
  updateChart();
};

// Update chart data
const updateChart = () => {
  const sortedSessions = [...activeSessions.value].sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
    const dateB = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
    return dateA - dateB;
  });

  let labels = [];
  let data = [];
  let cumulativeSum = 0;

  sortedSessions.forEach((session, index) => {
    const date = session.timestamp instanceof Date ? session.timestamp : new Date(session.timestamp);
    const dateLabel = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
    
    labels.push(dateLabel);
    
    if (showCumulative.value) {
      cumulativeSum += session.netResult || 0;
      data.push(cumulativeSum);
    } else {
      data.push(session.netResult || 0);
    }
  });

  // If no data, show placeholder
  if (data.length === 0) {
    labels = ['Start'];
    data = [0];
  }

  // Determine colors based on values
  const segmentColors = data.map(value => 
    value > 0 ? 'rgba(76, 175, 80, 0.8)' : 
    value < 0 ? 'rgba(244, 67, 54, 0.8)' : 
    'rgba(158, 158, 158, 0.8)'
  );

  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color-secondary') || '#ffffff';
  const textColorSecondary = documentStyle.getPropertyValue('--text-gray') || '#b5acac';
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#2a2a2a';

  chartData.value = {
    labels: labels,
    datasets: [
      {
        label: showCumulative.value ? 'Cumulative Net' : 'Session Net',
        data: data,
        fill: {
          target: 'origin',
          above: 'rgba(76, 175, 80, 0.2)',   // Green fill above zero
          below: 'rgba(244, 67, 54, 0.2)'    // Red fill below zero
        },
        borderColor: (context) => {
          // Create gradient that changes at zero line
          const chart = context.chart;
          const { ctx, chartArea, scales } = chart;
          if (!chartArea) return 'rgba(158, 158, 158, 1)';
          
          const yScale = scales.y;
          const zeroPixel = yScale.getPixelForValue(0);
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          
          // Green above zero, red below zero
          const topRatio = (zeroPixel - chartArea.top) / (chartArea.bottom - chartArea.top);
          
          if (topRatio < 0) {
            // All values below zero
            gradient.addColorStop(0, 'rgba(244, 67, 54, 1)');
            gradient.addColorStop(1, 'rgba(244, 67, 54, 1)');
          } else if (topRatio > 1) {
            // All values above zero
            gradient.addColorStop(0, 'rgba(76, 175, 80, 1)');
            gradient.addColorStop(1, 'rgba(76, 175, 80, 1)');
          } else {
            // Values cross zero
            gradient.addColorStop(0, 'rgba(76, 175, 80, 1)');
            gradient.addColorStop(topRatio, 'rgba(76, 175, 80, 1)');
            gradient.addColorStop(topRatio, 'rgba(244, 67, 54, 1)');
            gradient.addColorStop(1, 'rgba(244, 67, 54, 1)');
          }
          
          return gradient;
        },
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: segmentColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };

  chartOptions.value = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return '$'+value;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: (context) => {
            if (context.tick.value === 0) {
              return 'rgba(255, 255, 255, 0.4)'; // Highlight zero line
            }
            return 'rgba(255, 255, 255, 0.1)';
          },
          lineWidth: (context) => {
            if (context.tick.value === 0) {
              return 2;
            }
            return 1;
          }
        },
        ticks: {
          color: textColorSecondary,
          font: {
            family: 'Oswald, sans-serif',
            size: 12
          },
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: textColorSecondary,
          font: {
            family: 'Oswald, sans-serif',
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };
};

// Lifecycle
onMounted(() => {
  // Use static data for demo - uncomment fetchSessions() when Firebase is ready
  // if (activeSessions.value.length === 0) {
  //   fetchSessions();
  // } else {
  //   updateChart();
  // }
  updateChart();
});

// Watch for prop changes
import { watch } from 'vue';
watch(() => props.sessions, () => {
  updateChart();
}, { deep: true });

// Watch user changes - commented out for static data demo
// watch(user, () => {
//   if (user.value) {
//     fetchSessions();
//   }
// });
</script>

<style scoped>
.time-series-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-color-secondary, #ffffff);
  margin: 0;
}

.widget-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-container {
  flex: 1;
  width: 100%;
  margin-bottom: 1rem;
}

.chart {
  height: 100%;
  width: 100%;
}

.legend-info {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Oswald', sans-serif;
  font-size: 0.85rem;
  color: var(--text-gray, #b5acac);
}

.legend-indicator {
  width: 20px;
  height: 3px;
  border-radius: 2px;
}

.legend-item.profit .legend-indicator {
  background: rgba(76, 175, 80, 1);
}

.legend-item.loss .legend-indicator {
  background: rgba(244, 67, 54, 1);
}

.legend-item.breakeven .legend-indicator {
  background: rgba(158, 158, 158, 1);
  height: 2px;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .widget-title {
    font-size: 1.2rem;
    letter-spacing: 1px;
  }

  .legend-info {
    gap: 1rem;
    font-size: 0.85rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .widget-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .widget-controls {
    width: 100%;
  }

  .chart-container {
    height: 250px;
  }

  .legend-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

</style>
