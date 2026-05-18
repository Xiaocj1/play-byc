---
node_id: 13_trigger_system
status: P1
parent: root
---

# 随机事件触发器系统

## 功能描述
提供灵活的触发条件系统，支持多种触发方式，增强事件系统的可扩展性。

## 关键词池
keywords:
  - 触发条件
  - 随机事件
  - 灵活配置

locked_keywords:
  - 固定触发条件
  - 移除触发器系统

emphasis_keywords:
  - 至少支持6种触发条件类型
  - 触发条件可以组合使用

## 数据定义
**触发条件类型：**

```json
{
  "triggerConditions": [
    {"type": "probability", "value": 0.15, "description": "15%概率触发"},
    {"type": "satisfaction_below", "value": 50, "description": "满意度低于50%"},
    {"type": "week_range", "min": 5, "max": 15, "description": "第5-15周"},
    {"type": "progress_milestone", "value": 50, "description": "进度达到50%"},
    {"type": "holiday_near", "value": 1, "description": "节假日前1周"},
    {"type": "direction", "value": "tob", "description": "ToB模式专属"}
  ]
}
```

**事件效果类型扩展：**

| 效果类型 | 说明 | 示例 |
|---------|------|------|
| **瞬时效果** | 立即生效，一次性 | 资金+10 |
| **持续效果** | 持续N周 | 进度每周+2%，持续3周 |
| **永久效果** | 持续到游戏结束 | 角色好感度上限+5 |
| **条件效果** | 满足条件时触发 | 若有RD员工，额外+进度 |
| **连锁效果** | 触发后续事件 | 触发"加班疲劳"事件 |

**触发机制：**
```
每周开始时：
  ├─ 遍历所有待触发事件
  ├─ 检查触发条件
  │   ├─ 概率判定
  │   ├─ 状态检查（满意度/进度/周数等）
  │   └─ 模式检查
  ├─ 若满足条件：
  │   ├─ 应用事件效果
  │   ├─ 检查连锁效果
  │   └─ 记录到日志
  └─ 继续下一个事件
```

**涉及文件：**

| 文件 | 修改内容 |
|------|---------|
| `data/events.json` | 扩展triggerConditions字段 |
| `js/game.js` | 触发器逻辑 |

## 依赖关系
depends_on:
  - 02_random_events

## 负面影响评估
risks:
  - risk: "触发器系统过于复杂，性能问题"
    severity: 中
    mitigation: "优化触发条件检查逻辑，限制每周检查事件数量"
  - risk: "触发条件组合过多，难以维护"
    severity: 低
    mitigation: "提供触发器配置工具，简化配置流程"

## 验收标准
- [ ] 支持probability触发条件（概率判定）
- [ ] 支持satisfaction_below触发条件（满意度低于阈值）
- [ ] 支持week_range触发条件（周数范围）
- [ ] 支持progress_milestone触发条件（进度里程碑）
- [ ] 支持holiday_near触发条件（节假日前）
- [ ] 支持direction触发条件（模式专属）
- [ ] 瞬时效果正确实现
- [ ] 持续效果正确实现（持续N周）
- [ ] 永久效果正确实现
- [ ] 条件效果正确实现
- [ ] 连锁效果正确实现
