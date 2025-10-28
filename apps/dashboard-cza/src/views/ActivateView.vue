<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import ActivationCard from '@/components/ActivationCard.vue'

const route = useRoute();
const token = computed(() => route.query.token);
</script>

<template>
  <activation-card token="token"/>
</template>

<style scoped></style>
