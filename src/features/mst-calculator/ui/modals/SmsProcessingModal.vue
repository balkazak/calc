<script setup lang="ts">
import { NButton } from 'nomad-ui'
import { useMstI18n } from '../../model/composables/useMstI18n'
import RiCheckLine from '~icons/ri/check-line'
import RiCloseLine from '~icons/ri/close-line'

const props = defineProps<{
  open: boolean
  status: 'pending' | 'success' | 'error'
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
  (e: 'retry'): void
}>()

const { t } = useMstI18n()

const handleClose = () => {
  if (props.status === 'error') {
    emit('retry')
  } else {
    emit('close')
    emit('update:open', false)
  }
}
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
          @click="status !== 'pending' ? emit('update:open', false) : null"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full lg:max-w-md bg-white rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden transform transition-all p-8 flex flex-col items-center text-center sheet-content duration-300"
          @keydown.enter="status !== 'pending' && handleClose()"
        >
          <!-- PENDING STATE -->
          <div
            v-if="status === 'pending'"
            class="w-full flex flex-col items-center"
          >
            <div class="mb-6 h-[72px] flex items-center justify-center">
              <div
                class="w-16 h-16 border-4 border-gray-100 border-t-main-500 rounded-full animate-spin"
              ></div>
            </div>

            <h3 class="font-bold text-title mb-2">
              {{ t.step2.kdpPendingTitle }}
            </h3>
            <p
              class="text-xs text-subtitle mb-6 max-w-xs mx-auto"
              v-html="t.step2.kdpPendingDesc"
            ></p>

            <div class="text-xs text-subtitle">
              {{ t.step2.kdpHelp }} <br />
              <a href="#" class="text-main-500 font-bold hover:underline">{{
                t.step2.kdpSupport
              }}</a>
            </div>
          </div>

          <!-- SUCCESS STATE -->
          <div
            v-else-if="status === 'success'"
            class="w-full flex flex-col items-center"
          >
            <div
              class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6"
            >
              <div
                class="w-8 h-8 rounded-full bg-main-500 flex items-center justify-center"
              >
                <ri-check-line class="text-white text-xl" />
              </div>
            </div>

            <h3 class="font-bold text-title mb-2">
              {{ t.step2.kdpSuccessTitle }}
            </h3>
            <p class="text-xs text-subtitle mb-8 max-w-xs mx-auto">
              {{ t.step2.kdpSuccessDesc }}
            </p>

            <NButton
              @click="handleClose"
              :label="t.common.understand"
              color="main"
              class="h-[44px] !text-sm w-full font-bold"
            />
          </div>

          <!-- ERROR STATE -->
          <div
            v-else-if="status === 'error'"
            class="w-full flex flex-col items-center"
          >
            <div
              class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6"
            >
              <div
                class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center"
              >
                <ri-close-line class="text-white text-xl" />
              </div>
            </div>

            <h3 class="text-xl font-bold text-gray-900 mb-2">
              {{ t.step2.kdpErrorTitle }}
            </h3>
            <p class="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
              {{ t.step2.kdpErrorDesc }}
            </p>

            <NButton
              @click="handleClose"
              :label="t.step2.retry"
              color="main"
              class="w-full font-bold h-[44px]"
            />
          </div>
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
  .sheet-content {
    max-height: 90vh;
    overflow-y: auto;
  }
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
</style>
