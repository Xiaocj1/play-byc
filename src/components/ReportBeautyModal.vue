<template>
  <div v-if="store.isActive" class="report-beauty-modal">
    <div class="report-beauty-content">
      <button class="report-beauty-close" @click="close">X</button>

      <!-- 阶段1：乱糟糟报表 -->
      <div v-if="store.currentStage === 1" class="beauty-stage">
        <h2 class="beauty-title">📋 乱糟糟报表</h2>
        
        <!-- 完整报表展示 - 糟糕版本 -->
        <div class="full-report ugly-full-report">
          <div class="report-header">
            <h3 class="report-title">公平事务所 202X年Q2季度业绩报告</h3>
            <div class="report-rating bad">
              <span class="rating-letter">C-</span>
              <span class="rating-text">⚠️ 需关注</span>
            </div>
          </div>
          
          <div class="report-section">
            <h4 class="section-title">【管理层寄语】</h4>
            <p class="section-text">
              本季度面临诸多挑战，整体表现未达预期，需引起高度重视，望各部门认真总结反思，制定切实可行的改进措施。
            </p>
          </div>
          
          <div class="report-section">
            <h4 class="section-title">📋 核心问题盘点</h4>
            <div class="word-list">
              <div
                v-for="word in store.badWords"
                :key="word.bad"
                class="report-word"
              >
                <span class="word-emoji">❌</span>
                <span class="word-text bad-text">{{ word.bad }}</span>
                <span class="word-score bad-score">(-{{ word.score }})</span>
              </div>
            </div>
          </div>
          
          <div class="report-section">
            <h4 class="section-title">📈 关键指标（表现不佳）</h4>
            <div class="kpi-list">
              <div class="kpi-item">
                <span class="kpi-name">项目交付率</span>
                <span class="kpi-value bad">65%</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-name">客户满意度</span>
                <span class="kpi-value bad">58分</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-name">成本控制率</span>
                <span class="kpi-value bad">78%</span>
              </div>
            </div>
          </div>

          <div v-if="store.badWords.length === 0" class="perfect-quarter">
            <div class="perfect-icon">🎉</div>
            <div class="perfect-title">完美季度！</div>
            <div class="perfect-desc">本季度表现完美，没有需要美容的内容</div>
          </div>
        </div>

        <div class="beauty-actions">
          <button
            v-if="store.badWords.length > 0"
            class="btn-pixel beauty-start-btn"
            @click="startPK"
          >
            🎮 开始美容PK
          </button>
          <button
            v-else
            class="btn-pixel beauty-start-btn"
            @click="claimPerfectBonus"
          >
            ✨ 领取奖励
          </button>
        </div>
      </div>

      <!-- 阶段2：工位大战铲车 -->
      <div v-if="store.currentStage === 2" class="beauty-stage">
        <h2 class="beauty-title">🎮 工位大战铲车</h2>
        <p style="text-align:center;color:#aaa;margin-bottom:16px;">
          放置工位和员工，保护报表不被甲方攻破！<br>
          击败所有铲车后会根据剩余铲车数量获得钩子！
        </p>
        <PlantsVsZombies ref="pvzGameRef" @finish="onPvZFinish" />
      </div>

      <!-- 阶段3：黄金矿工 -->
      <div v-if="store.currentStage === 3" class="beauty-stage">
        <h2 class="beauty-title">⛏️ 黄金矿工</h2>

        <MinerGame
          ref="minerGameRef"
          :bad-words="store.badWords.filter(w => !w.caught)"
          :hooks="store.minerGameState.currentHookCount"
          :is-b2-version="store.isB2Version"
          :upgrade-levels="store.upgradeLevels"
          :has-s-s-r-win="store.hasSSRWin"
          @beautify="onBeautify"
          @finish="onMinerFinish"
          @upgrade="onUpgrade"
          @caught-item="onCaughtItem"
        />
      </div>

      <!-- 阶段4：美容后报表 -->
      <div v-if="store.currentStage === 4" class="beauty-stage">
        <h2 class="beauty-title">✨ 美容后报表</h2>

        <!-- 完整报表展示 - 美容后版本 -->
        <div class="full-report pretty-full-report">
          <div class="report-header">
            <h3 class="report-title">公平事务所 202X年Q2季度业绩报告</h3>
            <div class="report-rating good">
              <span class="rating-letter">A+</span>
              <span class="rating-text">🎉 优秀！</span>
            </div>
          </div>
          
          <div class="report-section">
            <h4 class="section-title">【管理层寄语】</h4>
            <p class="section-text">
              本季度表现优异，各项指标全面达成！感谢全体同仁的辛勤付出，望继续保持势头，再创佳绩！🏆
            </p>
          </div>
          
          <div class="report-section">
            <h4 class="section-title">📋 核心亮点盘点</h4>
            <div class="word-list">
              <div
                v-for="word in store.badWords"
                :key="word.bad"
                class="report-word"
              >
                <span class="word-emoji">{{ word.caught ? '✅' : '❌' }}</span>
                <span class="word-text" :class="word.caught ? 'good-text' : 'bad-text'">
                  {{ word.caught ? word.good : word.bad }}
                </span>
                <span class="word-score" :class="word.caught ? 'good-score' : 'bad-score'">
                  ({{ word.caught ? '+' : '-' }}{{ word.score }})
                </span>
              </div>
            </div>
          </div>
          
          <div class="report-section">
            <h4 class="section-title">📈 关键指标（表现优异）</h4>
            <div class="kpi-list">
              <div class="kpi-item">
                <span class="kpi-name">项目交付率</span>
                <span class="kpi-value good">95%</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-name">客户满意度</span>
                <span class="kpi-value good">92分</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-name">成本控制率</span>
                <span class="kpi-value good">98%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="beauty-summary">
          <div class="beauty-summary-item">
            <span>美容成功</span>
            <span>{{ store.beautifiedWords.length }} 个词</span>
          </div>
          <div class="beauty-summary-item">
            <span>美容得分</span>
            <span>+{{ store.minerScore }}</span>
          </div>
          <div class="beauty-summary-item">
            <span>满意度加成</span>
            <span>+{{ store.beautifiedWords.length * 5 }}%</span>
          </div>
        </div>

        <div class="beauty-actions">
          <button class="btn-pixel beauty-submit-btn" @click="submitReport">
            📤 提交报表
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, inject } from 'vue'
import { useReportBeautyStore } from '@/stores/reportBeauty'
import MinerGame from './MinerGame.vue'
import PlantsVsZombies from './PlantsVsZombies.vue'
import { useGameStore } from '@/stores/game'
import { useCardsStore } from '@/stores/cards'

