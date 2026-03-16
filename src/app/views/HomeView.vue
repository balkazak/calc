<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const navigateTo = (route: string) => {
  router.push({ name: route })
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-5"
  >
    <h1 class="text-4xl font-bold text-gray-800 mb-12 text-center">
      Nomad Calculators
    </h1>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl"
    >
      <!-- MST Calculator Card -->
      <div
        @click="navigateTo('mst')"
        class="bg-white rounded-xl p-8 cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center"
      >
        <h3 class="text-2xl font-semibold text-gray-800 mb-3">
          MST Calculator
        </h3>
        <p class="text-gray-600 m-0">Calculate MST related metrics</p>
      </div>

      <div
        class="bg-white rounded-xl p-8 cursor-pointer shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center opacity-70"
      >
        <h3 class="text-2xl font-semibold text-gray-800 mb-3">NS Calculator</h3>
        <p class="text-gray-600 m-0">Coming Soon</p>
      </div>
    </div>
  </div>
</template>
