<template>
  <button
    class="ripple-button"
    :class="[`btn-${variant}`, { 'btn-disabled': disabled, 'btn-loading': loading }]"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-spinner"></span>
    <span class="btn-content" :class="{ 'btn-content-hidden': loading }">
      <slot></slot>
    </span>
    <span class="ripple" ref="rippleRef"></span>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'success', 'danger', 'ghost'].includes(val)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  ripple: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])
const rippleRef = ref(null)

function handleClick(event) {
  if (props.disabled || props.loading) return
  
  if (props.ripple) {
    createRipple(event)
  }
  
  emit('click', event)
}

function createRipple(event) {
  const button = event.currentTarget
  const ripple = button.querySelector('.ripple')
  
  if (!ripple) return
  
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.classList.add('ripple-active')
  
  setTimeout(() => {
    ripple.classList.remove('ripple-active')
  }, 600)
}
</script>

<style scoped>
.ripple-button {
  position: relative;
  overflow: hidden;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.ripple-button:active:not(.btn-disabled) {
  transform: scale(0.95);
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover:not(.btn-disabled) {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  transform: translateY(-2px);
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(245, 87, 108, 0.4);
}

.btn-secondary:hover:not(.btn-disabled) {
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.6);
  transform: translateY(-2px);
}

.btn-success {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(79, 172, 254, 0.4);
}

.btn-success:hover:not(.btn-disabled) {
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.6);
  transform: translateY(-2px);
}

.btn-danger {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(250, 112, 154, 0.4);
}

.btn-danger:hover:not(.btn-disabled) {
  box-shadow: 0 6px 20px rgba(250, 112, 154, 0.6);
  transform: translateY(-2px);
}

.btn-ghost {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-ghost:hover:not(.btn-disabled) {
  background: rgba(102, 126, 234, 0.1);
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-loading {
  cursor: wait;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s;
}

.btn-content-hidden {
  opacity: 0;
}

.btn-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ripple {
  position: absolute;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  transform: scale(0);
  pointer-events: none;
}

.ripple-active {
  animation: ripple-effect 0.6s ease-out;
}

@keyframes ripple-effect {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
