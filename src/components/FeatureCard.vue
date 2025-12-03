<script setup>
import Card from 'primevue/card'
defineProps({
    icon: String, title: String,
    description: String
})
</script>

<template>
    <Card class="card">
        <template #header>
            <div class="icon">
                {{ icon }}
            </div>
        </template>
        <template #title>
            <p class="title">
            {{ title }}
            </p>
        </template>
        <template #content>
            <p class="content">
                {{ description }}
            </p>
        </template>
    </Card>
</template>

<style scoped>
.card {
    height: 100%;
    background: white;
    padding: 24px;
    border-radius: 16px;
    color: var(--primary-color);
}
.icon {
    font-size: 32px;
    margin-bottom: 5px;
}
.title {
    font-family: 'Oswald', sans-serif;
    margin-bottom: -10px;
    font-size: 600;
}
.content {
    font-family: 'Oswald', sans-serif;
    font-size: 400;
}
</style>



