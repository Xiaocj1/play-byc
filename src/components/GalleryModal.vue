<template>
  <div v-if="visible" class="gallery-modal" @click.self="close">
    <div class="gallery-content">
      <div class="gallery-header">
        <h2 class="gallery-title">🃏 人才库</h2>
        <button class="gallery-close" @click="close">X</button>
      </div>
      
      <div class="gallery-scroll-container">
        <!-- 筛选标签 -->
        <div class="gallery-tabs">
          <div class="gallery-tab-row">
            <span class="filter-label">职位：</span>
            <div class="gallery-tab-group">
              <button class="gallery-tab" :class="{ active: filter.position === 'all' }" @click="updateFilter('position', 'all')">全部</button>
              <button v-for="p in availablePositions" :key="p.id" class="gallery-tab" :class="{ active: filter.position === p.id }" @click="updateFilter('position', p.id)">{{ p.icon }} {{ p.name }}</button>
            </div>
          </div>
          
          <div class="gallery-tab-row">
            <span class="filter-label">稀有度：</span>
            <div class="gallery-tab-group">
              <button class="gallery-tab small" :class="{ active: filter.rarity === 'all' }" @click="updateFilter('rarity', 'all')">全部</button>
              <button class="gallery-tab small" :class="{ active: filter.rarity === 'SSR' }" @click="updateFilter('rarity', 'SSR')" style="color: #f39c12;">SSR</button>
              <button class="gallery-tab small" :class="{ active: filter.rarity === 'SR' }" @click="updateFilter('rarity', 'SR')" style="color: #9b59b6;">SR</button>
              <button class="gallery-tab small" :class="{ active: filter.rarity === 'R' }" @click="updateFilter('rarity', 'R')" style="color: #888;">R</button>
            </div>
          </div>
          
          <div class="gallery-tab-row">
            <span class="filter-label">状态：</span>
            <div class="gallery-tab-group">
              <button class="gallery-tab small" :class="{ active: filter.status === 'all' }" @click="updateFilter('status', 'all')">全部</button>
              <button class="gallery-tab small" :class="{ active: filter.status === 'unlocked' }" @click="updateFilter('status', 'unlocked')">已获得</button>
              <button class="gallery-tab small" :class="{ active: filter.status === 'locked' }" @click="updateFilter('status', 'locked')">未获得</button>
            </div>
          </div>
        </div>
        
        <!-- 收集进度 -->
        <div class="gallery-stats">
          <div class="stat-header">
            <span class="stat-label">卡牌收集</span>
            <span class="stat-value">{{ allCardsUnlocked }}/{{ allCardsTotal }}</span>
          </div>
          <div class="stat-header">
            <div class="stat-progress-bar">
              <div class="stat-progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="stat-percentage">{{ progress }}%</span>
          </div>
        </div>
        
        <!-- 卡牌网格 -->
        <div class="cards-gallery">
          <div v-for="card in filteredCards" :key="card.cardKey" :class="['gallery-card', { locked: !card.unlocked }]" @click="card.unlocked ? showCardDetail(card) : null" @mouseenter="!card.unlocked ? showCardHint(card) : null">
            <div class="gallery-card-icon">
              <template v-if="card.unlocked">{{ card.poolIcon }}</template>
              <span v-else class="question-box">?</span>
            </div>
            <div class="gallery-card-name">{{ card.unlocked ? card.name : '???' }}</div>
            <div class="gallery-card-rarity" :style="{ color: card.unlocked ? getRarityColor(card.rarity) : '#666' }">{{ card.rarity }}</div>
            <div class="gallery-card-pool">{{ card.poolName }}</div>
            <div v-if="card.unlocked && card.description" class="gallery-card-desc">{{ card.description }}</div>
            <div v-else class="gallery-card-desc" style="color:#666;">通过抽卡获得</div>
          </div>
        </div>
        
        <div v-if="filteredCards.length === 0" class="no-results">暂无符合条件的卡牌</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import cardsData from '@/data/cards.json'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const toast = inject('toast')

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const filter = ref({
  position: 'all',
  rarity: 'all',
  status: 'all'
})

const unlockedCards = ref([])

const RARITY_COLORS = {
  "SSR": "#f39c12",
  "SR": "#9b59b6",
  "R": "#888"
}

onMounted(() => {
  loadUnlockedCards()
})

function loadUnlockedCards() {
  const saved = localStorage.getItem('fair_office_unlocked_cards')
  if (saved) {
    unlockedCards.value = JSON.parse(saved)
  }
}

function updateFilter(filterType, value) {
  filter.value[filterType] = value
}

const availablePositions = computed(() => {
  return cardsData.pools.map(p => ({ id: p.id, name: p.name, icon: p.icon }))
})

