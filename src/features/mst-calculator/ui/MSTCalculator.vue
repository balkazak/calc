<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMstStore } from '../model/store/mst.store'
import PriceSummary from './components/PriceSummary.vue'
import Loader from './components/Loader.vue'
import { NButton } from 'nomad-ui'
import { Step1, Step2 } from './steps'
import { PaymentView } from '@/features/payment'
import { useMstSummary } from '../model/composables/useMstSummary'
import { formatCurrency, pluralize } from '@/shared/utils/format'

import { useMstI18n } from '../model/composables/useMstI18n'
import { useMstOrderActions } from '../model/store/order/order.actions'
import { useToast } from 'vue-toastification'
import RiArrowLeftLine from '~icons/ri/arrow-left-line'
import RiLink from '~icons/ri/link'
import RiCloseLine from '~icons/ri/close-line'

const props = defineProps<{
  isCabinet?: boolean
  isMock?: boolean
  lang?: 'ru' | 'kk' | 'en'
  step?: number
  orderNumber?: string
}>()

const emit = defineEmits<{
  (e: 'update:step', val: number): void
  (e: 'update:orderNumber', val: string): void
}>()

const store = useMstStore()
const { t } = useMstI18n()

// Update store language when prop changes
watch(
  () => props.lang,
  (newLang) => {
    if (newLang) {
      store.setLang(newLang)
    }
  },
  { immediate: true }
)

const { stepSummary } = useMstSummary()
const steps = [Step1, Step2, PaymentView]
const route = useRoute()

const initOrderFromRoute = () => {
  const qPayment = route?.query?.payment as string
  const qOrder = (route?.query?.order || route?.query?.order_number) as string

  const searchParams = new URLSearchParams(window.location.search)
  const pPayment = searchParams.get('payment')
  const pOrder = searchParams.get('order') || searchParams.get('order_number')

  const orderNo = [qPayment, qOrder, pPayment, pOrder].find(
    (val) => val && val !== 'true'
  )
  const isPaymentMode = qPayment !== undefined || searchParams.has('payment')

  if (orderNo || isPaymentMode) {
    if (orderNo) store.orderNumber = orderNo
    store.setStep(3)
  }
}

const handleStepClick = (step: number) => {
  if (store.step === 3) return
  store.setStep(step)
}

const handleBack = () => {
  if (store.step === 3) return
  if (store.step > 1) {
    store.prevStep()
  } else {
    window.history.back()
  }
}

const handlePopState = () => {
  if (store.step === 3) store.clearSession()
}

// Initialize state immediately to avoid step flickers and unnecessary API calls
store.loadStateFromSession()
initOrderFromRoute()

