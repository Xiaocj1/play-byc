<template>
  <div class="character-panel">
    <h3 class="panel-title">团队成员</h3>
    <div id="portraits-container" class="portraits-container">
      <div 
        v-for="card in initialTeam" 
        :key="card.instanceId"
        class="character-card"
        :data-character-id="card.id">
        <div class="character-portrait" @click="showCharacterDetail(card)" style="cursor: pointer;">
          <img v-if="card.portrait" :src="card.portrait" :alt="card.name" @error="handleImageError" />
          <span v-else class="placeholder">{{ card.name.charAt(0) }}</span>
        </div>
        <div style="flex: 1;">
          <div style="display: flex; gap: 6px; align-items: center;">
            <div class="character-card-name">{{ card.name }}</div>
            <span class="initial-team-badge">🏠 初创</span>
          </div>
          <div class="character-card-role">{{ card.position }}</div>
          <div class="character-card-favor-bar">
            <div class="character-card-favor-fill" :style="{ width: (card.favor || 50) + '%' }"></div>
          </div>
          <div class="character-card-buffs" v-if="card.buffs && card.buffs.length">
            <span v-for="buff in card.buffs" :key="buff.buffId" class="buff-item" :class="buff.type === 'positive' ? 'buff-positive' : 'buff-negative'">✨</span>
          </div>
        </div>
        <div class="character-card-favor-value">{{ card.favor || 50 }}</div>
      </div>
    </div>
    
    <CharacterStatusModal v-if="selectedCharacterCard" ref="characterModalRef" :character-card="selectedCharacterCard" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import CharacterStatusModal from './CharacterStatusModal.vue'

const cardsStore = useCardsStore()
const characterModalRef = ref(null)
const selectedCharacterCard = ref(null)

const initialTeam = computed(() => {
  return cardsStore.backpack
})

function showCharacterDetail(card) {
  selectedCharacterCard.value = card
  // 下一个tick再打开弹窗，确保prop先更新
  setTimeout(() => {
    characterModalRef.value?.open()
  }, 0)
}

function handleImageError(event) {
  event.target.style.display = 'none'
}
</script>
