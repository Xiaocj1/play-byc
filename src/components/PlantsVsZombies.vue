<template>
  <div class="plants-vs-zombies-container">
    <!-- 游戏标题 -->
    <div class="game-title">
      <h1>🎮 工位大战铲车</h1>
      <p class="subtitle">保护报表不被甲方攻破！</p>
    </div>

    <!-- 顶部状态栏 -->
    <div class="game-header">
      <div class="stat-item">
        <span class="stat-icon">☀️</span>
        <span class="stat-value">{{ sun }}</span>
        <span class="stat-label">阳光</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🌊</span>
        <span class="stat-value">{{ currentWave }}/{{ totalWaves }}</span>
        <span class="stat-label">波次</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🧠</span>
        <span class="stat-value">{{ reportIntegrity }}%</span>
        <span class="stat-label">报表</span>
      </div>
      <div class="stat-item">
        <span class="stat-icon">🚜</span>
        <span class="stat-value">{{ remainingZombies }}/5</span>
        <span class="stat-label">剩余铲车</span>
      </div>
      <button class="btn-help" @click="showHelp = true">❓帮助</button>
    </div>

    <!-- 卡牌选择栏 -->
    <div class="card-bar">
      <div class="card-section">
        <h4>🏗️ 工位</h4>
        <div 
          class="card desk-card" 
          :class="{ selected: selectedCard === 'desk', disabled: sun < 30 }"
          @click="selectCard('desk')"
        >
          <span class="card-emoji">🖥️</span>
          <span class="card-cost">30 ☀️</span>
        </div>
      </div>
      <div class="card-section employees-section">
        <h4>👤 员工</h4>
        <div 
          v-for="employee in availableEmployees" 
          :key="employee.instanceId"
          class="card employee-card"
          :class="{ 
            selected: selectedCard === employee.instanceId, 
            disabled: sun < employee.cost || !hasEmptyDesk 
          }"
          @click="selectCard(employee.instanceId)"
        >
          <div class="card-image-wrapper">
            <img 
              v-if="getEmployeeImage(employee)" 
              :src="getEmployeeImage(employee)" 
              :alt="employee.name"
              class="card-image"
              @error="handleImageError"
            />
            <span class="card-emoji fallback-emoji">{{ getAvatar(employee) }}</span>
          </div>
          <span class="card-name">{{ employee.name }}</span>
          <span class="card-cost">{{ employee.cost }} ☀️</span>
          <span class="card-rarity" :class="employee.rarity">{{ employee.rarity }}</span>
        </div>
      </div>
    </div>

    <!-- 游戏战场网格 -->
    <div class="game-board-wrapper">
      <div class="game-board">
        <div 
          v-for="(row, rowIndex) in grid" 
          :key="rowIndex" 
          class="board-row"
        >
          <div 
            v-for="(cell, colIndex) in row" 
            :key="colIndex"
            class="board-cell"
            :class="getCellClass(cell, colIndex)"
            @click="handleCellClick(colIndex, rowIndex)"
          >
            <!-- 网格边框 -->
            <div class="cell-border"></div>
            
            <!-- 工位内容 -->
            <div v-if="cell?.type === 'desk'" class="cell-content">
              <div v-if="!cell.destroyed" class="desk-icon">🖥️</div>
              <div v-else class="desk-destroyed">💥</div>
              <div v-if="!cell.destroyed && !cell.hasEmployee" class="desk-empty-text">空位</div>
            </div>
            
            <!-- 员工内容 -->
            <div v-if="cell?.type === 'desk' && cell.hasEmployee && !cell.destroyed" class="cell-content employee-content">
              <div class="employee-avatar-wrapper">
                <img 
                  v-if="getEmployeeImageById(cell.employeeId)" 
                  :src="getEmployeeImageById(cell.employeeId)" 
                  :alt="getEmployeeName(cell.employeeId)"
                  class="employee-avatar"
                  @error="handleImageError"
                />
                <span class="employee-emoji fallback-emoji">{{ getEmployeeAvatar(cell.employeeId) }}</span>
              </div>
              <div class="employee-name">{{ getEmployeeName(cell.employeeId) }}</div>
              <div class="health-bar-container">
                <div class="health-bar">
                  <div class="health-fill" :style="{ width: getEmployeeHealth(cell.employeeId) + '%' }"></div>
                </div>
              </div>
              <div class="ability-tag">{{ getEmployeeAbility(cell.employeeId) }}</div>
            </div>
            
            <!-- 铲车内容 -->
            <div v-if="cell?.type === 'zombie'" class="cell-content zombie-content">
              <div class="zombie-emoji">{{ getZombieEmoji(cell.zombieType) }}</div>
              <div class="zombie-health-bar-container">
                <div class="zombie-health-bar">
                  <div class="zombie-health-fill" :style="{ width: cell.health + '%' }"></div>
                </div>
              </div>
              <div class="zombie-quote">{{ cell.quote }}</div>
            </div>
            
            <!-- 报表（脑子） -->
            <div v-if="colIndex === 0" class="cell-content report-content">
              <div class="report-emoji">🧠</div>
              <div class="report-label">报表</div>
            </div>
            
            <!-- 空格子提示 -->
            <div v-if="!cell && colIndex >= 1 && colIndex <= 6 && selectedCard === 'desk'" class="cell-hint">
              <span>点击放置工位</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 列标签 -->
      <div class="column-labels">
        <div class="col-label">报表</div>
        <div class="col-label">1</div>
        <div class="col-label">2</div>
        <div class="col-label">3</div>
        <div class="col-label">4</div>
        <div class="col-label">5</div>
        <div class="col-label">6</div>
        <div class="col-label">7</div>
        <div class="col-label">8</div>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <div v-if="gameOver" class="modal-overlay">
      <div class="modal-content">
        <h2>{{ victory ? '🎉 胜利！' : '💀 失败！' }}</h2>
        <div class="result-stats">
          <div>剩余铲车: {{ remainingZombies }}/5</div>
          <div>黄金矿工钩子: {{ hookCount }}个</div>
        </div>
        <p v-if="!victory" class="fail-reason">报表被甲方攻破了！</p>
        <div class="modal-buttons">
          <button class="btn-primary" @click="restartGame">重新开始</button>
          <button class="btn-secondary" v-if="victory" @click="goToMiner">黄金矿工</button>
        </div>
      </div>
    </div>

    <!-- 帮助弹窗 -->
    <div v-if="showHelp" class="modal-overlay">
      <div class="modal-content help-modal">
        <h2>❓ 游戏帮助</h2>
        <div class="help-section">
          <h3>🎮 玩法说明</h3>
          <ol>
            <li>点击「🖥️工位」卡牌，然后点击战场中间空格子放置工位（30阳光）</li>
            <li>选择员工卡牌，然后点击已有工位放置员工</li>
            <li>员工会自动工作（运营产阳光，设计攻击，QA防御，RD爆炸）</li>
            <li>保护最左边的🧠不被铲车攻击！</li>
            <li>击败所有铲车获得胜利！</li>
          </ol>
        </div>
        <div class="help-section">
          <h3>👤 员工类型</h3>
          <ul>
            <li>🌻 运营：每5秒产出25阳光</li>
            <li>🎯 设计：每5秒发射子弹攻击</li>
            <li>🛡️ QA：高血量阻挡铲车</li>
            <li>💣 RD：范围爆炸伤害（一次性）</li>
          </ul>
        </div>
        <button class="btn-primary" @click="showHelp = false">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { CHARACTER_TO_PLANT_MAPPING, convertCharacterToPlant, importEmployeesFromCardsJson } from '../config/plantsVsZombiesConfig'

