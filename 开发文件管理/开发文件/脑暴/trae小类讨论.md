# 卡牌光谱系统融合方案（v8.0 - 本土化设计）

> 讨论主题：借鉴《恋与深空》卡牌光谱理念，本土化设计双卡池融合系统  
> 创建时间：2026年5月18日  
> 版本：v8.0  
> 核心思路：**职业光谱 + 功能光谱**，相同光谱卡牌组合产生协同效应

---

## 一、设计理念（借鉴+本土化）

### 1.1 《恋与深空》可借鉴的精华

| 借鉴点 | 《恋与深空》 | 我们的本土化 |
|--------|--------------|-------------|
| 卡牌光谱 | 日/月/星光谱 | **职业光谱**（RD/QA/Design/Operation） |
| 卡牌定位 | 日冕位/月光位/星辉位 | **职能定位**（技术/服务/设计/运营） |
| 光谱协同 | 相同光谱卡牌组合增强 | **职业+功能双光谱协同** |
| 视觉特效 | 光谱对应的华丽特效 | **职业对应的颜色特效** |

### 1.2 本土化设计思路

**我们的系统特色**：
1. **双光谱系统**：职业光谱（员工卡牌） + 功能光谱（谈判卡牌）
2. **协同效应**：相同光谱的卡牌组合使用，效果增强
3. **视觉识别**：每个职业/功能有对应的颜色和图标

---

## 二、双光谱系统设计（v8.0）

### 2.1 光谱分类

#### 2.1.1 职业光谱（员工卡牌）

| 光谱名称 | 对应职业 | 颜色 | 图标 | 象征意义 |
|---------|---------|------|------|---------|
| 🔵 **技术光谱** | RD | 蓝色 `#3b82f6` | 💻 | 科技实力 |
| 🔴 **服务光谱** | QA | 红色 `#ef4444` | 🧪 | 品质保障 |
| 🟣 **设计光谱** | Design | 紫色 `#8b5cf6` | 🎨 | 美学价值 |
| 🟢 **运营光谱** | Operation | 绿色 `#22c55e` | 📊 | 人气魅力 |

#### 2.1.2 功能光谱（谈判卡牌）

| 光谱名称 | 对应功能 | 颜色 | 图标 | 象征意义 |
|---------|---------|------|------|---------|
| 🟡 **资金光谱** | 资金类 | 金色 `#eab308` | 💰 | 资本力量 |
| 🟢 **流量光谱** | 流量类 | 绿色 `#22c55e` | 👥 | 人气魅力 |
| 🔵 **技术光谱** | 技术类 | 蓝色 `#3b82f6` | ⚙️ | 科技实力 |
| 🟣 **特殊光谱** | 特殊类 | 紫色 `#a855f7` | ✨ | 神秘助力 |

### 2.2 光谱协同机制（核心玩法）

**协同规则**：

| 协同类型 | 触发条件 | 协同效果 | 视觉特效 |
|---------|---------|---------|---------|
| **职业协同** | 员工卡牌 + 对应功能谈判卡牌 | 谈判卡牌效果+50% | 光谱光芒爆发 |
| **功能协同** | 谈判卡牌 + 相同功能谈判卡牌 | 效果叠加×1.5 | 双重光谱漩涡 |
| **跨光谱组合** | 四个光谱各至少1张卡牌 | 所有效果+100% | 全光谱彩虹桥 |
| **职业专精** | 同职业员工卡牌≥2张 | 该职业对应的功能效果+100% | 职业光环扩散 |

**示例协同**：
1. RD员工卡牌 + 技术类谈判卡牌 → **职业协同**：技术类卡牌效果+50%
2. 技术类谈判卡牌 + 技术类谈判卡牌 → **功能协同**：效果叠加×1.5
3. RD员工卡牌×2 + 技术类谈判卡牌 → **职业专精**：技术类卡牌效果+100%

### 2.3 视觉特效设计（借鉴《恋与深空》的华丽特效）

| 光谱类型 | 特效描述 | 特效代码（CSS） |
|---------|---------|----------------|
| 🔵 技术光谱 | 蓝色电弧在卡牌间跳跃 | `box-shadow: 0 0 20px #3b82f6;` |
| 🔴 服务光谱 | 红色心形光环围绕卡牌 | `box-shadow: 0 0 20px #ef4444;` |
| 🟣 设计光谱 | 紫色丝带飘动特效 | `box-shadow: 0 0 20px #8b5cf6;` |
| 🟢 运营光谱 | 绿色数据流上升特效 | `box-shadow: 0 0 20px #22c55e;` |
| 🟡 资金光谱 | 金色硬币飞溅特效 | `box-shadow: 0 0 20px #eab308;` |
| 🟣 特殊光谱 | 紫色迷雾笼罩特效 | `box-shadow: 0 0 20px #a855f7;` |

**协同特效**（组合时触发）：
- 职业协同：卡牌间产生光谱桥梁（0.5秒动画）
- 功能协同：双重光谱漩涡（1秒动画）
- 跨光谱组合：全光谱彩虹桥（2秒动画）
- 职业专精：职业光环扩散（1.5秒动画）

---

## 三、卡牌设计详细方案

### 3.1 员工卡牌设计（职业光谱）

**数据结构扩展**（`data/cards.json`）：

```json
{
    "id": "rd_001",
    "name": "CRUD工程师",
    "rarity": "R",
    "durability": 5,
    "is_variant": false,
    "position": "RD",
    "effect": {"type": "progress", "value": 3},
    "spectrum": "tech",
    "spectrumColor": "#3b82f6",
    "spectrumIcon": "💻",
    "synergyEffect": {
        "type": "boost_tech_card",
        "value": 0.5,
        "description": "技术类谈判卡牌效果+50%"
    },
    "description": "熟练掌握增删改查"
}
```

**各职业卡牌的协同效果**：

| 职业 | 光谱 | 协同类型 | 协同效果 | 触发条件 |
|------|------|---------|---------|---------|
| RD | 🔵 技术光谱 | 职业协同 | 技术类谈判卡牌效果+50% | RD员工 + 技术类谈判卡牌 |
| QA | 🔴 服务光谱 | 职业协同 | 服务类谈判卡牌效果+50% | QA员工 + 服务类谈判卡牌 |
| Design | 🟣 设计光谱 | 职业协同 | 资金类谈判卡牌效果+50% | Design员工 + 资金类谈判卡牌 |
| Operation | 🟢 运营光谱 | 职业协同 | 流量类谈判卡牌效果+50% | Operation员工 + 流量类谈判卡牌 |

### 3.2 谈判卡牌设计（功能光谱）

**新增文件**（`data/negotiation_cards.json`）：

```json
[
    {
        "id": "negotiation_001",
        "name": "价格战",
        "spectrum": "funding",
        "spectrumColor": "#eab308",
        "spectrumIcon": "💰",
        "effect": "reduce_funding_req",
        "value": 0.5,
        "rarity": "R",
        "description": "资金需求降低50%",
        "maxUsagePerNegotiation": 1
    },
    {
        "id": "negotiation_009",
        "name": "必杀技",
        "spectrum": "special",
        "spectrumColor": "#a855f7",
        "spectrumIcon": "✨",
        "effect": "guaranteed_success",
        "value": 1.0,
        "rarity": "SSR",
        "description": "本次谈判必定成功（限1次）",
        "maxUsagePerGame": 1
    }
]
```

**各功能光谱卡牌的效果**：

