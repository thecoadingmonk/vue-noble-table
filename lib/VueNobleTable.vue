<template>
  <p>Table component</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps({
      msg: { type: String }
    }
)

const count = ref(0)
</script>

<style scoped>
h1 {
  color: #7e22ce;
}
</style>