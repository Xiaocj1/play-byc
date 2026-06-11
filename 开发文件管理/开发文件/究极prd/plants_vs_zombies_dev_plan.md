# 🎮 植物大战僵尸版报表美容 - 开发计划

**版本**：V1.0 MVP  
**目标**：实现所有P0功能，可玩版本  
**预计时间**：5-7人天  
**最后更新**：2026-05-24

---

## 📋 开发阶段

### 第一阶段：核心框架搭建（1人天）

#### 1.1 游戏容器组件
- [ ] 创建 `PlantsVsZombies.vue` 主组件
- [ ] 设置 Canvas 画布和基础布局
- [ ] 集成到报表美容流程中

#### 1.2 配置系统
- [x] 创建 `plantsVsZombiesConfig.js` 配置文件
- [ ] 配置与 Recruit 模块的数据对接

**产出**：
- `src/components/PlantsVsZombies.vue`
- `src/config/plantsVsZombiesConfig.js`

---

### 第二阶段：植物系统（1.5人天）

#### 2.1 植物类实现
- [ ] 创建 `Plant` 类（基础类）
- [ ] 实现 `SunflowerPlant`（向日葵）
- [ ] 实现 `ShooterPlant`（射手）
- [ ] 实现 `WallnutPlant`（坚果墙）
- [ ] 实现 `CherryBombPlant`（樱桃炸弹）

#### 2.2 植物管理器
- [ ] 创建 `PlantManager` 类
- [ ] 实现植物放置逻辑
- [ ] 实现植物更新逻辑（攻击、产出阳光）

#### 2.3 卡牌对接
- [ ] 从 Recruit 模块获取在职员工卡牌
- [ ] 将卡牌转换为植物角色
- [ ] 实现卡牌选择UI

**产出**：
- `src/utils/Plant.js`
- `src/utils/PlantManager.js`
- `src/components/PlantCardSelector.vue`

---

### 第三阶段：铲车系统（1.5人天）

#### 3.1 铲车类实现
- [ ] 创建 `Zombie` 类
- [ ] 实现铲车移动逻辑
- [ ] 实现铲车攻击逻辑
- [ ] 实现铲车AI（移动、攻击、检测前方植物）

#### 3.2 铲车管理器
- [ ] 创建 `ZombieManager` 类
- [ ] 实现铲车生成逻辑
- [ ] 实现铲车波次系统

#### 3.3 克制系统
- [ ] 实现岗位克制逻辑
- [ ] 实现克制伤害加成
- [ ] UI提示克制效果

**产出**：
- `src/utils/Zombie.js`
- `src/utils/ZombieManager.js`
- `src/utils/WaveManager.js`

---

### 第四阶段：战斗系统（1.5人天）

#### 4.1 子弹系统
- [ ] 创建 `Bullet` 类
- [ ] 实现子弹移动和碰撞检测
- [ ] 实现子弹伤害计算

#### 4.2 阳光系统
- [ ] 创建 `SunManager` 类
- [ ] 实现阳光掉落逻辑
- [ ] 实现阳光收集逻辑
- [ ] 实现向日葵产出阳光

#### 4.3 碰撞检测
- [ ] 实现子弹 vs 铲车碰撞
- [ ] 实现铲车 vs 植物碰撞
- [ ] 实现铲车 vs 报表碰撞

**产出**：
- `src/utils/Bullet.js`
- `src/utils/BulletManager.js`
- `src/utils/SunManager.js`

---

### 第五阶段：游戏流程和UI（1人天）

#### 5.1 游戏主循环
- [ ] 实现游戏状态机（menu → playing → victory/defeat）
- [ ] 实现帧循环（update + render）
- [ ] 实现胜负判定逻辑

#### 5.2 报表保护系统
- [ ] 实现报表完整性检测
- [ ] 实现报表被攻击逻辑
- [ ] 实现脑子被吃（Game Over）

#### 5.3 UI组件
- [ ] 顶部状态栏（阳光、波次、报表完整性、剩余铲车）
- [ ] 卡牌选择栏
- [ ] 结果展示界面

**产出**：
- `src/utils/GameEngine.js`
- `src/components/GameHeader.vue`
- `src/components/GameResult.vue`

---

### 第六阶段：黄金矿工衔接（0.5人天）

#### 6.1 结果统计
- [ ] 统计剩余铲车数量
- [ ] 计算钩子数量
- [ ] 检测报表是否被攻破

#### 6.2 过渡界面
- [ ] 显示阶段一结果
- [ ] 显示钩子数量
- [ ] "开始黄金矿工"按钮

