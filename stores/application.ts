import { defineStore } from 'pinia'

interface BudgetItem {
  description: string
  amount: string | number
}

interface ApplicationForm {
  email: string
  firstName: string
  lastName: string
  phone: string
  orgName: string
  orgType: string
  website: string
  ein: string
  grantCategory: string
  projectTitle: string
  description: string
  goals: string
  amountRequested: string | number
  budgetBreakdown: BudgetItem[]
  otherFunding: string
  latitude: number | null
  longitude: number | null
  agreedToTerms: boolean
}

export const useApplicationStore = defineStore('application', {
  state: () => ({
    token: null as string | null,
    currentStep: 1,
    totalSteps: 6,
    isSaving: false,
    lastSaved: null as Date | null,
    form: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      orgName: '',
      orgType: '',
      website: '',
      ein: '',
      grantCategory: '',
      projectTitle: '',
      description: '',
      goals: '',
      amountRequested: '',
      budgetBreakdown: [] as BudgetItem[],
      otherFunding: '',
      latitude: null,
      longitude: null,
      agreedToTerms: false,
    } as ApplicationForm
  }),

  getters: {
    progress: (state) => Math.round((state.currentStep / state.totalSteps) * 100),
    canProceed: (state) => {
      const f = state.form
      switch (state.currentStep) {
        case 1: return !!(f.email && f.firstName && f.lastName)
        case 2: return !!f.orgType
        case 3: return !!(f.grantCategory && f.projectTitle && f.description && f.goals)
        case 4: return !!f.amountRequested
        case 5: return true
        case 6: return f.agreedToTerms
        default: return false
      }
    }
  },

  actions: {
    requestGeolocation() {
      if (typeof navigator === 'undefined' || !navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.form.latitude = pos.coords.latitude
          this.form.longitude = pos.coords.longitude
        },
        () => {}
      )
    },

    async saveDraft() {
      if (!this.form.email) return
      this.isSaving = true
      try {
        const method = this.token ? 'PUT' : 'POST'
        const url = this.token ? `/api/applications/${this.token}` : '/api/applications'
        const res: any = await $fetch(url, { method, body: { ...this.form } })
        if (!this.token && res.token) this.token = res.token
        this.lastSaved = new Date()
      } catch (e) {
        console.error('Save draft failed', e)
      } finally {
        this.isSaving = false
      }
    },

    async loadDraft(token: string) {
      try {
        const data: any = await $fetch(`/api/applications/${token}`)
        if (data) {
          this.token = token
          const { id, createdAt, updatedAt, submittedAt, status, adminNotes, ...rest } = data
          Object.assign(this.form, rest)
        }
      } catch (e) {
        console.error('Load draft failed', e)
      }
    },

    async submit() {
      await this.saveDraft()
      return await $fetch(`/api/applications/${this.token}/submit`, { method: 'POST' })
    },

    async sendResumeEmail() {
      await $fetch('/api/resume-email', {
        method: 'POST',
        body: { email: this.form.email, token: this.token }
      })
    },

    nextStep() { if (this.currentStep < this.totalSteps) this.currentStep++ },
    prevStep() { if (this.currentStep > 1) this.currentStep-- },
    goToStep(n: number) { this.currentStep = n },
  }
})
