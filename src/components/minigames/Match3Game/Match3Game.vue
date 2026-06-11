<template>
  <div class="match3-game">
    <h2>📄 文档消消乐</h2>
    
    <div class="game-info">
      <div class="moves">剩余步数: {{ moves }}</div>
      <div class="goal">消除: {{ current }}/{{ target }} 个 📄PRD</div>
    </div>
    
    <div class="board">
      <div v-for="(row, i) in board" :key="i" class="row">
        <div 
          v-for="(cell, j) in row" 
          :key="`${i}-${j}`"
          class="cell"
          :class="{ 
            selected: isSelected(i, j),
            frozen: cell?.frozen,
            blocked: cell?.blocked
          }"
          :style="{ backgroundColor: cell?.color + '30' }"
          @click="handleClick(i, j)"
        >
          <span class="icon">{{ cell?.icon }}</span>
          <span v-if="cell?.frozen" class="frost">🧊</span>
          <span v-if="cell?.blocked" class="block">🔒</span>
          <span v-if="cell?.willDisappear && !cell?.frozen" class="warning">⏳</span>
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button @click="resetGame">重新开始</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const BOARD_SIZE = 8
const MIN_TARGET = 5
const MAX_TARGET = 12
const TOTAL_MOVES = 25

// 图标配置
const ICONS = [
  { type: 'PRD', icon: '📄', color: '#3B82F6', name: 'PRD' },
  { type: '需求', icon: '📋', color: '#6B7280', name: '需求' },
  { type: '调研', icon: '🔍', color: '#10B981', name: '调研' },
  { type: 'BP', icon: '📊', color: '#F59E0B', name: 'BP' },
  { type: '灵感', icon: '✨', color: '#A855F7', name: '灵感' }
]

// 游戏状态
const board = ref([])
const moves = ref(TOTAL_MOVES)
const current = ref(0)
const target = ref(MIN_TARGET)
const selectedRow = ref(null)
const selectedCol = ref(null)
const frozenCount = ref(0)
const isAnimating = ref(false)

// 初始化棋盘
function initBoard() {
  // 随机生成目标数量（5-12个PRD）
  target.value = Math.floor(Math.random() * (MAX_TARGET - MIN_TARGET + 1)) + MIN_TARGET
  
  const newBoard = []
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    newBoard[i] = []
    for (let j = 0; j < BOARD_SIZE; j++) {
      const iconData = getRandomIcon()
      newBoard[i][j] = {
        ...iconData,
        frozen: false,
        blocked: false,
        willDisappear: false
      }
    }
  }
  
  // 移除初始匹配
  let retries = 0
  while (hasMatches(newBoard) && retries < 50) {
    for (let i = 0; i < BOARD_SIZE; i++) {
      for (let j = 0; j < BOARD_SIZE; j++) {
        newBoard[i][j] = { ...getRandomIcon(), frozen: false, blocked: false, willDisappear: false }
      }
    }
    retries++
  }
  
  // 添加冰冻格子（开心消消乐冰块机制）
  const frozenPositions = generateFrozens()
  for (const [r, c] of frozenPositions) {
    newBoard[r][c].frozen = true
    newBoard[r][c].icon = '🧊'
  }
  
  board.value = newBoard
  frozenCount.value = frozenPositions.length
}

function getRandomIcon() {
  const rand = Math.random()
  if (rand < 0.4) return { ...ICONS[0] } // PRD 40%
  if (rand < 0.6) return { ...ICONS[1] } // 需求 20%
  if (rand < 0.75) return { ...ICONS[2] } // 调研 15%
  if (rand < 0.9) return { ...ICONS[3] } // BP 15%
  return { ...ICONS[4] } // 灵感 10%
}

function generateFrozens() {
  const positions = []
  const count = Math.floor(BOARD_SIZE * BOARD_SIZE * 0.15) // 15%冰冻率
  
  // 在底部区域生成冰块（像开心消消乐的蜂蜜/冰块在底部）
  for (let i = 0; i < count; i++) {
    const row = Math.floor(Math.random() * 4) + BOARD_SIZE - 4 // 底部4行
    const col = Math.floor(Math.random() * BOARD_SIZE)
    positions.push([row, col])
  }
  
  return positions
}

