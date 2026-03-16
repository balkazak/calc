<script setup lang="ts">
import { onMounted } from 'vue'
import { useMstDictionaries } from '../../model/composables/useMstDictionaries'
import { useMstStore } from '../../model/store/mst.store'
import { useMstOrderActions } from '../../model/store/order/order.actions'
import { CalculatorParamsForm } from '../forms'

useMstDictionaries()
const store = useMstStore()
const { calculatePrice } = useMstOrderActions()

onMounted(() => {
  if (
    store.params.country.length &&
    store.params.dates &&
    store.params.amount
  ) {
    calculatePrice()
  }
})
</script>
<template>
  <CalculatorParamsForm />
</template>
