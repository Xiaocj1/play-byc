import { ref, reactive } from 'vue'

export function useDebug(gameConfig) {
  const isDebugPanelOpen = ref(false)
  const debugConfig = reactive({
    prdProbability: 0.4,
    researchDisappearProbability: 0.3,
    totalMoves: 20,
    targetCount: 5,
    inspirationProbability: 0.05,
    overachieveBonusProbability: 0.1
  })

  function openDebugPanel() {
    isDebugPanelOpen.value = true
  }

  function closeDebugPanel() {
    isDebugPanelOpen.value = false
  }

  function toggleDebugPanel() {
    isDebugPanelOpen.value = !isDebugPanelOpen.value
  }

  function applyConfig() {
    if (gameConfig) {
      gameConfig.prdProbability = debugConfig.prdProbability
      gameConfig.disappearProbability = debugConfig.researchDisappearProbability
      gameConfig.totalMoves = debugConfig.totalMoves
      gameConfig.targetCount = debugConfig.targetCount
      gameConfig.inspirationProbability = debugConfig.inspirationProbability
      gameConfig.overachieveBonusProbability = debugConfig.overachieveBonusProbability
    }
    
    saveConfigToStorage()
  }

  function resetConfig() {
    debugConfig.prdProbability = 0.4
    debugConfig.researchDisappearProbability = 0.3
    debugConfig.totalMoves = 20
    debugConfig.targetCount = 5
    debugConfig.inspirationProbability = 0.05
    debugConfig.overachieveBonusProbability = 0.1
    
    applyConfig()
  }

  function saveConfigToStorage() {
    localStorage.setItem('match3_debug_config', JSON.stringify(debugConfig))
  }

  function loadConfigFromStorage() {
    const saved = localStorage.getItem('match3_debug_config')
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved)
        Object.assign(debugConfig, savedConfig)
      } catch (e) {
        console.error('Failed to load debug config:', e)
      }
    }
  }

  function simulateGames(n = 1000) {
    const results = {
      extremeCompletion: 0,
      almost: 0,
      overachieve: 0,
      noRetry: 0
    }

    for (let i = 0; i < n; i++) {
      const completion = Math.random()
      
      if (completion >= 0.95) {
        results.extremeCompletion++
      } else if (completion >= 0.9) {
        results.almost++
      } else if (completion >= 0.8) {
        if (Math.random() < 0.5) {
          results.overachieve++
        } else {
          results.extremeCompletion++
        }
      } else if (completion >= 0.6) {
        results.almost++
      } else {
        results.noRetry++
      }
    }

    return {
      extremeCompletion: Math.round((results.extremeCompletion / n) * 100),
      almost: Math.round((results.almost / n) * 100),
      overachieve: Math.round((results.overachieve / n) * 100),
      noRetry: Math.round((results.noRetry / n) * 100),
      totalSimulated: n
    }
  }

  function getStats() {
    return {
      extremeCompletion: 65,
      almost: 10,
      overachieve: 10,
      noRetry: 15
    }
  }

  loadConfigFromStorage()

  return {
    isDebugPanelOpen,
    debugConfig,
    openDebugPanel,
    closeDebugPanel,
    toggleDebugPanel,
    applyConfig,
    resetConfig,
    simulateGames,
    getStats
  }
}