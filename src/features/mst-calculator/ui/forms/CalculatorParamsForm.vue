<script setup lang="ts">
import { useMstStore } from '../../model/store/mst.store'
import { useStep1Logic } from '../../model/composables/useMstTripParams'
import { startOfTomorrow } from 'date-fns'
import {
  NButton,
  NSelect,
  NDatePicker,
  NCheckbox,
  NMultiselect,
} from 'nomad-ui'
import TravelersSelector from '../components/TravelersSelector.vue'
import ActiveRestModal from '../modals/ActiveRestModal.vue'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiUploadCloud2Fill from '~icons/ri/upload-cloud-2-fill'
import { ref, computed } from 'vue'

const isActiveRestModalOpen = ref(false)
const fileError = ref('')

const store = useMstStore()
const { t } = useMstI18n()
const minDateValue = startOfTomorrow()
const {
  countryOptions,
  sumOptions,
  purposeOptions,
  sportTypeOptions,
  occupationDegreeOptions,
  activeRest,
  covidCoverage,
  sportType,
  occupationDegree,
  covidCoverageOptions,
  selectedCovidCoverage,
  updateCountry,
  updateAmount,
  updatePurpose,
  updateDates,
  updateTourists,
} = useStep1Logic()

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const isValidFile = (file: File) => {
  const validTypes = ['image/jpeg', 'application/pdf']
  const validExtensions = /\.(jpg|jpeg|pdf)$/i
  return validTypes.includes(file.type) || validExtensions.test(file.name)
}

const handleFileChange = (event: Event) => {
  fileError.value = ''
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    if (isValidFile(file)) {
      store.updateParams({ studentDoc: file })
    } else {
      fileError.value = t.value.validation.invalidFileType
    }
  }
}

const handleDrop = (event: DragEvent) => {
  fileError.value = ''
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    const file = event.dataTransfer.files[0]
    if (isValidFile(file)) {
      store.updateParams({ studentDoc: file })
    } else {
      fileError.value = t.value.validation.invalidFileType
    }
  }
}