const emit = defineEmits(['finish'])

const sun = ref(150)
const currentWave = ref(1)
const totalWaves = 5
const reportIntegrity = ref(100)
const remainingZombies = ref(5)
const selectedCard = ref(null)
const gameOver = ref(false)
const victory = ref(false)
const hookCount = ref(0)
const showHelp = ref(false)

const grid = reactive(
  Array(5).fill(null).map(() => Array(9).fill(null))
)

const employees = ref([])

function initEmployees() {
  const imported = importEmployeesFromCardsJson()
  employees.value = imported.slice(0, 6)
}

function getEmployeeImage(employee) {
  const { cardIdToImage, characterImages } = CHARACTER_TO_PLANT_MAPPING
  
  if (employee.sourceCard?.image) {
    return employee.sourceCard.image
  }
  
  const imageKey = cardIdToImage[employee.cardId]
  if (imageKey && characterImages[imageKey]) {
    return characterImages[imageKey]
  }
  
  return null
}

function getEmployeeImageById(employeeId) {
  const emp = employees.value.find(e => e.instanceId === employeeId)
  if (!emp) return null
  return getEmployeeImage(emp)
}

const placedEmployees = reactive({})
const zombies = reactive([])

const availableEmployees = computed(() => {
  return employees.value.map(emp => {
    const plant = convertCharacterToPlant(emp)
    return { ...plant, available: !placedEmployees[emp.instanceId] }
  }).filter(e => e.available)
})

