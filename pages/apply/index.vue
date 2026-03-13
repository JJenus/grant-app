<template>
  <div class="max-w-3xl mx-auto px-6 py-16">
    <div class="mb-10">
      <p class="text-xs uppercase tracking-widest font-medium mb-2" style="color: var(--color-sage)">Grant Application</p>
      <h1 class="text-4xl mb-2" style="font-family: var(--font-display); color: var(--color-forest)">Apply for Funding</h1>
      <p class="text-sm" style="color: #888">No account needed. Enter your email to save and resume anytime.</p>
    </div>

    <!-- Step indicators -->
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-3 flex-wrap">
        <template v-for="(label, i) in stepLabels" :key="i">
          <button
            @click="store.currentStep > i + 1 ? store.goToStep(i + 1) : null"
            class="flex items-center gap-1.5 text-xs transition-all"
            :class="store.currentStep > i + 1 ? 'cursor-pointer' : 'cursor-default'"
          >
            <span
              class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
              :style="store.currentStep > i + 1
                ? 'background:var(--color-sage);color:white'
                : store.currentStep === i + 1
                  ? 'background:var(--color-forest);color:white'
                  : 'background:var(--color-sand);color:#aaa'"
            >
              <span v-if="store.currentStep > i + 1">&#10003;</span>
              <span v-else>{{ i + 1 }}</span>
            </span>
            <span class="hidden sm:inline" :style="store.currentStep === i + 1 ? 'color:var(--color-forest);font-weight:600' : 'color:#aaa'">{{ label }}</span>
          </button>
          <span v-if="i < stepLabels.length - 1" style="color: var(--color-sand)">›</span>
        </template>
      </div>
      <div class="h-1 rounded-full overflow-hidden" style="background: var(--color-sand)">
        <div class="h-full rounded-full transition-all duration-500" :style="'width:' + store.progress + '%;background:var(--color-sage)'"></div>
      </div>
    </div>

    <!-- Save banner -->
    <div v-if="store.token && store.lastSaved && !store.isSaving"
      class="flex items-center justify-between p-3 rounded-xl mb-6 text-xs border"
      style="background:#f0faf4;border-color:#b8e0c4">
      <span style="color:#2a6b3a">&#10003; Draft saved at {{ formatTime(store.lastSaved) }}</span>
      <button @click="sendResumeLink" class="underline hover:no-underline" style="color:var(--color-sage)">Email me a resume link</button>
    </div>
    <div v-else-if="store.isSaving" class="text-xs mb-6 px-3 py-2 rounded-lg" style="background:var(--color-mist);color:#999">Saving...</div>
    <div v-if="resumeLinkSent" class="p-3 rounded-xl mb-6 text-xs border" style="background:#f0faf4;border-color:#b8e0c4;color:#2a6b3a">
      Resume link sent to {{ store.form.email }}!
    </div>

    <!-- Form card -->
    <div class="rounded-2xl border p-8 shadow-sm mb-6" style="background:white;border-color:var(--color-sand)">

      <!-- STEP 1: Contact -->
      <div v-if="store.currentStep === 1">
        <h2 class="text-2xl mb-6" style="font-family:var(--font-display);color:var(--color-forest)">Contact Information</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <FormField label="First Name *">
            <input v-model="form.firstName" type="text" class="field-input" placeholder="Jane" />
          </FormField>
          <FormField label="Last Name *">
            <input v-model="form.lastName" type="text" class="field-input" placeholder="Doe" />
          </FormField>
        </div>
        <div class="mb-4">
          <FormField label="Email Address *" hint="We will use this to send you a link to resume your application">
            <input v-model="form.email" type="email" class="field-input" placeholder="you@example.com" @blur="checkExistingDraft" />
          </FormField>
        </div>
        <FormField label="Phone Number">
          <input v-model="form.phone" type="tel" class="field-input" placeholder="07030000000" />
        </FormField>
        <div v-if="draftFound" class="mt-4 p-4 rounded-xl border text-sm" style="background:#fff9e6;border-color:#f0d060">
          <p class="font-semibold" style="color:#7a5c00">Existing draft found</p>
          <p class="mt-1" style="color:#8a6800">We emailed a resume link to this address. Continue below to start a new application.</p>
        </div>
        <input type="hidden" name="latitude" :value="form.latitude" />
        <input type="hidden" name="longitude" :value="form.longitude" />
      </div>

      <!-- STEP 2: Organization -->
      <div v-else-if="store.currentStep === 2">
        <h2 class="text-2xl mb-6" style="font-family:var(--font-display);color:var(--color-forest)">Organization Details</h2>
        <div class="mb-4">
          <FormField label="Applicant Type *">
            <select v-model="form.orgType" class="field-input">
              <option value="">Select one...</option>
              <option value="nonprofit">Nonprofit Organization (501c3)</option>
              <option value="individual">Individual</option>
              <option value="business">Business / Social Enterprise</option>
              <option value="government">Government / Public Agency</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
        <div class="mb-4">
          <FormField label="Organization Name">
            <input v-model="form.orgName" type="text" class="field-input" placeholder="e.g. Green Roots Co-op" />
          </FormField>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Website">
            <input v-model="form.website" type="url" class="field-input" placeholder="https://" />
          </FormField>
          <FormField label="EIN (if applicable)">
            <input v-model="form.ein" type="text" class="field-input" placeholder="XX-XXXXXXX" />
          </FormField>
        </div>
      </div>

      <!-- STEP 3: Project -->
      <div v-else-if="store.currentStep === 3">
        <h2 class="text-2xl mb-6" style="font-family:var(--font-display);color:var(--color-forest)">Project Details</h2>
        <div class="mb-4">
          <FormField label="Grant Category *">
            <select v-model="form.grantCategory" class="field-input">
              <option value="">Select a category...</option>
              <option value="community">Community Development</option>
              <option value="education">Education &amp; Youth</option>
              <option value="environment">Environment &amp; Sustainability</option>
              <option value="health">Health &amp; Wellness</option>
              <option value="arts">Arts &amp; Culture</option>
              <option value="economic">Economic Opportunity</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
        <div class="mb-4">
          <FormField label="Project Title *">
            <input v-model="form.projectTitle" type="text" class="field-input" placeholder="What is your project called?" />
          </FormField>
        </div>
        <div class="mb-4">
          <FormField label="Project Description *" hint="Describe the problem, your approach, and who it serves. 200-500 words.">
            <textarea v-model="form.description" class="field-input" rows="5" placeholder="Describe your project..."></textarea>
          </FormField>
        </div>
        <FormField label="Goals and Expected Outcomes *" hint="What will success look like? Include measurable outcomes where possible.">
          <textarea v-model="form.goals" class="field-input" rows="3" placeholder="What outcomes do you expect to achieve?"></textarea>
        </FormField>
      </div>

      <!-- STEP 4: Budget -->
      <div v-else-if="store.currentStep === 4">
        <h2 class="text-2xl mb-6" style="font-family:var(--font-display);color:var(--color-forest)">Budget Information</h2>
        <div class="mb-6">
          <FormField label="Amount Requested ($) *" hint="Grants range from {{ symbol }}5,000 to {{ symbol }}50,000">
            <input v-model="form.amountRequested" type="number" min="1000" max="50000" class="field-input" placeholder="e.g. 25000" />
          </FormField>
        </div>
        <div class="mb-6">
          <p class="text-xs font-semibold uppercase tracking-wide mb-3" style="color:#666">Budget Breakdown <span style="color:#aaa;font-weight:400;text-transform:none">(optional)</span></p>
          <div class="space-y-2 mb-3">
            <div v-for="(item, i) in form.budgetBreakdown" :key="i" class="flex gap-2 items-center">
              <input v-model="item.description" type="text" class="field-input flex-1" placeholder="Line item (e.g. Staff time)" />
              <input v-model="item.amount" type="number" class="field-input" style="width:7rem" placeholder="Amount" />
              <button @click="removeBudgetItem(i)" class="text-red-400 hover:text-red-600 w-6 h-6 flex items-center justify-center flex-shrink-0 text-lg">&times;</button>
            </div>
          </div>
          <button @click="addBudgetItem" class="text-sm underline" style="color:var(--color-sage)">+ Add line item</button>
        </div>
        <FormField label="Other Funding Sources">
          <textarea v-model="form.otherFunding" class="field-input" rows="2" placeholder="List any other grants, loans, or contributions you have received or applied for..."></textarea>
        </FormField>
      </div>

      <!-- STEP 5: Supporting Docs -->
      <div v-else-if="store.currentStep === 5">
        <h2 class="text-2xl mb-3" style="font-family:var(--font-display);color:var(--color-forest)">Supporting Documents</h2>
        <p class="text-sm mb-6" style="color:#888">Optional supporting materials (letters of support, financial statements, project plans).</p>
        <div class="p-10 rounded-2xl border-2 border-dashed text-center" style="border-color:var(--color-sand)">
          <p class="text-4xl mb-3">&#128206;</p>
          <p class="font-medium text-sm mb-1" style="color:var(--color-forest)">File uploads coming in a future update</p>
          <p class="text-xs" style="color:#aaa">You may continue without uploading documents</p>
        </div>
        <p class="text-xs mt-4 text-center" style="color:#bbb">If you have supporting documents, email them to grants@example.com referencing your project title.</p>
      </div>

      <!-- STEP 6: Review -->
      <div v-else-if="store.currentStep === 6">
        <h2 class="text-2xl mb-6" style="font-family:var(--font-display);color:var(--color-forest)">Review &amp; Submit</h2>
        <div class="space-y-3 mb-6">
          <ReviewSection title="Contact" :step="1" @edit="store.goToStep">
            <p>{{ form.firstName }} {{ form.lastName }}</p>
            <p style="color:#888">{{ form.email }}<span v-if="form.phone"> &middot; {{ form.phone }}</span></p>
          </ReviewSection>
          <ReviewSection title="Organization" :step="2" @edit="store.goToStep">
            <p class="capitalize">{{ form.orgType }}<span v-if="form.orgName"> &middot; {{ form.orgName }}</span></p>
          </ReviewSection>
          <ReviewSection title="Project" :step="3" @edit="store.goToStep">
            <p class="font-medium">{{ form.projectTitle }}</p>
            <p class="mt-1" style="color:#888">{{ form.grantCategory }}</p>
            <p class="mt-1 text-xs" style="color:#aaa;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">{{ form.description }}</p>
          </ReviewSection>
          <ReviewSection title="Budget" :step="4" @edit="store.goToStep">
            <p class="font-semibold" style="color:var(--color-forest)">{{ format(form.amountRequested) }} requested</p>
            <p v-if="form.budgetBreakdown && form.budgetBreakdown.length" class="text-xs mt-1" style="color:#888">{{ form.budgetBreakdown.length }} line items</p>
          </ReviewSection>
          <ReviewSection v-if="form.latitude" title="Location Collected">
            <a :href="'https://maps.google.com/?q=' + form.latitude + ',' + form.longitude" target="_blank" class="underline text-xs" style="color:var(--color-sage)">
              View on Google Maps ({{ form.latitude ? form.latitude.toFixed(4) : '' }}, {{ form.longitude ? form.longitude.toFixed(4) : '' }})
            </a>
          </ReviewSection>
        </div>
        <label class="flex items-start gap-3 cursor-pointer p-4 rounded-xl border" style="border-color:var(--color-sand);background:var(--color-mist)">
          <input v-model="form.agreedToTerms" type="checkbox" class="mt-0.5" />
          <span class="text-sm leading-relaxed" style="color:#555">
            I confirm that all information provided is accurate and complete. I agree to the
            <a href="#" class="underline" style="color:var(--color-sage)">Terms and Conditions</a>
            and consent to the use of my submitted data for grant evaluation purposes.
          </span>
        </label>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex items-center justify-between">
      <button v-if="store.currentStep > 1" @click="store.prevStep()"
        class="px-6 py-3 rounded-full text-sm border transition-all hover:bg-gray-50"
        style="border-color:var(--color-sand);color:var(--color-charcoal)">
        Back
      </button>
      <div v-else></div>
      <button v-if="store.currentStep < store.totalSteps"
        @click="handleNext"
        :disabled="!store.canProceed"
        class="px-8 py-3 rounded-full text-sm text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style="background:var(--color-forest)">
        Continue
      </button>
      <button v-else
        @click="handleSubmit"
        :disabled="!store.canProceed || submitting"
        class="px-8 py-3 rounded-full text-sm text-white font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style="background:var(--color-sage)">
        {{ submitting ? 'Submitting...' : 'Submit Application' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useApplicationStore } from '~/stores/application'

useSeo({
  title: 'Apply for a Grant',
  description: 'Submit your grant application online, upto ₦10M for each individual. No login needed - save your progress and resume anytime with just your email address.',
  path: '/apply',
})

const store = useApplicationStore()
const { format, fetchSettings, symbol } = useCurrency()
const form = store.form
const route = useRoute()
const draftFound = ref(false)
const submitting = ref(false)
const resumeLinkSent = ref(false)

const stepLabels = ['Contact', 'Organization', 'Project', 'Budget', 'Documents', 'Review']

const formatTime = (d: Date) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

onMounted(async () => {
  await fetchSettings()
  store.requestGeolocation()
  const token = route.query.token
  if (token && typeof token === 'string') {
    await store.loadDraft(token)
  }
})

let saveTimer: ReturnType<typeof setTimeout> | null = null
watch(() => ({ ...store.form }), () => {
  if (!store.form.email) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => store.saveDraft(), 2500)
}, { deep: true })

const checkExistingDraft = async () => {
  if (!form.email) return
  try {
    const res = await $fetch<{ hasDraft: boolean; token?: string }>('/api/applications/check-email', { params: { email: form.email } })
    if (res.hasDraft && res.token) {
      draftFound.value = true
      await $fetch('/api/resume-email', { method: 'POST', body: { email: form.email, token: res.token } })
    }
  } catch {}
}

const sendResumeLink = async () => {
  try {
    await store.sendResumeEmail()
    resumeLinkSent.value = true
    setTimeout(() => { resumeLinkSent.value = false }, 5000)
  } catch {}
}

const addBudgetItem = () => form.budgetBreakdown.push({ description: '', amount: '' })
const removeBudgetItem = (i: number) => form.budgetBreakdown.splice(i, 1)

const handleNext = async () => {
  await store.saveDraft()
  store.nextStep()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await store.submit()
    navigateTo('/apply/success')
  } catch {
    alert('Something went wrong. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>

