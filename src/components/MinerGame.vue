<template>
  <div class="miner-game">
    <!-- UI层 - 信息展示 -->
    <div class="miner-info">
      <div class="miner-hooks">剩余钩子: {{ hooks }}</div>
      <div class="miner-timer">时间: {{ Math.ceil(gameState.timeLeft) }}s</div>
      <div class="miner-score">已美容: {{ beautifiedWords.length }}</div>
    </div>

    <!-- 游戏层 - Canvas渲染 -->
    <canvas
      ref="canvasRef"
      class="miner-canvas"
      :width="CANVAS_WIDTH"
      :height="CANVAS_HEIGHT"
      @click="handleClick"
    />

    <div class="miner-instructions">
      <p>点击发射钩子，钓取坏词进行美容！</p>
      <p>⚠️ 小心审计炸弹！</p>
    </div>

    <!-- 升级面板 -->
    <div v-if="isB2Version" class="hook-upgrades">
      <div class="upgrade-title">🔧 钩子升级</div>
      <button
        v-for="upgrade in upgradeTypes"
        :key="upgrade.type"
        class="upgrade-btn"
        :disabled="upgradeLevels[upgrade.type] >= 10"
        @click="upgradeHook(upgrade.type)"
      >
        {{ upgrade.icon }} {{ upgrade.name }} Lv{{ upgradeLevels[upgrade.type] }}/10
        <span class="upgrade-cost">(100万+1卡)</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { MinerGameEngine } from '@/utils/MinerGameEngine.js'
import { MinerGameRenderer } from '@/utils/MinerGameRenderer.js'

const props = defineProps({
  badWords: { type: Array, required: true },
  hooks: { type: Number, required: true },
  isB2Version: { type: Boolean, default: false },
  upgradeLevels: { type: Object, default: () => ({ length: 0, speed: 0, magnetism: 0 }) }
})

const emit = defineEmits([
  'update:hooks',
  'beautify',
  'finish',
  'upgrade',
  'caught-item'
])

// 常量
const CANVAS_WIDTH = 500
const CANVAS_HEIGHT = 400

// 引用
const canvasRef = ref(null)

// 本地状态
const gameState = ref({
  phase: 'idle',
  timeLeft: 0,
  items: [],
  hook: null
})
const beautifiedWords = ref([])

// 游戏实例
let gameEngine = null
let renderer = null
let renderLoopId = null

// 升级类型
const upgradeTypes = [
  { type: 'length', name: '长度', icon: '⬇️' },
  { type: 'speed', name: '速度', icon: '⚡' },
  { type: 'magnetism', name: '磁力', icon: '🧲' }
]

// 初始化
onMounted(() => {
  initGame()
  watchUpgradeLevels()
})

// 清理
onUnmounted(() => {
  cleanupGame()
})

/**
 * 初始化游戏
 */
function initGame() {
  if (!canvasRef.value) return

  // 初始化引擎
  gameEngine = new MinerGameEngine({
    canvasWidth: CANVAS_WIDTH,
    canvasHeight: CANVAS_HEIGHT,
    baseTime: props.isB2Version ? 15 : 10
  })

  // 初始化渲染器
  renderer = new MinerGameRenderer(canvasRef.value)

  // 设置回调
  gameEngine.setCallback('onStateChange', handleStateChange)
  gameEngine.setCallback('onItemCaught', handleItemCaught)
  gameEngine.setCallback('onTimeUp', handleTimeUp)

  // 生成物品并开始
  gameEngine.generateItems(props.badWords)
  gameEngine.setUpgrades(props.upgradeLevels)
  gameEngine.startGame(props.isB2Version ? 15 : 10)

  // 开始渲染循环
  startRenderLoop()
}

/**
 * 开始渲染循环
 */
function startRenderLoop() {
  function render() {
    if (gameEngine && renderer) {
      // 获取最新状态并渲染
      const state = gameEngine.getState()
      renderer.render(state)
    }
    renderLoopId = requestAnimationFrame(render)
  }
  renderLoopId = requestAnimationFrame(render)
}

/**
 * 处理游戏状态变化（来自逻辑层）
 */
function handleStateChange(state) {
  gameState.value = {
    phase: state.phase,
    timeLeft: state.timeLeft,
    items: state.items,
    hook: state.hook
  }
}

/**
 * 处理物品捕获
 */
function handleItemCaught(item) {
  switch (item.type) {
    case 'word':
      item.data.caught = true
      beautifiedWords.value.push(item.data)
      emit('beautify', item.data)
      break
    case 'audit_bomb':
      emit('caught-item', { type: 'bomb' })
      return
    case 'money_chest':
      emit('caught-item', { type: 'money' })
      break
    case 'hc_chest':
      emit('caught-item', { type: 'hc' })
      break
    case 'diamond':
      emit('caught-item', { type: 'diamond' })
      break
    case 'extra_hook':
      emit('caught-item', { type: 'extra_hook' })
      break
  }

  finishRound()
}

/**
 * 时间到
 */
function handleTimeUp() {
  finishRound()
}

/**
 * 点击处理
 */
function handleClick() {
  if (gameEngine) {
    gameEngine.launch()
  }
}

/**
 * 完成一轮
 */
function finishRound() {
  cleanupGame()
  emit('finish', {
    hooks: props.hooks - 1,
    beautifiedWords: beautifiedWords.value
  })
}

/**
 * 升级钩子
 */
function upgradeHook(type) {
  emit('upgrade', type)
}

/**
 * 监听升级变化
 */
function watchUpgradeLevels() {
  watch(() => props.upgradeLevels, (newLevels) => {
    if (gameEngine) {
      gameEngine.setUpgrades(newLevels)
    }
  }, { deep: true })
}

/**
 * 清理游戏
 */
function cleanupGame() {
  if (gameEngine) {
    gameEngine.stopGame()
  }
  if (renderLoopId) {
    cancelAnimationFrame(renderLoopId)
    renderLoopId = null
  }
}

/**
 * 暴露给父组件的方法
 */
defineExpose({
  reset(newBadWords) {
    cleanupGame()
    nextTick(() => {
      initGame()
    })
  }
})
</script>

<style scoped>
.miner-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.miner-info {
  display: flex;
  gap: 24px;
  font-size: 16px;
  font-weight: bold;
}

.miner-canvas {
  border: 2px solid #e94560;
  border-radius: 8px;
  cursor: pointer;
}

.miner-instructions {
  text-align: center;
  color: #888;
}

.miner-instructions p {
  margin: 4px 0;
}

.hook-upgrades {
  margin-top: 16px;
  padding: 12px;
  background: #16213e;
  border-radius: 8px;
}

.upgrade-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.upgrade-btn {
  display: block;
  width: 100%;
  margin: 4px 0;
  padding: 8px;
  background: #0f3460;
  color: white;
  border: 1px solid #e94560;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-btn:hover:not(:disabled) {
  background: #e94560;
}

.upgrade-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upgrade-cost {
  font-size: 12px;
  color: #888;
}
</style>
