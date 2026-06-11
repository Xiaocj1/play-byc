<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        :class="['toast', toast.type]"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

function addToast(message, type = 'info', duration = 3000) {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

function success(message, duration) {
  addToast(message, 'success', duration)
}

function error(message, duration) {
  addToast(message, 'error', duration)
}

function warning(message, duration) {
  addToast(message, 'warning', duration)
}

function info(message, duration) {
  addToast(message, 'info', duration)
}

function getIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || 'ℹ️'
}

defineExpose({ success, error, warning, info, show: addToast })
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.toast.success {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.toast.error {
  background: rgba(239, 68, 68, 0.9);
  color: white;
}

.toast.warning {
  background: rgba(251, 191, 36, 0.9);
  color: #1F2937;
}

.toast.info {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.toast-icon {
  font-size: 16px;
}

.toast-message {
  max-width: 300px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}
</style>