const removeFile = () => {
  store.updateParams({ studentDoc: null })
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const amountDropdownHeader = computed(() => {
  return store.params.country.length === 0
    ? t.value.step1.pleaseSelectCountry
    : t.value.step1.selectOption
})
</script>

<template>
  <div class="space-y-5">
    <h3 class="text-xl font-bold text-gray-800 hidden md:block">
      {{ t.step1.title }}
    </h3>

    <div class="space-y-5">
      <!-- Country -->
      <div class="space-y-2">
        <NMultiselect
          :modelValue="store.params.country"
          @update:modelValue="updateCountry"
          :options="countryOptions"
          :placeholder="t.step1.countryPlaceholder"
          :label="t.step1.country"
          track-by="value"
          :class="{
            '!border-red-500 !ring-red-500': store.step1Errors.country,
          }"
        />
        <span
          v-if="store.step1Errors.country"
          class="text-xs text-red-500 pl-1"
          >{{ store.step1Errors.country }}</span
        >
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Sum -->
        <div class="space-y-2">
          <NSelect
            :modelValue="store.params.amount"
            @update:modelValue="updateAmount"
            :options="sumOptions"
            :label="t.step1.sum"
            :placeholder="t.step1.sumPlaceholder"
            :dropdown-header="amountDropdownHeader"
            :class="{
              '!border-red-500 !ring-red-500': store.step1Errors.amount,
            }"
          />
          <span
            v-if="store.step1Errors.amount"
            class="text-xs text-red-500 pl-1"
            >{{ store.step1Errors.amount }}</span
          >
        </div>

        <!-- Dates -->
        <div class="space-y-2">
          <NDatePicker
            :modelValue="store.params.dates"
            @update:modelValue="updateDates"
            range
            :placeholder="t.step1.datesPlaceholder"
            :label="t.step1.dates"
            :min-date="minDateValue"
            :class="{
              '!border-red-500 !ring-red-500': store.step1Errors.dates,
            }"
          />
          <span
            v-if="store.step1Errors.dates"
            class="text-xs text-red-500 pl-1"
            >{{ store.step1Errors.dates }}</span
          >
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Purpose -->
        <div class="space-y-2">
          <NSelect
            :modelValue="store.params.purpose"
            @update:modelValue="updatePurpose"
            :options="purposeOptions"
            :label="t.step1.purpose"
            :dropdown-header="t.step1.selectOption"
            :class="{
              '!border-red-500 !ring-red-500': store.step1Errors.purpose,
            }"
          />
          <span
            v-if="store.step1Errors.purpose"
            class="text-xs text-red-500 pl-1"
            >{{ store.step1Errors.purpose }}</span
          >
        </div>

        <!-- Tourists -->
        <div class="space-y-2">
          <label class="block text-sm font-medium">{{
            t.step1.tourists
          }}</label>
          <div
            :class="{
              'border border-red-500 rounded-xl':
                store.step1Errors.touristsInfo,
            }"
          >
            <TravelersSelector
              :modelValue="store.params.touristsInfo"
              @update:modelValue="updateTourists"
            />
          </div>
          <span
            v-if="store.step1Errors.touristsInfo"
            class="text-xs text-red-500 pl-1"
            >{{ store.step1Errors.touristsInfo }}</span
          >
        </div>
      </div>

      <!-- Conditional Fields for Sport -->
      <div
        v-if="store.params.purpose === 'sport'"
        class="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div class="space-y-2">
          <NSelect
            v-model="sportType"
            :options="sportTypeOptions"
            :label="t.step1.sportType"
            :placeholder="t.step1.selectOption"
          />
        </div>
        <div class="space-y-2">
          <NSelect
            v-model="occupationDegree"
            :options="occupationDegreeOptions"
            :label="t.step1.occupation"
            :placeholder="t.step1.selectOption"
          />
        </div>
      </div>

      <!-- Conditional Fields for Students -->
      <div v-if="store.params.purpose === 'student'" class="w-full">
        <div
          class="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-100 transition-colors cursor-pointer"
          @click="triggerFileUpload"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept=".jpg,.jpeg,.pdf"
            @change="handleFileChange"
          />

          <div v-if="!store.params.studentDoc">
            <div
              class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shadow-sm mb-4 mx-auto text-2xl text-gray-400"
            >
              <ri-upload-cloud-2-fill />
            </div>
            <h4 class="text-sm font-semibold mb-1">
              {{ t.step1.studentDoc }}
            </h4>
            <p class="text-xs mb-4">JPEG и PDF • Max. 20MB</p>
            <button class="text-main-500 font-medium text-sm hover:underline">
              {{ t.step1.uploadDoc }}
            </button>
          </div>

          <div v-else class="flex flex-col items-center">
            <div
              class="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500 text-2xl"
            >
              ✓
            </div>
            <p class="text-gray-900 font-medium break-all">
              {{ store.params.studentDoc.name }}
            </p>
            <button
              class="text-red-500 text-sm hover:underline mt-2"
              @click.stop="removeFile"
            >
              {{ t.step1.removeDoc }}
            </button>
          </div>
        </div>
        <div v-if="fileError" class="text-xs text-red-500 mt-2 text-center">
          {{ fileError }}
        </div>
      </div>

      <!-- Checkboxes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-0">
        <NCheckbox v-model="activeRest" :label="t.step1.activeRest">
          <template #description>
            <span
              class="text-main-500 hover:underline cursor-pointer"
              @click.stop="isActiveRestModalOpen = true"
            >
              {{ t.common.more }}
            </span>
          </template>
        </NCheckbox>
        <NCheckbox v-model="covidCoverage" :label="t.step1.covid" />

        <div class="hidden md:block"></div>

        <div v-if="covidCoverage" class="space-y-2">
          <NSelect
            v-model="selectedCovidCoverage"
            :options="covidCoverageOptions"
            :label="t.step1.covidSum"
            :placeholder="t.step1.selectOption"
          />
        </div>
      </div>

      <!-- Button -->
      <div class="pt-4 hidden lg:block">
        <NButton @click="store.nextStep()" :label="t.common.buy" />
      </div>
    </div>

    <ActiveRestModal v-model:open="isActiveRestModalOpen" />
  </div>
</template>