const hasEmptyDesk = computed(() => {
  for (const row of grid) {
    for (const cell of row) {
      if (cell?.type === 'desk' && !cell.destroyed && !cell.hasEmployee) {
        return true
      }
    }
  }
  return false
})

let gameLoop = null
let sunTimer = null
let waveTimer = null

function getAvatar(employee) {
  const avatars = { 'Operation': '🌻', 'Design': '🎯', 'QA': '🛡️', 'RD': '💣' }
  return avatars[employee.position] || '👤'
}

function getEmployeeAvatar(employeeId) {
  const emp = employees.value.find(e => e.instanceId === employeeId)
  return emp ? getAvatar(emp) : '👤'
}

function getEmployeeName(employeeId) {
  const emp = employees.value.find(e => e.instanceId === employeeId)
  return emp?.name || '未知'
}

function getEmployeeHealth(employeeId) {
  return placedEmployees[employeeId]?.health || 0
}

function getEmployeeAbility(employeeId) {
  const emp = employees.value.find(e => e.instanceId === employeeId)
  if (!emp) return ''
  const abilities = { 'Operation': '产阳光', 'Design': '远程攻击', 'QA': '防御', 'RD': '爆炸' }
  return abilities[emp.position] || ''
}

function getZombieEmoji(type) {
  const emojis = { normal: '🧟', angry: '😤', boss: '👨‍💼', shareholder: '🦹', final: '💎' }
  return emojis[type] || '🧟'
}

function getCellClass(cell, colIndex) {
  const classes = []
  if (colIndex === 0) classes.push('report-column')
  if (colIndex >= 1 && colIndex <= 6) classes.push('play-area')
  if (colIndex >= 7) classes.push('zombie-spawn')
  if (cell?.type === 'desk' && !cell.destroyed && !cell.hasEmployee) classes.push('empty-desk')
  if (cell?.type === 'desk' && cell.destroyed) classes.push('destroyed-desk')
  if (cell?.type === 'desk' && cell.hasEmployee) classes.push('has-employee')
  return classes.join(' ')
}

function selectCard(cardId) {
  selectedCard.value = selectedCard.value === cardId ? null : cardId
}

function handleCellClick(col, row) {
  if (gameOver.value) return
  
  const cell = grid[row][col]
  
  if (selectedCard.value === 'desk') {
    if (sun.value < 30 || col < 1 || col > 6 || cell) return
    
    let deskCount = 0
    for (let c = 0; c < 9; c++) {
      if (grid[row][c]?.type === 'desk') deskCount++
    }
    if (deskCount >= 4) return
    
    grid[row][col] = { id: `desk_${col}_${row}`, col, row, health: 50, maxHealth: 50, hasEmployee: false, employeeId: null, destroyed: false, lastDamaged: 0, type: 'desk' }
    sun.value -= 30
    selectedCard.value = null
    return
  }
  
  if (selectedCard.value && selectedCard.value !== 'desk') {
    if (!cell || cell.type !== 'desk' || cell.destroyed || cell.hasEmployee) return
    
    const employee = availableEmployees.value.find(e => e.instanceId === selectedCard.value)
    if (!employee || sun.value < employee.cost) return
    
    cell.hasEmployee = true
    cell.employeeId = employee.instanceId
    
    placedEmployees[employee.instanceId] = {
      ...employee, col, row, health: employee.health, lastAction: Date.now()
    }
    
    sun.value -= employee.cost
    selectedCard.value = null
  }
}

