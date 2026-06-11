<template>
  <div class="debug-container">
    <header class="header">
      <h1>🔧 调试面板</h1>
    </header>

    <div class="debug-content">
      <!-- 测试工具区域 -->
      <div class="debug-section">
        <h3>🧪 测试工具</h3>
        <div class="test-buttons">
          <button class="btn btn-secondary" @click="testPvZ">🎮 工位大战铲车测试</button>
          <button class="btn btn-secondary" @click="testReportBeauty">📋 报表美容测试</button>
          <button class="btn btn-secondary" @click="testMatch3">📄 文档消消乐测试</button>
        </div>
      </div>

      <div class="debug-section">
        <h3>Game Store</h3>
        <pre>{{ JSON.stringify(game.$state, null, 2) }}</pre>
      </div>

      <div class="debug-section">
        <h3>Player Store</h3>
        <pre>{{ JSON.stringify(player.$state, null, 2) }}</pre>
      </div>

      <div class="debug-actions">
        <button class="btn btn-primary" @click="goHome">← 返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const game = useGameStore()
const player = usePlayerStore()

function goHome() {
  router.push('/')
}

function testPvZ() {
  router.push('/pvz')
}

function testReportBeauty() {
  // 快速跳转到游戏页面，触发季度报表
  router.push('/game')
}

function testMatch3() {
  router.push('/match3')
}
</script>

<style scoped>
.debug-container {
  min-height: 100vh;
  background: #0f0f23;
  padding: 40px 20px;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.debug-content {
  max-width: 1000px;
  margin: 0 auto;
}

.debug-section {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.debug-section h3 {
  margin-bottom: 16px;
  color: #6366f1;
}

.debug-section pre {
  background: #000;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.9rem;
  color: #00ff00;
}

.test-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.debug-actions {
  text-align: center;
  margin-top: 30px;
}

.btn {
  padding: 12px 24px;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
}

.btn-secondary {
  background: #374151;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}
</style>
