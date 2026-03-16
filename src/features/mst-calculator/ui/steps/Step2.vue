<script setup lang="ts">
import { useMstStore } from '../../model/store/mst.store'
import { useMstTouristActions } from '../../model/store/tourist/tourist.actions'
import { useMstSmsActions } from '../../model/store/sms/sms.actions'
import type {
  PolicyholderFormData,
  TouristManualData,
  TouristKdpData,
  SendSmsResponse,
} from '../../model/mst.types'

import { ref, onMounted } from 'vue'
import { fetchUserData } from '../../api/mock/client'
import { useToast } from 'vue-toastification'

import {
  CalculatorContactForm,
  CalculatorPolicyholderForm,
  CalculatorTouristsForm,
} from '../forms'

import {
  SmsVerificationModal,
  SmsProcessingModal,
  EditPolicyholderModal,
  EditContactModal,
  TouristDataClarificationModal,
} from '../modals'

import { normalizeResponse } from '../../../../shared/utils/api'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiArticleFill from '~icons/ri/article-fill'
import RiEdit2Fill from '~icons/ri/edit-2-fill'
import RiShieldFill from '~icons/ri/shield-fill'
import RiUserFill from '~icons/ri/user-fill'

const props = defineProps<{
  isCabinet?: boolean
  isMock?: boolean
}>()

const store = useMstStore()
const touristActions = useMstTouristActions()
const smsActions = useMstSmsActions()
const toast = useToast()
const { t } = useMstI18n()

const authStep = ref<'input' | 'policyholder' | 'tourists'>('input')
const showSmsModal = ref(false)
const showEditContactModal = ref(false)
const showProcessingModal = ref(false)
const showEditPolicyholderModal = ref(false)
const showTouristClarificationModal = ref(false)
const processingStatus = ref<'pending' | 'success' | 'error'>('pending')
const currentTouristIndex = ref<number | null>(null)
const verificationType = ref<'policyholder' | 'tourist'>('policyholder')
const showClarificationTabs = ref(true)

const isSmsVerifying = ref(false)
const isSmsSending = ref(false)
const smsExpiry = ref<string | null>(null)

const handleContactSuccess = async () => {
  const cleanPhone = store.contact.phone.replace(/\D/g, '')

  if (!cleanPhone) {
    toast.error(t.value.validation.enterPhone)
    return
  }

  if (props.isMock) {
    authStep.value = 'policyholder'
    return
  }

  showSmsModal.value = true
  isSmsSending.value = true
  try {
    const response = await smsActions.sendSmsConsent(cleanPhone)
    const data = normalizeResponse<SendSmsResponse>(response)
    if (data?.expires_at) {
      smsExpiry.value = data.expires_at
    }
  } catch (e) {
    console.error('Failed to send SMS:', e)
    toast.error(t.value.validation.smsSendError)
    showSmsModal.value = false
  } finally {
    isSmsSending.value = false
  }
}

const handleSmsConfirm = async (code: string) => {
  const cleanPhone = store.contact.phone.replace(/\D/g, '')
  isSmsVerifying.value = true
  try {
    await smsActions.verifySmsConsent(cleanPhone, code)
    toast.success(t.value.validation.phoneVerified)
    showSmsModal.value = false

    if (authStep.value === 'input') {
      authStep.value = 'policyholder'
    }
  } catch (e) {
    console.error('SMS verification failed:', e)
    toast.error(t.value.validation.invalidCode)
  } finally {
    isSmsVerifying.value = false
  }
}

const handleResendSms = () => handleContactSuccess()

const handleSaveContact = async (data: { phone: string; email: string }) => {
  store.contact.phone = data.phone
  store.contact.email = data.email

  if (authStep.value === 'input') {
    handleContactSuccess()
  } else if (!props.isMock) {
    handleContactSuccess()
  }
}

const lastPolicyholderDocFound = ref(true)

