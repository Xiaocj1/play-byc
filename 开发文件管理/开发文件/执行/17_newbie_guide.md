---
node_id: 17_newbie_guide
status: P2
parent: root
---

# 新手引导

## 功能描述
为新玩家提供引导教程，帮助理解游戏机制和新增系统。

## 关键词池
keywords:
  - 新手引导
  - 教程
  - 用户体验

locked_keywords:
  - 移除新手引导
  - 让玩家自行探索

emphasis_keywords:
  - 引导必须简洁明了
  - 覆盖所有新增系统
  - 提供跳过选项

## 数据定义
**引导流程：**

| 步骤 | 内容 | 触发时机 |
|------|------|---------|
| 1 | 欢迎界面 + 模式选择说明 | 首次启动 |
| 2 | 进度平衡说明（3%/周） | 第1周 |
| 3 | 偶发事件演示 | 第1次触发偶发事件 |
| 4 | 卡牌光谱系统说明 | 首次获得卡牌 |
| 5 | 卡牌磨损机制说明 | 首次使用卡牌 |
| 6 | 商家招商会小游戏教程 | B2C模式第1次招商 |
| 7 | 节假日系统说明 | 第1次遇到节假日 |
| 8 | 角色Buff系统说明 | 第1次触发角色Buff |

**引导数据结构（建议）：**
```json
{
  "id": "guide_001",
  "title": "欢迎来到创业模拟器",
  "content": "你将扮演一名创业者，带领团队走向成功...",
  "highlightElement": "mode_selection",
  "nextAction": "select_mode"
}
```

**涉及文件：**

| 文件 | 修改内容 |
|------|---------|
| `js/game.js` | 新手引导逻辑（新增） |
| `css/modals.css` | 引导样式（新增） |
| `data/guide.json` | 引导数据（新增） |

## 依赖关系
depends_on:
  - 01_progress_balance
  - 02_random_events
  - 03_merchant_game
  - 04_card_spectrum
  - 05_card_wear
  - 08_holiday_system
  - 09_character_buff

## 负面影响评估
risks:
  - risk: "引导过长，玩家厌烦"
    severity: 中
    mitigation: "提供跳过按钮，引导总长度控制在5分钟内"
  - risk: "引导遗漏重要系统"
    severity: 高
    mitigation: "覆盖所有P0和P1系统，提供帮助按钮随时查看"

## 验收标准
- [ ] 欢迎界面正确显示
- [ ] 模式选择说明清晰
- [ ] 进度平衡说明正确（3%/周）
- [ ] 偶发事件演示正确触发
- [ ] 卡牌光谱系统说明清晰
- [ ] 卡牌磨损机制说明清晰
- [ ] 商家招商会小游戏教程完整
- [ ] 节假日系统说明正确
- [ ] 角色Buff系统说明清晰
- [ ] 提供跳过按钮
- [ ] 提供帮助按钮随时查看引导
