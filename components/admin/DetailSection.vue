<template>
  <div class="bg-white rounded-xl border p-5" style="border-color: #e5e5e0">
    <p class="text-xs font-semibold uppercase tracking-wide mb-4" style="color: var(--color-sage)">{{ title }}</p>
    <div class="space-y-3"><slot /></div>
  </div>
</template>
<script setup lang="ts">
defineProps({ title: String })
</script>

