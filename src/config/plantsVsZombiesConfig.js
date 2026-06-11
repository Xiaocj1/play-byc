import characterCards from '@/data/cards.json'; // 引入卡牌数据

/**
 * 植物大战僵尸 - 角色映射配置
 * 
 * 这个文件定义了如何将 Recruit 模块的 character 数据
 * 映射为植物大战僵尸游戏的员工角色
 * 
 * 更新：花盆改为工位系统
 * - 必须先放置工位才能放置员工
 * - 员工直接显示头像图片
 * - 新增三重画像支持
 */

export const CHARACTER_TO_PLANT_MAPPING = {
  // 工位系统配置
  deskSystem: {
    enabled: true,              // 是否启用工位系统
    deskCost: 30,               // 放置工位消耗阳光
    maxDesksPerRow: 4,          // 每行最大工位数
    deskHealth: 50,             // 工位血量（被攻击会损坏）
    deskRegenerateTime: 30000    // 工位修复时间（ms）
  },

  // 职位映射到角色类型
  positionMapping: {
    'Operation': 'sunflower',      // 运营 → 向日葵型（生产资源）
    'Design': 'shooter',          // 设计 → 射手型（远程攻击）
    'QA': 'wallnut',             // QA → 坚果型（防御）
    'RD': 'cherryBomb'           // RD → 炸弹型（范围伤害）
  },

  // 稀有度到属性加成
  rarityBonus: {
    'R': {
      health: 1.0,        // 基础属性
      attack: 1.0,
      cost: 1.0           // 基础消耗
    },
    'SR': {
      health: 1.5,        // 50%属性提升
      attack: 1.5,
      cost: 0.8           // 消耗降低20%
    },
    'SSR': {
      health: 2.0,        // 100%属性提升
      attack: 2.0,
      cost: 0.6           // 消耗降低40%
    }
  },

  // 员工角色基础属性
  characterStats: {
    sunflower: {
      name: '运营',
      type: 'sunflower',
      cost: 50,           // 消耗阳光
      health: 100,        // 血量
      attack: 0,          // 攻击力（不攻击）
      cooldown: 5000,     // 产出间隔（ms）
      sunProduction: 25,   // 每次产出阳光
      description: '每5秒产出25阳光',
      ability: '生产资源'
    },
    shooter: {
      name: '设计',
      type: 'shooter',
      cost: 100,
      health: 80,
      attack: 20,         // 每5秒伤害
      cooldown: 5000,
      bulletSpeed: 200,
      description: '每5秒发射设计稿攻击',
      ability: '远程攻击'
    },
    wallnut: {
      name: 'QA',
      type: 'wallnut',
      cost: 50,
      health: 300,        // 高血量
      attack: 0,
      cooldown: 0,
      description: '阻挡铲车前进',
      ability: '防御'
    },
    cherryBomb: {
      name: 'RD',
      type: 'cherryBomb',
      cost: 150,
      health: 50,        // 低血量（一次性）
      attack: 100,        // 爆炸伤害
      cooldown: 15000,    // 冷却15秒
      explosionRadius: 1.5, // 1.5格范围
      description: '立即爆炸，3×3范围伤害',
      ability: '范围伤害'
    }
  },

  // 克制关系
  counterSystem: {
    // 岗位克制铲车类型
    // 设计克制普通，QA克制暴躁，运营克制老板，RD克制股东
    positionVsZombie: {
      'Design': 'normal',       // 设计克制普通甲方
      'QA': 'angry',           // QA克制暴躁甲方
      'Operation': 'boss',     // 运营克制老板甲方
      'RD': 'shareholder'      // RD克制股东甲方
    },
    
    // 克制伤害加成
    counterBonus: 2.0,         // 克制时伤害×2
    normalBonus: 1.0           // 非克制时正常伤害
  },

  // 员工头像配置（直接显示员工图片）
  avatarConfig: {
    useCharacterAvatar: true,   // 是否使用员工头像
    defaultAvatar: '👤',        // 默认头像（没有图片时）
    avatarSize: 64,             // 头像尺寸（像素）
    avatarBorderRadius: '50%',  // 头像圆角（圆形）
    avatarBorderColor: '#007bff' // 头像边框颜色
  },

  // 角色图片路径映射（RD部门已有图片）
  characterImages: {
    'rd_crud': '/assets/plants_vs_zombies/images/plants/rd/crud.png',
    'rd_jiagou': '/assets/plants_vs_zombies/images/plants/rd/jiagou.png',
    'rd_suanfa': '/assets/plants_vs_zombies/images/plants/rd/suanfa.png',
    'rd_waibao': '/assets/plants_vs_zombies/images/plants/rd/waibao.png',
    'rd_houduan': '/assets/plants_vs_zombies/images/plants/rd/houduan.png',
    'rd_qianduan': '/assets/plants_vs_zombies/images/plants/rd/qianduan.png',
    'rd_wangan': '/assets/plants_vs_zombies/images/plants/rd/wangan.png',
    'rd_fullstack': '/assets/plants_vs_zombies/images/plants/rd/houduan.png',
    'rd_security': '/assets/plants_vs_zombies/images/plants/rd/wangan.png'
  },

  // 卡牌ID到图片的映射
  cardIdToImage: {
    'rd_001': 'rd_crud',        // CRUD工程师
    'rd_002': 'rd_jiagou',      // 架构师
    'rd_003': 'rd_suanfa',      // 算法专家
    'rd_005': 'rd_waibao',      // 外包老哥
    'rd_006': 'rd_fullstack',   // 全栈工程师
    'rd_007': 'rd_houduan',     // 后端大神
    'rd_008': 'rd_qianduan',    // 前端卷王
    'rd_009': 'rd_wangan',      // 运维老哥
    'rd_010': 'rd_security'     // 安全专家
  },

  // 铲车（僵尸）配置
  zombieConfig: {
    normal: {
      name: '普通甲方',
      type: 'normal',
      health: 100,
      speed: 1.0,
      damage: 10,
      quotes: [
        '这个需求很简单嘛',
        '先做个MVP看看',
        '不就是加个功能吗'
      ]
    },
    angry: {
      name: '暴躁甲方',
      type: 'angry',
      health: 150,
      speed: 1.2,
      damage: 15,
      quotes: [
        '周五必须上线！',
        '加班不是应该的吗？',
        '996是福报懂不懂'
      ]
    },
    boss: {
      name: '老板甲方',
      type: 'boss',
      health: 200,
      speed: 0.8,
      damage: 20,
      quotes: [
        '我们要超越BAT！',
        '格局要打开！',
        '这季度KPI翻倍！'
      ]
    },
    shareholder: {
      name: '股东甲方',
      type: 'shareholder',
      health: 500,
      speed: 0.5,
      damage: 30,
      quotes: [
        'ROI必须1000%！',
        '下个季度要盈利！',
        '市值要翻十倍！'
      ]
    },
    final: {
      name: '最终Boss',
      type: 'final',
      health: 800,
      speed: 0.4,
      damage: 50,
      quotes: [
        '股东们很有信心！',
        '我们的故事很性感！',
        '这才是开始！'
      ]
    }
  },

  // 波次配置
  waveConfig: {
    totalWaves: 5,
    spawnInterval: 8000,        // 每波间隔8秒
    zombiesPerWave: [3, 5, 7, 8, 10],
    
    waveCompositions: [
      // 波次1：普通僵尸为主
      [
        { type: 'normal', weight: 1.0 }
      ],
      // 波次2：加入暴躁
      [
        { type: 'normal', weight: 0.7 },
        { type: 'angry', weight: 0.3 }
      ],
      // 波次3：加入老板
      [
        { type: 'normal', weight: 0.5 },
        { type: 'angry', weight: 0.3 },
        { type: 'boss', weight: 0.2 }
      ],
      // 波次4：加入股东
      [
        { type: 'normal', weight: 0.4 },
        { type: 'angry', weight: 0.3 },
        { type: 'boss', weight: 0.2 },
        { type: 'shareholder', weight: 0.1 }
      ],
      // 波次5：最终波，加入最终Boss
      [
        { type: 'normal', weight: 0.3 },
        { type: 'angry', weight: 0.25 },
        { type: 'boss', weight: 0.2 },
        { type: 'shareholder', weight: 0.15 },
        { type: 'final', weight: 0.1 }
      ]
    ]
  },

  // 游戏资源
  gameConfig: {
    initialSun: 150,            // 初始阳光
    maxSun: 500,               // 阳光上限
    initialReportIntegrity: 100, // 报表初始完整性
    gridCols: 9,               // 列数
    gridRows: 5,               // 行数
    cellWidth: 80,             // 格子宽度
    cellHeight: 100             // 格子高度
  },

  // 三重画像阶段性解锁配置
  // 注意：burnout次数 != 磨损度
  // - 磨损度（Durability）：卡牌的耐久度数值，每次使用减少
  // - Burnout次数：卡牌耐久度归零的次数，解锁进度基于此
  profileUnlockConfig: {
    // 解锁阶段配置（基于burnout次数）
    stages: [
      {
        burnoutThreshold: 0,
        name: '基础阶段',
        unlockedFields: ['basic']
      },
      {
        burnoutThreshold: 5,
        name: '职场阶段',
        unlockedFields: ['basic', 'work']
      },
      {
        burnoutThreshold: 10,
        name: '社交阶段',
        unlockedFields: ['basic', 'work', 'social']
      },
      {
        burnoutThreshold: 15,
        name: '简历阶段',
        unlockedFields: ['basic', 'work', 'social', 'resume']
      },
      {
        burnoutThreshold: 20,
        name: '完整阶段',
        unlockedFields: ['basic', 'work', 'social', 'resume', 'secret']
      }
    ],
    
    // 每次burnout增加的进度
    burnoutIncrement: 1,
    
    // 各阶段解锁的详细内容
    fieldDetails: {
      basic: {
        name: '基础信息',
        icon: '📋',
        description: '名字、职位、稀有度等基本信息'
      },
      work: {
        name: '职场画像',
        icon: '💼',
        description: '岗位表现、同事评价、技能标签'
      },
      social: {
        name: '朋友圈画像',
        icon: '📱',
        description: '日常动态、生活状态'
      },
      resume: {
        name: '简历画像',
        icon: '📄',
        description: '包装后的职场简历'
      },
      secret: {
        name: '隐藏内容',
        icon: '🔒',
        description: '解锁全部隐藏信息'
      }
    }
  },

  // 黄金矿工钩子数量计算
  minerHookConfig: {
    // 剩余铲车 → 钩子数量
    hookByRemainingZombie: {
      0: 5,   // 全部击败 → 5个钩子
      1: 4,   // 1个剩余 → 4个钩子
      2: 3,   // 2个剩余 → 3个钩子
      3: 2,   // 3个剩余 → 2个钩子
      4: 1,   // 4个剩余 → 1个钩子
      5: 0    // 5个剩余 → 0个钩子
    },
    
    // 钩子数量 → 得分权重
    scoreWeightByHook: {
      5: 2.0,   // 5钩子，得分×2
      4: 1.5,   // 4钩子，得分×1.5
      3: 1.2,   // 3钩子，得分×1.2
      2: 1.0,   // 2钩子，得分×1
      1: 0.8,   // 1钩子，得分×0.8
      0: 0.5    // 0钩子（报表被吃），得分×0.5
    }
  }
}

