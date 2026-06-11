# 资源文件夹使用指南

## 📁 文件夹结构

```
e:\code\demo\mvpdemo\公平事务所\public\assets\plants_vs_zombies\
├── README.md                    # 本文件
│
├── images/                      # 图片资源
│   ├── plants/                  # 植物角色图片
│   │   ├── sunflower/           # 向日葵（运营）
│   │   │   ├── normal.png       # 普通版本
│   │   │   ├── sr.png          # SR版本
│   │   │   └── ssr.png         # SSR版本
│   │   ├── shooter/             # 射手（设计）
│   │   │   ├── normal.png
│   │   │   ├── sr.png
│   │   │   └── ssr.png
│   │   ├── wallnut/             # 坚果墙（QA）
│   │   │   ├── normal.png
│   │   │   ├── sr.png
│   │   │   └── ssr.png
│   │   ├── cherry_bomb/          # 樱桃炸弹（RD）
│   │   │   ├── normal.png
│   │   │   ├── sr.png
│   │   │   └── ssr.png
│   │   └── potato_mine/          # 土豆地雷（全职）
│   │       ├── normal.png
│   │       ├── sr.png
│   │       └── ssr.png
│   │
│   ├── zombies/                 # 铲车（甲方）图片
│   │   ├── normal.png            # 普通甲方铲车
│   │   ├── angry.png             # 暴躁甲方铲车
│   │   ├── boss.png              # 老板甲方铲车
│   │   ├── shareholder.png       # 股东甲方铲车
│   │   └── final_boss.png        # 最终Boss铲车
│   │
│   ├── effects/                 # 特效图片
│   │   ├── bullet.png            # 子弹（设计稿）
│   │   ├── explosion.png          # 爆炸特效
│   │   ├── sun.png               # 阳光图标
│   │   └── brain.png             # 脑子（报表）
│   │
│   └── ui/                      # UI元素
│       ├── background.png         # 游戏背景
│       ├── grid.png              # 网格背景
│       ├── button_play.png        # 开始按钮
│       └── card_slot.png         # 卡牌槽
│
├── audio/                       # 音频资源
│   ├── bgm/                     # 背景音乐
│   │   └── game_bgm.mp3          # 游戏背景音乐
│   │
│   ├── sfx/                    # 音效
│   │   ├── plant_place.mp3       # 放置植物
│   │   ├── plant_attack.mp3     # 植物攻击
│   │   ├── bullet_fire.mp3      # 子弹发射
│   │   ├── explosion.mp3         # 爆炸
│   │   ├── sun_collect.mp3      # 收集阳光
│   │   ├── zombie_groan.mp3     # 铲车叫声
│   │   ├── zombie_eat.mp3       # 铲车吃脑子
│   │   ├── zombie_die.mp3       # 铲车死亡
│   │   ├── wave_start.mp3       # 波次开始
│   │   ├── victory.mp3          # 胜利
│   │   └── defeat.mp3           # 失败
│
└── fonts/                       # 字体资源（如有特殊字体需求）
    └── custom_font.ttf           # 自定义字体
```

## 🎨 AI 图片生成提示词

### 植物角色提示词

#### 向日葵（运营）- 生产阳光
```markdown
A cute cartoon sunflower character for a tower defense game, pixel art style, 
bright yellow petals, happy face, holding a small bucket, warm colors, 
transparent background, game asset, 128x128 pixels, clean lines, vibrant colors

变体（SR/SSR）：
- SR: Same sunflower but with a golden crown, sparkles around it
- SSR: Royal sunflower with diamond crown, golden aura, luxurious appearance
```

#### 射手（设计）- 发射设计稿
```markdown
A cute cartoon peashooter character for a tower defense game, pixel art style, 
green body, wearing designer glasses, holding a pencil that shoots design papers, 
creative vibe, transparent background, game asset, 128x128 pixels

变体（SR/SSR）：
- SR: Designer peashooter with measuring tape, professional look
- SSR: Master designer with golden ruler, artistic aura
```

#### 坚果墙（QA）- 防御阻挡
```markdown
A cute cartoon wallnut character for a tower defense game, pixel art style, 
brown nut with worried face wearing a hard hat, QA inspector vibe, 
shield in hand, transparent background, game asset, 128x128 pixels

变体（SR/SSR）：
- SR: Wallnut with magnifying glass, detective style
- SSR: Golden shield wallnut, invincible appearance
```

#### 樱桃炸弹（RD）- 爆炸伤害
```markdown
A cute cartoon cherry bomb character for a tower defense game, pixel art style, 
red cherry with angry face, fuse on top about to explode, explosive energy, 
transparent background, game asset, 128x128 pixels

变体（SR/SSR）：
- SR: Double cherry bomb, larger and more powerful
- SSR: Triple cherry bomb cluster, nuclear cherry bomb, golden fuse
```

#### 土豆地雷（全职）- 埋地爆炸
```markdown
A cute cartoon potato mine character for a tower defense game, pixel art style, 
brown potato buried in ground with angry face, spring visible, 
about to pop up and explode, transparent background, game asset, 128x128 pixels

变体（SR/SSR）：
- SR: Golden sweet potato mine, richer color
- SSR: Diamond potato mine, sparkling mine
```

### 铲车（甲方）提示词

