import {
  Configuration,
  CalculatorApi,
  CalculatorClientApi,
  CalculatorNotificationApi,
  OrderManagementApi,
  PaymentApi,
} from 'nomad-api-sdk'
import { getConfig } from '../config'
import { http, setBaseUrl } from './http'

const apiConfig = new Configuration({
  basePath: getConfig().apiUrl || '/',
})

export let calculatorApi = new CalculatorApi(
  apiConfig,
  apiConfig.basePath,
  http
)

export let calculatorClientApi = new CalculatorClientApi(
  apiConfig,
  apiConfig.basePath,
  http
)

export let calculatorNotificationApi = new CalculatorNotificationApi(
  apiConfig,
  apiConfig.basePath,
  http
)

export let orderManagementApi = new OrderManagementApi(
  apiConfig,
  apiConfig.basePath,
  http
)

export let paymentApiSdk = new PaymentApi(apiConfig, apiConfig.basePath, http)

export const updateSdkConfig = (baseUrl: string) => {
  setBaseUrl(baseUrl)
  apiConfig.basePath = baseUrl

  calculatorApi = new CalculatorApi(apiConfig, baseUrl, http)
  calculatorClientApi = new CalculatorClientApi(apiConfig, baseUrl, http)
  calculatorNotificationApi = new CalculatorNotificationApi(
    apiConfig,
    baseUrl,
    http
  )
  orderManagementApi = new OrderManagementApi(apiConfig, baseUrl, http)
  paymentApiSdk = new PaymentApi(apiConfig, baseUrl, http)
}
