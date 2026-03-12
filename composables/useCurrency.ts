// Fetches currency settings once and provides a formatter used across all pages
const _settings = ref<{ currency_symbol: string; currency_code: string; currency_name: string } | null>(null)
const _fetched = ref(false)

export function useCurrency() {
  const fetchSettings = async () => {
    if (_fetched.value) return
    try {
      const data = await $fetch<Record<string, string>>('/api/settings')
      _settings.value = {
        currency_symbol: data.currency_symbol || '₦',
        currency_code: data.currency_code || 'NGN',
        currency_name: data.currency_name || 'Nigerian Naira',
      }
    } catch {
      _settings.value = { currency_symbol: '₦', currency_code: 'NGN', currency_name: 'Nigerian Naira' }
    }
    _fetched.value = true
  }

  const symbol = computed(() => _settings.value?.currency_symbol ?? '₦')
  const code = computed(() => _settings.value?.currency_code ?? 'NGN')
  const name = computed(() => _settings.value?.currency_name ?? 'Nigerian Naira')

  const format = (amount: number | null | undefined, compact = false) => {
    if (amount == null) return '—'
    const s = symbol.value
    if (compact && amount >= 1_000_000) return s + (amount / 1_000_000).toFixed(1) + 'M'
    if (compact && amount >= 1_000) return s + Math.round(amount / 1_000) + 'K'
    return s + Number(amount).toLocaleString()
  }

  return { symbol, code, name, format, fetchSettings }
}