| 功能光谱 | 卡牌名称 | 效果 | 稀有度 |
|---------|---------|------|--------|
| 🟡 资金光谱 | 价格战 | 资金需求-50% | R |
| 🟡 资金光谱 | 补贴大战 | 资金需求-80% | SR |
| 🟢 流量光谱 | 流量扶持 | 流量需求-50% | R |
| 🟢 流量光谱 | 爆款打造 | 流量需求-80% | SR |
| 🔵 技术光谱 | 技术支持 | 技术需求-50% | R |
| 🔵 技术光谱 | 黑科技 | 技术需求-80% | SR |
| 🟣 特殊光谱 | 组合拳 | 随机降低两项需求各50% | SR |
| 🟣 特殊光谱 | 杀手锏 | 成功率直接+30% | SR |
| 🟣 特殊光谱 | 必杀技 | 本次谈判必定成功（限1次） | SSR |

### 3.3 光谱协同效果详解

#### 3.3.1 职业协同（员工+谈判卡牌）

**触发条件**：玩家阵容中有对应职业的员工卡牌，且使用了对应功能的谈判卡牌

**示例**：
```
玩家阵容：CRUD工程师（RD，技术光谱）
使用卡牌：技术支持（技术类，技术光谱）

→ 触发职业协同：技术类谈判卡牌效果+50%
→ 技术支持效果：技术需求-50% → 技术需求-75%（50%×1.5）
```

**代码实现示例的JavaScript逻辑**：
```javascript
function calculateCardEffectWithSynergy(card, playerEmployees) {
    let effectValue = card.value;
    
    // 检查职业协同
    const synergyBoost = checkProfessionalSynergy(card, playerEmployees);
    effectValue *= (1 + synergyBoost);
    
    return effectValue;
}

function checkProfessionalSynergy(card, employees) {
    const spectrumMap = {
        'tech': 'RD',
        'funding': 'Design',
        'traffic': 'Operation',
        'service': 'QA',
        'special': 'any'
    };
    
    const requiredPosition = spectrumMap[card.spectrum];
    
    if (requiredPosition === 'any') {
        // 特殊光谱卡牌，任何员工都能产生协同
        return employees.length > 0 ? 0.5 : 0;
    }
    
    const hasMatchingEmployee = employees.some(e => e.position === requiredPosition);
    
    return hasMatchingEmployee ? 0.5 : 0;
}
```

#### 3.3.2 功能协同（谈判卡牌+谈判卡牌）

**触发条件**：玩家使用了两张相同功能光谱的谈判卡牌

**示例**：
```
玩家使用：价格战（资金光谱）+ 补贴大战（资金光谱）

→ 触发功能协同：效果叠加×1.5
→ 总效果：资金需求-50% + 资金需求-80% = -130% → 上限-80%
→ 功能协同加成：-80% × 1.5 = -120% → 上限-80%
```

**代码实现示例**：
```javascript
function calculateCombinedCardEffect(cards) {
    let totalEffect = 0;
    let synergyMultiplier = 1.0;
    
    // 检查功能协同
    const spectrumCounts = {};
    cards.forEach(card => {
        spectrumCounts[card.spectrum] = (spectrumCounts[card.spectrum] || 0) + 1;
    });
    
    // 如果有相同光谱的卡牌≥2张，触发功能协同
    for (const spectrum in spectrumCounts) {
        if (spectrumCounts[spectrum] >= 2) {
            synergyMultiplier = 1.5;
            break;
        }
    }
    
    // 计算总效果
    cards.forEach(card => {
        totalEffect += card.value;
    });
    
    // 应用功能协同
    totalEffect *= synergyMultiplier;
    
    return {
        totalEffect: Math.min(totalEffect, 0.8), // 上限80%
        synergyMultiplier: synergyMultiplier
    };
}
```

#### 3.3.3 跨光谱组合（四个光谱各至少1张）

**触发条件**：玩家的阵容+手牌中，包含了四个光谱（资金/流量/技术/特殊）各至少1张

**示例**：
```
玩家阵容：CRUD工程师（技术光谱）+ 功能测试（服务光谱）
玩家手牌：价格战（资金光谱）+ 必杀技（特殊光谱）

→ 触发跨光谱组合：所有效果+100%
→ 价格战效果：资金需求-50% → 资金需求-100%（直接降为0）
→ 必杀技效果：必定成功 → 仍然必定成功
```

**代码实现示例**：
```javascript
function checkCrossSpectrumCombo(employees, cards) {
    const spectra = new Set();
    
    // 收集所有卡牌的光谱
    employees.forEach(employee => {
        spectra.add(employee.spectrum);
    });
    
    cards.forEach(card => {
        spectra.add(card.spectrum);
    });
    
    // 如果包含了四个光谱，触发跨光谱组合
    if (spectra.size >= 4) {
        return {
            name: 'cross_spectrum_combo',
            effect: 'all_effects_+100%',
            value: 2.0,
            description: '跨光谱组合：所有效果+100%'
        };
    }
    
    return null;
}
```

#### 3.3.4 职业专精（同职业员工≥2张）

**触发条件**：玩家的阵容中，同职业的员工卡牌≥2张

**示例**：
```
玩家阵容：CRUD工程师（RD）+ 架构师（RD）

→ 触发职业专精：技术类卡牌效果+100%
→ 如果使用了技术类谈判卡牌，效果翻倍
```

**代码实现示例**：
```javascript
function checkProfessionalSpecialization(employees) {
    const positionCounts = {};
    
    employees.forEach(employee => {
        positionCounts[employee.position] = (positionCounts[employee.position] || 0) + 1;
    });
    
    for (const position in positionCounts) {
        if (positionCounts[position] >= 2) {
            return {
                name: 'professional_specialization',
                position: position,
                effect: 'boost_corresponding_spectrum',
                value: 1.0,
                description: `${position}专精：对应光谱效果+100%`
            };
        }
    }
    
    return null;
}
```

### 3.4 卡牌磨损度机制 ⚠️（与现有系统整合）

> **设计理念**：整合`playarr.md`的磨损机制，采用**磨损不可逆**设计，确保与现有报表对决系统兼容

#### 3.4.1 磨损规则（整合版）

**与`playarr.md`保持一致**：

| 使用场景 | 磨损程度 | 说明 |
|---------|---------|------|
| 报表对决中**被克制方失败** | 耐久度-1 | 与`playarr.md`一致 |
| 报表对决中**克制方胜利** | 耐久度不变 | 与`playarr.md`一致 |
| 任务执行 | 耐久度-1或-2 | 根据任务难度 |
| 招商小游戏中使用员工卡牌 | 耐久度-1 | 每次谈判 |
| 招商小游戏中使用谈判卡牌 | 耐久度-1 | 每次使用 |
| SSR特殊卡牌（如必杀技） | 耐久度-3 | 强力卡牌损耗更快 |

**设计理由**：
- 保持与现有系统的一致性，减少改动量
- 在招商小游戏中增加磨损机制，增加策略深度

#### 3.4.2 初始耐久度（根据稀有度）

| 稀有度 | 初始耐久度 | 可使用次数 | 获取难度 |
|--------|-----------|-----------|---------|
| R | 10 | 10次 | 低 |
| SR | 8 | 8次 | 中 |
| SSR | 5 | 5次 | 高 |

#### 3.4.3 磨损不可逆设计 🚫

> **设计理念**：卡牌磨损应该**无法修复**，就像互联网行业的人员磨损无法用金钱抹除一样。这是一种现实主义的表达方式。

**核心理念**：
- ❌ **不支持资金修复**：金钱无法修复人的疲惫和磨损
- ❌ **不支持时间修复**：时间也无法完全抹平互联网行业的磨损
- ✅ **磨损不可逆**：卡牌耐久度只能下降，不能恢复
- ✅ **报废即离职**：耐久度=0时，员工卡牌报废（员工离职/考公）