function spawnZombie() {
  if (gameOver.value) return
  
  const waveConfig = CHARACTER_TO_PLANT_MAPPING.waveConfig.waveCompositions[currentWave.value - 1]
  if (!waveConfig) return
  
  const rand = Math.random()
  let cumulative = 0
  let selectedType = 'normal'
  
  for (const config of waveConfig) {
    cumulative += config.weight
    if (rand <= cumulative) {
      selectedType = config.type
      break
    }
  }
  
  const zombieConfig = CHARACTER_TO_PLANT_MAPPING.zombieConfig[selectedType]
  const row = Math.floor(Math.random() * 5)
  
  zombies.push({
    id: `zombie_${Date.now()}_${Math.random()}`,
    type: selectedType,
    row,
    col: 8,
    health: zombieConfig.health,
    maxHealth: zombieConfig.health,
    speed: zombieConfig.speed,
    damage: zombieConfig.damage,
    quote: zombieConfig.quotes[Math.floor(Math.random() * zombieConfig.quotes.length)]
  })
  
  if (!grid[row][8]) {
    grid[row][8] = { type: 'zombie', zombieType: selectedType, health: zombieConfig.health, quote: '' }
  }
}

function updateZombies() {
  const zombiesToRemove = []
  
  for (const zombie of zombies) {
    if (grid[zombie.row][zombie.col]) {
      grid[zombie.row][zombie.col] = null
    }
    
    const frontCell = grid[zombie.row][zombie.col - 1]
    
    if (zombie.col <= 0) {
      reportIntegrity.value -= zombie.damage * 0.1
      if (reportIntegrity.value <= 0) {
        endGame(false)
        return
      }
    } else if (frontCell?.type === 'desk' && frontCell.hasEmployee && !frontCell.destroyed) {
      const emp = placedEmployees[frontCell.employeeId]
      if (emp) {
        emp.health -= zombie.damage * 0.1
        if (emp.health <= 0) {
          frontCell.hasEmployee = false
          frontCell.employeeId = null
          delete placedEmployees[frontCell.employeeId]
        }
      }
    } else if (frontCell?.type === 'desk' && !frontCell.destroyed) {
      frontCell.health -= zombie.damage * 0.1
      if (frontCell.health <= 0) {
        frontCell.destroyed = true
        frontCell.hasEmployee = false
        frontCell.employeeId = null
      }
    } else {
      zombie.col -= zombie.speed * 0.05
    }
    
    zombie.col = Math.max(0, zombie.col)
    const displayCol = Math.floor(zombie.col)
    
    for (let c = displayCol; c <= 8; c++) {
      if (!grid[zombie.row][c]) {
        zombie.col = c
        break
      }
    }
    
    const finalCol = Math.floor(zombie.col)
    if (!grid[zombie.row][finalCol]) {
      grid[zombie.row][finalCol] = {
        type: 'zombie',
        zombieType: zombie.type,
        health: (zombie.health / zombie.maxHealth) * 100,
        quote: zombie.quote
      }
    }
    
    if (zombie.health <= 0) {
      zombiesToRemove.push(zombie.id)
      grid[zombie.row][finalCol] = null
      sun.value += 25
      remainingZombies.value = Math.max(0, remainingZombies.value - 1)
    }
  }
  
  for (const id of zombiesToRemove) {
    const index = zombies.findIndex(z => z.id === id)
    if (index > -1) zombies.splice(index, 1)
  }
  
  if (currentWave.value >= totalWaves && zombies.length === 0) {
    endGame(true)
  }
}

function updateEmployees() {
  for (const [id, emp] of Object.entries(placedEmployees)) {
    const now = Date.now()
    
    if (emp.position === 'Operation' && now - emp.lastAction > 5000) {
      sun.value = Math.min(500, sun.value + 25)
      emp.lastAction = now
    }
    
    if (emp.position === 'Design' && now - emp.lastAction > 5000) {
      for (const zombie of zombies) {
        if (zombie.row === emp.row && zombie.col > emp.col) {
          zombie.health -= emp.attack
          break
        }
      }
      emp.lastAction = now
    }
    
    if (emp.position === 'RD' && now - emp.lastAction > 15000) {
      for (const zombie of zombies) {
        const dx = Math.abs(zombie.col - emp.col)
        const dy = Math.abs(zombie.row - emp.row)
        if (dx <= 1.5 && dy <= 1.5) {
          zombie.health -= emp.attack
        }
      }
      const cell = grid[emp.row][emp.col]
      if (cell) {
        cell.hasEmployee = false
        cell.employeeId = null
      }
      delete placedEmployees[id]
    }
  }
}

