import { type App } from 'vue'
import { createPinia, getActivePinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { setConfig } from './shared/config'
import { updateSdkConfig } from './shared/api/sdk'
import { MSTCalculator } from './features/mst-calculator'
import { PaymentView } from './features/payment'
import 'nomad-ui/dist/nomad-ui.css'
import './styles/main.css'

export * from './features/mst-calculator'
export * from './features/payment'

export { MSTCalculator, PaymentView }

export interface NomadCalcOptions {
  apiUrl?: string
  halykPaymentUrl?: string
  halykTerminalId?: string
  kaspiInvoiceUrl?: string
  epayTokenUrl?: string
  epayPostLink?: string
  appUrl?: string
}

export function installCalcModule(app: App, options?: NomadCalcOptions) {
  if (options) {
    setConfig({
      apiUrl: options.apiUrl,
      halykPaymentUrl: options.halykPaymentUrl,
      halykTerminalId: options.halykTerminalId,
      kaspiInvoiceUrl: options.kaspiInvoiceUrl,
      epayTokenUrl: options.epayTokenUrl,
      epayPostLink: options.epayPostLink,
      appUrl: options.appUrl,
    })

    if (options.apiUrl) {
      updateSdkConfig(options.apiUrl)
    }
  }

  if (!getActivePinia()) {
    app.use(createPinia())
  }
  app.use(VueQueryPlugin)
}

export default {
  install(app: App, options?: NomadCalcOptions) {
    installCalcModule(app, options)
    app.component('MSTCalculator', MSTCalculator)
    app.component('PaymentView', PaymentView)
  },
}
