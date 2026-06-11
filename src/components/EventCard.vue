<template>
  <div class="event-card">
    <!-- 季度报表美容中状态 -->
    <div v-if="pendingBeauty" class="pending-beauty-state">
      <div class="pending-beauty-icon">📊</div>
      <h4 class="pending-beauty-title">季度报表美容中</h4>
      <p class="pending-beauty-text">请先完成报表美容后继续！</p>
    </div>
    
    <!-- Jira 风格：显示选择结果 -->
    <div v-else-if="showResult && selectedOption" class="jira-result-card">
      <!-- Issue 头部 -->
      <div class="jira-issue-header">
        <span class="jira-issue-icon">📋</span>
        <div class="jira-issue-id">TASK-{{ eventIndex }}</div>
        <div class="jira-issue-status">
          <span class="jira-status-badge" :class="jiraStatusClass">
            {{ jiraStatus }}
          </span>
        </div>
      </div>

      <!-- Issue 内容 -->
      <div class="jira-issue-content">
        <h4 class="jira-issue-title">任务处理完成</h4>
        
        <!-- 变更记录 - Jira 活动流风格 -->
        <div class="jira-activity-stream">
          <div class="jira-activity-item">
            <div class="jira-activity-user">🤖</div>
            <div class="jira-activity-content">
              <div class="jira-activity-header">
                <strong>系统</strong> 更改了任务状态
              </div>
              <div class="jira-activity-details">
                <span class="jira-status-tag from">待处理</span>
                <span class="jira-arrow">→</span>
                <span class="jira-status-tag to">处理中</span>
                <span class="jira-arrow">→</span>
                <span class="jira-status-tag to done">已完成</span>
              </div>
            </div>
          </div>

          <!-- 效果展示 -->
          <div class="jira-activity-item" v-if="selectedOption.effects">
            <div class="jira-activity-user">📊</div>
            <div class="jira-activity-content">
              <div class="jira-activity-header">
                <strong>系统</strong> 更新了项目指标
              </div>
              <div class="jira-effect-list">
                <div v-for="(value, key) in selectedOption.effects" :key="key" class="jira-effect-item">
                  <span class="jira-effect-label">{{ getEffectLabel(key) }}</span>
                  <span class="jira-effect-value" :class="value > 0 ? 'positive' : 'negative'">
                    {{ value > 0 ? '+' : '' }}{{ value }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载动画 -->
      <div class="jira-progress-loader">
        <div class="jira-loader-bar">
          <div class="jira-loader-fill" :style="{ width: loaderProgress + '%' }"></div>
        </div>
        <div class="jira-loader-text">进入下一周 {{ Math.round(loaderProgress) }}%</div>
      </div>
    </div>
    
    <!-- Jira 风格：显示事件和选项 -->
    <div v-else>
      <!-- Issue 卡片头部 -->
      <div class="jira-issue-header select-mode">
        <span class="jira-issue-icon">📝</span>
        <div class="jira-issue-id">ISSUE-{{ eventIndex }}</div>
        <div class="jira-issue-priority">
          <span class="jira-priority-badge">高优先级</span>
        </div>
      </div>

      <!-- Issue 详情 -->
      <div class="jira-issue-content select-mode">
        <h4 class="jira-issue-title" v-if="currentEvent">{{ currentEvent.title }}</h4>
        <div class="jira-issue-description" v-if="currentEvent">
          {{ currentEvent.description }}
        </div>
        
        <!-- 选项按钮 -->
        <div class="jira-issue-actions" v-if="currentEvent">
          <div v-for="(option, index) in currentEvent.options" :key="index" class="jira-action-item">
            <button class="jira-action-btn" @click="handleOption(option)">
              <span class="jira-action-icon">➜</span>
              {{ option.text }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="!currentEvent" class="loading-text">
        加载事件中...
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, watch, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useEventsStore } from '@/stores/events'

const game = useGameStore()
const eventsStore = useEventsStore()

const currentEvent = ref(null)
const showResult = ref(false)
const selectedOption = ref(null)
const loaderProgress = ref(0)
const jiraStatus = ref('处理中')
const pendingBeauty = ref(false)
let loaderInterval = null

// Jira 状态相关
const jiraStatusClass = computed(() => {
  if (jiraStatus.value === '处理中') return 'in-progress'
  if (jiraStatus.value === '已完成') return 'done'
  return ''
})

const eventIndex = computed(() => {
  return game.eventIndex || 1
})

onMounted(() => {
  console.log('EventCard mounted, events count:', eventsStore.events.length)
  console.log('Game direction:', game.direction)
  console.log('Vue app version is running!')
  console.log('game.currentEvent at mount:', game.currentEvent)
  
  checkPendingBeauty()
  // 定时检查
  setInterval(checkPendingBeauty, 1000)
  
  loadCurrentEvent()
})

function checkPendingBeauty() {
  pendingBeauty.value = !!localStorage.getItem('pendingQuarterlyBeauty')
}

onUnmounted(() => {
  if (loaderInterval) {
    clearInterval(loaderInterval)
  }
})

// 监听事件加载完成
watch(() => eventsStore.events.length, (newCount) => {
  console.log('Events count changed:', newCount)
  if (newCount > 0 && !currentEvent.value) {
    loadCurrentEvent()
  }
})

// 监听 game.currentEvent 变化
watch(() => game.currentEvent, (newEvent) => {
  console.log('game.currentEvent changed:', newEvent)
  if (newEvent) {
    currentEvent.value = newEvent
    showResult.value = false
    selectedOption.value = null
    jiraStatus.value = '处理中'
    loaderProgress.value = 0
  } else if (eventsStore.events.length > 0) {
    loadCurrentEvent()
  }
}, { immediate: true })

function loadCurrentEvent() {
  console.log('loadCurrentEvent called, game.currentEvent:', game.currentEvent)
  console.log('eventsStore.events.length:', eventsStore.events.length)
  
  if (game.currentEvent) {
    currentEvent.value = game.currentEvent
    console.log('Using existing event:', currentEvent.value)
  } else if (eventsStore.events.length > 0) {
    console.log('No existing event, getting new random event')
    const event = eventsStore.getRandomEvent(game.direction)
    console.log('Got random event:', event)
    if (event) {
      game.setCurrentEvent(event)
      currentEvent.value = event
      console.log('Event set successfully!')
    } else {
      console.error('Failed to get event!')
      const fallbackEvent = eventsStore.getRandomEvent(null)
      if (fallbackEvent) {
        game.setCurrentEvent(fallbackEvent)
        currentEvent.value = fallbackEvent
        console.log('Fallback event set!')
      }
    }
  } else {
    console.log('Events not loaded yet, waiting...')
  }
}

function getEffectLabel(key) {
  const labels = {
    progress: '进度',
    satisfaction: '满意度',
    fame: '名声',
    budget: '资金'
  }
  return labels[key] || key
}

function handleOption(option) {
  console.log('选择选项:', option)
  
  selectedOption.value = option
  showResult.value = true
  jiraStatus.value = '处理中'
  
  if (option.effects) {
    if (option.effects.progress) {
      game.updateProgress(option.effects.progress)
    }
    if (option.effects.satisfaction) {
      game.updateSatisfaction(option.effects.satisfaction)
    }
    if (option.effects.fame) {
      game.addFame(option.effects.fame)
    }
    if (option.effects.budget) {
      game.updateBudget(option.effects.budget)
    }
  }
  
  game.nextWeek()
  
  startLoaderAnimation()
  
  setTimeout(() => {
    jiraStatus.value = '已完成'
  }, 1500)
  
  setTimeout(() => {
    const nextEvent = eventsStore.getRandomEvent(game.direction)
    if (nextEvent) {
      game.setCurrentEvent(nextEvent)
      game.incrementEventIndex()
    }
  }, 2000)
}

function startLoaderAnimation() {
  loaderProgress.value = 0
  const duration = 2000
  const steps = 50
  const increment = 100 / steps
  const intervalTime = duration / steps
  
  if (loaderInterval) {
    clearInterval(loaderInterval)
  }
  
  loaderInterval = setInterval(() => {
    loaderProgress.value += increment
    if (loaderProgress.value >= 100) {
      loaderProgress.value = 100
      clearInterval(loaderInterval)
    }
  }, intervalTime)
}
</script>

<style>
/* 最小化的样式，只补充原始CSS没有的部分 */
.loading-text {
  color: #888;
  text-align: center;
  padding: 40px;
}

/* Pending Beauty 状态 */
.pending-beauty-state {
  background: #fff;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.pending-beauty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pending-beauty-title {
  font-size: 18px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
}

.pending-beauty-text {
  font-size: 14px;
  color: #6b778c;
  margin: 0;
}


/* Jira 风格：Issue 头部 */
.jira-issue-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #dfe1e6;
  margin-bottom: 15px;
}

