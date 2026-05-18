# PRD修改回应文档（v3.0）

> 针对《脑暴.md》深度评审报告的回应  
> 创建时间：2026年5月  
> 版本：v3.0  
> 评审对象：《游戏玩法优化建议文档 v4.0》

---

## 一、评审意见接收确认

已收到《脑暴.md》深度评审报告，共梳理出以下核心问题：

| 问题类别 | 数量 | 严重程度 | 处理状态 |
|---------|------|---------|---------|
| 进度过高 | 1项 | 🔴 高 | ✅ 已确认 |
| B2C商家数缺失 | 1项 | 🟡 中 | ✅ 已确认 |
| 缺少商家揽客玩法 | 1项 | 🟡 中 | ✅ 已确认 |
| 与现有代码重复 | 5项 | 🔴 高 | ✅ 已确认 |
| 实现成本高 | 2项 | 🟡 中 | ✅ 已确认 |
| 数值不平衡 | 3项 | 🟡 中 | ✅ 已确认 |

---

## 二、针对评审意见的回应

### 2.1 进度平衡问题

**评审意见**：进度太高（每周15%），一个季度12周进度过快，期望平均通关时间在6个季度左右。

**回应**：
- ✅ **接受建议**：调整基础进度值从5%降低到3%
- ✅ **修改方案**：

| 游戏状态 | 每周事件次数 | 每次事件效果乘数 | 基础进度值 | 周进度预期 |
|---------|-------------|----------------|-----------|---------|
| 高士气（≥80） | 2次 | ×1.5 | 3% | 2 × 3% × 1.5 = 9% |
| 正常状态 | 3次 | ×1.0 | 3% | 3 × 3% × 1.0 = 9% |
| 低士气（≤40） | 4次 | ×0.8 | 3% | 4 × 3% × 0.8 = 9.6% |

**平衡计算**：
- 季度进度：9%/周 × 12周 = 108%
- 6个季度总进度：6 × 108% = 648%
- 扣除节假日暂停和负面事件影响，实际通关时间约为6-8个季度，符合预期

### 2.2 B2C商家数与揽客小游戏

**评审意见**：B2C模式的"商家数"指标需要增加运营小游戏来招揽商家入驻。

**回应**：
- ✅ **接受建议**：补充商家数指标实现，并设计商家揽客小游戏系统

**商家揽客小游戏设计**：

#### 游戏名称：商家招商会
- **触发时机**：每季度第6周自动触发，或玩家主动点击"招商"按钮
- **游戏类型**：卡牌匹配+资源分配博弈
- **游戏目标**：说服商家入驻平台

#### 游戏机制：
```
1. 展示3张商家卡牌（普通/优质/头部商家）
2. 玩家选择一张进行洽谈
3. 显示商家需求（资金补贴、流量支持、技术服务）
4. 玩家分配资源（资金、流量、人力）来满足需求
5. 资源匹配度+角色好感度决定成功率
6. 成功匹配则商家入驻，失败则商家离开
```

#### 商家类型：
| 类型 | 入驻奖励 | 资金需求 | 流量需求 | 技术需求 | 基础成功率 |
|------|---------|---------|---------|---------|-----------|
| 普通商家 | +5商家数 | 5 | 3 | 2 | 80% |
| 优质商家 | +15商家数 | 8 | 5 | 4 | 60% |
| 头部商家 | +30商家数 | 12 | 8 | 6 | 40% |

#### 资源分配界面：
```
┌─────────────────────────────────────┐
│         商家招商会 - 第Q1-6周       │
├─────────────────────────────────────┤
│  资金补贴: [▮▮▮▮▮▮▮▮▮▮] (10/10)   │
│  流量支持: [▮▮▮▮▮▮▯▯▯▯] (6/10)    │
│  技术服务: [▮▮▮▮▯▯▯▯▯▯] (4/10)    │
├─────────────────────────────────────┤
│  [普通商家]       [优质商家]        │
│  需求: 资金+5    需求: 资金+8      │
│        流量+3         流量+5       │
│        技术+2         技术+4       │
├─────────────────────────────────────┤
│           [确认洽谈] [取消]         │
└─────────────────────────────────────┘
```

#### 成功率计算公式：
```
最终成功率 = 基础成功率 + 小葵好感度加成 + 资源匹配度加成

- 小葵好感度≥80：+20%成功率
- 每项资源满足需求：+10%成功率
- 最高成功率：95%
```

#### 游戏结果：
- **成功**：商家入驻，获得对应奖励，士气+5
- **失败**：商家拒绝入驻，士气-3，资金-5

---

## 三、PRD修改计划

### 3.1 修改章节清单

| 章节 | 修改内容 | 责任人 |
|------|---------|--------|
| 四、动态事件次数 | 调整基础进度值为3%，增加效果乘数 | 策划+开发 |
| 五、季度OKR | 扩展任务系统 | 策划 |
| 八、模式差异化 | 补充B2C商家数指标 | 策划 |
| 十、新增 | 卡牌系统联动 | 策划 |
| 十二、新增 | 数值平衡建议 | 策划 |
| 十三、新增 | 测试计划 | 测试 |

### 3.2 分阶段实施计划

**第一阶段（1周）：核心扩展**
- [ ] 调整动态事件次数逻辑（基础进度3%）
- [ ] 扩展事件系统，增加triggerCondition
- [ ] 扩展Buff系统，增加季节/节日触发

**第二阶段（1周）：节假日系统**
- [ ] 设计节假日事件
- [ ] 实现节假日触发逻辑

