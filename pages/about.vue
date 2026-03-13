<template>
  <div>
    <section class="pt-20 pb-16" style="background: var(--color-mist)">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">About the Program</p>
        <h1 class="text-6xl leading-tight mb-6" style="font-family: var(--font-display); color: var(--color-forest)">
          Invested in<br /><em>Your Mission</em>
        </h1>
        <p class="text-lg leading-relaxed max-w-2xl mx-auto" style="color: #555">
          Since 2015, GrantPortal has distributed over {{ symbol }}2 billion to organizations and individuals working to create meaningful, lasting change in their communities.
        </p>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-16 items-center">
      <div>
        <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">Our Mission</p>
        <h2 class="text-4xl mb-6" style="font-family: var(--font-display); color: var(--color-forest)">Why We Do This</h2>
        <div class="space-y-4 text-base leading-relaxed" style="color: #555">
          <p>We believe that good ideas deserve resources. Too often, promising projects fail not because they lack merit, but because the people behind them lack access to funding and support.</p>
          <p>GrantPortal was founded to change that — making it easier for organizations and individuals to access the capital they need to turn vision into impact.</p>
          <p>We take a human-centered approach to grantmaking: low barriers to entry, a transparent review process, and real relationships with the communities we serve.</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="p-6 rounded-2xl text-center border" style="background: white; border-color: var(--color-sand)">
          <p class="text-4xl mb-2" style="font-family: var(--font-display); color: var(--color-forest)">{{ stat.value }}</p>
          <p class="text-xs" style="color: #888">{{ stat.label }}</p>
        </div>
      </div>
    </section>

    <section style="background: var(--color-forest)" class="py-24">
      <div class="max-w-6xl mx-auto px-6">
        <div class="max-w-xl mb-16">
          <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-gold)">Process</p>
          <h2 class="text-5xl text-white" style="font-family: var(--font-display)">How Applications Are Reviewed</h2>
        </div>
        <div class="grid md:grid-cols-4 gap-8">
          <div v-for="(step, i) in steps" :key="step.title">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-4" style="background: var(--color-gold); color: var(--color-forest)">{{ i + 1 }}</div>
            <h3 class="text-xl text-white mb-2" style="font-family: var(--font-display)">{{ step.title }}</h3>
            <p class="text-sm leading-relaxed" style="color: var(--color-mint)">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-6 py-24">
      <div class="max-w-xl mb-12">
        <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">Impact</p>
        <h2 class="text-5xl leading-tight" style="font-family: var(--font-display); color: var(--color-forest)">Past Recipients</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-5">
        <div v-for="r in recipients" :key="r.name" class="p-6 rounded-2xl border" style="background: white; border-color: var(--color-sand)">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style="background: var(--color-sage)">{{ r.name[0] }}</div>
            <div>
              <p class="font-medium text-sm" style="color: var(--color-forest)">{{ r.name }}</p>
              <p class="text-xs" style="color: #aaa">{{ r.category }} &middot; {{ r.year }}</p>
            </div>
          </div>
          <p class="text-sm leading-relaxed" style="color: #555">{{ r.summary }}</p>
          <p class="text-sm font-semibold mt-4" style="color: var(--color-gold)">{{ format(r.amount) }} awarded</p>
        </div>
      </div>
    </section>

    <section style="background: var(--color-mist)" class="py-24">
      <div class="max-w-3xl mx-auto px-6">
        <div class="text-center mb-12">
          <p class="text-xs uppercase tracking-widest font-medium mb-4" style="color: var(--color-sage)">FAQ</p>
          <h2 class="text-5xl" style="font-family: var(--font-display); color: var(--color-forest)">Common Questions</h2>
        </div>
        <div class="space-y-3">
          <div v-for="faq in faqs" :key="faq.q" class="rounded-xl overflow-hidden border" style="background: white; border-color: var(--color-sand)">
            <button @click="faq.open = !faq.open" class="w-full flex items-center justify-between px-6 py-4 text-left">
              <span class="font-medium text-sm pr-4" style="color: var(--color-forest)">{{ faq.q }}</span>
              <span class="text-xl flex-shrink-0 transition-transform duration-200" :class="{ 'rotate-45': faq.open }" style="color: var(--color-sage)">+</span>
            </button>
            <div v-show="faq.open" class="px-6 pb-5 text-sm leading-relaxed" style="color: #555">{{ faq.a }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="max-w-6xl mx-auto px-6 py-24 text-center">
      <h2 class="text-5xl mb-6" style="font-family: var(--font-display); color: var(--color-forest)">Have More Questions?</h2>
      <p class="text-base mb-8" style="color: #555">Reach out to our grants team — we are happy to help before you apply.</p>
      <div class="flex items-center justify-center gap-4 flex-wrap">
        <a href="mailto:grants@example.com" class="inline-block px-10 py-4 rounded-full text-white font-medium text-sm transition-all hover:opacity-90" style="background: var(--color-forest)">Contact Us</a>
        <NuxtLink to="/apply" class="inline-block px-10 py-4 rounded-full font-medium text-sm border transition-all hover:bg-gray-50" style="border-color: var(--color-sand); color: var(--color-forest)">Apply Now</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useSeo({
  title: 'About',
  description: 'Learn about GrantPortal - our mission, review process, past recipients, and how we invest in ideas that create lasting community impact.',
  path: '/about',
})

const { symbol, format, fetchSettings } = useCurrency()
await fetchSettings()

const stats = computed(() => [
  { value: `${symbol.value}2B+`, label: 'Total distributed since 2015' },
  { value: '180+', label: 'Grants awarded' },
  { value: '40+', label: 'States represented' },
  { value: '92%', label: 'Applicant satisfaction rate' },
])

const steps = [
  { title: 'Submit', description: 'Complete the online form. No account needed — just your email to save progress and resume anytime.' },
  { title: 'Screen', description: 'Our team reviews all submissions for eligibility and completeness within 2 weeks of the deadline.' },
  { title: 'Evaluate', description: 'A panel of independent reviewers scores applications on impact, feasibility, equity, and clarity.' },
  { title: 'Award', description: 'Recipients are notified directly and funds are disbursed within 30 days of the announcement.' },
]

// Raw numbers — format() applies the currency symbol
const recipients = [
  { name: 'Green Roots Co-op', category: 'Environment', year: '2024', amount: 2500000, summary: 'Converted 3 vacant lots into community gardens now serving 200+ families with fresh produce year-round.' },
  { name: 'Maria Santos', category: 'Education', year: '2024', amount: 1500000, summary: 'Launched a free coding bootcamp for teenagers in underserved rural communities, placing 40 graduates in tech jobs.' },
  { name: 'Westside Arts Collective', category: 'Arts & Culture', year: '2023', amount: 200000, summary: 'Created a traveling mural project documenting stories of immigrant families across 5 cities, reaching 50,000 viewers.' },
]

const faqs = computed(() => reactive([
  { q: 'Do I need to create an account to apply?', a: 'No. You apply using just your email address. We will send you a magic link to resume your draft application at any time — no password needed.', open: false },
  { q: 'How long does the application take?', a: 'Most applicants complete the form in 30-60 minutes. You can save your progress and return later at any point before the deadline.', open: false },
  { q: `What is the maximum grant amount?`, a: `Individual grants range from ${symbol.value}5,000 to ${symbol.value}50,000 depending on the scope and need of the project. Multi-year or multi-site projects may discuss larger awards directly with our team.`, open: false },
  { q: 'Can I apply if I have received a grant before?', a: 'Yes. Previous recipients are welcome to apply for new or continuing projects. Prior grant performance will be considered as part of the review.', open: false },
  { q: 'When will I hear back?', a: 'We aim to notify all applicants — approved or not — within 60 days of the application deadline. No one is left without an answer.', open: false },
  { q: 'Is my location information collected?', a: 'With your permission, we may collect your approximate geographic location to better understand where our grants have impact. This is optional and you can decline the browser prompt.', open: false },
]))
</script>

