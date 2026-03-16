<script setup lang="ts">
import { usePaymentStore } from '../model/payment.store'
import { useMstStore } from '../../mst-calculator/model/store/mst.store'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { NButton } from 'nomad-ui'
import { useMstReset } from '../../mst-calculator/model/composables/useMstReset'
import { useMstI18n } from '../../mst-calculator/model/composables/useMstI18n'
import RiCloseLine from '~icons/ri/close-line'

const store = usePaymentStore()
const mstStore = useMstStore()
const router = useRouter()
const { goHome } = useMstReset()
const { t } = useMstI18n()

onMounted(() => {
  if (!mstStore.orderNumber) mstStore.loadStateFromSession()
})

const retryPayment = () => {
  const orderNumber = store.orderNumber || mstStore.orderNumber
  router.push({
    path: '/mst',
    query: { payment: orderNumber },
  })
}
</script>

<template>
  <div
    class="min-h-screen bg-[#F5F7F9] p-4 lg:p-8 flex justify-center items-center"
  >
    <div
      class="w-full max-w-lg bg-white rounded-3xl p-10 shadow-sm text-center"
    >
      <div
        class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <ri-close-line class="text-3xl text-[#EF4444]" />
      </div>

      <h2 class="text-3xl font-bold mb-4">{{ t.payment.errorTitle }}</h2>
      <p class="text-gray-500 mb-8 max-w-xs mx-auto">
        {{ t.payment.errorDesc }}
      </p>

      <div class="space-y-4">
        <NButton
          class="h-[56px] w-full rounded-xl bg-[#FF4713] text-base font-medium hover:bg-[#FF4713]/90 text-white"
          @click="retryPayment"
          color="none"
        >
          {{ t.step2.retry }}
        </NButton>

        <button
          @click="goHome"
          class="w-full h-[56px] text-gray-500 font-medium hover:text-gray-700 transition-colors"
        >
          {{ t.payment.backToMain }}
        </button>
      </div>
    </div>
  </div>
</template>
