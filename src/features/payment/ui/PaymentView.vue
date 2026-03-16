<script setup lang="ts">
import { usePaymentStore } from '../model/payment.store'
import { useMstStore } from '../../mst-calculator/model/store/mst.store'
import { paymentApi } from '../api/payment.api'
import { ref, computed, onMounted } from 'vue'
import { NButton } from 'nomad-ui'
import PaymentOrderSummary from './PaymentOrderSummary.vue'
import PaymentMethodForm from './PaymentMethodForm.vue'
import { useRoute } from 'vue-router'
import { useHalykPayment } from '../model/useHalykPayment'
import KaspiProcessingView from './KaspiProcessingView.vue'
import type { MstOrder } from '../../mst-calculator/model/mst.types'
import { useMstReset } from '../../mst-calculator/model/composables/useMstReset'
import { formatCurrency } from '@/shared/utils/format'
import { normalizeResponse } from '@/shared/utils/api'
import { useMstI18n } from '../../mst-calculator/model/composables/useMstI18n'
import RiArrowLeftLine from '~icons/ri/arrow-left-line'
import RiCloseLine from '~icons/ri/close-line'

const { goHome } = useMstReset()
const { t } = useMstI18n()

const mstStore = useMstStore()
const store = usePaymentStore()
const route = useRoute()

const isKaspiMode = ref(false)

const orderNumberFromProps = computed(() => {
  return (
    mstStore.orderNumber ||
    (route?.query?.order as string) ||
    (route?.query?.order_number as string) ||
    ''
  )
})

const isLoadingToken = ref(false)
const isLoadingOrder = ref(false)
const error = ref('')
const isPaymentSheetOpen = ref(false)

const orderId = computed(() => store.orderNumber)
const formattedPrice = computed(() => formatCurrency(store.price))

onMounted(async () => {
  if (!mstStore.orderNumber) mstStore.loadStateFromSession()

  const orderNumber = orderNumberFromProps.value
  if (orderNumber) {
    isLoadingOrder.value = true
    try {
      const response = await paymentApi.getPayableOrder(orderNumber)
      const data = normalizeResponse<MstOrder>(response)
      if (data) store.setOrder(data)
    } catch (e) {
      console.error('Failed to fetch payable order', e)
      error.value = 'Не удалось загрузить данные заказа'
    } finally {
      isLoadingOrder.value = false
    }
  } else if (!mstStore.orderNumber && !route?.query?.order) {
    error.value = 'Номер заказа не найден'
  }
})

const { payWithHalyk } = useHalykPayment()

const handlePay = async () => {
  isLoadingToken.value = true
  try {
    if (mstStore.params.purpose === 'student') {
      await mstStore.uploadStudentDoc()
    }

    if (store.paymentMethod === 'card') {
      await payWithHalyk(String(store.orderNumber), store.price)
    } else if (store.paymentMethod === 'kaspi') {
      isKaspiMode.value = true
    }
  } catch (err) {
    console.error('Payment error:', err)
    alert('Произошла ошибка')
  } finally {
    isLoadingToken.value = false
  }
}

const emit = defineEmits<{
  (e: 'update:step', val: number): void
}>()

const openPaymentSheet = () => {
  if (window.innerWidth < 1024) isPaymentSheetOpen.value = true
}

const closePaymentSheet = () => (isPaymentSheetOpen.value = false)
</script>

