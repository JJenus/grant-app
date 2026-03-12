<template>
  <div>
    <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">
      {{ label }}
    </label>
    <slot />
    <p v-if="hint" class="text-xs mt-1" style="color: #999">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' }
})
</script>
