# 推箱子小游戏 - 产品需求文档(PRD)

**版本**: v1.0  
**创建日期**: 2026-06-09  
**负责人**: 策划团队  
**开发团队**: 前端组、游戏逻辑组

---

## 一、产品概述

### 1.1 产品定位

推箱子小游戏是**嵌入式小游戏**，作为**关键决策事件的替代玩法**。当玩家选择"去Pitch"、"画饼留人"、"交付甲方"等选项时，触发推箱子小游戏，成功完成后获得更好的奖励。

### 1.2 目标用户

- 核心用户：喜欢益智解谜的玩家
- 潜在用户：对"推PPT给VC"、"画饼留人"有共鸣的职场人

### 1.3 核心价值

- **讽刺感**：还原"推PPT给VC，VC说'再改改'"的真实体验
- **策略深度**：箱子推到死角就死局，需要规划路线
- **烧脑**：动态目标（VC会走），需要预判

---

## 二、功能需求

### 2.1 游戏触发机制

#### 2.1.1 触发时机

| 触发场景 | 触发条件 | 推的物品 | 目标 | 成功奖励 | 失败惩罚 |
|---------|---------|----------|------|----------|----------|
| 融资Pitch | 选择"去做Pitch" | 📊 PPT | VC | 融资进度+30 | 融资进度+5，VC好感-20 |
| 员工离职 | 选择"画饼留人" | 🥧 期权饼 | 员工 | 员工好感+15，留人成功 | 员工好感-10，离职 |
| 交付甲方 | 选择"去交付" | 📋 需求文档 | 甲方 | 满意度+20，进度+15 | 满意度-10，进度+5 |
| 合同谈判 | 选择"去谈判" | 📃 合同 | 甲方 | 预算+30，满意度+10 | 预算-10，满意度-15 |

#### 2.1.2 触发逻辑

```javascript
事件选项数据结构：
{
  "text": "去做Pitch",
  "minigame": "sokoban",  // 新增字段：小游戏类型
  "minigameConfig": {
    "level": 1,  // 关卡等级（1-20）
    "moves": 30,  // 步数限制
    "target": "把PPT推给VC",
    "boxType": "PPT",  // 推的物品类型
    "dynamicTarget": false,  // 目标是否移动
    "rejectProbability": 0.5,  // 被拒绝概率
    "successEffects": { "fundingProgress": 30 },
    "failEffects": { "fundingProgress": 5, "vcSatisfaction": -20 }
  },
  "effects": {}  // 基础效果（无论成败）
}
```

### 2.2 游戏机制

#### 2.2.1 地图设计

- **地图大小**：5×5（简单）~ 10×10（困难）
- **地图元素**：

| 元素 | 图标 | 说明 |
|------|------|------|
| 创始人（玩家） | 👔 | 可上下左右移动 |
| 箱子（可推物品） | 📊/🥧/📋 | PPT/期权饼/需求文档 |
| 目标点 | 🎯 | VC/员工/甲方所在位置 |
| 墙 | 🧱 | 不可通过 |
| 已到位 | 🚫 | 箱子已推到目标，不可再推 |
| 陷阱 | 🌀 | 箱子推进去就消失（失败） |

#### 2.2.2 推箱子规则

- **基础规则**：
  - 玩家可以推箱子（前方是箱子，箱子前方是空地/目标）
  - 玩家不能拉箱子
  - 玩家不能推两个箱子

- **"再改改"反弹机制**：
  - 箱子推到目标后，有概率被弹回
  - 弹回概率取决于玩家的"技能等级"

| 技能等级 | 被弹回概率 | 说明 |
|---------|------------|------|
| Lv.1 | 70% | 新手，VC说"再改改" |
| Lv.3 | 40% | 有经验，VC说"方向不对" |
| Lv.5 | 10% | 大神，VC说"就这个了" |

- **"饼不够厚"机制**（仅限期权饼）：
  - 员工拿到期权饼后，可能不满意
  - 需要推"更厚的饼"（2个饼叠一起）

| 饼的厚度 | 图标 | 员工反应 | 留人成功率 |
|---------|------|----------|------------|
| 薄饼 | 🥧 | "这饼太薄了" | 30% |
| 厚饼 | 🥧🥧 | "OK，我再干半年" | 80% |
| 超厚饼 | 🥧🥧🥧 | "老板万岁！" | 100% |

