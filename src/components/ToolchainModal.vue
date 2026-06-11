<template>
  <div v-if="visible" class="toolchain-modal" @click.self="close">
    <div class="toolchain-content">
      <div class="toolchain-header">
        <h2 class="toolchain-title">⚙️ 工具链</h2>
        <button class="toolchain-close" @click="close">X</button>
      </div>
      
      <div class="toolchain-tabs">
        <button v-for="(category, index) in toolsData.categories"
                :key="category.id"
                class="toolchain-tab"
                :class="{ active: activeTab === category.id }"
                @click="activeTab = category.id">
          {{ category.icon }} {{ category.name }}
        </button>
      </div>
      
      <div class="toolchain-categories">
        <div v-for="category in toolsData.categories"
             :key="category.id"
             class="toolchain-category"
             :class="{ active: activeTab === category.id }">
          <div class="toolchain-grid">
            <div v-for="tool in category.tools"
                 :key="tool.id"
                 :class="['tool-item', { selected: selectedTools[category.id] === tool.id, locked: !isToolUnlocked(tool) }]"
                 @click="selectTool(tool, category.id)">
              <div v-if="selectedTools[category.id] === tool.id" class="tool-selected-badge">已选</div>
              <div class="tool-name">{{ tool.name }}</div>
              <div class="tool-effects">
                <div v-for="(effect, i) in tool.effects"
                     :key="i"
                     :style="{ color: effect.value >= 0 ? '#00ff41' : '#ff4444' }">
                  {{ effect.desc }}
                </div>
                <div v-if="tool.effects.length === 0" style="color: #888">无效果</div>
              </div>
              <div class="tool-cost">{{ tool.cost === 0 ? '免费' : `${tool.cost} 💰` }}</div>
              <div class="tool-unlock">
                {{ tool.unlock_rank === 'p5' ? '默认解锁' : `需要职级 ${rankNames[tool.unlock_rank]}` }}
              </div>
              <div class="tool-meme">"{{ tool.meme }}"</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="toolchain-summary">
        <div class="summary-row">
          <span class="summary-label">基础预算：</span>
          <span class="summary-value">{{ baseBudget }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">调整后预算：</span>
          <span class="summary-value budget-change" :class="totalCost >= 0 ? 'positive' : 'negative'">
            {{ adjustedBudget }}
          </span>
        </div>
        <div class="summary-effects">
          <span class="summary-label">效果：</span>
          <span>{{ effectsSummary.length > 0 ? effectsSummary.join(' / ') : '选择工具后将显示效果汇总' }}</span>
        </div>
        <div v-if="currentToolsNames.length > 0" class="current-tools-display">
          <span class="summary-label">已选工具：</span>
          <span>{{ currentToolsNames.join('、') }}</span>
        </div>
      </div>
      
      <div class="toolchain-actions">
        <button class="toolchain-cancel" @click="close">取消</button>
        <button class="toolchain-confirm" @click="confirm">确认</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import toolsData from '@/data/tools.json'
import ranksData from '@/data/ranks.json'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const toast = inject('toast')

const activeTab = ref('')
const selectedTools = ref({})
const unlockedTools = ref([])
const currentRank = ref('p5')

const rankNames = {
  p5: 'P5',
  p6: 'P6',
  p7: 'P7',
  p8: 'P8',
  p9: 'P9',
  p10: 'P10'
}

onMounted(() => {
  loadData()
})

function loadData() {
  currentRank.value = localStorage.getItem('fair_office_current_rank') || 'p5'
  
  const savedTools = localStorage.getItem('fair_office_toolchain')
  if (savedTools) {
    try {
      const parsed = JSON.parse(savedTools)
      if (typeof parsed === 'object' && parsed !== null) {
        selectedTools.value = parsed
      } else {
        selectedTools.value = {}
        localStorage.removeItem('fair_office_toolchain')
      }
    } catch (e) {
      selectedTools.value = {}
      localStorage.removeItem('fair_office_toolchain')
    }
  }
  
  const savedUnlocked = localStorage.getItem('fair_office_unlocked_tools')
  if (savedUnlocked) {
    try {
      unlockedTools.value = JSON.parse(savedUnlocked)
    } catch (e) {
      unlockedTools.value = []
      localStorage.removeItem('fair_office_unlocked_tools')
    }
  }
  
  if (Object.keys(selectedTools.value).length === 0) {
    toolsData.categories.forEach(category => {
      const defaultTool = category.tools.find(t => t.cost === 0)
      if (defaultTool) {
        selectedTools.value[category.id] = defaultTool.id
      }
    })
  }
  
  if (toolsData.categories.length > 0) {
    activeTab.value = toolsData.categories[0].id
  }
}

function isToolUnlocked(tool) {
  if (tool.unlock_rank === 'p5') return true
  const rankOrder = ['p5', 'p6', 'p7', 'p8', 'p9', 'p10']
  const currentIndex = rankOrder.indexOf(currentRank.value)
  const requiredIndex = rankOrder.indexOf(tool.unlock_rank)
  return currentIndex >= requiredIndex || unlockedTools.value.includes(tool.id)
}

function selectTool(tool, categoryId) {
  if (!isToolUnlocked(tool)) return
  selectedTools.value[categoryId] = tool.id
}

const baseBudget = computed(() => {
  const rank = ranksData.ranks.find(r => r.id === currentRank.value) || ranksData.ranks[0] || { budget: 100 }
  return rank.budget
})

const totalCost = computed(() => {
  let cost = 0
  toolsData.categories.forEach(category => {
    const selectedId = selectedTools.value[category.id]
    if (selectedId) {
      const tool = category.tools.find(t => t.id === selectedId)
      if (tool) {
        cost += tool.cost
      }
    }
  })
  return cost
})

const adjustedBudget = computed(() => baseBudget.value + totalCost.value)

const effectsSummary = computed(() => {
  const effects = []
  toolsData.categories.forEach(category => {
    const selectedId = selectedTools.value[category.id]
    if (selectedId) {
      const tool = category.tools.find(t => t.id === selectedId)
      if (tool) {
        tool.effects.forEach(effect => {
          effects.push(effect.desc)
        })
      }
    }
  })
  return effects
})

const currentToolsNames = computed(() => {
  const names = []
  toolsData.categories.forEach(category => {
    const selectedId = selectedTools.value[category.id]
    if (selectedId) {
      const tool = category.tools.find(t => t.id === selectedId)
      if (tool) {
        names.push(tool.name)
      }
    }
  })
  return names
})

function confirm() {
  localStorage.setItem('fair_office_toolchain', JSON.stringify(selectedTools.value))
  close()
}

function close() {
  visible.value = false
}
</script>

<style scoped>
.toolchain-modal {
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

.toolchain-content {
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 4px solid #00ff41;
  box-shadow: 8px 8px 0 #0a0a0f;
  max-width: 800px;
  width: 95%;
  max-height: 85vh;
  position: relative;
}

.toolchain-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px 0;
}

.toolchain-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  color: #00ff41;
  text-shadow: 2px 2px 0 #0a0a0f;
}

