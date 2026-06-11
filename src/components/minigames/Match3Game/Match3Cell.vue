<template>
  <div
    class="match3-cell"
    :class="{
      selected: isSelected,
      disappearing: cell?.willDisappear && cell?.type === '调研',
      'will-disappear': cell?.willDisappear && cell?.type === '调研'
    }"
    :style="{ backgroundColor: cell?.color + '20', borderColor: cell?.color }"
    @click="$emit('select')"
  >
    <span v-if="cell" class="cell-icon" :style="{ filter: cell?.willDisappear && cell?.type === '调研' ? 'brightness(1.2)' : 'none' }">
      {{ cell.icon }}
    </span>
    <span v-if="cell?.willDisappear && cell?.type === '调研'" class="disappear-indicator">
      ⏳
    </span>
  </div>
</template>

<script setup>
defineProps({
  cell: {
    type: Object,
    default: null
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>

<style scoped>
.match3-cell {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
}

.match3-cell:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.match3-cell.selected {
  border-color: #FBBF24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.3);
  transform: scale(1.1);
  z-index: 10;
}

.match3-cell.disappearing {
  animation: pulse 1s infinite;
}

.match3-cell.will-disappear::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: #EF4444;
  border-radius: 50%;
}

.cell-icon {
  font-size: 18px;
  line-height: 1;
}

.disappear-indicator {
  position: absolute;
  top: -3px;
  right: -3px;
  font-size: 10px;
  animation: bounce 0.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>