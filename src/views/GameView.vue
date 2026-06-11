<template>
  <div class="game-container">
    <!-- 顶部状态栏 -->
    <GameHUD
      @show-recruit="showRecruitModal"
      @show-quarterly-report="showQuarterlyReport"
      @show-prd="showPRDModal"
      @show-backpack="showEmployeeManagement"
    />
    
    <!-- ToC/B2C - 会议模式布局 -->
    <div v-if="game.direction !== 'tob'" class="meeting-wrapper">
      <div class="meeting-container">
        <!-- 左侧：可折叠团队详情 -->
        <div class="meeting-sidebar">
          <button class="sidebar-toggle" @click="sidebarExpanded = !sidebarExpanded">
            <span class="toggle-icon">{{ sidebarExpanded ? '◀' : '▶' }}</span>
            <span v-if="!sidebarExpanded" class="toggle-label">👥</span>
          </button>
          <div v-if="sidebarExpanded" class="sidebar-content">
            <TeamPanel />
          </div>
        </div>
        
        <!-- 中间：会议界面 -->
        <div class="meeting-main">
          <TeamMeeting />
        </div>
        
        <!-- 右侧：事件卡片 -->
        <div class="meeting-rightbar">
          <EventCard />
        </div>
      </div>
    </div>
    
    <!-- ToB - 原来的三栏布局 -->
    <div v-else class="main-wrapper">
      <div class="container">
        <div class="sidebar-left">
          <TeamPanel />
        </div>
        <div class="sidebar-right">
          <EventCard />
        </div>
        <div class="main-area">
          <WeeklyReport />
        </div>
      </div>
    </div>
    
    <!-- 浮动仪表盘小部件 - 仅ToB方向显示 -->
    <FloatingWidget v-if="game.direction === 'tob'" />
    
    <!-- 招聘模态框 -->
    <RecruitModal ref="recruitModal" />

    <!-- 员工管理模态框 -->
    <EmployeeManagementModal ref="employeeManagementModal" />

    <!-- 季度报表模态框 -->
    <QuarterlyReportModal
      ref="quarterlyReportModal"
      @show-beauty="showReportBeauty"
    />

    <!-- 报表美容模态框 -->
    <ReportBeautyModal ref="reportBeautyModal" />
    
    <!-- PRD文档模态框 -->
    <PRDModal ref="prdModal" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { useEventsStore } from '@/stores/events'
import { useCardsStore } from '@/stores/cards'
import { useSkinStore } from '@/stores/skin'
import GameHUD from '@/components/GameHUD.vue'
import EventCard from '@/components/EventCard.vue'
import WeeklyReport from '@/components/WeeklyReport.vue'
import TeamPanel from '@/components/TeamPanel.vue'
import TeamMeeting from '@/components/TeamMeeting.vue'
import FloatingWidget from '@/components/FloatingWidget.vue'
import RecruitModal from '@/components/RecruitModal.vue'
import EmployeeManagementModal from '@/components/EmployeeManagementModal.vue'
import ReportBeautyModal from '@/components/ReportBeautyModal.vue'
import QuarterlyReportModal from '@/components/QuarterlyReportModal.vue'
import PRDModal from '@/components/PRDModal.vue'

const router = useRouter()
const game = useGameStore()
const events = useEventsStore()
const cardsStore = useCardsStore()
const skinStore = useSkinStore()
const recruitModal = ref(null)
const employeeManagementModal = ref(null)
const reportBeautyModal = ref(null)
const quarterlyReportModal = ref(null)
const prdModal = ref(null)

const progressPercent = computed(() => Math.min(100, Math.max(0, game.progress)))
const satisfactionClass = computed(() => {
  if (game.satisfaction >= 80) return 'green'
  if (game.satisfaction >= 60) return 'yellow'
  if (game.satisfaction >= 40) return 'orange'
  return 'red'
})
const sidebarExpanded = ref(true)

function showRecruitModal() {
  recruitModal.value?.show()
}

function showEmployeeManagement() {
  employeeManagementModal.value?.open()
}

function showQuarterlyReport() {
  quarterlyReportModal.value?.open()
}

function showPRDModal() {
  prdModal.value?.open()
}

function showReportBeauty() {
  // 这里不需要再生成了，因为季度报表按钮已经处理了
  // 只需要确保打开美容弹窗
}

function generateBadWords() {
  // 根据游戏状态生成坏词
  const words = []
  const mapping = {
    budgetNeg: { bad: '亏损', good: '战略性投入', score: 10 },
    satLow: { bad: '员工满意度低', good: '团队处于磨合期', score: 15 },
    highDebt: { bad: '负债压力大', good: '财务杠杆利用中', score: 20 }
  }

  if (game.budget < 0) {
    words.push({ ...mapping.budgetNeg, weight: 'light', caught: false })
  }
  if (game.satisfaction < 55) {
    words.push({ ...mapping.satLow, weight: 'medium', caught: false })
  }
  if (game.debt > game.debtLimit * 0.8) {
    words.push({ ...mapping.highDebt, weight: 'medium', caught: false })
  }

  return words
}

