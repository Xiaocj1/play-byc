<template>
  <div class="main-menu">
    <div class="menu-background"></div>
    
    <header class="logo-section">
      <h1 class="logo-title">公平事务所</h1>
      <p class="logo-subtitle">Fairness Studio</p>
    </header>

    <main class="buttons-section">
      <button class="pixel-btn btn-start-game" @click="startNewGame">
          <span class="btn-icon">▶</span>
          <span class="btn-text">开始游戏</span>
        </button>

      <div class="secondary-buttons">
        <button class="pixel-btn btn-secondary" @click="showLevelupModal = true">
          <span class="btn-icon">🔥</span>
          <span class="btn-text">卷一卷</span>
        </button>
        <button class="pixel-btn btn-secondary" @click="showGalleryModal = true">
          <span class="btn-icon">🃏</span>
          <span class="btn-text">人才库</span>
        </button>
        <button class="pixel-btn btn-secondary" @click="showMuseumModal = true">
          <span class="btn-icon">🏛️</span>
          <span class="btn-text">陈列馆</span>
        </button>
        <button class="pixel-btn btn-secondary" @click="showToolchainModal = true">
          <span class="btn-icon">⚙️</span>
          <span class="btn-text">工具链</span>
        </button>
      </div>

      <button class="pixel-btn btn-continue" @click="continueGame" v-if="hasSave">
        <span class="btn-icon">▸</span>
        <span class="btn-text">继续游戏</span>
      </button>
    </main>

    <div class="rank-badge">
      <div class="rank-label">当前职级</div>
      <div class="rank-value">{{ player.currentRankData?.id?.toUpperCase() || 'P5' }}</div>
      <div class="rank-bars">
        <div class="rank-bar">
          <span class="bar-label">人脉</span>
          <span class="bar-value">1-1</span>
        </div>
        <div class="rank-bar">
          <span class="bar-label">技术</span>
          <span class="bar-value">1-1</span>
        </div>
        <div class="rank-bar">
          <span class="bar-label">资源</span>
          <span class="bar-value">1-1</span>
        </div>
      </div>
    </div>
    
    <!-- 模态框 -->
    <LevelupModal v-model="showLevelupModal" />
    <MuseumModal v-model="showMuseumModal" />
    <ToolchainModal v-model="showToolchainModal" />
    <GalleryModal v-model="showGalleryModal" />
    
    <!-- 确认对话框 -->
    <ConfirmModal
      v-model="showConfirmModal"
      title="确认覆盖存档"
      message="检测到已有存档！开始新游戏将覆盖当前存档，继续吗？"
      @confirm="confirmStartNewGame"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSkinStore } from '../stores/skin'
import { useCardsStore } from '../stores/cards'
import LevelupModal from '../components/LevelupModal.vue'
import MuseumModal from '../components/MuseumModal.vue'
import ToolchainModal from '../components/ToolchainModal.vue'
import GalleryModal from '../components/GalleryModal.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import ranksData from '@/data/ranks.json'

const router = useRouter()
const skinStore = useSkinStore()
const cardsStore = useCardsStore()

const hasSave = ref(false)
const showLevelupModal = ref(false)
const showMuseumModal = ref(false)
const showToolchainModal = ref(false)
const showGalleryModal = ref(false)
const showConfirmModal = ref(false)

const player = reactive({
  projectExperience: 0,
  currentRank: 'p5',
  get currentRankData() {
    return ranksData.ranks.find(r => r.id === this.currentRank)
  },
  get progressToNextRank() {
    const currentIndex = ranksData.ranks.findIndex(r => r.id === this.currentRank)
    if (currentIndex === -1 || currentIndex >= ranksData.ranks.length - 1) return 100
    
    const current = ranksData.ranks[currentIndex]
    const next = ranksData.ranks[currentIndex + 1]
    const requiredExp = next?.requiredExp || 0
    
    if (this.projectExperience >= requiredExp) {
      return 100
    }
    
    const currentRequired = current?.requiredExp || 0
    const progress = ((this.projectExperience - currentRequired) / (requiredExp - currentRequired)) * 100
    return Math.max(0, Math.min(100, Math.round(progress)))
  }
})

onMounted(() => {
  hasSave.value = localStorage.getItem('fair_office_game_state') !== null
  player.projectExperience = parseFloat(localStorage.getItem('fair_office_project_experience') || '0')
  player.currentRank = localStorage.getItem('fair_office_current_rank') || 'p5'
  
  // 回到首页，恢复像素风格皮肤
  skinStore.loadSkin('pixel')
})

function startNewGame() {
  console.log('startNewGame called, hasSave:', hasSave.value)
  // 检查是否有存档
  if (hasSave.value) {
    showConfirmModal.value = true
    console.log('showConfirmModal set to true')
    return
  }
  
  confirmStartNewGame()
}