const handlePolicyholderSuccess = async (silent = false) => {
  store.isPolicyholderSearchLoading = true
  verificationType.value = 'policyholder'
  store.params.isPolicyHolder = true

  try {
    const iin = store.params.policyholderIin || ''
    let isGbdHave = false
    let isDocFound = false

    try {
      const searchRes = await touristActions.searchAndSetPolicyholder(iin)
      const searchData = normalizeResponse<any>(searchRes)
      isGbdHave = searchData?.gbd_have === true

      const quickSyncRes = await touristActions.syncPolicyholder(iin, false)
      const syncData = normalizeResponse<any>(quickSyncRes)
      isDocFound =
        syncData?.document_found !== false &&
        syncData?.document_found !== undefined
    } catch (preError: any) {
      if (
        isGbdHave &&
        (preError?.response?.data?.error || preError?.message || '').includes(
          'Client not found'
        )
      ) {
        if (store.params.isTourist) {
          handleTouristClarify(0, true)
          return
        }
      }
      console.warn('Pre-check failed:', preError)
    }

    lastPolicyholderDocFound.value = isDocFound
    const isActuallyTourist = store.params.isTourist

    if (isActuallyTourist && isGbdHave && !isDocFound) {
      handleTouristClarify(0, true)
      return
    }

    if (isGbdHave && (!isActuallyTourist || isDocFound)) {
      goToTouristsStep()
      if (!silent) toast.success(t.value.validation.dataSuccess)
      return
    }

    showProcessingModal.value = true
    processingStatus.value = 'pending'

    const syncRes = await touristActions.syncPolicyholder(iin, true)
    const clientData = normalizeResponse<any>(syncRes)

    lastPolicyholderDocFound.value =
      clientData?.document_found !== false &&
      clientData?.document_found !== undefined

    if (isActuallyTourist && !lastPolicyholderDocFound.value) {
      showProcessingModal.value = false
      showClarificationTabs.value = false
      showTouristClarificationModal.value = true
      return
    }

    processingStatus.value = 'success'
  } catch (e: any) {
    console.error('Policyholder verification failed:', e)
    const isNotFound = e?.gbd_have && e?.message?.includes('Client not found')

    if (store.params.isTourist || isNotFound) {
      showProcessingModal.value = false
      handleTouristClarify(store.params.isTourist ? 0 : null, isNotFound)
      return
    }

    processingStatus.value = 'error'
    showProcessingModal.value = true
  } finally {
    store.isPolicyholderSearchLoading = false
    store.params.isPolicyHolder = false
  }
}

const handleProcessingClose = () => {
  if (processingStatus.value === 'success') {
    if (verificationType.value === 'policyholder') {
      goToTouristsStep()
    } else if (
      verificationType.value === 'tourist' &&
      currentTouristIndex.value !== null
    ) {
    }
  }
  showProcessingModal.value = false
}

const handleProcessingRetry = async () => {
  if (verificationType.value === 'policyholder') {
    handlePolicyholderSuccess()
  } else if (
    verificationType.value === 'tourist' &&
    currentTouristIndex.value !== null
  ) {
    const tourist = store.params.touristsInfo[currentTouristIndex.value]
    if (tourist && tourist.iin) {
      handleTouristKdpSubmit({ iin: tourist.iin, phone: '' })
    }
  }
}

const goToTouristsStep = () => {
  authStep.value = 'tourists'

  if (store.params.isTourist) {
    if (store.params.touristsInfo.length === 0) {
      store.params.touristsInfo.push({ id: Date.now(), age: '30-60' })
    }
    const tourist = store.params.touristsInfo[0]
    if (tourist) {
      tourist.iin = store.params.policyholderIin
      if (store.policyHolderInfo) {
        tourist.firstName = store.policyHolderInfo.firstName
        tourist.lastName = store.policyHolderInfo.lastName
      }
      if (store.policyHolderClientId) {
        tourist.clientId = store.policyHolderClientId
      }
    }
  }
}

