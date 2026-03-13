<template>
  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize" :style="style">
    {{ status }}
  </span>
</template>

<script setup lang="ts">
const props = defineProps({ status: String })

const styleMap: Record<string, string> = {
  draft:     'background:#f0f0ec;color:#888',
  submitted: 'background:#fef9e7;color:#9a6700',
  reviewing: 'background:#e8f0fe;color:#1a4db5',
  approved:  'background:#e6f5ec;color:#1e6b3a',
  rejected:  'background:#fee8e8;color:#9b1c1c',
}

const style = computed(() => styleMap[props.status || ''] || styleMap.draft)
</script>

