import { ref } from 'vue'

export const DOC_TYPES = {
  PRD: { type: 'PRD', icon: '📄', color: '#3B82F6', name: 'PRD' },
  REQUIREMENT: { type: '需求', icon: '📋', color: '#6B7280', name: '需求文档' },
  RESEARCH: { type: '调研', icon: '🔍', color: '#10B981', name: '用户调研' },
  BP: { type: 'BP', icon: '📊', color: '#F59E0B', name: 'BP' },
  CODE: { type: '代码', icon: '💥', color: '#EF4444', name: '祖传代码' },
  INSPIRATION: { type: '灵感', icon: '✨', color: '#A855F7', name: '灵感' }
}

const BOARD_SIZE = 16

export function useBoard() {
  const board = ref([])
  const selectedCell = ref(null)
  const isAnimating = ref(false)

  function createCell(type, config) {
    const typeMap = {
      'PRD': 'PRD',
      '需求': 'REQUIREMENT',
      '调研': 'RESEARCH',
      'BP': 'BP',
      '代码': 'CODE',
      '灵感': 'INSPIRATION'
    }
    const docType = typeMap[type] || 'PRD'
    const baseType = DOC_TYPES[docType]
    
    return {
      type: baseType.type,
      icon: baseType.icon,
      color: baseType.color,
      name: baseType.name,
      willDisappear: type === '调研' && Math.random() < (config?.disappearProbability || 0.3),
      createdTurn: 0,
      id: Math.random().toString(36).substr(2, 9)
    }
  }

  function randomDocType(config) {
    const rand = Math.random()
    const prdProb = config?.prdProbability || 0.4
    const researchProb = config?.researchProbability || 0.2
    const bpProb = config?.bpProbability || 0.15
    const requirementProb = config?.requirementProbability || 0.2
    const inspirationProb = config?.inspirationProbability || 0.05

    if (rand < prdProb) return 'PRD'
    if (rand < prdProb + requirementProb) return '需求'
    if (rand < prdProb + requirementProb + researchProb) return '调研'
    if (rand < prdProb + requirementProb + researchProb + bpProb) return 'BP'
    if (rand < prdProb + requirementProb + researchProb + bpProb + inspirationProb) return '灵感'
    return 'PRD'
  }

  function initBoard(config = {}) {
    const newBoard = []
    for (let i = 0; i < BOARD_SIZE; i++) {
      newBoard[i] = []
      for (let j = 0; j < BOARD_SIZE; j++) {
        let cell = createCell(randomDocType(config), config)
        cell.createdTurn = 0
        newBoard[i][j] = cell
      }
    }
    
    // 限制重试次数，避免无限循环
    let retries = 0
    const maxRetries = 100
    while (hasInitialMatches(newBoard) && retries < maxRetries) {
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          newBoard[i][j] = createCell(randomDocType(config), config)
          newBoard[i][j].createdTurn = 0
        }
      }
      retries++
    }
    
    board.value = newBoard
    selectedCell.value = null
    isAnimating.value = false
    return board.value
  }

  function hasInitialMatches(boardToCheck) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 2; j++) {
        if (boardToCheck[i][j]?.type && 
            boardToCheck[i][j].type === boardToCheck[i][j+1]?.type && 
            boardToCheck[i][j].type === boardToCheck[i][j+2]?.type) {
          return true
        }
      }
    }
    for (let i = 0; i < BOARD_SIZE - 2; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (boardToCheck[i][j]?.type && 
            boardToCheck[i][j].type === boardToCheck[i+1][j]?.type && 
            boardToCheck[i][j].type === boardToCheck[i+2][j]?.type) {
          return true
        }
      }
    }
    return false
  }

  function swapCells(row1, col1, row2, col2) {
    const temp = board.value[row1][col1]
    board.value[row1][col1] = board.value[row2][col2]
    board.value[row2][col2] = temp
  }

  function selectCell(row, col) {
    if (isAnimating.value) return false
    
    if (!selectedCell.value) {
      selectedCell.value = { row, col }
      return true
    }
    
    const { row: prevRow, col: prevCol } = selectedCell.value
    
    if ((Math.abs(row - prevRow) === 1 && col === prevCol) || 
        (Math.abs(col - prevCol) === 1 && row === prevRow)) {
      swapCells(prevRow, prevCol, row, col)
      selectedCell.value = null
      return true
    }
    
    selectedCell.value = { row, col }
    return true
  }

  function checkDeadLock() {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (i < BOARD_SIZE - 1) {
          swapCells(i, j, i + 1, j)
          if (hasAnyMatch(board.value)) {
            swapCells(i, j, i + 1, j)
            return false
          }
          swapCells(i, j, i + 1, j)
        }
        if (j < BOARD_SIZE - 1) {
          swapCells(i, j, i, j + 1)
          if (hasAnyMatch(board.value)) {
            swapCells(i, j, i, j + 1)
            return false
          }
          swapCells(i, j, i, j + 1)
        }
      }
    }
    return true
  }

  function hasAnyMatch(boardToCheck) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 2; j++) {
        if (boardToCheck[i][j]?.type && 
            boardToCheck[i][j].type === boardToCheck[i][j+1]?.type && 
            boardToCheck[i][j].type === boardToCheck[i][j+2]?.type) {
          return true
        }
      }
    }
    for (let i = 0; i < BOARD_SIZE - 2; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (boardToCheck[i][j]?.type && 
            boardToCheck[i][j].type === boardToCheck[i+1][j]?.type && 
            boardToCheck[i][j].type === boardToCheck[i+2][j]?.type) {
          return true
        }
      }
    }
    return false
  }

  function reshuffle(config = {}) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        board.value[i][j] = createCell(randomDocType(config), config)
        board.value[i][j].createdTurn = 0
      }
    }
    
    while (hasInitialMatches(board.value)) {
      for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
          board.value[i][j] = createCell(randomDocType(config), config)
          board.value[i][j].createdTurn = 0
        }
      }
    }
  }

  function setAnimating(value) {
    isAnimating.value = value
  }

  return {
    board,
    selectedCell,
    isAnimating,
    initBoard,
    selectCell,
    swapCells,
    checkDeadLock,
    reshuffle,
    setAnimating,
    BOARD_SIZE
  }
}