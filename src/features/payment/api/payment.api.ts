import axios from 'axios'
import { orderManagementApi } from '@shared/api/sdk'
import { getConfig } from '@shared/config'
import type {
  NomadApiResponse,
  MstOrder,
  OrderManagementExtended,
} from '../../mst-calculator/model/mst.types'

export const paymentApi = {
  getPayableOrder: (orderNumber: string): Promise<NomadApiResponse<MstOrder>> =>
    (orderManagementApi as unknown as OrderManagementExtended).ordersPayable(
      orderNumber
    ),

  getOrder: (orderNumber: string): Promise<NomadApiResponse<MstOrder>> =>
    (orderManagementApi as unknown as OrderManagementExtended).ordersShow(
      orderNumber
    ),

  createKaspiPayment: (
    orderNumber: string
  ): Promise<NomadApiResponse<{ pay_url: string }>> => {
    const url = getConfig().kaspiInvoiceUrl
    return axios.post(url, { order_number: orderNumber })
  },

  getEpayToken: (
    orderNumber: string
  ): Promise<NomadApiResponse<{ access_token: string }>> => {
    const url = getConfig().epayTokenUrl
    return axios.post(url, { order_number: orderNumber })
  },
}
