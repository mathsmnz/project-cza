<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import PasswordCard from '@/components/PasswordCard.vue'

const route = useRoute()
const token = computed(() => route.query.token)
</script>

<template>
  <password-card token="token" />
</template>

<style scoped></style>
