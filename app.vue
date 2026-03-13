<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <!-- Location required modal — blocks entire UI until permission granted -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="locationBlocked"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.75); backdrop-filter: blur(4px)">

        <div class="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
          style="background: var(--color-cream)">

          <!-- Header -->
          <div class="px-6 pt-8 pb-5 text-center" style="background: var(--color-forest)">
            <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style="background: rgba(255,255,255,0.12)">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h2 class="text-xl text-white mb-1" style="font-family: var(--font-display)">
              Location Access Required
            </h2>
            <p class="text-sm" style="color: var(--color-mint)">
              GrantPortal
            </p>
          </div>

          <!-- Body -->
          <div class="px-6 py-6">
            <p class="text-sm leading-relaxed mb-4 text-center" style="color: #444">
              Location data is required to ensure fair geographic distribution of grants and prevent duplicate applications.
            </p>

            <div class="rounded-xl p-4 mb-5 text-xs leading-relaxed space-y-1"
              style="background: #fff8e6; border: 1px solid #f0d580; color: #7a5c00">
              <p class="font-semibold mb-1.5">📍 How to allow location access:</p>
              <p><strong>Chrome/Edge:</strong> Tap the lock icon in the address bar → Site settings → Location → Allow</p>
              <p><strong>Firefox:</strong> Tap the shield icon → Permissions → Access your location → Allow</p>
              <p><strong>Safari (iOS):</strong> Settings → Safari → Location → Allow</p>
            </div>

            <button
              @click="retry"
              :disabled="retrying"
              class="w-full py-3.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-60"
              style="background: var(--color-forest)">
              <span v-if="retrying" class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Requesting permission…
              </span>
              <span v-else>Allow Location &amp; Continue →</span>
            </button>

            <p class="text-xs text-center mt-4" style="color: #bbb">
              Your exact location is never shared publicly. It is used only for grant eligibility verification.
            </p>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
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

// ── Device + location tracking ────────────────────────────────────────────────
const { init, retryLocation, locationBlocked } = useDeviceTracking()
const retrying = ref(false)

onMounted(() => { init() })

const retry = async () => {
  retrying.value = true
  retryLocation()
  // Show spinner briefly — the browser prompt may appear immediately or after a tick
  await new Promise(r => setTimeout(r, 1500))
  retrying.value = false
}
</script>

<style>
.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
