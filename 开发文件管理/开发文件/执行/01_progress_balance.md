---
node_id: 01_progress_balance
status: P0
parent: root
---

# 进度平衡调整

## 功能描述
将每周基础进度从5%降低到3%，并根据团队士气动态调整每周事件次数，使平均通关时间延长至6-8个季度。

## 关键词池
keywords:
  - 进度平衡
  - 动态事件次数
  - 士气调整

locked_keywords:
  - 固定进度值
  - 取消动态事件

emphasis_keywords:
  - 通关时间必须控制在6-8个季度
  - 士气阈值（≥80高士气，≤40低士气）

## 数据定义
**动态事件次数规则：**

| 游戏状态 | 每周事件次数 | 效果乘数 | 周进度预期 |
|---------|-------------|---------|-----------|
| 高士气（≥80） | 2次 | ×1.5 | 9% |
| 正常状态 | 3次 | ×1.0 | 9% |
| 低士气（≤40） | 4次 | ×0.8 | 9.6% |

**平衡计算：**
- 季度进度：9%/周 × 12周 = 108%
- 6个季度总进度：6 × 108% = 648%
- 扣除节假日和负面事件影响，实际通关时间约6-8个季度

**核心代码示例：**
```javascript
function getWeeklyEventCount() {
    const satisfaction = gameState.satisfaction;
    const baseProgress = 3;
    
    if (satisfaction >= 80) return { count: 2, multiplier: 1.5, baseProgress };
    if (satisfaction <= 40) return { count: 4, multiplier: 0.8, baseProgress };
    return { count: 3, multiplier: 1.0, baseProgress };
}
```

## 依赖关系
depends_on:
  - 无

## 负面影响评估
risks:
  - risk: "进度过慢导致玩家无聊"
    severity: 中
    mitigation: "设置进度上限，确保不会低于3%/周"
  - risk: "士气波动导致进度不稳定"
    severity: 低
    mitigation: "通过事件和buff系统稳定士气"

## 验收标准
- [ ] 每周基础进度降至3%
- [ ] 高士气（≥80）时每周事件次数为2次
- [ ] 低士气（≤40）时每周事件次数为4次
- [ ] 正常状态下每周事件次数为3次
- [ ] 通关时间测试：正常玩法6-8个季度