**设计理由**：
1. **现实主义**：反映互联网行业的真实情况 - 员工的疲惫和磨损是无法用金钱或时间完全修复的
2. **策略深度**：玩家需要谨慎使用卡牌，避免关键卡牌过早报废
3. **情感共鸣**：让玩家体验到互联网从业者的无奈和疲惫
4. **游戏平衡**：避免玩家无限制地使用卡牌，增加资源管理的重要性

**替代机制**：
虽然卡牌磨损无法修复，但可以通过以下方式**缓解磨损压力**：
1. **卡牌轮换**：合理使用不同卡牌，避免单一卡牌过度使用
2. **招募新卡**：通过抽卡获得新卡牌，替换磨损严重的老卡
3. **碎片合成**：报废的卡牌可以分解为碎片，用于合成新卡（见3.4.4节）

#### 3.4.4 报废与替换规则

**报废条件**：
- 耐久度 = 0 → 卡牌报废（员工离职/考公）

**报废后处理**：
1. **分解功能**：报废的卡牌可以分解为"卡牌碎片"
   - R卡 → 1个碎片
   - SR卡 → 3个碎片
   - SSR卡 → 10个碎片
2. **碎片兑换**：50个碎片可以兑换一张指定R卡，100个碎片兑换指定SR卡，300个碎片兑换指定SSR卡
3. **重新抽卡**：可以继续抽卡获得相同的卡牌

#### 3.4.5 UI显示设计

**卡牌耐久度显示**：

```
┌─────────────────┐
│  [卡牌图片]      │
│  名称：CRUD工程师 │
│  稀有度：R       │
│  耐久度：●●●○○   │
│          (6/10) │
│  效果：进度+3     │
└─────────────────┘
```

**耐久度颜色预警**：
- 耐久度 > 70%：绿色（●）
- 耐久度 30%-70%：黄色（●）
- 耐久度 < 30%：红色（●），显示"⚠️ 低耐久度"警告
- 耐久度 = 0：卡牌变灰，显示"已报废"

#### 3.4.6 代码实现示例

**数据结构扩展**（`data/cards.json`）：

```json
{
    "id": "rd_001",
    "name": "CRUD工程师",
    "rarity": "R",
    "maxDurability": 10,
    "currentDurability": 10,
    "position": "RD",
    "effect": {"type": "progress", "value": 3},
    "spectrum": "tech",
    // ... 其他字段
    "wearRate": 1  // 每次使用磨损1点（不可逆）
}
```

**磨损函数**（整合报表对决和招商小游戏）：

```javascript
function applyCardWear(cardId, scenario, success) {
    const card = getCardById(cardId);
    
    if (!card) return false;
    
    // 检查耐久度（磨损不可逆）
    if (card.currentDurability <= 0) {
        showNotification(`卡牌"${card.name}"已报废（耐久度=0），请替换！`);
        return false;
    }
    
    // 根据场景应用磨损
    let wearAmount = 0;
    
    if (scenario === 'report') {
        // 报表对决场景
        if (success) {
            wearAmount = 0;  // 克制方胜利，不磨损
        } else {
            wearAmount = 1;  // 被克制方失败，磨损-1
        }
    } else if (scenario === 'negotiation') {
        // 招商小游戏场景
        if (success) {
            wearAmount = 1;  // 成功使用，磨损-1
        } else {
            wearAmount = 2;  // 失败使用，磨损-2
        }
    } else if (scenario === 'mission') {
        // 任务执行场景
        wearAmount = 1;  // 任务执行，磨损-1
    }
    
    // 应用磨损
    card.currentDurability -= wearAmount;
    
    // 限制耐久度不低于0
    card.currentDurability = Math.max(0, card.currentDurability);
    
    // 如果耐久度为0，卡牌报废
    if (card.currentDurability === 0) {
        showNotification(`卡牌"${card.name}"已报废（离职/考公）！`);
        // 可以选择自动分解或提示玩家分解
    }
    
    return true;
}
```

**错误处理**：

```javascript
function useCard(cardId) {
    const card = getCardById(cardId);
    
    if (!card) return false;
    
    // 检查耐久度（磨损不可逆）
    if (card.currentDurability <= 0) {
        showNotification(`卡牌"${card.name}"已报废（耐久度=0），请替换！`);
        return false;
    }
    
    // ... 使用卡牌逻辑
}
```

### 3.5 抽卡逻辑调整 💰（解决前期贵后期便宜问题）

> **设计理念**：调整抽卡成本曲线，让前期抽卡有压力，后期抽卡有策略性

#### 3.5.1 现有抽卡逻辑的问题

**问题描述**：
- 前期资金紧张，抽卡成本高（5000-15000资金），玩家心疼
- 后期资金充裕，抽卡成本低（名声降低抽卡成本），玩家可以无限抽卡
- 导致前期抽不起，后期抽卡无脑，失去策略性

#### 3.5.2 调整方案：动态抽卡成本

**核心思路**：抽卡成本与**资金存量**和**名声**挂钩，形成"U型"成本曲线

**计算公式**：

```
抽卡成本 = 基础成本 × 名声系数 × 资金系数

其中：
- 基础成本：R卡1000，SR卡5000，SSR卡15000
- 名声系数：1.0 - (名声 / 200)  [名声越高，系数越低，最低0.5]
- 资金系数：1.0 + (资金 / 资金阈值) × 0.5  [资金越多，系数越高，最高2.0]
```

**资金阈值**：根据游戏阶段动态调整
- 前期（1-4季度）：资金阈值 = 50000
- 中期（5-8季度）：资金阈值 = 200000
- 后期（9+季度）：资金阈值 = 500000

**效果**：
- 前期：名声低 → 系数低，但资金少 → 系数低，总成本适中
- 中期：名声中 → 系数中，资金中 → 系数中，总成本适中
- 后期：名声高 → 系数低，但资金多 → 系数高，总成本回升

#### 3.5.3 抽卡概率动态调整

**根据玩家卡牌收集进度，动态调整抽卡概率**：

| 收集进度 | R卡概率 | SR卡概率 | SSR卡概率 |
|---------|---------|---------|----------|
| < 30% | 70% | 25% | 5% |
| 30%-70% | 60% | 35% | 5% |
| > 70% | 50% | 40% | 10% |

**设计理由**：
- 前期让玩家快速获得卡牌，建立阵容
- 后期增加稀有卡牌概率，让玩家有动力继续抽卡

#### 3.5.5 代码实现示例

**动态成本计算函数**：

```javascript
function calculateRecruitCost(rarity) {
    // 基础成本
    const baseCost = {
        'R': 1000,
        'SR': 5000,
        'SSR': 15000
    }[rarity];
    
    // 名声系数（0.5 - 1.0）
    const fameCoefficient = Math.max(0.5, 1.0 - (gameState.fame / 200));
    
    // 资金系数（1.0 - 2.0）
    const fundThreshold = getFundThreshold();
    const fundCoefficient = 1.0 + Math.min(1.0, gameState.funds / fundThreshold) * 0.5;
    
    // 计算总成本
    const totalCost = Math.round(baseCost * fameCoefficient * fundCoefficient);
    
    return totalCost;
}

function getFundThreshold() {
    const quarter = Math.ceil(gameState.week / 12);  // 12周 = 1季度
    
    if (quarter <= 4) {
        return 50000;   // 前期
    } else if (quarter <= 8) {
        return 200000;  // 中期
    } else {
        return 500000;  // 后期
    }
}
```

#### 3.5.6 平衡性考虑

**潜在问题**：
1. **后期抽卡成本过高**：玩家可能觉得后期抽卡太贵，失去动力
2. **概率调整太激进**：可能导致玩家觉得被"暗改概率"
3. **无保底机制可能导致玩家沮丧**：连续多次抽不到SSR可能让玩家失去动力