const handleSavePolicyholder = (data: PolicyholderFormData) => {
  const wasTourist = store.params.isTourist

  if (data.isTourist && !wasTourist && store.params.touristsInfo.length >= 5) {
    toast.error('Максимальное количество туристов - 5')
    return
  }

  if (data.isTourist && data.iin) {
    const isDuplicate = store.params.touristsInfo.some((t, index) => {
      if (index === 0 && (wasTourist || t.iin === data.iin)) return false
      return t.iin === data.iin
    })

    if (isDuplicate) {
      toast.error('Турист с таким ИИН уже добавлен')
      return
    }
  }

  store.params.isTourist = data.isTourist
  store.params.policyholderIin = data.iin
  store.params.agreement = data.agreement

  authStep.value = 'policyholder'

  if (Boolean(data.isTourist) && data.iin) {
    if (!wasTourist) {
      if (
        store.params.touristsInfo.length > 0 &&
        store.params.touristsInfo[0] &&
        (!store.params.touristsInfo[0].iin ||
          store.params.touristsInfo[0].iin === data.iin)
      ) {
        store.params.touristsInfo[0].iin = data.iin
      } else {
        store.params.touristsInfo.unshift({
          id: Date.now(),
          iin: data.iin,
          age: '30-60',
        })
      }
    } else if (
      store.params.touristsInfo.length > 0 &&
      store.params.touristsInfo[0]
    ) {
      store.params.touristsInfo[0].iin = data.iin
    }

    if (
      store.params.touristsInfo[0] &&
      store.params.touristsInfo[0].iin === data.iin
    ) {
      if (store.policyHolderInfo) {
        store.params.touristsInfo[0].firstName =
          store.policyHolderInfo.firstName
        store.params.touristsInfo[0].lastName = store.policyHolderInfo.lastName
      }

      if (store.policyHolderClientId) {
        store.params.touristsInfo[0].clientId = store.policyHolderClientId
      } else {
        touristActions.searchAndSetTourist(0, data.iin)
      }
    }
  } else if (!Boolean(data.isTourist) && wasTourist) {
    if (store.params.touristsInfo.length > 0) {
      store.params.touristsInfo.shift()
    }
  }

  handlePolicyholderSuccess(true)
}

const handleTouristClarify = (index: number | null, hideTabs = false) => {
  currentTouristIndex.value = index
  if (authStep.value === 'tourists' && index !== null) {
    verificationType.value = 'tourist'
  }
  showClarificationTabs.value = !hideTabs
  showTouristClarificationModal.value = true
}

const handleTouristManualSubmit = async (data: TouristManualData) => {
  const payload = {
    resident_bool: 1,
    first_name: data.firstName,
    last_name: data.lastName,
    born: '01.01.1990',
    first_name_eng: data.firstNameLat,
    last_name_eng: data.lastNameLat,
    document_type: 'rk_passport',
    document_number: data.passportNumber,
    document_date: data.passportIssueDate,
    document_issued_by: 'MIA RK',
  }

  try {
    if (verificationType.value === 'policyholder') {
      await touristActions.saveManualPolicyholder({
        ...payload,
        iin: store.params.policyholderIin || '',
      })
      toast.success('Данные сохранены')
      showTouristClarificationModal.value = false
      goToTouristsStep()
    } else if (
      currentTouristIndex.value !== null &&
      store.params.touristsInfo[currentTouristIndex.value]
    ) {
      const tourist = store.params.touristsInfo[currentTouristIndex.value]
      if (tourist) {
        const existingId = tourist.clientId ? Number(tourist.clientId) : 0
        await touristActions.saveManualTourist(currentTouristIndex.value, {
          ...payload,
          id: existingId,
          iin: tourist.iin || '',
        })
        toast.success('Данные сохранены')
        showTouristClarificationModal.value = false
      }
    }
  } catch (e) {
    toast.error('Ошибка при сохранении данных')
  }
}

const handleTouristKdpSubmit = async (data: TouristKdpData) => {
  if (currentTouristIndex.value !== null) {
    try {
      verificationType.value = 'tourist'
      showProcessingModal.value = true
      processingStatus.value = 'pending'

      const response = await touristActions.syncTourist(
        currentTouristIndex.value,
        data.iin
      )

      if (response && response.data) {
        const clientData = (response.data as any).data || (response.data as any)

        if (
          clientData.document_found === false ||
          String(clientData.document_found) === 'false'
        ) {
          showProcessingModal.value = false
          showClarificationTabs.value = false
          showTouristClarificationModal.value = true
          return
        }
      }

      processingStatus.value = 'success'
    } catch (e) {
      console.error('Failed to sync tourist via KDP', e)
      showProcessingModal.value = false
      showClarificationTabs.value = false
      showTouristClarificationModal.value = true
    }
  }
}

