# Vue 3 迁移 - 批次4：状态管理迁移

**文档版本**：V1.0  
**创建时间**：2026-05-21  
**负责人**：待定  
**状态**：待执行  
**优先级**：P1（重要功能）

---

## 目标

将原有全局变量 `gameState` 和散落的函数迁移到 Pinia Store，实现集中式状态管理。

---

## 依赖

- ✅ 批次1完成（项目骨架可用）
- ✅ 批次3完成（游戏页迁移完成）

---

## 执行步骤

### 步骤1：分析现有状态结构
**操作**：
1. 阅读 `script.js` 和 `game.js`
2. 提取所有全局变量（`gameState`、`projectExperience`、`currentRank` 等）
3. 提取所有相关函数（状态修改函数）

**输出**：
```
状态清单：
- gameState.week（周数）
- gameState.budget（资金）
- gameState.satisfaction（满意度）
- gameState.progress（项目进度）
- ...

函数清单：
- nextWeek()（进入下周）
- saveGame()（保存游戏）
- loadGame()（读取游戏）
- ...
```

**验证标准**：
- ✅ 状态清单完整（无遗漏）
- ✅ 函数清单完整（无遗漏）

---

### 步骤2：创建游戏主状态 Store
**操作**：
创建 `src/stores/game.js`

**代码示例**：
```javascript
// src/stores/game.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // ========== 状态定义 ==========
  const week = ref(1)
  const budget = ref(100)
  const satisfaction = ref(80)
  const progress = ref(0)
  const prdVersion = ref('V1.0.0')
  const gameOver = ref(false)
  const showReportModal = ref(false)
  
  // ========== 计算属性 ==========
  const currentQuarter = computed(() => Math.floor(week.value / 12) + 1)
  const isGameOver = computed(() => satisfaction.value <= 0)
  const progressPercent = computed(() => Math.min(100, progress.value))
  
  // ========== 动作定义 ==========
  function nextWeek() {
    week.value++
    saveGame()
  }
  
  function updateBudget(amount) {
    budget.value += amount
    if (budget.value < 0) budget.value = 0
    saveGame()
  }
  
  function updateSatisfaction(delta) {
    satisfaction.value += delta
    if (satisfaction.value > 100) satisfaction.value = 100
    if (satisfaction.value < 0) {
      satisfaction.value = 0
      gameOver.value = true
    }
    saveGame()
  }
  
  function saveGame() {
    const state = {
      week: week.value,
      budget: budget.value,
      satisfaction: satisfaction.value,
      progress: progress.value,
      prdVersion: prdVersion.value
    }
    localStorage.setItem('fair_office_game_state', JSON.stringify(state))
  }
  
  function loadGame() {
    const saved = localStorage.getItem('fair_office_game_state')
    if (saved) {
      const state = JSON.parse(saved)
      week.value = state.week || 1
      budget.value = state.budget || 100
      satisfaction.value = state.satisfaction || 80
      progress.value = state.progress || 0
      prdVersion.value = state.prdVersion || 'V1.0.0'
    }
  }
  
  function resetGame() {
    week.value = 1
    budget.value = 100
    satisfaction.value = 80
    progress.value = 0
    prdVersion.value = 'V1.0.0'
    gameOver.value = false
    saveGame()
  }
  
  // ========== 返回值 ==========
  return {
    // 状态
    week,
    budget,
    satisfaction,
    progress,
    prdVersion,
    gameOver,
    showReportModal,
    
    // 计算属性
    currentQuarter,
    isGameOver,
    progressPercent,
    
    // 动作
    nextWeek,
    updateBudget,
    updateSatisfaction,
    saveGame,
    loadGame,
    resetGame
  }
})
```

**验证标准**：
- ✅ Store 创建成功
- ✅ 所有状态已定义（ref）
- ✅ 所有计算属性已定义（computed）
- ✅ 所有动作已定义（functions）
- ✅ 无 TypeScript 错误（如果使用 TS）

---

### 步骤3：创建玩家状态 Store
**操作**：
创建 `src/stores/player.js`

**代码示例**：
```javascript
// src/stores/player.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const projectExperience = ref(0)
  const currentRank = ref('P5')
  const ranks = ref([])
  
  // 计算属性
  const nextRank = computed(() => {
    const currentIndex = ranks.value.findIndex(r => r.id === currentRank.value)
    return ranks.value[currentIndex + 1] || null
  })
  
  const progressToNextRank = computed(() => {
    if (!nextRank.value) return 100
    return (projectExperience.value / nextRank.value.requiredExp) * 100
  })
  
  // 动作
  function addExperience(exp) {
    projectExperience.value += exp
    checkRankUp()
  }
  
  function checkRankUp() {
    const next = nextRank.value
    if (next && projectExperience.value >= next.requiredExp) {
      currentRank.value = next.id
      return true
    }
    return false
  }
  
  function loadRanks() {
    // 从 data/ranks.json 加载
    fetch('/src/data/ranks.json')
      .then(r => r.json())
      .then(data => {
        ranks.value = data.ranks
      })
  }
  
  return {
    projectExperience,
    currentRank,
    ranks,
    nextRank,
    progressToNextRank,
    addExperience,
    checkRankUp,
    loadRanks
  }
})
```