#### 普通甲方铲车
```markdown
A cartoon construction wheel loader (铲车) for a tower defense game, pixel art style, 
friendly but annoying boss appearance, wearing suit and tie, holding a clipboard, 
saying "this is simple", neutral colors, transparent background, game asset, 128x128 pixels
```

#### 暴躁甲方铲车
```markdown
A cartoon angry construction wheel loader (铲车) for a tower defense game, pixel art style, 
red face, steam coming out of ears, holding a deadline calendar marked "Friday", 
very angry expression, red and orange tones, transparent background, game asset, 128x128 pixels
```

#### 老板甲方铲车
```markdown
A cartoon boss construction wheel loader (铲车) for a tower defense game, pixel art style, 
distinguished older boss with mustache, wearing suit, holding a megaphone, 
saying "we will surpass BAT!", gold and purple tones, regal appearance, 
transparent background, game asset, 128x128 pixels
```

#### 股东甲方铲车
```markdown
A cartoon shareholder construction wheel loader (铲车) for a tower defense game, pixel art style, 
rich investor with suit, gold watch, holding a money bag, 
saying "ROI must be 1000%!", gold and green tones, wealthy appearance, 
transparent background, game asset, 128x128 pixels
```

#### 最终Boss铲车
```markdown
A cartoon final boss construction wheel loader (铲车) for a tower defense game, pixel art style, 
huge and intimidating, wearing crown, holding stock chart, 
saying "market cap must increase 10x!", dark purple and gold, 
dominant boss aura, transparent background, game asset, 256x256 pixels
```

### 特效和UI提示词

#### 子弹（设计稿）
```markdown
A design paper bullet for a tower defense game, pixel art style, 
white paper with blue lines representing a design sketch, 
slight motion blur, transparent background, game asset, 32x32 pixels
```

#### 爆炸特效
```markdown
An explosion effect for a tower defense game, pixel art style, 
orange and red gradient, multiple explosion rings, 
bright center, particles flying out, transparent background, 
game asset, 128x128 pixels
```

#### 阳光图标
```markdown
A bright sun icon for a tower defense game, pixel art style, 
golden yellow sun with happy face, rays shining, 
warm glow effect, transparent background, game asset, 64x64 pixels
```

#### 脑子（报表）
```markdown
A cute cartoon brain icon for a tower defense game, pixel art style, 
pink brain with worried expression, showing stress, 
small health bar above, transparent background, game asset, 64x64 pixels
```

## 🎵 AI 音频生成提示词

### 背景音乐
```markdown
Create a fun, upbeat background music for a tower defense game, 
medium tempo (120 BPM), cheerful melody with electronic elements, 
时长：60秒，循环
```

### 音效
```markdown
Create the following game sound effects:

1. plant_place.mp3 - Satisfying placing sound, like putting down a toy
2. plant_attack.mp3 - Whoosh sound for plant attacking
3. bullet_fire.mp3 - Quick shooting sound, paper swoosh
4. explosion.mp3 - Cartoon explosion sound, not too scary
5. sun_collect.mp3 - Coin collection sound, happy ding
6. zombie_groan.mp3 - Funny zombie groan, not scary
7. zombie_eat.mp3 - Chomping/eating sound, cartoon style
8. zombie_die.mp3 - Deflating sound, funny fall
9. wave_start.mp3 - Dramatic alert sound, "incoming wave"
10. victory.mp3 - Triumphant victory fanfare, celebration
11. defeat.mp3 - Sad trombone, game over sound

Each file should be 1-3 seconds, high quality MP3 format
```

## 📊 推荐尺寸和格式

| 资源类型 | 推荐尺寸 | 推荐格式 | 最大文件大小 |
|---------|---------|---------|------------|
| 植物角色 | 128×128 px | PNG (透明背景) | 100KB |
| 铲车角色 | 128×128 px (普通) / 256×256 px (Boss) | PNG (透明背景) | 150KB |
| 特效 | 64×64 px | PNG (透明背景) | 50KB |
| UI背景 | 800×600 px | PNG/JPG | 500KB |
| 子弹 | 32×32 px | PNG (透明背景) | 20KB |
| 音频 | - | MP3 | 500KB |

## 🔧 快速开始方案

如果你想先快速测试游戏玩法，可以暂时使用 Emoji 代替图片：

在代码中这样使用：
```javascript
const PLANT_EMOJIS = {
  sunflower: '🌻',
  shooter: '🌱',
  wallnut: '🧱',
  cherryBomb: '🍒',
  potatoMine: '🥔'
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

## ✅ 检查清单

放置资源后，请确认：

- [ ] 所有植物角色图片已放置
- [ ] 所有铲车角色图片已放置
- [ ] 特效图片已放置（可选）
- [ ] UI背景图片已放置（可选）
- [ ] 音频文件已放置（可选）
- [ ] 图片命名正确（如 normal.png, sr.png, ssr.png）
- [ ] 格式正确（PNG for images, MP3 for audio）

## 📝 备注

- 所有图片推荐使用 **PNG 格式**并保留 **透明背景**
- 音频推荐使用 **MP3 格式**
- 如果使用 AI 生成，请保留生成时的提示词，方便后续调整
- 第一版可以只做 normal 版本，SR 和 SSR 版本可以后续迭代

---

**创建日期**：2026-05-24  
**最后更新**：2026-05-24  
**版本**：V1.0
