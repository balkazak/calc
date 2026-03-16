import { calculatorApi } from '@shared/api/sdk'
import type {
  NomadApiResponse,
  ProductCalculatorSchema,
} from '../model/mst.types'

export const dictionariesApi = {
  getProductCalculatorSchema: (
    productSlug: string,
    variantSlug: string,
    locale: 'ru' | 'kk' | 'en'
  ): Promise<NomadApiResponse<ProductCalculatorSchema>> =>
    calculatorApi.getProductCalculatorSchema(
      productSlug,
      variantSlug,
      locale
    ) as unknown as Promise<NomadApiResponse<ProductCalculatorSchema>>,
}
