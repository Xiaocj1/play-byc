<template>
  <div v-if="showModal" class="prd-modal">
    <div class="prd-content">
      <button class="prd-close" @click="close">X</button>
      
      <div class="document-title">📄 PRD 文档</div>
      
      <div class="prd-section">
        <h4>版本 {{ game.prdVersion }}</h4>
        <p class="document-content">{{ currentPRDContent }}</p>
      </div>
      
      <div class="prd-history-section">
        <h4>📝 PRD更新历史</h4>
        <div id="prd-history" class="prd-history">
          <div v-for="(entry, index) in reversedHistory" :key="index" class="prd-entry">
            <div class="prd-version">{{ entry.version }}</div>
            <div class="prd-change">{{ entry.change }}</div>
            <div class="prd-author">{{ entry.author }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import prdTemplates from '@/data/prd_templates.json';
const game = useGameStore();
const showModal = ref(false);
const prdHistory = ref([...prdTemplates.prd_entries]);
const reversedHistory = computed(() => {
 return [...prdHistory.value].reverse();
});
const currentPRDContent = computed(() => {
 return `产品需求文档 (PRD)
版本: ${game.prdVersion}

【项目背景】
本产品旨在为用户提供公平、透明的服务体验，打造行业标杆。

【核心功能】
1. 核心业务流程优化
2. 用户体验提升
3. 数据分析与决策支持

【当前状态】
产品正在持续迭代中，团队正在努力推进各项功能开发。`;
});
function open() {
 showModal.value = true;
}
function close() {
 showModal.value = false;
}
defineExpose({
 open,
 close
});
</script>

<style scoped>
.prd-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.prd-content {
  background: #16213e;
  border: 2px solid #e94560;
  border-radius: 12px;
  padding: 24px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.prd-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #e94560;
  font-size: 24px;
  cursor: pointer;
}

.document-title {
  font-size: 24px;
  font-weight: bold;
  color: #e94560;
  margin-bottom: 20px;
  text-align: center;
}

.prd-section {
  background: #0f3460;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.prd-section h4 {
  color: #fff;
  margin-bottom: 12px;
}

.document-content {
  color: #ccc;
  line-height: 1.8;
  white-space: pre-wrap;
}

.prd-history-section {
  background: #0f3460;
  border-radius: 8px;
  padding: 16px;
}

.prd-history-section h4 {
  color: #fff;
  margin-bottom: 12px;
}

.prd-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prd-entry {
  background: #16213e;
  padding: 12px;
  border-radius: 4px;
  border-left: 3px solid #e94560;
}

.prd-version {
  font-weight: bold;
  color: #e94560;
  margin-bottom: 4px;
}

.prd-change {
  color: #fff;
  margin-bottom: 4px;
}

.prd-author {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
</style>