<template>
  <div class="recruit-modal" v-if="isOpen">
    <div class="recruit-content">
      <div class="recruit-header">
        <h2 class="recruit-title">📱 人才招聘中心</h2>
        <button class="recruit-close" @click="close">✕</button>
      </div>
      
      <div class="recruit-info">
        <span>📦 HC: {{ cardsStore.currentHC }}</span>
        <span 
          v-if="cardsStore.currentPool" 
          class="current-pool"
          @click="showPoolSelector = !showPoolSelector"
        >
          招聘方向: {{ cardsStore.currentPool.icon }} {{ cardsStore.currentPool.name }} ▼
        </span>
        <span 
          v-else 
          class="current-pool"
          @click="showPoolSelector = !showPoolSelector"
        >
          选择招聘方向 ▼
        </span>
      </div>
      
      <!-- 招聘方向选择器 -->
      <div v-if="showPoolSelector" class="pool-selector">
        <div class="pool-list">
          <button
            v-for="pool in cardsStore.pools"
            :key="pool.id"
            class="pool-btn"
            :class="{ active: cardsStore.currentPool?.id === pool.id }"
            @click="selectPool(pool.id); showPoolSelector = false"
          >
            <span class="pool-icon">{{ pool.icon }}</span>
            <span class="pool-name">{{ pool.name }}</span>
          </button>
        </div>
      </div>
      
      <!-- 爆率显示 -->
      <div v-if="cardsStore.currentPool" class="pool-rates">
        <h3>📊 招聘概率</h3>
        <div class="rates-list">
          <div class="rate-item">
            <span class="rate-label">R</span>
            <div class="rate-bar">
              <div class="rate-fill r" :style="{ width: currentPoolRates.R + '%' }"></div>
            </div>
            <span class="rate-value">{{ currentPoolRates.R }}%</span>
          </div>
          <div class="rate-item">
            <span class="rate-label">SR</span>
            <div class="rate-bar">
              <div class="rate-fill sr" :style="{ width: currentPoolRates.SR + '%' }"></div>
            </div>
            <span class="rate-value">{{ currentPoolRates.SR }}%</span>
          </div>
          <div class="rate-item">
            <span class="rate-label">SSR</span>
            <div class="rate-bar">
              <div class="rate-fill ssr" :style="{ width: currentPoolRates.SSR + '%' }"></div>
            </div>
            <span class="rate-value">{{ currentPoolRates.SSR }}%</span>
          </div>
        </div>
        
        <!-- 保底进度 -->
        <div class="pity-system">
          <div class="pity-info">
            <span class="pity-label">🎯 保底进度：</span>
            <span class="pity-text">{{ pityText }}</span>
          </div>
          <div class="pity-bar">
            <div class="pity-fill" :style="{ width: pityProgressPercent + '%' }"></div>
          </div>
        </div>
      </div>
      
      <!-- 浏览记录 -->
      <div class="browse-history">
        <h3>👀 最近浏览记录</h3>
        <div v-if="browseHistory.length > 0" class="history-list">
          <div
            v-for="(record, index) in currentPageRecords"
            :key="index"
            class="history-item"
            :class="record.rarity.toLowerCase()"
          >
            <span class="history-name">{{ record.name }}</span>
            <span class="history-rarity">{{ getRarityStars(record.rarity) }}</span>
          </div>
        </div>
        <div v-else class="history-empty">
          暂无浏览记录
        </div>
        
        <!-- 分页器 -->
        <div v-if="totalPages > 1" class="history-pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="prevPage"
          >
            ←
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="nextPage"
          >
            →
          </button>
        </div>
      </div>
      
      <div class="recruit-actions">
        <button
          class="recruit-draw"
          :disabled="!cardsStore.currentPool || !canDraw"
          @click="draw"
        >
          🎫 单抽 ({{ recruitCost }})
        </button>
        <div v-if="gameStore.budget < recruitCost" class="cost-warning">
          ⚠️ 资金不足！当前资金: {{ gameStore.budget }}
        </div>
      </div>
      
      <div v-if="drawnCard" class="result-overlay">
        <div class="result-card" :class="drawnCard.rarity.toLowerCase()">
          <div class="result-icon">🎉</div>
          <h3>发现人才！</h3>
          <div v-if="drawnCard.image" class="result-image">
            <img :src="drawnCard.image" :alt="drawnCard.name" />
          </div>
          <div class="result-name">{{ drawnCard.name }}</div>
          <div class="result-rarity">{{ getRarityStars(drawnCard.rarity) }}</div>
          <div class="result-position">{{ drawnCard.position }}</div>
          <div class="result-desc">{{ drawnCard.description }}</div>
          <div class="result-actions">
            <button class="result-btn reject" @click="rejectCard">
              ❌ 婉拒
            </button>
            <button 
              class="result-btn accept" 
              :disabled="!canDraw"
              @click="acceptCard"
            >
              ✅ 录用
            </button>
          </div>
          <div v-if="!canDraw" class="result-tip">
            HC已满，无法录用
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useGameStore } from '@/stores/game'

