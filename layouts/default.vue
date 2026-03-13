<template>
  <div class="min-h-screen flex flex-col" style="background: var(--color-cream)">
    <nav class="sticky top-0 z-50 border-b" style="background: var(--color-cream); border-color: var(--color-sand)">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group flex-shrink-0">
          <div class="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-105" style="background: var(--color-forest)">
            <span class="text-white text-xs font-bold">G</span>
          </div>
          <span class="text-lg sm:text-xl" style="font-family: var(--font-display); color: var(--color-forest)">GrantPortal</span>
        </NuxtLink>

        <!-- Desktop nav -->
        <div class="hidden sm:flex items-center gap-6 md:gap-8">
          <NuxtLink to="/" class="text-sm font-medium transition-colors hover:opacity-60" style="color: var(--color-charcoal)">Home</NuxtLink>
          <NuxtLink to="/about" class="text-sm font-medium transition-colors hover:opacity-60" style="color: var(--color-charcoal)">About</NuxtLink>
          <NuxtLink to="/apply" class="text-sm font-medium px-5 py-2.5 rounded-full text-white transition-all hover:opacity-90 hover:shadow-lg" style="background: var(--color-forest)">
            Apply Now
          </NuxtLink>
        </div>

        <!-- Mobile hamburger -->
        <button @click="menuOpen = !menuOpen" class="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg transition-colors hover:bg-black/5" aria-label="Menu">
          <span class="block w-5 h-0.5 transition-all duration-200 origin-center"
            :style="menuOpen ? 'background:var(--color-forest);transform:translateY(4px) rotate(45deg)' : 'background:var(--color-forest)'" />
          <span class="block w-5 h-0.5 transition-all duration-200"
            :style="menuOpen ? 'background:var(--color-forest);opacity:0' : 'background:var(--color-forest)'" />
          <span class="block w-5 h-0.5 transition-all duration-200 origin-center"
            :style="menuOpen ? 'background:var(--color-forest);transform:translateY(-4px) rotate(-45deg)' : 'background:var(--color-forest)'" />
        </button>
      </div>

      <!-- Mobile menu -->
      <div v-show="menuOpen" class="sm:hidden border-t px-4 py-4 flex flex-col gap-1" style="background: var(--color-cream); border-color: var(--color-sand)">
        <NuxtLink to="/" @click="menuOpen = false" class="text-sm font-medium px-3 py-3 rounded-xl transition-colors hover:bg-black/5" style="color: var(--color-charcoal)">Home</NuxtLink>
        <NuxtLink to="/about" @click="menuOpen = false" class="text-sm font-medium px-3 py-3 rounded-xl transition-colors hover:bg-black/5" style="color: var(--color-charcoal)">About</NuxtLink>
        <NuxtLink to="/apply" @click="menuOpen = false" class="text-sm font-semibold px-3 py-3 rounded-xl text-white mt-1 text-center" style="background: var(--color-forest)">
          Apply Now
        </NuxtLink>
      </div>
    </nav>

    <main class="flex-1">
      <slot />
    </main>

    <footer style="background: var(--color-forest)" class="mt-24">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div>
          <p class="text-2xl text-white mb-3" style="font-family: var(--font-display)">GrantPortal</p>
          <p class="text-sm leading-relaxed" style="color: var(--color-mint)">Supporting communities through meaningful funding for impactful projects.</p>
        </div>
        <div>
          <p class="text-sm font-semibold mb-4" style="color: var(--color-sand)">Quick Links</p>
          <div class="flex flex-col gap-2">
            <NuxtLink to="/" class="text-sm hover:text-white transition-colors" style="color: var(--color-mint)">Home</NuxtLink>
            <NuxtLink to="/about" class="text-sm hover:text-white transition-colors" style="color: var(--color-mint)">About the Grant</NuxtLink>
            <NuxtLink to="/apply" class="text-sm hover:text-white transition-colors" style="color: var(--color-mint)">Apply Now</NuxtLink>
          </div>
        </div>
        <div>
          <p class="text-sm font-semibold mb-4" style="color: var(--color-sand)">Contact</p>
          <p class="text-sm" style="color: var(--color-mint)">grants@grantsportalngn.com</p>
          <p class="text-sm mt-1" style="color: var(--color-mint)">(234) 916-878-653</p>
        </div>
      </div>
      <div class="border-t" style="border-color: rgba(255,255,255,0.08)">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p class="text-xs" style="color: rgba(168,213,181,0.5)">
            Disclaimer: we collect user data.
          </p>
        </div>
      </div>
      <div class="border-t" style="border-color: rgba(255,255,255,0.08)">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <p class="text-xs" style="color: rgba(168,213,181,0.5)">© {{ new Date().getFullYear() }} GrantPortal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const menuOpen = ref(false)
const route = useRoute()
watch(() => route.path, () => { menuOpen.value = false })
</script>

