<template>
  <div>
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <component
        :is="card.link ? 'NuxtLink' : 'div'"
        v-for="card in statCards" :key="card.label"
        :to="card.link || undefined"
        class="p-4 sm:p-5 rounded-xl border bg-white transition-all"
        :class="card.link ? 'hover:shadow-md hover:-translate-y-0.5' : ''"
        style="border-color: #e5e5e0">
        <p class="text-xs font-semibold uppercase tracking-wide mb-1.5 sm:mb-2 leading-tight" style="color: #bbb">{{ card.label }}</p>
        <p class="text-2xl sm:text-3xl" style="font-family: var(--font-display)" :style="{ color: card.color || 'var(--color-forest)' }">{{ card.value }}</p>
      </component>
    </div>

    <div class="grid sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
      <div class="p-4 sm:p-5 rounded-xl border bg-white" style="border-color: #e5e5e0">
        <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #bbb">By Status</p>
        <div class="space-y-3">
          <div v-for="item in statusBreakdown" :key="item.label" class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: item.color }"></span>
              <span class="text-sm" style="color: #555">{{ item.label }}</span>
            </div>
            <span class="text-sm font-semibold" style="color: var(--color-charcoal)">{{ item.count }}</span>
          </div>
        </div>
      </div>
      <div class="sm:col-span-2 p-4 sm:p-5 rounded-xl border bg-white" style="border-color: #e5e5e0">
        <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #bbb">Quick Actions</p>
        <div class="grid grid-cols-2 gap-3">
          <NuxtLink to="/admin/applications?status=submitted" class="p-3 sm:p-4 rounded-xl border text-center transition-all hover:shadow-sm" style="border-color: #e5e5e0">
            <p class="text-xl sm:text-2xl mb-1">📋</p>
            <p class="text-xs sm:text-sm font-medium" style="color: var(--color-forest)">Review Pending</p>
          </NuxtLink>
          <a href="/api/admin/export" target="_blank" class="p-3 sm:p-4 rounded-xl border text-center transition-all hover:shadow-sm" style="border-color: #e5e5e0">
            <p class="text-xl sm:text-2xl mb-1">📥</p>
            <p class="text-xs sm:text-sm font-medium" style="color: var(--color-forest)">Export CSV</p>
          </a>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border overflow-hidden" style="border-color: #e5e5e0">
      <div class="px-4 sm:px-6 py-4 border-b flex items-center justify-between" style="border-color: #e5e5e0">
        <h2 class="text-base sm:text-lg" style="font-family: var(--font-display); color: var(--color-forest)">Recent Submissions</h2>
        <NuxtLink to="/admin/applications" class="text-sm underline" style="color: var(--color-sage)">View all</NuxtLink>
      </div>
      <div v-if="loading" class="px-6 py-12 text-center text-sm" style="color: #bbb">Loading...</div>
      <div v-else-if="recentApps.length === 0" class="px-6 py-12 text-center text-sm" style="color: #bbb">No submissions yet.</div>
      <div v-else>
        <!-- Mobile card list -->
        <div class="sm:hidden divide-y" style="divide-color: #f5f5f2">
          <div v-for="app in recentApps" :key="app.id" class="px-4 py-3 flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="font-medium text-sm truncate" style="color: var(--color-charcoal)">{{ app.firstName }} {{ app.lastName }}</p>
              <p class="text-xs truncate mt-0.5" style="color: #bbb">{{ app.projectTitle || app.email }}</p>
              <p class="text-xs font-semibold mt-1" style="color: var(--color-forest)">{{ format(app.amountRequested) }}</p>
            </div>
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
              <StatusBadge :status="app.status" />
              <NuxtLink :to="'/admin/applications/' + app.id" class="text-xs px-2.5 py-1 rounded-lg text-white" style="background: var(--color-forest)">View</NuxtLink>
            </div>
          </div>
        </div>
        <!-- Desktop table -->
        <table class="hidden sm:table w-full text-sm">
          <tbody class="divide-y" style="divide-color: #f5f5f2">
            <tr v-for="app in recentApps" :key="app.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <p class="font-medium" style="color: var(--color-charcoal)">{{ app.firstName }} {{ app.lastName }}</p>
                <p class="text-xs mt-0.5" style="color: #bbb">{{ app.email }}</p>
              </td>
              <td class="px-4 py-4 hidden md:table-cell">
                <p class="text-sm" style="color: #555; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">{{ app.projectTitle || '—' }}</p>
              </td>
              <td class="px-4 py-4 text-right">
                <span class="text-sm font-medium" style="color: var(--color-forest)">{{ format(app.amountRequested) }}</span>
              </td>
              <td class="px-4 py-4"><StatusBadge :status="app.status" /></td>
              <td class="px-4 py-4 text-right">
                <NuxtLink :to="'/admin/applications/' + app.id" class="text-xs px-3 py-1.5 rounded-lg text-white inline-block" style="background: var(--color-forest)">Review</NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Dashboard', noIndex: true })

const { format, fetchSettings } = useCurrency()
const loading = ref(true)
const stats = ref<Record<string, number>>({})
const recentApps = ref<any[]>([])

const statCards = computed(() => [
  { label: 'Total Applications', value: stats.value.total ?? '—', link: '/admin/applications' },
  { label: 'Awaiting Review', value: stats.value.submitted ?? '—', color: '#9a6700', link: '/admin/applications?status=submitted' },
  { label: 'Incomplete Drafts', value: stats.value.drafts ?? '—', color: '#555', link: '/admin/drafts' },
  { label: 'Funding Requested', value: format(stats.value.totalRequested, true), link: null },
])

const statusBreakdown = computed(() => [
  { label: 'Submitted', count: stats.value.submitted ?? 0, color: '#d4a017' },
  { label: 'Reviewing', count: stats.value.reviewing ?? 0, color: '#1a56db' },
  { label: 'Approved', count: stats.value.approved ?? 0, color: '#2a6b3a' },
  { label: 'Rejected', count: stats.value.rejected ?? 0, color: '#c0392b' },
])

onMounted(async () => {
  try {
    await fetchSettings()
    const [s, a] = await Promise.all([
      $fetch<Record<string, number>>('/api/admin/stats'),
      $fetch<{ applications: any[] }>('/api/admin/applications', { params: { limit: 6 } })
    ])
    stats.value = s
    recentApps.value = a.applications
  } catch { navigateTo('/admin/login') }
  finally { loading.value = false }
})
</script>

