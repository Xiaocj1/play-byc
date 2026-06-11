# Vue 3 迁移 - 批次6：测试与优化

**文档版本**：V1.0  
**创建时间**：2026-05-21  
**负责人**：待定  
**状态**：待执行  
**优先级**：P2（辅助功能）

---

## 目标

对整个 Vue 3 迁移项目进行测试和优化，确保功能完整、性能达标。

---

## 依赖

- ✅ 批次1完成（项目骨架可用）
- ✅ 批次2完成（主页迁移完成）
- ✅ 批次3完成（游戏页迁移完成）
- ✅ 批次4完成（状态管理迁移完成）
- ✅ 批次5完成（24点麻将小游戏完成）

---

## 执行步骤

### 步骤1：单元测试
**操作**：
1. 安装测试工具：
   ```bash
   npm install -D vitest @vue/test-utils jsdom
   ```
2. 创建测试文件：
   - `tests/unit/stores/game.spec.js`（测试 Pinia Store）
   - `tests/unit/components/GameHUD.spec.js`（测试组件）
   - `tests/unit/utils/mahjong24.spec.js`（测试24点算法）

**代码示例**：
```javascript
// tests/unit/stores/game.spec.js
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/game'

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default state', () => {
    const store = useGameStore()
    expect(store.week).toBe(1)
    expect(store.budget).toBe(100)
    expect(store.satisfaction).toBe(80)
  })

  it('should increment week on nextWeek()', () => {
    const store = useGameStore()
    store.nextWeek()
    expect(store.week).toBe(2)
  })

  it('should save game state to localStorage', () => {
    const store = useGameStore()
    store.nextWeek()
    const saved = localStorage.getItem('fair_office_game_state')
    expect(saved).toBeTruthy()
    const parsed = JSON.parse(saved)
    expect(parsed.week).toBe(2)
  })
})
```

**验证标准**：
- ✅ 单元测试覆盖率 ≥ 80%
- ✅ 所有测试用例通过

---

### 步骤2：集成测试
**操作**：
1. 测试页面跳转（Vue Router）
2. 测试组件交互
3. 测试状态管理（Pinia Store 之间交互）

**代码示例**：
```javascript
// tests/integration/router.spec.js
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import GameView from '@/views/GameView.vue'

describe('Router', () => {
  it('should navigate to /game when clicking start button', async () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: HomeView },
        { path: '/game', component: GameView }
      ]
    })
    
    const wrapper = mount(HomeView, {
      global: { plugins: [router] }
    })
    
    await wrapper.find('button.btn-start-game').trigger('click')
    expect(router.currentRoute.value.path).toBe('/game')
  })
})
```

**验证标准**：
- ✅ 所有页面跳转测试通过
- ✅ 所有组件交互测试通过

---

### 步骤3：端到端测试（E2E）
**操作**：
1. 安装 Cypress：
   ```bash
   npm install -D cypress
   ```
2. 创建 E2E 测试：
   - `cypress/e2e/main_flow.cy.js`（测试主流程）
   - `cypress/e2e/mahjong24.cy.js`（测试24点麻将）

**代码示例**：
```javascript
// cypress/e2e/main_flow.cy.js
describe('Main Flow', () => {
  it('should complete a full game week', () => {
    cy.visit('http://localhost:3000')
    
    // 点击开始游戏
    cy.get('button.btn-start-game').click()
    cy.url().should('include', '/game')
    
    // 检查状态栏
    cy.get('.status-value').contains('第 1 周')
    cy.get('.status-value').contains('100')
    
    // 选择事件选项
    cy.get('.event-option').first().click()
    
    // 提交周报
    cy.get('button.report-confirm').click()
    
    // 检查周数增加
    cy.get('.status-value').contains('第 2 周')
  })
})
```

**验证标准**：
- ✅ 主流程测试通过
- ✅ 24点麻将小游戏测试通过

---

### 步骤4：性能优化
**操作**：
1. **代码分割**（Vue Router 懒加载）：
   ```javascript
   // src/router/index.js
   const routes = [
     {
       path: '/game',
       component: () => import('@/views/GameView.vue') // 懒加载
     }
   ]
   ```
2. **图片优化**（压缩图片，使用 WebP 格式）
3. **CSS 优化**（移除未使用的样式）
4. **打包分析**：
   ```bash
   npm install -D rollup-plugin-visualizer
   # 在 vite.config.js 中配置
   ```

**验证标准**：
- ✅ 首屏加载时间 < 2秒
- ✅ 打包体积 < 2MB
- ✅ Lighthouse 性能评分 ≥ 80

---

### 步骤5：浏览器兼容性测试
**操作**：
1. 测试 Chrome（最新版）
2. 测试 Firefox（最新版）
3. 测试 Edge（最新版）
4. 测试 Safari（最新版，如适用）

**验证标准**：
- ✅ 所有主流浏览器功能正常
- ✅ 无浏览器特定错误

---

### 步骤6：移动端适配（可选）
**操作**：
1. 使用响应式设计（CSS Media Queries）
2. 测试移动端显示效果

**验证标准**：
- ✅ 移动端显示正常（如需求）

---

## 验收标准

| 项次 | 验收项 | 验收结果 | 备注 |
|------|--------|----------|------|
| 6.1 | 单元测试覆盖率 ≥ 80% | ☐ 待验收 | `npx vitest --coverage` |
| 6.2 | 所有单元测试通过 | ☐ 待验收 | `npx vitest` |
| 6.3 | 所有集成测试通过 | ☐ 待验收 | `npx vitest tests/integration` |
| 6.4 | 所有 E2E 测试通过 | ☐ 待验收 | `npx cypress run` |
| 6.5 | 首屏加载时间 < 2秒 | ☐ 待验收 | Chrome DevTools |
| 6.6 | 打包体积 < 2MB | ☐ 待验收 | `npx vite build` |
| 6.7 | Lighthouse 性能评分 ≥ 80 | ☐ 待验收 | Chrome DevTools |
| 6.8 | 主流浏览器兼容性测试通过 | ☐ 待验收 | Chrome/Firefox/Edge |
| 6.9 | 移动端适配（可选） | ☐ 待验收 | 响应式设计 |

---

## 风险与依赖

### 风险
- 🟡 **中风险**：测试用例编写耗时
  - **解决方案**：优先测试核心功能（游戏状态管理、24点算法）
- 🟢 **低风险**：性能优化过度（过早优化）
  - **解决方案**：先测试，再优化（基于数据）

### 依赖
- 依赖批次1-5（所有功能已完成）
- 无后续依赖

---

## 预计工时

- **单元测试**：8小时
- **集成测试**：4小时
- **E2E 测试**：6小时
- **性能优化**：4小时
- **浏览器兼容性测试**：2小时
- **总计**：24小时

---

## 完成标准

- [ ] 所有验收项通过
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 所有测试用例通过
- [ ] 性能达标（首屏 < 2秒，打包 < 2MB）
- [ ] 浏览器兼容性测试通过

---

**文档结束**