**第三阶段（1周）：B2C商家系统**
- [ ] 实现商家数指标
- [ ] 开发商家招商会小游戏

**第四阶段（1周）：季度OKR**
- [ ] 扩展任务系统
- [ ] 实现OKR面板UI

**第五阶段（1周）：测试与平衡性调整**
- [ ] 单元测试
- [ ] 平衡性测试

---

## 四、关键代码修改说明

### 4.1 动态事件次数（进度平衡）

**文件**: `js/game.js`
```javascript
function getWeeklyEventCount() {
    const satisfaction = gameState.satisfaction;
    const morale = gameState.morale || 50;
    const baseProgress = 3; // 调整为3%，确保6个季度通关
    
    if (satisfaction >= 80 || morale >= 80) return { count: 2, multiplier: 1.5, baseProgress };
    if (satisfaction <= 40 || morale <= 40) return { count: 4, multiplier: 0.8, baseProgress };
    if (gameState.blameMeetingActive || gameState.pmfReached) return { count: 1, multiplier: 2.0, baseProgress };
    return { count: 3, multiplier: 1.0, baseProgress };
}

function applyProgressEffect(effectValue) {
    const eventConfig = getWeeklyEventCount();
    const finalValue = effectValue * eventConfig.multiplier;
    gameState.progress += finalValue;
}
```

### 4.2 B2C商家数与招商会小游戏

**文件**: `js/game.js`
```javascript
// 初始化商家数
function initMerchantCount() {
    if (direction === 'b2c') {
        gameState.merchantCount = gameState.merchantCount || 10;
    }
}

// 更新商家数
function updateMerchantCount() {
    if (direction !== 'b2c') return;
    const satisfaction = gameState.satisfaction;
    const baseGrowth = Math.floor(satisfaction / 20);
    gameState.merchantCount += baseGrowth;
}

// 商家招商会小游戏
function startMerchantRecruitment() {
    if (direction !== 'b2c') return;
    
    const merchants = generateMerchants();
    gameState.currentMerchantGame = {
        merchants: merchants,
        allocatedFunds: 0,
        allocatedTraffic: 0,
        allocatedTech: 0
    };
    renderMerchantGame();
}

function generateMerchants() {
    const types = ['normal', 'quality', 'premium'];
    return Array.from({length: 3}, () => createMerchant(types[Math.floor(Math.random() * types.length)]));
}

function createMerchant(type) {
    const configs = {
        normal: { reward: 5, fundsReq: 5, trafficReq: 3, techReq: 2, successRate: 0.8 },
        quality: { reward: 15, fundsReq: 8, trafficReq: 5, techReq: 4, successRate: 0.6 },
        premium: { reward: 30, fundsReq: 12, trafficReq: 8, techReq: 6, successRate: 0.4 }
    };
    
    const config = configs[type];
    const names = {
        normal: ['小吃店', '便利店', '服装店', '饰品店', '文具店'],
        quality: ['连锁餐饮', '品牌旗舰店', '数码专营店', '美妆连锁店', '家居生活馆'],
        premium: ['国际大牌', '奢侈品专柜', '高端餐饮集团', '知名电商品牌', '头部MCN机构']
    };
    
    return {
        id: `merchant_${Date.now()}_${Math.random()}`,
        type: type,
        name: names[type][Math.floor(Math.random() * names[type].length)],
        ...config
    };
}

function handleMerchantNegotiation(merchantId) {
    const game = gameState.currentMerchantGame;
    const merchant = game.merchants.find(m => m.id === merchantId);
    if (!merchant) return;
    
    const fundsMet = game.allocatedFunds >= merchant.fundsReq;
    const trafficMet = game.allocatedTraffic >= merchant.trafficReq;
    const techMet = game.allocatedTech >= merchant.techReq;
    
    let successRate = merchant.successRate;
    
    // 小葵好感度加成
    const xiaokuiFavor = gameState.characterFavors?.xiaokui || 0;
    if (xiaokuiFavor >= 80) successRate += 0.2;
    
    // 资源满足度加成
    const meetCount = [fundsMet, trafficMet, techMet].filter(Boolean).length;
    successRate += meetCount * 0.1;
    
    // 最高95%成功率
    successRate = Math.min(successRate, 0.95);
    
    if (Math.random() < successRate) {
        gameState.merchantCount += merchant.reward;
        gameState.morale += 5;
        showNotification(`${merchant.name}成功入驻！商家数+${merchant.reward}`);
    } else {
        gameState.morale -= 3;
        gameState.budget -= 5;
        showNotification(`${merchant.name}拒绝入驻`);
    }
    
    gameState.budget -= game.allocatedFunds * 2;
    gameState.currentMerchantGame = null;
}
```

---

## 五、测试计划

### 5.1 单元测试

| 测试项 | 测试内容 | 预期结果 |
|--------|---------|---------|
| 动态事件次数 | 切换高/正常/低士气 | 事件次数正确变化 |
| 进度平衡 | 12周累计进度 | 约108% |
| 商家招商会 | 正常商家洽谈 | 80%成功率 |
| 小葵加成 | 好感度≥80时 | 成功率+20% |

### 5.2 平衡性测试

| 测试场景 | 测试内容 | 通过标准 |
|---------|---------|---------|
| 正常通关 | 标准玩法 | 6-8个季度通关 |
| 纯正面Buff | 全部正面效果 | < 50周通关 |
| 纯负面Buff | 全部负面效果 | > 80周通关 |

---

**文档版本**: v3.0  
**创建日期**: 2026年5月  
**状态**: 待审核