const isLoading = ref(false)

onMounted(async () => {
  if (props.isCabinet) {
    isLoading.value = true
    try {
      const data = await fetchUserData()
      if (data) {
        store.contact.phone = data.tel
        store.contact.email = data.email
        store.policyHolder.phone = data.tel
        store.params.policyholderIin = data.iin
      }
    } catch (e) {
      console.error('Failed to fetch user data', e)
    } finally {
      isLoading.value = false
    }
  }
})
</script>

<template>
  <div v-if="isLoading" class="space-y-5 animate-pulse">
    <div class="h-8 bg-gray-200 rounded w-1/3"></div>
    <div class="space-y-5">
      <div class="h-12 bg-gray-200 rounded-xl w-full"></div>
      <div class="h-1 bg-gray-200 rounded w-full"></div>
      <div class="h-12 bg-gray-200 rounded-xl w-full"></div>
      <div class="h-1 bg-gray-200 rounded w-full"></div>
      <div class="h-12 bg-gray-200 rounded-xl w-full"></div>
    </div>
  </div>

  <div v-else class="space-y-5">
    <h3 class="text-xl font-semibold">
      {{ authStep === 'input' ? t.step2.titleInput : t.step2.titleReady }}
    </h3>

    <!-- Step 1: Contact Input -->
    <CalculatorContactForm
      v-if="authStep === 'input'"
      @success="handleContactSuccess"
    />

    <div v-if="authStep !== 'input'" class="space-y-5">
      <div
        class="flex items-center justify-between border-b border-[#E8EDF2] pb-5"
      >
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F7F9] text-gray-400"
          >
            <ri-article-fill class="text-2xl" />
          </div>
          <div>
            <div class="text-base font-semibold text-gray-800">
              {{ store.contact.phone }}
            </div>
            <div class="text-sm text-gray-500">{{ store.contact.email }}</div>
          </div>
        </div>
        <button
          @click="showEditContactModal = true"
          class="text-blue-500 hover:text-blue-600"
        >
          <RiEdit2Fill class="text-xl" />
        </button>
      </div>
    </div>

    <!-- Step 2: Policyholder -->
    <CalculatorPolicyholderForm
      v-if="authStep === 'policyholder'"
      @success="handlePolicyholderSuccess"
    />

    <!-- Step 3: Tourists -->
    <CalculatorTouristsForm
      v-if="authStep === 'tourists'"
      @edit-policyholder="showEditPolicyholderModal = true"
      @clarify-tourist="handleTouristClarify"
    />

    <!-- Initial Inactive Previews -->
    <div
      v-if="authStep === 'input'"
      class="pointer-events-none opacity-40 space-y-5"
    >
      <div class="my-[20px] h-[1px] bg-[#E5E7EB]"></div>
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

  <SmsVerificationModal
    v-model:open="showSmsModal"
    :phone="store.contact.phone"
    :loading="isSmsVerifying || isSmsSending"
    :expiresAt="smsExpiry"
    @confirm="handleSmsConfirm"
    @resend="handleResendSms"
  />

  <SmsProcessingModal
    v-model:open="showProcessingModal"
    :status="processingStatus"
    @close="handleProcessingClose"
    @retry="handleProcessingRetry"
  />

  <EditContactModal
    v-model:open="showEditContactModal"
    :initial-phone="store.contact.phone"
    :initial-email="store.contact.email"
    @save="handleSaveContact"
  />

  <EditPolicyholderModal
    v-model:open="showEditPolicyholderModal"
    :initial-data="{
      isTourist: store.params.isTourist || false,
      iin: store.params.policyholderIin || '',
      agreement: store.params.agreement || false,
    }"
    @save="handleSavePolicyholder"
  />

  <TouristDataClarificationModal
    v-model:open="showTouristClarificationModal"
    :hide-tabs="!showClarificationTabs"
    :initial-iin="
      currentTouristIndex !== null
        ? store.params.touristsInfo[currentTouristIndex]?.iin
        : verificationType === 'policyholder'
          ? store.params.policyholderIin
          : ''
    "
    @submit-manual="handleTouristManualSubmit"
    @submit-kdp="handleTouristKdpSubmit"
  />
</template>
