export interface NomadConfig {
  apiUrl: string
  halykPaymentUrl: string
  halykTerminalId: string
  kaspiInvoiceUrl: string
  epayTokenUrl: string
  epayPostLink: string
  appUrl: string
}

let config: NomadConfig = {
  apiUrl: '',
  halykPaymentUrl: '',
  halykTerminalId: '',
  kaspiInvoiceUrl: '',
  epayTokenUrl: '',
  epayPostLink: '',
  appUrl: '',
}

export const setConfig = (newConfig: Partial<NomadConfig>) => {
  config = { ...config, ...newConfig }
}

export const getConfig = () => config
