import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import cardsData from '@/data/cards.json'
import charactersData from '@/data/characters.json'

export const useCardsStore = defineStore('cards', () => {
  // 状态
  const pools = ref(cardsData.pools || [])
  const variantResults = ref(cardsData.variant_results || {})
  const backpack = ref([])
  const hc = ref(3)
  const currentPool = ref(null)
  const drawHistory = ref([])
  const unlockedCards = ref([])
  const weeklyDraws = ref(0)
  
  // 计算属性
  const allCards = computed(() => {
    return pools.value.flatMap(pool => pool.cards)
  })
  
  const rarityColors = {
    'R': 'border-blue-400 bg-blue-900/30',
    'SR': 'border-purple-400 bg-purple-900/30',
    'SSR': 'border-yellow-400 bg-yellow-900/30'
  }
  
  const rarityStars = {
    'R': '⭐',
    'SR': '⭐⭐',
    'SSR': '⭐⭐⭐'
  }
  
  const currentHC = computed(() => {
    // 初始团队卡片(id以'initial_'开头)不计入HC限制
    const normalCards = backpack.value.filter(c => !c.is_variant && !c.id.startsWith('initial_')).length
    const variantCards = backpack.value.filter(c => c.is_variant).length
    return `${normalCards}/${hc.value} (管培生${variantCards}不计)`
  })

  // 保底机制：连续10抽必出SR或以上
  const pityCounter = ref(0)
  
  // 获取保底进度
  function getPityProgress() {
    return pityCounter.value
  }
  
  // 重置保底计数
  function resetPityCounter() {
    pityCounter.value = 0
  }
  
  // 本地存储
  function loadFromStorage() {
    try {
      const savedBackpack = localStorage.getItem('fair_office_cards')
      const savedHC = localStorage.getItem('fair_office_hc')
      const savedHistory = localStorage.getItem('fair_office_draw_history')
      const savedUnlocked = localStorage.getItem('fair_office_unlocked_cards')
      const savedPity = localStorage.getItem('fair_office_pity_counter')
      
      if (savedBackpack) backpack.value = JSON.parse(savedBackpack)
      if (savedHC) hc.value = parseInt(savedHC)
      if (savedHistory) drawHistory.value = JSON.parse(savedHistory)
      if (savedUnlocked) unlockedCards.value = JSON.parse(savedUnlocked)
      if (savedPity) pityCounter.value = parseInt(savedPity)
    } catch (error) {
      console.error('Failed to load from storage:', error)
    }
  }
  
  function saveToStorage() {
    localStorage.setItem('fair_office_cards', JSON.stringify(backpack.value))
    localStorage.setItem('fair_office_hc', hc.value.toString())
    localStorage.setItem('fair_office_draw_history', JSON.stringify(drawHistory.value))
    localStorage.setItem('fair_office_unlocked_cards', JSON.stringify(unlockedCards.value))
    localStorage.setItem('fair_office_pity_counter', pityCounter.value.toString())
  }
  
  // 抽卡相关
  function selectPool(poolId) {
    currentPool.value = pools.value.find(p => p.id === poolId)
    return currentPool.value
  }
  
  function drawCard(addToBackpack = false) {
    if (!currentPool.value) return null
    // 计算当前占用HC的卡片数量（排除初始团队和管培生）
    const usedHC = backpack.value.filter(c => !c.is_variant && !c.id.startsWith('initial_')).length
    if (usedHC >= hc.value) {
      return null
    }
    
    const cards = currentPool.value.cards
    
    // 保底机制：10抽必出SR或以上
    let selectedCard = null
    
    if (pityCounter.value >= 10) {
      // 保底状态：从SR和SSR中抽取
      const pityCards = cards.filter(c => c.rarity === 'SR' || c.rarity === 'SSR')
      if (pityCards.length > 0) {
        // SSR 1/4, SR 3/4
        const random = Math.random()
        const targetRarity = random < 0.25 ? 'SSR' : 'SR'
        const targetCards = pityCards.filter(c => c.rarity === targetRarity)
        if (targetCards.length > 0) {
          selectedCard = { ...targetCards[Math.floor(Math.random() * targetCards.length)], instanceId: Date.now() + Math.random(), poolId: currentPool.value.id }
        }
      }
    }
    
    // 如果没有触发保底，正常抽取
    if (!selectedCard) {
      // 权重机制：SSR 5%, SR 15%, R 80%
      const weights = cards.map(c => {
        switch(c.rarity) {
          case 'SSR': return 5
          case 'SR': return 15
          default: return 80
        }
      })
      
      const totalWeight = weights.reduce((a, b) => a + b, 0)
      let random = Math.random() * totalWeight
      
      for (let i = 0; i < cards.length; i++) {
        random -= weights[i]
        if (random <= 0) {
          selectedCard = { ...cards[i], instanceId: Date.now() + Math.random(), poolId: currentPool.value.id }
          break
        }
      }
      
      if (!selectedCard) {
        selectedCard = { ...cards[0], instanceId: Date.now() + Math.random(), poolId: currentPool.value.id }
      }
      
      // 如果抽到R，增加保底计数
      if (selectedCard.rarity === 'R') {
        pityCounter.value++
      } else {
        // 抽到SR或SSR，重置保底
        pityCounter.value = 0
      }
    } else {
      // 触发保底，重置计数
      pityCounter.value = 0
    }
    
    // 只有明确要求时才添加到背包（用于招聘录用）
    if (addToBackpack) {
      // 添加到背包
      backpack.value.push(selectedCard)
      
      // 添加到抽卡历史
      drawHistory.value.unshift({
        name: selectedCard.name,
        rarity: selectedCard.rarity,
        pool: selectedCard.poolId,
        timestamp: Date.now()
      })
      
      // 限制历史记录数量
      if (drawHistory.value.length > 100) {
        drawHistory.value = drawHistory.value.slice(0, 100)
      }
      
      // 解锁卡片
      const cardKey = `${selectedCard.poolId}_${selectedCard.id}`
      if (!unlockedCards.value.includes(cardKey)) {
        unlockedCards.value.push(cardKey)
      }
      
      saveToStorage()
    }
    
    return selectedCard
  }
  
  // 添加卡牌到背包（用于招聘录用）
  function addCardToBackpack(card) {
    if (!card) return false
    
    // 检查HC限制（排除初始团队和管培生）
    const usedHC = backpack.value.filter(c => !c.is_variant && !c.id.startsWith('initial_')).length
    if (usedHC >= hc.value) {
      return false
    }
    
    // 添加到背包
    backpack.value.push(card)
    
    // 添加到抽卡历史
    drawHistory.value.unshift({
      name: card.name,
      rarity: card.rarity,
      pool: card.poolId,
      timestamp: Date.now()
    })
    
    // 解锁卡片
    const cardKey = `${card.poolId}_${card.id}`
    if (!unlockedCards.value.includes(cardKey)) {
      unlockedCards.value.push(cardKey)
    }
    
    saveToStorage()
    return true
  }

  // 团队管理
  function removeCard(cardId) {
    const index = backpack.value.findIndex(c => c.id === cardId)
    if (index > -1) {
      backpack.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }
  
  function getCardsByPosition(position) {
    if (position === 'all') return backpack.value
    return backpack.value.filter(c => c.position === position)
  }
  
  function resetCards() {
    backpack.value = []
    hc.value = 3
    drawHistory.value = []
    saveToStorage()
  }
  
  // 加载初始团队成员
  function loadInitialTeam() {
    const characterMap = {}
    if (charactersData && charactersData.characters) {
      charactersData.characters.forEach(char => {
        characterMap[char.name] = char
      })
    }
    
    // 如果已有卡片，检查并添加头像信息
    if (backpack.value.length > 0) {
      let needsUpdate = false
      backpack.value.forEach(card => {
        if (!card.portrait && characterMap[card.name]) {
          card.portrait = characterMap[card.name].portrait || getDefaultPortrait(card.name)
          needsUpdate = true
        }
      })
      if (needsUpdate) {
        saveToStorage()
      }
      return
    }
    
    // 否则，加载初始团队
    const initialCards = [
      {
        id: 'initial_rd',
        name: '艾萨克',
        rarity: 'R',
        durability: 10,
        max_durability: 10,
        is_variant: false,
        position: 'RD',
        spectrum: 'technology',
        effect: { type: 'progress', value: 3 },
        description: '前大厂代码洁癖患者',
        portrait: characterMap['艾萨克']?.portrait || '/assets/portraits/aisaike.png',
        instanceId: Date.now(),
        poolId: 'rd'
      },
      {
        id: 'initial_qa',
        name: '莫甘娜',
        rarity: 'R',
        durability: 10,
        max_durability: 10,
        is_variant: false,
        position: 'QA',
        spectrum: 'service',
        effect: { type: 'satisfaction', value: 5 },
        description: '前大厂Bug粉碎机',
        portrait: characterMap['莫甘娜']?.portrait || '/assets/portraits/moganna.png',
        instanceId: Date.now() + 1,
        poolId: 'qa'
      },
      {
        id: 'initial_op',
        name: '小葵',
        rarity: 'R',
        durability: 10,
        max_durability: 10,
        is_variant: false,
        position: 'Operation',
        spectrum: 'operation',
        effect: { type: 'team_favor', value: 5 },
        description: '团队粘合剂',
        portrait: characterMap['小葵']?.portrait || '/assets/portraits/xiaokui.png',
        instanceId: Date.now() + 2,
        poolId: 'operation'
      },
      {
        id: 'initial_design',
        name: '辛竹',
        rarity: 'R',
        durability: 10,
        max_durability: 10,
        is_variant: false,
        position: 'Design',
        spectrum: 'design',
        effect: { type: 'satisfaction', value: 4 },
        description: '像素艺术家',
        portrait: characterMap['辛竹']?.portrait || '/assets/portraits/xinzhu.png',
        instanceId: Date.now() + 3,
        poolId: 'design'
      }
    ]
    
    backpack.value = initialCards
    saveToStorage()
  }
  
  function getDefaultPortrait(name) {
    const map = {
      '艾萨克': '/assets/portraits/aisaike.png',
      '莫甘娜': '/assets/portraits/moganna.png',
      '小葵': '/assets/portraits/xiaokui.png',
      '辛竹': '/assets/portraits/xinzhu.png'
    }
    return map[name] || ''
  }
  
  // 管培生变异处理
  function processVariantCard(card) {
    if (!card.is_variant || !card.variant_pool) return null
    
    const resultId = card.variant_pool[Math.floor(Math.random() * card.variant_pool.length)]
    const result = variantResults.value[resultId]
    
    if (!result) {
      console.error('Variant result not found:', resultId)
      return null
    }
    
    return {
      resultId,
      result,
      message: result.text,
      bonus: result.bonus
    }
  }
  
  // 升级卡片
  function upgradeCard(instanceId) {
    const cardIndex = backpack.value.findIndex(c => c.instanceId === instanceId)
    if (cardIndex === -1) return null
    
    const card = backpack.value[cardIndex]
    if (card.is_variant || card.rarity === 'SSR') return null
    
    const upgradeMap = {
      'R': 'SR',
      'SR': 'SSR'
    }
    
    const newRarity = upgradeMap[card.rarity]
    if (!newRarity) return null
    
    card.rarity = newRarity
    card.durability = card.rarity === 'SSR' ? 5 : 8
    card.max_durability = card.durability
    
    const cardKey = `${card.poolId}_${card.id}`
    if (!unlockedCards.value.includes(cardKey)) {
      unlockedCards.value.push(cardKey)
    }
    
    saveToStorage()
    return card
  }
  
  // 使用卡片（消耗耐久）
  function useCard(instanceId) {
    const cardIndex = backpack.value.findIndex(c => c.instanceId === instanceId)
    if (cardIndex === -1) return null
    
    const card = backpack.value[cardIndex]
    
    // 初始团队成员不会被burnout删除
    if (card.id.startsWith('initial_')) {
      // 初始团队仍然显示耐久度消耗，但不删除
      if (card.currentDurability === undefined) {
        card.currentDurability = card.durability
      }
      card.currentDurability -= 1
      if (card.currentDurability < 0) card.currentDurability = 0
      saveToStorage()
      return { card, isDestroyed: false, fragments: 0 }
    }
    
    if (card.currentDurability === undefined) {
      card.currentDurability = card.durability
    }
    
    let wearAmount = card.rarity === 'SSR' ? 3 : 1
    card.currentDurability -= wearAmount
    
    if (card.currentDurability <= 0) {
      const fragments = card.rarity === 'SSR' ? 10 : (card.rarity === 'SR' ? 3 : 1)
      backpack.value.splice(cardIndex, 1)
      saveToStorage()
      return { card: null, isDestroyed: true, fragments }
    }
    
    saveToStorage()
    return { card, isDestroyed: false, fragments: 0 }
  }
  
  // 初始化
  loadFromStorage()
  
  return {
    pools,
    variantResults,
    backpack,
    hc,
    currentPool,
    drawHistory,
    unlockedCards,
    weeklyDraws,
    allCards,
    rarityColors,
    rarityStars,
    currentHC,
    selectPool,
    drawCard,
    addCardToBackpack,
    removeCard,
    getCardsByPosition,
    resetCards,
    loadInitialTeam,
    processVariantCard,
    upgradeCard,
    useCard,
    loadFromStorage,
    saveToStorage,
    getDefaultPortrait,
    getPityProgress,
    resetPityCounter
  }
})
