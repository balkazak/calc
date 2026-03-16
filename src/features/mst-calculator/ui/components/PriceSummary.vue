<script setup lang="ts">
import { useMstStore } from '../../model/store/mst.store'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiLink from '~icons/ri/link'
import RiArrowUpSLine from '~icons/ri/arrow-up-s-line'
import RiArrowDownSLine from '~icons/ri/arrow-down-s-line'
import { computed, ref } from 'vue'
import Loader from './Loader.vue'

import { formatCurrency, pluralize } from '@/shared/utils/format'

const store = useMstStore()
const { t } = useMstI18n()

const props = defineProps<{
  onlyDetails?: boolean
  lang?: 'ru' | 'kk' | 'en'
}>()

const price = computed(() => store.price)
const showDetails = ref(props.onlyDetails || false)
</script>

<template>
  <div class="p-0 lg:p-6">
    <div v-if="!onlyDetails" class="mb-6">
      <p class="text-sm font-medium text-subtitle mb-1">
        {{ t.summary.preliminaryPrefix }}
        {{
          pluralize(store.params.touristsInfo.length, t.step1.pluralizePeople)
        }}
        {{ t.summary.preliminarySuffix }}
      </p>
      <div v-if="store.isPriceLoading" class="flex items-center h-10">
        <Loader class="h-8 w-8" />
      </div>
      <h2 v-else class="text-4xl font-bold text-main-500">
        {{ formatCurrency(price) }}
      </h2>
    </div>

    <a
      v-if="!onlyDetails"
      href="https://nomad.kz/ru/insurance-rules?rule=mst"
      class="text-secondary-500 text-sm font-medium mb-6 flex items-center"
      target="_blank"
    >
      <ri-link class="mr-2" />
      <span class="hover:underline">{{ t.common.rules }}</span>
    </a>

    <div class="space-y-4">
      <h3 class="font-semibold text-title">
        {{ t.step1.coverageTitle }}
      </h3>
      <p class="text-sm text-subtitle">
        {{ t.step1.coverageDesc }}
      </p>
      <div
        class="grid transition-all duration-300 ease-in-out"
        :class="
          showDetails
            ? 'grid-rows-[1fr] opacity-100'
            : 'grid-rows-[0fr] opacity-0 mb-0'
        "
      >
        <div class="overflow-hidden space-y-4">
          <p class="text-sm text-subtitle">
            {{ t.step1.coverageHint1 }}
          </p>
          <p class="text-sm text-subtitle">
            {{ t.step1.coverageHint2 }}
          </p>
        </div>
      </div>

      <button
        @click="showDetails = !showDetails"
        class="text-main-500 text-sm font-medium cursor-pointer flex items-center"
      >
        {{ showDetails ? t.common.hide : t.common.more }}
        <component
          :is="showDetails ? RiArrowUpSLine : RiArrowDownSLine"
          class="ml-1"
        />
      </button>
    </div>

    <!-- Icons grid - mocking with simple text/emojis for now as I don't have the svgs -->
    <div class="grid grid-cols-2 gap-3 mt-5">
      <div class="rounded-lg bg-graybg p-3">
        <div class="text-sm leading-tight font-semibold">
          <img
            src="../assets/icons/ambulance.png"
            alt="ambulance"
            class="mb-3 h-8 w-8 object-contain"
          />
          {{ t.step1.emergencyHelp }}
        </div>
      </div>
      <div class="rounded-lg bg-graybg p-3">
        <div class="text-sm leading-tight font-semibold">
          <img
            src="../assets/icons/tooth.png"
            alt="tooth"
            class="mb-3 h-8 w-8 object-contain"
          />
          {{ t.step1.dentalCare }}
        </div>
      </div>
      <div class="rounded-lg bg-graybg p-3">
        <div class="text-sm leading-tight font-semibold">
          <img
            src="../assets/icons/hospital.png"
            alt="hospital"
            class="mb-3 h-8 w-8 object-contain"
          />
          {{ t.step1.outpatient }}
        </div>
      </div>
      <div class="rounded-lg bg-graybg p-3">
        <div class="text-sm leading-tight font-semibold">
          <img
            src="../assets/icons/siren.png"
            alt="siren"
            class="mb-3 h-8 w-8 object-contain"
          />
          {{ t.step1.evacuation }}
        </div>
      </div>
    </div>
  </div>
</template>
