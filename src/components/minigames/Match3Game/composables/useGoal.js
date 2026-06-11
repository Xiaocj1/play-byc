import { ref, computed } from 'vue'

export function useGoal() {
  const targetType = ref('PRD')
  const targetCount = ref(5)
  const currentCount = ref(0)
  const isCompleted = ref(false)
  const overachieveBonus = ref(false)

  function initGoal(config) {
    targetType.value = config.targetType || 'PRD'
    targetCount.value = config.targetCount || 5
    currentCount.value = 0
    isCompleted.value = false
    overachieveBonus.value = false
  }

  function addProgress(type, count) {
    if (type === targetType.value) {
      currentCount.value += count
      if (currentCount.value >= targetCount.value && !isCompleted.value) {
        isCompleted.value = true
        
        const overachieveAmount = currentCount.value - targetCount.value
        if (overachieveAmount > 0) {
          const bonusProb = 0.1
          if (Math.random() < bonusProb) {
            overachieveBonus.value = true
          }
        }
      }
    }
  }

  function getProgress() {
    return {
      current: currentCount.value,
      target: targetCount.value,
      percentage: Math.min((currentCount.value / targetCount.value) * 100, 100)
    }
  }

  function canRetry() {
    const progress = getProgress()
    return progress.percentage >= 80 && !isCompleted.value
  }

  function isSuccess() {
    return isCompleted.value
  }

  function resetProgress() {
    currentCount.value = 0
    isCompleted.value = false
    overachieveBonus.value = false
  }

  const completionRatio = computed(() => {
    return currentCount.value / targetCount.value
  })

  return {
    targetType,
    targetCount,
    currentCount,
    isCompleted,
    overachieveBonus,
    completionRatio,
    initGoal,
    addProgress,
    getProgress,
    canRetry,
    isSuccess,
    resetProgress
  }
}