onMounted(() => {
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

watch(
  () => store.step,
  (val) => emit('update:step', val)
)

watch(
  () => store.orderNumber,
  (val) => {
    if (val !== undefined) emit('update:orderNumber', String(val))
  }
)

watch(
  [() => store.step, () => store.params, () => store.orderNumber],
  () => store.saveStateToSession(),
  { deep: true }
)

watch(
  () => props.step,
  (newStep) => {
    if (newStep && newStep !== store.step) store.step = newStep
  },
  { immediate: true }
)

watch(
  () => props.orderNumber,
  (newOrder) => {
    if (newOrder && newOrder !== store.orderNumber) store.orderNumber = newOrder
  },
  { immediate: true }
)

const showMobileDetails = ref(false)

const isNextButtonDisabled = computed(() => {
  if (store.step === 1) return false
  if (store.step === 2) return !store.isStep2Valid
  return false
})

const { calculateFinalPrice, createOrder } = useMstOrderActions()
const toast = useToast()
const isProcessingStep2 = ref(false)

const handleNextStep = async () => {
  if (store.step === 1) {
    store.nextStep()
    return
  }

  if (store.step === 2) {
    if (!store.isStep2Valid) return

    isProcessingStep2.value = true
    try {
      await calculateFinalPrice()
      await createOrder()
      if (store.orderNumber) {
        store.setStep(3)
      } else {
        toast.error(t.value.validation.orderNumberError)
      }
    } catch (e) {
      console.error(e)
      toast.error(t.value.validation.orderCreateError)
    } finally {
      isProcessingStep2.value = false
    }
  }
}
</script>

<template>
  <div class="w-full bg-white rounded-3xl lg:min-h-[700px]">
    <div class="mst-calculator w-full h-full bg-transparent">
      <div class="flex flex-col lg:flex-row h-full transition-all duration-300">
        <div class="transition-all duration-300 flex-1 lg:p-8 lg:w-[57%]">
          <div class="w-full">
            <div
              v-if="store.step !== 3"
              class="flex items-center justify-between mb-8 hidden lg:flex"
            >
              <h2 class="text-sm font-medium">
                {{ t.common.step }} {{ store.step }} {{ t.common.of }} 3
              </h2>
              <div class="flex gap-2">
                <div
                  v-for="(_, index) in steps"
                  :key="index"
                  class="h-2 w-8 rounded-full transition-colors"
                  :class="[
                    index + 1 <= store.step
                      ? 'bg-main-500'
                      : 'bg-gray-200 hover:bg-gray-300',
                    store.step === 3
                      ? 'cursor-default opacity-80'
                      : 'cursor-pointer',
                  ]"
                  @click="handleStepClick(index + 1)"
                ></div>
              </div>
            </div>

            <!-- Mobile Header Card -->
            <div
              class="lg:hidden bg-white rounded-2xl p-4 pb-0"
              v-if="store.step !== 3"
            >
              <div
                class="flex items-center gap-2 text-main-500 font-medium mb-4 cursor-pointer"
                @click="handleBack"
              >
                <ri-arrow-left-line />
                <span>{{ t.common.back }}</span>
              </div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">
                  {{ t.common.step }} {{ store.step }} {{ t.common.of }} 3
                </span>
                <div class="flex gap-1.5">
                  <div
                    v-for="(_, index) in steps"
                    :key="index"
                    class="h-1.5 w-6 rounded-full transition-colors"
                    :class="
                      index + 1 <= store.step ? 'bg-main-500' : 'bg-gray-200'
                    "
                  ></div>
                </div>
              </div>
              <h1 class="text-xl font-bold text-gray-900">
                {{
                  store.step === 1
                    ? t.step1.mobileTitle
                    : store.step === 2
                      ? t.step2.title
                      : t.step3.title
                }}
              </h1>

              <div v-if="stepSummary" class="mt-4 text-sm text-gray-600">
                <p class="font-medium text-gray-900">{{ stepSummary.line1 }}</p>
                <p>{{ stepSummary.line2 }} •</p>
                <p>{{ stepSummary.line3 }}</p>
              </div>
            </div>

            <div
              class="transition-all lg:bg-transparent lg:rounded-none lg:p-0"
              :class="{
                'bg-white rounded-2xl p-4 pb-0': store.step !== 3,
              }"
            >
              <component
                :is="steps[store.step - 1]"
                :is-cabinet="isCabinet"
                :is-mock="isMock"
              />
            </div>

            <!-- Mobile Footer Card -->
            <div v-if="store.step !== 3" class="lg:hidden mt-auto pt-0">
              <div class="bg-white rounded-2xl p-4 p; space-y-4">
                <div
                  class="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                  @click="showMobileDetails = true"
                >
                  <div class="flex-shrink-0">
                    <img
                      src="./assets/icons/shield.png"
                      alt="shield"
                      class="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <p
                      class="text-sm font-bold text-gray-900 leading-tight mb-1"
                    >
                      {{ t.step1.coverageTitle }}
                    </p>
                    <span
                      class="text-xs font-medium text-main-500 hover:underline"
                    >
                      {{ t.common.more }}
                    </span>
                  </div>
                </div>

                <a
                  href="https://nomad.kz/ru/insurance-rules?rule=mst"
                  class="flex items-center text-blue-500 text-sm font-medium"
                  target="_blank"
                >
                  <ri-link class="mr-2 text-lg" />
                  <span class="hover:underline">{{ t.common.rules }}</span>
                </a>

                <div>
                  <p class="text-xs text-gray-500 mb-1">
                    {{ t.summary.preliminaryPrefix }}
                    {{
                      pluralize(
                        store.params.touristsInfo.length,
                        t.step1.pluralizePeople
                      )
                    }}
                    {{ t.summary.preliminarySuffix }}
                  </p>
                  <div
                    v-if="store.isPriceLoading"
                    class="flex items-center h-9"
                  >
                    <Loader class="h-7 w-7" />
                  </div>
                  <h2 v-else class="text-3xl font-bold text-main-500">
                    {{ formatCurrency(store.price) }}
                  </h2>
                </div>
                <NButton
                  class="h-[44px] bg-main-500 hover:bg-main-600 rounded-xl"
                  :disabled="isNextButtonDisabled"
                  :loading="isProcessingStep2"
                  @click="handleNextStep"
                >
                  {{ store.step === 1 ? t.common.buy : t.common.policy }}
                </NButton>
                <p v-if="store.step === 2" class="text-xs text-center">
                  Нажимая кнопку «Оформить полис», вы утверждаете что
                  ознакомлены с
                  <span class="text-secondary-500">правилами страхования</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="store.step !== 3"
          class="hidden lg:block lg:w-[43%] bg-white rounded-2xl"
        >
          <PriceSummary :lang="props.lang" />
        </div>
      </div>

      <!-- Mobile Details Modal -->
      <Teleport to="body">
        <Transition name="sheet">
          <div
            v-if="showMobileDetails"
            class="fixed inset-0 z-[60] lg:hidden flex items-end justify-center"
          >
            <div
              class="fixed inset-0 bg-black/50 transition-opacity"
              @click="showMobileDetails = false"
            ></div>
            <div
              class="relative w-full bg-white rounded-t-2xl shadow-xl transform transition-transform sheet-content max-h-[90vh] overflow-y-auto"
            >
              <div class="p-4">
                <div class="flex justify-end mb-2">
                  <button
                    @click="showMobileDetails = false"
                    class="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500"
                  >
                    <ri-close-line class="text-xl" />
                  </button>
                </div>
                <PriceSummary :only-details="true" :lang="props.lang" />
                <div class="mt-6">
                  <NButton
                    class="h-[44px]"
                    @click="showMobileDetails = false"
                    :label="t.common.understand"
                  />
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
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
