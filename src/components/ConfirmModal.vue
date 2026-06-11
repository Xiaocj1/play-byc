<template>
  <div v-if="visible" class="confirm-overlay">
    <div class="confirm-box">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="confirm-buttons">
        <button @click="handleCancel">取消</button>
        <button @click="handleConfirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '确认'
  },
  message: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
  visible.value = false
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

.confirm-box {
  background: #222;
  color: white;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  border: 2px solid #444;
}

.confirm-box h3 {
  margin: 0 0 15px 0;
  color: #fff;
}

.confirm-box p {
  margin: 0 0 20px 0;
  color: #aaa;
}

.confirm-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.confirm-buttons button {
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
}

.confirm-buttons button:first-child {
  background: #555;
  color: white;
}

.confirm-buttons button:last-child {
  background: #667eea;
  color: white;
}
</style>