.jira-issue-header.select-mode {
  padding: 12px 0;
}

.jira-issue-icon {
  font-size: 20px;
}

.jira-issue-id {
  font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
  font-weight: 600;
  color: #5e6c84;
  font-size: 13px;
}

.jira-issue-status {
  margin-left: auto;
}

.jira-issue-priority {
  margin-left: auto;
}

.jira-status-badge {
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.jira-status-badge.in-progress {
  background: #e3f2ff;
  color: #0052cc;
}

.jira-status-badge.done {
  background: #e3fcef;
  color: #00875a;
}

.jira-priority-badge {
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  background: #fffae6;
  color: #b87a00;
  display: inline-block;
}

/* Jira 风格：Issue 内容 */
.jira-issue-content {
  padding: 0 0 10px;
}

.jira-issue-content.select-mode {
  padding: 0;
}

.jira-issue-title {
  font-size: 15px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.jira-issue-description {
  font-size: 13px;
  color: #344563;
  line-height: 1.5;
  margin-bottom: 15px;
  background: #f4f5f7;
  padding: 10px 12px;
  border-radius: 3px;
  border-left: 3px solid #0052cc;
}

/* Jira 风格：活动流 */
.jira-activity-stream {
  margin: 10px 0;
}

.jira-activity-item {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f4f5f7;
}

.jira-activity-item:last-child {
  border-bottom: none;
}

.jira-activity-user {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f5f7;
  border-radius: 50%;
  font-size: 16px;
  flex-shrink: 0;
}

.jira-activity-content {
  flex: 1;
  min-width: 0;
}

.jira-activity-header {
  font-size: 13px;
  color: #5e6c84;
  margin-bottom: 6px;
}

.jira-activity-header strong {
  color: #172b4d;
  font-weight: 600;
}

.jira-activity-details {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.jira-status-tag {
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.jira-status-tag.from {
  background: #f4f5f7;
  color: #5e6c84;
}

.jira-status-tag.to {
  background: #e3f2ff;
  color: #0052cc;
}

.jira-status-tag.to.done {
  background: #e3fcef;
  color: #00875a;
}

.jira-arrow {
  color: #5e6c84;
  font-size: 12px;
}

/* Jira 风格：效果列表 */
.jira-effect-list {
  display: grid;
  gap: 6px;
  margin-top: 8px;
}

.jira-effect-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  padding: 6px 10px;
  border-radius: 3px;
  border: 1px solid #dfe1e6;
}

.jira-effect-label {
  font-size: 13px;
  color: #344563;
  font-weight: 500;
}

.jira-effect-value {
  font-size: 13px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
}

.jira-effect-value.positive {
  color: #00875a;
  background: #e3fcef;
}

.jira-effect-value.negative {
  color: #de350b;
  background: #ffebe6;
}

/* Jira 风格：操作按钮 */
.jira-issue-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.jira-action-item {
  width: 100%;
}

.jira-action-btn {
  width: 100%;
  background: #0052cc;
  color: #ffffff;
  border: none;
  border-radius: 3px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 8px;
}

.jira-action-btn:hover {
  background: #0047b3;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.jira-action-btn:active {
  transform: translateY(0);
}

.jira-action-icon {
  font-size: 14px;
}

/* Jira 风格：进度加载器 */
.jira-progress-loader {
  margin-top: 15px;
  padding-top: 12px;
  border-top: 1px solid #dfe1e6;
}

.jira-loader-bar {
  height: 6px;
  background: #dfe1e6;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;
}

.jira-loader-fill {
  height: 100%;
  background: linear-gradient(90deg, #0052cc 0%, #00b8d9 100%);
  border-radius: 3px;
  transition: width 0.1s ease;
}

.jira-loader-text {
  text-align: center;
  font-size: 12px;
  color: #5e6c84;
  font-weight: 500;
}
</style>
