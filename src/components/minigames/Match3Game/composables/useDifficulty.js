import { ref, reactive } from 'vue'

export function useDifficulty() {
  const config = reactive({
    prdProbability: 0.4,
    researchProbability: 0.15,
    bpProbability: 0.1,
    requirementProbability: 0.15,
    inspirationProbability: 0.05,
    disappearProbability: 0.3,
    totalMoves: 50,
    targetCount: 20,
    overachieveBonusProbability: 0.1
  })

  const playerStats = reactive({
    recentGames: [],
    averageCompletion: 0,
    winStreak: 0,
    totalGames: 0
  })

  function calcDifficultyParams(stats = playerStats) {
    const baseParams = { ...config }
    
    if (stats.winStreak >= 3) {
      baseParams.prdProbability = Math.max(0.1, baseParams.prdProbability - 0.05)
      baseParams.totalMoves = Math.max(10, baseParams.totalMoves - 2)
      baseParams.disappearProbability = Math.min(0.9, baseParams.disappearProbability + 0.05)
    }
    
    const recentLosses = stats.recentGames.filter(g => !g.success).length
    if (recentLosses >= 3) {
      baseParams.prdProbability = Math.min(0.8, baseParams.prdProbability + 0.05)
      baseParams.totalMoves = Math.min(50, baseParams.totalMoves + 2)
      baseParams.disappearProbability = Math.max(0.1, baseParams.disappearProbability - 0.05)
    }
    
    return baseParams
  }

  function adjustDifficulty(stats = playerStats) {
    const params = calcDifficultyParams(stats)
    
    Object.assign(config, params)
    
    return config
  }

  function recordGameResult(success, completion) {
    playerStats.recentGames.push({ success, completion })
    
    if (playerStats.recentGames.length > 10) {
      playerStats.recentGames.shift()
    }
    
    playerStats.totalGames++
    
    if (success) {
      playerStats.winStreak++
    } else {
      playerStats.winStreak = 0
    }
    
    const totalCompletion = playerStats.recentGames.reduce((sum, g) => sum + g.completion, 0)
    playerStats.averageCompletion = totalCompletion / playerStats.recentGames.length
    
    adjustDifficulty()
  }

  function setConfig(newConfig) {
    Object.assign(config, newConfig)
  }

  function getConfig() {
    return { ...config }
  }

  function resetConfig() {
    config.prdProbability = 0.4
    config.researchProbability = 0.15
    config.bpProbability = 0.1
    config.requirementProbability = 0.15
    config.inspirationProbability = 0.05
    config.disappearProbability = 0.3
    config.totalMoves = 50
    config.targetCount = 20
    config.overachieveBonusProbability = 0.1
  }

  function resetPlayerStats() {
    playerStats.recentGames = []
    playerStats.averageCompletion = 0
    playerStats.winStreak = 0
    playerStats.totalGames = 0
  }

  return {
    config,
    playerStats,
    calcDifficultyParams,
    adjustDifficulty,
    recordGameResult,
    setConfig,
    getConfig,
    resetConfig,
    resetPlayerStats
  }
}