const allCards = computed(() => {
  const cards = []
  cardsData.pools.forEach(pool => {
    pool.cards.forEach(card => {
      const cardKey = pool.id + '_' + card.id
      const isUnlocked = unlockedCards.value.includes(cardKey)
      cards.push({
        poolName: pool.name,
        poolIcon: pool.icon,
        poolId: pool.id,
        cardKey: cardKey,
        unlocked: isUnlocked,
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        description: card.description || ''
      })
    })
  })
  
  const rarityOrder = { "SSR": 0, "SR": 1, "R": 2 }
  cards.sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1
    if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
      return rarityOrder[a.rarity] - rarityOrder[b.rarity]
    }
    return a.name.localeCompare(b.name)
  })
  
  return cards
})

const filteredCards = computed(() => {
  return allCards.value.filter(card => {
    if (filter.value.position !== 'all' && card.poolId !== filter.value.position) return false
    if (filter.value.rarity !== 'all' && card.rarity !== filter.value.rarity) return false
    if (filter.value.status === 'unlocked' && !card.unlocked) return false
    if (filter.value.status === 'locked' && card.unlocked) return false
    return true
  })
})

const allCardsTotal = computed(() => {
  return cardsData.pools.reduce((sum, pool) => sum + pool.cards.length, 0)
})

const allCardsUnlocked = computed(() => {
  return unlockedCards.value.length
})

const progress = computed(() => {
  return allCardsTotal.value > 0 ? Math.round((allCardsUnlocked.value / allCardsTotal.value) * 100) : 0
})

function getRarityColor(rarity) {
  return RARITY_COLORS[rarity] || '#888'
}

function showCardDetail(card) {
  toast.info(`${card.poolIcon} ${card.name}\n${card.description}`, 4000)
}

function showCardHint(card) {
  // 暂时不做提示
}

function close() {
  visible.value = false
}
</script>

<style scoped>
.gallery-modal {
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

.gallery-content {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 4px solid #ffd700;
  box-shadow: 8px 8px 0 #0a0a0f;
  max-width: 900px;
  width: 95%;
  max-height: 85vh;
  position: relative;
}

.gallery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px 0;
}

.gallery-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 16px;
  color: #ffd700;
  text-shadow: 2px 2px 0 #0a0a0f;
}

.gallery-close {
  background: #1a1a2e;
  color: #ff4444;
  border: 2px solid #ff4444;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 16px;
}

.gallery-scroll-container {
  padding: 20px 30px 30px;
  max-height: calc(85vh - 80px);
  overflow-y: auto;
}

.gallery-tabs {
  margin-bottom: 20px;
}

.gallery-tab-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-label {
  color: #888;
  font-size: 9px;
  font-family: 'Press Start 2P', monospace;
}

.gallery-tab-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.gallery-tab {
  font-family: 'Press Start 2P', monospace;
  background: transparent;
  color: #888;
  border: 2px solid #888;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 9px;
  transition: all 0.2s;
}

.gallery-tab.small {
  padding: 6px 12px;
  font-size: 8px;
}

.gallery-tab.active {
  color: #ffd700;
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.gallery-tab:hover {
  border-color: #ffd700;
}

.gallery-stats {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #333;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-label {
  color: #ffd700;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.stat-value {
  color: #00ff41;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.stat-progress-bar {
  flex: 1;
  height: 15px;
  background: #333;
  border: 2px solid #666;
}

.stat-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffeb3b);
  transition: width 0.3s ease;
}

.stat-percentage {
  color: #ffd700;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
  min-width: 45px;
}

.cards-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.gallery-card {
  background: rgba(0, 0, 0, 0.4);
  border: 3px solid #333;
  padding: 20px 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.gallery-card:hover:not(.locked) {
  border-color: #00ff41;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.2);
  transform: translateY(-3px);
}

.gallery-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.gallery-card.locked:hover {
  border-color: #666;
  box-shadow: none;
  transform: none;
}

.gallery-card-icon {
  font-size: 36px;
  margin-bottom: 12px;
}

.question-box {
  display: inline-block;
  width: 36px;
  height: 36px;
  line-height: 36px;
  background: #333;
  border: 2px solid #666;
  border-radius: 4px;
  font-size: 24px;
  color: #888;
}

.gallery-card-name {
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
}

.gallery-card-rarity {
  font-size: 9px;
  margin-bottom: 5px;
  font-family: 'Press Start 2P', monospace;
}

.gallery-card-pool {
  color: #888;
  font-size: 8px;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
}

.gallery-card-desc {
  color: #aaa;
  font-size: 7px;
  line-height: 1.5;
  font-family: 'Press Start 2P', monospace;
}

.no-results {
  color: #888;
  text-align: center;
  padding: 40px;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.gallery-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.gallery-scroll-container::-webkit-scrollbar-track {
  background: #0a0a0f;
}

.gallery-scroll-container::-webkit-scrollbar-thumb {
  background: #333;
  border-radius: 3px;
}
</style>
