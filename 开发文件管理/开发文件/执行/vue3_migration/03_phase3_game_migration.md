# Vue 3 迁移 - 批次3：游戏页迁移

**文档版本**：V1.0  
**创建时间**：2026-05-21  
**负责人**：待定  
**状态**：待执行  
**优先级**：P0（核心功能）

---

## 目标

将原有 `game.html` 迁移到 Vue 3 的 `GameView.vue`，实现游戏主界面功能。

---

## 依赖

- ✅ 批次1完成（项目骨架可用）
- ✅ 批次2完成（主页可跳转）

---

## 执行步骤

### 步骤1：创建 GameView.vue 组件
**操作**：
1. 创建 `src/views/GameView.vue`
2. 从 `game.html` 复制HTML结构
3. 转换为 Vue 模板语法（`<template>`）
4. 拆分出可复用组件：
   - `GameHUD.vue`（顶部状态栏）
   - `TeamPanel.vue`（左侧团队成员）
   - `EventCard.vue`（右侧事件卡片）
   - `WeeklyReport.vue`（中间周报）

**代码示例**：
```vue
<!-- src/views/GameView.vue -->
<template>
  <div class="game-container">
    <!-- 顶部状态栏 -->
    <GameHUD />
    
    <div class="main-wrapper">
      <!-- 左侧团队成员 -->
      <TeamPanel />
      
      <!-- 中间周报 -->
      <WeeklyReport />
      
      <!-- 右侧事件卡片 -->
      <EventCard />
    </div>
    
    <!-- 模态框 -->
    <ReportModal />
    <RecruitModal />
  </div>
</template>

<script setup>
import GameHUD from '@/components/GameHUD.vue'
import TeamPanel from '@/components/TeamPanel.vue'
import EventCard from '@/components/EventCard.vue'
import WeeklyReport from '@/components/WeeklyReport.vue'
import ReportModal from '@/components/ReportModal.vue'
import RecruitModal from '@/components/RecruitModal.vue'

import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()
</script>

<style scoped>
.game-container {
  /* 从 css/game.css 迁移样式 */
}
</style>
```

**验证标准**：
- ✅ GameView.vue 创建成功
- ✅ 子组件拆分合理（可复用）
- ✅ 模板语法正确（无 Vue 编译错误）

---

### 步骤2：迁移顶部状态栏（GameHUD.vue）
**操作**：
1. 从 `game.html` 提取 `<div class="status-bar-wrapper">` 部分
2. 创建 `src/components/GameHUD.vue`
3. 使用 Pinia Store 绑定数据（周数、资金、满意度）

**代码示例**：
```vue
<!-- src/components/GameHUD.vue -->
<template>
  <div class="status-bar-wrapper">
    <div class="status-bar">
      <div class="status-item">
        <span>周数:</span>
        <span class="status-value">{{ gameStore.week }}</span>
      </div>
      <div class="status-item">
        <span>💰 资金:</span>
        <span class="status-value">{{ gameStore.budget }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()
</script>

<style scoped>
.status-bar-wrapper {
  /* 从 css/game.css 迁移 */
}
</style>
```

**验证标准**：
- ✅ 状态栏显示正确（周数、资金、满意度）
- ✅ 数据响应式更新（修改 Store 后UI自动更新）

---

### 步骤3：迁移游戏状态管理（Pinia Store）
**操作**：
1. 从 `script.js` 提取 `gameState` 对象
2. 迁移到 `src/stores/game.js`（Pinia Store）
3. 将原有函数迁移为 Store 的 `actions`

**代码示例**：
```javascript
// src/stores/game.js
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    week: 1,
    budget: 100,
    satisfaction: 80,
    progress: 0,
    // ... 其他状态
  }),
  
  actions: {
    nextWeek() {
      this.week++
      this.saveGame()
    },
    
    saveGame() {
      localStorage.setItem('fair_office_game_state', JSON.stringify(this.$state))
    },
    
    loadGame() {
      const saved = localStorage.getItem('fair_office_game_state')
      if (saved) {
        this.$patch(JSON.parse(saved))
      }
    },
    
    // 迁移原有函数
    handleEvent(option) {
      // 原有 script.js 中的事件处理逻辑
    }
  },
  
  getters: {
    isGameOver: (state) => state.satisfaction <= 0,
    currentQuarter: (state) => Math.floor(state.week / 12) + 1
  }
})
```

