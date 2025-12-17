<script setup>
import { useCurrentUser } from 'vuefire'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const user = useCurrentUser()
const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
})

//different columns for the data tables based on casinovisit data
const allColumns = [
  {
    field: 'createdAt',
    header: 'Date',
    body: (row) => {
      if (!row.createdAt) return ''
      const date = row.createdAt.toDate
        ? row.createdAt.toDate()
        : new Date(row.createdAt.seconds * 1000)
      return date.toLocaleDateString()
    },
  },
  { field: 'casinoName', header: 'Casino' },
  {
    field: 'profit',
    header: 'Profit',
    body: (row) => {
      let color = 'gray'
      if (row.profit > 0) color = 'green'
      else if (row.profit < 0) color = 'red'
      return `<span style="color:${color}; font-weight:bold;">${row.profit}</span>`
    },
  },
  { field: 'mood', header: 'Mood' },
]
</script>

<template>
  <div class="recent-history-widget">
    <div class="widget-title">Recent History</div>
    <div class="history-wrapper">
      <DataTable
        :value="visits"
        responsiveLayout="scroll"
        scrollable
        :scrollHeight="visits.length > 3 ? '200px' : 'auto'"
        class="full-table"
        emptyMessage="No visits logged yet."
      >
        <Column v-for="col in allColumns" :key="col.field" :field="col.field" :header="col.header">
          <template #body="props">
            <!-- handles the different colors for profit values -->
            <span v-if="col.body" v-html="col.body(props.data)"></span>
            <span v-else>{{ props.data[col.field] }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style>
.full-table td {
  white-space: normal;
  word-break: break-word;
  padding: 0.5rem;
}
.recent-history-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  box-sizing: border-box;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  text-align: left;
  margin: 0 0 1rem 0;
  color: var(--text-color-secondary);
  font-weight: 700;
  letter-spacing: 1px;
}

.history-wrapper {
  position: relative;
  padding-top: 20px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}
</style>
