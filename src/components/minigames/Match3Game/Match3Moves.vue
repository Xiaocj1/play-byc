<template>
  <div class="match3-moves" :class="status">
    <span class="moves-icon">⏰</span>
    <span class="moves-count">{{ moves }}</span>
    <span class="moves-label">剩余步数</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  moves: {
    type: Number,
    required: true
  },
  totalMoves: {
    type: Number,
    default: 20
  }
})

const status = computed(() => {
  const ratio = props.moves / props.totalMoves
  if (ratio > 0.5) return 'normal'
  if (ratio > 0.25) return 'warning'
  return 'danger'
})
</script>

<style scoped>
.match3-moves {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.match3-moves.normal {
  border: 2px solid #10B981;
}

.match3-moves.warning {
  border: 2px solid #FBBF24;
}

.match3-moves.danger {
  border: 2px solid #EF4444;
  animation: shake 0.5s infinite;
}

.moves-icon {
  font-size: 18px;
}

.moves-count {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  min-width: 36px;
  text-align: center;
}

.moves-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}
</style>