/**
 * 从 Recruit 模块的 character 数据转换为员工角色
 */
export function convertCharacterToPlant(character) {
  const position = character.position || character.poolId
  const rarity = character.rarity
  const charType = CHARACTER_TO_PLANT_MAPPING.positionMapping[position]
  
  if (!charType) {
    console.warn(`未知的职位: ${position}`)
    return null
  }
  
  const baseStats = CHARACTER_TO_PLANT_MAPPING.characterStats[charType]
  const rarityBonus = CHARACTER_TO_PLANT_MAPPING.rarityBonus[rarity] || CHARACTER_TO_PLANT_MAPPING.rarityBonus['R']
  
  return {
    // 基础信息
    instanceId: character.instanceId,
    cardId: character.id,
    name: character.name,
    charType: baseStats.type,
    position: position,
    rarity: rarity,
    
    // 头像信息（直接显示员工图片）
    avatar: character.avatar || character.image || null,  // 员工头像URL
    avatarFallback: CHARACTER_TO_PLANT_MAPPING.avatarConfig.defaultAvatar,
    
    // 战斗属性（应用稀有度加成）
    cost: Math.floor(baseStats.cost * rarityBonus.cost),
    health: Math.floor(baseStats.health * rarityBonus.health),
    maxHealth: Math.floor(baseStats.health * rarityBonus.health),
    attack: Math.floor(baseStats.attack * rarityBonus.attack),
    cooldown: baseStats.cooldown,
    
    // 特殊属性
    sunProduction: baseStats.sunProduction || 0,
    bulletSpeed: baseStats.bulletSpeed || 0,
    explosionRadius: baseStats.explosionRadius || 0,
    
    // 克制信息
    counterTarget: CHARACTER_TO_PLANT_MAPPING.counterSystem.positionVsZombie[position],
    counterBonus: CHARACTER_TO_PLANT_MAPPING.counterSystem.counterBonus,
    
    // 描述
    description: baseStats.description,
    ability: baseStats.ability,
    
    // 来源卡牌
    sourceCard: character
  }
}

