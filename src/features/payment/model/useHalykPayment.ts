import { paymentApi } from '../api/payment.api'
import type { EpayTokenResponse } from '../../mst-calculator/model/mst.types'
import { getConfig } from '../../../shared/config'

interface HalykPayObject {
  invoiceId: string
  invoiceIdAlt: string
  backLink: string
  failureBackLink: string
  autoBackLink: boolean
  postLink: string
  failurePostLink: string
  language: string
  description: string
  accountId: string
  terminal?: string
  amount: number
  currency: string
  auth: EpayTokenResponse
}

interface Halyk {
  pay(obj: HalykPayObject): void
}

declare global {
  interface Window {
    halyk: Halyk
  }
}

export function useHalykPayment() {
  const loadHalykScript = () => {
    return new Promise((resolve, reject) => {
      if (window.halyk) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = getConfig().halykPaymentUrl
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () =>
        reject(new Error('Failed to load Halyk payment script'))
      document.body.appendChild(script)
    })
  }

  const ensureHalykLoaded = async () => {
    if (!window.halyk) {
      await loadHalykScript()
    }
  }

  const payWithHalyk = async (orderNumber: string, amount: number) => {
    try {
      await ensureHalykLoaded()

      const response = await paymentApi.getEpayToken(orderNumber)
      const rawData = response.data as unknown as Record<string, unknown>
      const responseData = (rawData.data as EpayTokenResponse) || response.data

      if (!responseData || !responseData.access_token) {
        throw new Error('No access token received')
      }

      const authData = responseData
      const invoiceId = String(orderNumber)

      const paymentObject: HalykPayObject = {
        invoiceId: invoiceId,
        invoiceIdAlt: invoiceId,
        backLink: window.location.origin + '/policies/mst/buy/success',
        failureBackLink: window.location.origin + '/policies/mst/buy/failure',
        autoBackLink: true,
        postLink: getConfig().epayPostLink,
        failurePostLink: window.location.origin,
        language: 'rus',
        description: 'Оплата страхового полиса',
        accountId: 'testuser1',
        terminal: getConfig().halykTerminalId,
        amount: Number(amount),
        currency: 'KZT',
        auth: authData,
      }

      window.halyk.pay(paymentObject)
    } catch (error) {
      console.error('Failed to initialize card payment:', error)
      throw error
    }
  }

  return {
    payWithHalyk,
  }
}
