<template>
  <div v-if="isOpen" class="debug-overlay" @click.self="$emit('close')">
    <div class="debug-panel">
      <div class="debug-header">
        <span class="debug-title">🔧 调试面板</span>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      
      <div class="debug-section">
        <h3>难度参数</h3>
        
        <div class="param-item">
          <label>PRD出现概率</label>
          <div class="param-control">
            <input 
              type="range" 
              v-model="localConfig.prdProbability" 
              min="0.1" 
              max="0.8" 
              step="0.05"
            />
            <span>{{ (localConfig.prdProbability * 100).toFixed(0) }}%</span>
          </div>
        </div>
        
        <div class="param-item">
          <label>用户调研消失概率</label>
          <div class="param-control">
            <input 
              type="range" 
              v-model="localConfig.researchDisappearProbability" 
              min="0" 
              max="1" 
              step="0.05"
            />
            <span>{{ (localConfig.researchDisappearProbability * 100).toFixed(0) }}%</span>
          </div>
        </div>
        
        <div class="param-item">
          <label>总步数</label>
          <div class="param-control">
            <input 
              type="number" 
              v-model.number="localConfig.totalMoves" 
              min="10" 
              max="50"
            />
          </div>
        </div>
        
        <div class="param-item">
          <label>目标数量</label>
          <div class="param-control">
            <input 
              type="number" 
              v-model.number="localConfig.targetCount" 
              min="3" 
              max="15"
            />
          </div>
        </div>
        
        <div class="param-item">
          <label>灵感出现概率</label>
          <div class="param-control">
            <input 
              type="range" 
              v-model="localConfig.inspirationProbability" 
              min="0" 
              max="0.2" 
              step="0.01"
            />
            <span>{{ (localConfig.inspirationProbability * 100).toFixed(0) }}%</span>
          </div>
        </div>
      </div>
      
      <div class="debug-section">
        <h3>模拟玩家分布</h3>
        
        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-value extreme">{{ simulationResult?.extremeCompletion || 65 }}%</span>
            <span class="stat-label">极限完成</span>
          </div>
          <div class="stat-box">
            <span class="stat-value almost">{{ simulationResult?.almost || 10 }}%</span>
            <span class="stat-label">差一点</span>
          </div>
          <div class="stat-box">
            <span class="stat-value overachieve">{{ simulationResult?.overachieve || 10 }}%</span>
            <span class="stat-label">超额完成</span>
          </div>
          <div class="stat-box">
            <span class="stat-value no-retry">{{ simulationResult?.noRetry || 15 }}%</span>
            <span class="stat-label">无重来资格</span>
          </div>
        </div>
        
        <button class="simulate-btn" @click="runSimulation">
          模拟1000局
        </button>
      </div>
      
      <div class="debug-actions">
        <button class="btn-apply" @click="applyConfig">应用</button>
        <button class="btn-reset" @click="resetConfig">重置</button>
        <button class="btn-close" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  debugConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'apply', 'reset'])

const localConfig = reactive({ ...props.debugConfig })
const simulationResult = ref(null)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    Object.assign(localConfig, props.debugConfig)
  }
})

function applyConfig() {
  Object.assign(props.debugConfig, localConfig)
  emit('apply')
}

function resetConfig() {
  localConfig.prdProbability = 0.4
  localConfig.researchDisappearProbability = 0.3
  localConfig.totalMoves = 20
  localConfig.targetCount = 5
  localConfig.inspirationProbability = 0.05
  emit('reset')
}

function runSimulation() {
  const results = {
    extremeCompletion: 0,
    almost: 0,
    overachieve: 0,
    noRetry: 0
  }

  for (let i = 0; i < 1000; i++) {
    const completion = Math.random()
    
    if (completion >= 0.95) {
      results.extremeCompletion++
    } else if (completion >= 0.9) {
      results.almost++
    } else if (completion >= 0.8) {
      if (Math.random() < 0.5) {
        results.overachieve++
      } else {
        results.extremeCompletion++
      }
    } else if (completion >= 0.6) {
      results.almost++
    } else {
      results.noRetry++
    }
  }

  simulationResult.value = {
    extremeCompletion: Math.round((results.extremeCompletion / 1000) * 100),
    almost: Math.round((results.almost / 1000) * 100),
    overachieve: Math.round((results.overachieve / 1000) * 100),
    noRetry: Math.round((results.noRetry / 1000) * 100),
    totalSimulated: 1000
  }
}
</script>

<style scoped>
.debug-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.debug-panel {
  background: #1F2937;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.debug-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.debug-title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.close-btn:hover {
  color: #fff;
}

.debug-section {
  margin-bottom: 24px;
}

.debug-section h3 {
  color: #9CA3AF;
  font-size: 14px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.param-item {
  margin-bottom: 12px;
}

.param-item label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  margin-bottom: 4px;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-control input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  appearance: none;
  cursor: pointer;
}

.param-control input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #3B82F6;
  border-radius: 50%;
  cursor: pointer;
}

.param-control input[type="number"] {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 14px;
}

.param-control span {
  color: #fff;
  font-size: 14px;
  min-width: 40px;
  text-align: right;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-box {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-value.extreme {
  color: #10B981;
}

.stat-value.almost {
  color: #FBBF24;
}

.stat-value.overachieve {
  color: #3B82F6;
}

.stat-value.no-retry {
  color: #EF4444;
}

.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.simulate-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
}

.simulate-btn:hover {
  transform: scale(1.02);
}

.debug-actions {
  display: flex;
  gap: 12px;
}

.debug-actions button {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  border: none;
  cursor: pointer;
}

.btn-apply {
  background: linear-gradient(135deg, #10B981, #059669);
  color: #fff;
}

.btn-reset {
  background: linear-gradient(135deg, #FBBF24, #F59E0B);
  color: #1F2937;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}
</style>