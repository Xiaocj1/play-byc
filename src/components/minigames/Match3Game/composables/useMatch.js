import { ref } from 'vue'
import { DOC_TYPES } from './useBoard'

const BOARD_SIZE = 16

export function useMatch(boardRef) {
  const combo = ref(0)
  const isChaining = ref(false)
  const lastMatchCount = ref(0)

  function checkMatch(boardToCheck = boardRef.value) {
    const matched = []
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE - 2; j++) {
        const cell1 = boardToCheck[i][j]
        const cell2 = boardToCheck[i][j+1]
        const cell3 = boardToCheck[i][j+2]
        
        if (isMatchable(cell1, cell2, cell3)) {
          matched.push([i, j], [i, j+1], [i, j+2])
          
          if (j + 3 < BOARD_SIZE) {
            const cell4 = boardToCheck[i][j+3]
            if (isMatchable(cell1, cell2, cell4)) {
              matched.push([i, j+3])
              if (j + 4 < BOARD_SIZE) {
                const cell5 = boardToCheck[i][j+4]
                if (isMatchable(cell1, cell2, cell5)) {
                  matched.push([i, j+4])
                }
              }
            }
          }
        }
      }
    }
    
    for (let j = 0; j < BOARD_SIZE; j++) {
      for (let i = 0; i < BOARD_SIZE - 2; i++) {
        const cell1 = boardToCheck[i][j]
        const cell2 = boardToCheck[i+1][j]
        const cell3 = boardToCheck[i+2][j]
        
        if (isMatchable(cell1, cell2, cell3)) {
          matched.push([i, j], [i+1, j], [i+2, j])
          
          if (i + 3 < BOARD_SIZE) {
            const cell4 = boardToCheck[i+3][j]
            if (isMatchable(cell1, cell2, cell4)) {
              matched.push([i+3, j])
              if (i + 4 < BOARD_SIZE) {
                const cell5 = boardToCheck[i+4][j]
                if (isMatchable(cell1, cell2, cell5)) {
                  matched.push([i+4, j])
                }
              }
            }
          }
        }
      }
    }
    
    return [...new Set(matched.map(m => JSON.stringify(m)))].map(s => JSON.parse(s))
  }

  function isMatchable(cell1, cell2, cell3) {
    if (!cell1 || !cell2 || !cell3) return false
    
    const type1 = cell1.type
    const type2 = cell2.type
    const type3 = cell3.type
    
    if (type1 === '灵感' || type2 === '灵感' || type3 === '灵感') {
      const nonInspiration = [type1, type2, type3].filter(t => t !== '灵感')
      if (nonInspiration.length >= 2) {
        const uniqueTypes = [...new Set(nonInspiration)]
        return uniqueTypes.length === 1
      }
      return nonInspiration.length >= 1
    }
    
    return type1 === type2 && type2 === type3
  }

  function executeMatch(matched, config = {}) {
    if (matched.length === 0) return { count: 0, types: {} }
    
    const removedTypes = {}
    const board = boardRef.value
    
    for (const [row, col] of matched) {
      const cell = board[row][col]
      if (cell) {
        removedTypes[cell.type] = (removedTypes[cell.type] || 0) + 1
        board[row][col] = null
      }
    }
    
    lastMatchCount.value = matched.length
    combo.value++
    
    return {
      count: matched.length,
      types: removedTypes,
      combo: combo.value
    }
  }

  function dropAndFill(config = {}) {
    const board = boardRef.value
    let dropped = false
    
    for (let j = 0; j < BOARD_SIZE; j++) {
      let emptyRow = BOARD_SIZE - 1
      
      for (let i = BOARD_SIZE - 1; i >= 0; i--) {
        if (board[i][j] !== null) {
          if (i !== emptyRow) {
            board[emptyRow][j] = board[i][j]
            board[i][j] = null
            dropped = true
          }
          emptyRow--
        }
      }
      
      for (let i = emptyRow; i >= 0; i--) {
        const newType = randomDocType(config)
        const typeMap = {
          'PRD': 'PRD',
          '需求': 'REQUIREMENT',
          '调研': 'RESEARCH',
          'BP': 'BP',
          '代码': 'CODE',
          '灵感': 'INSPIRATION'
        }
        const docType = typeMap[newType] || 'PRD'
        const baseType = DOC_TYPES[docType]
        
        board[i][j] = {
          type: baseType.type,
          icon: baseType.icon,
          color: baseType.color,
          name: baseType.name,
          willDisappear: newType === '调研' && Math.random() < (config?.disappearProbability || 0.3),
          createdTurn: 0,
          id: Math.random().toString(36).substr(2, 9)
        }
        dropped = true
      }
    }
    
    return dropped
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

  async function chainReact(config = {}) {
    isChaining.value = true
    
    let totalRemoved = []
    let totalTypes = {}
    
    try {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      let matched = checkMatch()
      
      while (matched.length > 0) {
        const result = executeMatch(matched, config)
        totalRemoved = [...totalRemoved, ...matched]
        
        for (const [type, count] of Object.entries(result.types)) {
          totalTypes[type] = (totalTypes[type] || 0) + count
        }
        
        await new Promise(resolve => setTimeout(resolve, 300))
        
        dropAndFill(config)
        
        await new Promise(resolve => setTimeout(resolve, 300))
        
        matched = checkMatch()
      }
      
      combo.value = 0
    } finally {
      isChaining.value = false
    }
    
    return {
      totalCount: totalRemoved.length,
      types: totalTypes,
      combo: combo.value
    }
  }

  function getComboMultiplier() {
    if (combo.value >= 10) return 5
    if (combo.value >= 5) return 3
    if (combo.value >= 3) return 2
    return 1
  }

  function resetCombo() {
    combo.value = 0
  }

  return {
    combo,
    isChaining,
    lastMatchCount,
    checkMatch,
    executeMatch,
    dropAndFill,
    chainReact,
    getComboMultiplier,
    resetCombo
  }
}