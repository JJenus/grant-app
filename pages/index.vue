<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden" style="background: var(--color-forest); min-height: 90vh; display: flex; align-items: center;">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.07]" style="background: var(--color-sage)"></div>
        <div class="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-[0.04]" style="background: var(--color-mint)"></div>
        <div class="absolute top-1/3 right-1/3 w-px h-48 opacity-20" style="background: var(--color-gold)"></div>
        <div class="absolute top-1/2 left-1/4 w-px h-32 opacity-10" style="background: var(--color-mint)"></div>
      </div>

      <div class="relative max-w-6xl mx-auto px-6 py-32 w-full">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 border" style="border-color: var(--color-gold); color: var(--color-gold);">
              <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background: var(--color-gold)"></span>
              Applications Open — Cycle 2026
            </div>
            <h1 class="text-6xl md:text-7xl leading-none text-white mb-6" style="font-family: var(--font-display)">
              Funding<br /><em style="color: var(--color-mint)">Ideas</em><br />That Matter
            </h1>
            <p class="text-lg leading-relaxed mb-10 max-w-md" style="color: var(--color-mint)">
              We invest in nonprofits, individuals, and organizations whose work creates lasting change in their communities.
            </p>
            <div class="flex items-center gap-4 flex-wrap">
              <NuxtLink to="/apply"
                class="px-8 py-4 rounded-full font-medium text-sm transition-all hover:shadow-2xl hover:-translate-y-0.5 inline-block"
                style="background: var(--color-gold); color: var(--color-forest)">
                Start Your Application →
              </NuxtLink>
              <NuxtLink to="/about"
                class="px-8 py-4 rounded-full font-medium text-sm border transition-all hover:bg-white/10 inline-block"
                style="border-color: rgba(255,255,255,0.25); color: white">
                Learn More
              </NuxtLink>
            </div>
          </div>

          <div class="rounded-2xl p-6 border" style="background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1)">
            <p class="text-xs font-medium mb-6 uppercase tracking-widest" style="color: var(--color-mint)">Program at a Glance</p>
            <div class="space-y-0">
              <div v-for="(stat, i) in heroStats" :key="stat.label" class="py-5" :class="{ 'border-b': i < heroStats.length - 1 }" style="border-color: rgba(255,255,255,0.08)">
                <p class="text-4xl text-white mb-1" style="font-family: var(--font-display)">{{ stat.value }}</p>
                <p class="text-sm" style="color: var(--color-mint)">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What we fund -->
    <section class="max-w-6xl mx-auto px-6 py-24">
      <div class="grid md:grid-cols-2 gap-12 items-end mb-16">
        <div>
          <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">Focus Areas</p>
          <h2 class="text-5xl leading-tight" style="font-family: var(--font-display); color: var(--color-forest)">What We Fund</h2>
        </div>
        <p class="text-base leading-relaxed" style="color: #555">We support projects across a range of categories that address community needs, promote equity, and build long-term resilience.</p>
      </div>
      <div class="grid md:grid-cols-3 gap-5">
        <div v-for="cat in categories" :key="cat.title"
          class="p-6 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-1 cursor-default"
          style="border-color: var(--color-sand); background: white">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4" style="background: var(--color-mist)">{{ cat.icon }}</div>
          <h3 class="text-xl mb-2" style="font-family: var(--font-display); color: var(--color-forest)">{{ cat.title }}</h3>
          <p class="text-sm leading-relaxed" style="color: #666">{{ cat.description }}</p>
        </div>
      </div>
    </section>

    <!-- Eligibility -->
    <section style="background: var(--color-mist)" class="py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="max-w-xl mb-12">
          <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">Requirements</p>
          <h2 class="text-5xl leading-tight" style="font-family: var(--font-display); color: var(--color-forest)">Who Can Apply?</h2>
        </div>
        <div class="grid md:grid-cols-2 gap-3">
          <div v-for="item in eligibility" :key="item" class="flex items-start gap-3 p-4 rounded-xl bg-white border" style="border-color: var(--color-sand)">
            <span class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style="background: var(--color-sage)">✓</span>
            <span class="text-sm" style="color: var(--color-charcoal)">{{ item }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="max-w-6xl mx-auto px-6 py-24">
      <div class="max-w-xl mb-12">
        <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">Process</p>
        <h2 class="text-5xl leading-tight" style="font-family: var(--font-display); color: var(--color-forest)">Key Dates</h2>
      </div>
      <div class="relative pl-10">
        <div class="absolute left-4 top-2 bottom-2 w-px" style="background: var(--color-sand)"></div>
        <div class="space-y-10">
          <div v-for="m in timeline" :key="m.date" class="relative">
            <div class="absolute -left-10 w-5 h-5 rounded-full border-2 flex items-center justify-center" style="background: var(--color-cream); border-color: var(--color-sage); top: 2px">
              <div class="w-2 h-2 rounded-full" style="background: var(--color-sage)"></div>
            </div>
            <p class="text-xs font-semibold mb-1" style="color: var(--color-gold)">{{ m.date }}</p>
            <p class="text-xl mb-1" style="font-family: var(--font-display); color: var(--color-forest)">{{ m.title }}</p>
            <p class="text-sm" style="color: #666">{{ m.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-4 md:mx-6 mb-24 rounded-3xl overflow-hidden" style="background: var(--color-forest)">
      <div class="max-w-3xl mx-auto px-8 md:px-16 py-20 text-center">
        <h2 class="text-5xl text-white mb-6" style="font-family: var(--font-display)">Ready to Apply?</h2>
        <p class="text-lg mb-10" style="color: var(--color-mint)">No account needed. Start your application and save your progress with just your email.</p>
        <NuxtLink to="/apply"
          class="inline-block px-10 py-4 rounded-full font-medium text-sm transition-all hover:shadow-2xl hover:-translate-y-1"
          style="background: var(--color-gold); color: var(--color-forest)">
          Begin Application →
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeo({
  title: 'GrantPortal — Funding Ideas That Matter',
  description: 'Apply for grants supporting community development, education, environment, health, arts, and economic opportunity. No account needed.',
  path: '/',
})

const { symbol, fetchSettings } = useCurrency()
await fetchSettings()

const heroStats = computed(() => [
  { value: `${symbol.value}250M`, label: 'Total available funding per cycle' },
  { value: '15', label: 'Grants awarded each cycle' },
  { value: 'April 30', label: 'Application deadline' },
])

const categories = [
  { icon: '🌱', title: 'Community Development', description: 'Programs that build local capacity, strengthen neighborhoods, and foster civic engagement.' },
  { icon: '🎓', title: 'Education & Youth', description: 'Initiatives that expand access to quality education and create opportunity for young people.' },
  { icon: '🌿', title: 'Environment', description: 'Projects that protect natural resources and advance environmental justice.' },
  { icon: '❤️', title: 'Health & Wellness', description: 'Efforts to improve physical and mental health outcomes in underserved communities.' },
  { icon: '🎨', title: 'Arts & Culture', description: 'Creative projects that preserve heritage, spark dialogue, and enrich cultural life.' },
  { icon: '💼', title: 'Economic Opportunity', description: 'Entrepreneurship support, job training, and pathways to financial stability.' },
]

const eligibility = computed(() => [
  'Nonprofits, individuals, or registered businesses',
  'Projects with a clear, demonstrable community benefit',
  'Willingness to provide budget transparency and accountability',
  'Ability to report on outcomes and impact after completion',
  'Projects located in eligible geographic regions',
  `Grant requests between ${symbol.value}100,000 and ${symbol.value}10M`,
])

const timeline = [
  { date: 'February 1, 2026', title: 'Applications Open', description: 'The portal opens and accepts new submissions.' },
  { date: 'April 30, 2026', title: 'Deadline', description: 'All applications must be submitted by 11:59 PM.' },
  { date: 'June 2026', title: 'Review Period', description: 'Our panel reviews and scores all eligible applications.' },
  { date: 'August 2026', title: 'Awards Announced', description: 'Recipients are notified and awards are made public.' },
]
</script>