const props = defineProps(['open'])
const emit = defineEmits(['close'])

const cardsStore = useCardsStore()
const gameStore = useGameStore()
const drawnCard = ref(null)
const browseHistory = ref([])
const currentPage = ref(1)
const pageSize = 5 // 每页显示5条
const showPoolSelector = ref(false)

const isOpen = ref(false)

// 检查是否可以抽卡（排除初始团队和管培生）
const canDraw = computed(() => {
  // 检查HC
  const normalCards = cardsStore.backpack.filter(c => !c.is_variant && !c.id.startsWith('initial_')).length
  if (normalCards >= cardsStore.hc) return false
  // 检查资金
  if (gameStore.budget < recruitCost.value) return false
  return true
})

// 检查是否可以十连（需要10倍资金）
const canDrawTen = computed(() => {
  if (!canDraw.value) return false
  return gameStore.budget >= recruitCost.value * 10
})

// 计算抽卡成本（U型曲线）- 使用gameStore中的方法
const recruitCost = computed(() => {
  // 从currentPool获取预期稀有度，默认为R
  let rarity = 'R'
  if (cardsStore.currentPool) {
    // 简单估算池子里的主要稀有度
    const cards = cardsStore.currentPool.cards
    const counts = { R: 0, SR: 0, SSR: 0 }
    cards.forEach(c => counts[c.rarity]++)
    if (counts.SSR > 0) rarity = 'SSR'
    else if (counts.SR > counts.R) rarity = 'SR'
  }
  return gameStore.getDrawCost(rarity)
})

// 计算当前池子的爆率（基于实际抽卡权重）
const currentPoolRates = computed(() => {
  if (!cardsStore.currentPool) {
    return { R: 0, SR: 0, SSR: 0 }
  }
  
  // 使用实际抽卡权重计算爆率
  // 权重机制：SSR 5%, SR 15%, R 80%
  const cards = cardsStore.currentPool.cards
  let totalWeight = 0
  const weightCounts = { R: 0, SR: 0, SSR: 0 }
  
  cards.forEach(c => {
    switch(c.rarity) {
      case 'SSR': 
        weightCounts.SSR += 5
        totalWeight += 5
        break
      case 'SR': 
        weightCounts.SR += 15
        totalWeight += 15
        break
      default: 
        weightCounts.R += 80
        totalWeight += 80
        break
    }
  })
  
  if (totalWeight === 0) {
    return { R: 0, SR: 0, SSR: 0 }
  }
  
  return {
    R: Math.round((weightCounts.R / totalWeight) * 100),
    SR: Math.round((weightCounts.SR / totalWeight) * 100),
    SSR: Math.round((weightCounts.SSR / totalWeight) * 100)
  }
})

// 保底进度
const pityProgress = computed(() => {
  return cardsStore.getPityProgress()
})

const pityProgressPercent = computed(() => {
  return Math.min((pityProgress.value / 10) * 100, 100)
})

const pityText = computed(() => {
  const remaining = 10 - pityProgress.value
  if (remaining <= 0) {
    return '🎉 保底触发！必出SR+！'
  }
  return `还差 ${remaining} 抽必出SR`
})

