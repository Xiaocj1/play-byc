<template>
  <div class="simple-game">
    <h2>游戏组件测试</h2>
    <p>board: {{ board ? '有数据' : '空' }}</p>
    <div class="test-grid">
      <div v-for="(row, i) in board" :key="i" class="row">
        <span v-for="(cell, j) in row" :key="j" class="cell">{{ cell?.icon || '?' }}</span>
      </div>
    </div>
    <button @click="initBoard">初始化棋盘</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBoard } from './composables/useBoard'

const { board, initBoard: boardInit } = useBoard()

function initBoard() {
  boardInit({
    prdProbability: 0.4,
    researchProbability: 0.2,
    bpProbability: 0.15,
    requirementProbability: 0.2,
    inspirationProbability: 0.05,
    disappearProbability: 0.3
  })
}

onMounted(() => {
  initBoard()
})
</script>

<style scoped>
.simple-game {
  background: rgba(0,0,0,0.5);
  padding: 20px;
  border-radius: 12px;
  margin-top: 20px;
}

.test-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 20px;
}

.row {
  display: flex;
  gap: 2px;
}

.cell {
  width: 40px;
  height: 40px;
  background: rgba(255,255,255,0.1);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
</style>