.toolchain-close {
  background: #1a1a2e;
  color: #00ff41;
  border: 2px solid #00ff41;
  box-shadow: 2px 2px 0 #0a0a0f;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 6px 10px;
  cursor: pointer;
}

.toolchain-tabs {
  display: flex;
  gap: 8px;
  padding: 15px 30px 10px;
  flex-wrap: wrap;
}

.toolchain-tab {
  font-family: 'Press Start 2P', monospace;
  background: transparent;
  color: #888;
  border: 2px solid #888;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 8px;
  transition: all 0.2s;
}

.toolchain-tab.active {
  color: #00ff41;
  border-color: #00ff41;
  background: rgba(0, 255, 65, 0.1);
}

.toolchain-categories {
  padding: 0 30px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.toolchain-category {
  display: none;
}

.toolchain-category.active {
  display: block;
}

.toolchain-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  padding-bottom: 20px;
}

.tool-item {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid #333;
  padding: 20px 15px 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-item:hover:not(.locked) {
  border-color: #00ff41;
  box-shadow: 0 0 15px rgba(0, 255, 65, 0.2);
}

.tool-item.selected {
  border-color: #00ff41;
  background: rgba(0, 255, 65, 0.1);
}

.tool-item.locked {
  opacity: 0.4;
  cursor: not-allowed;
}

.tool-selected-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #00ff41;
  color: #1a1a2e;
  font-size: 8px;
  padding: 4px 8px;
  font-family: 'Press Start 2P', monospace;
  border: 2px solid #1a1a2e;
}

.tool-name {
  color: #fff;
  font-size: 10px;
  font-weight: bold;
  margin-bottom: 10px;
  font-family: 'Press Start 2P', monospace;
}

.tool-effects {
  font-size: 7px;
  margin-bottom: 10px;
  line-height: 1.5;
  font-family: 'Press Start 2P', monospace;
}

.tool-cost {
  color: #ffd700;
  font-size: 8px;
  margin-bottom: 5px;
  font-family: 'Press Start 2P', monospace;
}

.tool-unlock {
  color: #888;
  font-size: 7px;
  margin-bottom: 8px;
  font-family: 'Press Start 2P', monospace;
}

.tool-meme {
  color: #666;
  font-size: 7px;
  font-style: italic;
  font-family: 'Press Start 2P', monospace;
}

.toolchain-summary {
  background: rgba(0, 0, 0, 0.3);
  padding: 15px 30px;
  border-top: 2px solid #333;
}

.summary-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.summary-label {
  color: #888;
  font-size: 9px;
  font-family: 'Press Start 2P', monospace;
}

.summary-value {
  color: #fff;
  font-size: 10px;
  font-family: 'Press Start 2P', monospace;
}

.budget-change.positive {
  color: #00ff41;
}

.budget-change.negative {
  color: #ff4444;
}

.summary-effects {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
}

.summary-effects span:last-child {
  color: #aaa;
  font-size: 8px;
  font-family: 'Press Start 2P', monospace;
  flex: 1;
  line-height: 1.5;
}

.current-tools-display {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 10px;
}

.current-tools-display span:last-child {
  color: #00ff41;
  font-size: 8px;
  font-family: 'Press Start 2P', monospace;
  flex: 1;
}

.toolchain-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px 30px;
  border-top: 2px solid #333;
}

.toolchain-cancel {
  background: #1a1a2e;
  color: #888;
  border: 3px solid #666;
  box-shadow: 3px 3px 0 #0a0a0f;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 10px 25px;
  cursor: pointer;
}

.toolchain-cancel:hover {
  background: #666;
  color: #1a1a2e;
  border-color: #fff;
}

.toolchain-confirm {
  background: #1a1a2e;
  color: #00ff41;
  border: 3px solid #00ff41;
  box-shadow: 3px 3px 0 #0a0a0f;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  padding: 10px 25px;
  cursor: pointer;
}

.toolchain-confirm:hover {
  background: #00ff41;
  color: #1a1a2e;
}
</style>
