<script setup lang="ts">
import { usePaymentStore } from '../model/payment.store'
import kaspiPng from './assets/icons/kaspi.png'
import { useMstI18n } from '../../mst-calculator/model/composables/useMstI18n'
import RiBankCardFill from '~icons/ri/bank-card-fill'

const store = usePaymentStore()
const { t } = useMstI18n()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <!-- Card Payment -->
    <div
      class="relative flex h-[140px] cursor-pointer flex-col justify-between rounded-xl border p-6 transition-all duration-200"
      :class="
        store.paymentMethod === 'card'
          ? 'border-[#FF4713] bg-[#FFF7F5] ring-1 ring-[#FF4713]'
          : 'border-gray-200 bg-white hover:border-gray-300'
      "
      @click="store.paymentMethod = 'card'"
    >
      <div class="flex items-start justify-between">
        <div class="text-[#FF4713]">
          <ri-bank-card-fill class="text-3xl text-secondary-500" />
        </div>
        <div
          class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors"
          :class="
            store.paymentMethod === 'card'
              ? 'border-[#FF4713]'
              : 'border-gray-300'
          "
        >
          <div
            v-if="store.paymentMethod === 'card'"
            class="h-3 w-3 rounded-full bg-[#FF4713]"
          ></div>
        </div>
      </div>
      <div>
        <div class="text-sm font-bold">{{ t.payment.bankCard }}</div>
        <div class="text-xs font-medium text-secondary-text text-gray-500">
          {{ t.payment.bankCardDesc }}
        </div>
      </div>
    </div>

    <!-- Kaspi Payment -->
    <div
      class="relative flex h-[140px] cursor-pointer flex-col justify-between rounded-xl border p-6 transition-all duration-200"
      :class="
        store.paymentMethod === 'kaspi'
          ? 'border-[#FF4713] bg-[#FFF7F5] ring-1 ring-[#FF4713]'
          : 'border-gray-200 bg-white hover:border-gray-300'
      "
      @click="store.paymentMethod = 'kaspi'"
    >
      <div class="flex items-start justify-between">
        <div class="h-8 w-8">
          <img
            :src="kaspiPng"
            alt="Kaspi"
            class="h-full w-full object-contain"
          />
        </div>
        <div
          class="flex h-6 w-6 items-center justify-center rounded-full border transition-colors"
          :class="
            store.paymentMethod === 'kaspi'
              ? 'border-[#FF4713]'
              : 'border-gray-300'
          "
        >
          <div
            v-if="store.paymentMethod === 'kaspi'"
            class="h-3 w-3 rounded-full bg-[#FF4713]"
          ></div>
        </div>
      </div>
      <div>
        <div class="text-sm font-bold">{{ t.payment.kaspi }}</div>
        <div class="text-xs font-medium text-secondary-text text-gray-500">
          {{ t.payment.kaspiDesc }}
        </div>
      </div>
    </div>
  </div>
</template>