**应对策略**：
1. **提供成本预览**：在抽卡界面显示"预计成本"，让玩家有心理准备
2. **公开概率算法**：在游戏中公开概率计算公式，增加透明度
3. **增加其他获取途径**：通过任务奖励、活动奖励等方式获取卡牌，降低抽卡压力
4. **碎片合成系统**：报废卡牌可获得碎片，碎片可合成指定卡牌，让玩家有长期目标

### 3.6 HC动态调整机制 📊（新增）

> **设计理念**：HC（人员编制）不应固定为3，而应基于**胜利条件里程碑**动态调整，让团队规模随游戏进度自然增长

#### 3.6.1 现有HC系统的问题

**问题描述**：
- 目前HC固定为3，没有调整和增加机制
- 玩家无法扩大团队规模，限制了策略性
- 缺少成长感和成就感
- 之前的方案（资金/名声挂钩）数值离谱（初始100万→HC=103）

#### 3.6.2 基于胜利条件的HC调整方案（最终版）

**核心思路**：将胜利条件分解为**渐进式里程碑**，每达成一个里程碑就解锁更多HC，让团队规模随游戏进度自然增长

**设计优势**：
- ✅ 渐进式解锁：HC随游戏进度逐步解锁，避免初期团队过大
- ✅ 目标导向：玩家有明确目标来扩大团队规模
- ✅ 平衡性：不同方向有不同的成长路径，但最终HC上限一致
- ✅ 可扩展性：可以轻松添加新的里程碑

#### 3.6.3 里程碑设计（基于真实数值）

**1. 通用里程碑（基于资产规模）**

| 里程碑 | 条件 | HC奖励 | 累计HC | 说明 |
|--------|------|--------|---------|------|
| 🎯 初创团队 | 初始状态（资产100万） | - | 3 | 固定基础 |
| 💰 原始积累 | 资产 ≥ 200万 | +1 | 4 | 度过初创期 |
| 📈 规模扩张 | 资产 ≥ 500万 | +1 | 5 | 开始盈利 |
| 🏆 小有成就 | 资产 ≥ 1000万 | +1 | 6 | 财务自由 |
| 🚀 行业新秀 | 资产 ≥ 2000万 | +1 | 7 | 达到上市门槛 |
| 👑 达成胜利 | 达成任意胜利结局 | +1 | 8 | 游戏巅峰 |

**2. 方向特定里程碑（基于市场地位，额外奖励）**

**ToB 方向**（基于标杆客户数）

| 里程碑 | 条件 | HC奖励 |
|--------|------|--------|
| 🤝 首个客户 | 标杆客户数 ≥ 1 | +0（初始） |
| 🏢 建立口碑 | 标杆客户数 ≥ 3 | +1 |
| 🏭 行业认可 | 标杆客户数 ≥ 5 | +1 |
| 🌐 区域领先 | 标杆客户数 ≥ 10 | +1 |

**ToC 方向**（基于DAU）

| 里程碑 | 条件 | HC奖励 |
|--------|------|--------|
| 📱 产品上线 | DAU > 1万 | +0（初始） |
| 🔥 初具规模 | DAU > 10万 | +1 |
| ⭐ 小有名气 | DAU > 50万 | +1 |
| 💫 行业黑马 | DAU > 500万 | +1 |

**B2C 方向**（基于GMV）

| 里程碑 | 条件 | HC奖励 |
|--------|------|--------|
| 🛒 平台启动 | GMV > 100万 | +0（初始） |
| 📦 交易活跃 | GMV > 1000万 | +1 |
| 🎯 快速增长 | GMV > 1亿 | +1 |
| 💎 行业新贵 | GMV > 10亿 | +1 |

#### 3.6.4 实现逻辑

**核心算法**：

```javascript
/**
 * 计算HC上限（基于胜利条件里程碑）
 * @param {Object} gameState - 游戏状态
 * @returns {number} HC上限（3-8）
 */
function calculateHCLimit(gameState) {
    const baseHC = 3;  // 基础HC
    
    // 1. 通用里程碑（基于资产，最高+5）
    let assetBonus = 0;
    if (gameState.totalAssets >= 200) assetBonus++;   // 200万
    if (gameState.totalAssets >= 500) assetBonus++;   // 500万
    if (gameState.totalAssets >= 1000) assetBonus++;  // 1000万
    if (gameState.totalAssets >= 2000) assetBonus++;  // 2000万
    
    // 胜利结局达成（额外+1）
    if (gameState.ending === 'victory_ipo' || 
        gameState.ending === 'victory_acquisition' || 
        gameState.ending === 'victory_rich') {
        assetBonus = Math.min(assetBonus + 1, 5);  // 最高5
    }
    
    // 2. 方向特定里程碑（额外奖励，但总HC不超过8）
    let directionBonus = 0;
    if (gameState.direction === 'To B') {
        if (gameState.benchmarkClients >= 3) directionBonus++;
        if (gameState.benchmarkClients >= 5) directionBonus++;
        // 可选：更高里程碑
        // if (gameState.benchmarkClients >= 10) directionBonus++;
    } else if (gameState.direction === 'To C') {
        if (gameState.dau > 10) directionBonus++;   // 10万
        if (gameState.dau > 50) directionBonus++;   // 50万
        // 可选：更高里程碑
        // if (gameState.dau > 500) directionBonus++;
    } else if (gameState.direction === 'B2C') {
        if (gameState.gmv > 1000) directionBonus++;   // 1000万
        if (gameState.gmv > 10000) directionBonus++;  // 1亿
        // 可选：更高里程碑
        // if (gameState.gmv > 100000) directionBonus++;
    }
    
    // 3. 计算总HC（基础 + 资产奖励 + 方向奖励）
    // 注意：方向奖励是额外的，但总上限为8
    let totalHC = baseHC + Math.min(assetBonus, 5) + Math.min(directionBonus, 2);
    
    // 4. 上限为8
    return Math.min(totalHC, 8);
}
```

**里程碑检查函数**（在每回合结束时调用）：

```javascript
/**
 * 检查并解锁HC里程碑
 */
function checkHCMilestones() {
    const oldHCLimit = gameState.hcLimit || 3;
    const newHCLimit = calculateHCLimit(gameState);
    
    if (newHCLimit > oldHCLimit) {
        // 解锁新HC
        gameState.hcLimit = newHCLimit;
        
        // 显示通知
        showNotification(`🎉 团队扩张！HC上限提升至 ${newHCLimit}`);
        
        // 记录里程碑
        if (!gameState.hcMilestones) {
            gameState.hcMilestones = [];
        }
        gameState.hcMilestones.push({
            turn: gameState.turn,
            hcLimit: newHCLimit,
            reason: getMilestoneReason()
        });
    }
}

/**
 * 获取里程碑达成原因
 */
function getMilestoneReason() {
    if (gameState.totalAssets >= 2000) return "资产达到2000万";
    if (gameState.totalAssets >= 1000) return "资产达到1000万";
    if (gameState.totalAssets >= 500) return "资产达到500万";
    if (gameState.totalAssets >= 200) return "资产达到200万";
    
    if (gameState.direction === 'To B') {
        if (gameState.benchmarkClients >= 5) return "标杆客户达到5个";
        if (gameState.benchmarkClients >= 3) return "标杆客户达到3个";
    } else if (gameState.direction === 'To C') {
        if (gameState.dau > 50) return "DAU突破50万";
        if (gameState.dau > 10) return "DAU突破10万";
    } else if (gameState.direction === 'B2C') {
        if (gameState.gmv > 10000) return "GMV突破1亿";
        if (gameState.gmv > 1000) return "GMV突破1000万";
    }
    
    return "未知原因";
}
```

#### 3.6.5 数值平衡性分析

