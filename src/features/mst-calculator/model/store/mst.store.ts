import { defineStore } from 'pinia'
import type { MSTState } from '../mst.types'
import { translations } from '../composables/useMstI18n'
import { orderApi } from '../../api/order.api'
export const useMstStore = defineStore('mst-calculator-store', {
  state: (): MSTState => ({
    lang: 'ru',
    step: 1,
    dictionaries: {
      countries: [],
      trip_purposes: [],
      sport_types: [],
      sport_levels: [],
      amounts: [],
      zones: [],
      ages: [],
      covid_19: [],
    },
    params: {
      country: [],
      amount: '',
      dates: null,
      purpose: 'tourism',
      touristsInfo: [{ id: 1, age: 'adult' }],
      activeRest: false,
      covidCoverage: false,
      covid_19: null,
      sportType: '',
      occupationDegree: '',
      studentDoc: null,
      policyholderIin: '',
      isTourist: false,
      isPolicyHolder: false,
      agreement: false,
    },
    step1Errors: {},
    contact: {
      phone: '+7 (',
      email: '',
    },
    tourists: [],
    policyHolder: {
      email: '',
      phone: '+7 (',
    },
    price: 0,
    hasGbdData: false,
    isPolicyholderSearchLoading: false,
    policyHolderInfo: null,
    policyHolderClientId: '',
    quoteId: '',
    orderNumber: '',
    finalOrder: null,
    isPriceLoading: false,
  }),

  getters: {
    maxAllowedStep(state): number {
      let max = 1
      if (
        state.params.country.length > 0 &&
        state.params.dates &&
        state.params.dates.length === 2
      ) {
        max = 2
      } else {
        return 1
      }

      if (state.orderNumber) {
        max = 3
      }

      return max
    },
    isStep2Valid(state): boolean {
      const isContactValid =
        state.contact.phone &&
        state.contact.phone.replace(/\D/g, '').length >= 10 &&
        state.contact.email &&
        state.contact.email.includes('@')

      const isPolicyholderValid = !!(
        state.params.policyholderIin &&
        state.params.policyholderIin.length === 12 &&
        state.params.agreement
      )

      const isTouristsValid =
        state.params.touristsInfo.length > 0 &&
        state.params.touristsInfo.every(
          (t) =>
            t.iin &&
            t.iin.length === 12 &&
            (String(t.firstName || '').trim().length > 0 ||
              String(t.lastName || '').trim().length > 0)
        )

      return !!(isContactValid && isPolicyholderValid && isTouristsValid)
    },
  },

  actions: {
    validateStep1(): boolean {
      this.step1Errors = {}
      let isValid = true
      const t = translations[this.lang].validation

      if (!this.params.country || this.params.country.length === 0) {
        this.step1Errors.country = t.selectCountry
        isValid = false
      }

      if (!this.params.amount) {
        this.step1Errors.amount = t.selectAmount
        isValid = false
      }

      if (!this.params.dates || this.params.dates.length < 2) {
        this.step1Errors.dates = t.selectDates
        isValid = false
      }

      if (!this.params.purpose) {
        this.step1Errors.purpose = t.selectPurpose
        isValid = false
      }

      if (this.params.touristsInfo.length === 0) {
        this.step1Errors.touristsInfo = t.addTourist
        isValid = false
      }

      return isValid
    },

    nextStep() {
      if (this.step === 1 && !this.validateStep1()) return

      if (this.step < 2) {
        this.step++
      }
    },
    prevStep() {
      if (this.step > 1) this.step--
    },
    setStep(step: number) {
      if (step <= this.maxAllowedStep) {
        this.step = step
      }
    },
    updateParams(params: Partial<MSTState['params']>) {
      this.params = { ...this.params, ...params }

      if (params.country !== undefined) {
        this.params.amount = ''
        this.price = 0
      }
    },
    setLang(lang: 'ru' | 'kk' | 'en') {
      this.lang = lang
    },

    setDictionaries(dictionaries: Partial<MSTState['dictionaries']>) {
      Object.assign(this.dictionaries, dictionaries)
    },

    saveStateToSession() {
      // CLEAR LEGACY KEYS
      sessionStorage.removeItem('mst_step1_data')

      // STRICTLY pick only Step 1 parameters
      const step1Params = {
        country: this.params.country,
        amount: this.params.amount,
        dates: this.params.dates,
        purpose: this.params.purpose,
        touristsInfo: this.params.touristsInfo.map((t) => ({
          id: t.id,
          age: t.age,
        })),
        activeRest: this.params.activeRest,
        covidCoverage: this.params.covidCoverage,
        sportType: this.params.sportType,
        occupationDegree: this.params.occupationDegree,
        // EXPLICITLY EXCLUDED: policyholderIin, agreement, studentDoc, isTourist, firstName, lastName, iin (from touristsInfo)
      }

      const data = {
        params: step1Params,
        price: this.price,
        orderNumber: this.orderNumber,
        step: this.step,
      }
      sessionStorage.setItem('mst_calc_data', JSON.stringify(data))
    },

    loadStateFromSession() {
      const saved = sessionStorage.getItem('mst_calc_data')
      if (saved) {
        try {
          const data = JSON.parse(saved)

          // Reset Step 2 fields to defaults before loading
          this.params.policyholderIin = ''
          this.params.agreement = false
          this.params.isTourist = false
          this.params.isPolicyHolder = false
          this.contact = { phone: '+7 (', email: '' }
          this.policyHolder = { phone: '+7 (', email: '' }
          this.tourists = []
          this.policyHolderInfo = null

          if (data.params) {
            this.params = { ...this.params, ...data.params }
            if (this.params.dates) {
              this.params.dates = this.params.dates.map(
                (d: string | number | Date) => new Date(d)
              )
            }
          }
          this.price = data.price || 0
          this.orderNumber = data.orderNumber || ''
          this.step = data.step || 1
        } catch (e) {
          console.error('Failed to parse saved data', e)
        }
      }
    },

    reset() {
      this.$reset()
      sessionStorage.removeItem('mst_calc_data')
      sessionStorage.removeItem('mst_step1_data')
    },

    clearSession() {
      this.reset()
    },

    async uploadStudentDoc() {
      if (
        this.params.purpose === 'student' &&
        this.params.studentDoc &&
        this.orderNumber
      ) {
        try {
          await orderApi.uploadOrderFile(
            this.orderNumber,
            this.params.studentDoc
          )
        } catch (e) {
          console.error('Failed to upload student document', e)
        }
      }
    },
  },
})
