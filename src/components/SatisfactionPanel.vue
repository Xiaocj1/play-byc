<template>
  <div class="satisfaction-panel">
    <div class="panel-title">💬 满意度</div>
    <div class="satisfaction-bar">
      <div class="satisfaction-fill" :class="satisfactionClass" :style="{ width: game.satisfaction + '%' }"></div>
    </div>
    <div class="satisfaction-text">{{ game.satisfaction }}%</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()

const satisfactionClass = computed(() => {
  if (game.satisfaction >= 80) return 'green'
  if (game.satisfaction >= 60) return 'yellow'
  if (game.satisfaction >= 40) return 'orange'
  return 'red'
})
</script>
