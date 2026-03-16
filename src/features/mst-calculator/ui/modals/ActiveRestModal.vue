<script setup lang="ts">
import { NButton } from 'nomad-ui'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiCloseLine from '~icons/ri/close-line'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const { t } = useMstI18n()
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/50 transition-opacity"
          @click="emit('update:open', false)"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full lg:max-w-2xl bg-white rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden transform transition-all p-8 flex flex-col sheet-content duration-300"
        >
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-900">
              {{ t.activeRestModal.title }}
            </h3>
            <button
              @click="emit('update:open', false)"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <ri-close-line class="text-xl" />
            </button>
          </div>

          <div
            class="text-sm text-gray-600 space-y-4 mb-8 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4"
          >
            <p>{{ t.activeRestModal.desc }}</p>
            <ul
              class="list-outside list-disc pl-5 space-y-4 text-gray-500 marker:text-gray-400"
            >
              <li
                v-for="(bullet, index) in t.activeRestModal.bullets"
                :key="index"
              >
                {{ bullet }}
              </li>
            </ul>
          </div>

          <NButton
            @click="emit('update:open', false)"
            :label="t.common.understand"
            color="main"
            class="w-full font-bold h-[44px]"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

@media (max-width: 1023px) {
  .sheet-enter-active .sheet-content {
    animation: slideUp 0.3s ease-out;
  }
  .sheet-leave-active .sheet-content {
    animation: slideDown 0.3s ease-in;
  }
}

.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
