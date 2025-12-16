<script setup>
import { ref } from 'vue'
import { db, auth } from '@/firebase_conf.js'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useCollection, useCurrentUser } from 'vuefire'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputGroupAddon from 'primevue/inputgroupaddon'
import DatePicker from 'primevue/calendar'
import Rating from 'primevue/rating'
import { useToast } from 'primevue/usetoast'
import SpeechToText from './SpeechToText.vue'
import AutoComplete from 'primevue/autocomplete'

const toast = useToast()
const visible = ref(false)
const selectedCasino = ref(null)
const visitDate = ref(new Date()) //auto set to today
const initialAmount = ref(null)
const cashOutAmount = ref(null)
const mood = ref(0)
const notes = ref('')
const filteredCasinos = ref([])

const user = useCurrentUser()
const userCasinos = useCollection(collection(db, 'users', user.value.uid, 'casinos'))

const emit = defineEmits(['update:visible'])

// Search/filter casinos for autocomplete
const searchCasinos = (event) => {
  const query = event.query.toLowerCase().trim()

  if (!userCasinos.value || userCasinos.value.length === 0) {
    // No existing casinos, show option to create new
    if (query) {
      filteredCasinos.value = [{ name: event.query, isNew: true }]
    } else {
      filteredCasinos.value = []
    }
    return
  }

  const matches = userCasinos.value.filter((casino) => casino.name.toLowerCase().includes(query))

  const exactMatch = userCasinos.value.some((casino) => casino.name.toLowerCase() === query)

  if (!exactMatch && query) {
    filteredCasinos.value = [...matches, { name: event.query, isNew: true }]
  } else {
    filteredCasinos.value = matches
  }
}

const addNewCasino = async (casinoName) => {
  try {
    const docRef = await addDoc(collection(db, 'users', user.value.uid, 'casinos'), {
      name: casinoName,
      createdAt: serverTimestamp(),
    })
    return { id: docRef.id, name: casinoName }
  } catch (e) {
    console.error('Error adding casino:', e)
    return null
  }
}

const logVisit = async () => {
  if (!selectedCasino.value) {
    toast.add({ severity: 'warn', summary: 'Please select or enter a casino name', life: 3000 })
    return
  }

  if (!visitDate.value) {
    toast.add({ severity: 'warn', summary: 'Please select a visit date', life: 3000 })
    return
  }

  if (initialAmount.value === null || initialAmount.value === '') {
    toast.add({ severity: 'warn', summary: 'Please enter an initial amount', life: 3000 })
    return
  }

  if (cashOutAmount.value === null || cashOutAmount.value === '') {
    toast.add({ severity: 'warn', summary: 'Please enter a cash out amount', life: 3000 })
    return
  }

  if (!mood.value || mood.value === 0) {
    toast.add({ severity: 'warn', summary: 'Please rate your mood', life: 3000 })
    return
  }

  const initial = Number(initialAmount.value) || 0
  const cashout = Number(cashOutAmount.value) || 0
  const profit = cashout - initial
  const user = auth.currentUser

  try {
    let casinoId
    let casinoName

    if (typeof selectedCasino.value === 'string') {
      // User typed a new casino name without selecting from dropdown
      const newCasino = await addNewCasino(selectedCasino.value)
      if (newCasino) {
        casinoId = newCasino.id
        casinoName = newCasino.name
      }
    } else if (selectedCasino.value.isNew) {
      // User selected "Create new" option
      const newCasino = await addNewCasino(selectedCasino.value.name)
      if (newCasino) {
        casinoId = newCasino.id
        casinoName = newCasino.name
      }
    } else {
      // Existing casino selected
      casinoId = selectedCasino.value.id
      casinoName = selectedCasino.value.name
    }

    await addDoc(collection(db, 'users', user.uid, 'casinoVisits'), {
      casinoId: casinoId,
      casinoName: casinoName,
      visitDate: visitDate.value,
      initialAmount: initial,
      cashOutAmount: cashout,
      profit: profit,
      mood: mood.value,
      notes: notes.value,
      createdAt: serverTimestamp(),
    })
    // resetting the fields
    selectedCasino.value = null
    visitDate.value = null
    initialAmount.value = 0
    cashOutAmount.value = 0
    mood.value = 0
    notes.value = ''
    visible.value = false
    emit('update:visible', false)
    toast.add({ severity: 'success', summary: 'Your visit is logged!', life: 3000 })
  } catch (e) {
    console.error('Error logging the form:', e)
  }
}
</script>

