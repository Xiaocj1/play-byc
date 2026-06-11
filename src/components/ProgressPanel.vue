<template>
  <div class="progress-panel">
    <div class="panel-title">📊 项目进度</div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
    </div>
    <div class="progress-text">{{ progressPercent }}% 已完成</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()
const progressPercent = computed(() => Math.min(100, Math.max(0, game.progress)))
</script>
