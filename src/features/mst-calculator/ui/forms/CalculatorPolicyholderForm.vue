<script setup lang="ts">
import { useMstStore } from '../../model/store/mst.store'
import { useStep2Logic } from '../../model/composables/useMstContacts'
import { NButton, NInput, NCheckbox, NToggle } from 'nomad-ui'
import { vMaska } from 'maska/vue'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiShieldFill from '~icons/ri/shield-fill'
import RiUserFill from '~icons/ri/user-fill'

const store = useMstStore()
const {
  policyholderIin,
  agreement,
  policyholderIinError,
  agreementError,
  validatePolicyIin,
  validateAgreement,
} = useStep2Logic()

const { t } = useMstI18n()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const handlePolicyholderSubmit = async () => {
  const iinResult = await validatePolicyIin()
  const agreementResult = await validateAgreement()

  if (iinResult.valid && agreementResult.valid) {
    emit('success')
  }
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center gap-4">
      <div
        class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F7F9] text-gray-400"
      >
        <ri-shield-fill class="text-2xl" />
      </div>
      <div>
        <div class="text-base font-semibold text-gray-800">
          {{ t.step2.policyholder }}
        </div>
        <div class="text-sm text-gray-500">
          {{ t.step2.policyholderDesc }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-center">
      <div class="space-y-1 relative">
        <NInput
          v-model="policyholderIin"
          v-maska="'############'"
          type="tel"
          maxlength="12"
          :placeholder="t.step2.iinPlaceholder"
          :label="t.step2.policyholderIinLabel"
          :class="{ '!border-red-500 !ring-red-500': policyholderIinError }"
        />
        <div
          v-if="store.isPolicyholderSearchLoading"
          class="absolute right-3 top-1/2"
        >
          <div
            class="w-5 h-5 border-2 border-gray-200 border-t-main-500 rounded-full animate-spin"
          ></div>
        </div>
        <span v-if="policyholderIinError" class="text-xs text-red-500 pl-1">{{
          policyholderIinError
        }}</span>
      </div>

      <div class="pt-0 md:pt-6">
        <NToggle
          v-model="store.params.isTourist"
          color="#FF4713"
          width="40px"
          height="22px"
          :label="t.step2.isTouristLabel"
          :description="t.step2.isTouristDesc"
        />
      </div>
    </div>

    <div class="text-sm text-gray-500" v-html="t.step2.smsInfo"></div>

    <div class="flex flex-col">
      <NCheckbox v-model="agreement">
        <template #label>
          <span
            class="text-sm leading-none font-medium"
            v-html="t.step2.personalDataAgreement"
          ></span>
        </template>
      </NCheckbox>
      <div v-if="agreementError" class="text-xs text-red-500 mt-1 pl-1">
        {{ agreementError }}
      </div>
    </div>

    <NButton
      class="h-[44px] w-full sm:h-auto font-bold bg-main-500 text-white rounded-xl hover:bg-main-600"
      @click="handlePolicyholderSubmit"
      :label="t.step2.confirm"
      :disabled="store.isPolicyholderSearchLoading"
    />

    <!-- Inactive Tourists Preview -->
    <div class="pointer-events-none opacity-40">
      <div class="my-[20px] h-[1px] bg-[#E5E7EB]"></div>
      <div class="flex items-center gap-4">
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
    </div>
  </div>
</template>
