<script setup>
import { ref, watch } from 'vue'
import { collection, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase_conf'
import { useCurrentUser, useCollection } from 'vuefire'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Card from 'primevue/card'

const user = useCurrentUser()
const visits = ref([])

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
      return date.toLocaleString()
    },
  },
  { field: 'casinoName', header: 'Casino' },
  { field: 'initialAmount', header: 'Cash In' },
  { field: 'cashOutAmount', header: 'Cash Out' },
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
  { field: 'notes', header: 'Notes' },
]

//only initialize collection when user is available
watch(
  user,
  (u) => {
    if (!u) return
    const visitRef = collection(db, 'users', u.uid, 'casinoVisits')
    const q = query(visitRef, orderBy('createdAt', 'desc'), limit(5))
    const visitCol = useCollection(q)
    //update visits whenever the collection changes
    watch(
      visitCol,
      (v) => {
        visits.value = v || []
      },
      { immediate: true },
    )
  },
  { immediate: true },
)
</script>

<template>
  <Card class="full-width">
    <template #title> Recent History </template>
    <template #content>
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
    </template>
  </Card>
</template>

<style>
.full-table td {
  white-space: normal;
  word-break: break-word;
  padding: 0.5rem;
}
</style>
