<template>
  <div v-if="visible" class="museum-modal" @click.self="close">
    <div class="museum-content">
      <button class="museum-close" @click="close">X</button>
      <div class="museum-scroll-container">
        <h2 class="museum-title">🏛️ 陈列馆</h2>
        
        <div class="museum-tabs">
          <div class="museum-tab-row">
            <span class="filter-label">类型：</span>
            <div class="museum-tab-group">
              <button class="museum-tab" :class="{ active: filter.type === 'products' }"
                      @click="setFilter('type', 'products')">📦 产品图鉴</button>
              <button class="museum-tab" :class="{ active: filter.type === 'endings' }"
                      @click="setFilter('type', 'endings')">🎭 结局图鉴</button>
            </div>
          </div>
          
          <div v-if="filter.type === 'products'" class="museum-tab-row">
            <span class="filter-label">产品：</span>
            <div class="museum-tab-group">
              <button class="museum-tab small" :class="{ active: filter.productType === 'all' }"
                      @click="setFilter('productType', 'all')">全部</button>
              <button class="museum-tab small" :class="{ active: filter.productType === 'success' }"
                      @click="setFilter('productType', 'success')">🚀 成功产品</button>
              <button class="museum-tab small" :class="{ active: filter.productType === 'failed' }"
                      @click="setFilter('productType', 'failed')">💔 真实失败产品</button>
            </div>
          </div>
          
          <div class="museum-tab-row">
            <span class="filter-label">方向：</span>
            <div class="museum-tab-group">
              <button class="museum-tab small" :class="{ active: filter.direction === 'all' }"
                      @click="setFilter('direction', 'all')">全部</button>
              <button class="museum-tab small" :class="{ active: filter.direction === 'toc' }"
                      @click="setFilter('direction', 'toc')">To C</button>
              <button class="museum-tab small" :class="{ active: filter.direction === 'tob' }"
                      @click="setFilter('direction', 'tob')">To B</button>
              <button class="museum-tab small" :class="{ active: filter.direction === 'b2c' }"
                      @click="setFilter('direction', 'b2c')">B2C</button>
            </div>
          </div>
          
          <div v-if="filter.type === 'products'" class="museum-tab-row">
            <span class="filter-label">状态：</span>
            <div class="museum-tab-group">
              <button class="museum-tab small" :class="{ active: filter.status === 'all' }"
                      @click="setFilter('status', 'all')">全部</button>
              <button class="museum-tab small" :class="{ active: filter.status === 'unlocked' }"
                      @click="setFilter('status', 'unlocked')">已解锁</button>
              <button class="museum-tab small" :class="{ active: filter.status === 'locked' }"
                      @click="setFilter('status', 'locked')">未解锁</button>
            </div>
          </div>
        </div>
        
        <div class="museum-grid">
          <div v-for="item in filteredItems"
             :key="item.id"
             :class="['museum-card', { locked: !item.unlocked }]"
             @click="item.unlocked ? showDetail(item) : null"
             @mouseenter="!item.unlocked ? showLockedHint(item) : null">
            <template v-if="item.unlocked">
              <div class="museum-card-icon">{{ item.icon }}</div>
              <div class="museum-card-name">{{ item.name }}</div>
              <div class="museum-card-subname">{{ item.subname }}</div>
              <div class="museum-card-type" :class="item._type">
                {{ item.itemType === 'product' ? (item.isSuccess ? '🚀 成功' : '💔 失败') : 
                  (item.type === 'victory' ? '胜利' : '失败') }}
              </div>
              <div v-if="item.itemType === 'product' || item.itemType === 'ending'" class="museum-card-direction">
                {{ item.itemType === 'product' ? item.direction?.toUpperCase() : 
                   (item.direction === 'all' ? '通用' : item.direction?.toUpperCase()) }}
              </div>
            </template>
            <template v-else>
              <div class="museum-card-icon">❓</div>
              <div class="museum-card-name">？？？</div>
              <div class="museum-card-condition">
                {{ item.itemType === 'product' ? '悬浮查看解锁条件' : '达成结局后解锁' }}
              </div>
            </template>
          </div>
        </div>
        <div v-if="filteredItems.length === 0" class="no-results">
          暂无符合条件的{{ filter.type === 'products' ? '产品' : '结局' }}
        </div>
      </div>
    </div>
    
    <div v-if="detailVisible" class="museum-detail-modal" @click.self="closeDetail">
      <div class="museum-detail-content">
        <button class="museum-detail-close" @click="closeDetail">X</button>
        <div class="museum-detail-header">
          <div class="museum-detail-icon">{{ currentDetail?.icon }}</div>
          <div class="museum-detail-title">
            <h2>{{ currentDetail?.name }}</h2>
            <p class="museum-detail-subname">{{ currentDetail?.subname }}</p>
            <div class="museum-detail-tags">
              <span class="tag" :class="currentDetail?.tagClass">
                {{ currentDetail?.tagLabel }}
              </span>
              <span v-if="currentDetail?.direction" class="tag">
                📌 {{ currentDetail?.directionLabel }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="museum-detail-section">
          <h3>👤 创始人/PM说</h3>
          <blockquote>"{{ currentDetail?.founder_quote }}"</blockquote>
          <cite>—— {{ currentDetail?.founder_source }}</cite>
        </div>
        
        <div class="museum-detail-section">
          <h3>🇨🇳 国内用户说</h3>
          <blockquote>"{{ currentDetail?.domestic_quote }}"</blockquote>
          <cite>—— {{ currentDetail?.domestic_source }}</cite>
        </div>
        
        <div class="museum-detail-section">
          <h3>🌏 {{ currentDetail?.isSuccess === false ? '国外用户/媒体' : '国外用户' }}说</h3>
          <blockquote>"{{ currentDetail?.international_quote }}"</blockquote>
          <cite>—— {{ currentDetail?.international_source }}</cite>
        </div>
        
        <div v-if="currentDetail?.fail_reason" class="museum-detail-section">
          <h3>⚰️ 失败原因</h3>
          <p>{{ currentDetail?.fail_reason }}</p>
        </div>
        
        <div class="museum-detail-unlock">
          <h3>📜 图鉴{{ currentDetail?.isSuccess === false ? '解说' : '解锁' }}</h3>
          <p>{{ currentDetail?.unlock_desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import productsData from '@/data/products.json'
import endingsData from '@/data/ending_gallery.json'
import failedProductsData from '@/data/real_failed_products.json'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const detailVisible = ref(false)
const currentDetail = ref(null)
const filter = ref({
  type: 'products',
  direction: 'all',
  status: 'all',
  productType: 'all'
})

const unlockedProducts = ref([])
const unlockedEndings = ref([])
const unlockedRealFailed = ref([])

onMounted(() => {
  loadUnlockedData()
})

function loadUnlockedData() {
  const savedProducts = localStorage.getItem('fair_office_unlocked_products')
  const savedEndings = localStorage.getItem('fair_office_unlocked_endings_gallery')
  const savedFailed = localStorage.getItem('fair_office_unlocked_real_failed_products')
  
  if (savedProducts) unlockedProducts.value = JSON.parse(savedProducts)
  if (savedEndings) unlockedEndings.value = JSON.parse(savedEndings)
  if (savedFailed) unlockedRealFailed.value = JSON.parse(savedFailed)
}

const filteredItems = computed(() => {
  let items = []
  
  if (filter.value.type === 'products') {
    const successItems = productsData.products || []
    const failedItems = failedProductsData.real_failed_products || []
    
    const filteredSuccess = successItems
      .filter(item => {
        if (filter.value.productType !== 'all' && filter.value.productType !== 'success') return false
        if (filter.value.direction !== 'all' && item.direction !== filter.value.direction) return false
        return true
      })
      .map(item => ({
        ...item,
        _type: 'success',
        isSuccess: true,
        itemType: 'product',
        unlocked: unlockedProducts.value.some(p => p.id === item.id)
      }))
    
    const filteredFailed = failedItems
      .filter(item => {
        if (filter.value.productType !== 'all' && filter.value.productType !== 'failed') return false
        return true
      })
      .map(item => ({
        ...item,
        _type: 'failed',
        isSuccess: false,
        itemType: 'product',
        unlocked: unlockedRealFailed.value.some(p => p.id === item.id)
      }))
    
    items = [...filteredSuccess, ...filteredFailed]
  } else {
    items = (endingsData.endings || [])
      .filter(item => {
        if (filter.value.direction !== 'all' && item.direction !== filter.value.direction && item.direction !== 'all') return false
        return true
      })
      .map(item => ({
        ...item,
        itemType: 'ending',
        unlocked: unlockedEndings.value.some(e => e.id === item.id)
      }))
  }
  
  if (filter.value.status === 'unlocked') {
    items = items.filter(item => item.unlocked)
  } else if (filter.value.status === 'locked') {
    items = items.filter(item => !item.unlocked)
  }
  
  return items
})

function setFilter(key, value) {
  filter.value[key] = value
}

function showDetail(item) {
  let tagLabel = ''
  let tagClass = ''
  let directionLabel = ''
  
  if (item.itemType === 'product') {
    tagLabel = item.isSuccess ? '🚀 成功产品' : '💔 真实失败产品'
    tagClass = item.isSuccess ? 'success' : 'failure'
    directionLabel = item.direction?.toUpperCase()
  } else {
    tagLabel = item.type === 'victory' ? '🏆 胜利结局' : '💔 失败结局'
    tagClass = item.type
    directionLabel = item.direction === 'all' ? '通用' : item.direction?.toUpperCase()
  }
  
  currentDetail.value = {
    ...item,
    tagLabel,
    tagClass,
    directionLabel
  }
  detailVisible.value = true
}

function closeDetail() {
  detailVisible.value = false
  currentDetail.value = null
}

function showLockedHint(item) {
}

function close() {
  closeDetail()
  visible.value = false
}
</script>

<style scoped>
.museum-modal {
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

.museum-content {
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

.museum-scroll-container {
  padding: 30px;
  padding-top: 55px;
  max-height: calc(85vh - 30px);
  overflow-y: auto;
}

.museum-scroll-container::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.museum-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: 2px solid #ff4444;
  color: #ff4444;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 16px;
  z-index: 10;
}

.museum-title {
  color: #ffd700;
  text-align: center;
  margin-bottom: 25px;
  font-size: 20px;
  text-shadow: 0 0 20px #ffd700;
  font-family: 'Press Start 2P', monospace;
}

.museum-tabs {
  margin-bottom: 25px;
}

.museum-tab-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.filter-label {
  color: #888;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.museum-tab-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.museum-tab {
  font-family: 'Press Start 2P', monospace;
  background: transparent;
  color: #888;
  border: 2px solid #888;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 8px;
  transition: all 0.2s;
}

.museum-tab.small {
  padding: 6px 12px;
  font-size: 7px;
}

.museum-tab.active {
  color: #ffd700;
  border-color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
}

.museum-tab:hover {
  border-color: #ffd700;
}

.museum-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 15px;
}

.museum-card {
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid #333;
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.museum-card:hover {
  border-color: #00ff41;
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
  transform: translateY(-3px);
}

.museum-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.museum-card.locked:hover {
  border-color: #666;
  box-shadow: none;
  transform: none;
}

.museum-card-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.museum-card-name {
  color: #00ff41;
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 6px;
  font-family: 'Press Start 2P', monospace;
}

.museum-card-subname {
  color: #888;
  font-size: 7px;
  font-family: 'Press Start 2P', monospace;
}

.museum-card-type {
  font-size: 7px;
  margin-top: 8px;
  font-family: 'Press Start 2P', monospace;
}

.museum-card-type.success,
.museum-card-type.victory {
  color: #00ff41;
}

.museum-card-type.failure,
.museum-card-type.failed {
  color: #ff4444;
}

.museum-card-direction {
  color: #888;
  font-size: 7px;
  margin-top: 4px;
  font-family: 'Press Start 2P', monospace;
}

.museum-card-condition {
  color: #666;
  font-size: 7px;
  font-style: italic;
  font-family: 'Press Start 2P', monospace;
}

.no-results {
  color: #666;
  text-align: center;
  padding: 40px;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.museum-detail-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  justify-content: center;
  align-items: center;
  z-index: 10020;
}

.museum-detail-content {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 4px solid #ffd700;
  box-shadow: 8px 8px 0 #0a0a0f;
  padding: 40px;
  max-width: 600px;
  width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  position: relative;
}

.museum-detail-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: 2px solid #ff4444;
  color: #ff4444;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 16px;
}

.museum-detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #333;
}

.museum-detail-icon {
  font-size: 64px;
}

.museum-detail-title h2 {
  color: #ffd700;
  font-size: 18px;
  margin: 0 0 10px 0;
  font-family: 'Press Start 2P', monospace;
}

.museum-detail-subname {
  color: #888;
  font-size: 9px;
  font-style: italic;
  font-family: 'Press Start 2P', monospace;
}

.museum-detail-tags {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.tag {
  font-size: 8px;
  padding: 4px 10px;
  border: 2px solid;
  font-family: 'Press Start 2P', monospace;
}

.tag.success,
.tag.victory {
  color: #00ff41;
  border-color: #00ff41;
}

.tag.failure,
.tag.failed {
  color: #ff4444;
  border-color: #ff4444;
}

.museum-detail-section {
  margin-bottom: 25px;
}

.museum-detail-section h3 {
  color: #00bfff;
  font-size: 11px;
  margin-bottom: 10px;
  font-family: 'Press Start 2P', monospace;
}

.museum-detail-section blockquote {
  color: #fff;
  font-size: 10px;
  margin: 0 0 8px 0;
  padding-left: 15px;
  border-left: 3px solid #00ff41;
}

.museum-detail-section cite {
  color: #666;
  font-size: 8px;
  font-style: italic;
}

.museum-detail-unlock {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px dashed #333;
}

.museum-detail-unlock h3 {
  color: #ffd700;
  font-size: 11px;
  margin-bottom: 10px;
  font-family: 'Press Start 2P', monospace;
}

.museum-detail-unlock p {
  color: #aaa;
  font-size: 9px;
  line-height: 1.6;
  font-style: italic;
  font-family: 'Press Start 2P', monospace;
}
</style>
