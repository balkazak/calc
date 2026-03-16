import { useField } from 'vee-validate'
import * as yup from 'yup'
import { watch } from 'vue'
import { useMstStore } from '../store/mst.store'
import { useMstI18n } from './useMstI18n'

export function useStep2Logic() {
  const store = useMstStore()
  const { t } = useMstI18n()

  const phoneSchema = yup
    .string()
    .required(t.value.validation.enterPhone)
    .length(18, t.value.validation.invalidCode)
  const emailSchema = yup
    .string()
    .required(t.value.validation.enterEmail)
    .email(t.value.validation.invalidEmail)
  const iinSchema = yup
    .string()
    .required(t.value.step2.iinPlaceholder)
    .length(12, t.value.validation.invalidIin)
  const agreementSchema = yup
    .boolean()
    .required()
    .isTrue(t.value.validation.needAgreement)

  const {
    value: contactPhone,
    errorMessage: contactPhoneError,
    validate: validateContactPhone,
  } = useField<string>('contactPhone', phoneSchema, {
    initialValue: store.contact.phone,
    validateOnValueUpdate: false,
  })

  const {
    value: contactEmail,
    errorMessage: contactEmailError,
    validate: validateContactEmail,
    meta: contactEmailMeta,
  } = useField<string>('contactEmail', emailSchema, {
    initialValue: store.contact.email,
    validateOnValueUpdate: false,
  })

  const {
    value: policyholderIin,
    errorMessage: policyholderIinError,
    validate: validatePolicyIin,
    meta: policyholderIinMeta,
  } = useField<string>('policyholderIin', iinSchema, {
    initialValue: store.params.policyholderIin,
    validateOnValueUpdate: false,
  })

  const {
    value: agreement,
    errorMessage: agreementError,
    validate: validateAgreement,
    meta: agreementMeta,
  } = useField<boolean>('agreement', agreementSchema, {
    initialValue: store.params.agreement,
    validateOnValueUpdate: false,
  })

  watch(contactPhone, (val) => {
    store.contact.phone = val || ''
  })
  watch(contactEmail, (val) => {
    store.contact.email = val || ''
  })
  watch(policyholderIin, (val) => {
    store.params.policyholderIin = val || ''
  })
  watch(agreement, (val) => {
    store.params.agreement = val || false
  })

  watch(
    () => store.contact.phone,
    (val) => {
      if (val !== contactPhone.value) contactPhone.value = val || ''
    }
  )
  watch(
    () => store.contact.email,
    (val) => {
      if (val !== contactEmail.value) contactEmail.value = val || ''
    }
  )
  watch(
    () => store.params.policyholderIin,
    (val) => {
      if (val !== policyholderIin.value) policyholderIin.value = val || ''
    }
  )
  watch(
    () => store.params.agreement,
    (val) => {
      if (val !== agreement.value) agreement.value = val || false
    }
  )

  watch(
    () => store.params.isTourist,
    async () => {
      // Logic to auto-fill tourist info if data is already available elsewhere
      // If we need to ensure name is filled, we can rely on the data already in UI or subsequent fetch
      if (
        store.params.isTourist &&
        store.params.touristsInfo.length > 0 &&
        store.params.touristsInfo[0]
      ) {
        const tourist = store.params.touristsInfo[0]
        if (store.policyHolderInfo) {
          tourist.firstName = store.policyHolderInfo.firstName
          tourist.lastName = store.policyHolderInfo.lastName
        }
        if (!tourist.iin) tourist.iin = store.params.policyholderIin
        if (store.policyHolderClientId) {
          tourist.clientId = store.policyHolderClientId
        }
      }
    }
  )

  return {
    contactPhone,
    contactEmail,
    policyholderIin,
    agreement,

    contactPhoneError,
    contactEmailError,
    policyholderIinError,
    agreementError,

    contactEmailMeta,
    policyholderIinMeta,
    agreementMeta,

    validateContactPhone,
    validateContactEmail,
    validatePolicyIin,
    validateAgreement,
  }
}
