<template>
  <div class="status-bar-wrapper">
    <div class="status-bar">
      <div class="header-buttons">
        <button class="btn-back-home" @click="goHome">🏠 返回</button>
        <button class="btn-settings" @click="showSettings">⚙️ 设置</button>
        <button class="btn-help" @click="showHelp">❓ 帮助</button>
      </div>
      
      <div class="status-columns">
        <div class="status-item">
          <span>📅 Q{{ currentQuarter }}W{{ weekInQuarter }}</span>
          <span>{{ seasonEmoji }}</span>
          <span>📋 {{ prdVersion }}</span>
        </div>
        <div class="status-item">
          <span>💰 {{ budget }}</span>
          <span>📉 {{ debt }}/100</span>
        </div>
        <div class="status-item">
          <span>{{ fameLabel }}</span>
          <span>{{ fame }}</span>
          <span>📦 {{ currentHC }}/3</span>
        </div>
      </div>
      
      <div class="status-buttons">
        <button class="btn-pixel" @click="showRecruit">📱 招聘</button>
        <button class="btn-pixel" @click="showBackpack">👥 员工</button>
        <button class="btn-pixel" @click="showPRD">📋 PRD</button>
        <button class="btn-pixel" style="background: #9b59b6;" @click="testQuarterlyReport">🧪 测试</button>
        <button class="btn-pixel" @click="showBorrow">💰 借钱</button>
        <button class="btn-pixel" @click="saveGame">💾 保存</button>
      </div>
    </div>
    
    <!-- 设置弹窗 -->
    <SettingsModal ref="settingsModalRef" />
    
    <!-- 帮助弹窗 -->
    <QuickGuideModal ref="quickGuideModalRef" />
  </div>
</template>

<script setup>
import { computed, inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useCardsStore } from '@/stores/cards'
import SettingsModal from './SettingsModal.vue'
import QuickGuideModal from './QuickGuideModal.vue'

const router = useRouter()
const game = useGameStore()
const cardsStore = useCardsStore()

const emit = defineEmits(['show-recruit', 'show-quarterly-report', 'show-prd', 'show-backpack'])

const toast = inject('toast')
const settingsModalRef = ref(null)
const quickGuideModalRef = ref(null)
const pendingBeauty = ref(false)

// 计算属性
const currentQuarter = computed(() => game.currentQuarter)
const weekInQuarter = computed(() => game.weekInQuarter)
const prdVersion = computed(() => game.prdVersion)
const budget = computed(() => game.budget)
const debt = computed(() => game.debt)
const fame = computed(() => game.fame)
const currentHC = computed(() => cardsStore.currentHC)
const currentHoliday = computed(() => game.currentHoliday)
const currentSeason = computed(() => game.currentSeason)

const seasonEmoji = computed(() => {
  const season = currentSeason.value
  switch (season) {
    case 'spring': return '🌸'
    case 'summer': return '☀️'
    case 'autumn': return '🍂'
    case 'winter': return '❄️'
    default: return ''
  }
})

const fameLabel = computed(() => {
  const level = game.fameLevel
  switch (level) {
    case 'legendary': return '🏆 名声:'
    case 'high': return '⭐ 名声:'
    case 'normal': return '🔵 名声:'
    case 'low': return '🟡 名声:'
    default: return '🔴 名声:'
  }
})

const isQuarterEnd = computed(() => {
  return game.weekInQuarter === 12
})

// 检查是否有pending的报表美容
onMounted(() => {
  checkPendingBeauty()
  // 定时检查
  setInterval(checkPendingBeauty, 1000)
})

function checkPendingBeauty() {
  pendingBeauty.value = !!localStorage.getItem('pendingQuarterlyBeauty')
}

// 方法
function goHome() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  router.push('/')
}

function showSettings() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  if (settingsModalRef.value) {
    settingsModalRef.value.open()
  }
}

function showHelp() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  if (quickGuideModalRef.value) {
    quickGuideModalRef.value.open()
  }
}

function showRecruit() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  emit('show-recruit')
}

function showQuarterlyReport() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  emit('show-quarterly-report')
}

function showBackpack() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  emit('show-backpack')
}

function showPRD() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  emit('show-prd')
}

function showBorrow() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  // TODO: 实现借钱
  toast.info('借钱功能开发中...')
}

function saveGame() {
  if (pendingBeauty.value) {
    toast.warning('请先完成季度报表美容！')
    return
  }
  game.saveGame()
  cardsStore.saveToStorage()
  toast.success('游戏已保存!')
}

const seasonInfo = {
  'spring': {
    name: '春季',
    icon: '🌸',
    desc: '万物复苏，是招聘新人才和启动新项目的好时机！',
    tips: ['RD员工效率下降（花粉过敏）', '适合举办团建活动', '士气容易提升']
  },
  'summer': {
    name: '夏季',
    icon: '☀️',
    desc: '炎热的季节，注意团队士气！',
    tips: ['午后容易犯困，效率下降', '适合避暑团建', '多关注员工状态']
  },
  'autumn': {
    name: '秋季',
    icon: '🍂',
    desc: '收获的季节，项目进展顺利！',
    tips: ['RD/QA效率提升', '适合制定Q4计划', '员工心情愉快']
  },
  'winter': {
    name: '冬季',
    icon: '❄️',
    desc: '寒冷的季节，但也是冲刺的好时机！',
    tips: ['注意保暖，防止感冒', '年底冲刺，进度优先', '节日多，士气容易提升']
  }
}

function showSeasonInfo() {
  const info = seasonInfo[currentSeason.value]
  if (info && toast) {
    toast.info(`${info.icon} ${info.name}：${info.desc}`)
  }
}

function showHolidayInfo() {
  if (!currentHoliday.value || !toast) return
  const holiday = currentHoliday.value
  let effectText = []
  if (holiday.effect.morale) effectText.push(`士气+${holiday.effect.morale}`)
  if (holiday.effect.cost) effectText.push(`预算${holiday.effect.cost}`)
  if (holiday.effect.progress) effectText.push(`进度${holiday.effect.progress}%`)
  if (holiday.effect.progressPause) effectText.push('进度暂停一周')
  toast.success(`🎉 ${holiday.name}！效果：${effectText.join('，')}`)
}

function testQuarterlyReport() {
  // 模拟季度结束
  localStorage.setItem('pendingQuarterlyBeauty', JSON.stringify({
    week: game.week,
    startedAt: Date.now()
  }))
  // 触发显示季度报表
  emit('show-quarterly-report')
  toast.success('🧪 已打开季度报表测试窗口！')
}
</script>

<style>
/* 最小化的样式，只补充原始CSS没有的部分 */
.status-bar-wrapper {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
}

.holiday-indicator {
  color: #ff991f !important;
  font-weight: 600 !important;
}

.season-item,
.holiday-indicator {
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.season-item:hover,
.holiday-indicator:hover {
  transform: scale(1.05) !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5) !important;
}
</style>
