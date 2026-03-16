import { useMstStore } from '../store/mst.store'
import { usePaymentStore } from '../../../payment/model/payment.store'
import { useRouter } from 'vue-router'

export function useMstReset() {
  const mstStore = useMstStore()
  const paymentStore = usePaymentStore()
  const router = useRouter()

  const resetAllData = () => {
    mstStore.clearSession()
    paymentStore.reset()

    localStorage.clear()
    sessionStorage.clear()

    if (router) {
      router.replace({ query: {} })
    }
  }

  const goHome = () => {
    resetAllData()
    if (router) {
      router.replace('/')
    }
  }

  return {
    resetAllData,
    goHome,
  }
}
