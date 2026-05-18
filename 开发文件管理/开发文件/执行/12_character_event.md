---
node_id: 12_character_event
status: P1
parent: root
---

# 角色专属事件（模式差异化）

## 功能描述
为四种角色（艾萨克、莫甘娜、小葵、辛竹）设计专属事件，增强角色个性和模式差异化。

## 关键词池
keywords:
  - 角色专属事件
  - 模式差异化
  - 角色互动

locked_keywords:
  - 移除角色专属事件
  - 所有角色共享相同事件

emphasis_keywords:
  - 专属事件必须符合角色职业/性格特点
  - 必须支持模式差异化（ToB/ToC/B2C不同）

## 数据定义
**角色专属事件表：**

| 模式 | 艾萨克专属事件 | 莫甘娜专属事件 | 小葵专属事件 | 辛竹专属事件 |
|------|---------------|---------------|--------------|--------------|
| **ToB** | 技术方案评审 | 验收测试把关 | 客户关系维护 | 项目方案设计 |
| **ToC** | 性能优化攻坚 | 用户测试管理 | 用户运营活动 | UI/UX升级 |
| **B2C** | 平台架构升级 | 风控系统完善 | 双边运营策略 | 平台视觉升级 |

**专属事件数据结构（建议）：**
```json
{
  "id": "character_event_isaac_tob_001",
  "title": "技术方案评审",
  "character": "isaac",
  "direction": "tob",
  "triggerCondition": {
    "probability": 0.1,
    "minWeek": 1,
    "maxWeek": 52
  },
  "options": [
    {
      "text": "详细评审",
      "effects": {"progress": 5, "satisfaction": 3},
      "weeklyEffect": "方案质量高，客户满意"
    },
    {
      "text": "快速通过",
      "effects": {"progress": 10, "satisfaction": -5},
      "weeklyEffect": "进度快，但客户有些担心"
    }
  ]
}
```

**涉及文件：**

| 文件 | 修改内容 |
|------|---------|
| `data/events.json` | 扩展角色专属事件（4角色×3模式=12个事件） |
| `js/game.js` | 角色专属事件触发逻辑 |

## 依赖关系
depends_on:
  - 02_random_events

## 负面影响评估
risks:
  - risk: "角色专属事件过多，增加系统复杂度"
    severity: 中
    mitigation: "每个角色每种模式至少1个专属事件，最多3个"
  - risk: "专属事件与常规事件冲突"
    severity: 低
    mitigation: "设置事件触发优先级，专属事件优先"

## 验收标准
- [ ] 艾萨克ToB专属事件正确设置
- [ ] 莫甘娜ToB专属事件正确设置
- [ ] 小葵ToB专属事件正确设置
- [ ] 辛竹ToB专属事件正确设置
- [ ] ToC模式4角色专属事件正确设置
- [ ] B2C模式4角色专属事件正确设置
- [ ] 角色专属事件正确触发（根据当前模式和角色好感度）
- [ ] 专属事件选项正确显示效果
