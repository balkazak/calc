<script setup lang="ts">
import { useStep2Logic } from '../../model/composables/useMstContacts'
import { NButton, NInput } from 'nomad-ui'
import { vMaska } from 'maska/vue'
import { phoneMaskaOptions } from '../../../../shared/utils/format'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiErrorWarningFill from '~icons/ri/error-warning-fill'

const {
  contactPhone,
  contactEmail,
  contactPhoneError,
  contactEmailError,
  validateContactPhone,
  validateContactEmail,
} = useStep2Logic()

const { t } = useMstI18n()

const emit = defineEmits<{
  (e: 'success'): void
}>()

const handleConfirmContact = async () => {
  const phoneResult = await validateContactPhone()
  const emailResult = await validateContactEmail()

  if (phoneResult.valid && emailResult.valid) {
    emit('success')
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-1">
        <NInput
          v-model="contactPhone"
          v-maska="phoneMaskaOptions"
          type="tel"
          placeholder="+7 (___) ___ - __ - __"
          :label="t.step2.phoneLabel"
          :class="{ '!border-red-500 !ring-red-500': contactPhoneError }"
        />
        <span v-if="contactPhoneError" class="text-xs text-red-500 pl-1">{{
          contactPhoneError
        }}</span>
      </div>

      <div class="space-y-1">
        <NInput
          v-model="contactEmail"
          placeholder="example@mail.com"
          :label="t.step2.emailLabel"
          :class="{ '!border-red-500 !ring-red-500': contactEmailError }"
        />
        <span v-if="contactEmailError" class="text-xs text-red-500 pl-1">{{
          contactEmailError
        }}</span>
      </div>
    </div>

    <div class="flex items-center gap-3 rounded-xl bg-gray-50 p-2.5">
      <div class="mt-0.5 text-main-500">
        <ri-error-warning-fill class="text-2xl" />
      </div>
      <div class="flex flex-col gap-1 text-xs font-medium text-subtitle">
        <span class="text-title font-medium">{{
          t.step2.contactWarningTitle
        }}</span>
        {{ t.step2.contactWarningEmail }} {{ t.step2.contactWarningPhone }}
        <br />
        <span v-html="t.step2.contactWarningKaspi"></span>
      </div>
    </div>

    <NButton
      class="h-[44px] w-full sm:h-auto font-bold bg-main-500 text-white rounded-xl hover:bg-main-600"
      @click="handleConfirmContact"
      :label="t.step2.confirmPhone"
    />
  </div>
</template>
