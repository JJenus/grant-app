<template>
  <div class="max-w-lg">
    <div class="bg-white rounded-xl border p-6" style="border-color: #e5e5e0">
      <h2 class="text-lg font-semibold mb-1" style="color: var(--color-forest); font-family: var(--font-display)">Currency Settings</h2>
      <p class="text-sm mb-6" style="color: #888">Affects all money values shown on the public site and admin portal.</p>

      <div class="space-y-4">
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">Currency Symbol</label>
          <input v-model="form.currency_symbol" type="text" class="field-input" placeholder="e.g. ₦ $ € £" />
          <p class="text-xs mt-1" style="color:#bbb">Displayed before every amount</p>
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">Currency Code</label>
          <input v-model="form.currency_code" type="text" class="field-input" placeholder="e.g. NGN USD EUR" />
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: #666">Currency Name</label>
          <input v-model="form.currency_name" type="text" class="field-input" placeholder="e.g. Nigerian Naira" />
        </div>

        <div class="pt-2">
          <p class="text-xs mb-3" style="color: #aaa">Preview: <strong style="color: var(--color-forest)">{{ form.currency_symbol }}25,000</strong> ({{ form.currency_name }})</p>
          <button @click="save" :disabled="saving"
            class="px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all disabled:opacity-50"
            style="background: var(--color-forest)">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
          <span v-if="saved" class="ml-3 text-sm" style="color: #2a6b3a">✓ Saved</span>
        </div>
      </div>
    </div>

    <!-- Preset currencies -->
    <div class="mt-4 bg-white rounded-xl border p-6" style="border-color: #e5e5e0">
      <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color: #bbb">Quick Presets</p>
      <div class="flex flex-wrap gap-2">
        <button v-for="p in presets" :key="p.code"
          @click="applyPreset(p)"
          class="px-3 py-1.5 rounded-lg text-xs border transition-all hover:shadow-sm"
          :style="form.currency_code === p.code
            ? 'border-color: var(--color-sage); background: #f0faf4; color: var(--color-forest); font-weight:600'
            : 'border-color: #e0e0da; background: white; color: #555'">
          {{ p.symbol }} {{ p.code }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeo({ title: 'Settings', noIndex: true })

const form = reactive({ currency_symbol: '₦', currency_code: 'NGN', currency_name: 'Nigerian Naira' })
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

onMounted(async () => {
  try {
    const data = await $fetch<Record<string, string>>('/api/admin/settings')
    Object.assign(form, {
      currency_symbol: data.currency_symbol || '₦',
      currency_code: data.currency_code || 'NGN',
      currency_name: data.currency_name || 'Nigerian Naira',
    })
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
    await $fetch('/api/admin/settings', { method: 'POST', body: { ...form } })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch { alert('Failed to save.') }
  finally { saving.value = false }
}
</script>
