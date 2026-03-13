<template>
  <div class="p-4 rounded-xl border" style="background: var(--color-mist); border-color: var(--color-sand)">
    <div class="flex items-center justify-between mb-2">
      <p class="text-xs font-semibold uppercase tracking-wider" style="color: var(--color-sage)">{{ title }}</p>
      <button v-if="step" @click="$emit('edit', step)" class="text-xs underline" style="color: var(--color-sage)">Edit</button>
    </div>
    <div class="text-sm" style="color: var(--color-charcoal)"><slot /></div>
  </div>
</template>

<script setup lang="ts">
defineProps({ title: String, step: Number })
defineEmits(['edit'])
</script>

