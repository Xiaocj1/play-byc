<template>
  <div class="match3-board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="board-row">
      <Match3Cell
        v-for="(cell, colIndex) in row"
        :key="cell?.id || `${rowIndex}-${colIndex}`"
        :cell="cell"
        :is-selected="selectedCell?.row === rowIndex && selectedCell?.col === colIndex"
        @select="$emit('cell-click', rowIndex, colIndex)"
      />
    </div>
  </div>
</template>

<script setup>
import Match3Cell from './Match3Cell.vue'

defineProps({
  board: {
    type: Array,
    required: true
  },
  selectedCell: {
    type: Object,
    default: null
  }
})

defineEmits(['cell-click'])
</script>

<style scoped>
.match3-board {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.board-row {
  display: flex;
  gap: 2px;
}
</style>