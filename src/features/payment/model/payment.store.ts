import { defineStore } from 'pinia'
import type { MstOrder } from '../../mst-calculator/model/mst.types'

export type PaymentMethod = 'card' | 'kaspi'

interface PaymentState {
  orderNumber: string
  price: number
  finalOrder: MstOrder | null
  paymentMethod: PaymentMethod
  isLoading: boolean
  error: string | null
}

export const usePaymentStore = defineStore('payment-feature-store', {
  state: (): PaymentState => ({
    orderNumber: '',
    price: 0,
    finalOrder: null,
    paymentMethod: 'card',
    isLoading: false,
    error: null,
  }),

  actions: {
    setOrder(order: MstOrder) {
      this.finalOrder = order
      this.orderNumber = order.order_number || ''
      this.price = order.total_premium || order.amount || 0
    },
    setLoading(loading: boolean) {
      this.isLoading = loading
    },
    setError(error: string | null) {
      this.error = error
    },
    reset() {
      this.$reset()
    },
  },
})
