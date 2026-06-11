<template>
  <div
    class="jira-floating-widget"
    :class="{ expanded: isExpanded, minimized: isMinimized, zentao: isZentaoStyle }"
    :style="widgetStyle"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <!-- 最小化状态 -->
    <div v-if="isMinimized" class="widget-minimized" @click="toggleMinimize">
      <span class="widget-min-icon">📊</span>
    </div>

    <!-- 正常状态 -->
    <div v-else class="widget-content">
      <!-- 顶部操作栏 -->
      <div class="widget-header">
        <span class="widget-title">项目仪表盘</span>
        <div class="widget-actions">
          <button class="action-btn" @click.stop="toggleMinimize" title="最小化">_</button>
          <button class="action-btn close" @click.stop="toggleExpand" :title="isExpanded ? '收起' : '展开'">
            {{ isExpanded ? '↑' : '↓' }}
          </button>
        </div>
      </div>

      <!-- 指标区域 -->
      <div class="widget-metrics">
        <!-- 进度 -->
        <div class="widget-item">
          <div class="widget-item-header">
            <span class="widget-icon">📈</span>
            <span class="widget-label">项目进度</span>
            <span class="widget-value">{{ progressPercent }}%</span>
          </div>
          <div v-if="isExpanded" class="widget-progress-bar">
            <div class="widget-progress-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>

        <!-- 满意度 -->
        <div class="widget-item">
          <div class="widget-item-header">
            <span class="widget-icon">💬</span>
            <span class="widget-label">客户满意度</span>
            <span class="widget-value" :class="satisfactionValueClass">{{ game.satisfaction }}%</span>
          </div>
          <div v-if="isExpanded" class="widget-progress-bar">
            <div class="widget-progress-fill satisfaction" :class="satisfactionClass" :style="{ width: game.satisfaction + '%' }"></div>
          </div>
        </div>

        <!-- 预算（额外显示） -->
        <div v-if="isExpanded" class="widget-item">
          <div class="widget-item-header">
            <span class="widget-icon">💰</span>
            <span class="widget-label">预算</span>
            <span class="widget-value" :class="{ negative: game.budget < 0 }">
              ${{ formatNumber(game.budget) }}
            </span>
          </div>
        </div>

        <!-- 时间（额外显示） -->
        <div v-if="isExpanded" class="widget-item">
          <div class="widget-item-header">
            <span class="widget-icon">📅</span>
            <span class="widget-label">第 {{ game.week }} 周</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()

// 状态
const isExpanded = ref(false)
const isMinimized = ref(false)
const position = ref({ x: 20, y: 20 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const startPos = ref({ x: 0, y: 0 })

// 检测是否是禅道风格
const isZentaoStyle = computed(() => {
  return document.body.classList.contains('skin-zentao')
})

// 计算属性
const progressPercent = computed(() => Math.min(100, Math.max(0, game.progress)))

const satisfactionClass = computed(() => {
  if (game.satisfaction >= 80) return 'green'
  if (game.satisfaction >= 60) return 'yellow'
  if (game.satisfaction >= 40) return 'orange'
  return 'red'
})

const satisfactionValueClass = computed(() => {
  if (game.satisfaction >= 80) return 'satisfaction-green'
  if (game.satisfaction >= 60) return 'satisfaction-yellow'
  if (game.satisfaction >= 40) return 'satisfaction-orange'
  return 'satisfaction-red'
})

const widgetStyle = computed(() => ({
  right: 'auto',
  left: position.value.x + 'px',
  bottom: 'auto',
  top: position.value.y + 'px'
}))

// 方法
function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
  if (isMinimized.value) {
    isExpanded.value = false
  }
}

function formatNumber(num) {
  return Math.abs(num).toLocaleString()
}

// 拖拽功能
function startDrag(e) {
  if (e.target.closest('.action-btn')) return
  
  isDragging.value = true
  
  if (e.type === 'touchstart') {
    dragStart.value.x = e.touches[0].clientX
    dragStart.value.y = e.touches[0].clientY
  } else {
    dragStart.value.x = e.clientX
    dragStart.value.y = e.clientY
  }
  
  startPos.value.x = position.value.x
  startPos.value.y = position.value.y
  
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag)
  window.addEventListener('touchend', stopDrag)
}

function onDrag(e) {
  if (!isDragging.value) return
  
  let clientX, clientY
  if (e.type === 'touchmove') {
    clientX = e.touches[0].clientX
    clientY = e.touches[0].clientY
  } else {
    clientX = e.clientX
    clientY = e.clientY
  }
  
  const dx = clientX - dragStart.value.x
  const dy = clientY - dragStart.value.y
  
  // 边界检查，确保不会拖出屏幕
  position.value.x = Math.max(10, Math.min(window.innerWidth - 320, startPos.value.x + dx))
  position.value.y = Math.max(10, Math.min(window.innerHeight - 100, startPos.value.y + dy))
}

function stopDrag() {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

onMounted(() => {
  // 初始化位置到右下角
  position.value.x = window.innerWidth - 300
  position.value.y = window.innerHeight - 200
})

onUnmounted(() => {
  stopDrag()
})
</script>

<style scoped>
.jira-floating-widget {
  position: fixed;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #dfe1e6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 260px;
  user-select: none;
}

.jira-floating-widget:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(0, 0, 0, 0.12);
}

