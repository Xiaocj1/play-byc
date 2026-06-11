# Vue 3 迁移 - 批次5：24点麻将小游戏

**文档版本**：V1.0  
**创建时间**：2026-05-21  
**负责人**：待定  
**状态**：待执行  
**优先级**：P1（重要功能）

---

## 目标

实现B端独有的24点麻将小游戏，在换甲方时触发，用于提升甲方满意度。

---

## 依赖

- ✅ 批次1完成（项目骨架可用）
- ✅ 批次3完成（游戏页迁移完成）
- ✅ 批次4完成（状态管理迁移完成）

---

## 执行步骤

### 步骤1：创建24点麻将组件
**操作**：
1. 创建 `src/components/Mahjong24.vue`
2. 实现24点小游戏逻辑

**代码示例**：
```vue
<!-- src/components/Mahjong24.vue -->
<template>
  <div class="mahjong-24-modal" v-if="gameStore.showMahjong24">
    <div class="mahjong-24-content">
      <button class="close-btn" @click="closeGame">X</button>
      
      <h2>🀄 甲方预算分配（24点）</h2>
      
      <!-- 甲方信息 -->
      <div class="client-info">
        <h3>当前甲方：{{ clientStore.currentClient.name }}</h3>
        <p>隐藏条件：{{ showCondition ? condition : '???' }}</p>
        <button @click="viewCondition" :disabled="!hasFunctionCard">
          {{ showCondition ? '已查看' : '查看条件（消耗1张功能牌）' }}
        </button>
      </div>
      
      <!-- 牌面展示 -->
      <div class="cards-area">
        <div 
          v-for="(card, index) in cards" 
          :key="index"
          class="card"
          :class="{ 
            'selected': selectedCards.includes(index),
            'value-card': card.type === 'value',
            'risk-card': card.type === 'risk',
            'cost-card': card.type === 'cost',
            'compliance-card': card.type === 'compliance'
          }"
          @click="toggleCard(index)"
        >
          <span class="card-value">{{ card.value }}</span>
          <span class="card-type">{{ cardTypeLabel(card.type) }}</span>
        </div>
      </div>
      
      <!-- 表达式显示 -->
      <div class="expression-area">
        <h3>当前表达式：</h3>
        <div class="expression">{{ expression }}</div>
        <div class="result" :class="{ 'success': result === 24, 'fail': result !== 24 && result !== null }">
          结果：{{ result !== null ? result : '???' }}
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions">
        <button @click="addOperator('+')">+</button>
        <button @click="addOperator('-')">-</button>
        <button @click="addOperator('*')">×</button>
        <button @click="addOperator('/')">÷</button>
        <button @click="clearExpression">清空</button>
        <button @click="checkResult" :disabled="selectedCards.length < 2">提交</button>
      </div>
      
      <!-- 倒计时 -->
      <div class="timer">
        剩余时间：{{ timer }}秒
      </div>
      
      <!-- 得分 -->
      <div class="score">
        当前得分：{{ score }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useClientStore } from '@/stores/client'

const gameStore = useGameStore()
const clientStore = useClientStore()

// 状态
const cards = ref([])
const selectedCards = ref([])
const expression = ref('')
const result = ref(null)
const timer = ref(60)
const score = ref(0)
const showCondition = ref(false)
const condition = ref('')
const hasFunctionCard = ref(false) // 是否有功能牌查看隐藏条件

// 初始化游戏
const initGame = () => {
  // 生成6张牌（万/条/饼/字混合）
  cards.value = generateCards(6)
  
  // 随机生成隐藏条件
  const conditions = [
    '必须使用至少1张价值牌（万）',
    '总成本（饼牌）不能超过10',
    '必须包含"中"字牌（合规）',
    '风控牌（条）不能超过2张'
  ]
  condition.value = conditions[Math.floor(Math.random() * conditions.length)]
  
  // 检查是否有功能牌
  hasFunctionCard.value = gameStore.functionCards > 0
  
  // 开始倒计时
  startTimer()
}

// 生成牌
const generateCards = (count) => {
  const newCards = []
  for (let i = 0; i < count; i++) {
    const type = ['value', 'risk', 'cost', 'compliance'][Math.floor(Math.random() * 4)]
    let value = 0
    switch (type) {
      case 'value':
        value = Math.floor(Math.random() * 9) + 1
        break
      case 'risk':
        value = -(Math.floor(Math.random() * 5) + 1)
        break
      case 'cost':
        value = -(Math.floor(Math.random() * 4) + 1)
        break
      case 'compliance':
        value = 0
        break
    }
    newCards.push({ type, value })
  }
  return newCards
}

// 切换卡牌选择
const toggleCard = (index) => {
  const idx = selectedCards.value.indexOf(index)
  if (idx > -1) {
    selectedCards.value.splice(idx, 1)
  } else {
    if (selectedCards.value.length < 4) {
      selectedCards.value.push(index)
    }
  }
  updateExpression()
}

// 更新表达式
const updateExpression = () => {
  expression.value = selectedCards.value
    .map(index => {
      const card = cards.value[index]
      return card.value >= 0 ? `+${card.value}` : `${card.value}`
    })
    .join(' ')
}

// 添加运算符
const addOperator = (op) => {
  expression.value += ` ${op} `
}

// 清空表达式
const clearExpression = () => {
  expression.value = ''
  selectedCards.value = []
  result.value = null
}

// 检查24点
const checkResult = () => {
  try {
    const evalResult = eval(expression.value.replace(/×/g, '*').replace(/÷/g, '/'))
    result.value = evalResult
    
    if (evalResult === 24) {
      // 检查隐藏条件
      let bonus = 0
      if (showCondition.value) {
        if (checkCondition()) {
          bonus = 50
        }
      }
      
      score.value = 100 + bonus + Math.floor(timer.value * 5)
      
      // 更新甲方满意度
      const satisfactionBonus = Math.floor(score.value / 10)
      clientStore.updateSatisfaction(satisfactionBonus)
      
      // 延迟关闭
      setTimeout(() => {
        closeGame()
      }, 2000)
    } else {
      result.value = evalResult
    }
  } catch (error) {
    alert('表达式错误，请检查！')
  }
}

// 检查隐藏条件
const checkCondition = () => {
  // 根据 condition.value 检查 selectedCards
  // 简化逻辑：实际需要根据条件判断
  return true
}

// 查看隐藏条件
const viewCondition = () => {
  if (hasFunctionCard.value) {
    showCondition.value = true
    gameStore.useFunctionCard()
    hasFunctionCard.value = false
  }
}

// 开始倒计时
let timerInterval = null
const startTimer = () => {
  timer.value = 60
  timerInterval = setInterval(() => {
    timer.value--
    if (timer.value <= 0) {
      clearInterval(timerInterval)
      closeGame()
    }
  }, 1000)
}

// 关闭游戏
const closeGame = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  gameStore.showMahjong24 = false
}

// 卡牌类型标签
const cardTypeLabel = (type) => {
  const labels = {
    'value': '价值',
    'risk': '风控',
    'cost': '成本',
    'compliance': '合规'
  }
  return labels[type] || type
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.mahjong-24-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.mahjong-24-content {
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  border: 4px solid;
  border-image: linear-gradient(145deg, #ffd700, #ff8c00, #ffd700) 1;
  padding: 40px;
  max-width: 800px;
  width: 90%;
  border-radius: 12px;
}

.cards-area {
  display: flex;
  gap: 15px;
  margin: 20px 0;
  justify-content: center;
}

.card {
  width: 100px;
  height: 140px;
  border: 3px solid #555;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  background: rgba(255, 255, 255, 0.05);
}

.card.selected {
  border-color: #ffd700;
  transform: translateY(-10px);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.5);
}

.card-value {
  font-size: 32px;
  font-weight: bold;
  color: #fff;
}

.card-type {
  font-size: 12px;
  color: #aaa;
  margin-top: 8px;
}

.value-card .card-value {
  color: #00ff41;
}

.risk-card .card-value {
  color: #ff4444;
}

.cost-card .card-value {
  color: #ff8c00;
}

.compliance-card .card-value {
  color: #00bfff;
}

.expression-area {
  margin: 20px 0;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.expression {
  font-size: 24px;
  color: #ffd700;
  margin: 10px 0;
  font-family: 'Courier New', monospace;
}

.result {
  font-size: 20px;
  font-weight: bold;
}

.result.success {
  color: #00ff41;
}

.result.fail {
  color: #ff4444;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.actions button {
  padding: 10px 20px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid #555;
  color: #fff;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.3s;
}

.actions button:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #ffd700;
}

.actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.timer, .score {
  text-align: center;
  font-size: 18px;
  color: #ffd700;
  margin: 10px 0;
}
</style>
```