<template>
  <Dialog header="Log your Casino Visit" v-model:visible="visible" :modal="true" :closable="true">
    <div class="logvisit-form-container">
      <div class="form-field">
        <label for="casino-name">Casino Name: </label>
        <!-- <InputText id="casino-name" v-model="casinoName" placeholder="Name, location..." /> -->
        <AutoComplete
          id="casino-name"
          v-model="selectedCasino"
          :suggestions="filteredCasinos"
          optionLabel="name"
          placeholder="Search or add a casino..."
          @complete="searchCasinos"
          :dropdown="true"
          forceSelection
        />
      </div>
      <div class="form-field">
        <label for="visit-date">Visit Date: </label>
        <DatePicker
          id="visit-date"
          v-model="visitDate"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="yy-mm-dd"
        />
      </div>
      <div class="form-field">
        <label for="buyIn">Initial Amount: </label>
        <InputGroupAddon>$</InputGroupAddon>
        <InputText
          id="initlal_amt"
          v-model="initialAmount"
          type="number"
          placeholder="Enter only number."
        />
      </div>
      <div class="form-field">
        <label for="cashOut">Cash Out Amount: </label>
        <InputGroupAddon>$</InputGroupAddon>
        <InputText
          id="cashout_amt"
          v-model="cashOutAmount"
          type="number"
          placeholder="Enter only number."
        />
      </div>
      <div class="form-field">
        <label for="mood">Mood: </label>
        <Rating id="mood" v-model="mood" :stars="5" cancel />
      </div>
      <div class="form-field">
        <label for="notes">Notes: </label>
        <!-- <Textarea id="notes" v-model="notes" rows="4" placeholder="Add notes about vist here..." /> -->
        <SpeechToText v-model="notes"></SpeechToText>
      </div>
      <div class="form-actions">
        <!-- <Button label="Cancel" class="p-button-text" @click="visible = false" /> -->
        <Button label="Log Visit" @click="logVisit" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.logvisit-form-container {
  display: flex;
  flex-direction: column;
  gap: var(--gap-large);
  background: var(--surface-card);
  padding: 1.5rem 18rem;
  border-radius: var(--radius-large);
  border: 1px solid var(--form-border);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--gap-small);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--gap-medium);
  margin-top: 0.75rem;
}

.p-InputGroupAddon {
  margin-right: 0.25rem;
}

.p-inputtext,
.p-calendar,
.p-inputtextarea {
  background: #2b2b2b;
  width: 100%;
  border-radius: var(--radius-medium);
  border: 1px solid var(--form-border);
  color: var(--text-primary);
  font-size: 1rem;
  padding: 0.75rem 1rem;
}

.p-rating {
  display: flex;
  gap: 0.5rem;
  background: transparent;
  padding: 0;
}

.p-inputtext:focus,
.p-calendar:focus-within,
.p-inputtextarea:focus,
.p-rating:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.p-dialog .p-dialog-header {
  background: var(--surface-card);
  text-transform: uppercase;
  letter-spacing: 2px;
}
.p-diaglog .p-dialog-content {
  background: var(--surface-card);
}

.p-button {
  font-size: 1rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-medium);
}

.p-diaglog .p-footer {
  background: var(--surface-card);
  padding-top: 1.25rem;
}

.p-button.p-button-text {
  color: var(--text-secondary);
}
</style>
