<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { NButton } from 'nomad-ui'
import { useMstReset } from '../../mst-calculator/model/composables/useMstReset'
import { useMstI18n } from '../../mst-calculator/model/composables/useMstI18n'
import RiCheckLine from '~icons/ri/check-line'

const router = useRouter()
const { goHome, resetAllData } = useMstReset()
const { t } = useMstI18n()

onMounted(() => {
  resetAllData()
  // Optional: clear URL params if they were present
  if (Object.keys(router.currentRoute.value.query).length > 0) {
    router.replace({ query: {} })
  }
})

const handleBackHome = () => {
  goHome()
}
</script>

<template>
  <div
    class="min-h-screen bg-[#F5F7F9] p-4 lg:p-8 flex justify-center items-center"
  >
    <div
      class="w-full max-w-lg bg-white rounded-3xl p-10 shadow-sm text-center"
    >
      <div
        class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <ri-check-line class="text-3xl text-[#22C55E]" />
      </div>

      <h2 class="text-3xl font-bold mb-4">{{ t.payment.successTitle }}</h2>
      <p class="text-gray-500 mb-8 max-w-xs mx-auto">
        {{ t.payment.successDesc }}
      </p>

      <NButton
        class="h-[56px] w-full rounded-xl bg-[#22C55E] text-base font-medium hover:bg-[#22C55E]/90 text-white"
        @click="handleBackHome"
        color="none"
      >
        {{ t.payment.backToMain }}
      </NButton>
    </div>
  </div>
</template>