**初始状态**：
- 资产 = 100万
- 标杆客户 = 0（ToB）或 DAU = 10万（ToC）或 GMV = 0（B2C）
- HC上限 = 3（基础）
- **评估**：✅ 紧张但有操作空间

**游戏中期**（假设资产达到500万，标杆客户3个）：
- 资产奖励 = 2（200万+500万）
- 方向奖励 = 1（3个客户）
- HC上限 = 3 + 2 + 1 = **6**
- **评估**：✅ 团队开始扩张，有成就感

**游戏后期**（假设资产达到2000万，标杆客户5个，达成上市）：
- 资产奖励 = 5（200+500+1000+2000+胜利）
- 方向奖励 = 2（3+5）
- HC上限 = 3 + 5 + 2 = 10 → 上限**8**
- **评估**：✅ 大团队运营，但不超过上限

**成长曲线**：

| 游戏阶段 | 资产 | 方向指标 | HC上限 | 说明 |
|---------|------|---------|--------|------|
| 初始 | 100万 | 客户=0 | **3** | 初创团队，紧张 |
| 早期 | 200万 | 客户=1 | **4** | 度过初创期 |
| 中期 | 500万 | 客户=3 | **6** | 团队扩张 |
| 中晚期 | 1000万 | 客户=5 | **7** | 小有成就 |
| 后期 | 2000万 | 客户=5 | **8** | 达到上限 |
| 巅峰 | 2000万+胜利 | 客户=5 | **8** | 游戏巅峰 |

**平衡性评估**：
- ✅ 初始HC=3，紧张但合理
- ✅ 中期HC=4-6，逐步扩张，有成就感
- ✅ 后期HC=6-8，大团队运营
- ✅ 需要努力经营才能达成高HC，有挑战性
- ✅ 不同方向都有成长路径，平衡性好

#### 3.6.6 HC与卡牌磨损的关联

**设计思路**：HC越多，团队规模越大，但管理难度增加，卡牌磨损速度可能加快

**关联机制**：

```javascript
/**
 * 计算卡牌磨损速度（与HC挂钩）
 * @param {number} currentHC - 当前团队规模
 * @returns {number} 磨损速度乘数
 */
function calculateWearSpeed(currentHC) {
    const baseWear = 1;  // 基础磨损：1（每次使用磨损1点）
    
    // HC越高，磨损速度越快
    // HC=3时：磨损速度 = 1.0（正常）
    // HC=5时：磨损速度 = 1.2（增加20%）
    // HC=8时：磨损速度 = 1.5（增加50%）
    const wearMultiplier = 1 + (currentHC - 3) * 0.1;
    
    return baseWear * wearMultiplier;
}
```

**设计理由**：
- 团队规模越大，管理难度越高，卡牌磨损越快
- 玩家需要权衡：扩大团队 vs 管理成本
- 增加策略性：是否值得扩大HC？

#### 3.6.7 UI显示设计

**HC状态显示**：

```
┌─────────────────────────────────────┐
│  👥 团队状态                        │
├─────────────────────────────────────┤
│                                     │
│  当前HC：5 / 8                      │
│  ●●●●●○○○                          │
│                                     │
│  📊 里程碑进度：                    │
│  ✅ 资产≥200万 (+1)                 │
│  ✅ 资产≥500万 (+1)                 │
│  ⬜ 资产≥1000万 (+1)                │
│  ⬜ 资产≥2000万 (+1)                │
│  ✅ 客户≥3个 (+1)                   │
│  ⬜ 客户≥5个 (+1)                   │
│                                     │
│  💡 提示：达成资产或市场地位里程碑   │
│     即可解锁更多HC上限！             │
│                                     │
└─────────────────────────────────────┘
```

**里程碑解锁动画**：

```
┌─────────────────────────────────────┐
│  🎉 里程碑达成！                    │
├─────────────────────────────────────┤
│                                     │
│  🏆 资产达到500万！                │
│                                     │
│  ✨ HC上限提升：4 → 5               │
│                                     │
│  💪 现在可以招募更多员工了！         │
│                                     │
│  [继续游戏]                         │
│                                     │
└─────────────────────────────────────┘
```

#### 3.6.8 平衡性考虑

**潜在问题**：
1. **HC上限过高**：玩家可能觉得HC太多，失去管理挑战
2. **里程碑太难达成**：玩家可能觉得HC增长太慢，失去动力
3. **方向不平衡**：某个方向的里程碑比其他方向更容易达成

**应对策略**：
1. **设置HC上限**：最高8，确保管理挑战
2. **提供多种成长路径**：资产增长 + 方向特定指标，玩家可以选择擅长的方式
3. **动态调整里程碑**：根据测试数据，调整里程碑阈值
4. **提供反馈**：在UI中显示里程碑进度，让玩家清楚了解下一步目标

#### 3.6.9 测试计划

**测试场景**：

1. **ToB方向测试**：
   - 初始状态：资产100万，客户0个，HC=3
   - 达成第一个里程碑：资产200万，HC=4
   - 达成第二个里程碑：客户3个，HC=5
   - 达成第三个里程碑：资产500万，HC=6
   - ...

2. **ToC方向测试**：
   - 初始状态：资产100万，DAU=10万，HC=3
   - 达成第一个里程碑：资产200万，HC=4
   - 达成第二个里程碑：DAU>10万，HC=5
   - ...

3. **B2C方向测试**：
   - 初始状态：资产100万，GMV=0，HC=3
   - 达成第一个里程碑：资产200万，HC=4
   - 达成第二个里程碑：GMV>1000万，HC=5
   - ...

**测试指标**：
- HC成长曲线是否合理？
- 里程碑是否太难/太容易达成？
- 不同方向的平衡性如何？
- 玩家是否有成就感？

---

## 四、完整战斗流程设计（光谱协同玩法）

### 4.1 战斗准备阶段

**步骤**：
1. 查看商家需求（资金/流量/技术）
2. 配置阵容（选择1-3张员工卡牌）
3. 抽取手牌（从谈判牌库随机抽取3张谈判卡牌）
4. 查看光谱协同预览
5. 开始战斗

**UI示意**：
```
┌─────────────────────────────────────┐
│  商家：头部餐饮商家                   │
│  需求：资金(12) 流量(8) 技术(6)     │
│                                     │
│  配置阵容（选择1-3张员工卡牌）：        │
│  [CRUD工程师] [功能测试] [增长黑客]  │
│   🔵技术光谱      🔴服务光谱     🟢运营光谱 │
│  [选择]        [选择]        [选择]  │
│                                     │
│  已选择阵容：                        │
│  ✓ CRUD工程师（🔵技术光谱）          │
│    协同效果：技术类谈判卡牌效果+50%  │
│                                     │
│  抽取手牌：                          │
│  [价格战] [流量扶持] [技术支持]     │
│   🟡资金光谱      🟢流量光谱     🔵技术光谱 │
│                                     │
│  光谱协同预览：                      │
│  ✅ 职业协同触发！                  │
│     CRUD工程师 + 技术支持             │
│     → 技术需求-75%（50%×1.5）      │
│                                     │
│  [开始战斗]                          │
└─────────────────────────────────────┘
```

### 4.2 战斗阶段（光谱协同释放）

**战斗流程**：

```
【回合1：玩家回合】
  1. 玩家选择一张手牌使用（拖拽到商家区域）
  2. 检测光谱协同（职业协同/功能协同/跨光谱组合/职业专精）
  3. 播放光谱协同特效（0.5-2秒）
  4. 应用卡牌效果（考虑协同加成）
  5. 商家需求数值变化动画
  6. 检查胜利条件（所有需求降为0？）

【回合2：商家回合】
  1. 商家发动反击（需求增加或成功率降低）
  2. 玩家可以防御（使用防御类卡牌）
  3. 或闪避（消耗资源）

【回合3：玩家回合】
  ... 循环直到满足胜利条件
```

