<script setup>
  import { signOut } from 'firebase/auth'
  import { useFirebaseAuth } from 'vuefire'
  import router from '@/router'
  import Button  from 'primevue/button'


  const auth = useFirebaseAuth()
  async function logout() {
    try {
       const result = await signOut(auth)

       router.push('/')
    } catch {
      alert("logout failed")
    }


  }

</script>

<template>

  <!-- <button @click="logout()">log out</button> -->

  <Button label="Log Out" icon="pi pi-sign-out" text @click="logout" />

</template>

<style>

</style>
