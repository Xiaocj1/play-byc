<template>
  <div class="match3-goal">
    <div class="goal-header">
      <span class="goal-icon">{{ getTargetIcon() }}</span>
      <span class="goal-text">{{ goalText }}</span>
    </div>
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: progressPercentage + '%' }"
        :class="{ complete: isCompleted }"
      ></div>
    </div>
    <div class="progress-text">
      <span>{{ current }}/{{ target }}</span>
      <span v-if="overachieveBonus" class="bonus-badge">🎉 超额完成!</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  targetType: {
    type: String,
    default: 'PRD'
  },
  targetCount: {
    type: Number,
    default: 5
  },
  currentCount: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  overachieveBonus: {
    type: Boolean,
    default: false
  }
})

const current = computed(() => props.currentCount)
const target = computed(() => props.targetCount)
const progressPercentage = computed(() => Math.min((current.value / target.value) * 100, 100))

const goalText = computed(() => {
  const typeNames = {
    PRD: 'PRD',
    需求: '需求文档',
    调研: '调研',
    BP: 'BP'
  }
  return `消除${target.value}个${typeNames[props.targetType] || props.targetType}`
})

function getTargetIcon() {
  const icons = {
    PRD: '📄',
    需求: '📋',
    调研: '🔍',
    BP: '📊'
  }
  return icons[props.targetType] || '📄'
}
</script>

<style scoped>
.match3-goal {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
}

.goal-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.goal-icon {
  font-size: 20px;
}

.goal-text {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981, #34D399);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-fill.complete {
  background: linear-gradient(90deg, #FBBF24, #F59E0B);
}

.progress-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text span:first-child {
  color: #fff;
  font-size: 12px;
}

.bonus-badge {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #1F2937;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 10px;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}
</style>