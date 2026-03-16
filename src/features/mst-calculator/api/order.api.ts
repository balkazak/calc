import { orderManagementApi } from '@shared/api/sdk'
import { http } from '@shared/api/http'
import { getConfig } from '@shared/config'
import type {
  MstCalculateRequest,
  NomadApiResponse,
  MstOrder,
  OrderManagementExtended,
} from '../model/mst.types'

export const orderApi = {
  calculateProductVariant: (
    data: MstCalculateRequest,
    product: string = 'mst',
    variant: string = 'standard',
    locale: 'ru' | 'kk' | 'en' = 'ru'
  ): Promise<NomadApiResponse<MstOrder>> => {
    const { appUrl } = getConfig()
    return http.post(
      `${appUrl}/api/${locale}/products/${product}/variants/${variant}/calculator/calculate`,
      data
    )
  },

  createOrderByQuoteId: (
    quoteId: string
  ): Promise<NomadApiResponse<MstOrder>> =>
    (
      orderManagementApi as unknown as OrderManagementExtended
    ).createOrderByQuoteId({
      quote_id: quoteId,
    }),

  getOrder: (orderNumber: string): Promise<NomadApiResponse<MstOrder>> =>
    (orderManagementApi as unknown as OrderManagementExtended).ordersShow(
      orderNumber
    ),

  getPayableOrder: (orderNumber: string): Promise<NomadApiResponse<MstOrder>> =>
    (orderManagementApi as unknown as OrderManagementExtended).ordersPayable(
      orderNumber
    ),

  uploadOrderFile: (
    orderNumber: string,
    file: File
  ): Promise<NomadApiResponse<any>> => {
    const { appUrl } = getConfig()
    const formData = new FormData()
    formData.append('order_number', orderNumber)
    formData.append('file', file)

    return http.post(`${appUrl}/api/orders/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}
