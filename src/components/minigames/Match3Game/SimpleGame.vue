<template>
  <div class="simple-game">
    <h2>最简单的游戏组件</h2>
    <p>如果看到这个，说明组件加载成功</p>
    <div class="test-grid">
      <div v-for="i in 16" :key="i" class="row">
        <span v-for="j in 16" :key="j" class="cell">📄</span>
      </div>
    </div>
  </div>
</template>

<script setup>
// 最简单的组件，不引入任何composables
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
