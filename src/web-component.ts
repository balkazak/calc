import {
  defineCustomElement,
  defineComponent,
  h,
  onMounted,
  getCurrentInstance,
} from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { createRouter, createMemoryHistory } from 'vue-router'
import MSTCalculator from './features/mst-calculator/ui/MSTCalculator.vue'
import { setConfig } from './shared/config'
import { updateSdkConfig } from './shared/api/sdk'

// Import styles
// @ts-ignore
import mainStyles from './styles/main.css?inline'
// @ts-ignore
import nomadUiStyles from 'nomad-ui/dist/nomad-ui.css?inline'

const styles = [nomadUiStyles, mainStyles]

// Wrapper component to handle configuration props
const MSTCalculatorWrapper = defineComponent({
  props: {
    // Config options
    apiUrl: String,
    halykPaymentUrl: String,
    halykTerminalId: String,
    kaspiInvoiceUrl: String,
    epayTokenUrl: String,
    epayPostLink: String,
    appUrl: String,

    // Calculator props
    isCabinet: Boolean,
    isMock: Boolean,
    lang: String as () => 'ru' | 'kk' | 'en',
    step: Number,
    orderNumber: String,
  },
  setup(props, { emit }) {
    // Apply configuration immediately
    if (props.apiUrl) {
      setConfig({
        apiUrl: props.apiUrl,
        halykPaymentUrl: props.halykPaymentUrl,
        halykTerminalId: props.halykTerminalId,
        kaspiInvoiceUrl: props.kaspiInvoiceUrl,
        epayTokenUrl: props.epayTokenUrl,
        epayPostLink: props.epayPostLink,
        appUrl: props.appUrl,
      })
      updateSdkConfig(props.apiUrl)
    }

    onMounted(() => {
      // Inject Google Fonts and RemixIcon CDN for fonts to work inside Shadow DOM
      const instance = getCurrentInstance()
      if (instance?.vnode.el?.parentNode instanceof ShadowRoot) {
        const fontLink = document.createElement('link')
        fontLink.rel = 'stylesheet'
        fontLink.href =
          'https://fonts.googleapis.com/css2?family=Geologica:wght,CRSV@100..900,0&display=swap'
        instance.vnode.el.parentNode.appendChild(fontLink)

        const remixLink = document.createElement('link')
        remixLink.rel = 'stylesheet'
        remixLink.href =
          'https://cdn.jsdelivr.net/npm/remixicon@4.5.0/fonts/remixicon.css'
        instance.vnode.el.parentNode.appendChild(remixLink)
      }
    })

    return () =>
      h(MSTCalculator, {
        ...props,
        'onUpdate:step': (val: number) => emit('update:step', val),
        'onUpdate:orderNumber': (val: string) =>
          emit('update:orderNumber', val),
      })
  },
})

// @ts-ignore
const CalculatorElement = defineCustomElement({
  ...MSTCalculatorWrapper,
  // @ts-ignore
  styles: [...((MSTCalculator as any).styles || []), ...styles],
  // @ts-ignore
  configureApp(app: any) {
    // Setup Pinia
    const pinia = createPinia()
    app.use(pinia)
    setActivePinia(pinia)

    // Setup Vue Query
    const queryClient = new QueryClient()
    app.use(VueQueryPlugin, { queryClient })

    // Setup Router
    const router = createRouter({
      history: createMemoryHistory(), // Safe for widgets
      routes: [],
    })
    app.use(router)
  },
})

// Register the custom element
export function register() {
  if (!customElements.get('mst-calculator')) {
    customElements.define('mst-calculator', CalculatorElement)
  }
}

// Auto-register if window is available
if (typeof window !== 'undefined' && !customElements.get('mst-calculator')) {
  customElements.define('mst-calculator', CalculatorElement)
}

export { CalculatorElement }
