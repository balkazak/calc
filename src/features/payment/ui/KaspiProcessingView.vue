<script setup lang="ts">
import { usePaymentStore } from '../model/payment.store'
import { useMstStore } from '../../mst-calculator/model/store/mst.store'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { paymentApi } from '../api/payment.api'
import type { MstOrder } from '../../mst-calculator/model/mst.types'
import { formatCurrency } from '@/shared/utils/format'
import { normalizeResponse } from '@/shared/utils/api'
import { useMstI18n } from '../../mst-calculator/model/composables/useMstI18n'
import RiArrowLeftLine from '~icons/ri/arrow-left-line'
import RiErrorWarningFill from '~icons/ri/error-warning-fill'

const props = defineProps<{
  orderNumber?: string
}>()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const store = usePaymentStore()
const mstStore = useMstStore()
const route = useRoute()
const { t } = useMstI18n()

const isLoading = ref(false)

const orderId = computed(() => {
  if (props.orderNumber) return props.orderNumber
  const param = route?.params?.order_number
  return (
    (Array.isArray(param) ? param[0] : param) ||
    store.orderNumber ||
    mstStore.orderNumber
  )
})

const formattedPrice = computed(() => formatCurrency(store.price))

const orderNumber = computed(() => orderId.value || '—')

onMounted(async () => {

  const id = orderId.value
  if (!id) return

  isLoading.value = true
  try {
    if (!store.price) {
      const response = await paymentApi.getPayableOrder(id)
      const data = normalizeResponse<MstOrder>(response)
      if (data) store.setOrder(data)
    }
    await paymentApi.createKaspiPayment(id)

  } catch (e) {
    console.error('Failed to create Kaspi payment:', e)
  } finally {
    isLoading.value = false
    sessionStorage.clear()
  }
})

const goBack = () => emit('back')
</script>

<template>
  <div class="w-full space-y-4">
    <div class="w-full space-y-4">
      <!-- Order Status Card -->
      <div class="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-sm">
        <button
          @click="goBack"
          class="flex items-center gap-2 text-[#FF4713] font-medium mb-4 lg:mb-6 hover:opacity-80 transition-opacity text-sm lg:text-base cursor-pointer"
        >
          <ri-arrow-left-line class="text-xl lg:text-2xl" />
          {{ t.payment.backToMain }}
        </button>

        <div class="flex justify-between items-center mb-4">
          <span class="text-xs lg:text-base text-gray-500 font-medium">{{
            t.payment.orderStatus
          }}</span>
          <span class="font-bold text-sm lg:text-lg">№{{ orderNumber }}</span>
        </div>

        <div class="text-3xl lg:text-5xl font-bold mb-4 lg:mb-8">
          {{ formattedPrice }}
        </div>

        <div
          class="space-y-3 lg:space-y-4 border-t border-gray-100 pt-4 lg:pt-6"
        >
          <div
            class="grid grid-cols-[100px_1fr] lg:grid-cols-[120px_1fr] items-center"
          >
            <span class="text-xs lg:text-base text-gray-500">{{
              t.payment.serviceFee
            }}</span>
            <span class="text-sm lg:text-base font-bold">0 ₸</span>
          </div>
          <div
            class="grid grid-cols-[100px_1fr] lg:grid-cols-[120px_1fr] items-center"
          >
            <span class="text-xs lg:text-base text-gray-500">{{
              t.payment.seller
            }}</span>
            <span class="text-sm lg:text-base font-bold">Nomad.kz</span>
          </div>
        </div>
      </div>

      <!-- Instruction Card -->
      <div class="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-8 shadow-sm">
        <div class="flex items-start gap-4 lg:gap-6 mb-4 lg:mb-6">
          <div
            class="w-12 h-12 lg:w-16 lg:h-16 rounded-full overflow-hidden flex-shrink-0"
          >
            <img
              src="./assets/icons/kaspi.png"
              alt="Kaspi"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3
              class="text-base lg:text-xl font-bold mb-2 lg:mb-3"
              v-html="t.payment.kaspiInvoiceSent"
            ></h3>
            <p
              class="text-gray-500 leading-relaxed text-xs lg:text-sm"
              v-html="t.payment.kaspiInvoiceDesc"
            ></p>
          </div>
        </div>

        <div
          class="bg-gray-50 rounded-xl p-4 lg:p-6 flex gap-3 lg:gap-4 items-start"
        >
          <ri-error-warning-fill
            class="text-lg lg:text-xl text-[#FF4713] mt-0.5"
          />
          <div class="text-xs lg:text-sm">
            <span class="font-bold block mb-1 lg:mb-2 text-sm lg:text-base">{{
              t.payment.attention
            }}</span>
            <span
              class="text-gray-500 leading-relaxed"
              v-html="t.payment.successInfo"
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
