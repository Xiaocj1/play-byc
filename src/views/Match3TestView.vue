<template>
  <div class="match3-test">
    <Match3Game
      :game-config="gameConfig"
      @success="handleSuccess"
      @fail="handleFail"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Match3Game from '@/components/minigames/Match3Game/Match3Game.vue'

const gameConfig = ref({
  target: '消除20个PRD',
  moves: 50,
  docTypes: ['PRD', '需求文档'],
  disappearProbability: 0.3,
  successEffects: { progress: 10, satisfaction: 5 },
  failEffects: { progress: 2, satisfaction: -10 }
})

function handleSuccess(data) {
  console.log('游戏成功:', data)
  alert('成功！进度+10，满意度+5')
}

function handleFail(data) {
  console.log('游戏失败:', data)
  alert('失败...进度+2，满意度-10')
}
</script>

<style scoped>
.match3-test {
  width: 100%;
  height: 100%;
  min-height: 100vh;
  overflow: auto;
  background: #1a1a2e;
}
</style>
