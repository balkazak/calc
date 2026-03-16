<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { NButton, NInput } from 'nomad-ui'
import { vMaska } from 'maska/vue'
import type { TouristManualData, TouristKdpData } from '../../model/mst.types'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiCloseFill from '~icons/ri/close-fill'
import RiLink from '~icons/ri/link'

const props = defineProps<{
  open: boolean
  initialIin?: string
  hideTabs?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'submit-manual', data: TouristManualData): void
  (e: 'submit-kdp', data: TouristKdpData): void
}>()

const { t } = useMstI18n()
const activeTab = ref<'manual' | 'kdp'>('manual')

const manualForm = ref({
  firstNameLat: '',
  lastNameLat: '',
  firstName: '',
  lastName: '',
  passportNumber: '',
  passportIssueDate: '',
})

const kdpForm = ref({
  iin: '',
  phone: '',
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      kdpForm.value.iin = props.initialIin || ''
      if (props.hideTabs) {
        activeTab.value = 'manual'
      }
    }
  }
)

const manualFormValid = computed(() => {
  return (
    manualForm.value.firstNameLat &&
    manualForm.value.lastNameLat &&
    manualForm.value.firstName &&
    manualForm.value.lastName &&
    manualForm.value.passportNumber &&
    manualForm.value.passportIssueDate
  )
})

const kdpFormValid = computed(() => {
  return kdpForm.value.iin.length === 12 && kdpForm.value.phone.length >= 17
})

const handleSubmit = () => {
  if (activeTab.value === 'manual') {
    emit('submit-manual', { ...manualForm.value })
  } else {
    emit('submit-kdp', { ...kdpForm.value })
  }
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4"
      >
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          @click="emit('update:open', false)"
        ></div>
        <div
          class="relative w-full lg:max-w-lg bg-white rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden transform transition-all p-6 sheet-content duration-300"
          @keydown.enter="
            (activeTab === 'manual' ? manualFormValid : kdpFormValid) &&
            handleSubmit()
          "
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-gray-900">
                {{ t.step2.clarificationTitle }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                {{ t.step2.clarificationDesc }}
              </p>
            </div>
            <button
              @click="emit('update:open', false)"
              class="text-gray-400 hover:text-gray-600"
            >
              <ri-close-fill class="text-2xl" />
            </button>
          </div>

          <div v-if="!hideTabs" class="flex bg-gray-100 p-1 rounded-xl mb-6">
            <button
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
              :class="
                activeTab === 'manual'
                  ? 'bg-main-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="activeTab = 'manual'"
            >
              {{ t.step2.tabManual }}
            </button>
            <button
              class="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
              :class="
                activeTab === 'kdp'
                  ? 'bg-main-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              "
              @click="activeTab = 'kdp'"
            >
              {{ t.step2.tabKdp }}
            </button>
          </div>

          <div
            v-if="activeTab === 'manual'"
            class="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
          >
            <NInput
              v-model="manualForm.firstNameLat"
              :label="t.step2.firstNameLat"
              :placeholder="t.step2.firstNameLatPlaceholder"
            />
            <NInput
              v-model="manualForm.lastNameLat"
              :label="t.step2.lastNameLat"
              :placeholder="t.step2.lastNameLatPlaceholder"
            />
            <NInput
              v-model="manualForm.firstName"
              :label="t.step2.firstNameRu"
              :placeholder="t.step2.firstNamePlaceholder"
            />
            <NInput
              v-model="manualForm.lastName"
              :label="t.step2.lastNameRu"
              :placeholder="t.step2.lastNamePlaceholder"
            />
            <NInput
              v-model="manualForm.passportNumber"
              :label="t.step2.passportNumber"
              :placeholder="t.step2.passportNumberPlaceholder"
            />
            <NInput
              v-model="manualForm.passportIssueDate"
              :label="t.step2.passportIssueDate"
              placeholder="ДД.ММ.ГГГГ"
              v-maska="'##.##.####'"
            />
          </div>

          <div v-if="activeTab === 'kdp'" class="space-y-4">
            <NInput
              v-model="kdpForm.iin"
              :label="t.step2.policyholderIinLabel"
              :placeholder="t.step2.iinPlaceholder"
              v-maska="'############'"
              type="tel"
              maxlength="12"
            />
            <NInput
              v-model="kdpForm.phone"
              :label="t.step2.phoneBmgLabel"
              type="tel"
              placeholder="+7 (___) ___ - __ - __"
              v-maska="'+7 (###) ###-##-##'"
            />

            <div
              class="flex items-center gap-2 text-sm font-medium text-blue-500"
            >
              <ri-link />
              <a href="#" class="hover:underline">{{
                t.step2.bmgInstruction
              }}</a>
            </div>
          </div>

          <div class="mt-6">
            <NButton
              class="w-full font-bold bg-main-500 hover:bg-main-600 text-white rounded-xl py-3"
              :disabled="
                activeTab === 'manual' ? !manualFormValid : !kdpFormValid
              "
              @click="handleSubmit"
              :label="t.step2.confirm"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

@media (max-width: 1023px) {
  .sheet-content {
    max-height: 85vh;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 24px);
  }
  .sheet-enter-active .sheet-content {
    animation: slideUp 0.3s ease-out;
  }
  .sheet-leave-active .sheet-content {
    animation: slideDown 0.3s ease-in;
  }
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
