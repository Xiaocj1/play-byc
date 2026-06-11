<template>
  <div v-if="visible" class="modal" id="quick-guide-modal" @click.self="close">
    <div class="modal-content quick-guide-content">
      <span class="close-modal" @click="close">×</span>
      <h2>❓ 常见问题</h2>
      <div class="quick-guide-list">
        <div v-for="(item, index) in guideItems" :key="index" class="quick-guide-item" @click="toggleAnswer(index)">
          <div class="quick-guide-question">
            {{ item.icon }} {{ item.title }}
            <span class="toggle-icon">{{ expandedIndices.includes(index) ? '▲' : '▼' }}</span>
          </div>
          <div class="quick-guide-answer" :class="{ expanded: expandedIndices.includes(index) }" :id="'answer-' + index">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import tutorialData from '@/data/tutorial.json'

const visible = ref(false)
const expandedIndices = ref([])
const guideItems = ref([])

function open() {
  loadGuideItems()
  visible.value = true
}

function close() {
  visible.value = false
}

function toggleAnswer(index) {
  const i = expandedIndices.value.indexOf(index)
  if (i > -1) {
    expandedIndices.value.splice(i, 1)
  } else {
    expandedIndices.value.push(index)
  }
}

function loadGuideItems() {
  if (tutorialData?.quick_guide?.items) {
    guideItems.value = tutorialData.quick_guide.items
  } else {
    guideItems.value = [
      { icon: '🎮', title: '怎么玩这个游戏？', answer: '每周会随机发生事件，选择不同的选项会影响项目进度、满意度、名声和资金。' },
      { icon: '👥', title: '团队成员有什么用？', answer: '团队成员的好感度会影响他们的工作效率，高好感度能带来更多正面效果。' },
      { icon: '📊', title: '项目进度怎么提高？', answer: '通过选择正确的事件选项、合理分配工作、保持团队士气来提高项目进度。' },
      { icon: '💰', title: '资金不够怎么办？', answer: '可以通过一些事件选项获得资金，或者找机会融资，注意不要让负债过高！' }
    ]
  }
}

defineExpose({ open, close })
</script>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.close-modal {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 28px;
  color: #888;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-modal:hover {
  background: #f4f5f7;
  color: #333;
}

.quick-guide-content h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #172b4d;
  text-align: center;
}

.quick-guide-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-guide-item {
  background: #f4f5f7;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-guide-item:hover {
  background: #e9eaed;
}

.quick-guide-question {
  padding: 12px 16px;
  font-weight: 600;
  color: #172b4d;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toggle-icon {
  color: #888;
  font-size: 14px;
}

.quick-guide-answer {
  padding: 0 16px;
  max-height: 0;
  overflow: hidden;
  color: #6b778c;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.quick-guide-answer.expanded {
  padding: 0 16px 16px 16px;
  max-height: 200px;
}
</style>
