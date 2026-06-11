<template>
  <Transition :name="transitionName" mode="out-in">
    <slot></slot>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'fade-slide',
    validator: (val) => ['fade', 'slide', 'fade-slide', 'zoom', 'flip'].includes(val)
  },
  duration: {
    type: Number,
    default: 300
  }
})

const transitionName = ref(`transition-${props.type}`)

// 动态设置过渡时间
watch(() => props.duration, (newVal) => {
  document.documentElement.style.setProperty('--transition-duration', `${newVal}ms`)
}, { immediate: true })
</script>

<style>
:root {
  --transition-duration: 300ms;
}

/* Fade */
.transition-fade-enter-active,
.transition-fade-leave-active {
  transition: opacity var(--transition-duration) ease;
}

.transition-fade-enter-from,
.transition-fade-leave-to {
  opacity: 0;
}

/* Slide */
.transition-slide-enter-active,
.transition-slide-leave-active {
  transition: transform var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-slide-enter-from {
  transform: translateX(100%);
}

.transition-slide-leave-to {
  transform: translateX(-100%);
}

/* Fade Slide */
.transition-fade-slide-enter-active,
.transition-fade-slide-leave-active {
  transition: all var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.transition-fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Zoom */
.transition-zoom-enter-active,
.transition-zoom-leave-active {
  transition: all var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.transition-zoom-leave-to {
  opacity: 0;
  transform: scale(1.1);
}

/* Flip */
.transition-flip-enter-active,
.transition-flip-leave-active {
  transition: all var(--transition-duration) ease;
  backface-visibility: hidden;
}

.transition-flip-enter-from {
  opacity: 0;
  transform: rotateY(90deg);
}

.transition-flip-leave-to {
  opacity: 0;
  transform: rotateY(-90deg);
}
</style>
