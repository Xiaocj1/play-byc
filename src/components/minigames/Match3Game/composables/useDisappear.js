import { ref } from 'vue'

const BOARD_SIZE = 16

export function useDisappear(boardRef) {
  const disappearingCells = ref([])
  const disappearMessages = ref([])

  const DISAPPEAR_MESSAGES = [
    { title: '用户调研已失效', desc: '原因：用户说不清楚需求', sub: '（其实是产品经理没听懂）' },
    { title: '调研过期了', desc: '用户已经忘记自己说过什么', sub: '' },
    { title: '数据过期', desc: '市场已经变了', sub: '调研白做了' }
  ]

  function checkDisappear(turn, config = {}) {
    const board = boardRef.value
    const toDisappear = []
    const probability = config?.disappearProbability || 0.3

    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = board[i][j]
        if (cell && cell.type === '调研' && cell.willDisappear) {
          if (Math.random() < probability) {
            toDisappear.push({ row: i, col: j })
          }
        }
      }
    }

    return toDisappear
  }

  function executeDisappear(cells) {
    const board = boardRef.value
    
    for (const { row, col } of cells) {
      board[row][col] = null
    }

    if (cells.length > 0) {
      const message = DISAPPEAR_MESSAGES[Math.floor(Math.random() * DISAPPEAR_MESSAGES.length)]
      const msgId = Date.now()
      disappearMessages.value.push({ ...message, id: msgId })
      
      setTimeout(() => {
        disappearMessages.value = disappearMessages.value.filter(m => m.id !== msgId)
      }, 1500)
    }

    dropAfterDisappear()
    
    return cells.length
  }

  function dropAfterDisappear() {
    const board = boardRef.value
    
    for (let j = 0; j < BOARD_SIZE; j++) {
      let emptyRow = BOARD_SIZE - 1
      
      for (let i = BOARD_SIZE - 1; i >= 0; i--) {
        if (board[i][j] !== null) {
          if (i !== emptyRow) {
            board[emptyRow][j] = board[i][j]
            board[i][j] = null
          }
          emptyRow--
        }
      }
    }
  }

  function fillEmptyCells(config = {}) {
    const board = boardRef.value
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[i][j] === null) {
          const rand = Math.random()
          const prdProb = config?.prdProbability || 0.4
          const researchProb = config?.researchProbability || 0.2
          const bpProb = config?.bpProbability || 0.15
          const requirementProb = config?.requirementProbability || 0.2
          const inspirationProb = config?.inspirationProbability || 0.05

          let type = 'PRD'
          if (rand < prdProb) type = 'PRD'
          else if (rand < prdProb + requirementProb) type = '需求'
          else if (rand < prdProb + requirementProb + researchProb) type = '调研'
          else if (rand < prdProb + requirementProb + researchProb + bpProb) type = 'BP'
          else if (rand < prdProb + requirementProb + researchProb + bpProb + inspirationProb) type = '灵感'

          const typeMap = {
            'PRD': 'PRD',
            '需求': 'REQUIREMENT',
            '调研': 'RESEARCH',
            'BP': 'BP',
            '代码': 'CODE',
            '灵感': 'INSPIRATION'
          }
          const docType = typeMap[type] || 'PRD'
          const baseType = getDocType(docType)
          
          board[i][j] = {
            type: baseType.type,
            icon: baseType.icon,
            color: baseType.color,
            name: baseType.name,
            willDisappear: type === '调研' && Math.random() < (config?.disappearProbability || 0.3),
            createdTurn: 0,
            id: Math.random().toString(36).substr(2, 9)
          }
        }
      }
    }
  }

  function getDocType(docType) {
    const types = {
      'PRD': { type: 'PRD', icon: '📄', color: '#3B82F6', name: 'PRD' },
      'REQUIREMENT': { type: '需求', icon: '📋', color: '#6B7280', name: '需求文档' },
      'RESEARCH': { type: '调研', icon: '🔍', color: '#10B981', name: '用户调研' },
      'BP': { type: 'BP', icon: '📊', color: '#F59E0B', name: 'BP' },
      'CODE': { type: '代码', icon: '💥', color: '#EF4444', name: '祖传代码' },
      'INSPIRATION': { type: '灵感', icon: '✨', color: '#A855F7', name: '灵感' }
    }
    return types[docType] || types['PRD']
  }

  function getIcon(type) {
    const icons = {
      'PRD': '📄',
      '需求': '📋',
      '调研': '🔍',
      'BP': '📊',
      '代码': '💥',
      '灵感': '✨'
    }
    return icons[type] || '📄'
  }

  function getColor(type) {
    const colors = {
      'PRD': '#3B82F6',
      '需求': '#6B7280',
      '调研': '#10B981',
      'BP': '#F59E0B',
      '代码': '#EF4444',
      '灵感': '#A855F7'
    }
    return colors[type] || '#3B82F6'
  }

  function getName(type) {
    const names = {
      'PRD': 'PRD',
      '需求': '需求文档',
      '调研': '用户调研',
      'BP': 'BP',
      '代码': '祖传代码',
      '灵感': '灵感'
    }
    return names[type] || '文档'
  }

  function getDisappearingCells() {
    const board = boardRef.value
    const cells = []
    
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        const cell = board[i][j]
        if (cell && cell.type === '调研' && cell.willDisappear) {
          cells.push({ row: i, col: j })
        }
      }
    }
    
    return cells
  }

  return {
    disappearingCells,
    disappearMessages,
    checkDisappear,
    executeDisappear,
    fillEmptyCells,
    getDisappearingCells
  }
}