const store = useReportBeautyStore()
const gameStore = useGameStore()
const cardsStore = useCardsStore()
const toast = inject('toast')

const minerGameRef = ref(null)
const pvzGameRef = ref(null)

// 可用卡牌：排除初创团队
const availableCards = computed(() => {
  const result = cardsStore.backpack.filter(c => {
    const hasDurability = (c.durability !== undefined ? c.durability : c.currentDurability) > 0
    return !c.is_variant && !c.id.startsWith('initial_') && hasDurability
  })
  return result
})

// 开始PvZ游戏
function startPK() {
  // 如果没有可用卡牌，没有员工就没有游戏，直接完成美容（虽然没有美容任何词）
  if (availableCards.value.length === 0) {
    toast.info('还没有可用的员工卡牌，无法进行工位大战，本次报表就这样吧...')
    store.pkWins.value = 0
    store.pkRound.value = 1
    store.minerHooks.value = 0
    store.finishMiner()
    return
  }
  store.startPK()
}

// PvZ游戏结束回调
function onPvZFinish({ victory, hookCount, remainingZombies }) {
  if (victory) {
    toast.success(`🎉 胜利！获得 ${hookCount} 个钩子！`)
    store.minerHooks.value = hookCount
  } else {
    toast.error('💀 失败！报表被甲方攻破了！')
    store.minerHooks.value = 0
  }
  store.startMiner()
}

// 黄金矿工事件处理
function onBeautify(wordData) {
  store.onMinerBeautify(wordData)
}

function onMinerFinish(data) {
  store.onMinerCaughtItem({ type: 'hook_used' })
  
  if (store.minerGameState.currentHookCount <= 0) {
    store.finishMiner()
  } else if (minerGameRef.value) {
    setTimeout(() => {
      if (minerGameRef.value) {
        minerGameRef.value.reset(store.badWords.filter(w => !w.caught))
      }
    }, 300)
  }
}

function onUpgrade(type) {
  store.upgradeHook(type)
}

function onCaughtItem(item) {
  store.onMinerCaughtItem(item)
}

