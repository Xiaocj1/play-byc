import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStore = defineStore('game', () => {
  // ========== 状态定义 ==========
  const week = ref(1)
  const budget = ref(100)
  const satisfaction = ref(80)
  const progress = ref(0)
  const prdVersion = ref('V1.0.0')
  const gameOver = ref(false)
  const showReportModal = ref(false)
  const currentEvent = ref(null)
  const currentEventIndex = ref(0)
  const direction = ref(null) // tob / toc / b2c
  const fame = ref(50)
  const debt = ref(0)
  const hcLimit = ref(3)
  const dau = ref(10)
  const ltv = ref(0.01)
  const gmv = ref(0)
  const benchmarkClients = ref(0)
  const renewalRate = ref(70)
  const toBPhase = ref(0)
  const disputeRate = ref(5)
  // 新增：HC里程碑相关
  const hcMilestones = ref([
    { asset: 200, hc: 4, unlocked: false },
    { asset: 500, hc: 5, unlocked: false },
    { asset: 1000, hc: 6, unlocked: false },
    { asset: 2000, hc: 7, unlocked: false },
    { asset: 5000, hc: 8, unlocked: false }
  ])
  // 新增：节假日系统
  const holidays = ref({
    2: { name: '元旦', effect: { morale: 3, noCost: true } },
    4: { name: '春节', effect: { progressPause: true, morale: 5 } },
    6: { name: '元宵节', effect: { morale: 3, cost: -5 } },
    16: { name: '劳动节', effect: { progress: -5, morale: 3 } },
    23: { name: '端午节', effect: { morale: 5, cost: -3 } },
    31: { name: '七夕节', effect: { morale: 3 } },
    36: { name: '中秋节', effect: { morale: 5, cost: -5 } },
    39: { name: '国庆节', effect: { progressPause: true, morale: 5 } },
    46: { name: '万圣节', effect: { morale: 3 } },
    50: { name: '感恩节', effect: { morale: 5 } },
    52: { name: '跨年', effect: { morale: 5, cost: -8 } }
  })
  // 新增：角色季节Buff
  const characterBuffs = ref([])

  // ========== 计算属性 ==========
  const currentQuarter = computed(() => Math.floor((week.value - 1) / 12) + 1)
  const weekInQuarter = computed(() => ((week.value - 1) % 12) + 1)
  const isGameOver = computed(() => satisfaction.value <= 0 || budget.value <= -1000)
  const progressPercent = computed(() => Math.min(100, Math.max(0, progress.value)))
  const fameLevel = computed(() => {
    if (fame.value >= 80) return 'legendary'
    if (fame.value >= 60) return 'high'
    if (fame.value >= 40) return 'normal'
    if (fame.value >= 20) return 'low'
    return 'bad'
  })
  
  // 新增：动态事件次数计算
  const weeklyEventConfig = computed(() => {
    const sat = satisfaction.value
    if (sat >= 80) {
      return { count: 2, multiplier: 1.5, baseProgress: 3 }
    } else if (sat <= 40) {
      return { count: 4, multiplier: 0.8, baseProgress: 3 }
    }
    return { count: 3, multiplier: 1.0, baseProgress: 3 }
  })
  
  // 新增：当前节假日检查
  const currentHoliday = computed(() => holidays.value[week.value] || null)
  
  // 新增：总资产计算（预算 - 债务）
  const totalAssets = computed(() => budget.value - debt.value)
  
  // 新增：当前季节
  const currentSeason = computed(() => {
    const q = currentQuarter.value
    if (q === 1) return 'spring'
    if (q === 2) return 'summer'
    if (q === 3) return 'autumn'
    return 'winter'
  })

  // ========== 动作定义 ==========
  function nextWeek() {
    week.value++
    saveGame()
  }

  function updateBudget(amount) {
    budget.value += amount
    saveGame()
  }

  function updateSatisfaction(delta) {
    satisfaction.value = Math.max(0, Math.min(100, satisfaction.value + delta))
    if (satisfaction.value <= 0) {
      gameOver.value = true
    }
    saveGame()
  }

  function addFame(amount) {
    fame.value = Math.max(0, Math.min(100, fame.value + amount))
  }

  function addDebt(amount) {
    debt.value += amount
  }

  function repayDebt(amount) {
    debt.value = Math.max(0, debt.value - amount)
  }

  function updateProgress(delta) {
    progress.value = Math.max(0, Math.min(100, progress.value + delta))
  }

  function setCurrentEvent(event) {
    currentEvent.value = event
  }

  function selectDirection(dir) {
    direction.value = dir
    saveGame()
  }

  function updateDAU(delta) {
    dau.value = Math.max(0, dau.value + delta)
  }

  function updateLTV(delta) {
    ltv.value = Math.max(0.01, ltv.value + delta)
  }

  function updateGMV(delta) {
    gmv.value = Math.max(0, gmv.value + delta)
  }

  function incrementBenchmarkClients() {
    benchmarkClients.value++
  }

  function updateRenewalRate(delta) {
    renewalRate.value = Math.max(0, Math.min(100, renewalRate.value + delta))
  }

  function updateDisputeRate(delta) {
    disputeRate.value = Math.max(0, Math.min(100, disputeRate.value + delta))
  }

  function nextToBPhase() {
    toBPhase.value++
  }

  function saveGame() {
    const state = {
      week: week.value,
      budget: budget.value,
      satisfaction: satisfaction.value,
      progress: progress.value,
      prdVersion: prdVersion.value,
      direction: direction.value,
      fame: fame.value,
      debt: debt.value,
      hcLimit: hcLimit.value,
      dau: dau.value,
      ltv: ltv.value,
      gmv: gmv.value,
      benchmarkClients: benchmarkClients.value,
      renewalRate: renewalRate.value,
      disputeRate: disputeRate.value,
      toBPhase: toBPhase.value,
      currentEventIndex: currentEventIndex.value
    }
    localStorage.setItem('fair_office_game_state', JSON.stringify(state))
  }

  function loadGame() {
    const saved = localStorage.getItem('fair_office_game_state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        week.value = state.week ?? 1
        budget.value = state.budget ?? 100
        satisfaction.value = state.satisfaction ?? 80
        progress.value = state.progress ?? 0
        prdVersion.value = state.prdVersion ?? 'V1.0.0'
        direction.value = state.direction ?? null
        fame.value = state.fame ?? 50
        debt.value = state.debt ?? 0
        hcLimit.value = state.hcLimit ?? 3
        dau.value = state.dau ?? 10
        ltv.value = state.ltv ?? 0.01
        gmv.value = state.gmv ?? 0
        benchmarkClients.value = state.benchmarkClients ?? 0
        renewalRate.value = state.renewalRate ?? 70
        disputeRate.value = state.disputeRate ?? 5
        toBPhase.value = state.toBPhase ?? 0
        currentEventIndex.value = state.currentEventIndex ?? 0
        return true
      } catch (e) {
        console.error('Failed to load game state:', e)
        return false
      }
    }
    return false
  }

  function startNewGame(dir) {
    week.value = 1
    budget.value = 100
    satisfaction.value = 80
    progress.value = 0
    prdVersion.value = 'V1.0.0'
    direction.value = dir
    fame.value = 50
    debt.value = 0
    hcLimit.value = 3
    dau.value = 10
    ltv.value = 0.01
    gmv.value = 0
    benchmarkClients.value = 0
    renewalRate.value = 70
    disputeRate.value = 5
    toBPhase.value = 0
    gameOver.value = false
    showReportModal.value = false
    currentEvent.value = null
    currentEventIndex.value = 0
    saveGame()
  }

  function resetGame() {
    week.value = 1
    budget.value = 100
    satisfaction.value = 80
    progress.value = 0
    prdVersion.value = 'V1.0.0'
    direction.value = null
    fame.value = 50
    debt.value = 0
    hcLimit.value = 3
    dau.value = 10
    ltv.value = 0.01
    gmv.value = 0
    benchmarkClients.value = 0
    renewalRate.value = 70
    disputeRate.value = 5
    toBPhase.value = 0
    gameOver.value = false
    showReportModal.value = false
    currentEvent.value = null
    currentEventIndex.value = 0
    localStorage.removeItem('fair_office_game_state')
  }

  function incrementEventIndex() {
    currentEventIndex.value++
  }
  
  // 新增：检查并解锁HC里程碑
  function checkHCMilestones() {
    const assets = totalAssets.value
    let updated = false
    hcMilestones.value.forEach(milestone => {
      if (!milestone.unlocked && assets >= milestone.asset) {
        milestone.unlocked = true
        hcLimit.value = Math.max(hcLimit.value, milestone.hc)
        updated = true
      }
    })
    if (updated) saveGame()
    return updated
  }
  
  // 新增：应用节假日效果
  function applyHolidayEffects() {
    const holiday = currentHoliday.value
    if (!holiday) return null
    
    const effects = []
    if (holiday.effect.morale) {
      satisfaction.value = Math.min(100, satisfaction.value + holiday.effect.morale)
      effects.push(`士气+${holiday.effect.morale}`)
    }
    if (holiday.effect.cost) {
      budget.value += holiday.effect.cost
      effects.push(`预算${holiday.effect.cost > 0 ? '+' : ''}${holiday.effect.cost}`)
    }
    if (holiday.effect.progress) {
      progress.value = Math.max(0, progress.value + holiday.effect.progress)
      effects.push(`进度${holiday.effect.progress > 0 ? '+' : ''}${holiday.effect.progress}%`)
    }
    return { name: holiday.name, effects }
  }
  
  // 新增：获取动态抽卡成本
  function getDrawCost(rarity = 'R') {
    const baseCosts = { R: 10, SR: 50, SSR: 150 }
    let baseCost = baseCosts[rarity] || baseCosts.R
    
    // 名声系数：1.0 - (名声/200)，最低0.5
    const fameFactor = Math.max(0.5, 1.0 - (fame.value / 200))
    
    // 资金系数：1.0 + (资金/资金阈值)*0.5，最高1.7
    let moneyThreshold
    if (week.value <= 48) moneyThreshold = 50
    else if (week.value <= 96) moneyThreshold = 200
    else moneyThreshold = 500
    const moneyFactor = Math.min(1.7, 1.0 + (budget.value / moneyThreshold) * 0.5)
    
    return Math.ceil(baseCost * fameFactor * moneyFactor)
  }

  // ========== 返回值 ==========
  return {
    // 状态
    week,
    budget,
    satisfaction,
    progress,
    prdVersion,
    gameOver,
    showReportModal,
    currentEvent,
    currentEventIndex,
    direction,
    fame,
    debt,
    hcLimit,
    dau,
    ltv,
    gmv,
    benchmarkClients,
    renewalRate,
    disputeRate,
    toBPhase,

    // 计算属性
    currentQuarter,
    weekInQuarter,
    isGameOver,
    progressPercent,
    fameLevel,
    weeklyEventConfig,
    currentHoliday,
    totalAssets,
    currentSeason,

    // 动作
    nextWeek,
    updateBudget,
    updateSatisfaction,
    addFame,
    addDebt,
    repayDebt,
    updateProgress,
    setCurrentEvent,
    selectDirection,
    updateDAU,
    updateLTV,
    updateGMV,
    incrementBenchmarkClients,
    updateRenewalRate,
    updateDisputeRate,
    nextToBPhase,
    saveGame,
    loadGame,
    resetGame,
    startNewGame,
    incrementEventIndex,
    checkHCMilestones,
    applyHolidayEffects,
    getDrawCost
  }
})
