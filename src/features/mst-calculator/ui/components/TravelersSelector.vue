<script setup lang="ts">
import { useMstStore } from '../../model/store/mst.store'
import { NSelect } from 'nomad-ui'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiArrowDownSLine from '~icons/ri/arrow-down-s-line'
import RiDeleteBinLine from '~icons/ri/delete-bin-line'
import RiAddLine from '~icons/ri/add-line'
import { computed, ref } from 'vue'

const store = useMstStore()
const { t } = useMstI18n()

interface TouristItem {
  id: number
  age: string
}

interface OptionItem {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue: TouristItem[]
    maxTravelers?: number
  }>(),
  {
    maxTravelers: 5,
  }
)

const emit = defineEmits(['update:modelValue', 'recalc'])

const showTravelersEditor = ref(false)

const ageCategories = computed(() => {
  return (
    store.dictionaries.ages?.map((age) => ({
      label: age.label,
      value: age.value.toString(),
    })) || []
  )
})

function updateTravelerAge(idx: number, ageVal: string | OptionItem) {
  const age =
    ageVal && typeof ageVal === 'object' && 'value' in ageVal
      ? ageVal.value
      : (ageVal as string)

  const newTravelers = [...props.modelValue]
  if (newTravelers[idx]) {
    newTravelers[idx] = { ...newTravelers[idx], age }
    emit('update:modelValue', newTravelers)
    emit('recalc')
  }
}

function addTravelerRow() {
  if (props.modelValue.length < props.maxTravelers) {
    const defaultAge = ageCategories.value.find(
      (a) => a.value === 'adult'
    )?.value
    const age = defaultAge || ageCategories.value[0]?.value || ''

    const newTravelers = [...props.modelValue, { id: Date.now(), age }]
    emit('update:modelValue', newTravelers)
    emit('recalc')
  }
}

function removeTravelerRow(idx: number) {
  if (props.modelValue.length > 1) {
    const newTravelers = [...props.modelValue]
    newTravelers.splice(idx, 1)
    emit('update:modelValue', newTravelers)
    emit('recalc')
  }
}

function pluralize(count: number, words: [string, string, string]) {
  const cases = [2, 0, 1, 1, 1, 2]
  const index =
    count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]
  return count + ' ' + words[index as 0 | 1 | 2]
}

const travelersLabel = computed(() => {
  return pluralize(
    props.modelValue.length,
    t.value.step1.pluralizePeople as [string, string, string]
  )
})
</script>

<template>
  <div class="relative">
    <div
      class="flex w-full cursor-pointer items-center justify-between rounded-lg bg-graybg px-4 py-2.5 transition-all"
      @click="showTravelersEditor = !showTravelersEditor"
    >
      <div class="flex flex-wrap gap-2">
        <template v-if="modelValue.length">
          <span class="font-medium">
            {{ travelersLabel }}
          </span>
        </template>
        <span v-else class="text-[#6B788E]">{{
          t.step1.touristsPlaceholder
        }}</span>
      </div>

      <span
        class="text-[#6B788E] transition-transform duration-200 text-xl flex items-center"
        :class="{ 'rotate-180': showTravelersEditor }"
      >
        <ri-arrow-down-s-line />
      </span>
    </div>

    <div
      v-if="showTravelersEditor"
      class="absolute top-full left-0 z-50 mt-2 w-full space-y-3 rounded-xl border border-[#EDF2F7] bg-white p-4 shadow-lg"
    >
      <div class="mb-2 text-xs font-medium text-gray-500">
        {{ t.step1.touristsAge }}
      </div>

      <div class="space-y-3">
        <div
          v-for="(tourist, idx) in modelValue"
          :key="tourist.id || idx"
          class="flex items-center gap-3"
        >
          <div class="w-[70px] font-medium whitespace-nowrap text-sm">
            {{ t.step1.tourist }} {{ Number(idx) + 1 }}
          </div>

          <div class="min-w-0 flex-grow">
            <NSelect
              :modelValue="tourist.age"
              @update:modelValue="
                (val: string | OptionItem) =>
                  updateTravelerAge(Number(idx), val)
              "
              :options="ageCategories"
              :placeholder="t.step1.agePlaceholder"
              label=""
            />
          </div>

          <div class="shrink-0">
            <button
              v-if="
                idx !== modelValue.length - 1 ||
                modelValue.length >= maxTravelers
              "
              type="button"
              class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#F5F7F9] p-0 hover:bg-[#E2E8F0] transition-colors"
              :disabled="modelValue.length <= 1"
              @click="removeTravelerRow(Number(idx))"
            >
              <ri-delete-bin-line class="text-lg text-gray-500" />
            </button>

            <button
              v-else
              type="button"
              class="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-none bg-main-500 p-0 hover:bg-main-600 transition-colors"
              @click="addTravelerRow"
            >
              <ri-add-line class="text-xl text-white" />
            </button>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          class="cursor-pointer font-bold text-main-500 hover:text-main-600 hover:underline bg-transparent border-none text-sm"
          @click="showTravelersEditor = false"
        >
          {{ t.common.ready }}
        </button>
      </div>
    </div>
  </div>
</template>
