---
node_id: 05_card_wear
status: P0
parent: 04_card_spectrum
---

# 卡牌磨损机制（不可逆设计）

## 功能描述
反映互联网行业真实情况，员工疲惫无法用金钱修复。卡牌使用后耐久度减少，耐久度为0时卡牌报废。

## 关键词池
keywords:
  - 卡牌磨损
  - 耐久度
  - 不可逆设计

locked_keywords:
  - 添加卡牌修复机制
  - 允许用金钱修复磨损

emphasis_keywords:
  - 磨损不可逆转
  - 报废卡牌可分解为碎片
  - 纯几率抽卡，无保底机制

## 数据定义
**磨损规则：**

| 使用场景 | 磨损程度 |
|---------|---------|
| 报表对决被克制失败 | -1 |
| 招商小游戏成功 | -1 |
| 招商小游戏失败 | -2 |
| SSR特殊卡牌 | -3 |

**初始耐久度：**

| 稀有度 | 初始耐久度 | 分解碎片 |
|-------|---------|---------|
| R | 10 | 1 |
| SR | 8 | 3 |
| SSR | 5 | 10 |

**报废处理：**
- 耐久度=0 → 卡牌报废（员工离职/考公）
- 报废卡牌可分解为碎片
- 50碎片=R卡，100碎片=SR卡，300碎片=SSR卡

**核心代码示例：**
```javascript
function applyCardWear(cardId, scenario, success) {
    const card = getCardById(cardId);
    if (card.currentDurability <= 0) {
        showNotification(`卡牌"${card.name}"已报废！`);
        return false;
    }
    
    let wearAmount = scenario === 'negotiation' ? (success ? 1 : 2) : 1;
    card.currentDurability -= wearAmount;
    
    if (card.currentDurability === 0) {
        showNotification(`卡牌"${card.name}"已报废（离职/考公）！`);
    }
    return true;
}
```

**涉及文件：**

| 文件 | 修改内容 |
|------|---------|
| `data/cards.json` | 员工卡牌数据结构扩展（增加耐久度字段） |
| `js/game.js` | 卡牌磨损逻辑 |

## 依赖关系
depends_on:
  - 04_card_spectrum

## 负面影响评估
risks:
  - risk: "磨损不可逆导致玩家情感打击"
    severity: 中
    mitigation: "提供磨损预警提示+碎片快速兑换通道"
  - risk: "SSR卡牌耐久度过低，玩家不敢使用"
    severity: 中
    mitigation: "SSR卡牌效果强大，鼓励在关键时刻使用"

## 验收标准
- [ ] 卡牌数据结构正确扩展（增加耐久度字段）
- [ ] 使用后耐久度正确减少
- [ ] 耐久度为0时卡牌正确报废
- [ ] 报废卡牌可正确分解为碎片
- [ ] 碎片可正确兑换新卡牌
- [ ] 磨损不可逆，无修复机制