**验证标准**：
- ✅ 玩家状态 Store 创建成功
- ✅ 职级系统逻辑正确

---

### 步骤4：创建报表美容 Store
**操作**：
创建 `src/stores/reportBeauty.js`

**代码示例**：
```javascript
// src/stores/reportBeauty.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useReportBeautyStore = defineStore('reportBeauty', () => {
  // 状态
  const isActive = ref(false)
  const currentStage = ref(1) // 1=乱糟糟报表, 2=PK, 3=矿工, 4=美容后
  const pkRound = ref(1)
  const minerHooks = ref(3)
  const minerScore = ref(0)
  
  // 计算属性
  const isPKStage = computed(() => currentStage.value === 2)
  const isMinerStage = computed(() => currentStage.value === 3)
  
  // 动作
  function startBeauty() {
    isActive.value = true
    currentStage.value = 1
  }
  
  function startPK() {
    currentStage.value = 2
    pkRound.value = 1
  }
  
  function nextPKRound() {
    pkRound.value++
    if (pkRound.value > 3) {
      startMiner()
    }
  }
  
  function startMiner() {
    currentStage.value = 3
    minerHooks.value = 3
    minerScore.value = 0
  }
  
  function finishMiner() {
    currentStage.value = 4
  }
  
  function submitBeautifulReport() {
    isActive.value = false
    // 计算满意度变化
    return minerScore.value
  }
  
  return {
    isActive,
    currentStage,
    pkRound,
    minerHooks,
    minerScore,
    isPKStage,
    isMinerStage,
    startBeauty,
    startPK,
    nextPKRound,
    startMiner,
    finishMiner,
    submitBeautifulReport
  }
})
```

**验证标准**：
- ✅ 报表美容 Store 创建成功
- ✅ 阶段切换逻辑正确

---

### 步骤5：在组件中使用 Store
**操作**：
更新各个 Vue 组件，使用 Pinia Store

**代码示例**：
```vue
<!-- src/components/GameHUD.vue -->
<template>
  <div class="status-bar">
    <div class="status-item">
      <span>周数:</span>
      <span>{{ gameStore.week }}</span>
    </div>
    <div class="status-item">
      <span>💰 资金:</span>
      <span>{{ gameStore.budget }}</span>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()
</script>
```

**验证标准**：
- ✅ 所有组件已更新为使用 Store
- ✅ 数据响应式更新正常
- ✅ 无控制台错误

---

### 步骤6：移除原有全局变量
**操作**：
1. 删除 `script.js` 中的 `gameState` 定义
2. 删除 `script.js` 中的全局函数
3. 确保所有逻辑已迁移到 Store

**验证标准**：
- ✅ 无全局变量 `gameState`
- ✅ 无全局函数（全部在 Store 中）
- ✅ 功能正常运行

---

## 验收标准

| 项次 | 验收项 | 验收结果 | 备注 |
|------|--------|----------|------|
| 4.1 | 游戏主状态 Store 创建成功 | ☐ 待验收 | `useGameStore` |
| 4.2 | 玩家状态 Store 创建成功 | ☐ 待验收 | `usePlayerStore` |
| 4.3 | 报表美容 Store 创建成功 | ☐ 待验收 | `useReportBeautyStore` |
| 4.4 | 所有状态已迁移 | ☐ 待验收 | 无遗漏 |
| 4.5 | 所有函数已迁移 | ☐ 待验收 | 无遗漏 |
| 4.6 | 组件中正确使用 Store | ☐ 待验收 | 无控制台错误 |
| 4.7 | 数据响应式更新正常 | ☐ 待验收 | 修改 Store 后 UI 自动更新 |
| 4.8 | localStorage 保存/读取正常 | ☐ 待验收 | 刷新页面后状态恢复 |
| 4.9 | 原有全局变量已移除 | ☐ 待验收 | 无 `gameState` 全局变量 |

---

## 风险与依赖

### 风险
- 🔴 **高风险**：状态迁移遗漏，导致功能异常
  - **解决方案**：逐行对比原有 `script.js`，确保逻辑完整
- 🟡 **中风险**：Store 之间互相引用，导致循环依赖
  - **解决方案**：使用 `useXxxStore()` 时在函数内部调用，避免顶层调用
- 🟢 **低风险**：TypeScript 类型错误（如果使用 TS）
  - **解决方案**：为 Store 定义 TypeScript 接口

### 依赖
- 依赖批次1（项目骨架）
- 依赖批次3（游戏页迁移）
- 被批次5依赖（24点麻将小游戏需要使用 Store）

---

## 预计工时

- **开发工时**：8小时
- **测试工时**：3小时
- **总计**：11小时

---

## 完成标准

- [ ] 所有验收项通过
- [ ] 所有状态已迁移到 Pinia Store
- [ ] 所有组件正确使用 Store
- [ ] 功能完整（与原有 script.js 一致）
- [ ] 可正常保存/读取游戏状态

---

**文档结束**