.jira-floating-widget.minimized {
  min-width: 60px;
  width: 60px;
  height: 60px;
  padding: 0;
}

.widget-minimized {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.widget-min-icon {
  font-size: 28px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.widget-content {
  padding: 16px;
}

.widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f4f5f7;
  cursor: grab;
}

.widget-header:active {
  cursor: grabbing;
}

.widget-title {
  font-size: 13px;
  font-weight: 700;
  color: #172b4d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.widget-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #f4f5f7;
  color: #5e6c84;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.action-btn:hover {
  background: #e9eaed;
  color: #172b4d;
}

.action-btn.close:hover {
  background: #ffebe6;
  color: #de350b;
}

.widget-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.widget-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.widget-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.widget-icon {
  font-size: 18px;
}

.widget-label {
  font-size: 12px;
  color: #5e6c84;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex: 1;
}

.widget-value {
  font-size: 20px;
  font-weight: 800;
  color: #172b4d;
  font-variant-numeric: tabular-nums;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', 'Segoe UI Mono', Roboto Mono, monospace;
}

.widget-value.negative {
  color: #de350b;
}

.widget-value.satisfaction-green {
  color: #00875a;
}

.widget-value.satisfaction-yellow {
  color: #b87a00;
}

.widget-value.satisfaction-orange {
  color: #de350b;
}

.widget-value.satisfaction-red {
  color: #d63031;
}

.widget-progress-bar {
  height: 8px;
  background: #f4f5f7;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}

.widget-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0052cc 0%, #0065ff 100%);
  border-radius: 8px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(0, 82, 204, 0.3);
}

.widget-progress-fill.satisfaction.green {
  background: linear-gradient(90deg, #00875a 0%, #00b894 100%);
  box-shadow: 0 0 8px rgba(0, 135, 90, 0.3);
}

.widget-progress-fill.satisfaction.yellow {
  background: linear-gradient(90deg, #b87a00 0%, #fdcb6e 100%);
  box-shadow: 0 0 8px rgba(184, 122, 0, 0.3);
}

.widget-progress-fill.satisfaction.orange {
  background: linear-gradient(90deg, #de350b 0%, #e17055 100%);
  box-shadow: 0 0 8px rgba(222, 53, 11, 0.3);
}

.widget-progress-fill.satisfaction.red {
  background: linear-gradient(90deg, #d63031 0%, #ff7675 100%);
  box-shadow: 0 0 8px rgba(214, 48, 49, 0.3);
}

/* === 禅道风格样式 === */
.jira-floating-widget.zentao {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid #e1e8f0;
}

.jira-floating-widget.zentao:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
}

.jira-floating-widget.zentao .widget-header {
  border-bottom: 1px solid #e1e8f0;
}

.jira-floating-widget.zentao .widget-title {
  color: #2c3e50;
  font-size: 13px;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 700;
}

.jira-floating-widget.zentao .action-btn {
  background: #f0f5fa;
  color: #5e6c84;
  border-radius: 4px;
}

.jira-floating-widget.zentao .action-btn:hover {
  background: #e6f7ff;
  color: #1890ff;
}

.jira-floating-widget.zentao .action-btn.close:hover {
  background: #fff1f0;
  color: #ff4d4f;
}

.jira-floating-widget.zentao .widget-label {
  color: #5e6c84;
  font-size: 12px;
  text-transform: none;
  letter-spacing: 0;
}

.jira-floating-widget.zentao .widget-value {
  color: #2c3e50;
  font-size: 20px;
  font-weight: 800;
  font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}

.jira-floating-widget.zentao .widget-progress-bar {
  height: 6px;
  background: #e1e8f0;
  border-radius: 3px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.jira-floating-widget.zentao .widget-progress-fill {
  background: linear-gradient(90deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 3px;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.25);
}

.jira-floating-widget.zentao .widget-progress-fill.satisfaction.green {
  background: linear-gradient(90deg, #52c41a 0%, #95de64 100%);
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.25);
}

.jira-floating-widget.zentao .widget-progress-fill.satisfaction.yellow {
  background: linear-gradient(90deg, #faad14 0%, #ffc53d 100%);
  box-shadow: 0 0 8px rgba(250, 173, 20, 0.25);
}

.jira-floating-widget.zentao .widget-progress-fill.satisfaction.orange {
  background: linear-gradient(90deg, #fa8c16 0%, #ffa940 100%);
  box-shadow: 0 0 8px rgba(250, 140, 22, 0.25);
}

.jira-floating-widget.zentao .widget-progress-fill.satisfaction.red {
  background: linear-gradient(90deg, #ff4d4f 0%, #ff7875 100%);
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.25);
}

.jira-floating-widget.zentao .widget-value.satisfaction-green {
  color: #52c41a;
}

.jira-floating-widget.zentao .widget-value.satisfaction-yellow {
  color: #faad14;
}

.jira-floating-widget.zentao .widget-value.satisfaction-orange {
  color: #fa8c16;
}

.jira-floating-widget.zentao .widget-value.satisfaction-red {
  color: #ff4d4f;
}
</style>