// 提交报表
function submitReport() {
  const result = store.submitBeautifulReport()
  gameStore.satisfaction = Math.min(100, gameStore.satisfaction + result.satisfactionBonus)
  close()
}

// 完美季度奖励
function claimPerfectBonus() {
  gameStore.satisfaction = Math.min(100, gameStore.satisfaction + 20)
  gameStore.budget += 50
  close()
}

// 关闭
function close() {
  store.reset()
  // 清除pending状态
  localStorage.removeItem('pendingQuarterlyBeauty')
}

// 暴露方法供父组件调用
defineExpose({
  open(badWordsList) {
    store.startBeauty(badWordsList)
  }
})
</script>

<style scoped>
.report-beauty-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.report-beauty-content {
  background: #16213e;
  border: 2px solid #e94560;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.report-beauty-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #e94560;
  font-size: 24px;
  cursor: pointer;
}

.beauty-stage {
  margin-top: 20px;
}

.beauty-title {
  text-align: center;
  color: #e94560;
  font-size: 24px;
  margin-bottom: 20px;
}

/* 完整报表样式 */
.full-report {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
}

.ugly-full-report {
  border: 2px solid #e74c3c;
}

.pretty-full-report {
  border: 2px solid #2ecc71;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #ddd;
  margin-bottom: 20px;
}

.report-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.report-rating {
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.report-rating.bad {
  background: #ffebee;
  color: #c62828;
}

.report-rating.good {
  background: #e8f5e9;
  color: #2e7d32;
}

.rating-letter {
  font-size: 28px;
  line-height: 1;
}

.rating-text {
  font-size: 12px;
  margin-top: 4px;
}

.report-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 12px 0;
  padding-left: 8px;
  border-left: 4px solid #3498db;
}

.section-text {
  color: #555;
  line-height: 1.6;
  margin: 0;
}

.word-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-word {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.word-emoji {
  font-size: 18px;
}

.word-text {
  flex: 1;
  font-weight: 500;
}

.bad-text {
  color: #c62828;
  text-decoration: line-through;
}

.good-text {
  color: #2e7d32;
  font-weight: bold;
}

.word-score {
  font-size: 14px;
  font-weight: bold;
}

.bad-score {
  color: #c62828;
}

.good-score {
  color: #2e7d32;
}

.kpi-list {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.kpi-item {
  flex: 1;
  min-width: 140px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.kpi-name {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 20px;
  font-weight: bold;
}

.kpi-value.bad {
  color: #c62828;
}

.kpi-value.good {
  color: #2e7d32;
}

/* 原有的样式 */
.ugly-report,
.pretty-report {
  background: #0f3460;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.ugly-word,
.pretty-word {
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
}

.bad-word {
  color: #e74c3c;
}

.good-word {
  color: #2ecc71;
}

.beauty-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-pixel {
  background: #e94560;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-pixel:hover {
  background: #c73e54;
  transform: translateY(-2px);
}

.pk-info {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 16px 0;
  font-size: 18px;
  font-weight: bold;
}

.pk-timer {
  padding: 4px 12px;
  border-radius: 8px;
  background: #3498db;
  color: white;
  transition: all 0.3s;
}

.pk-timer.urgent {
  background: #e74c3c;
  animation: pulse 0.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.pk-battle {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 24px 0;
}

.pk-opponent,
.pk-player {
  text-align: center;
}

.opponent-camp,
.pk-card {
  padding: 12px;
  border-radius: 8px;
  margin: 8px 0;
  cursor: pointer;
  transition: all 0.2s;
}

.opponent-camp {
  background: #9b59b6;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.pk-card {
  background: #0f3460;
  border: 2px solid #3498db;
}

.pk-card:hover {
  border-color: #e94560;
  transform: translateY(-2px);
}

.pk-card.selected {
  border-color: #2ecc71;
  background: #1a5276;
}

.pk-vs {
  font-size: 32px;
  font-weight: bold;
  color: #e94560;
}

.player-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;
  padding: 4px;
}

.pk-result {
  text-align: center;
  font-size: 18px;
  margin: 16px 0;
  color: #f39c12;
}

.beauty-summary {
  background: #0f3460;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
}

.beauty-summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #16213e;
}

.perfect-quarter {
  text-align: center;
  padding: 40px;
}

.perfect-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.perfect-title {
  font-size: 24px;
  color: #2ecc71;
  margin-bottom: 8px;
}

.perfect-desc {
  color: #888;
}
</style>