onMounted(() => {
  console.log('GameView mounted')
  
  // 加载游戏数据
  const hasSaved = game.loadGame()
  console.log('hasSaved:', hasSaved, 'direction:', game.direction)
  
  if (!hasSaved && !game.direction) {
    // 如果没有存档且没有选择方向，回到选择页面
    console.log('No save or direction, redirecting to select')
    router.push('/select')
    return
  }
  
  // 加载对应方向的皮肤
  if (game.direction) {
    skinStore.loadSkinForDirection(game.direction)
    console.log('Skin applied:', game.direction, '->', skinStore.currentSkin)
    console.log('Body class:', document.body.className)
  }
  
  // 加载事件数据
  if (events.events.length === 0) {
    console.log('Events not loaded, loading...')
    events.loadEvents()
  } else {
    console.log('Events already loaded:', events.events.length)
  }
  
  // 加载初始团队成员（艾萨克、莫甘娜、小葵、辛竹）
  cardsStore.loadInitialTeam()
  
  // 新功能：检查HC里程碑
  game.checkHCMilestones()
  
  // 新功能：应用节假日效果
  const holidayResult = game.applyHolidayEffects()
  if (holidayResult) {
    console.log('Holiday effects applied:', holidayResult)
  }
  
  // 检查是否在季度末且需要显示报表美容院
  checkQuarterlyReport()
})

// 监听周数变化，自动触发季度末
watch(() => game.week, (newWeek) => {
  console.log('Week changed:', newWeek)
  
  // 新功能：检查HC里程碑
  game.checkHCMilestones()
  
  // 新功能：应用节假日效果
  const holidayResult = game.applyHolidayEffects()
  if (holidayResult) {
    console.log('Holiday effects applied:', holidayResult)
  }
  
  // 检查季度报表
  checkQuarterlyReport()
})

// 检查并处理季度报表
function checkQuarterlyReport() {
  // 检查是否在季度末（第12周）
  const isQuarterEnd = game.week % 12 === 0 && game.week > 0
  
  // 检查本地存储中是否有未完成的报表美容
  const pendingBeauty = localStorage.getItem('pendingQuarterlyBeauty')
  
  if (isQuarterEnd || pendingBeauty) {
    console.log('Quarterly report needed!')
    
    // 标记需要显示
    localStorage.setItem('pendingQuarterlyBeauty', JSON.stringify({
      week: game.week,
      startedAt: Date.now()
    }))
    
    // 延迟打开，让页面先加载
    setTimeout(() => {
      quarterlyReportModal.value?.open()
    }, 500)
  }
}
</script>

<style>
.game-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.status-bar-wrapper {
  flex-shrink: 0;
  z-index: 1000;
}

/* 原来的三栏布局样式 */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: auto !important; /* 覆盖 base.css 中的 calc(100vh - 60px) */
  min-height: 0;
  overflow: hidden;
}

.main-wrapper .container {
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  padding: 20px;
  gap: 20px;
}

.sidebar-left,
.sidebar-right {
  flex-shrink: 0;
  overflow-y: auto;
}

.main-area {
  flex: 1;
  overflow-y: auto;
}

/* 会议模式布局样式 */
.meeting-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.meeting-container {
  flex: 1;
  display: grid;
  grid-template-columns: auto 1fr 300px;
  gap: 12px;
  padding: 12px 16px;
  min-height: 0;
  overflow: hidden;
}

.meeting-sidebar {
  position: relative;
  min-width: 40px;
}

.meeting-sidebar .sidebar-toggle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  border: 1px solid #e5e6eb;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.meeting-sidebar .sidebar-toggle:hover {
  background: #f5f6f7;
  border-color: #3370ff;
}

.meeting-sidebar .toggle-icon {
  font-size: 12px;
}

.meeting-sidebar .toggle-label {
  font-size: 16px;
}

.meeting-sidebar .sidebar-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  width: 260px;
  height: 100%;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.meeting-main {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}

.meeting-rightbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

/* 聊天风格布局样式（保留备用） */
.chat-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.chat-container {
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr 300px;
  gap: 12px;
  padding: 12px 16px;
  min-height: 0;
  overflow: hidden;
}

.chat-sidebar,
.chat-rightbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

.team-panel-wrapper {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.chat-main {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  min-height: 0;
}

.chat-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e6eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-title {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
}

.chat-info {
  font-size: 12px;
  color: #86909c;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chat-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3370ff 0%, #5a8cff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-header {
  font-size: 13px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 6px;
}

.message-body {
  background: #f7f8fa;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 13px;
  color: #4e5969;
  line-height: 1.6;
}

.system-message .message-body {
  background: #f0f2f5;
}

.bot-message .message-body {
  background: #e8f4ff;
}

/* 进度气泡 */
.progress-bubble,
.satisfaction-bubble {
  background: #ffffff;
  border-radius: 8px;
  padding: 14px;
}

.progress-bar,
.satisfaction-bar {
  height: 10px;
  background: #e5e6eb;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #3370ff;
  border-radius: 5px;
}

.satisfaction-fill.green { background: #00b42a; }
.satisfaction-fill.yellow { background: #ff7d00; }
.satisfaction-fill.orange { background: #ff7d00; }
.satisfaction-fill.red { background: #f53f3f; }

.progress-text,
.satisfaction-text {
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
  text-align: center;
}

.report-bubble {
  background: #ffffff;
  border-radius: 8px;
}

.chat-rightbar {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
</style>
