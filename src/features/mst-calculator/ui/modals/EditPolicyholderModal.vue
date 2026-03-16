<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useMstStore } from '../../model/store/mst.store'
import { NButton, NInput, NCheckbox, NToggle } from 'nomad-ui'
import { vMaska } from 'maska/vue'
import type { PolicyholderFormData, MstClientData } from '../../model/mst.types'
import { useMstI18n } from '../../model/composables/useMstI18n'
import { useMstTouristActions } from '../../model/store/tourist/tourist.actions'
import RiCloseFill from '~icons/ri/close-fill'

const props = defineProps<{
  open: boolean
  initialData: PolicyholderFormData
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', data: PolicyholderFormData): void
}>()

const store = useMstStore()
const { searchAndSetPolicyholder } = useMstTouristActions()
const { t } = useMstI18n()

const form = ref({
  isTourist: false,
  iin: '',
  agreement: false,
})

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      form.value = { ...props.initialData }
    }
  }
)

const lastSearchResult = ref<MstClientData | null>(null)

watch(
  () => form.value.iin,
  async (val) => {
    if (val && val.length === 12 && val !== props.initialData.iin) {
      store.isPolicyholderSearchLoading = true
      lastSearchResult.value = null
      try {
        const response = await searchAndSetPolicyholder(val)
        if (response && response.data) {
          lastSearchResult.value = response.data
        }
      } catch (e) {
        console.error('Failed to search client in modal', e)
      } finally {
        store.isPolicyholderSearchLoading = false
      }
    }
  }
)

watch(
  () => form.value.isTourist,
  async (val) => {
    if (val) {
      if (store.policyHolderInfo && store.params.touristsInfo.length > 0) {
        const tourist = store.params.touristsInfo[0]
        if (tourist) {
          tourist.firstName = store.policyHolderInfo.firstName
          tourist.lastName = store.policyHolderInfo.lastName
          if (!tourist.iin) tourist.iin = form.value.iin
          if (store.policyHolderClientId) {
            tourist.clientId = store.policyHolderClientId
          }
        }
      }
    }
  }
)

const isValid = computed(() => {
  return (
    form.value.iin &&
    form.value.iin.length === 12 &&
    form.value.agreement &&
    !store.isPolicyholderSearchLoading
  )
})

const handleSave = () => {
  emit('save', form.value)
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4"
      >
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          @click="emit('update:open', false)"
        ></div>
        <div
          class="relative w-full lg:max-w-lg bg-white rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden transform transition-all p-8 sheet-content lg:animate-none duration-300"
          @keydown.enter="isValid && handleSave()"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              {{ t.step2.editPolicyholder }}
            </h3>
            <button
              @click="emit('update:open', false)"
              class="text-gray-400 hover:text-gray-600"
            >
              <ri-close-fill class="text-2xl" />
            </button>
          </div>

          <div class="space-y-5">
            <p class="text-sm text-gray-500 -mt-4">
              {{ t.step2.titleInput }}
            </p>

            <NToggle
              v-model="form.isTourist"
              color="#FF4713"
              width="40px"
              height="22px"
              :label="t.step2.isTouristLabel"
              :description="t.step2.isTouristDesc"
            />

            <div class="space-y-4">
              <div class="relative">
                <NInput
                  v-model="form.iin"
                  v-maska="'############'"
                  type="tel"
                  maxlength="12"
                  :placeholder="t.step2.iinPlaceholder"
                  :label="t.step2.policyholderIinLabel"
                />
                <div
                  v-if="store.isPolicyholderSearchLoading"
                  class="absolute right-3 top-[55%]"
                >
                  <div
                    class="w-5 h-5 border-2 border-gray-200 border-t-main-500 rounded-full animate-spin"
                  ></div>
                </div>
              </div>
            </div>
            <div class="text-sm text-gray-500" v-html="t.step2.smsInfo"></div>

            <NCheckbox v-model="form.agreement">
              <template #label>
                <span
                  class="text-sm leading-none font-medium"
                  v-html="t.step2.personalDataAgreement"
                ></span>
              </template>
            </NCheckbox>

            <NButton
              class="w-full font-bold bg-main-500 hover:bg-main-600 text-white rounded-xl py-3"
              :disabled="!isValid"
              @click="handleSave"
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
