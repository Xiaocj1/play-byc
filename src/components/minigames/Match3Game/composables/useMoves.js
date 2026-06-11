import { ref, computed } from 'vue'

export function useMoves() {
  const moves = ref(20)
  const totalMoves = ref(20)

  function initMoves(total) {
    totalMoves.value = total
    moves.value = total
  }

  function consumeMove() {
    if (moves.value > 0) {
      moves.value--
      return true
    }
    return false
  }

  function isMovesExhausted() {
    return moves.value <= 0
  }

  function resetMoves() {
    moves.value = totalMoves.value
  }

  function setMoves(newMoves) {
    moves.value = newMoves
  }

  function setTotalMoves(total) {
    totalMoves.value = total
    if (moves.value > total) {
      moves.value = total
    }
  }

  const movesStatus = computed(() => {
    const ratio = moves.value / totalMoves.value
    if (ratio > 0.5) return 'normal'
    if (ratio > 0.25) return 'warning'
    return 'danger'
  })

  return {
    moves,
    totalMoves,
    movesStatus,
    initMoves,
    consumeMove,
    isMovesExhausted,
    resetMoves,
    setMoves,
    setTotalMoves
  }
}