function hasMatches(boardToCheck) {
  // 检查横向匹配
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE - 2; j++) {
      if (boardToCheck[i][j]?.type && 
          boardToCheck[i][j].type === boardToCheck[i][j+1]?.type &&
          boardToCheck[i][j].type === boardToCheck[i][j+2]?.type) {
        return true
      }
    }
  }
  // 检查纵向匹配
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

function isSelected(row, col) {
  return selectedRow.value === row && selectedCol.value === col
}

function handleClick(row, col) {
  if (isAnimating.value) return
  if (moves.value <= 0) return
  
  const cell = board.value[row][col]
  if (cell?.frozen || cell?.blocked) {
    // 冰冻/阻挡格子不能移动
    return
  }
  
  if (selectedRow.value === null) {
    selectedRow.value = row
    selectedCol.value = col
    return
  }
  
  if (selectedRow.value === row && selectedCol.value === col) {
    selectedRow.value = null
    selectedCol.value = null
    return
  }
  
  // 检查是否相邻
  const rowDiff = Math.abs(row - selectedRow.value)
  const colDiff = Math.abs(col - selectedCol.value)
  const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)
  
  if (isAdjacent) {
    // 检查目标格子是否被冰冻
    const targetCell = board.value[row][col]
    if (targetCell?.frozen || targetCell?.blocked) {
      selectedRow.value = row
      selectedCol.value = col
      return
    }
    
    isAnimating.value = true
    
    // 交换
    const temp = { ...board.value[selectedRow.value][selectedCol.value] }
    board.value[selectedRow.value][selectedCol.value] = { ...board.value[row][col] }
    board.value[row][col] = temp
    
    const matched = findMatches()
    
    if (matched.length >= 3) {
      moves.value--
      isAnimating.value = true
      
      // 执行连锁消除（直到没有新匹配）
      cascadeMatches(matched)
      
      selectedRow.value = null
      selectedCol.value = null
    } else {
      // 不匹配，换回来且不扣步数
      setTimeout(() => {
        const temp2 = { ...board.value[selectedRow.value][selectedCol.value] }
        board.value[selectedRow.value][selectedCol.value] = { ...board.value[row][col] }
        board.value[row][col] = temp2
        
        isAnimating.value = false
        selectedRow.value = null
        selectedCol.value = null
      }, 200)
    }
  } else {
    selectedRow.value = row
    selectedCol.value = col
  }
}

// 连锁消除 - 递归直到没有新匹配，逐个显示更爽
async function cascadeMatches(matched) {
  // 统计本次消除的PRD数量
  let prdCount = 0
  for (const { row, col } of matched) {
    if (board.value[row][col]?.type === 'PRD') {
      prdCount++
    }
  }
  current.value += prdCount
  
  // 逐个消除，增加视觉快感
  for (let i = 0; i < matched.length; i++) {
    const { row, col } = matched[i]
    board.value[row][col] = null
    await new Promise(resolve => setTimeout(resolve, 50)) // 逐个消失
  }
  
  await new Promise(resolve => setTimeout(resolve, 100))
  
  // 掉落
  dropCells()
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // 填充新块（考虑难度）
  fillNewCells()
  await new Promise(resolve => setTimeout(resolve, 150))
  
  // 检查是否有新匹配（连锁）
  const newMatches = findMatches()
  if (newMatches.length >= 3) {
    // 继续连锁，带一点延迟
    await new Promise(resolve => setTimeout(resolve, 200))
    cascadeMatches(newMatches)
  } else {
    // 连锁结束，检查游戏是否结束
    checkGameEnd()
    isAnimating.value = false
  }
}

function findMatches() {
  const matched = new Set()
  
  // 横向匹配
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE - 2; j++) {
      const t1 = board.value[i][j]?.type
      const t2 = board.value[i][j+1]?.type
      const t3 = board.value[i][j+2]?.type
      if (t1 && t1 === t2 && t2 === t3) {
        matched.add(`${i},${j}`)
        matched.add(`${i},${j+1}`)
        matched.add(`${i},${j+2}`)
      }
    }
  }
  
  // 纵向匹配
  for (let i = 0; i < BOARD_SIZE - 2; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const t1 = board.value[i][j]?.type
      const t2 = board.value[i+1][j]?.type
      const t3 = board.value[i+2][j]?.type
      if (t1 && t1 === t2 && t2 === t3) {
        matched.add(`${i},${j}`)
        matched.add(`${i+1},${j}`)
        matched.add(`${i+2},${j}`)
      }
    }
  }
  
  return Array.from(matched).map(s => {
    const [r, c] = s.split(',').map(Number)
    return { row: r, col: c }
  })
}