function confirmStartNewGame() {
  localStorage.removeItem('fair_office_game_state')
  
  // 重置cards store
  cardsStore.resetCards()
  cardsStore.loadInitialTeam()
  
  skinStore.loadSkin('pixel')
  router.push('/select')
}

function continueGame() {
  // 从存档中读取方向并加载对应皮肤
  const gameState = JSON.parse(localStorage.getItem('fair_office_game_state') || '{}')
  if (gameState.direction) {
    skinStore.loadSkinForDirection(gameState.direction)
  }
  router.push('/game')
}
</script>

<style scoped>
* {
  image-rendering: pixelated;
  -webkit-font-smoothing: none;
  -moz-osx-font-smoothing: unset;
}

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.main-menu {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10002;
}

.menu-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/assets/background/door.jpg') no-repeat center center;
  background-size: cover;
  z-index: -1;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 33.33vh;
  padding: 20px;
  background: rgba(0, 0, 0, 0.6);
}

.logo-title {
  font-family: 'Press Start 2P', monospace;
  font-size: min(12vw, 15vh);
  color: #0f0;
  -webkit-text-stroke: 2px #000;
  margin: 0;
  text-align: center;
  line-height: 1.3;
}

.logo-subtitle {
  font-family: 'Press Start 2P', monospace;
  font-size: min(2vw, 3vh);
  color: #0f0;
  -webkit-text-stroke: 1px #000;
  margin-top: 15px;
  letter-spacing: 4px;
}

.buttons-section {
  position: absolute;
  bottom: 20vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 600px;
}

.pixel-btn {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  background: #1a1a2e;
  color: #00ff41;
  border: 4px solid #00ff41;
  padding: 16px 28px;
  box-shadow: 4px 4px 0 #0a0a0f;
  cursor: pointer;
  transition: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  -webkit-font-smoothing: none;
  white-space: nowrap;
}

.pixel-btn .btn-icon {
  font-size: 18px;
}

.btn-start-game,
.btn-continue {
  width: 100%;
  max-width: 520px;
  font-size: 16px;
  padding: 20px 32px;
  align-self: center;
}

.secondary-buttons {
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
}

.btn-secondary {
  background: #1a1a2e;
  color: #ffffff;
  border-color: #666666;
  font-size: 14px;
  font-weight: bold;
  padding: 18px 32px;
  flex-direction: column;
  gap: 10px;
  min-width: 180px;
}

.btn-secondary .btn-icon {
  font-size: 22px;
}

.btn-continue {
  background: #1a1a2e;
  color: #ffd700;
  border-color: #ffd700;
  font-size: 14px;
}

.btn-start-game:hover,
.btn-secondary:hover {
  background: #00ff41;
  color: #1a1a2e;
  box-shadow: 2px 2px 0 #0a0a0f;
  transform: translate(2px, 2px);
}

.btn-secondary:hover {
  background: #666666;
  border-color: #ffffff;
}

.btn-continue:hover {
  background: #ffd700;
  color: #1a1a2e;
}

.pixel-btn:active {
  box-shadow: 0 0 0 #0a0a0f;
  transform: translate(4px, 4px);
}

.rank-badge {
  position: fixed;
  top: 30px;
  right: 40px;
  background: #1a1a2e;
  border: 3px solid #00ffff;
  padding: 16px 20px;
  box-shadow: 4px 4px 0 #0a0a0f;
  z-index: 20;
  min-width: 150px;
}

.rank-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #888888;
  margin-bottom: 8px;
}

.rank-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffffff;
  margin-bottom: 16px;
}

.rank-bars {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.rank-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #0a0a0f;
}

.rank-bar .bar-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 7px;
  color: #888888;
}

.rank-bar .bar-value {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px;
  color: #ffffff;
}

@media (max-width: 700px) {
  .logo-title {
    font-size: min(10vw, 12vh);
  }

  .logo-subtitle {
    font-size: min(1.5vw, 2vh);
  }

  .secondary-buttons {
    gap: 12px;
  }

  .btn-secondary {
    font-size: 12px;
    padding: 16px 24px;
    min-width: 140px;
  }

  .btn-secondary .btn-icon {
    font-size: 18px;
  }

  .btn-start-game,
  .btn-continue {
    font-size: 14px;
    padding: 18px 28px;
  }

  .rank-badge {
    top: 15px;
    right: 15px;
    padding: 12px 16px;
    min-width: 130px;
  }
}

@media (max-width: 480px) {
  .logo-title {
    font-size: min(10vw, 10vh);
  }

  .logo-subtitle {
    font-size: min(1.2vw, 1.5vh);
    letter-spacing: 2px;
  }

  .secondary-buttons {
    flex-direction: column;
    width: 100%;
    align-items: center;
  }

  .btn-secondary {
    width: 200px;
    flex-direction: row;
    justify-content: center;
    gap: 10px;
  }
}
</style>
