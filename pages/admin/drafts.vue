<template>
  <div>
    <!-- Search -->
    <div class="flex items-center gap-2 mb-5">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style="color:#bbb" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input v-model="search" type="text" placeholder="Search email, name, project..."
          class="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
          style="border-color: #e0e0da; background: white" @input="debouncedLoad" />
      </div>
    </div>

    <!-- Mobile cards -->
    <div class="sm:hidden space-y-2">
      <div v-if="loading" class="text-center py-10 text-sm" style="color:#bbb">Loading...</div>
      <div v-else-if="drafts.length === 0" class="text-center py-16">
        <p class="text-3xl mb-3">📝</p>
        <p class="text-sm" style="color:#bbb">No incomplete drafts found.</p>
      </div>
      <NuxtLink v-for="d in drafts" :key="d.id" :to="'/admin/applications/' + d.id"
        class="block bg-white rounded-xl border p-4" style="border-color:#e5e5e0">
        <div class="flex items-start justify-between gap-2 mb-1">
          <p class="font-medium text-sm" style="color:var(--color-charcoal)">{{ d.firstName || d.email || 'Anonymous' }} {{ d.lastName }}</p>
          <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style="background:#fff3cd;color:#856404">Draft</span>
        </div>
        <p class="text-xs mb-2 truncate" style="color:#bbb">{{ d.email }}</p>
        <p class="text-sm truncate mb-2" style="color:#555">{{ d.projectTitle || 'No project title yet' }}</p>
        <div class="flex items-center justify-between text-xs" style="color:#bbb">
          <span>{{ completionPct(d) }}% complete</span>
          <span>Last updated {{ timeAgo(d.updatedAt) }}</span>
        </div>
        <div class="mt-2 h-1.5 rounded-full overflow-hidden" style="background:#f0ede6">
          <div class="h-full rounded-full transition-all" :style="{ width: completionPct(d) + '%', background: 'var(--color-sage)' }"></div>
        </div>
      </NuxtLink>
    </div>

    <!-- Desktop table -->
    <div class="hidden sm:block bg-white rounded-xl border overflow-hidden" style="border-color:#e5e5e0">
      <table class="w-full text-sm">
        <thead>
          <tr style="background:#fafaf8; border-bottom: 1px solid #e5e5e0">
            <th class="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide" style="color:#bbb">Applicant</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden md:table-cell" style="color:#bbb">Project</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide hidden lg:table-cell" style="color:#bbb">Progress</th>
            <th class="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style="color:#bbb">Last Active</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="5" class="px-6 py-12 text-center text-sm" style="color:#bbb">Loading...</td></tr>
          <tr v-else-if="drafts.length === 0">
            <td colspan="5" class="px-6 py-16 text-center">
              <p class="text-3xl mb-3">📝</p>
              <p class="text-sm" style="color:#bbb">No incomplete drafts found.</p>
            </td>
          </tr>
          <tr v-for="d in drafts" :key="d.id" class="border-t hover:bg-gray-50 transition-colors" style="border-color:#f5f5f2">
            <td class="px-6 py-4">
              <p class="font-medium" style="color:var(--color-charcoal)">{{ d.firstName || '—' }} {{ d.lastName }}</p>
              <p class="text-xs mt-0.5" style="color:#bbb">{{ d.email }}</p>
            </td>
            <td class="px-4 py-4 hidden md:table-cell">
              <p style="color:#555; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">{{ d.projectTitle || 'Not started' }}</p>
            </td>
            <td class="px-4 py-4 hidden lg:table-cell">
              <div class="flex items-center gap-2">
                <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background:#f0ede6; min-width:80px">
                  <div class="h-full rounded-full" :style="{ width: completionPct(d) + '%', background: 'var(--color-sage)' }"></div>
                </div>
                <span class="text-xs flex-shrink-0" style="color:#888">{{ completionPct(d) }}%</span>
              </div>
            </td>
            <td class="px-4 py-4 text-xs" style="color:#888">{{ timeAgo(d.updatedAt) }}</td>
            <td class="px-4 py-4">
              <NuxtLink :to="'/admin/applications/' + d.id"
                class="text-xs px-3 py-1.5 rounded-lg text-white inline-block hover:opacity-80"
                style="background:var(--color-forest)">View</NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="total > 0" class="px-6 py-4 border-t flex items-center justify-between" style="border-color:#e5e5e0">
        <p class="text-xs" style="color:#bbb">{{ (page-1)*limit+1 }}–{{ Math.min(page*limit, total) }} of {{ total }} drafts</p>
        <div class="flex gap-2">
          <button @click="prevPage" :disabled="page===1" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 hover:bg-gray-50" style="border-color:#e0e0da">Prev</button>
          <button @click="nextPage" :disabled="page*limit>=total" class="px-3 py-1.5 rounded-lg text-xs border disabled:opacity-30 hover:bg-gray-50" style="border-color:#e0e0da">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Incomplete Drafts', noIndex: true })

const drafts = ref<any[]>([])
const total = ref(0)
const loading = ref(true)
const search = ref('')
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
    const data = await $fetch<any>('/api/admin/drafts', {
      params: { search: search.value, page: page.value, limit }
    })
    drafts.value = data.applications
    total.value = data.total
  } catch { navigateTo('/admin/login') }
  finally { loading.value = false }
}

const prevPage = () => { if (page.value > 1) { page.value--; load() } }
const nextPage = () => { if (page.value * limit < total.value) { page.value++; load() } }

// Rough completion based on filled key fields
const completionPct = (d: any) => {
  const fields = [d.email, d.firstName, d.lastName, d.phone, d.orgType,
    d.grantCategory, d.projectTitle, d.description, d.goals, d.amountRequested]
  const filled = fields.filter(f => f && String(f).trim()).length
  return Math.round((filled / fields.length) * 100)
}

const timeAgo = (dateStr: string) => {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

onMounted(() => load())
</script>
