<template>
  <div class="min-h-screen flex" style="background: #f4f4f0">

    <!-- Mobile overlay -->
    <div v-show="sidebarOpen" @click="sidebarOpen = false"
      class="fixed inset-0 z-20 lg:hidden"
      style="background: rgba(0,0,0,0.4)" />

    <!-- Sidebar -->
    <aside
      class="fixed lg:static inset-y-0 left-0 z-30 w-64 lg:w-56 min-h-screen flex flex-col border-r flex-shrink-0 transition-transform duration-300 lg:translate-x-0"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      style="background: var(--color-forest); border-color: rgba(255,255,255,0.08)">

      <!-- Logo -->
      <div class="px-5 py-4 border-b flex items-center justify-between" style="border-color: rgba(255,255,255,0.1)">
        <NuxtLink to="/" class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-full flex items-center justify-center bg-white flex-shrink-0">
            <span class="text-xs font-bold" style="color: var(--color-forest)">G</span>
          </div>
          <span class="text-lg text-white" style="font-family: var(--font-display)">GrantPortal</span>
        </NuxtLink>
        <!-- Close button (mobile only) -->
        <button @click="sidebarOpen = false" class="lg:hidden text-white opacity-60 hover:opacity-100 p-1">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
      <p class="px-5 pb-3 text-xs" style="color: var(--color-mint)">Admin Dashboard</p>

      <!-- Nav links -->
      <nav class="flex-1 px-3 py-2 flex flex-col gap-0.5">
        <NuxtLink to="/admin/dashboard" @click="sidebarOpen = false" class="nav-link" :class="{ active: route.path === '/admin/dashboard' }">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          Dashboard
        </NuxtLink>
        <NuxtLink to="/admin/applications" @click="sidebarOpen = false" class="nav-link" :class="{ active: route.path.startsWith('/admin/applications') }">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          Applications
        </NuxtLink>
        <NuxtLink to="/admin/settings" @click="sidebarOpen = false" class="nav-link" :class="{ active: route.path === '/admin/settings' }">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Settings
        </NuxtLink>
      </nav>

      <div class="px-3 py-4 border-t" style="border-color: rgba(255,255,255,0.1)">
        <button @click="logout" class="nav-link w-full text-left">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3" style="border-color: #e5e5e0">
        <!-- Hamburger (mobile) -->
        <button @click="sidebarOpen = true" class="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
          <svg class="w-5 h-5" style="color: var(--color-forest)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <h1 class="flex-1 text-base sm:text-xl truncate" style="font-family: var(--font-display); color: var(--color-forest)">{{ pageTitle }}</h1>
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background: var(--color-sage)">A</div>
          <span class="text-sm hidden sm:block" style="color: #666">Admin</span>
        </div>
      </header>

      <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const sidebarOpen = ref(false)

const pageTitle = computed(() => {
  if (route.path === '/admin/settings') return 'Settings'
  if (route.path.includes('/applications/') && route.params.id) return 'Application Detail'
  if (route.path.includes('/applications')) return 'All Applications'
  return 'Dashboard'
})

// Close sidebar on route change
watch(() => route.path, () => { sidebarOpen.value = false })

const logout = async () => {
  await $fetch('/api/admin/logout', { method: 'POST' }).catch(() => {})
  router.push('/admin/login')
}
</script>

<style scoped>
.nav-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: rgba(168, 213, 181, 0.85);
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  border: none;
  background: transparent;
  font-family: var(--font-body);
  width: 100%;
  text-decoration: none;
}
.nav-link:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-link.active { background: rgba(255,255,255,0.15); color: white; }
</style>
