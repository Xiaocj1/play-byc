<template>
  <div id="app">
    <router-view v-slot="{ Component }">
      <Transition name="page-fade-slide" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>
    <ToastNotification ref="toastRef" />
    <ParticleEffect ref="particleRef" />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import ToastNotification from './components/ToastNotification.vue'
import ParticleEffect from './components/ParticleEffect.vue'

const toastRef = ref(null)
const particleRef = ref(null)

// 提供全局方法
provide('toast', {
  success: (msg, duration) => toastRef.value?.success(msg, duration),
  error: (msg, duration) => toastRef.value?.error(msg, duration),
  warning: (msg, duration) => toastRef.value?.warning(msg, duration),
  info: (msg, duration) => toastRef.value?.info(msg, duration),
  show: (msg, type, duration) => toastRef.value?.addToast(msg, type, duration)
})

provide('particle', {
  start: (options) => {
    if (particleRef.value) {
      particleRef.value.active = true
      particleRef.value.type = options.type || 'sparkle'
      particleRef.value.color = options.color || '#ffd700'
      particleRef.value.count = options.count || 50
      particleRef.value.duration = options.duration || 2000
    }
  },
  stop: () => {
    if (particleRef.value) {
      particleRef.value.active = false
    }
  }
})
</script>

<style>
/* 页面过渡动画 */
.page-fade-slide-enter-active,
.page-fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}

.page-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(1.02);
}
</style>


