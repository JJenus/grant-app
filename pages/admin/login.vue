<template>
  <div class="min-h-screen flex items-center justify-center" style="background: var(--color-forest)">
    <div class="w-full max-w-sm px-6">
      <div class="text-center mb-8">
        <div class="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span class="font-bold text-xl" style="color: var(--color-forest)">G</span>
        </div>
        <h1 class="text-3xl text-white" style="font-family: var(--font-display)">Admin Access</h1>
        <p class="text-sm mt-1" style="color: var(--color-mint)">GrantPortal Dashboard</p>
      </div>

      <div class="rounded-2xl p-6 border" style="background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1)">
        <div class="mb-4">
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: var(--color-mint)">Email Address</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
            class="admin-input"
            @keydown.enter="login"
            :disabled="loading"
          />
        </div>
        <div class="mb-6">
          <label class="block text-xs font-semibold uppercase tracking-wide mb-1.5" style="color: var(--color-mint)">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="admin-input"
            @keydown.enter="login"
            :disabled="loading"
          />
        </div>

        <div v-if="error" class="text-sm mb-4 text-center px-3 py-2 rounded-lg" style="background: rgba(255,100,100,0.15); color: #ff9999">
          {{ error }}
        </div>

        <button
          @click="login"
          :disabled="loading || !form.email || !form.password"
          class="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style="background: var(--color-gold); color: var(--color-forest)"
        >
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </div>

      <p class="text-center mt-6 text-xs" style="color: rgba(168,213,181,0.4)">
        <NuxtLink to="/" class="hover:opacity-70 transition-opacity">← Back to public site</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useSeo({ title: 'Admin Login', noIndex: true })

const router = useRouter()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

const login = async () => {
  if (!form.email || !form.password) return
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: form })
    router.push('/admin/dashboard')
  } catch {
    error.value = 'Invalid email or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255,255,255,0.15);
  background: rgba(255,255,255,0.08);
  color: white;
  font-size: 0.875rem;
  font-family: var(--font-body);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}
.admin-input:focus {
  border-color: rgba(168,213,181,0.5);
  background: rgba(255,255,255,0.12);
}
.admin-input::placeholder { color: rgba(255,255,255,0.25); }
.admin-input:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
