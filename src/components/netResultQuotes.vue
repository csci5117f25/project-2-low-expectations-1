<script setup>
import { ref, watch } from 'vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase_conf'
import { useCurrentUser } from 'vuefire'
import Message from 'primevue/message'

const user = useCurrentUser()
const visits = ref([])
const netResult = ref(0)
const sessionQuote = ref('')

const quotes = {
  up: [
    "You played, took the swings, and still cashed out ahead",
    "The session went green and you had the discipline to lock it in",
    "You beat the game and walked away on time",
    "Profit means you respected the bankroll and the exit",
    "The house blinked first and you took the money",
    "You won because you knew when to stop",
    "Green numbers mean the plan worked today",
    "You survived the variance and left with profit",
    "You turned risk into a clean cash out",
    "Up today and smart enough to keep it that way",
  ],
  down: [
    "You lost money to a system designed to take it from you",
    "The house did exactly what it is built to do",
    "Every extra minute here only makes this number worse",
    "Nothing you do next will fix the money you lossed",
    "Chasing turns small losses into real problems",
    "The game does not know you are due",
    "Staying longer only helps the casino",
    "This is how bankrolls slowly disappear",
    "You already loss enough for today",
    "Walk away now or regret it later",
  ],
  even: [
    "No money was loss or gained, so spend more!",
  ],
}

const pickRandom = (arr) =>
  arr[Math.floor(Math.random() * arr.length)]

const getNetQuote = () => {
  let net = 0
  visits.value.forEach(v => {
    const profit = v.profit || 0
    net += profit
  })
  netResult.value = net
  if (net > 0) sessionQuote.value = pickRandom(quotes.up)
  else if (net < 0) sessionQuote.value = pickRandom(quotes.down)
  else sessionQuote.value = quotes.even[0]
}


watch(user, (currentUser) => {
  if (!currentUser) return
  const userID = currentUser.uid
  const visitRef = collection(db, 'users', userID, 'casinoVisits')
  const q = query(visitRef, orderBy('visitDate', 'asc'))
  onSnapshot(q, (snapshot) => {
    visits.value = [] 
    snapshot.forEach((doc) => {
      const data = doc.data()
      visits.value.push({
        id: doc.id,
        profit: data.profit,
        visitDate: data.visitDate,
        casinoName: data.casinoName,
      })
    })
    getNetQuote()
  })
}, { immediate: true })

</script>

<template>
  <Message
    severity="info" :closable="false" class="session-message">
    <p>{{ sessionQuote }}</p>
  </Message>
</template>

