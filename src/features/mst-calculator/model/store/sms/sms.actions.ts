import { smsApi } from '../../../api/sms.api'

export const useMstSmsActions = () => {
  const sendSmsConsent = async (phone: string) => {
    return await smsApi.sendSmsConsent(phone)
  }

  const verifySmsConsent = async (phone: string, code: string) => {
    return await smsApi.verifySmsConsent(phone, code)
  }

  return {
    sendSmsConsent,
    verifySmsConsent,
  }
}
