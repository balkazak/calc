import { createApp } from 'vue'
import App from './App.vue'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import router from './router'
import { installCalcModule } from '../index'

const app = createApp(App)

installCalcModule(app, {
  apiUrl: import.meta.env.VITE_API_URL,
  halykPaymentUrl: import.meta.env.VITE_HALYK_PAYMENT_URL,
  halykTerminalId: import.meta.env.VITE_HALYK_TERMINAL_ID,
  kaspiInvoiceUrl: import.meta.env.VITE_KASPI_INVOICE,
  epayTokenUrl: import.meta.env.VITE_EPAY_TOKEN,
  epayPostLink: import.meta.env.VITE_EPAY_POSTLINK,
  appUrl:  import.meta.env.VITE_APP_URL || 'https://online-staging.nomad.kz'
})

app.use(router)
app.use(Toast)

app.mount('#app')
