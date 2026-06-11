<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content employee-modal">
      <div class="modal-header">
        <h2>👥 员工管理</h2>
        <button class="close-btn" @click="close">✕</button>
      </div>
      <div class="modal-body">
        <div v-if="recruitedCards.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <p>还没有招聘员工！</p>
          <p class="hint">点击「📱 招聘」去招兵买马吧！</p>
        </div>
        <div v-else class="employee-grid">
          <div v-for="card in recruitedCards" :key="card.instanceId" class="employee-card">
            <div class="employee-header">
              <img v-if="card.portrait" :src="card.portrait" class="employee-avatar" @error="handleImageError" />
              <span v-else class="avatar-placeholder">{{ card.name.charAt(0) }}</span>
              <div>
                <div class="employee-name">{{ card.name }}</div>
                <div class="employee-role">{{ card.position }}</div>
              </div>
              <div class="employee-rarity" :class="`rarity-${card.rarity}`">
                {{ card.rarity }}
              </div>
            </div>
            <div class="employee-info">
              <p class="employee-desc">{{ card.description }}</p>
              <div class="employee-stats">
                <div class="stat-item">
                  <span class="stat-label">耐久度</span>
                  <div class="durability-bar">
                    <div class="durability-fill" :class="getDurabilityClass(card)" :style="{ width: (card.durability / card.max_durability * 100) + '%' }"></div>
                  </div>
                  <span class="stat-value">{{ card.durability }}/{{ card.max_durability }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">好感度</span>
                  <span class="stat-value">{{ card.favor || 50 }}</span>
                </div>
              </div>
              <div class="employee-buffs" v-if="card.buffs && card.buffs.length">
                <span v-for="buff in card.buffs" :key="buff.buffId" class="buff-tag">{{ buff.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCardsStore } from '@/stores/cards'

const cardsStore = useCardsStore()
const show = ref(false)

// 只显示招聘来的员工（排除初创团队）
const recruitedCards = computed(() => {
  return cardsStore.backpack.filter(card => !card.id.startsWith('initial_'))
})

function open() {
  show.value = true
}

function close() {
  show.value = false
}

function getDurabilityClass(card) {
  const percentage = card.durability / card.max_durability
  if (percentage <= 0.3) return 'durability-low'
  if (percentage <= 0.6) return 'durability-medium'
  return 'durability-high'
}

function handleImageError(event) {
  event.target.style.display = 'none'
}

defineExpose({ open, close })
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 900px;
  max-height: 80vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    transform: translateY(30px); 
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.employee-modal {
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 24px;
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  color: #666;
}

.hint {
  font-size: 14px;
  color: #999;
}

.employee-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.employee-card {
  background: linear-gradient(145deg, #f8f9fa 0%, #fff 100%);
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.employee-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.employee-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.employee-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.employee-name {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.employee-role {
  font-size: 13px;
  color: #666;
}

.employee-rarity {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}

.rarity-R {
  background: #e3f2fd;
  color: #1976d2;
}

.rarity-SR {
  background: #f3e5f5;
  color: #7b1fa2;
}

.rarity-SSR {
  background: #fff3e0;
  color: #e65100;
}

.employee-desc {
  font-size: 13px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.employee-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.stat-label {
  color: #666;
  width: 60px;
}

.stat-value {
  font-weight: bold;
  color: #333;
}

.durability-bar {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.durability-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.durability-high {
  background: linear-gradient(90deg, #4caf50, #8bc34a);
}

.durability-medium {
  background: linear-gradient(90deg, #ff9800, #ffc107);
}

.durability-low {
  background: linear-gradient(90deg, #f44336, #ff5722);
}

.employee-buffs {
  margin-top: 12px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.buff-tag {
  padding: 2px 8px;
  background: #e3f2fd;
  color: #1976d2;
  font-size: 11px;
  border-radius: 8px;
}
</style>
