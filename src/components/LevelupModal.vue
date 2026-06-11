<template>
  <div v-if="visible" class="levelup-modal" @click.self="close">
    <div class="levelup-content">
      <div class="levelup-header">
        <h2 class="levelup-title">🔥 卷一卷</h2>
        <button class="levelup-close" @click="close">X</button>
      </div>
      
      <div class="levelup-info">
        <div class="current-rank">
          <span class="label">当前职级：</span>
          <span class="value">{{ currentRankData?.name }} ({{ currentRankData?.id?.toUpperCase() }})</span>
        </div>
        <div class="experience">
          <span class="label">项目经验：</span>
          <span class="value">{{ projectExperience }} XP</span>
        </div>
      </div>
      
      <div class="rank-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressToNextRank}%` }"></div>
        </div>
        <div class="progress-text">{{ progressToNextRank }}% 升级到 {{ nextRankData?.name }}</div>
      </div>
      
      <div class="unlock-info" v-if="nextRankData">
        <h3>升级解锁：</h3>
        <ul>
          <li>基础预算增加：{{ currentRankData?.budget || 0 }} → {{ nextRankData?.budget || 0 }}</li>
          <li>解锁更多工具链选项</li>
        </ul>
      </div>
      
      <div class="levelup-hint">
        <p>💡 每完成一次游戏会获得经验奖励</p>
        <p>胜利：+2 XP | 失败：+0.5 XP</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ranksData from '@/data/ranks.json'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const projectExperience = ref(0)
const currentRank = ref('p5')

onMounted(() => {
  loadData()
})

function loadData() {
  projectExperience.value = parseFloat(localStorage.getItem('fair_office_project_experience') || '0')
  currentRank.value = localStorage.getItem('fair_office_current_rank') || 'p5'
}

const currentRankIndex = computed(() => {
  return ranksData.ranks.findIndex(r => r.id === currentRank.value)
})

const currentRankData = computed(() => {
  return ranksData.ranks.find(r => r.id === currentRank.value)
})

const nextRankData = computed(() => {
  const index = currentRankIndex.value
  if (index < ranksData.ranks.length - 1) {
    return ranksData.ranks[index + 1]
  }
  return null
})

const progressToNextRank = computed(() => {
  if (!nextRankData.value) return 100
  const current = currentRankData.value
  if (!current) return 0
  
  const next = nextRankData.value
  const requiredExp = next?.required_exp || 0
  
  if (projectExperience.value >= requiredExp) {
    return 100
  }
  
  const currentRequired = current?.required_exp || 0
  const progress = ((projectExperience.value - currentRequired) / (requiredExp - currentRequired)) * 100
  return Math.max(0, Math.min(100, Math.round(progress)))
})

function close() {
  visible.value = false
}
</script>

<style scoped>
.levelup-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  justify-content: center;
  align-items: center;
  z-index: 10015;
}

.levelup-content {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 4px solid #00ff41;
  box-shadow: 8px 8px 0 #0a0a0f;
  max-width: 500px;
  width: 95%;
  position: relative;
  padding: 30px;
}

.levelup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.levelup-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #00ff41;
  text-shadow: 2px 2px 0 #0a0a0f;
}

.levelup-close {
  background: #1a1a2e;
  color: #00ff41;
  border: 2px solid #00ff41;
  box-shadow: 2px 2px 0 #0a0a0f;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 6px 10px;
  cursor: pointer;
}

.levelup-info {
  margin-bottom: 25px;
}

.current-rank,
.experience {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.label {
  color: #888;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.value {
  color: #fff;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.rank-progress {
  margin-bottom: 25px;
}

.progress-bar {
  height: 20px;
  background: #333;
  border: 2px solid #666;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff41, #00ffaa);
  transition: width 0.3s ease;
}

.progress-text {
  color: #00ff41;
  font-size: 9px;
  text-align: center;
  font-family: 'Press Start 2P', monospace;
}

.unlock-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #333;
}

.unlock-info h3 {
  color: #ffd700;
  font-size: 10px;
  margin-bottom: 10px;
  font-family: 'Press Start 2P', monospace;
}

.unlock-info ul {
  padding-left: 20px;
  margin: 0;
}

.unlock-info li {
  color: #aaa;
  font-size: 9px;
  margin-bottom: 5px;
  font-family: 'Press Start 2P', monospace;
  line-height: 1.5;
}

.levelup-hint {
  background: rgba(255, 215, 0, 0.1);
  padding: 15px;
  border: 2px dashed #ffd700;
}

.levelup-hint p {
  color: #ffd700;
  font-size: 9px;
  margin: 5px 0;
  font-family: 'Press Start 2P', monospace;
  line-height: 1.5;
}
</style>