function update() {
  if (gameOver.value) return
  updateZombies()
  updateEmployees()
}

function startWave() {
  if (currentWave.value > totalWaves) return
  
  const zombiesInWave = CHARACTER_TO_PLANT_MAPPING.waveConfig.zombiesPerWave[currentWave.value - 1]
  let spawned = 0
  
  const spawnInterval = setInterval(() => {
    if (spawned >= zombiesInWave || gameOver.value) {
      clearInterval(spawnInterval)
      currentWave.value++
      if (currentWave.value <= totalWaves) {
        waveTimer = setTimeout(startWave, 8000)
      }
      return
    }
    spawnZombie()
    spawned++
  }, 1500)
}

function endGame(isVictory) {
  gameOver.value = true
  victory.value = isVictory

  if (isVictory) {
    const remaining = remainingZombies.value
    const hookMap = { 0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 0 }
    hookCount.value = hookMap[remaining] || 0
  } else {
    hookCount.value = 0
  }

  clearInterval(gameLoop)
  clearInterval(sunTimer)
  clearTimeout(waveTimer)
}

function restartGame() {
  sun.value = 150
  currentWave.value = 1
  reportIntegrity.value = 100
  remainingZombies.value = 5
  selectedCard.value = null
  gameOver.value = false
  victory.value = false
  hookCount.value = 0

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 9; c++) {
      grid[r][c] = null
    }
  }

  Object.keys(placedEmployees).forEach(key => delete placedEmployees[key])
  zombies.length = 0

  startGame()
}

function goToMiner() {
  // 发出 finish 事件，让父组件接管
  emit('finish', {
    victory: victory.value,
    hookCount: hookCount.value,
    remainingZombies: remainingZombies.value
  })
}

function startGame() {
  initEmployees()
  gameLoop = setInterval(update, 100)
  sunTimer = setInterval(() => {
    if (!gameOver.value) {
      sun.value = Math.min(500, sun.value + 1)
    }
  }, 1000)
  setTimeout(startWave, 2000)
}

function handleImageError(event) {
  const img = event.target
  const wrapper = img.parentElement
  const employeeName = img.alt || '员工'
  
  if (wrapper) {
    const avatar = wrapper.querySelector('.card-emoji') || wrapper.querySelector('.employee-emoji')
    if (avatar) {
      avatar.style.display = 'block'
    }
  }
  
  img.style.display = 'none'
}

onMounted(() => {
  startGame()
})

onUnmounted(() => {
  clearInterval(gameLoop)
  clearInterval(sunTimer)
  clearTimeout(waveTimer)
})
</script>