#### 2.2.3 动态目标（高级关卡）

- **机制**：VC/员工/甲方会**移动**
- **移动规则**：
  - 每2回合移动一次
  - 朝远离玩家的方向移动
  - 遇到墙则停

- **策略**：需要预判目标移动路线，提前把箱子推到路径上

#### 2.2.4 死局检测

- **死局定义**：箱子推到死角，无法再推到目标
- **死局检测**：每次移动后，检查是否还有箱子可以推到目标
- **死局处理**：提示"死局！"，可以选择"重试"或"放弃"

### 2.3 UI设计

#### 2.3.1 游戏界面

```
┌─────────────────────────────┐
│  ⏰ 步数剩余：28/30          │  ← 步数提示
├─────────────────────────────┤
│  🧱🧱🧱🧱🧱               │
│  🧱 📊  🧱               │
│  🧱   👔   🎯            │  ← 5×5地图
│  🧱 🎯   🎯            │
│  🧱🧱🧱🧱🧱               │
├─────────────────────────────┤
│  目标：把PPT推给VC（2/3）    │  ← 目标提示
│  VC满意度：60%               │  ← 动态提示
├─────────────────────────────┤
│  [上] [下] [左] [右] [重试] │  ← 操作按钮
└─────────────────────────────┘
```

#### 2.3.2 移动动画

- **玩家移动**：0.2秒滑动动画
- **箱子被推**：0.3秒滑动动画
- **箱子到位**：0.5秒放大动画 + 绿色光圈

#### 2.3.3 "再改改"反弹动画

- **触发**：箱子推到目标后，随机触发
- **动画**：
  1. 箱子到达目标（0秒）
  2. 目标摇摇头（0.5秒）
  3. 箱子弹回原来位置（0.3秒）
  4. 显示文案："再改改"（1秒）

**讽刺文案**（反弹时显示）：
```
VC说："方向不对，再改改"
（其实他根本没看你的PPT）
```

#### 2.3.4 成功/失败界面

**成功界面**：
```
┌─────────────────────────────┐
│  ✅ 成功！                   │
├─────────────────────────────┤
│  PPT已推给VC                │
│  融资进度+30                 │
│  VC满意度：80%               │
├─────────────────────────────┤
│  [继续]                     │
└─────────────────────────────┘
```

**失败界面**：
```
┌─────────────────────────────┐
│  ❌ 失败！                   │
├─────────────────────────────┤
│  步数用完 / 死局             │
│  融资进度+5                  │
│  VC好感-20                  │
├─────────────────────────────┤
│  [重试]  [放弃]             │
└─────────────────────────────┘
```

---

## 三、技术实现

### 3.1 技术栈

- **前端框架**：Vue 3 + Canvas（或CSS Grid）
- **状态管理**：Pinia（minigame store）
- **动画库**：GSAP（可选）

### 3.2 核心算法

#### 3.2.1 地图初始化

```javascript
function initMap(level) {
  const mapData = levels[level]  // 从关卡配置读取
  return {
    player: mapData.player,  // 玩家初始位置
    boxes: mapData.boxes,  // 箱子初始位置
    targets: mapData.targets,  // 目标位置
    walls: mapData.walls,  // 墙的位置
    // 动态目标：标记哪些目标是移动的
    dynamicTargets: mapData.dynamicTargets || []
  }
}
```

#### 3.2.2 移动检测

```javascript
function movePlayer(direction) {
  const newPos = calcNewPosition(playerPos, direction)
  
  // 检测是否撞墙
  if (isWall(newPos)) return false
  
  // 检测是否推箱子
  if (isBox(newPos)) {
    const boxNewPos = calcNewPosition(newPos, direction)
    // 箱子前方必须是空地或目标
    if (isEmpty(boxNewPos) || isTarget(boxNewPos)) {
      moveBox(newPos, boxNewPos)
    } else {
      return false  // 推不动
    }
  }
  
  // 移动玩家
  playerPos = newPos
  movesLeft--
  
  // 检测是否成功
  checkSuccess()
  
  // 检测是否死局
  checkDeadlock()
  
  return true
}
```

