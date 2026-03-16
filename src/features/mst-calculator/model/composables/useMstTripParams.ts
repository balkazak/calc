import { useMstStore } from '../store/mst.store'
import { useMstOrderActions } from '../store/order/order.actions'
import { watch, computed } from 'vue'
import type { InsuranceParam, TouristInfo, MSTState } from '../mst.types'

export function useStep1Logic() {
  const store = useMstStore()
  const { calculatePrice } = useMstOrderActions()

  // Wrapper to update params, calculate price, and save session
  const setParams = (params: Partial<MSTState['params']>) => {
    store.updateParams(params)
    calculatePrice()
    store.saveStateToSession()
  }

  const countryOptions = computed(() => store.dictionaries.countries || [])

  const sumOptions = computed(() => {
    const { country } = store.params
    const { countries = [], amounts = [] } = store.dictionaries

    if (!country?.length) return []

    const selectedZones = Array.from(
      new Set(
        country
          .map((c: InsuranceParam | string) =>
            typeof c === 'string'
              ? countries.find((x) => x.value === c)?.zone
              : c.zone
          )
          .filter(Boolean)
      )
    )

    if (!selectedZones.length) return []

    if (selectedZones.length === 1) {
      return amounts.filter((a) => a.zone === selectedZones[0])
    }

    const winnerZone = selectedZones
      .map((zone) => {
        const prices = amounts
          .filter((a) => a.zone === zone)
          .map((a) => a.price ?? 0)

        return {
          zone,
          max: Math.max(...prices),
          min: Math.min(...prices),
        }
      })
      .sort((a, b) => b.max - a.max || b.min - a.min)[0]?.zone

    return winnerZone ? amounts.filter((a) => a.zone === winnerZone) : []
  })

  const purposeOptions = computed(() => store.dictionaries.trip_purposes || [])

  const sportTypeOptions = computed(() => store.dictionaries.sport_types || [])

  const occupationDegreeOptions = computed(
    () => store.dictionaries.sport_levels || []
  )

  const covidCoverageOptions = computed(() => {
    const { country } = store.params
    const { countries = [], covid_19 = [] } = store.dictionaries

    if (!country?.length) return []

    const hasEU = country.some((c: InsuranceParam | string) => {
      const countryObj =
        typeof c === 'string'
          ? countries.find((x: InsuranceParam) => x.value === (c as string))
          : (c as InsuranceParam)

      return countryObj?.zone === 'EU'
    })

    const targetZone = hasEU ? 'EU' : 'WORLD'

    const filtered = covid_19.filter((o) => o.zone === targetZone)

    return filtered
  })

  const activeRest = computed({
    get: () => store.params.activeRest,
    set: (val) => setParams({ activeRest: val }),
  })

  const covidCoverage = computed({
    get: () => store.params.covidCoverage,
    set: (val) => setParams({ covidCoverage: val }),
  })

  const sportType = computed({
    get: () => store.params.sportType,
    set: (val) => setParams({ sportType: val }),
  })

  const occupationDegree = computed({
    get: () => store.params.occupationDegree,
    set: (val) => setParams({ occupationDegree: val }),
  })

  const selectedCovidCoverage = computed({
    get: () => store.params.covid_19,
    set: (val) => setParams({ covid_19: val }),
  })

  const updateCountry = (val: InsuranceParam[]) => {
    if (store.step1Errors.country) delete store.step1Errors.country
    if (Array.isArray(val) && val.length > 3) {
      setParams({ country: val.slice(0, 3) })
    } else {
      setParams({ country: val })
    }
  }

  const updateAmount = (val: string) => {
    if (store.step1Errors.amount) delete store.step1Errors.amount
    setParams({ amount: val })
  }

  const updatePurpose = (val: string) => {
    if (store.step1Errors.purpose) delete store.step1Errors.purpose
    setParams({ purpose: val })
  }

  const updateDates = (val: Date[] | null) => {
    if (val && val.length === 2 && store.step1Errors.dates) {
      delete store.step1Errors.dates
    }
    setParams({ dates: val })
  }

  const updateTourists = (val: TouristInfo[]) => {
    if (store.step1Errors.touristsInfo) delete store.step1Errors.touristsInfo
    setParams({ touristsInfo: val })
  }

  watch(
    () => store.params.dates,
    (val) => {
      if (val && val.length === 2 && store.step1Errors.dates) {
        delete store.step1Errors.dates
      }
    }
  )

  watch(
    () => store.params.touristsInfo,
    (val) => {
      if (val && val.length > 0 && store.step1Errors.touristsInfo) {
        delete store.step1Errors.touristsInfo
      }
    },
    { deep: true }
  )

  watch(covidCoverageOptions, (val) => {
    if (!val || val.length === 0) return

    if (val && val.length === 1 && val[0]) {
      const newVal = val[0].value as number
      if (selectedCovidCoverage.value !== newVal) {
        selectedCovidCoverage.value = newVal
      }
    } else if (
      val &&
      selectedCovidCoverage.value &&
      !val.some((o) => o.value === selectedCovidCoverage.value)
    ) {
      selectedCovidCoverage.value = null
    }
  })

  return {
    countryOptions,
    sumOptions,
    purposeOptions,
    sportTypeOptions,
    occupationDegreeOptions,
    activeRest,
    covidCoverage,
    sportType,
    occupationDegree,
    covidCoverageOptions,
    selectedCovidCoverage,
    updateCountry,
    updateAmount,
    updatePurpose,
    updateDates,
    updateTourists,
  }
}
