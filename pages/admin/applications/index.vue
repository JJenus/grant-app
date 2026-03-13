<template>
  <div>
    <!-- Filters -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color:#bbb" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Search name, email, project..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
          style="border-color: #e0e0da; background: white" @input="debouncedLoad" />
      </div>
      <div class="flex gap-2">
        <select v-model="statusFilter" @change="load" class="flex-1 sm:flex-none px-3 py-2.5 rounded-xl border text-sm outline-none" style="border-color: #e0e0da; background: white">
          <option value="all">All Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="reviewing">Reviewing</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <a href="/api/admin/export" target="_blank"
          class="px-3 sm:px-4 py-2.5 rounded-xl text-sm font-medium border transition-all hover:bg-gray-50 flex items-center gap-1.5 flex-shrink-0"
          style="border-color: #e0e0da; background: white; color: var(--color-charcoal)">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          <span class="hidden sm:inline">Export CSV</span>
        </a>
      </div>
    </div>

    <!-- Mobile card list -->
    <div class="sm:hidden space-y-2 mb-4">
      <div v-if="loading" class="text-center py-10 text-sm" style="color: #bbb">Loading...</div>
      <div v-else-if="apps.length === 0" class="text-center py-10 text-sm" style="color: #bbb">No applications found.</div>
      <NuxtLink v-for="app in apps" :key="app.id" :to="'/admin/applications/' + app.id"
        class="block bg-white rounded-xl border p-4 transition-all hover:shadow-sm"
        style="border-color: #e5e5e0">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="min-w-0">
            <p class="font-medium text-sm" style="color: var(--color-charcoal)">{{ app.firstName }} {{ app.lastName }}</p>
            <p class="text-xs mt-0.5 truncate" style="color: #bbb">{{ app.email }}</p>
          </div>
          <StatusBadge :status="app.status" />
        </div>
        <p class="text-sm truncate mb-2" style="color: #555">{{ app.projectTitle || '—' }}</p>
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold" style="color: var(--color-forest)">{{ format(app.amountRequested) }}</span>
          <span class="text-xs capitalize px-2 py-1 rounded-full" style="background: var(--color-mist); color: var(--color-forest)">{{ app.grantCategory || '—' }}</span>
        </div>
      </NuxtLink>
    </div>

    <!-- Desktop table -->
    <div class="hidden sm:block bg-white rounded-xl border overflow-hidden" style="border-color: #e5e5e0">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b" style="background: #fafaf8; border-color: #e5e5e0">
            <th class="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style="color: #bbb">Applicant</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style="color: #bbb">Project</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell" style="color: #bbb">Category</th>
            <th class="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style="color: #bbb">Amount</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style="color: #bbb">Status</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell" style="color: #bbb">Submitted</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="px-6 py-12 text-center text-sm" style="color: #bbb">Loading...</td></tr>
          <tr v-else-if="apps.length === 0"><td colspan="7" class="px-6 py-12 text-center text-sm" style="color: #bbb">No applications found.</td></tr>
          <tr v-for="app in apps" :key="app.id" class="border-t hover:bg-gray-50 transition-colors" style="border-color: #f5f5f2">
            <td class="px-6 py-4">
              <p class="font-medium" style="color: var(--color-charcoal)">{{ app.firstName }} {{ app.lastName }}</p>
              <p class="text-xs mt-0.5" style="color: #bbb">{{ app.email }}</p>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <p style="color: #555; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">{{ app.projectTitle || '—' }}</p>
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <span class="text-xs px-2 py-1 rounded-full capitalize" style="background: var(--color-mist); color: var(--color-forest)">{{ app.grantCategory || '—' }}</span>
            </td>
            <td class="px-4 py-4 text-right">
              <span class="font-medium" style="color: var(--color-forest)">{{ format(app.amountRequested) }}</span>
            </td>
            <td class="px-4 py-4"><StatusBadge :status="app.status" /></td>
            <td class="px-4 py-4 text-xs hidden lg:table-cell" style="color: #bbb">
              {{ app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—' }}
            </td>
            <td class="px-4 py-4">
              <NuxtLink :to="'/admin/applications/' + app.id"
                class="text-xs px-3 py-1.5 rounded-lg text-white inline-block hover:opacity-80"
                style="background: var(--color-forest)">Review</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="total > 0" class="px-6 py-4 border-t flex items-center justify-between" style="border-color: #e5e5e0">
        <p class="text-xs" style="color: #bbb">Showing {{ (page - 1) * limit + 1 }}–{{ Math.min(page * limit, total) }} of {{ total }}</p>
        <div class="flex gap-2">
          <button @click="prevPage" :disabled="page === 1" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 hover:bg-gray-50" style="border-color: #e0e0da">Prev</button>
          <button @click="nextPage" :disabled="page * limit >= total" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 hover:bg-gray-50" style="border-color: #e0e0da">Next</button>
        </div>
      </div>
    </div>

    <!-- Mobile pagination -->
    <div v-if="total > limit" class="sm:hidden flex items-center justify-between mt-4 px-1">
      <p class="text-xs" style="color: #bbb">{{ (page-1)*limit+1 }}–{{ Math.min(page*limit,total) }} of {{ total }}</p>
      <div class="flex gap-2">
        <button @click="prevPage" :disabled="page===1" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30" style="border-color:#e0e0da;background:white">Prev</button>
        <button @click="nextPage" :disabled="page*limit>=total" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30" style="border-color:#e0e0da;background:white">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Applications', noIndex: true })

const { format, fetchSettings } = useCurrency()
const route = useRoute()
const apps = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const search = ref('')
const statusFilter = ref((route.query.status as string) || 'all')
const page = ref(1)
const limit = 20

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const debouncedLoad = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; load() }, 300)
}

const load = async () => {
  loading.value = true
  try {
    const data = await $fetch<{ applications: any[]; total: number }>('/api/admin/applications', {
      params: { status: statusFilter.value, search: search.value, page: page.value, limit }
    })
    apps.value = data.applications
    total.value = data.total
  } catch { navigateTo('/admin/login') }
  finally { loading.value = false }
}

const prevPage = () => { if (page.value > 1) { page.value--; load() } }
const nextPage = () => { if (page.value * limit < total.value) { page.value++; load() } }

onMounted(async () => { await fetchSettings(); load() })
</script>