/**
 * 创建工位对象
 */
export function createDesk(col, row) {
  const config = CHARACTER_TO_PLANT_MAPPING.deskSystem
  
  return {
    id: `desk_${col}_${row}`,
    col: col,
    row: row,
    health: config.deskHealth,
    maxHealth: config.deskHealth,
    hasEmployee: false,      // 是否有员工
    employeeId: null,        // 员工ID
    destroyed: false,        // 是否被摧毁
    lastDamaged: 0           // 上次受伤时间
  }
}

/**
 * 检查是否可以在指定位置放置工位
 */
export function canPlaceDesk(grid, col, row) {
  const config = CHARACTER_TO_PLANT_MAPPING.deskSystem
  
  // 检查是否在有效区域（第2-7列）
  if (col < 1 || col > 6) {
    return { canPlace: false, reason: '只能在中间区域放置工位' }
  }
  
  // 检查是否已有工位
  if (grid[row] && grid[row][col] && grid[row][col].type === 'desk') {
    return { canPlace: false, reason: '该位置已有工位' }
  }
  
  // 检查该行工位数是否已满
  let deskCount = 0
  for (let c = 0; c < (grid[row]?.length || 0); c++) {
    if (grid[row][c]?.type === 'desk') {
      deskCount++
    }
  }
  if (deskCount >= config.maxDesksPerRow) {
    return { canPlace: false, reason: '该行工位已满' }
  }
  
  return { canPlace: true, reason: '' }
}

