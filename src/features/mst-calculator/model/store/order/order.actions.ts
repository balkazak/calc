import { mstApi } from '../../../api/mst.api'
import { orderApi } from '../../../api/order.api'
import { format } from 'date-fns'
import type { MstCalculateRequest, MstOrder } from './order.model'
import { useMstStore } from '../mst.store'
import type { InsuranceParam } from '../../mst.types'
import { normalizeResponse } from '../../../../../shared/utils/api'

const useStore = () => useMstStore()

function debounce(fn: ParameterizedFunction, ms: number) {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: unknown, ...args: unknown[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

type ParameterizedFunction = (...args: any[]) => void | Promise<void>

export const useMstOrderActions = () => {
  const store = useStore()

  const mapInsureds = (isFinal = false) =>
    store.params.touristsInfo.map((t) => {
      const ageObj = store.dictionaries.ages.find(
        (a) => a.label === t.age || a.value === t.age
      )
      const base = {
        purpose: store.params.purpose || 'tourism',
        active_relax: store.params.activeRest,
        covid_19: store.params.covidCoverage ? store.params.covid_19 : null,
      }
      return isFinal
        ? { ...base, esbd_client_id: t.clientId }
        : { ...base, age_code: ageObj?.value ? String(ageObj.value) : 'adult' }
    })

  const getPayload = (isFinal = false): MstCalculateRequest | null => {
    const { country, amount, dates } = store.params
    if (!country?.length || !dates?.[0] || !dates?.[1] || !amount) return null

    const base: any = {
      period: {
        start_at: `${format(dates[0], 'yyyy-MM-dd')}T00:00:00+06:00`,
        end_at: `${format(dates[1], 'yyyy-MM-dd')}T23:59:59+06:00`,
      },
      destinations: country
        .map((c: InsuranceParam) => {
          const val = typeof c === 'object' ? c?.value : c
          return val ? { country_code: val.toString() } : null
        })
        .filter(Boolean),
      sum_insured: Number(amount),
      tariff: 'base',
      insureds: mapInsureds(isFinal),
    }

    if (isFinal) {
      base.policyholder = { esbd_client_id: store.policyHolderClientId || '' }
      base.delivery = {
        email: store.contact.email,
        phone: store.contact.phone.replace(/\D/g, ''),
        method: 'email_sms',
      }
    }

    return base
  }

  const calculatePrice = debounce(async () => {
    const payload = getPayload()
    if (!payload) return

    store.isPriceLoading = true
    try {
      const response = await mstApi.previewPrice(payload)
      const data: any = normalizeResponse(response)
      if (data?.total_premium) store.price = data.total_premium
    } catch (error) {
      console.error('Failed to preview price:', error)
    } finally {
      store.isPriceLoading = false
    }
  }, 500)

  const calculateFinalPrice = async () => {
    const payload = getPayload(true)
    if (!payload) throw new Error('Not all fields filled')

    store.isPriceLoading = true
    try {
      const response = await orderApi.calculateProductVariant(
        payload,
        'mst',
        'standard',
        store.lang
      )
      const data = normalizeResponse<MstOrder>(response)

      if (data) {
        if (data.total_premium) store.price = data.total_premium
        store.finalOrder = data

        const meta =
          (data as any).meta ||
          (response as any).meta ||
          (response.data as any).meta
        if (meta?.quote_id) store.quoteId = String(meta.quote_id)
      }
      return response
    } catch (error) {
      console.error('Failed to calculate final price:', error)
      throw error
    } finally {
      store.isPriceLoading = false
    }
  }

  const createOrder = async () => {
    if (!store.quoteId) throw new Error('No quote ID')
    try {
      const response = await orderApi.createOrderByQuoteId(store.quoteId)
      const data = normalizeResponse<MstOrder>(response)
      if (data?.order_number) {
        const nr = String(data.order_number)
        if (store.orderNumber !== nr) store.orderNumber = nr
      }
      return response
    } catch (error) {
      console.error('Failed to create order:', error)
      throw error
    }
  }

  const fetchOrder = async (orderNumber: string) => {
    try {
      const response = await orderApi.getOrder(orderNumber)
      const data = normalizeResponse<MstOrder>(response)
      if (data) store.finalOrder = data
      return response
    } catch (error) {
      console.error('Failed to fetch order:', error)
      throw error
    }
  }

  return {
    calculatePrice,
    calculateFinalPrice,
    createOrder,
    fetchOrder,
  }
}