**验证标准**：
- ✅ Mahjong24.vue 组件创建成功
- ✅ 24点小游戏逻辑正确
- ✅ 牌面显示正确（价值/风控/成本/合规）
- ✅ 表达式计算正确（+ - × ÷）
- ✅ 倒计时功能正常
- ✅ 隐藏条件查看功能正常

---

### 步骤2：在游戏页中集成24点麻将
**操作**：
1. 在 `GameView.vue` 中引入 `Mahjong24.vue`
2. 在换甲方时触发小游戏

**代码示例**：
```vue
<!-- src/views/GameView.vue -->
<template>
  <div class="game-container">
    <!-- 其他组件 -->
    <GameHUD />
    <TeamPanel />
    <EventCard />
    <WeeklyReport />
    
    <!-- 24点麻将小游戏 -->
    <Mahjong24 />
  </div>
</template>

<script setup>
import Mahjong24 from '@/components/Mahjong24.vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

// 换甲方时触发
const changeClient = () => {
  // ... 换甲方逻辑
  
  // 触发24点小游戏
  gameStore.showMahjong24 = true
}
</script>
```

**验证标准**：
- ✅ 24点麻将组件已集成到游戏页
- ✅ 换甲方时正确触发小游戏
- ✅ 小游戏关闭后返回游戏页

---

