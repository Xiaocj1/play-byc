import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  // 状态
  const projectExperience = ref(0)
  const currentRank = ref('p5')
  const ranks = ref([
    { id: 'p5', name: '初级产品经理', requiredExp: 0 },
    { id: 'p4', name: '产品经理', requiredExp: 50 },
    { id: 'p3', name: '高级产品经理', requiredExp: 150 },
    { id: 'p2', name: '产品专家', requiredExp: 350 },
    { id: 'p1', name: '产品总监', requiredExp: 700 }
  ])

  // 计算属性
  const currentRankData = computed(() => 
    ranks.value.find(r => r.id === currentRank.value)
  )

  const nextRank = computed(() => {
    const currentIndex = ranks.value.findIndex(r => r.id === currentRank.value)
    return ranks.value[currentIndex + 1] || null
  })

  const progressToNextRank = computed(() => {
    if (!nextRank.value) return 100
    const currentExp = projectExperience.value - (currentRankData.value?.requiredExp || 0)
    const neededExp = nextRank.value.requiredExp - (currentRankData.value?.requiredExp || 0)
    return Math.min(100, Math.max(0, (currentExp / neededExp) * 100))
  })

  // 动作
  function addExperience(exp) {
    projectExperience.value += exp
    checkRankUp()
    savePlayer()
  }

  function checkRankUp() {
    const next = nextRank.value
    if (next && projectExperience.value >= next.requiredExp) {
      currentRank.value = next.id
      return true
    }
    return false
  }

  function savePlayer() {
    const state = {
      projectExperience: projectExperience.value,
      currentRank: currentRank.value
    }
    localStorage.setItem('fair_office_player_state', JSON.stringify(state))
  }

  function loadPlayer() {
    const saved = localStorage.getItem('fair_office_player_state')
    if (saved) {
      try {
        const state = JSON.parse(saved)
        projectExperience.value = state.projectExperience ?? 0
        currentRank.value = state.currentRank ?? 'p5'
        return true
      } catch (e) {
        console.error('Failed to load player state:', e)
      }
    }
    return false
  }

  function resetPlayer() {
    projectExperience.value = 0
    currentRank.value = 'p5'
    localStorage.removeItem('fair_office_player_state')
  }

  return {
    projectExperience,
    currentRank,
    ranks,
    currentRankData,
    nextRank,
    progressToNextRank,
    addExperience,
    checkRankUp,
    savePlayer,
    loadPlayer,
    resetPlayer
  }
})