/**
 * 检查是否可以在工位上放置员工
 */
export function canPlaceEmployee(grid, col, row) {
  const cell = grid[row]?.[col]
  
  // 检查是否有工位
  if (!cell || cell.type !== 'desk') {
    return { canPlace: false, reason: '需要先放置工位' }
  }
  
  // 检查工位是否被摧毁
  if (cell.destroyed) {
    return { canPlace: false, reason: '工位已被摧毁，需要修复' }
  }
  
  // 检查工位是否已有员工
  if (cell.hasEmployee) {
    return { canPlace: false, reason: '工位已有员工' }
  }
  
  return { canPlace: true, reason: '' }
}

/**
 * 获取铲车配置
 */
export function getZombieConfig(type) {
  return CHARACTER_TO_PLANT_MAPPING.zombieConfig[type] || CHARACTER_TO_PLANT_MAPPING.zombieConfig.normal
}

/**
 * 获取波次配置
 */
export function getWaveConfig(waveNumber) {
  const waves = CHARACTER_TO_PLANT_MAPPING.waveConfig.waveCompositions
  return waves[waveNumber - 1] || waves[0]
}

/**
 * 计算钩子数量
 */
export function calculateHookCount(remainingZombies, brainEaten = false) {
  if (brainEaten) {
    return 0
  }
  const config = CHARACTER_TO_PLANT_MAPPING.minerHookConfig.hookByRemainingZombie
  return config[remainingZombies] || 0
}

/**
 * 计算得分权重
 */
export function calculateScoreWeight(hookCount) {
  const config = CHARACTER_TO_PLANT_MAPPING.minerHookConfig.scoreWeightByHook
  return config[hookCount] || 0.5
}

/**
 * 根据burnout次数获取当前解锁阶段
 */
export function getUnlockStage(burnoutCount) {
  const stages = CHARACTER_TO_PLANT_MAPPING.profileUnlockConfig.stages
  let currentStage = stages[0]
  
  for (let i = stages.length - 1; i >= 0; i--) {
    if (burnoutCount >= stages[i].burnoutThreshold) {
      currentStage = stages[i]
      break
    }
  }
  
  return currentStage
}

/**
 * 检查某个字段是否已解锁
 */
