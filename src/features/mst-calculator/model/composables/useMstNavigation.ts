import { watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMstStore } from '../store/mst.store'

export function useMstNavigation() {
  const store = useMstStore()
  const router = useRouter()
  const route = useRoute()

  if (!router || !route) {
    console.warn(
      'MST Navigation: Router or Route not found. Navigation sync disabled.'
    )
    return
  }

  watch(
    () => route.query?.step,
    (newStep) => {
      let targetStep = Number(newStep)
      const hasOrder = Boolean(route.query?.order_number)

      if (!targetStep) {
        targetStep = hasOrder ? 3 : 1
      }

      if (targetStep > store.maxAllowedStep && !hasOrder) {
        targetStep = store.maxAllowedStep
        router.replace({ query: { ...route.query, step: targetStep } })
      }

      if (hasOrder) {
        store.step = targetStep
      } else {
        store.setStep(targetStep)
      }
    },
    { immediate: true }
  )

  watch(
    () => route.query?.order_number,
    (val) => {
      if (val) {
        store.orderNumber = String(val)
      }
    },
    { immediate: true }
  )

  watch(
    () => store.step,
    (newStep) => {
      if (Number(route.query?.step) !== newStep) {
        router.push({ query: { ...route.query, step: newStep } })
      }
    }
  )
}
