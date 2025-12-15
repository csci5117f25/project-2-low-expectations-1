<script setup>
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { ref } from 'vue'
import { getFunctions, httpsCallable } from 'firebase/functions'

const text = defineModel({ type: String, default: '' })

const isRecording = ref(false)
const isProcessing = ref(false)
let mediaRecorder = null
let audioChunks = []

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.start()
    isRecording.value = true
  } catch (error) {
    console.error('Microphone access denied:', error)
    alert('Could not access microphone.')
  }
}

const stopRecording = () => {
  if (!mediaRecorder) return

  isRecording.value = false
  isProcessing.value = true

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })

    const base64Audio = await blobToBase64(audioBlob)

    await sendToBackend(base64Audio)

    mediaRecorder.stream.getTracks().forEach((track) => track.stop())
  }

  mediaRecorder.stop()
}

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      // Remove the "data:audio/webm;base64," prefix
      const base64String = reader.result.split(',')[1]
      resolve(base64String)
    }
    reader.onerror = reject
  })
}

const sendToBackend = async (base64String) => {
  const functions = getFunctions()
  const transcribeAudio = httpsCallable(functions, 'transcribeAudio')

  try {
    const result = await transcribeAudio({ audio: base64String })
    text.value = text.value ? text.value + ' ' + result.data.text : result.data.text
  } catch (error) {
    console.error('Firebase Error:', error)
    alert('Failed to transcribe audio.')
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <Textarea v-model="text"></Textarea>
  <Button
    v-if="!isRecording && !isProcessing"
    icon="pi pi-microphone"
    @click="startRecording"
    label="Click to start recording"
  ></Button>
  <Button
    v-else-if="isRecording"
    @click="stopRecording"
    label="Stop and transcribe"
    icon="pi pi-stop"
  ></Button>
  <Button v-else label="Processing..." icon="pi pi-spinner pi-spin" disabled></Button>
</template>
