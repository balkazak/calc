<script setup lang="ts">
import { ref, watch } from 'vue'
import { NInput, NButton } from 'nomad-ui'
import { vMaska } from 'maska/vue'
import { useMstI18n } from '../../model/composables/useMstI18n'

const props = defineProps<{
  open: boolean
  initialPhone: string
  initialEmail: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', payload: { phone: string; email: string }): void
}>()

const { t } = useMstI18n()
const phone = ref('')
const email = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      phone.value = props.initialPhone
      email.value = props.initialEmail
    }
  }
)

const handleSave = () => {
  emit('save', {
    phone: phone.value,
    email: email.value,
  })
  emit('update:open', false)
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
          @click="emit('update:open', false)"
        ></div>

        <!-- Modal -->
        <div
          class="relative w-full lg:max-w-md bg-white rounded-t-3xl lg:rounded-2xl shadow-xl overflow-hidden transform transition-all sheet-content duration-300"
          @keydown.enter="handleSave"
        >
          <div class="p-6">
            <div class="mb-6">
              <h3 class="text-base font-bold text-gray-900 mb-1">
                {{ t.step2.editContact }}
              </h3>
              <p class="text-sm text-gray-500">{{ t.step2.titleInput }}</p>
            </div>

            <div class="space-y-4 mb-6">
              <NInput
                v-model="phone"
                v-maska="'+7 (###) ###-##-##'"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                :label="t.step2.phoneLabel"
              />
              <NInput
                v-model="email"
                type="email"
                placeholder="example@mail.com"
                :label="t.step2.emailLabel"
              />
            </div>

            <NButton
              @click="handleSave"
              :label="t.step2.confirm"
              color="main"
              class="w-full font-bold h-[48px]"
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
