import type { MstOrder } from './store/order/order.model'

export interface InsuranceParam {
  label: string
  value: string | number
  zone?: string
  price?: number
  currency?: string
}

export interface Tourist {
  id: string
  iin: string
  lastName: string
  firstName: string
  birthDate: string | null
}

export interface ContactInfo {
  phone: string
  email: string
}

export interface Step1Errors {
  country?: string
  amount?: string
  dates?: string
  purpose?: string
  touristsInfo?: string
}

export interface MstDictionaries {
  countries: InsuranceParam[]
  trip_purposes: InsuranceParam[]
  sport_types: InsuranceParam[]
  sport_levels: InsuranceParam[]
  amounts: InsuranceParam[]
  zones: InsuranceParam[]
  ages: InsuranceParam[]
  covid_19: InsuranceParam[]
}

export interface TouristInfo {
  id: number
  age: string
  iin?: string
  firstName?: string
  lastName?: string
  firstNameLat?: string
  lastNameLat?: string
  patronymic?: string
  birthDate?: string
  passportNumber?: string
  passportIssueDate?: string
  clientId?: string
}

export interface MSTState {
  lang: 'ru' | 'kk' | 'en'
  step: number
  dictionaries: MstDictionaries
  params: {
    country: InsuranceParam[]
    amount: string
    dates: Date[] | null
    purpose: string
    touristsInfo: TouristInfo[]
    activeRest: boolean
    covidCoverage: boolean
    covid_19: number | null
    sportType?: string
    occupationDegree?: string
    studentDoc?: File | null
    policyholderIin?: string
    isTourist?: boolean
    isPolicyHolder?: boolean
    agreement?: boolean
  }
  step1Errors: Step1Errors
  contact: ContactInfo
  tourists: Tourist[]
  policyHolder: {
    email: string
    phone: string
  }
  price: number
  hasGbdData: boolean
  isPolicyholderSearchLoading: boolean
  policyHolderInfo: {
    firstName: string
    lastName: string
    age?: number | string
  } | null
  policyHolderClientId?: string
  quoteId?: string
  orderNumber?: string
  finalOrder?: MstOrder | null
  isPriceLoading: boolean
}

export interface PolicyholderFormData {
  isTourist: boolean
  iin: string
  agreement: boolean
}

export interface TouristManualData {
  firstName: string
  lastName: string
  firstNameLat: string
  lastNameLat: string
  passportNumber: string
  passportIssueDate: string
}

export interface TouristKdpData {
  iin: string
  phone?: string
}

export interface EpayAuthResponse {
  access_token: string
  expires_in: string | number
  scope: string
  token_type: string
  refresh_token?: string
}

export interface MstCalculatePayload {
  country: InsuranceParam[]
  amount: string
  dates: Date[] | null
  purpose: string
  touristsInfo: TouristInfo[]
  activeRest: boolean
  covidCoverage: boolean
  covid_19: number | null
}

export interface MstPreviewResponse {
  total_premium: number
}

export interface MstQuoteMeta {
  quote_id: string | number
}

export interface EpayTokenResponse {
  access_token: string
}

export interface ClientApiExtended {
  calcinitPersonDataAccess(params: {
    iin: string
  }): Promise<NomadApiResponse<InitPersonAccessResponse>>
}

export interface OrderManagementExtended {
  createOrderByQuoteId(params: {
    quote_id: string
  }): Promise<NomadApiResponse<MstOrder>>
  ordersShow(orderNumber: string | number): Promise<NomadApiResponse<MstOrder>>
  ordersPayable(
    orderNumber: string | number
  ): Promise<NomadApiResponse<MstOrder>>
}

export interface PaymentApiExtended {
  _8c002ce763d8fc2269adb51f06664677(params: {
    order_number: string
  }): Promise<NomadApiResponse<{ pay_url: string }>>
  _1032274b5c1e6ab7b5a52520edfdefa7(params: {
    order_number: string
  }): Promise<NomadApiResponse<EpayTokenResponse>>
}

export interface MstCreateOrderPayload extends MstCalculatePayload {
  contact: ContactInfo
  policyHolder: {
    email: string
    phone: string
  }
}

export interface MstClientData {
  id?: number | string
  client_id?: number | string
  full_name?: string
  gbd_have?: boolean
  esbd_have?: boolean
  document_found?: boolean
  [key: string]: unknown
}

export interface NomadApiResponse<T> {
  data: T
  meta?: unknown
}

// Export types from order model
export type { MstOrder, MstCalculateRequest } from './store/order/order.model'

export interface InitPersonAccessResponse {
  status: string
}

export interface ProductCalculatorSchema {
  // Add specific fields if known, using Record<string, unknown> as a safe base for dynamic schemas
  [key: string]: unknown
}

export interface SendSmsResponse {
  expires_at?: string
  [key: string]: unknown
}

export interface VerifySmsResponse {
  success?: boolean
  token?: string
  [key: string]: unknown
}
