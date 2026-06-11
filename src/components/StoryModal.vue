<template>
  <div v-if="visible" class="story-modal">
    <div class="story-content">
      <div class="story-close" @click="close">×</div>
      <h2 class="story-title">{{ title }}</h2>
      <div class="story-text">{{ text }}</div>
      <button class="story-button" @click="onConfirm">{{ buttonText }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  buttonText: { type: String, default: '确定' }
});

const emit = defineEmits(['update:modelValue', 'confirm']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

function close() {
  visible.value = false;
}

function onConfirm() {
  emit('confirm');
  close();
}
</script>

<style scoped>
.story-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 100000;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
.story-content {
  background: linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%);
  border: 3px solid #ffd700;
  padding: 25px;
  max-width: 600px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.3);
}
.story-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #ffd700;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 10px #ffd700;
}
.story-text {
  font-size: 12px;
  color: #e5e5e5;
  line-height: 1.8;
  white-space: pre-line;
  margin-bottom: 20px;
}
.story-button {
  display: block;
  width: 100%;
  padding: 12px;
  font-size: 12px;
  color: #000;
  background: linear-gradient(180deg, #ffd700 0%, #b8860b 100%);
  border: none;
  cursor: pointer;
  font-family: 'Press Start 2P', monospace;
  transition: all 0.3s;
}
.story-button:hover {
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}
.story-close {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  transition: color 0.3s;
}
.story-close:hover {
  color: #ffd700;
}
</style>