#### 3.2.3 死局检测

```javascript
function checkDeadlock() {
  for (let box of boxes) {
    // 如果箱子在角落，且不是目标 → 死局
    if (isCorner(box) && !isTarget(box)) {
      return true
    }
    
    // 如果箱子被墙和其他箱子包围 → 死局
    if (isSurrounded(box)) {
      return true
    }
  }
  return false
}
```

#### 3.2.4 "再改改"反弹

```javascript
function checkReject(box, target) {
  // 箱子推到目标后，检测是否反弹
  if (isTarget(box)) {
    const rejectProb = getRejectProbability()  // 根据技能等级
    if (Math.random() < rejectProb) {
      // 反弹！
      playRejectAnimation()
      moveBox(box, box.prevPos)  // 弹回
      return true
    }
  }
  return false
}
```

---

## 四、数据配置

### 4.1 关卡配置示例

#### 关卡1：第一次融资（教学关）

```json
{
  "level": 1,
  "name": "第一次融资",
  "description": "推PPT给VC，这是你的第一次融资！",
  "mapSize": 5,
  "player": [2, 2],
  "boxes": [[1, 2]],
  "targets": [[3, 2]],
  "walls": [[0, 0], [0, 4], [4, 0], [4, 4]],
  "dynamicTargets": false,
  "rejectProbability": 0.7,
  "moves": 30,
  "successEffects": {"fundingProgress": 30},
  "failEffects": {"fundingProgress": 5, "vcSatisfaction": -20}
}
```

#### 关卡2：留人（推期权饼）

```json
{
  "level": 2,
  "name": "留人",
  "description": "艾萨克要离职，推期权饼给他！",
  "mapSize": 5,
  "player": [2, 2],
  "boxes": [[1, 2]],
  "targets": [[3, 2]],
  "walls": [[0, 0], [0, 4], [4, 0], [4, 4]],
  "dynamicTargets": false,
  "rejectProbability": 0,  // 员工不反弹，但可能不满意
  "moves": 25,
  "successEffects": {"aisaike": 15, "retention": true},
  "failEffects": {"aisaike": -10, "retention": false}
}
```

#### 关卡3：VC会走（动态目标）

```json
{
  "level": 3,
  "name": "VC会走",
  "description": "VC不耐烦了，会移动！预判他的路线！",
  "mapSize": 7,
  "player": [3, 3],
  "boxes": [[2, 3]],
  "targets": [[4, 3]],
  "walls": [[0, 0], [0, 6], [6, 0], [6, 6]],
  "dynamicTargets": true,  // VC会移动
  "targetMoveInterval": 2,  // 每2回合移动一次
  "rejectProbability": 0.5,
  "moves": 30,
  "successEffects": {"fundingProgress": 40},
  "failEffects": {"fundingProgress": 10, "vcSatisfaction": -30}
}
```

### 4.2 事件配置示例

#### 事件1：融资窗口开启

```json
{
  "id": "event_funding",
  "title": "融资窗口开启",
  "description": "VC说本周可以见面，这是拿钱的好机会！",
  "options": [
    {
      "text": "去做Pitch",
      "minigame": "sokoban",
      "minigameConfig": {
        "level": 1,
        "moves": 30,
        "target": "把PPT推给VC",
        "boxType": "PPT",
        "dynamicTarget": false,
        "rejectProbability": 0.7,
        "successEffects": {"fundingProgress": 30},
        "failEffects": {"fundingProgress": 5, "vcSatisfaction": -20}
      },
      "effects": {},
      "prd_effect": "融资Pitch完成",
      "weekly_effect": "VC说'再改改'（可能弹回）"
    },
    {
      "text": "推掉，先做好产品",
      "effects": {"vcSatisfaction": -30, "budget": -10},
      "prd_effect": "融资计划推迟",
      "weekly_effect": "VC有些不爽"
    }
  ]
}
```

#### 事件2：核心员工要离职

