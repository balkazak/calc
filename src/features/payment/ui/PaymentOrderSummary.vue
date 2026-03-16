<script setup lang="ts">
import { usePaymentStore } from '../model/payment.store'
import { computed } from 'vue'
import { getDiffInDays } from '@/shared/utils/date'
import { useMstI18n } from '../../mst-calculator/model/composables/useMstI18n'
import { pluralize } from '@/shared/utils/format'

const store = usePaymentStore()
const { t } = useMstI18n()

defineProps<{
  orderId: string | number
}>()

const daysCount = computed(() => {
  const start = store.finalOrder?.period?.start_at
  const end = store.finalOrder?.period?.end_at
  if (!start || !end) return 1
  return getDiffInDays(start, end)
})

const daysLabel = computed(() => {
  return pluralize(
    daysCount.value,
    t.value.step1.pluralizeDays as [string, string, string]
  )
})

const productName = computed(() => store.finalOrder?.product?.name)
</script>

<template>
  <div class="space-y-5">
    <div class="grid grid-cols-1 items-baseline gap-2 sm:grid-cols-[200px_1fr]">
      <div class="text-sm font-medium text-secondary-text text-gray-500">
        {{ t.payment.orderNumber }}
      </div>
      <div class="text-sm font-semibold">{{ orderId }}</div>
    </div>
    <div class="grid grid-cols-1 items-baseline gap-2 sm:grid-cols-[200px_1fr]">
      <div class="text-sm font-medium text-secondary-text text-gray-500">
        {{ t.payment.product }}
      </div>
      <div class="text-sm font-semibold">{{ productName }}</div>
    </div>
    <div class="grid grid-cols-1 items-baseline gap-2 sm:grid-cols-[200px_1fr]">
      <div class="text-sm font-medium text-secondary-text text-gray-500">
        {{ t.payment.duration }}
      </div>
      <div class="text-sm font-semibold">{{ daysLabel }}</div>
    </div>
  </div>
</template>
