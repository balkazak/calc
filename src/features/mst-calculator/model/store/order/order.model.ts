export interface MstOrder {
  order_number: string
  total_premium: number
  amount?: number
  period?: {
    start_at: string
    end_at: string
  }
  product?: {
    name: string
  }
  [key: string]: unknown
}

export interface MstCalculateRequest {
  period: {
    start_at: string
    end_at: string
  }
  destinations: Array<{ country_code: string } | null>
  sum_insured: number
  tariff: string
  insureds: Array<{
    age_code?: string
    esbd_client_id?: string
    purpose: string
    active_relax: boolean
    covid_19?: number | null
  }>
  policyholder?: {
    esbd_client_id: string
  }
  delivery?: {
    email: string
    phone: string
    method: string
  }
}