```json
{
  "id": "event_retain",
  "title": "核心员工要离职",
  "description": "艾萨克说'老板，我有点想离职...'",
  "options": [
    {
      "text": "画饼留人",
      "minigame": "sokoban",
      "minigameConfig": {
        "level": 2,
        "moves": 25,
        "target": "把期权饼推给员工",
        "boxType": "期权饼",
        "dynamicTarget": false,
        "rejectProbability": 0,
        "successEffects": {"aisaike": 15, "retention": true},
        "failEffects": {"aisaike": -10, "retention": false}
      },
      "effects": {},
      "prd_effect": "员工保留计划启动",
      "weekly_effect": "艾萨克暂时留下来了"
    },
    {
      "text": "加薪留人",
      "effects": {"aisaike": 20, "budget": -30, "retention": true},
      "prd_effect": "加薪申请",
      "weekly_effect": "艾萨克很满意，但预算紧张"
    },
    {
      "text": "让他走吧",
      "effects": {"aisaike": -100, "morale": -20},
      "prd_effect": "员工离职记录",
      "weekly_effect": "艾萨克离职了，团队士气低落"
    }
  ]
}
```

---

## 五、验收标准

### 5.1 功能验收

| 功能 | 验收标准 | 优先级 |
|------|----------|--------|
| 地图初始化 | 根据关卡配置正确生成地图 | P0 |
| 玩家移动 | 上下左右移动正确，不能穿墙 | P0 |
| 推箱子 | 推箱子逻辑正确，不能推两个箱子 | P0 |
| 目标检测 | 箱子推到目标后正确检测 | P0 |
| "再改改"反弹 | 箱子推到目标后有概率弹回 | P0 |
| 死局检测 | 死局时正确提示 | P0 |
| 成功/失败判定 | 所有箱子推到目标→成功，否则→失败 | P0 |
| 动态目标 | VC/员工/甲方会移动 | P1 |
| "饼不够厚"机制 | 员工可能不满意，需要推更厚的饼 | P1 |
| 奖励应用 | 成功/失败后正确应用effects | P0 |
| 动画效果 | 移动、推箱子、反弹动画流畅 | P1 |
| 音效 | 移动、推箱子、成功/失败音效 | P2 |

### 5.2 性能验收

- 移动计算耗时 < 50ms
- 动画帧率 > 30fps
- 内存占用 < 50MB

### 5.3 兼容性验收

- Chrome/Edge/Safari 最新版兼容
- 移动端适配（触摸操作）

---

## 六、开发排期

| 阶段 | 任务 | 工期 | 负责人 |
|------|------|------|--------|
| 设计 | UI/UX设计 | 1天 | 设计组 |
| 前端 | 地图组件开发 | 2天 | 前端组 |
| 逻辑 | 推箱子算法实现 | 2天 | 游戏逻辑组 |
| 集成 | 嵌入EventCard | 1天 | 前端组 |
| 测试 | 功能测试 | 1天 | 测试组 |

**总计**：7天

---

## 七、风险评估

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 推箱子算法复杂，耗时过长 | 用户体验差 | 优化算法，使用Web Worker |
| 动态目标机制难以理解 | 玩家困惑 | 增加教程提示 |
| 小游戏打断事件流程 | 体验不连贯 | 优化过渡动画 |
| 关卡设计难度曲线不合理 | 玩家弃游 | 内部测试调整难度 |

---

## 八、后续扩展

### 8.1 新箱子类型

- 💰 融资BP（给投资人）
- 📋 需求文档（给甲方）
- 🥧 期权饼（给员工）
- 🎁 节日礼物（给团队）

### 8.2 新关卡机制

- **多箱子**：同时推多个箱子
- **多层地图**：箱子可以推到上层/下层
- **传送门**：箱子推到传送门，会从另一个门出来
- **冰块**：箱子被冻住，需要先破冰

### 8.3 新游戏模式

- **限时模式**：60秒内推完所有箱子
- **解谜模式**：固定地图，用最少步数推完
- **对战模式**：2个玩家同时推箱子，先推完的赢

---

## 九、附录

### 9.1 参考资料

- 经典推箱子游戏：Sokoban（1982年）
- Vue 3 官方文档：https://cn.vuejs.org/
- Pinia 官方文档：https://pinia.vuejs.org/zh/

### 9.2 变更记录

| 版本 | 日期 | 变更内容 | 负责人 |
|------|------|----------|--------|
| v1.0 | 2026-06-09 | 创建文档 | 策划团队 |

---

**结束**