<style scoped>
.plants-vs-zombies-container {
  font-family: 'Microsoft YaHei', sans-serif;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.game-title {
  text-align: center;
  margin-bottom: 20px;
}

.game-title h1 {
  font-size: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.subtitle {
  color: #666;
  margin: 10px 0 0 0;
  font-size: 14px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px 20px;
  border-radius: 12px;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-weight: bold;
  font-size: 18px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.btn-help {
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-help:hover {
  background: rgba(255,255,255,0.3);
}

.card-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 12px;
  overflow-x: auto;
}

.card-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-section h4 {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.employees-section {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
}

.employees-section h4 {
  width: 100%;
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
  min-width: 80px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
}

.card.selected {
  border-color: #667eea;
  background: #f0f4ff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-emoji {
  font-size: 32px;
}

.card-image-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.fallback-emoji {
  position: absolute;
  display: none;
}

.card-image:only-child + .fallback-emoji,
.card-image[src=""] + .fallback-emoji {
  display: block;
}

.card-name {
  font-size: 12px;
  font-weight: bold;
  margin-top: 4px;
  color: #333;
}

.card-cost {
  font-size: 11px;
  color: #ff9800;
  margin-top: 2px;
}

.card-rarity {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 4px;
}

.card-rarity.R { background: #9e9e9e; color: white; }
.card-rarity.SR { background: #4caf50; color: white; }
.card-rarity.SSR { background: #ff9800; color: white; }

.game-board-wrapper {
  position: relative;
}

.game-board {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  background: linear-gradient(180deg, #87CEEB 0%, #90EE90 100%);
  border-radius: 12px;
  box-shadow: inset 0 2px 10px rgba(0,0,0,0.1);
  border: 3px solid #4CAF50;
}

.board-row {
  display: flex;
  gap: 6px;
}

.board-cell {
  width: 80px;
  height: 95px;
  background: rgba(255,255,255,0.85);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  border: 2px solid rgba(0,0,0,0.1);
}

.board-cell:hover {
  background: rgba(255,255,255,1);
  transform: scale(1.02);
  border-color: #667eea;
}

.cell-border {
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  border: 1px dashed rgba(0,0,0,0.1);
  border-radius: 6px;
  pointer-events: none;
}

.report-column {
  background: linear-gradient(135deg, #ffcdd2 0%, #ef9a9a 100%) !important;
  border-color: #ef5350 !important;
}

.play-area {
  border: 2px dashed #667eea !important;
}

.zombie-spawn {
  background: linear-gradient(135deg, #c8e6c9 0%, #81c784 100%) !important;
  border-color: #4CAF50 !important;
}

.empty-desk {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
  border-color: #2196F3 !important;
}

.destroyed-desk {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%) !important;
  border-color: #f44336 !important;
}

.has-employee {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%) !important;
  border-color: #9c27b0 !important;
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 5px;
  position: relative;
  z-index: 1;
}

.desk-icon {
  font-size: 36px;
}

.desk-destroyed {
  font-size: 36px;
}

.desk-empty-text {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
}

.employee-content {
  gap: 2px;
}

.employee-avatar-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.employee-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  border: 2px solid #9c27b0;
  background: white;
}

.employee-emoji {
  font-size: 32px;
  position: absolute;
  display: none;
}

.employee-name {
  font-size: 11px;
  font-weight: bold;
  color: #333;
}

.health-bar-container {
  width: 50px;
}

.health-bar {
  width: 100%;
  height: 5px;
  background: #ddd;
  border-radius: 3px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s;
}

.ability-tag {
  font-size: 8px;
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  margin-top: 2px;
}

.zombie-content {
  gap: 2px;
}

.zombie-emoji {
  font-size: 32px;
}

.zombie-health-bar-container {
  width: 50px;
}

.zombie-health-bar {
  width: 100%;
  height: 5px;
  background: #ddd;
  border-radius: 3px;
  overflow: hidden;
}

.zombie-health-fill {
  height: 100%;
  background: linear-gradient(90deg, #f44336, #ff9800);
  transition: width 0.3s;
}

.zombie-quote {
  font-size: 8px;
  color: #666;
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-content {
  gap: 4px;
}

.report-emoji {
  font-size: 36px;
}

.report-label {
  font-size: 11px;
  color: #8B4513;
  font-weight: bold;
}

.cell-hint {
  position: absolute;
  text-align: center;
  padding: 5px;
  background: rgba(102, 126, 234, 0.8);
  color: white;
  font-size: 10px;
  border-radius: 4px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.column-labels {
  display: flex;
  gap: 6px;
  margin-top: 8px;
}

.col-label {
  width: 80px;
  text-align: center;
  font-size: 11px;
  color: #666;
  font-weight: bold;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-content h2 {
  margin: 0 0 20px 0;
  font-size: 24px;
}

.result-stats {
  margin-bottom: 20px;
}

.result-stats div {
  font-size: 16px;
  margin: 8px 0;
}

.fail-reason {
  color: #f44336;
  font-weight: bold;
  margin-bottom: 20px;
}

.modal-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.help-modal {
  text-align: left;
}

.help-section {
  margin-bottom: 20px;
}

.help-section h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.help-section ol, .help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 8px;
  font-size: 14px;
}

@media (max-width: 800px) {
  .board-cell {
    width: 60px;
    height: 75px;
  }
  
  .col-label {
    width: 60px;
  }
  
  .card {
    min-width: 60px;
    padding: 8px 12px;
  }
  
  .card-emoji {
    font-size: 24px;
  }
}
</style>
