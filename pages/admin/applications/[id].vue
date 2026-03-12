<template>
  <div v-if="app">
    <div class="flex items-center gap-2 mb-4 sm:mb-6 flex-wrap">
      <NuxtLink to="/admin/applications" class="text-sm transition-opacity hover:opacity-60" style="color: var(--color-sage)">← Applications</NuxtLink>
      <span style="color: #ddd">/</span>
      <span class="text-sm truncate" style="color: #999">{{ app.firstName }} {{ app.lastName }}</span>
    </div>

    <!-- Header card -->
    <div class="bg-white rounded-xl border p-4 sm:p-6 mb-4 sm:mb-5" style="border-color: #e5e5e0">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="min-w-0">
          <h2 class="text-xl sm:text-2xl mb-1 leading-tight" style="font-family: var(--font-display); color: var(--color-forest)">{{ app.projectTitle || 'Untitled Project' }}</h2>
          <p class="text-sm" style="color: #888">{{ app.firstName }} {{ app.lastName }} · {{ app.email }}</p>
          <p class="text-xs mt-1" style="color: #bbb">Submitted {{ app.submittedAt ? new Date(app.submittedAt).toLocaleString() : '—' }}</p>
        </div>
        <div class="text-left sm:text-right flex-shrink-0">
          <p class="text-2xl sm:text-3xl" style="font-family: var(--font-display); color: var(--color-forest)">{{ format(app.amountRequested) }}</p>
          <p class="text-xs mt-1" style="color: #bbb">requested</p>
        </div>
      </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-4 sm:gap-5">
      <!-- Detail sections -->
      <div class="lg:col-span-2 space-y-4">
        <DetailSection title="Contact Information">
          <DetailRow label="Name" :value="app.firstName + ' ' + app.lastName" />
          <DetailRow label="Email" :value="app.email" />
          <DetailRow label="Phone" :value="app.phone || undefined" />
        </DetailSection>
        <DetailSection title="Organization">
          <DetailRow label="Type" :value="app.orgType" />
          <DetailRow label="Name" :value="app.orgName || undefined" />
          <DetailRow label="Website" :value="app.website || undefined" />
          <DetailRow label="EIN" :value="app.ein || undefined" />
        </DetailSection>
        <DetailSection title="Project">
          <DetailRow label="Category" :value="app.grantCategory" />
          <DetailRow label="Title" :value="app.projectTitle" />
          <div class="mt-2">
            <p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: #bbb">Description</p>
            <p class="text-sm leading-relaxed" style="color: var(--color-charcoal); white-space: pre-wrap">{{ app.description }}</p>
          </div>
          <div class="mt-3">
            <p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: #bbb">Goals &amp; Outcomes</p>
            <p class="text-sm leading-relaxed" style="color: var(--color-charcoal); white-space: pre-wrap">{{ app.goals }}</p>
          </div>
        </DetailSection>
        <DetailSection title="Budget">
          <DetailRow label="Requested" :value="format(app.amountRequested)" />
          <div v-if="app.budgetBreakdown && app.budgetBreakdown.length" class="mt-3">
            <p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: #bbb">Breakdown</p>
            <div class="space-y-1.5">
              <div v-for="item in app.budgetBreakdown" :key="item.description" class="flex justify-between text-sm p-2 rounded" style="background: var(--color-mist)">
                <span style="color: #555">{{ item.description }}</span>
                <span class="font-medium" style="color: var(--color-forest)">{{ format(item.amount) }}</span>
              </div>
            </div>
          </div>
          <DetailRow v-if="app.otherFunding" label="Other Funding" :value="app.otherFunding" />
        </DetailSection>
        <DetailSection v-if="app.latitude" title="Geolocation">
          <DetailRow label="Latitude" :value="String(app.latitude)" />
          <DetailRow label="Longitude" :value="String(app.longitude)" />
          <div class="mt-2">
            <a :href="'https://maps.google.com/?q=' + app.latitude + ',' + app.longitude" target="_blank"
              class="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all hover:bg-gray-50"
              style="border-color: #e0e0da; color: var(--color-sage)">Open in Google Maps</a>
          </div>
        </DetailSection>
      </div>

      <!-- Review sidebar -->
      <div class="space-y-4">
        <div class="bg-white rounded-xl border p-4 sm:p-5" style="border-color: #e5e5e0">
          <p class="text-xs font-semibold uppercase tracking-wide mb-4" style="color: #bbb">Review Actions</p>
          <p class="text-xs font-medium mb-1.5" style="color: #666">Status</p>
          <select v-model="newStatus" class="w-full px-3 py-2.5 rounded-xl border text-sm mb-4 outline-none" style="border-color: #e0e0da; background: white">
            <option value="submitted">Submitted</option>
            <option value="reviewing">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <p class="text-xs font-medium mb-1.5" style="color: #666">Internal Notes</p>
          <textarea v-model="adminNotes" rows="5" placeholder="Notes visible only to admins..."
            class="w-full px-3 py-2 rounded-xl border text-sm outline-none mb-4"
            style="border-color: #e0e0da; background: #fafaf8; font-family: var(--font-body); resize: vertical"></textarea>
          <button @click="save" :disabled="saving"
            class="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 hover:opacity-90"
            style="background: var(--color-forest)">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <div v-if="savedMsg" class="text-xs text-center mt-3 py-2 rounded-lg" style="background: #e6f5ec; color: #2a6b3a">✓ Changes saved</div>
        </div>
        <div class="bg-white rounded-xl border p-4 sm:p-5" style="border-color: #e5e5e0">
          <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #bbb">Current Status</p>
          <StatusBadge :status="app.status" />
          <p class="text-xs mt-3" style="color: #bbb">Created {{ new Date(app.createdAt).toLocaleDateString() }}</p>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="notFound" class="text-center py-20">
    <p class="text-lg mb-4" style="color: #bbb">Application not found.</p>
    <NuxtLink to="/admin/applications" class="text-sm underline" style="color: var(--color-sage)">Back to list</NuxtLink>
  </div>
  <div v-else class="text-center py-20 text-sm" style="color: #bbb">Loading...</div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Application Detail', noIndex: true })

const { format, fetchSettings } = useCurrency()
const route = useRoute()
const app = ref<any>(null)
const notFound = ref(false)
const newStatus = ref('')
const adminNotes = ref('')
const saving = ref(false)
const savedMsg = ref(false)

onMounted(async () => {
  await fetchSettings()
  try {
    const data = await $fetch<any>('/api/admin/applications/' + route.params.id)
    app.value = data
    newStatus.value = data.status
    adminNotes.value = data.adminNotes || ''
  } catch (e: any) {
    if (e?.statusCode === 404) notFound.value = true
    else navigateTo('/admin/login')
  }
})

const save = async () => {
  saving.value = true
  savedMsg.value = false
  try {
    await $fetch('/api/admin/applications/' + route.params.id, {
      method: 'PATCH',
      body: { status: newStatus.value, adminNotes: adminNotes.value }
    })
    app.value.status = newStatus.value
    app.value.adminNotes = adminNotes.value
    savedMsg.value = true
    setTimeout(() => { savedMsg.value = false }, 3000)
  } catch { alert('Failed to save. Please try again.') }
  finally { saving.value = false }
}
</script>