**胜利条件**：
- 商家三项需求都降为0 → 胜利
- 或成功率≥95% → 胜利

**失败条件**：
- 玩家手牌用完 → 失败
- 或回合数超过限制（如10回合）→ 失败

### 4.3 光谱协同特效播放

**特效播放逻辑**：

```javascript
function playSpectrumSynergyEffect(synergy) {
    switch (synergy.name) {
        case 'professional_synergy':
            // 职业协同：卡牌间产生光谱桥梁
            playSpectrumBridgeEffect(synergy.spectrumColor);
            break;
        case 'functional_synergy':
            // 功能协同：双重光谱漩涡
            playDualSpectrumVortexEffect(synergy.spectrumColor);
            break;
        case 'cross_spectrum_combo':
            // 跨光谱组合：全光谱彩虹桥
            playRainbowBridgeEffect();
            break;
        case 'professional_specialization':
            // 职业专精：职业光环扩散
            playProfessionAuraEffect(synergy.position);
            break;
    }
}

function playSpectrumBridgeEffect(color) {
    // 创建光谱桥梁动画
    const bridge = document.createElement('div');
    bridge.className = 'spectrum-bridge';
    bridge.style.boxShadow = `0 0 20px ${color}`;
    // ... 动画逻辑
}

function playRainbowBridgeEffect() {
    // 创建彩虹桥动画
    const rainbow = document.createElement('div');
    rainbow.className = 'rainbow-bridge';
    // ... 动画逻辑
}
```

**CSS动画示例**：
```css
/* 光谱桥梁特效 */
.spectrum-bridge {
    position: absolute;
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, #3b82f6, #eab308, #22c55e, #a855f7);
    animation: bridge-pulse 0.5s ease-in-out;
}

@keyframes bridge-pulse {
    0% { opacity: 0; transform: scaleX(0); }
    50% { opacity: 1; transform: scaleX(1.2); }
    100% { opacity: 1; transform: scaleX(1); }
}

/* 彩虹桥特效 */
.rainbow-bridge {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #3b82f6, #ef4444, #8b5cf6, #22c55e, #eab308, #a855f7);
    animation: rainbow-burst 2s ease-in-out;
}

@keyframes rainbow-burst {
    0% { opacity: 0; transform: scale(0); }
    50% { opacity: 1; transform: scale(1.5); }
    100% { opacity: 0.8; transform: scale(1); }
}
```

---

## 五、技术方案

### 5.1 数据结构扩展

#### 5.1.1 员工卡牌数据扩展（`data/cards.json`）

**新增字段**：`spectrum`、`spectrumColor`、`spectrumIcon`、`synergyEffect`

```json
{
    "id": "rd_001",
    "name": "CRUD工程师",
    "rarity": "R",
    "durability": 5,
    "is_variant": false,
    "position": "RD",
    "effect": {"type": "progress", "value": 3},
    "spectrum": "tech",
    "spectrumColor": "#3b82f6",
    "spectrumIcon": "💻",
    "synergyEffect": {
        "type": "boost_tech_card",
        "value": 0.5,
        "description": "技术类谈判卡牌效果+50%"
    },
    "description": "熟练掌握增删改查"
}
```

#### 5.1.2 谈判卡牌数据（`data/negotiation_cards.json`）

**新增文件**，包含`spectrum`、`spectrumColor`、`spectrumIcon`字段

```json
[
    {
        "id": "negotiation_001",
        "name": "价格战",
        "spectrum": "funding",
        "spectrumColor": "#eab308",
        "spectrumIcon": "💰",
        "effect": "reduce_funding_req",
        "value": 0.5,
        "rarity": "R",
        "description": "资金需求降低50%",
        "maxUsagePerNegotiation": 1
    }
]
```

#### 5.1.3 游戏状态扩展（`js/game.js`）

```javascript
// 当前战斗状态
gameState.currentBattle = {
    merchant: null,
    turn: 1,
    maxTurns: 10,
    team: [],           // 玩家阵容（员工卡牌）
    hand: [],           // 玩家手牌（谈判卡牌）
    selectedCards: [],  // 已选择的谈判卡牌
    synergies: [],      // 触发的光谱协同
    merchantReq: {       // 商家需求
        funding: 0,
        traffic: 0,
        tech: 0
    },
    successRate: 0      // 当前成功率
};
```

### 5.2 核心函数设计

#### 5.2.1 开始战斗

```javascript
function startBattle(merchant) {
    // 1. 初始化战斗状态
    gameState.currentBattle = {
        merchant: merchant,
        turn: 1,
        maxTurns: 10,
        team: [],
        hand: [],
        selectedCards: [],
        synergies: [],
        merchantReq: {
            funding: merchant.fundingReq,
            traffic: merchant.trafficReq,
            tech: merchant.techReq
        },
        successRate: merchant.baseSuccessRate || 50
    };
    
    // 2. 显示阵容配置界面
    showTeamConfigurationUI();
}
```

#### 5.2.2 配置阵容

```javascript
function selectTeamMember(cardId) {
    const card = getEmployeeCardById(cardId);
    
    if (!card) return;
    
    // 最多选择3张员工卡牌
    if (gameState.currentBattle.team.length >= 3) {
        showNotification("最多选择3张员工卡牌");
        return;
    }
    
    // 添加到阵容
    gameState.currentBattle.team.push(card);
    
    // 更新UI
    renderTeam();
    
    // 预览光谱协同
    previewSynergies();
}
```

#### 5.2.3 抽取手牌

```javascript
function drawHand() {
    const deck = gameState.negotiationDeck;
    
    // 洗牌
    shuffleArray(deck);
    
    // 抽取3张
    for (let i = 0; i < 3 && deck.length > 0; i++) {
        const cardId = deck.pop();
        const card = getNegotiationCardById(cardId);
        
        // 应用光谱协同加成
        const boostedCard = applySpectrumSynergy(card, gameState.currentBattle.team);
        
        gameState.currentBattle.hand.push(boostedCard);
    }
    
    // 更新UI
    renderHand();
}
```

#### 5.2.4 应用光谱协同

```javascript
function applySpectrumSynergy(card, team) {
    const boostedCard = { ...card };
    
    // 检查职业协同
    const professionalBoost = checkProfessionalSynergy(card, team);
    if (professionalBoost > 0) {
        boostedCard.value *= (1 + professionalBoost);
        boostedCard.synergy = 'professional';
        boostedCard.synergyValue = professionalBoost;
    }
    
    // 检查职业专精
    const specializationBoost = checkProfessionalSpecialization(team);
    if (specializationBoost && specializationBoost.position === getCorrespondingPosition(card.spectrum)) {
        boostedCard.value *= (1 + specializationBoost.value);
        boostedCard.synergy = 'specialization';
        boostedCard.synergyValue = specializationBoost.value;
    }
    
    return boostedCard;
}

function checkProfessionalSynergy(card, team) {
    const spectrumMap = {
        'tech': 'RD',
        'funding': 'Design',
        'traffic': 'Operation',
        'service': 'QA',
        'special': 'any'
    };
    
    const requiredPosition = spectrumMap[card.spectrum];
    
    if (requiredPosition === 'any') {
        return team.length > 0 ? 0.5 : 0;
    }
    
    const hasMatchingEmployee = team.some(e => e.position === requiredPosition);
    
    return hasMatchingEmployee ? 0.5 : 0;
}
```

#### 5.2.5 选择卡牌并使用

