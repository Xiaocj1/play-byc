import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useReportBeautyStore = defineStore('reportBeauty', () => {
  // 状态
  const isActive = ref(false)
  const currentStage = ref(1) // 1=乱糟糟报表, 2=阵营PK, 3=黄金矿工, 4=美容后
  const pkWins = ref(0)
  const pkRound = ref(1)
  const pkMaxRounds = ref(3)
  const minerHooks = ref(0)
  const minerScore = ref(0)
  const beautifiedWords = ref([])
  const badWords = ref([])
  const upgradeLevels = reactive({
    length: 0,
    speed: 0,
    magnetism: 0
  })
  const hasSSRWin = ref(false)
  const isB2Version = ref(false)

  // 黄金矿工游戏状态
  const minerGameState = reactive({
    isPlaying: false,
    timeLeft: 10,
    caughtItems: [],
    currentHookCount: 0
  })

  // 计算属性
  const isPKStage = computed(() => currentStage.value === 2)
  const isMinerStage = computed(() => currentStage.value === 3)
  const isComplete = computed(() => currentStage.value === 4)
  const pkProgressPercent = computed(() => (pkWins.value / pkMaxRounds.value) * 100)
  const remainingHooks = computed(() => minerHooks.value)

  // 动作
  function startBeauty(badWordsList) {
    isActive.value = true
    currentStage.value = 1
    pkWins.value = 0
    pkRound.value = 1
    minerHooks.value = 0
    minerScore.value = 0
    beautifiedWords.value = []
    badWords.value = badWordsList || []
    hasSSRWin.value = false
    minerGameState.isPlaying = false
    minerGameState.timeLeft = 10
    minerGameState.caughtItems = []
  }

  function startPK() {
    currentStage.value = 2
    pkRound.value = 1
  }

  function winPKRound(hookCount) {
    pkWins.value++
    minerHooks.value += hookCount || 1

    if (pkRound.value >= pkMaxRounds.value) {
      startMiner()
    } else {
      pkRound.value++
    }
  }

  function losePKRound() {
    pkRound.value++
    if (pkRound.value > pkMaxRounds.value) {
      startMiner()
    }
  }

  function startMiner() {
    currentStage.value = 3
    minerGameState.isPlaying = true
    minerGameState.timeLeft = isB2Version.value ? 15 : 10
    
    // 确保至少有1个钩子
    minerGameState.currentHookCount = Math.max(1, minerHooks.value)
    
    // 如果确实没有钩子（minerHooks为0），直接进入美容后阶段
    if (minerHooks.value <= 0) {
      finishMiner()
    }
  }

  function onMinerBeautify(wordData) {
    beautifiedWords.value.push(wordData)
    minerScore.value += wordData.score || 10
  }

  function onMinerCaughtItem(item) {
    minerGameState.caughtItems.push(item)

    if (item.type === 'bomb') {
      // 审计炸弹，结束矿工阶段
      finishMiner()
      return
    }

    if (item.type === 'hook_used') {
      // 钩子使用完毕
      minerGameState.currentHookCount--
      
      if (minerGameState.currentHookCount <= 0) {
        finishMiner()
      } else {
        // 继续下一轮
        minerGameState.timeLeft = isB2Version.value ? 15 : 10
      }
    }
  }

  function upgradeHook(type) {
    if (upgradeLevels[type] !== undefined && upgradeLevels[type] < 10) {
      upgradeLevels[type]++
      return true
    }
    return false
  }

  function finishMiner() {
    currentStage.value = 4
    minerGameState.isPlaying = false
    // 确保数据初始化
    if (!beautifiedWords.value) beautifiedWords.value = []
    if (!minerScore.value) minerScore.value = 0
  }

  function submitBeautifulReport() {
    isActive.value = false
    const satisfactionBonus = Math.min(30, beautifiedWords.value.length * 5)
    return {
      score: minerScore.value,
      satisfactionBonus,
      beautifiedWords: beautifiedWords.value
    }
  }

  function reset() {
    isActive.value = false
    currentStage.value = 1
    pkWins.value = 0
    pkRound.value = 1
    minerHooks.value = 0
    minerScore.value = 0
    beautifiedWords.value = []
    badWords.value = []
    minerGameState.isPlaying = false
    minerGameState.timeLeft = 10
    minerGameState.caughtItems = []
  }

  return {
    // 状态
    isActive,
    currentStage,
    pkWins,
    pkRound,
    pkMaxRounds,
    minerHooks,
    minerScore,
    beautifiedWords,
    badWords,
    upgradeLevels,
    hasSSRWin,
    isB2Version,
    minerGameState,

    // 计算属性
    isPKStage,
    isMinerStage,
    isComplete,
    pkProgressPercent,
    remainingHooks,

    // 动作
    startBeauty,
    startPK,
    winPKRound,
    losePKRound,
    startMiner,
    onMinerBeautify,
    onMinerCaughtItem,
    upgradeHook,
    finishMiner,
    submitBeautifulReport,
    reset
  }
})