#### 6.3 数据传递
- [ ] 将钩子数量传递给黄金矿工模块
- [ ] 将得分权重传递给黄金矿工模块

**产出**：
- `src/components/StageTransition.vue`

---

## 🎯 第一版MVP功能清单

### P0 - 必须实现

| 功能 | 状态 | 备注 |
|-----|-----|-----|
| 9×5网格战场 | 待开发 | 基础布局 |
| 阳光系统 | 待开发 | 初始150，上限500 |
| 向日葵（运营） | 待开发 | 每5秒产出25阳光 |
| 射手（设计） | 待开发 | 每5秒发射子弹 |
| 坚果墙（QA） | 待开发 | 高血量，阻挡 |
| 樱桃炸弹（RD） | 待开发 | 范围爆炸 |
| 5种铲车 | 待开发 | 5种不同难度 |
| 5波进攻 | 待开发 | 递增难度 |
| 克制系统 | 待开发 | 岗位克制 |
| 报表保护 | 待开发 | 脑子完整性 |
| 胜负判定 | 待开发 | 胜利/失败 |
| 黄金矿工衔接 | 待开发 | 钩子数量传递 |

---

## 🧪 测试计划

### 单元测试
- [ ] 植物属性计算
- [ ] 铲车移动逻辑
- [ ] 碰撞检测
- [ ] 克制伤害计算

### 集成测试
- [ ] Recruit模块对接
- [ ] 黄金矿工模块对接
- [ ] 报表系统对接

### 玩法测试
- [ ] 平衡性测试（难度是否合适）
- [ ] 操作体验测试
- [ ] 边界情况测试

---

## 📦 依赖关系

```
Recruit模块（招聘系统）
    ↓
员工卡牌数据
    ↓
PlantsVsZombiesConfig（配置映射）
    ↓
PlantManager（植物管理器）
    ↓
游戏主循环（GameEngine）
    ↓
阶段过渡（StageTransition）
    ↓
黄金矿工模块（已有）
    ↓
报表系统（已有）
```

---

## 🎨 资源清单（快速开始用Emoji）

### 如果暂时没有美术资源，使用以下Emoji代替：

```javascript
const PLANT_EMOJIS = {
  sunflower: '🌻',
  shooter: '🌱',
  wallnut: '🧱',
  cherryBomb: '🍒'
}

const ZOMBIE_EMOJIS = {
  normal: '🧟',
  angry: '😤',
  boss: '👨‍💼',
  shareholder: '🦹',
  final: '💎'
}

const EFFECT_EMOJIS = {
  bullet: '📄',
  explosion: '💥',
  sun: '☀️',
  brain: '🧠'
}
```

### 使用方法：

```vue
<template>
  <div class="plant">
    {{ PLANT_EMOJIS[plantType] }}
  </div>
</template>

<script setup>
const PLANT_EMOJIS = {
  sunflower: '🌻',
  shooter: '🌱',
  wallnut: '🧱',
  cherryBomb: '🍒'
}
</script>
```

---

## 📁 文件结构

```
src/
├── components/
│   ├── PlantsVsZombies.vue      # 主游戏组件
│   ├── PlantCardSelector.vue     # 卡牌选择器
│   ├── GameHeader.vue           # 顶部状态栏
│   ├── GameResult.vue           # 结果展示
│   └── StageTransition.vue      # 阶段过渡
│
├── utils/
│   ├── GameEngine.js             # 游戏主引擎
│   ├── Plant.js                  # 植物基类
│   ├── PlantManager.js           # 植物管理器
│   ├── Zombie.js                # 铲车类
│   ├── ZombieManager.js          # 铲车管理器
│   ├── WaveManager.js            # 波次管理器
│   ├── Bullet.js                # 子弹类
│   ├── BulletManager.js          # 子弹管理器
│   ├── SunManager.js             # 阳光管理器
│   └── CollisionSystem.js        # 碰撞检测
│
└── config/
    └── plantsVsZombiesConfig.js  # 配置文件（已创建）
```

---

## 🚀 快速开始

### 1. 克隆项目并安装依赖
```bash
cd e:\code\demo\mvpdemo\公平事务所
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 进入游戏测试
- 打开浏览器访问 http://localhost:5173
- 进入报表美容环节即可看到植物大战僵尸游戏

### 4. 放置资源
- 按照 `AI_PROMPTS.md` 中的提示词生成图片
- 放置到 `public/assets/plants_vs_zombies/images/` 目录
- 按照 `README.md` 中的命名规范命名文件

---

**开发优先级**：核心玩法 > 视觉效果 > 音效 > 优化

**成功标准**：玩家可以完整玩完一个季度报表的植物大战僵尸+黄金矿工全流程
