<template>
  <div>
    <!-- Search -->
    <div class="flex items-center gap-2 mb-5">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color:#bbb" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Search IP, browser, OS, email..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
          style="border-color:#e0e0da; background:white" @input="debouncedLoad" />
      </div>
    </div>

    <!-- Desktop table -->
    <div class="bg-white rounded-xl border overflow-hidden" style="border-color:#e5e5e0">
      <table class="w-full text-sm">
        <thead>
          <tr style="background:#fafaf8; border-bottom:1px solid #e5e5e0">
            <th class="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide" style="color:#bbb">Device</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style="color:#bbb">Browser / OS</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell" style="color:#bbb">Linked Applicant</th>
            <th class="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style="color:#bbb">Pings</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style="color:#bbb">Last Seen</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="6" class="px-6 py-12 text-center text-sm" style="color:#bbb">Loading...</td></tr>
          <tr v-else-if="sessions.length === 0">
            <td colspan="6" class="px-6 py-16 text-center">
              <p class="text-3xl mb-3">📡</p>
              <p class="text-sm" style="color:#bbb">No device sessions recorded yet.</p>
            </td>
          </tr>
          <tr v-for="s in sessions" :key="s.id" class="border-t hover:bg-gray-50 transition-colors" style="border-color:#f5f5f2">
            <td class="px-5 py-3">
              <p class="font-mono text-xs font-medium" style="color:var(--color-forest)">{{ s.device_id?.slice(0,8) }}…</p>
              <p class="text-xs mt-0.5" style="color:#bbb">{{ s.ip }}</p>
            </td>
            <td class="px-4 py-3 hidden md:table-cell">
              <p class="text-xs font-medium" style="color:#444">{{ s.browser || '—' }}</p>
              <p class="text-xs" style="color:#bbb">{{ s.os || '—' }}</p>
            </td>
            <td class="px-4 py-3 hidden lg:table-cell">
              <template v-if="s.app_email">
                <p class="text-xs font-medium" style="color:#444">{{ s.app_first_name }} {{ s.app_last_name }}</p>
                <p class="text-xs" style="color:#bbb">{{ s.app_email }}</p>
              </template>
              <span v-else class="text-xs px-2 py-0.5 rounded-full" style="background:#f5f5f2;color:#bbb">Visitor only</span>
            </td>
            <td class="px-4 py-3 text-center hidden sm:table-cell">
              <span class="text-xs font-semibold px-2 py-1 rounded-full" style="background:var(--color-mist);color:var(--color-forest)">
                {{ s.location_count || 0 }}
              </span>
            </td>
            <td class="px-4 py-3 text-xs" style="color:#888">{{ timeAgo(s.updated_at) }}</td>
            <td class="px-4 py-3">
              <button @click="openDevice(s)"
                class="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-gray-50"
                style="border-color:#e0e0da;color:var(--color-forest)">Details</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="total > 0" class="px-6 py-4 border-t flex items-center justify-between" style="border-color:#e5e5e0">
        <p class="text-xs" style="color:#bbb">{{ (page-1)*limit+1 }}–{{ Math.min(page*limit, total) }} of {{ total }} devices</p>
        <div class="flex gap-2">
          <button @click="prevPage" :disabled="page===1" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 hover:bg-gray-50" style="border-color:#e0e0da">Prev</button>
          <button @click="nextPage" :disabled="page*limit>=total" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 hover:bg-gray-50" style="border-color:#e0e0da">Next</button>
        </div>
      </div>
    </div>

    <!-- Device detail drawer -->
    <div v-if="selected" class="fixed inset-0 z-40 flex justify-end" @click.self="selected = null">
      <div class="fixed inset-0 bg-black/30" @click="selected = null"></div>
      <div class="relative z-50 w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col">
        <!-- Drawer header -->
        <div class="flex items-center justify-between px-5 py-4 border-b sticky top-0 bg-white z-10" style="border-color:#e5e5e0">
          <div>
            <p class="font-semibold text-sm" style="color:var(--color-forest)">Device Details</p>
            <p class="font-mono text-xs mt-0.5" style="color:#bbb">{{ selected.device_id }}</p>
          </div>
          <button @click="selected = null" class="p-1.5 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5" style="color:#888" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-5 flex-1">
          <!-- Device info -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color:#bbb">Device Info</p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span style="color:#888">IP</span><span class="font-medium font-mono text-xs" style="color:#444">{{ selected.ip }}</span></div>
              <div class="flex justify-between"><span style="color:#888">Browser</span><span style="color:#444">{{ selected.browser || '—' }}</span></div>
              <div class="flex justify-between"><span style="color:#888">OS</span><span style="color:#444">{{ selected.os || '—' }}</span></div>
              <div class="flex justify-between"><span style="color:#888">Screen</span><span style="color:#444">{{ selected.screen || '—' }}</span></div>
              <div class="flex justify-between"><span style="color:#888">Language</span><span style="color:#444">{{ selected.language || '—' }}</span></div>
              <div class="flex justify-between"><span style="color:#888">Timezone</span><span style="color:#444">{{ selected.timezone || '—' }}</span></div>
              <div class="flex justify-between"><span style="color:#888">First seen</span><span style="color:#444">{{ fmtDate(selected.created_at) }}</span></div>
              <div class="flex justify-between"><span style="color:#888">Last seen</span><span style="color:#444">{{ fmtDate(selected.updated_at) }}</span></div>
            </div>
          </div>

          <!-- Linked applicant -->
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color:#bbb">Linked Application</p>
            <div v-if="selected.app_email" class="p-3 rounded-xl border" style="border-color:#e5e5e0;background:#fafaf8">
              <p class="font-medium text-sm" style="color:var(--color-forest)">{{ selected.app_first_name }} {{ selected.app_last_name }}</p>
              <p class="text-xs mt-0.5 mb-2" style="color:#888">{{ selected.app_email }}</p>
              <p class="text-xs mb-2 truncate" style="color:#555">{{ selected.app_project_title || 'No title' }}</p>
              <NuxtLink v-if="selected.application_id" :to="'/admin/applications/' + selected.application_id"
                class="text-xs px-3 py-1.5 rounded-lg text-white inline-block" style="background:var(--color-forest)"
                @click="selected = null">View Application</NuxtLink>
            </div>
            <p v-else class="text-sm" style="color:#bbb">No application linked — visitor only.</p>
          </div>

          <!-- Location history -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-semibold uppercase tracking-wide" style="color:#bbb">Location History</p>
              <span class="text-xs px-2 py-0.5 rounded-full" style="background:var(--color-mist);color:var(--color-forest)">{{ locations.length }} pings</span>
            </div>
            <div v-if="locLoading" class="text-xs text-center py-4" style="color:#bbb">Loading...</div>
            <div v-else-if="locations.length === 0" class="text-xs py-4 text-center" style="color:#bbb">No location data recorded.</div>
            <div v-else class="space-y-2 max-h-80 overflow-y-auto pr-1">
              <div v-for="loc in locations" :key="loc.id"
                class="flex items-start justify-between gap-2 p-3 rounded-xl border text-xs"
                style="border-color:#f0ede6;background:#fafaf8">
                <div>
                  <p class="font-medium font-mono" style="color:#444">{{ Number(loc.latitude).toFixed(5) }}, {{ Number(loc.longitude).toFixed(5) }}</p>
                  <p class="mt-0.5" style="color:#bbb">± {{ loc.accuracy ? Math.round(loc.accuracy) + 'm' : '—' }} · {{ loc.ip }}</p>
                  <p class="mt-0.5" style="color:#bbb">{{ fmtDate(loc.recorded_at) }}</p>
                </div>
                <a :href="`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`" target="_blank"
                  class="flex-shrink-0 px-2 py-1 rounded-lg border transition-all hover:bg-white"
                  style="border-color:#e0e0da;color:var(--color-sage)">Map</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Device Tracking', noIndex: true })

const sessions = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const search = ref('')
const page = ref(1)
const limit = 25
const selected = ref<any>(null)
const locations = ref<any[]>([])
const locLoading = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedLoad = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 300)
}

const load = async () => {
  loading.value = true
  try {
    const data = await $fetch<any>('/api/admin/devices', {
      params: { search: search.value, page: page.value, limit }
    })
    sessions.value = data.sessions
    total.value = data.total
  } catch { navigateTo('/admin/login') }
  finally { loading.value = false }
}

const openDevice = async (s: any) => {
  selected.value = s
  locations.value = []
  locLoading.value = true
  try {
    const data = await $fetch<any>('/api/admin/devices/' + s.device_id)
    locations.value = data.locations || []
  } catch { /* silent */ }
  finally { locLoading.value = false }
}

const prevPage = () => { if (page.value > 1) { page.value--; load() } }
const nextPage = () => { if (page.value * limit < total.value) { page.value++; load() } }

const timeAgo = (d: string) => {
  if (!d) return '—'
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const fmtDate = (d: string) => d ? new Date(d).toLocaleString() : '—'

onMounted(() => load())
</script>
