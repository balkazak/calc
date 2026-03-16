import { useQuery } from '@tanstack/vue-query'
import { dictionariesApi } from '../../api/dictionaries.api'
import { useMstStore } from '../store/mst.store'
import { watch } from 'vue'

export function useMstDictionaries() {
  const store = useMstStore()

  const { data, ...rest } = useQuery({
    queryKey: ['mst-dictionaries', store.lang],
    queryFn: () =>
      dictionariesApi.getProductCalculatorSchema('mst', 'standard', store.lang),
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: store.step === 1,
  })

  watch(
    () => data.value,
    (newData) => {
      if (newData?.data?.dictionaries) {
        store.setDictionaries(newData.data.dictionaries)
      }
    },
    { immediate: true }
  )

  return { data, ...rest }
}
