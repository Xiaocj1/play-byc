# 技术开发文档

## 一、项目概述

本项目是一个 PM 模拟器游戏（创业版），名为「公平事务所」。玩家扮演项目经理，通过决策和管理团队完成项目目标。

## 二、页面结构

| 文件路径 | 页面名称 | 用途描述 |
| :--- | :--- | :--- |
| `index.html` | **主页面** | 开始游戏前的主界面，包含游戏入口、职级信息、画廊等功能 |
| `game.html` | **游戏页面** | 进入游戏后的主界面，包含周报、事件选择、团队管理等核心游戏玩法 |
| `game-pre.html` | 游戏准备页面 | 游戏开始前的过渡页面（预留） |
| `debug.html` | 调试页面 | 开发调试使用（预留） |

## 三、目录结构

```
mvpdemo/
├── assets/           # 资源文件目录
│   ├── background/   # 背景图片
│   │   ├── door.jpg  # 主页面背景图（推荐使用）
│   │   └── door.png  # 主页面背景图（备选）
│   └── portraits/    # 角色头像
│       ├── aisaike.png
│       ├── moganna.png
│       ├── xiaokui.png
│       └── xinzhu.png
├── css/              # 样式文件目录
│   ├── base.css      # 基础样式（全局）
│   ├── home.css      # 主页面样式
│   ├── game.css      # 游戏页面样式
│   └── modals.css    # 弹窗组件样式
├── data/             # 数据文件目录
│   ├── buffs.json       # Buff 效果数据
│   ├── characters.json  # 角色数据
│   ├── endings.json     # 结局数据
│   ├── events.json      # 事件数据
│   ├── prd_templates.json # PRD 模板数据
│   ├── ranks.json       # 职级数据
│   ├── tools.json       # 工具链数据
│   ├── weekly_reports.json # 周报数据
│   └── weights.json     # 权重配置数据
├── js/               # JavaScript 文件目录
│   ├── home.js       # 主页面逻辑
│   ├── game.js       # 游戏页面逻辑
│   └── store.js      # 状态管理
└── index.html        # 主页面入口
```

## 四、背景图片规范

### 4.1 背景图片目录

```
assets/background/
├── door.jpg  # 主页面背景图（推荐使用）
└── door.png  # 主页面背景图（备选）
```

### 4.2 背景图片使用规则

| 页面 | 背景图片 | 配置位置 |
| :--- | :--- | :--- |
| 主页面（index.html） | `assets/background/door.jpg` | `.menu-background` |
| 游戏页面（game.html） | 无背景 | `css/base.css` 中 `body` 样式 |

### 4.3 背景图片配置代码

```css
.menu-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('../assets/background/door.jpg') no-repeat center center;
    background-size: cover;
    z-index: -1;
}
```

## 五、视觉风格规范

### 5.1 设计理念

采用**像素风原生感**设计，追求复古游戏机的视觉体验：

- 不使用圆角（无 `border-radius` 或极小值）
- 不使用半透明（纯色背景）
- 不使用模糊阴影（使用像素位移阴影）
- 按钮带外边框，纯色矩形
- 关闭字体抗锯齿，保持像素感
- 布局稍微偏左或偏下，做出手工感

### 5.2 像素字体设置

```css
* {
    image-rendering: pixelated;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: unset;
}

.pixel-btn {
    font-family: 'Press Start 2P', monospace;
    -webkit-font-smoothing: none;
}
```

## 六、主页面布局规范

### 6.1 布局结构

```
┌─────────────────────────────────────────┐
│                                         │
│         ┌─────────────────┐             │
│         │   公平事务所      │  (1/3宽度)  │
│         │ Fairness Studio │             │
│         └─────────────────┘             │
│                                         │
│                                         │
│                                         │
│        ┌──────────────────┐            │
│        │    开始游戏        │            │
│        └──────────────────┘            │
│        ┌────┐ ┌────┐ ┌────┐             │
│        │卷一卷│ │画廊 │ │工具链│             │
│        └────┘ └────┘ └────┘             │
│        ┌──────────────────┐            │
│        │    继续游戏        │            │
│        └──────────────────┘            │
│                                         │
│                                         │
│                        ┌──────────┐     │
│                        │ RANK-BADGE│    │
│                        └──────────┘     │
└─────────────────────────────────────────┘
```

### 6.2 布局比例

| 元素 | 比例/位置 | 说明 |
| :--- | :--- | :--- |
| Logo 区域 | 页面宽度的 1/3 | 使用 `min(8vw, 48px)` 响应式字体 |
| 按钮区域 | 距底部 1/5 | `padding-bottom: 20vh` |
| 三个次要按钮 | 等宽 | 每个 `min-width: 140px` |
| 开始/继续游戏 | 与三个次要按钮总宽等长 | `max-width: 520px` |

