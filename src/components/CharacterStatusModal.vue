<template>
  <div v-if="visible" class="character-status-modal" id="character-status-modal" @click.self="close">
    <div class="character-status-content">
      <button class="status-close" @click="close">X</button>
      <div class="status-header">
        <div class="status-portrait">
          <img v-if="characterCard?.portrait" :src="characterCard.portrait" :alt="characterCard?.name" />
          <span v-else class="placeholder">{{ characterCard?.name?.charAt(0) || '?' }}</span>
        </div>
        <div class="status-info">
          <h3>{{ characterCard?.name }}</h3>
          <p>{{ characterCard?.position || characterCard?.role }}</p>
          <p class="status-description">{{ characterCard?.description }}</p>
        </div>
      </div>
      <div class="status-favor">
        <div class="favor-label">好感度</div>
        <div class="favor-bar">
          <div class="favor-fill" :style="{ width: favor + '%' }"></div>
        </div>
        <div class="favor-value">{{ favor }}%</div>
      </div>
      <div class="status-buffs-header">当前状态效果</div>
      <div v-if="buffs.length > 0" class="status-buffs">
        <div v-for="(buff, index) in buffs" :key="index" class="status-buff-item" :class="buff.type">
          <span class="buff-icon">{{ buff.icon }}</span>
          <div style="flex: 1;">
            <div class="buff-name">{{ buff.name }}</div>
            <div style="font-size: 12px; color: #888;">剩余{{ buff.duration }}</div>
            <div v-if="buff.effectDesc" style="font-size: 11px; color: #aaa; margin-top: 5px;" v-html="buff.effectDesc"></div>
          </div>
        </div>
      </div>
      <div v-else class="status-no-buffs">当前没有buff效果</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import charactersData from '@/data/characters.json'
import buffsData from '@/data/buffs.json'

const props = defineProps({
  characterCard: {
    type: Object,
    required: true
  }
})

const visible = ref(false)
const favor = ref(50)
const buffs = ref([])

function open() {
  if (!props.characterCard) return
  
  // 从localStorage获取好感度和buff数据
  const savedGame = localStorage.getItem('fair_office_game')
  if (savedGame) {
    try {
      const gameState = JSON.parse(savedGame)
      
      // 获取该角色的好感度
      const characterId = props.characterCard.id
      if (characterId && characterId.startsWith('initial_')) {
        // 初始团队角色
        const initialCharacterId = characterId.replace('initial_', '')
        favor.value = gameState.favors?.[initialCharacterId] || 50
        
        // 获取buff数据
        const characterBuffs = gameState.characterBuffs?.[initialCharacterId] || []
        processBuffs(characterBuffs)
      } else {
        // 其他角色
        favor.value = gameState.favors?.[characterId] || 50
        
        // 获取buff数据
        const characterBuffs = gameState.characterBuffs?.[characterId] || []
        processBuffs(characterBuffs)
      }
    } catch (e) {
      console.error('Failed to load character data:', e)
      // 如果没有保存的数据，使用默认值
      favor.value = props.characterCard.favor || 50
    }
  } else {
    // 如果没有游戏数据，使用卡片数据
    favor.value = props.characterCard.favor || 50
  }
  
  visible.value = true
}

function processBuffs(characterBuffs) {
  buffs.value = characterBuffs.map(buff => {
    const buffData = buffsData.buffs.find(b => b.id === buff.buffId)
    if (!buffData) return { ...buff, name: buff.buffId, icon: '✨', type: 'positive' }
    
    const duration = buff.duration > 0 ? `${buff.duration}周` : '永久'
    const type = buffData.type === 'positive' ? 'positive' : 'negative'
    
    // 生成效果描述
    let effectDesc = ''
    if (buffData.effect) {
      const effectTypeMap = {
        'progress': '项目进度',
        'team_favor': '团队好感度',
        'favor': '好感度',
        'satisfaction': '满意度',
        'budget': '资金',
        'efficiency': '效率',
        'fame': '名声'
      }
      
      const typeName = effectTypeMap[buffData.effect.type] || buffData.effect.type
      const valuePrefix = buffData.effect.value >= 0 ? '+' : ''
      const durationStr = buffData.effect.duration === 'permanent' ? '永久' : `持续${buffData.effect.duration}周`
      
      effectDesc = `<div>${typeName} ${valuePrefix}${buffData.effect.value} (${durationStr})</div>`
      
      if (buffData.side_effect) {
        const sideTypeName = effectTypeMap[buffData.side_effect.type] || buffData.side_effect.type
        const sideValuePrefix = buffData.side_effect.value >= 0 ? '+' : ''
        effectDesc += `<div style="color: #ff6b6b;">副作用: ${sideTypeName} ${sideValuePrefix}${buffData.side_effect.value}</div>`
      }
    }
    
    if (buffData.description) {
      effectDesc += `<div style="color: #888;">"${buffData.description}"</div>`
    }
    
    return {
      ...buff,
      name: buffData.name,
      icon: buffData.icon,
      type,
      duration,
      effectDesc
    }
  })
}

function close() {
  visible.value = false
}

defineExpose({ open, close })
</script>

<style>
.character-status-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.character-status-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.status-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.status-close:hover {
  background: #f4f5f7;
  color: #333;
}

.status-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.status-portrait {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  flex-shrink: 0;
  overflow: hidden;
}

.status-portrait img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-portrait .placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 80px;
}

.status-info h3 {
  margin: 0 0 4px 0;
  font-size: 22px;
  color: #172b4d;
  font-weight: bold;
}

.status-info p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b778c;
}

.status-description {
  margin-top: 8px !important;
  font-size: 13px !important;
  color: #8898aa !important;
  line-height: 1.4;
}

.status-favor {
  margin-bottom: 20px;
}

.favor-label {
  font-size: 14px;
  color: #172b4d;
  font-weight: 600;
  margin-bottom: 8px;
}

.favor-bar {
  height: 12px;
  background: #f4f5f7;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.favor-fill {
  height: 100%;
  background: linear-gradient(90deg, #0052cc 0%, #00b8d9 100%);
  border-radius: 6px;
  transition: width 0.5s;
}

.favor-value {
  font-size: 24px;
  font-weight: bold;
  color: #0052cc;
  text-align: center;
}

.status-buffs-header {
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin-bottom: 12px;
}

.status-buffs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-buff-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #f4f5f7;
  border-radius: 8px;
}

.status-buff-item.positive {
  border-left: 3px solid #00875a;
}

.status-buff-item.negative {
  border-left: 3px solid #de350b;
}

.buff-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.buff-name {
  font-weight: bold;
  color: #172b4d;
  font-size: 14px;
}

.status-no-buffs {
  text-align: center;
  color: #888;
  padding: 20px;
}
</style>
