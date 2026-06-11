<template>
  <div v-if="showModal" class="quarterly-report-modal">
    <div class="quarterly-report-content">
      <button class="report-close" @click="close">X</button>

      <h2 class="report-title">📊 季度报表 - Q{{ quarter }}</h2>

      <div class="report-layout">
        <div class="report-left">
          <h3>待办列表</h3>
          <div class="quest-list">
            <div v-for="quest in quests" :key="quest.id" class="quest-item">
              {{ quest.name }}
            </div>
          </div>
        </div>

        <div class="report-center">
          <h3>背包卡牌</h3>
          <div class="card-list">
            <div v-for="card in cards" :key="card.instanceId" class="card-item">
              <div class="card-name">{{ card.name }}</div>
              <div class="card-rarity">{{ card.rarity }}</div>
            </div>
          </div>
        </div>

        <div class="report-right">
          <h3>结算预览</h3>
          <div class="report-preview">
            <div class="preview-score">
              <span>当前得分:</span>
              <span>{{ score }}</span>
            </div>
            <div class="preview-rating">
              <span>评级:</span>
              <span>{{ rating }}</span>
            </div>
          </div>

          <div class="report-actions">
            <button class="btn-pixel report-beauty-btn" @click="startBeauty">
              ✨ 报表美容
            </button>
            <button class="btn-pixel report-confirm" @click="confirmReport">
              确认结算
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useCardsStore } from '@/stores/cards'
import { useReportBeautyStore } from '@/stores/reportBeauty'

const game = useGameStore()
const cardsStore = useCardsStore()
const beautyStore = useReportBeautyStore()

const showModal = ref(false)
const quarter = computed(() => game.currentQuarter)
const quests = ref([])
const score = ref(0)
const rating = ref('-')

const cards = computed(() => cardsStore.backpack)

function open() {
  showModal.value = true
}

function close() {
  showModal.value = false
}

function startBeauty() {
  // 先关闭季度报表
  close()
  // 生成坏词
  const badWords = generateBadWords()
  // 开始报表美容
  beautyStore.startBeauty(badWords)
  // 触发父组件显示美容弹窗
  emit('show-beauty')
}

function confirmReport() {
  // 清除pending状态
  localStorage.removeItem('pendingQuarterlyBeauty')
  // 确认结算逻辑
  close()
}

function generateBadWords() {
  const words = []
  const mapping = {
    budgetNeg: { bad: '亏损', good: '战略性投入', score: 10, weight: 'light' },
    satLow: { bad: '员工满意度低', good: '团队处于磨合期', score: 15, weight: 'medium' },
    highDebt: { bad: '负债压力大', good: '财务杠杆利用中', score: 20, weight: 'medium' },
    fameLow: { bad: '市场口碑差', good: '品牌重塑期', score: 15, weight: 'medium' },
    progressSlow: { bad: '项目进度慢', good: '精细化打磨中', score: 10, weight: 'light' }
  }

  if (game.budget < 50) {
    words.push({ ...mapping.budgetNeg, caught: false })
  }
  if (game.satisfaction < 70) {
    words.push({ ...mapping.satLow, caught: false })
  }
  if (game.debt > 30) {
    words.push({ ...mapping.highDebt, caught: false })
  }
  if (game.fame < 60) {
    words.push({ ...mapping.fameLow, caught: false })
  }
  if (game.progress < 50) {
    words.push({ ...mapping.progressSlow, caught: false })
  }

  // 确保至少有一些坏词用于测试（如果都没有）
  if (words.length === 0) {
    words.push({ bad: '表现平平', good: '稳扎稳打', score: 10, weight: 'light', caught: false })
  }

  // 限制最多5个坏词
  return words.slice(0, 5)
}

const emit = defineEmits(['show-beauty'])

defineExpose({
  open,
  close
})
</script>

<style scoped>
.quarterly-report-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.quarterly-report-content {
  background: #16213e;
  border: 2px solid #e94560;
  border-radius: 12px;
  padding: 24px;
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.report-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #e94560;
  font-size: 24px;
  cursor: pointer;
}

.report-title {
  text-align: center;
  color: #e94560;
  font-size: 24px;
  margin-bottom: 20px;
}

.report-layout {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.report-left,
.report-center,
.report-right {
  background: #0f3460;
  border-radius: 8px;
  padding: 16px;
}

.report-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.btn-pixel {
  background: #e94560;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-pixel:hover {
  background: #c73e54;
  transform: translateY(-2px);
}

.card-item {
  background: #16213e;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}
</style>