| 类名 | 说明 |
| :--- | :--- |
| `.main-menu` | 主菜单容器 |
| `.menu-background` | 背景图片层 |
| `.logo-section` | Logo 区域 |
| `.logo-title` | 主标题（响应式字体 `min(8vw, 48px)`） |
| `.logo-subtitle` | 英文副标题 |
| `.buttons-section` | 按钮区域（`margin-top: auto` 靠下） |
| `.pixel-btn` | 像素按钮基础样式 |
| `.btn-start-game` | 开始游戏按钮 |
| `.btn-secondary` | 次要按钮（卷一卷/画廊/工具链） |
| `.btn-continue` | 继续游戏按钮 |
| `.rank-badge` | 职级信息卡片 |

## 七、按钮样式规范

### 7.1 基础像素按钮 (.pixel-btn)

```css
.logo-title {
    font-size: min(8vw, 48px);  /* 响应式：最大48px，最小随视口 */
}

.pixel-btn {
    font-family: 'Press Start 2P', monospace;
    font-size: 12px;
    background: #1a1a2e;
    color: #00ff41;
    border: 4px solid #00ff41;
    padding: 14px 24px;
    box-shadow: 4px 4px 0 #0a0a0f;
    cursor: pointer;
    transition: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    white-space: nowrap;
}
```

### 7.2 悬停效果

```css
.pixel-btn:hover {
    background: #00ff41;
    color: #1a1a2e;
    box-shadow: 2px 2px 0 #0a0a0f;
    transform: translate(2px, 2px);
}

.pixel-btn:active {
    box-shadow: 0 0 0 #0a0a0f;
    transform: translate(4px, 4px);
}
```

### 7.3 按钮类型

| 按钮类型 | 背景色 | 边框色 | 文字色 | 特点 |
| :--- | :--- | :--- | :--- | :--- |
| 开始游戏 | `#1a1a2e` | `#00ff41` | `#00ff41` | 最大，绿色发光 |
| 次要按钮 | `#1a1a2e` | `#666666` | `#ffffff` | 灰色边框 |
| 继续游戏 | `#1a1a2e` | `#ffd700` | `#ffd700` | 金色边框 |

### 7.4 按钮交互状态

| 状态 | 效果 |
| :--- | :--- |
| Hover | 背景填充，边框变亮，阴影缩小，向下向右位移 2px |
| Active | 阴影完全消失，向下向右位移 4px |

## 八、弹窗样式规范

### 8.1 弹窗基础样式

```css
.levelup-modal .levelup-content,
.gallery-modal .gallery-content,
.toolchain-modal .toolchain-content {
    background: #1a1a2e;
    border: 4px solid #00ff41;
    box-shadow: 8px 8px 0 #0a0a0f;
}
```

### 8.2 弹窗关闭按钮

```css
.levelup-close,
.gallery-close,
.toolchain-close {
    background: #1a1a2e;
    color: #00ff41;
    border: 3px solid #00ff41;
    box-shadow: 3px 3px 0 #0a0a0f;
    font-family: 'Press Start 2P', monospace;
}
```

## 九、颜色规范

| 颜色用途 | 颜色值 | 说明 |
| :--- | :--- | :--- |
| 主背景 | `#1a1a2e` | 深蓝黑色 |
| 阴影色 | `#0a0a0f` | 更深的黑色 |
| 主色调（边框/发光） | `#00ff41` | 像素绿 |
| 主标题文字 | `#ffffff` | 纯白 |
| 次要按钮边框 | `#666666` | 灰色 |
| 副标题/金色元素 | `#f0e68c` | 浅金 |
| 继续游戏边框 | `#ffd700` | 金色 |
| 天堂职级 | `#ffffff` | 白色 |
| 裁决职级 | `#f0e68c` | 金色 |
| 地狱职级 | `#8b0000` | 暗红 |

## 十、响应式设计

```css
@media (max-width: 700px) {
    .logo-title { font-size: 24px; }
    .btn-start-game { font-size: 12px; }
    .secondary-buttons { gap: 12px; }
}

@media (max-width: 480px) {
    .logo-title { font-size: 18px; }
    .secondary-buttons { flex-direction: column; }
    .btn-secondary { width: 200px; flex-direction: row; }
}
```

## 十一、技术栈

| 分类 | 技术 | 版本/来源 |
| :--- | :--- | :--- |
| 语言 | HTML5 | - |
| 样式 | CSS3 | - |
| 脚本 | JavaScript ES6+ | - |
| 字体 | Press Start 2P | Google Fonts |