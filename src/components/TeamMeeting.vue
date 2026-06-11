<template>
  <div class="meeting-panel">
    <!-- 会议头部 -->
    <div class="meeting-header">
      <div class="meeting-title">
        <span class="meeting-icon">📹</span>
        <span>{{ meetingTitle }}</span>
      </div>
    </div>

    <!-- 会议视频区域 -->
    <div class="meeting-videos">
      <div 
        v-for="(member, index) in participants" 
        :key="member.instanceId"
        class="video-item"
        :class="{ 'speaking': member.isSpeaking }"
      >
        <div class="video-avatar">
          <img v-if="member.portrait" :src="member.portrait" :alt="member.name" class="avatar-img" />
          <span v-else class="video-avatar-placeholder">{{ member.name.charAt(0) }}</span>
        </div>
        <div class="video-info">
          <span class="video-name">{{ member.name }}</span>
          <span class="video-status" v-if="member.isSpeaking">
            <span class="speaking-icon">🔊</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 会议状态区 - 进度和满意度 -->
    <div class="meeting-status">
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">📈 项目进度</span>
          <span class="progress-value">{{ progressPercent }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <div class="progress-meta">
          第{{ game.week }}周 · 预计第{{ estimatedWeek }}周交付
        </div>
      </div>

      <div class="satisfaction-card">
        <div class="satisfaction-header">
          <span class="satisfaction-label">{{ satisfactionEmoji }} 满意度</span>
          <span class="satisfaction-value">{{ game.satisfaction }}%</span>
        </div>
        <div class="satisfaction-bar">
          <div 
            class="satisfaction-fill" 
            :class="satisfactionClass" 
            :style="{ width: game.satisfaction + '%' }"
          ></div>
        </div>
        <div class="satisfaction-meta">
          {{ satisfactionTrend }} · {{ bestDepartment }}
        </div>
      </div>
    </div>

    <!-- 会议纪要 -->
    <div class="meeting-minutes">
      <div class="minutes-title">
        <span class="minutes-icon">📋</span>
        <span>会议纪要 - 本周周报</span>
      </div>
      <div class="minutes-content">
        <WeeklyReport />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'
import { useCardsStore } from '@/stores/cards'
import { useSkinStore } from '@/stores/skin'
import WeeklyReport from './WeeklyReport.vue'

const game = useGameStore()
const cardsStore = useCardsStore()
const skinStore = useSkinStore()

// 会议标题 - 根据皮肤区分
const meetingTitle = computed(() => {
  if (skinStore.currentSkin === 'feishu') {
    return '飞书视频会议'
  } else if (skinStore.currentSkin === 'dingtalk') {
    return '钉钉视频会议'
  }
  return '团队同步会'
})

// 参与者列表
const participants = computed(() => {
  const members = cardsStore.backpack.slice(0, 4)
  return members.map((member, index) => ({
    ...member,
    isSpeaking: speakingIndex.value === index
  }))
})

// 发言中索引
const speakingIndex = ref(0)

// 进度百分比
const progressPercent = computed(() => Math.min(100, Math.max(0, game.progress)))

// 预计周数
const estimatedWeek = computed(() => {
  if (game.progress >= 100) return game.week
  const remaining = 100 - game.progress
  const weeksNeeded = Math.ceil(remaining / 10)
  return game.week + weeksNeeded
})

// 满意度样式
const satisfactionClass = computed(() => {
  if (game.satisfaction >= 80) return 'green'
  if (game.satisfaction >= 60) return 'yellow'
  if (game.satisfaction >= 40) return 'orange'
  return 'red'
})

// 满意度表情
const satisfactionEmoji = computed(() => {
  if (game.satisfaction >= 80) return '😊'
  if (game.satisfaction >= 60) return '😐'
  if (game.satisfaction >= 40) return '😟'
  return '😠'
})

// 满意度趋势
const satisfactionTrend = computed(() => {
  const trends = ['稳定运行', '小幅波动', '持续上升', '需要关注']
  return trends[game.week % trends.length]
})

// 最佳部门
const bestDepartment = computed(() => {
  const depts = ['RD部门表现最佳', 'QA测试零Bug', '运营数据亮眼', '设计创意不断']
  return depts[game.week % depts.length]
})

// 随机切换发言者
let speakingTimer = null
function startSpeakingTimer() {
  speakingTimer = setInterval(() => {
    if (participants.value.length > 0) {
      speakingIndex.value = Math.floor(Math.random() * participants.value.length)
    }
  }, 5000 + Math.floor(Math.random() * 5000)) // 5-10秒切换一次
}

function stopSpeakingTimer() {
  if (speakingTimer) {
    clearInterval(speakingTimer)
    speakingTimer = null
  }
}

onMounted(() => {
  startSpeakingTimer()
})

onUnmounted(() => {
  stopSpeakingTimer()
})
</script>