**验证标准**：
- ✅ 所有原有状态已迁移
- ✅ 所有原有函数已迁移为 actions
- ✅ localStorage 保存/读取正常

---

### 步骤4：迁移事件系统
**操作**：
1. 创建 `src/stores/events.js`（事件 Store）
2. 从 `data/events.json` 加载事件数据
3. 在 `EventCard.vue` 中显示事件和选项

**代码示例**：
```vue
<!-- src/components/EventCard.vue -->
<template>
  <div class="event-card">
    <h3>{{ currentEvent.title }}</h3>
    <p>{{ currentEvent.description }}</p>
    <div class="event-options">
      <button 
        v-for="(option, index) in currentEvent.options" 
        :key="index"
        @click="handleOption(option)"
      >
        {{ option.text }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useEventsStore } from '@/stores/events'

const gameStore = useGameStore()
const eventsStore = useEventsStore()

const currentEvent = ref({})

onMounted(() => {
  currentEvent.value = eventsStore.getRandomEvent()
})

const handleOption = (option) => {
  gameStore.handleEvent(option)
  currentEvent.value = eventsStore.getRandomEvent()
}
</script>
```

**验证标准**：
- ✅ 事件卡片显示正确
- ✅ 选项点击后触发对应效果
- ✅ 事件随机刷新正常

---

### 步骤5：迁移模态框
**操作**：
1. 将 `game.html` 中的模态框拆分为独立组件：
   - `ReportModal.vue`（报表模态框）
   - `RecruitModal.vue`（招聘模态框）
   - `BorrowModal.vue`（借钱模态框）
2. 使用 Vue 的条件渲染（`v-if` / `v-show`）控制显示

**代码示例**：
```vue
<!-- src/components/ReportModal.vue -->
<template>
  <div class="report-modal" v-if="gameStore.showReportModal">
    <div class="report-content">
      <h2>📊 季度报表</h2>
      <!-- 报表内容 -->
      <button @click="closeReport">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from '@/stores/game'
const gameStore = useGameStore()

const closeReport = () => {
  gameStore.showReportModal = false
}
</script>
```

**验证标准**：
- ✅ 所有模态框已拆分为独立组件
- ✅ 模态框显示/隐藏正常
- ✅ 模态框内逻辑正确

---

## 验收标准

| 项次 | 验收项 | 验收结果 | 备注 |
|------|--------|----------|------|
| 3.1 | GameView.vue 创建成功 | ☐ 待验收 | 文件存在 |
| 3.2 | 子组件拆分合理 | ☐ 待验收 | GameHUD / TeamPanel / EventCard 等 |
| 3.3 | 顶部状态栏显示正确 | ☐ 待验收 | 周数、资金、满意度 |
| 3.4 | 游戏状态管理迁移完成 | ☐ 待验收 | Pinia Store 正常工作 |
| 3.5 | 事件系统迁移完成 | ☐ 待验收 | 事件卡片显示和交互正常 |
| 3.6 | 模态框迁移完成 | ☐ 待验收 | 所有模态框可正常打开/关闭 |
| 3.7 | 数据响应式更新 | ☐ 待验收 | 修改 Store 后 UI 自动更新 |
| 3.8 | localStorage 保存/读取 | ☐ 待验收 | 刷新页面后状态恢复 |

---

## 风险与依赖

### 风险
- 🔴 **高风险**：游戏逻辑复杂，迁移容易遗漏
  - **解决方案**：逐函数对比原有 `script.js`，确保逻辑完整
- 🟡 **中风险**：组件拆分不合理，导致props/events传递混乱
  - **解决方案**：先画组件树，明确数据流向
- 🟢 **低风险**：CSS样式丢失
  - **解决方案**：逐个组件对比原有样式

### 依赖
- 依赖批次1（项目骨架）
- 依赖批次2（主页可跳转）
- 被批次4依赖（报表美容小游戏需要在游戏页中打开）

---

## 预计工时

- **开发工时**：12小时
- **测试工时**：4小时
- **总计**：16小时

---

## 完成标准

- [ ] 所有验收项通过
- [ ] 游戏主界面功能完整（与原有 game.html 一致）
- [ ] 可正常进行事件选择、周报提交等操作
- [ ] 可正常打开各个模态框（招聘、借钱、报表等）

---

**文档结束**
