import { http } from '@shared/api/http'
import { calculatorApi } from '@shared/api/sdk'
import type {
  MstCalculatePayload,
  MstCalculateRequest,
  NomadApiResponse,
} from '../model/mst.types'

export const mstApi = {
  calculate: (data: MstCalculatePayload): Promise<NomadApiResponse<unknown>> =>
    http.post('/mst/calculate', data),

  previewPrice: (
    data: MstCalculateRequest
  ): Promise<NomadApiResponse<{ total_premium: number }>> =>
    calculatorApi.previewProductVariant(
      'mst',
      'standard',
      data as unknown as Record<string, unknown>
    ) as unknown as Promise<NomadApiResponse<{ total_premium: number }>>,
}