```javascript
function selectCard(cardIndex) {
    const card = gameState.currentBattle.hand[cardIndex];
    
    // 添加到已选择
    gameState.currentBattle.selectedCards.push(card);
    
    // 从手牌移除
    gameState.currentBattle.hand.splice(cardIndex, 1);
    
    // 检测功能协同
    const functionalSynergy = checkFunctionalSynergy(gameState.currentBattle.selectedCards);
    if (functionalSynergy) {
        gameState.currentBattle.synergies.push(functionalSynergy);
        playSpectrumSynergyEffect(functionalSynergy);
    }
    
    // 检测跨光谱组合
    const crossSpectrumCombo = checkCrossSpectrumCombo(
        gameState.currentBattle.team,
        gameState.currentBattle.selectedCards
    );
    if (crossSpectrumCombo) {
        gameState.currentBattle.synergies.push(crossSpectrumCombo);
        playSpectrumSynergyEffect(crossSpectrumCombo);
    }
    
    // 更新UI
    renderSelectedCards();
    renderHand();
}
```

#### 5.2.6 检测功能协同

```javascript
function checkFunctionalSynergy(cards) {
    const spectrumCounts = {};
    
    cards.forEach(card => {
        spectrumCounts[card.spectrum] = (spectrumCounts[card.spectrum] || 0) + 1;
    });
    
    for (const spectrum in spectrumCounts) {
        if (spectrumCounts[spectrum] >= 2) {
            return {
                name: 'functional_synergy',
                spectrum: spectrum,
                spectrumColor: getSpectrumColor(spectrum),
                effect: 'effect_multiplier_1.5',
                value: 1.5,
                description: '功能协同：效果×1.5'
            };
        }
    }
    
    return null;
}
```

#### 5.2.7 解析战斗

```javascript
function resolveBattle() {
    const battle = gameState.currentBattle;
    
    // 1. 计算卡牌总效果
    let totalEffect = 0;
    battle.selectedCards.forEach(card => {
        totalEffect += card.value;
    });
    
    // 2. 应用光谱协同
    battle.synergies.forEach(synergy => {
        if (synergy.effect === 'effect_multiplier_1.5') {
            totalEffect *= synergy.value;
        } else if (synergy.effect === 'all_effects_+100%') {
            totalEffect *= 2.0;
        }
    });
    
    // 3. 应用卡牌效果到商家需求
    applyCardEffectsToMerchantReq(totalEffect, battle.selectedCards);
    
    // 4. 计算成功率
    const successRate = calculateSuccessRate();
    
    // 5. 判定
    const roll = Math.random() * 100;
    const success = roll <= successRate;
    
    if (success) {
        // 成功
        resolveSuccess();
    } else {
        // 失败
        resolveFailure();
    }
    
    // 6. 消耗卡牌耐久度（如果使用耐久度系统）
    consumeCardDurability();
    
    // 7. 进入下一回合或结束战斗
    if (success) {
        endBattle(true);
    } else if (battle.turn >= battle.maxTurns) {
        endBattle(false);
    } else {
        battle.turn++;
        startMerchantTurn();
    }
}
```

---

## 六、UI设计要点

### 6.1 光谱协同预览界面

```
┌─────────────────────────────────────┐
│  光谱协同预览                        │
├─────────────────────────────────────┤
│                                    │
│  ✅ 职业协同触发！                  │
│     CRUD工程师（🔵技术光谱）          │
│     + 技术支持（🔵技术光谱）          │
│     → 技术需求-75%（50%×1.5）      │
│                                    │
│  ✅ 功能协同触发！                  │
│     价格战（🟡资金光谱）             │
│     + 补贴大战（🟡资金光谱）          │
│     → 效果×1.5                     │
│                                    │
│  ⚠️ 跨光谱组合未触发               │
│     需要四个光谱各至少1张卡牌        │
│                                    │
│  [确定]                             │
└─────────────────────────────────────┘
```

### 6.2 战斗界面（光谱特效）

```
┌─────────────────────────────────────────────────────┐
│                  商家谈判战斗                 │
├─────────────────────────────────────────────────────┤
│  商家：头部餐饮商家                  回合：1/10    │
│  需求：资金(12) 流量(8) 技术(6)             │
│  成功率：40%                            │
│                                             │
│  ┌─────────────────────────────────────────────────┐│
│  │ 玩家阵容（光谱协同）：                           ││
│  │ [CRUD工程师] [功能测试]                       ││
│  │  协同：技术类卡牌效果+50%                     ││
│  └─────────────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────────────┐│
│  │ 手牌区（点击选择，最多3张）：                   ││
│  │ [价格战] [流量扶持] [技术支持]                 ││
│  │  光谱：🟡资金   🟢流量       🔵技术           ││
│  │  协同：无     无          职业协同触发！       ││
│  └─────────────────────────────────────────────────┘│
│                                             │
│  ┌─────────────────────────────────────────────────┐│
│  │ 已选择卡牌：                                    ││
│  │ [技术支持]                                     ││
│  │  效果：技术需求-75%（职业协同+50%）             ││
│  │  [释放技能]                                     ││
│  └─────────────────────────────────────────────────┘│
│                                             │
│  光谱特效：                                      │
│  🔵 技术光谱桥梁已建立！                          │
│                                             │
│  [释放技能] [取消]                               │
└─────────────────────────────────────────────────────┘
```

### 6.3 光谱特效动画

**职业协同特效**（0.5秒）：
1. 0.0s：两张卡牌开始发光
2. 0.2s：光谱颜色的光芒从员工卡牌流向谈判卡牌
3. 0.5s：谈判卡牌效果数值更新（如"-50%" → "-75%"）

**跨光谱组合特效**（2秒）：
1. 0.0s：四张卡牌开始旋转
2. 0.5s：每种光谱的颜色光芒开始汇聚
3. 1.0s：彩虹桥形成，连接四张卡牌
2. 0s：彩虹桥爆发，所有卡牌效果翻倍

---

## 七、实施计划

### 7.1 分阶段实施

| 阶段 | 内容 | 工作量 | 负责人 |
|------|------|--------|--------|
| **P0-1** | 数据结构设计：扩展`cards.json`，新增`negotiation_cards.json` | 1天 | 开发 |
| **P0-2** | 光谱系统：实现光谱分类和颜色图标系统 | 1天 | 开发 |
| **P0-3** | 职业协同：实现`checkProfessionalSynergy()`函数 | 1天 | 开发 |
| **P0-4** | 功能协同：实现`checkFunctionalSynergy()`函数 | 1天 | 开发 |
| **P1-1** | 跨光谱组合：实现`checkCrossSpectrumCombo()`函数 | 1天 | 开发 |
| **P1-2** | 职业专精：实现`checkProfessionalSpecialization()`函数 | 0.5天 | 开发 |
| **P1-3** | 光谱特效：实现光谱协同特效动画 | 2天 | UI + 开发 |
| **P1-4** | 战斗UI：实现完整的战斗界面 | 2天 | UI + 开发 |
| **P1-5** | 战斗逻辑：实现完整的战斗流程 | 2天 | 开发 |
| **P2-1** | 平衡性调整：数值模拟和平衡性优化 | 1天 | 策划 + 开发 |
| **P2-2** | 测试和优化：全面测试，修复bug | 1天 | 测试 + 开发 |
| **总计** | | **15.5天** | |

### 7.2 优先级说明

| 优先级 | 阶段 | 说明 |
|--------|------|------|
| **P0** | P0-1 ~ P0-4 | 核心功能，必须实现 |
| **P1** | P1-1 ~ P1-5 | 重要功能，增强体验 |
| **P2** | P2-1 ~ P2-2 | 优化功能，提升品质 |

---

## 八、优势总结

