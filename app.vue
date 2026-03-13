<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
// ── Eruda mobile console (only when ?eruda=1 in URL) ──────────────────────────
if (import.meta.client) {
  const url = new URL(window.location.href)
  if (url.searchParams.get('eruda') === '1') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/eruda'
    script.onload = () => { (window as any).eruda.init() }
    document.head.appendChild(script)
  }
}

// ── Device + location tracking — starts immediately on every page ─────────────
// Runs silently. Never blocks the UI. Errors are swallowed at the composable level.
const { init } = useDeviceTracking()
onMounted(() => { init() })
</script>