<template>
  <div class="w-full">
    <div v-if="isLoadingOrder" class="flex justify-center py-10">
      Загрузка заказа...
    </div>

    <div v-else-if="error" class="text-center py-10 text-red-500">
      {{ error }}
    </div>

    <div v-else class="flex flex-col gap-4 lg:block">
      <KaspiProcessingView
        v-if="isKaspiMode"
        @back="goHome"
        :order-number="store.orderNumber"
      />

      <div v-else class="space-y-4">
        <div
          class="bg-white rounded-2xl p-4 lg:bg-transparent lg:p-0 lg:shadow-none"
        >
          <!-- Top Navigation & Step -->
          <div class="mb-4 lg:mb-8">
            <button
              @click="goHome"
              class="flex items-center gap-2 text-[#FF4713] font-medium mb-4 hover:opacity-80 transition-opacity text-sm lg:text-base cursor-pointer"
            >
              <ri-arrow-left-line class="text-xl lg:text-2xl" />
              {{ t.payment.recalculate }}
            </button>
            <div class="text-sm font-medium text-gray-500">
              {{ t.common.step }} 3 {{ t.common.of }} 3
            </div>
          </div>

          <h2 class="text-2xl font-bold mb-4 lg:mb-10 text-gray-900">
            {{ t.step3.title }}
          </h2>
        </div>

        <!-- CARD 2: Details (Mobile) / Middle Section (Desktop) -->
        <div
          class="bg-white rounded-2xl p-4 lg:bg-transparent lg:p-0 lg:shadow-none"
        >
          <div class="space-y-4">
            <h3 class="text-lg lg:text-xl font-bold">
              {{ t.payment.additionalInfo }}
            </h3>
            <PaymentOrderSummary :orderId="orderId" />
          </div>
        </div>

        <!-- Desktop Payment Form (Hidden on Mobile) -->
        <div class="hidden lg:block space-y-5">
          <div class="space-y-1">
            <h3 class="text-xl font-bold">{{ t.payment.paymentMethod }}</h3>
            <p class="text-xs text-secondary-text text-gray-500 mb-2">
              {{ t.payment.paymentMethodDesc }}
            </p>
          </div>
          <PaymentMethodForm />

          <div
            class="grid grid-cols-1 items-center gap-4 sm:grid-cols-2 border-none mt-6"
          >
            <div class="flex flex-col items-start gap-1">
              <div class="text-xs font-medium text-gray-500">
                {{ t.payment.totalAmount }}
              </div>
              <div class="text-3xl font-bold text-[#FF4713]">
                {{ formattedPrice }}
              </div>
            </div>

            <NButton
              class="h-[56px] w-full rounded-xl bg-[#FF4713] text-base font-medium hover:bg-[#FF4713]/90 text-white"
              @click="handlePay"
              color="none"
              :loading="isLoadingToken"
            >
              {{ t.payment.buy }}
            </NButton>
          </div>
        </div>

        <!-- CARD 3: Action Card (Mobile Only) -->
        <div
          class="bg-white rounded-2xl p-4 grid grid-cols-2 items-center gap-4 lg:hidden"
        >
          <div class="flex flex-col">
            <span class="text-xs text-gray-500">{{
              t.payment.totalAmount
            }}</span>
            <span class="text-xl font-bold text-[#FF4713]">{{
              formattedPrice
            }}</span>
          </div>
          <NButton
            class="h-[48px] w-full rounded-xl bg-[#FF4713] text-base font-medium hover:bg-[#FF4713]/90 text-white"
            @click="openPaymentSheet"
            color="none"
            :loading="isLoadingToken"
          >
            {{ t.common.policy }}
          </NButton>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Bottom Sheet Modal -->
  <Transition name="sheet">
    <div v-if="isPaymentSheetOpen" class="fixed inset-0 z-50 lg:hidden">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        @click="closePaymentSheet"
      ></div>

      <!-- Sheet -->
      <div
        class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 sheet-content"
      >
        <div class="flex justify-between items-center mb-2">
          <h3 class="text-xl font-bold">{{ t.payment.paymentMethod }}</h3>
          <button
            @click="closePaymentSheet"
            class="p-2 -mr-2 text-gray-400 hover:text-gray-600"
          >
            <ri-close-line class="text-2xl" />
          </button>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          {{ t.payment.paymentMethodDesc }}
        </p>

        <PaymentMethodForm />

        <div class="mt-8">
          <NButton
            class="h-[56px] w-full rounded-xl bg-[#FF4713] text-base font-medium hover:bg-[#FF4713]/90 text-white"
            @click="handlePay"
            color="none"
            :loading="isLoadingToken"
          >
            {{ t.payment.buy }} {{ formattedPrice }}
          </NButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-enter-active .sheet-content {
  animation: slideUp 0.3s ease-out;
}

.sheet-leave-active .sheet-content {
  animation: slideDown 0.3s ease-in;
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}
</style>
