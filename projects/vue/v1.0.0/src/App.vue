<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div>
    <h1>Vue + Vite</h1>
    <button @click="count++">Count is: {{ count }}</button>
  </div>
</template>

<style scoped>
div {
  text-align: center;
  padding: 2rem;
}
button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}
</style>