export function isFieldUnlocked(burnoutCount, field) {
  const stage = getUnlockStage(burnoutCount)
  return stage.unlockedFields.includes(field)
}

/**
 * 获取下一个解锁阶段的进度
 */
export function getNextStageProgress(burnoutCount) {
  const stages = CHARACTER_TO_PLANT_MAPPING.profileUnlockConfig.stages
  
  for (let i = 0; i < stages.length; i++) {
    if (burnoutCount < stages[i].burnoutThreshold) {
      return {
        current: burnoutCount,
        nextThreshold: stages[i].burnoutThreshold,
        nextStage: stages[i],
        progress: (burnoutCount / stages[i].burnoutThreshold) * 100
      }
    }
  }
  
  return {
    current: burnoutCount,
    nextThreshold: burnoutCount,
    nextStage: stages[stages.length - 1],
    progress: 100
  }
}

/**
 * 获取解锁进度百分比
 */
export function getUnlockProgress(burnoutCount) {
  const stages = CHARACTER_TO_PLANT_MAPPING.profileUnlockConfig.stages
  const maxThreshold = stages[stages.length - 1].burnoutThreshold
  
  return Math.min((burnoutCount / maxThreshold) * 100, 100)
}

/**
 * 获取所有解锁阶段信息
 */
export function getAllStagesWithStatus(burnoutCount) {
  const stages = CHARACTER_TO_PLANT_MAPPING.profileUnlockConfig.stages
  
  return stages.map(stage => ({
    ...stage,
    unlocked: burnoutCount >= stage.burnoutThreshold,
    current: burnoutCount >= stage.burnoutThreshold && 
             (stages.indexOf(stage) === stages.length - 1 || 
              burnoutCount < stages[stages.indexOf(stage) + 1].burnoutThreshold)
  }))
}

/**
 * 从 cards.json 读取员工数据并转换为植物大战僵尸的植物数据
 */
export function importEmployeesFromCardsJson() {
  const employees = [];
  
  // 遍历所有池子
  characterCards.pools.forEach(pool => {
    // 遍历池子里的卡牌
    pool.cards.forEach(card => {
      // 跳过管培生和变异卡牌
      if (card.is_variant || card.name === '管培生') return;
      
      // 将招聘系统的卡牌转换为植物大战僵尸的员工
      const charType = CHARACTER_TO_PLANT_MAPPING.positionMapping[card.position];
      const rarityBonus = CHARACTER_TO_PLANT_MAPPING.rarityBonus[card.rarity] || CHARACTER_TO_PLANT_MAPPING.rarityBonus['R'];
      
      if (!charType) {
        console.warn(`未知的职位: ${card.position}`);
        return;
      }
      
      const baseStats = CHARACTER_TO_PLANT_MAPPING.characterStats[charType];
      
      employees.push({
        // 基础信息
        instanceId: `emp_${card.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        cardId: card.id,
        name: card.name,
        charType: baseStats.type,
        position: card.position,
        rarity: card.rarity,
        
        // 头像信息
        avatar: card.avatar || null,
        avatarFallback: CHARACTER_TO_PLANT_MAPPING.avatarConfig.defaultAvatar,
        
        // 战斗属性（应用稀有度加成）
        cost: Math.floor(baseStats.cost * rarityBonus.cost),
        health: Math.floor(baseStats.health * rarityBonus.health),
        maxHealth: Math.floor(baseStats.health * rarityBonus.health),
        attack: Math.floor(baseStats.attack * rarityBonus.attack),
        cooldown: baseStats.cooldown,
        
        // 特殊属性
        sunProduction: baseStats.sunProduction || 0,
        bulletSpeed: baseStats.bulletSpeed || 0,
        explosionRadius: baseStats.explosionRadius || 0,
        
        // 克制信息
        counterTarget: CHARACTER_TO_PLANT_MAPPING.counterSystem.positionVsZombie[card.position],
        counterBonus: CHARACTER_TO_PLANT_MAPPING.counterSystem.counterBonus,
        
        // 描述
        description: baseStats.description,
        ability: baseStats.ability,
        
        // 三重画像
        profile: card.profile || null,
        
        // 来源卡牌
        sourceCard: card
      });
    });
  });
  
  return employees;
}

export default CHARACTER_TO_PLANT_MAPPING
