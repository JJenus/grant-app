<template>
  <div class="min-h-[70vh] flex items-center justify-center px-6 py-24">
    <div class="max-w-md w-full text-center">

      <!-- Big 404 -->
      <p class="text-8xl sm:text-9xl font-bold mb-2 leading-none select-none"
        style="font-family: var(--font-display); color: var(--color-sand)">404</p>

      <h1 class="text-2xl sm:text-3xl mb-3"
        style="font-family: var(--font-display); color: var(--color-forest)">
        Page not found
      </h1>
      <p class="text-sm leading-relaxed mb-10" style="color: #888">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <NuxtLink to="/"
          class="w-full sm:w-auto px-8 py-3 rounded-full text-white text-sm font-medium transition-all hover:opacity-90"
          style="background: var(--color-forest)">
          Go Home
        </NuxtLink>
        <NuxtLink to="/apply"
          class="w-full sm:w-auto px-8 py-3 rounded-full text-sm font-medium border transition-all hover:bg-black/5"
          style="border-color: var(--color-sand); color: var(--color-charcoal)">
          Apply for a Grant
        </NuxtLink>
      </div>

      <!-- Helpful links -->
      <div class="mt-12 pt-8 border-t" style="border-color: var(--color-sand)">
        <p class="text-xs font-semibold uppercase tracking-wide mb-4" style="color: #bbb">You might be looking for</p>
        <div class="flex flex-wrap justify-center gap-3">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to"
            class="text-sm px-4 py-2 rounded-full border transition-all hover:shadow-sm hover:bg-white"
            style="border-color: var(--color-sand); color: var(--color-forest); background: var(--color-cream)">
            {{ link.label }}
          </NuxtLink>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
useSeo({
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist.',
  noIndex: true,
})

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/apply', label: 'Apply Now' },
  { to: '/admin/login', label: 'Admin Login' },
]
</script>

