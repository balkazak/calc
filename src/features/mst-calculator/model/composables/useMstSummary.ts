import { computed } from 'vue'
import { format } from 'date-fns'
import { useMstStore } from '../store/mst.store'
import { formatCurrency, pluralize } from '@/shared/utils/format'
import { useMstI18n } from './useMstI18n'

export function useMstSummary() {
  const store = useMstStore()
  const { t } = useMstI18n()

  const stepSummary = computed(() => {
    if (store.step === 1) return null

    const count = store.params.touristsInfo.length
    const amount = formatCurrency(store.price)

    let dateStr = ''
    if (
      store.params.dates &&
      store.params.dates.length === 2 &&
      store.params.dates[0] &&
      store.params.dates[1]
    ) {
      try {
        const d1 = new Date(store.params.dates[0])
        const d2 = new Date(store.params.dates[1])
        dateStr = `Срок действия с ${format(d1, 'dd.MM.yy')} по ${format(
          d2,
          'dd.MM.yy'
        )}`
      } catch (e) {
        console.error(e)
      }
    }

    return {
      line1: `${t.value.step2.tourists} • ${pluralize(count, t.value.step1.pluralizePeople)}`,
      line2: `${t.value.step1.sum} ${amount}`,
      line3: dateStr,
    }
  })

  return {
    stepSummary,
  }
}
