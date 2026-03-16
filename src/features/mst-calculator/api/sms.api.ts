import { http } from '@shared/api/http'
import { calculatorNotificationApi } from '@shared/api/sdk'
import type {
  MstCreateOrderPayload,
  NomadApiResponse,
  MstOrder,
  SendSmsResponse,
  VerifySmsResponse,
} from '../model/mst.types'

export const smsApi = {
  // Keeping createOrder for now if it was used elsewhere, though seemingly unused in new actions
  createOrder: (
    data: MstCreateOrderPayload
  ): Promise<NomadApiResponse<MstOrder>> => http.post('/mst/create', data),
  sendSmsConsent: (
    phone: string
  ): Promise<NomadApiResponse<SendSmsResponse>> => {
    return calculatorNotificationApi.sendSmsConsentCode({
      phone,
    }) as unknown as Promise<NomadApiResponse<SendSmsResponse>>
  },
  verifySmsConsent: (
    phone: string,
    code: string
  ): Promise<NomadApiResponse<VerifySmsResponse>> => {
    return calculatorNotificationApi.verifyConsentCode({
      phone,
      code,
    }) as unknown as Promise<NomadApiResponse<VerifySmsResponse>>
  },
}
