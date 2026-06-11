# Vue 3 迁移 - 批次2：主页迁移

**文档版本**：V1.0  
**创建时间**：2026-05-21  
**负责人**：待定  
**状态**：待执行  
**优先级**：P0（核心功能）

---

## 目标

将原有 `index.html` 迁移到 Vue 3 的 `HomeView.vue`，实现主菜单功能。

---

## 依赖

- ✅ 批次1完成（项目骨架可用）

---

## 执行步骤

### 步骤1：创建 HomeView.vue 组件
**操作**：
1. 创建 `src/views/HomeView.vue`
2. 从 `index.html` 复制HTML结构
3. 转换为 Vue 模板语法

**代码示例**：
```vue
<!-- src/views/HomeView.vue -->
<template>
  <div class="main-menu">
    <header class="logo-section">
      <h1 class="logo-title">公平事务所</h1>
      <p class="logo-subtitle">Fairness Studio</p>
    </header>
    
    <main class="buttons-section">
      <button class="pixel-btn btn-start-game" @click="startGame">
        <span class="btn-icon">▶</span>
        <span class="btn-text">开始游戏</span>
      </button>
      
      <div class="secondary-buttons">
        <button class="pixel-btn btn-secondary" @click="showLevelUp">
          <span class="btn-icon">🔥</span>
          <span class="btn-text">卷一卷</span>
        </button>
        <button class="pixel-btn btn-secondary" @click="showGallery">
          <span class="btn-icon">🃏</span>
          <span class="btn-text">人才库</span>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const startGame = () => {
  gameStore.nextWeek()
  router.push('/game')
}

const showLevelUp = () => {
  // TODO: 实现卷一卷功能
}

const showGallery = () => {
  // TODO: 实现人才库功能
}
</script>

<style scoped>
.main-menu {
  /* 从 css/home.css 迁移样式 */
}
</style>
```

**验证标准**：
- ✅ HomeView.vue 创建成功
- ✅ 模板语法正确（无 Vue 编译错误）
- ✅ 按钮点击事件绑定正确

---

### 步骤2：迁移 CSS 样式
**操作**：
1. 复制 `css/home.css` 内容到 `HomeView.vue` 的 `<style scoped>` 中
2. 复制 `css/base.css` 到 `src/assets/css/base.css`
3. 在 `App.vue` 中引入全局样式：
   ```javascript
   import '@/assets/css/base.css'
   ```

**验证标准**：
- ✅ 样式显示正确（与原有 index.html 一致）
- ✅ 无样式冲突（scoped 生效）

---

### 步骤3：迁移 JavaScript 逻辑
**操作**：
1. 从 `script.js` 提取主页相关逻辑
2. 迁移到 Pinia Store（`src/stores/game.js`）
3. 在 `HomeView.vue` 中调用 Store

**代码示例**：
```javascript
// src/stores/game.js
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    week: 1,
    budget: 100,
    satisfaction: 80
  }),
  actions: {
    nextWeek() {
      this.week++
      this.saveGame()
    },
    saveGame() {
      localStorage.setItem('gameState', JSON.stringify(this.$state))
    }
  }
})
```

**验证标准**：
- ✅ 游戏状态管理正确
- ✅ localStorage 保存/读取正常

---

### 步骤4：配置 Vue Router
**操作**：
更新 `src/router/index.js`，确保 `/` 路由指向 `HomeView.vue`

**验证标准**：
- ✅ 访问 `http://localhost:3000/` 看到主页
- ✅ 点击"开始游戏"跳转到 `/game`

---

## 验收标准

| 项次 | 验收项 | 验收结果 | 备注 |
|------|--------|----------|------|
| 2.1 | HomeView.vue 创建成功 | ☐ 待验收 | 文件存在 |
| 2.2 | 主菜单UI显示正确 | ☐ 待验收 | 与原有index.html一致 |
| 2.3 | 按钮点击事件绑定正确 | ☐ 待验收 | 点击"开始游戏"跳转 |
| 2.4 | CSS样式迁移完成 | ☐ 待验收 | 无样式丢失 |
| 2.5 | JavaScript逻辑迁移完成 | ☐ 待验收 | 游戏状态管理正常 |
| 2.6 | Vue Router配置正确 | ☐ 待验收 | 路由跳转正常 |

---

## 风险与依赖

### 风险
- 🟡 **中风险**：CSS样式冲突（scoped 可能不够）
  - **解决方案**：使用深度选择器 `:deep()`
- 🟢 **低风险**：JavaScript逻辑迁移错误
  - **解决方案**：对比原有 `script.js` 逻辑

### 依赖
- 依赖批次1（项目骨架）
- 被批次3依赖（游戏页需要主页跳转）

---

## 预计工时

- **开发工时**：6小时
- **测试工时**：2小时
- **总计**：8小时

---

## 完成标准

- [ ] 所有验收项通过
- [ ] 主页功能完整（与原有index.html一致）
- [ ] 可跳转到游戏页

---

**文档结束**