// 分页相关计算
const totalPages = computed(() => {
  return Math.ceil(browseHistory.value.length / pageSize)
})

const currentPageRecords = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return browseHistory.value.slice(start, end)
})

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function show() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
  drawnCard.value = null
  emit('close')
}

function selectPool(poolId) {
  cardsStore.selectPool(poolId)
}

function draw() {
  const card = cardsStore.drawCard()
  if (card) {
    drawnCard.value = card
    // 添加到浏览记录（放在最前面）
    browseHistory.value.unshift({
      name: card.name,
      rarity: card.rarity,
      position: card.position,
      timestamp: Date.now()
    })
    // 最多保留20条记录
    if (browseHistory.value.length > 20) {
      browseHistory.value = browseHistory.value.slice(0, 20)
    }
  }
}

function acceptCard() {
  if (drawnCard.value && canDraw.value) {
    // 直接添加到cardsStore的backpack
    cardsStore.backpack.push(drawnCard.value)
    // 扣除预算
    gameStore.updateBudget(-recruitCost.value)
    // 保存
    cardsStore.saveToStorage()
    gameStore.saveGame()
    // 关闭弹窗
    drawnCard.value = null
  }
}

function rejectCard() {
  // 直接关闭，不添加到背包
  drawnCard.value = null
}

function getRarityStars(rarity) {
  const stars = {
    'R': '⭐',
    'SR': '⭐⭐',
    'SSR': '⭐⭐⭐'
  }
  return stars[rarity] || ''
}

// 暴露给父组件调用
defineExpose({ show, close })
</script>

<style scoped>
.recruit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.recruit-content {
  background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
  border-radius: 16px;
  padding: 28px;
  max-width: 480px;
  width: 92%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(255, 87, 34, 0.15);
}

.recruit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.recruit-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recruit-title::before {
  content: '💼';
  font-size: 24px;
}

.recruit-close {
  background: #f5f5f5;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #666;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.recruit-close:hover {
  background: #eee;
  color: #333;
}

