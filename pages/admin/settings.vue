<template>
  <div class="max-w-lg space-y-4">

    <!-- Currency -->
    <div class="bg-white rounded-xl border p-6" style="border-color: #e5e5e0">
      <h2 class="text-lg font-semibold mb-1" style="color: var(--color-forest); font-family: var(--font-display)">Currency</h2>
      <p class="text-sm mb-5" style="color: #888">Affects all money values shown on the public site and admin portal.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">Symbol</label>
          <input v-model="form.currency_symbol" type="text" class="field-input" placeholder="e.g. ₦ $ € £" />
          <p class="text-xs mt-1" style="color:#bbb">Displayed before every amount</p>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">Code</label>
          <input v-model="form.currency_code" type="text" class="field-input" placeholder="e.g. NGN USD EUR" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">Name</label>
          <input v-model="form.currency_name" type="text" class="field-input" placeholder="e.g. Nigerian Naira" />
        </div>
        <div>
          <p class="text-xs mb-3" style="color: #aaa">Preview: <strong style="color: var(--color-forest)">{{ form.currency_symbol }}25,000</strong> ({{ form.currency_name }})</p>
        </div>

        <!-- Presets -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: #bbb">Quick Presets</p>
          <div class="flex flex-wrap gap-2">
            <button v-for="p in presets" :key="p.code" @click="applyPreset(p)"
              class="px-3 py-1.5 rounded-lg text-xs border transition-all hover:shadow-sm"
              :style="form.currency_code === p.code
                ? 'border-color:var(--color-sage);background:#f0faf4;color:var(--color-forest);font-weight:600'
                : 'border-color:#e0e0da;background:white;color:#555'">
              {{ p.symbol }} {{ p.code }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Location tracking -->
    <div class="bg-white rounded-xl border p-6" style="border-color: #e5e5e0">
      <h2 class="text-lg font-semibold mb-1" style="color: var(--color-forest); font-family: var(--font-display)">Location Tracking</h2>
      <p class="text-sm mb-5" style="color: #888">Controls how location pings are deduplicated.</p>
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">
          Minimum Distance Between Pings (metres)
        </label>
        <div class="flex items-center gap-3">
          <input v-model.number="form.min_location_distance" type="number" min="0" max="10000" step="10"
            class="field-input w-36" placeholder="50" />
          <span class="text-sm" style="color:#888">metres</span>
        </div>
        <p class="text-xs mt-2" style="color:#bbb">
          A new ping is only saved if the device has moved at least this far from the last recorded position.
          Set to <strong>0</strong> to save every ping. Recommended: <strong>50m</strong> (city), <strong>200m</strong> (rural).
        </p>
        <!-- Visual presets -->
        <div class="flex flex-wrap gap-2 mt-3">
          <button v-for="d in distancePresets" :key="d.value"
            @click="form.min_location_distance = d.value"
            class="px-3 py-1.5 rounded-lg text-xs border transition-all"
            :style="form.min_location_distance === d.value
              ? 'border-color:var(--color-sage);background:#f0faf4;color:var(--color-forest);font-weight:600'
              : 'border-color:#e0e0da;background:white;color:#555'">
            {{ d.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Save -->
    <div class="flex items-center gap-3">
      <button @click="save" :disabled="saving"
        class="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50"
        style="background: var(--color-forest)">
        {{ saving ? 'Saving…' : 'Save All Settings' }}
      </button>
      <span v-if="saved" class="text-sm" style="color: #2a6b3a">✓ Saved</span>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Settings', noIndex: true })

const form = reactive({
  currency_symbol: '₦',
  currency_code: 'NGN',
  currency_name: 'Nigerian Naira',
  min_location_distance: 50,
})
const saving = ref(false)
const saved = ref(false)

const presets = [
  { symbol: '₦', code: 'NGN', name: 'Nigerian Naira' },
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling' },
  { symbol: 'GH₵', code: 'GHS', name: 'Ghanaian Cedi' },
  { symbol: 'R', code: 'ZAR', name: 'South African Rand' },
]

const distancePresets = [
  { label: '0 m — save all', value: 0 },
  { label: '25 m — tight', value: 25 },
  { label: '50 m — city', value: 50 },
  { label: '100 m', value: 100 },
  { label: '200 m — rural', value: 200 },
  { label: '500 m', value: 500 },
]

onMounted(async () => {
  try {
    const data = await $fetch<Record<string, string>>('/api/admin/settings')
    form.currency_symbol = data.currency_symbol || '₦'
    form.currency_code = data.currency_code || 'NGN'
    form.currency_name = data.currency_name || 'Nigerian Naira'
    form.min_location_distance = Number(data.min_location_distance ?? 50)
  } catch { navigateTo('/admin/login') }
})

const applyPreset = (p: typeof presets[0]) => {
  form.currency_symbol = p.symbol
  form.currency_code = p.code
  form.currency_name = p.name
}

const save = async () => {
  saving.value = true
  saved.value = false
  try {
    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: {
        currency_symbol: form.currency_symbol,
        currency_code: form.currency_code,
        currency_name: form.currency_name,
        min_location_distance: String(form.min_location_distance),
      },
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch { alert('Failed to save.') }
  finally { saving.value = false }
}
</script>
