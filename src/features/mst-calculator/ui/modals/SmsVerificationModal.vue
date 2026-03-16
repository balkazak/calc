<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useMstI18n } from '../../model/composables/useMstI18n'
import { formatDuration } from '../../../../shared/utils/date'
import { maskPhone } from '../../../../shared/utils/format'
import { differenceInSeconds, parseISO } from 'date-fns'

const props = defineProps<{
  open: boolean
  phone: string
  loading?: boolean
  expiresAt?: string | null
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm', code: string): void
  (e: 'resend'): void
}>()

const { t, lang } = useMstI18n()
const code = ref(['', '', '', ''])
const inputRefs = ref<HTMLInputElement[]>([])
const timer = ref(0)
let interval: any = null

const startTimer = () => {
  if (interval) clearInterval(interval)

  const updateTimer = () => {
    if (props.expiresAt) {
      const diff = differenceInSeconds(parseISO(props.expiresAt), new Date())
      timer.value = Math.max(0, diff)
    } else {
      timer.value = 0
    }

    if (timer.value <= 0) {
      clearInterval(interval)
    }
  }

  updateTimer()
  interval = setInterval(updateTimer, 1000)
}

watch(
  () => props.open,
  async (val) => {
    if (val) {
      code.value = ['', '', '', '']
      startTimer()
      await nextTick()
      inputRefs.value[0]?.focus()
    }
  }
)

watch(
  () => props.expiresAt,
  () => {
    if (props.open) startTimer()
  }
)

onMounted(() => {
  if (props.open) {
    startTimer()
    nextTick(() => {
      inputRefs.value[0]?.focus()
    })
  }
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

const handleInput = (index: number, e: Event) => {
  const input = e.target as HTMLInputElement
  const value = input.value.replace(/\D/g, '')

  if (value) {
    code.value[index] = value.slice(-1)
    if (index < 3) {
      inputRefs.value[index + 1]?.focus()
    }
  }

  if (code.value.every((char) => char !== '')) {
    emit('confirm', code.value.join(''))
  }
}

const handleKeyDown = (index: number, e: KeyboardEvent) => {
  if (e.key === 'Backspace') {
    if (!code.value[index] && index > 0) {
      code.value[index - 1] = ''
      inputRefs.value[index - 1]?.focus()
    } else {
      code.value[index] = ''
    }
    e.preventDefault()
  }
}

const handlePaste = (e: ClipboardEvent) => {
  const pasteData = e.clipboardData?.getData('text') || ''
  const digits = pasteData.replace(/\D/g, '').slice(0, 4).split('')

  digits.forEach((digit, i) => {
    if (i < 4) code.value[i] = digit
  })

  const lastIndex = Math.min(digits.length, 3)
  inputRefs.value[lastIndex]?.focus()

  if (code.value.every((char) => char !== '')) {
    emit('confirm', code.value.join(''))
  }
}

const handleResend = () => {
  if (timer.value === 0) {
    emit('resend')
  }
}

const formattedTimer = computed(() => formatDuration(timer.value))
const maskedPhone = computed(() => maskPhone(props.phone))
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div
        v-if="open"
        class="fixed inset-0 z-[60] flex items-end lg:items-center justify-center p-0 lg:p-4"
      >
        <div
          class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          @click="emit('update:open', false)"
        ></div>

        <div
          class="relative w-full lg:max-w-md bg-white rounded-t-3xl lg:rounded-3xl shadow-2xl overflow-hidden p-8 flex flex-col items-center text-center sheet-content duration-300"
          @keydown.enter="
            code.every((c) => c !== '') && emit('confirm', code.join(''))
          "
        >
          <div
            class="mb-8 w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center"
          >
            <div class="relative">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"
                  fill="#FF4713"
                />
                <path d="M0 10H5V12H0V10ZM0 14H3V16H0V14Z" fill="#FF4713" />
              </svg>
            </div>
          </div>

          <h3 class="text-xl font-bold text-gray-900 mb-2">
            {{ t.step2.smsSentCode }}
          </h3>

          <p class="text-gray-500 mb-8 whitespace-nowrap">
            {{ t.step2.smsToPhone }} {{ maskedPhone }}
          </p>

          <div class="flex gap-3 mb-8" @paste="handlePaste">
            <input
              v-for="(char, index) in code"
              :ref="(el: any) => (inputRefs[index] = el)"
              :key="index"
              type="tel"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="1"
              class="w-14 h-16 lg:w-16 lg:h-20 text-center text-3xl font-bold bg-gray-50 border-2 border-transparent rounded-2xl focus:border-main-500 focus:bg-white outline-none transition-all"
              :class="{ 'opacity-50 pointer-events-none': loading }"
              :value="char"
              @input="handleInput(index, $event)"
              @keydown="handleKeyDown(index, $event)"
            />
          </div>

          <div v-if="loading" class="mb-4">
            <div
              class="w-6 h-6 border-2 border-main-500/20 border-t-main-500 rounded-full animate-spin mx-auto"
            ></div>
          </div>

          <div class="w-full">
            <p v-if="timer > 0" class="text-gray-500 font-medium">
              <template v-if="lang === 'kk'">
                {{ timer }} сек {{ t.step2.smsResendIn }}
              </template>
              <template v-else>
                {{ t.step2.smsResendIn }} {{ formattedTimer }}
              </template>
            </p>
            <button
              v-else
              @click="handleResend"
              class="text-main-500 font-bold hover:text-main-600 transition-colors"
              :disabled="loading"
            >
              {{ t.step2.smsResendCode }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.3s ease;
}

@media (max-width: 1023px) {
  .sheet-content {
    max-height: 85vh;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 24px);
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