function executeMatches(matched) {
  let prdCount = 0
  
  for (const { row, col } of matched) {
    const cell = board.value[row][col]
    if (cell?.type === 'PRD') {
      prdCount++
    }
    board.value[row][col] = null
  }
  
  current.value += prdCount
  
  // 掉落
  dropCells()
  
  // 填充新格子
  fillNewCells()
  
  // 返回结果，不自动连锁
  return { prdCount }
}

function checkGameEnd() {
  // 检查胜利
  if (current.value >= target.value) {
    setTimeout(() => {
      alert('🎉 成功！进度+10，满意度+5')
      resetGame()
    }, 300)
  } else if (moves.value <= 0) {
    setTimeout(() => {
      alert(`😢 失败... 进度+2，满意度-10\n你消除了 ${current.value} 个PRD，目标是 ${target.value} 个`)
      resetGame()
    }, 300)
  }
}

function dropCells() {
  for (let j = 0; j < BOARD_SIZE; j++) {
    let emptyRow = BOARD_SIZE - 1
    
    for (let i = BOARD_SIZE - 1; i >= 0; i--) {
      if (board.value[i][j] !== null) {
        if (i !== emptyRow) {
          board.value[emptyRow][j] = { ...board.value[i][j] }
          board.value[i][j] = null
        }
        emptyRow--
      }
    }
  }
}

function fillNewCells() {
  // 计算当前棋盘的PRD比例
  const prdRatio = calculatePrdRatio()
  const targetPrdRatio = 0.4 // 目标PRD比例40%
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board.value[i][j] === null) {
        const iconData = getSmartIcon(prdRatio, targetPrdRatio)
        board.value[i][j] = {
          ...iconData,
          frozen: false,
          blocked: false,
          willDisappear: false
        }
      }
    }
  }
}

function calculatePrdRatio() {
  let total = 0
  let prdCount = 0
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board.value[i][j] !== null) {
        total++
        if (board.value[i][j].type === 'PRD') {
          prdCount++
        }
      }
    }
  }
  
  return total > 0 ? prdCount / total : 0
}

function getSmartIcon(currentPrdRatio, targetRatio) {
  // 如果当前PRD比例低于目标，提高PRD概率
  const prdBonus = currentPrdRatio < targetRatio ? 0.2 : 0
  
  const rand = Math.random()
  const prdChance = 0.4 + prdBonus
  
  if (rand < prdChance) return { ...ICONS[0] } // PRD
  if (rand < prdChance + 0.2) return { ...ICONS[1] } // 需求
  if (rand < prdChance + 0.35) return { ...ICONS[2] } // 调研
  if (rand < prdChance + 0.5) return { ...ICONS[3] } // BP
  return { ...ICONS[4] } // 灵感
}

function resetGame() {
  moves.value = TOTAL_MOVES
  current.value = 0
  selectedRow.value = null
  selectedCol.value = null
  isAnimating.value = false
  initBoard()
}

// 组件创建时就初始化
initBoard()
</script>

<style scoped>
.match3-game {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
  padding: 20px;
  color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

.game-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px 20px;
  background: rgba(0,0,0,0.3);
  border-radius: 8px;
  font-weight: bold;
}

.board {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0 auto;
  padding: 10px;
  background: rgba(0,0,0,0.3);
  border-radius: 12px;
  width: fit-content;
}

.row {
  display: flex;
  gap: 2px;
}

.cell {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
  font-size: 24px;
}

.cell:hover {
  transform: scale(1.1);
}

.cell.selected {
  border: 3px solid #FBBF24;
  box-shadow: 0 0 15px rgba(251, 191, 36, 0.8);
  transform: scale(1.1);
  z-index: 10;
}

.cell.frozen {
  background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%) !important;
  cursor: not-allowed;
}

.cell.frozen .icon {
  opacity: 0.3;
}

.frost {
  position: absolute;
  font-size: 20px;
  top: -5px;
  right: -5px;
}

.block {
  position: absolute;
  font-size: 14px;
}

.warning {
  position: absolute;
  top: -2px;
  right: -2px;
  font-size: 10px;
  animation: pulse 1s infinite;
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.controls button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  color: #fff;
  cursor: pointer;
  font-size: 14px;
}

.controls button:hover {
  background: rgba(255,255,255,0.3);
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.2); }
}
</style>