.recruit-info {
  background: linear-gradient(135deg, #fff8f5 0%, #fff0eb 100%);
  border: 1px solid #ffe0d6;
  border-radius: 10px;
  padding: 14px 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.recruit-info span {
  color: #e65c00;
  font-weight: 600;
  font-size: 14px;
}

.current-pool {
  background: rgba(255, 87, 34, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px !important;
  cursor: pointer;
  transition: all 0.2s;
}

.current-pool:hover {
  background: rgba(255, 87, 34, 0.2);
}

.pool-selector h3 {
  color: #333;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 600;
}

.pool-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.pool-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  color: #555;
  cursor: pointer;
  transition: all 0.25s;
  font-size: 14px;
}

.pool-btn:hover {
  border-color: #ff9566;
  background: #fff8f5;
}

.pool-btn.active {
  border-color: #ff5722;
  background: linear-gradient(135deg, #fff8f5 0%, #fff0eb 100%);
  color: #ff5722;
  box-shadow: 0 2px 8px rgba(255, 87, 34, 0.15);
}

.pool-icon {
  font-size: 20px;
}

.pool-name {
  font-weight: 500;
}

.pool-preview {
  margin-bottom: 24px;
}

.pool-preview h3 {
  color: #333;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 600;
}

.preview-cards {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.preview-card {
  flex: 1;
  min-width: 130px;
  padding: 16px 12px;
  border-radius: 12px;
  text-align: center;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.2s;
}

.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.preview-card.r {
  border-top: 3px solid #4a90d9;
}

.preview-card.sr {
  border-top: 3px solid #9b59b6;
}

.preview-card.ssr {
  border-top: 3px solid #f39c12;
  background: linear-gradient(180deg, #fffef5 0%, #fff 100%);
}

.preview-name {
  color: #222;
  font-weight: 600;
  margin-bottom: 6px;
  font-size: 14px;
}

.preview-rarity {
  margin-bottom: 8px;
  font-size: 12px;
}

.preview-desc {
  color: #999;
  font-size: 12px;
  line-height: 1.4;
}

/* 爆率显示 */
.pool-rates {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f0f0 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.pool-rates h3 {
  color: #333;
  margin-bottom: 14px;
  font-size: 15px;
  font-weight: 600;
}

.rates-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rate-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rate-label {
  width: 30px;
  font-weight: 600;
  font-size: 14px;
}

.rate-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.rate-fill.r {
  background: linear-gradient(90deg, #4a90d9 0%, #6ba3e0 100%);
}

.rate-fill.sr {
  background: linear-gradient(90deg, #9b59b6 0%, #af7ac5 100%);
}

.rate-fill.ssr {
  background: linear-gradient(90deg, #f39c12 0%, #f5b841 100%);
}

.rate-value {
  width: 40px;
  text-align: right;
  font-weight: 600;
  font-size: 13px;
  color: #666;
}

/* 保底系统 */
.pity-system {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e0e0e0;
}

.pity-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.pity-label {
  font-weight: 600;
  font-size: 14px;
  color: #ff5722;
}

.pity-text {
  font-size: 13px;
  color: #666;
}

.pity-bar {
  height: 12px;
  background: #f0f0f0;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.pity-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff9800 0%, #ff5722 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
  position: relative;
}

.pity-fill::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
}

/* 抽卡记录 */
.draw-history {
  margin-bottom: 20px;
}

.draw-history h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
}

.history-list {
  max-height: 180px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.history-item.r {
  border-color: #4a90d9;
}

.history-item.sr {
  border-color: #9b59b6;
}

.history-item.ssr {
  border-color: #f39c12;
}

.history-name {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.history-rarity {
  font-size: 14px;
}

.history-empty {
  text-align: center;
  color: #999;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

/* 分页器 */
.history-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.page-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #fff8f5;
  border-color: #ff9566;
  color: #ff5722;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.recruit-actions {
  text-align: center;
  margin-bottom: 16px;
}

.cost-warning {
  margin-top: 12px;
  padding: 10px;
  background: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 8px;
  color: #e65100;
  font-size: 14px;
  font-weight: 500;
}

.recruit-draw {
  padding: 16px 40px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff5722 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 4px 16px rgba(255, 87, 34, 0.4);
}

.recruit-draw:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 87, 34, 0.5);
}

.recruit-draw:active:not(:disabled) {
  transform: translateY(0);
}

.recruit-draw:disabled {
  background: #e0e0e0;
  box-shadow: none;
  cursor: not-allowed;
}

.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  animation: fadeIn 0.2s ease;
}

.result-card {
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  background: #fff;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: cardPop 0.4s ease;
  max-width: 360px;
  width: 90%;
}

@keyframes cardPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.result-card.r {
  border-top: 4px solid #4a90d9;
}

.result-card.sr {
  border-top: 4px solid #9b59b6;
}

.result-card.ssr {
  border-top: 4px solid #f39c12;
  background: linear-gradient(180deg, #fffef5 0%, #fff 100%);
}

.result-icon {
  font-size: 56px;
  margin-bottom: 16px;
}

.result-image {
  width: 180px;
  height: 180px;
  margin: 0 auto 16px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.result-card h3 {
  color: #333;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.result-name {
  color: #1a1a1a;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
}

.result-rarity {
  font-size: 24px;
  margin-bottom: 14px;
}

.result-position {
  color: #666;
  margin-bottom: 10px;
  font-size: 15px;
}

.result-desc {
  color: #888;
  font-size: 14px;
  margin-bottom: 24px;
  line-height: 1.5;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 16px;
}

.result-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  min-width: 120px;
}

.result-btn.accept {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.result-btn.accept:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4);
}

.result-btn.accept:disabled {
  background: #e0e0e0;
  box-shadow: none;
  cursor: not-allowed;
}

.result-btn.reject {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
}

.result-btn.reject:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(108, 117, 125, 0.4);
}

.result-tip {
  color: #dc3545;
  font-size: 13px;
  text-align: center;
}
</style>