| 优势 | 说明 |
|------|------|
| ✅ **借鉴精华** | 借鉴《恋与深空》的卡牌光谱理念，但不是照抄 |
| ✅ **本土化设计** | 职业光谱+功能光谱，符合我们游戏的题材 |
| ✅ **光谱协同深度** | 四种协同机制，策略深度极高 |
| ✅ **视觉华丽** | 光谱特效借鉴《恋与深空》的华丽风格 |
| ✅ **收集动力强** | 玩家有动力收集所有光谱的卡牌，完成图鉴 |
| ✅ **实现成本可控** | 分阶段实施，可以先实现核心功能，后续迭代 |

---

## 九、风险点与应对策略 ⚠️

### 9.1 系统复杂度风险

| 风险点 | 负面影响 | 应对策略 |
|--------|---------|---------|
| **双卡池管理复杂** | 玩家需要同时管理员工卡牌池和谈判卡牌池，可能增加认知负担 | 1. 提供清晰的卡牌分类界面<br>2. 增加"一键组队"功能<br>3. 提供卡牌管理教程 |
| **光谱协同规则复杂** | 四种协同机制（职业协同/功能协同/跨光谱组合/职业专精）可能让玩家困惑 | 1. 在游戏中提供"协同提示"系统<br>2. 新手教程逐步解锁协同机制<br>3. 提供"协同图鉴"供玩家查阅 |
| **卡牌效果叠加复杂** | 多种效果叠加（员工加成+协同加成+组合技）可能导致数值爆炸 | 1. 设置效果上限（如最高200%）<br>2. 在UI中明确显示计算过程<br>3. 提供"效果预览"功能 |

### 9.2 平衡性风险

| 风险点 | 负面影响 | 应对策略 |
|--------|---------|---------|
| **稀有卡牌过于强势** | SSR卡牌（如"必杀技"）可能破坏平衡，让其他卡牌无用 | 1. 限制SSR卡牌使用次数（如每局1次）<br>2. 增加SSR卡牌获取难度<br>3. 设计"克制关系"（如某些R卡克制SSR） |
| **特定组合过于强势** | 某些光谱组合（如跨光谱组合）可能过于强大，导致玩法单一化 | 1. 限制跨光谱组合的触发条件（如需4张不同光谱卡牌）<br>2. 增加"反制机制"（商家可能使用"反光谱"技能）<br>3. 定期调整数值平衡 |
| **资源获取不平衡** | 玩家可能卡在某个阶段，无法获得所需卡牌 | 1. 提供多种卡牌获取途径（抽卡/任务奖励/商店购买/碎片合成）<br>2. 增加"碎片合成系统"（报废卡牌可获得碎片，合成指定卡牌）<br>3. 提供"卡牌交换"功能 |（已决定不增加保底机制）

### 9.3 用户体验风险

| 风险点 | 负面影响 | 应对策略 |
|--------|---------|---------|
| **学习成本高** | 新玩家可能不了解光谱协同机制，导致挫败感 | 1. 设计渐进式新手教程<br>2. 提供"简单模式"（仅基础协同）<br>3. 增加"提示系统"（AI建议最佳出牌） |
| **决策压力大** | 玩家可能面临太多选择（选哪些员工？选哪些卡牌？），导致决策疲劳 | 1. 提供"推荐阵容"功能<br>2. 增加"快速战斗"模式<br>3. 限制每回合选择数量（如最多3张） |（不考虑加快速模式，可以限制出现的次数或者其他因为这本身也是游戏主玩法之一嘛）
| **失败挫败感强** | 如果玩家卡牌强度不足，可能连续失败，导致弃游 | 1. 增加"失败补偿"机制（如失败获得经验）<br>2. 提供"难度选择"（简单/普通/困难）<br>3. 增加"助战系统"（可借用好友的卡牌） |（这个不考虑，增加助战开发成本太高）

### 9.4 技术实现风险

| 风险点 | 负面影响 | 应对策略 |
|--------|---------|---------|
| **性能问题** | 光谱特效（如彩虹桥）可能在某些设备上卡顿 | 1. 提供"特效开关"（低配设备可关闭）<br>2. 优化特效渲染（使用CSS硬件加速）<br>3. 进行多设备测试 |
| **代码复杂度高** | 双卡池+光谱协同的逻辑可能难以维护 | 1. 模块化设计（将协同逻辑独立成模块）<br>2. 增加单元测试（确保协同逻辑正确）<br>3. 编写详细的技术文档 |
| **数据同步问题** | 如果游戏有联机元素，卡牌数据同步可能出错 | 1. 设计可靠的数据同步机制<br>2. 增加数据校验（防止作弊）<br>3. 提供"数据修复"功能 |（这个不考虑，1.0不做联机）

### 9.5 内容消耗风险

| 风险点 | 负面影响 | 应对策略 |
|--------|---------|---------|
| **内容消耗过快** | 玩家可能很快收集完所有卡牌，导致失去动力 | 1. 增加"卡牌进化"系统（卡牌可升级）<br>2. 设计"赛季制度"（每赛季新增卡牌）<br>3. 增加"挑战模式"（高难度关卡） |（没打算做联机，所以没有赛季制度）
| **玩法重复度高** | 招商小游戏的玩法可能重复，导致玩家厌倦 | 1. 增加"随机事件"系统<br>2. 设计"特殊商家"（有特殊技能）<br>3. 增加"PVP模式"（玩家对战） |（pvp不考虑）
| **数值膨胀** | 为了维持玩家兴趣，可能不断推出更强卡牌，导致数值膨胀 | 1. 采用"软上限"设计（如等级上限）<br>2. 设计"多元化成长"（不只提升数值）<br>3. 定期重置赛季（类似排位赛） |

### 9.6 风险优先级评估

| 风险类别 | 发生概率 | 影响程度 | 优先级 | 应对紧迫性 |
|---------|---------|---------|--------|-----------|
| 系统复杂度风险 | 高 | 中 | 🔴 高 | 立即应对 |
| 平衡性风险 | 中 | 高 | 🔴 高 | 立即应对 |
| 用户体验风险 | 高 | 高 | 🔴 高 | 立即应对 |
| 技术实现风险 | 中 | 中 | 🟡 中 | 计划应对 |
| 内容消耗风险 | 低 | 高 | 🟢 低 | 后期应对 |

### 9.7 综合应对方案

**短期（P0-P1阶段）**：
1. 简化协同机制（先实现1-2种协同，后续逐步增加）
2. 增加新手引导（确保玩家理解核心玩法）
3. 设置数值上限（防止早期平衡性问题）

**中期（P2阶段）**：
1. 根据玩家反馈调整平衡性
2. 优化UI/UX（降低学习成本）
3. 增加内容深度（新增卡牌/商家/挑战）

**长期（运营阶段）**：
1. 建立玩家社区（收集反馈）
2. 定期更新内容（保持新鲜感）
3. 监控数据指标（留存率/付费率等）

---

## 十、下一步行动

### 9.1 需要确认的问题

1. **方案确认**：是否同意v8.0的"双光谱系统"方案？
2. **光谱设计**：职业光谱和功能光谱的设计是否合理？
3. **协同机制**：四种协同机制的设计是否有趣？
4. **视觉效果**：光谱特效的设计是否够华丽？

### 9.2 后续任务

1. **修改`cards.json`**：为所有员工卡牌增加`spectrum`和`synergyEffect`字段
2. **新增`data/negotiation_cards.json`**：设计谈判卡牌数据，包含`spectrum`字段
3. **修改`js/game.js`**：增加光谱系统和协同机制
4. **修改`game.html`**：增加战斗界面
5. **修改`css/modals.css`**：增加光谱特效样式
6. **新增`css/spectrum-effects.css`**：专门的光谱特效样式

---

**文档版本**: v8.0  
**创建日期**: 2026年5月18日  
**状态**: 待审核  
**下一步**: 等待方案确认，根据反馈修改方案，然后开始实施
