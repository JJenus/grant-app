<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-24" style="background: var(--color-cream)">
    <div class="max-w-md text-center">
      <div class="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-8" style="background: #e6f5ec">
        &#10003;
      </div>
      <h1 class="text-5xl mb-4" style="font-family: var(--font-display); color: var(--color-forest)">Application Submitted!</h1>
      <p class="text-base leading-relaxed mb-2" style="color: #555">
        Thank you! We have received your application and sent a confirmation email.
      </p>
      <p class="text-sm mb-10" style="color: #999">
        Our team will review your submission and reach out within 60 days of the application deadline.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 items-center justify-center">
        <NuxtLink to="/"
          class="inline-block px-8 py-3.5 rounded-full text-white text-sm font-medium transition-all hover:opacity-90"
          style="background: var(--color-forest)">
          Return Home
        </NuxtLink>
        <NuxtLink to="/about"
          class="inline-block px-8 py-3.5 rounded-full text-sm border font-medium transition-all hover:bg-gray-50"
          style="border-color: var(--color-sand); color: var(--color-charcoal)">
          Learn More About Us
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApplicationStore } from '~/stores/application'
useSeo({
  title: 'Application Submitted',
  description: 'Your grant application has been received. We will be in touch within 60 days of the deadline.',
  path: '/apply/success',
  noIndex: true,
})
const store = useApplicationStore()
onMounted(() => {
  setTimeout(() => store.$reset(), 500)
})
</script>
