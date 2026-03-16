<script setup lang="ts">
import { useMstStore } from '../../model/store/mst.store'
import { useMstTouristActions } from '../../model/store/tourist/tourist.actions'
import { useMstOrderActions } from '../../model/store/order/order.actions'
import { NButton, NInput } from 'nomad-ui'
import { vMaska } from 'maska/vue'
import { ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiShieldFill from '~icons/ri/shield-fill'
import RiEdit2Fill from '~icons/ri/edit-2-fill'
import RiUserFill from '~icons/ri/user-fill'
import RiDeleteBinFill from '~icons/ri/delete-bin-fill'
import RiAddLine from '~icons/ri/add-line'

const store = useMstStore()
const touristActions = useMstTouristActions()
const orderActions = useMstOrderActions()
const toast = useToast()
const { t } = useMstI18n()

const emit = defineEmits<{
  (e: 'edit-policyholder'): void
  (e: 'clarify-tourist', index: number, hideTabs?: boolean): void
}>()

const touristLoading = ref<Record<number, boolean>>({})

const handleTouristIinInput = async (val: string, index: number) => {
  if (!store.params.touristsInfo[index]) return
  store.params.touristsInfo[index].iin = val

  // Auto-unlink if IIN changed for the first tourist
  if (
    index === 0 &&
    store.params.isTourist &&
    val !== store.params.policyholderIin
  ) {
    store.params.isTourist = false
  }

  if (val.length === 12) {
    const isDuplicate = store.params.touristsInfo.some(
      (t, i) => i !== index && t.iin === val
    )
    if (isDuplicate) {
      toast.error(t.value.validation.touristDuplicate)
      store.params.touristsInfo[index].iin = ''
      return
    }

    // Link with policyholder if IIN matches
    if (val === store.params.policyholderIin && !store.params.isTourist) {
      store.params.isTourist = true
    }

    touristLoading.value = { ...touristLoading.value, [index]: true }
    try {
      const response = await touristActions.searchAndSetTourist(index, val)
      const clientData = response?.data

      if (
        !clientData ||
        !clientData.gbd_have ||
        clientData.document_found === false ||
        String(clientData.document_found) === 'false'
      ) {
        const isSkipTabs =
          clientData?.document_found === false ||
          String(clientData?.document_found) === 'false'
        emit('clarify-tourist', index, isSkipTabs)
      }
    } catch (error: any) {
      console.error('Failed to search tourist:', error)
      const isClientNotFound =
        error?.gbd_have && error?.message?.includes('Client not found')
      emit('clarify-tourist', index, isClientNotFound)
    } finally {
      touristLoading.value = { ...touristLoading.value, [index]: false }
    }
  }
}

const addTourist = () => {
  if (store.params.touristsInfo.length < 5) {
    store.params.touristsInfo.push({ id: Date.now(), age: '30-60' })
  }
}

const removeTourist = (index: number) => {
  store.params.touristsInfo.splice(index, 1)
}
const isCreatingOrder = ref(false)

const handleNext = async () => {
  // Basic validation that tourists are filled
  const valid = store.params.touristsInfo.every((t) => t.iin && t.firstName)
  if (!valid) {
    toast.error(t.value.validation.fillAllTourists)
    return
  }

  isCreatingOrder.value = true
  try {
    await orderActions.calculateFinalPrice()
    await orderActions.createOrder()

    // Navigate to payment step via store
    if (store.orderNumber) {
      store.setStep(3)
    } else {
      toast.error(t.value.validation.orderNumberError)
      return
    }
  } catch (error) {
    console.error(error)
    toast.error(t.value.validation.orderCreateError)
  } finally {
    isCreatingOrder.value = false
  }
}
</script>

<template>
  <div class="space-y-5">
    <!-- Policyholder Summary Header -->
    <div
      class="flex items-center justify-between border-b border-[#E8EDF2] pb-5"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F7F9] text-gray-400"
        >
          <ri-shield-fill class="text-2xl" />
        </div>
        <div>
          <div class="text-base font-semibold text-gray-800">
            {{
              store.policyHolderInfo?.firstName ||
              store.policyHolderInfo?.lastName
                ? `${store.policyHolderInfo.lastName} ${store.policyHolderInfo.firstName}`.trim()
                : store.params.policyholderIin || t.step2.policyholder
            }}
          </div>
          <div class="text-sm text-gray-500">
            {{ t.step2.policyholder
            }}{{
              store.policyHolderInfo?.age
                ? `, ${store.policyHolderInfo.age} ${t.step1.pluralizePeople[1]}`
                : ''
            }}
          </div>
        </div>
      </div>
      <button
        @click="emit('edit-policyholder')"
        class="text-blue-500 hover:text-blue-600"
      >
        <ri-edit-2-fill class="text-xl" />
      </button>
    </div>

    <div class="flex items-center gap-4 mt-6">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F7F9] text-gray-400"
      >
        <ri-user-fill class="text-2xl" />
      </div>
      <div>
        <div class="text-base font-semibold text-gray-800">
          {{ t.step2.tourists }}
        </div>
        <div class="text-sm text-gray-500">{{ t.step2.touristsDesc }}</div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        v-for="(tourist, index) in store.params.touristsInfo"
        :key="tourist.id"
        class="grid grid-cols-2 gap-6 mb-4 items-start"
      >
        <!-- Left Column: IIN Section (50%) -->
        <div class="w-full">
          <div
            class="text-[14px] font-normal text-[#121212] mb-1 leading-[20px]"
          >
            {{ t.step2.iinLabel }}
          </div>
          <div class="relative h-[44px]">
            <NInput
              :model-value="tourist.iin"
              @update:modelValue="
                (val: string) => handleTouristIinInput(val, index)
              "
              v-maska="'############'"
              type="tel"
              maxlength="12"
              :placeholder="t.step2.iinPlaceholder"
              :disabled="
                index === 0 &&
                store.params.isTourist &&
                !!tourist.clientId &&
                !!tourist.firstName
              "
              class="!mb-0 h-full text-[16px] font-medium text-[#121212] leading-[24px]"
              :class="{
                '!border-red-500 !bg-red-50':
                  index > 0 &&
                  store.params.touristsInfo.some(
                    (t, i) => i < index && t.iin === tourist.iin && t.iin
                  ),
              }"
            />
            <div
              v-if="touristLoading[index]"
              class="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <div
                class="w-4 h-4 border-2 border-gray-200 border-t-main-500 rounded-full animate-spin"
              ></div>
            </div>
          </div>
          <!-- Error message container ensures it doesn't push the layout if it exists -->
          <div class="h-5">
            <div
              v-if="
                index > 0 &&
                store.params.touristsInfo.some(
                  (t, i) => i < index && t.iin === tourist.iin && t.iin
                )
              "
              class="text-[14px] text-red-500 mt-1 leading-[20px] font-medium"
            >
              {{ t.validation.touristDuplicate }}
            </div>
          </div>
        </div>

        <!-- Right Column: Info & Delete (50%) -->
        <div class="flex items-center justify-between mt-[24px] h-[44px]">
          <div class="min-w-0 pr-2">
            <div
              class="text-[16px] font-semibold text-[#2E2E2E] leading-[24px] truncate"
            >
              {{
                tourist.firstName || tourist.lastName
                  ? `${tourist.lastName} ${tourist.firstName || ''}`.trim()
                  : t.step2.fullNamePlaceholder
              }}
            </div>
            <div class="text-[14px] font-normal text-[#6B788E] leading-[20px]">
              {{ t.step2.touristCount }} {{ index + 1 }}
            </div>
          </div>
          <button
            v-if="
              store.params.touristsInfo.length > 1 &&
              !(index === 0 && store.params.isTourist)
            "
            class="text-[#F14B3B] p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
            @click="removeTourist(index)"
          >
            <ri-delete-bin-fill class="text-2xl" />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="store.params.touristsInfo.length >= 5"
      class="text-sm font-medium text-red-500"
    >
      {{ t.step2.maxTouristsReached }}
    </div>

    <button
      v-else
      @click="addTourist"
      :disabled="store.params.touristsInfo.length >= 5"
      class="w-full h-[52px] border border-blue-500 rounded-xl flex items-center justify-center gap-2 text-blue-500 font-semibold hover:bg-blue-50 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
    >
      <ri-add-line class="text-2xl" /> {{ t.step2.addTourist }}
    </button>

    <div class="hidden grid-cols-1 items-center gap-4 md:grid md:grid-cols-2">
      <div class="text-xs text-secondary-text text-gray-500">
        {{ t.step2.agreementInfo }}
        <a
          href="https://nomad.kz/ru/insurance-rules?rule=mst"
          class="text-blue-500 hover:underline"
          target="_blank"
          >{{ t.common.rules }}</a
        >
      </div>
      <NButton
        color="main"
        @click="handleNext"
        :label="t.common.next"
        :loading="isCreatingOrder"
        :disabled="isCreatingOrder"
      />
    </div>
  </div>
</template>
