<template>
  <div class="match3-result" :class="{ success: isSuccess, fail: !isSuccess }">
    <div class="result-header">
      <span class="result-icon">{{ isSuccess ? '✅' : '❌' }}</span>
      <span class="result-title">{{ isSuccess ? '成功！' : '失败！' }}</span>
    </div>
    
    <div class="result-stats">
      <div class="stat-item">
        <span class="stat-label">消除文档</span>
        <span class="stat-value">{{ totalRemoved }}个</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">目标</span>
        <span class="stat-value">{{ targetCount }}个</span>
      </div>
      <div v-if="comboCount > 0" class="stat-item">
        <span class="stat-label">连击次数</span>
        <span class="stat-value">{{ comboCount }}次</span>
      </div>
    </div>
    
    <div class="result-effects">
      <div v-for="(value, key) in effects" :key="key" class="effect-item">
        <span class="effect-name">{{ getEffectName(key) }}</span>
        <span class="effect-value" :class="value >= 0 ? 'positive' : 'negative'">
          {{ value >= 0 ? '+' : '' }}{{ value }}
        </span>
      </div>
    </div>
    
    <div class="result-actions">
      <button v-if="showRetry && !isSuccess" class="btn btn-retry" @click="$emit('retry')">
        重试
      </button>
      <button class="btn btn-primary" @click="$emit('continue')">
        {{ isSuccess ? '继续' : '放弃' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isSuccess: {
    type: Boolean,
    required: true
  },
  totalRemoved: {
    type: Number,
    default: 0
  },
  targetCount: {
    type: Number,
    default: 0
  },
  comboCount: {
    type: Number,
    default: 0
  },
  effects: {
    type: Object,
    default: () => ({})
  },
  showRetry: {
    type: Boolean,
    default: false
  }
})

defineEmits(['continue', 'retry'])

function getEffectName(key) {
  const names = {
    progress: '进度',
    satisfaction: '满意度',
    stress: '压力',
    '融资进度': '融资进度',
    fame: '声望'
  }
  return names[key] || key
}
</script>

<style scoped>
.match3-result {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  text-align: center;
  max-width: 300px;
  margin: 0 auto;
}

.match3-result.success {
  border: 2px solid #10B981;
}

.match3-result.fail {
  border: 2px solid #EF4444;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.result-icon {
  font-size: 32px;
}

.result-title {
  color: #fff;
  font-size: 24px;
  font-weight: bold;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.result-effects {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.effect-name {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.effect-value {
  font-size: 14px;
  font-weight: bold;
}

.effect-value.positive {
  color: #10B981;
}

.effect-value.negative {
  color: #EF4444;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: #fff;
}

.btn-primary:hover {
  transform: scale(1.05);
}

.btn-retry {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #1F2937;
}

.btn-retry:hover {
  transform: scale(1.05);
}
</style>