### 步骤3：实现喂牌逻辑
**操作**：
1. 24点成功后，获得"甲方能碰的牌"
2. 系统自动喂牌（打出这些牌）
3. 甲方碰牌，凑齐刻子
4. 重复4次，甲方胡牌（碰碰胡）
5. 根据喂牌次数决定合同价值

**代码示例**：
```javascript
// src/stores/mahjong.js
import { defineStore } from 'pinia'

export const useMahjongStore = defineStore('mahjong', () => {
  // 状态
  const feedCount = ref(0)
  const maxFeed = 4
  const contractValue = ref(0)
  
  // 计算属性
  const contractMultiplier = computed(() => {
    // 根据喂牌次数决定合同价值
    const multipliers = [1, 1.5, 2, 3, 5]
    return multipliers[feedCount.value] || 1
  })
  
  // 动作
  const feedCard = (cards) => {
    // 系统自动喂牌
    // ... 喂牌逻辑
    
    feedCount.value++
    
    if (feedCount.value >= maxFeed) {
      // 甲方胡牌
      finishGame()
    }
  }
  
  const finishGame = () => {
    // 计算合同价值
    const baseValue = 1000000 // 基础合同100万
    contractValue.value = baseValue * contractMultiplier.value
    
    // 更新游戏状态
    const gameStore = useGameStore()
    gameStore.updateBudget(contractValue.value / 10000) // 转换为游戏内资金
    
    // 显示结算
    showSettlement()
  }
  
  const showSettlement = () => {
    // 显示结算模态框
    // ... 结算逻辑
  }
  
  return {
    feedCount,
    maxFeed,
    contractValue,
    contractMultiplier,
    feedCard,
    finishGame
  }
})
```

**验证标准**：
- ✅ 喂牌逻辑正确
- ✅ 甲方碰牌正常
- ✅ 喂牌4次后甲方胡牌
- ✅ 合同价值计算正确（根据喂牌次数）

---

### 步骤4：实现功能牌系统
**操作**：
1. 完成甲方需求获得功能牌
2. 功能牌可以查看甲方隐藏条件
3. 功能牌数量显示在游戏中

**代码示例**：
```javascript
// src/stores/game.js (扩展)
export const useGameStore = defineStore('game', () => {
  // ... 原有状态
  
  // 新增：功能牌
  const functionCards = ref(0)
  
  // 动作
  const addFunctionCard = (count = 1) => {
    functionCards.value += count
  }
  
  const useFunctionCard = () => {
    if (functionCards.value > 0) {
      functionCards.value--
      return true
    }
    return false
  }
  
  return {
    // ... 原有返回值
    functionCards,
    addFunctionCard,
    useFunctionCard
  }
})
```

**验证标准**：
- ✅ 完成甲方需求获得功能牌
- ✅ 功能牌数量正确显示
- ✅ 使用功能牌查看隐藏条件正常
- ✅ 功能牌消耗正确

---

## 验收标准

| 项次 | 验收项 | 验收结果 | 备注 |
|------|--------|----------|------|
| 5.1 | Mahjong24.vue 组件创建成功 | ☐ 待验收 | 文件存在 |
| 5.2 | 24点小游戏逻辑正确 | ☐ 待验收 | 能正确计算24点 |
| 5.3 | 牌面显示正确（价值/风控/成本/合规） | ☐ 待验收 | UI显示正确 |
| 5.4 | 表达式计算正确（+ - × ÷） | ☐ 待验收 | 计算结果准确 |
| 5.5 | 倒计时功能正常 | ☐ 待验收 | 60秒倒计时 |
| 5.6 | 隐藏条件查看功能正常 | ☐ 待验收 | 消耗功能牌查看 |
| 5.7 | 换甲方时触发小游戏 | ☐ 待验收 | 自动弹出 |
| 5.8 | 喂牌逻辑正确 | ☐ 待验收 | 自动喂牌 |
| 5.9 | 甲方碰牌正常 | ☐ 待验收 | 碰牌动画 |
| 5.10 | 喂牌4次后甲方胡牌 | ☐ 待验收 | 碰碰胡 |
| 5.11 | 合同价值计算正确 | ☐ 待验收 | 根据喂牌次数 |
| 5.12 | 功能牌系统正常 | ☐ 待验收 | 获得/使用功能牌 |

---

## 风险与依赖

### 风险
- 🔴 **高风险**：24点算法复杂，可能有边界情况
  - **解决方案**：充分测试各种牌型组合
- 🟡 **中风险**：喂牌AI逻辑复杂
  - **解决方案**：简化喂牌逻辑（随机打牌）
- 🟢 **低风险**：UI显示问题
  - **解决方案**：调整CSS样式

### 依赖
- 依赖批次1（项目骨架）
- 依赖批次3（游戏页迁移）
- 依赖批次4（状态管理）
- 无后续依赖

---

## 预计工时

- **开发工时**：16小时
- **测试工时**：6小时
- **总计**：22小时

---

## 完成标准

- [ ] 所有验收项通过
- [ ] 24点麻将小游戏功能完整
- [ ] 喂牌逻辑正确
- [ ] 合同价值计算正确
- [ ] 功能牌系统正常

---

**文档结束**
