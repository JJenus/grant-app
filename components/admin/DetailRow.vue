<template>
  <div class="flex gap-4">
    <p class="text-xs font-semibold uppercase tracking-wide flex-shrink-0 mt-0.5" style="color: #bbb; width: 7rem">{{ label }}</p>
    <p class="text-sm" style="color: var(--color-charcoal)">{{ value ?? '—' }}</p>
  </div>
</template>
<script setup lang="ts">
defineProps({ label: String, value: [String, Number] })
</script>
