<template>
  <div class="select-page">
    <h1 class="select-title">🚀 选择你的创业方向</h1>
    <div class="select-cards">
      <div 
        v-for="(config, dir) in directionConfigs" 
        :key="dir"
        class="select-card" 
        :class="`select-card-${dir}`"
        @click="selectDirection(dir)"
      >
        <div class="select-card-icon">{{ config.icon }}</div>
        <h2 class="select-card-title">{{ config.name }}</h2>
        <p class="select-card-desc">{{ getDirectionDesc(dir) }}</p>
        
        <div class="select-card-mechanics">
          <div class="mechanics-title">🎮 独特玩法</div>
          <div class="mechanic-list">
            <div v-for="mech in config.uniqueMechanics" :key="mech" class="mechanic-item">
              {{ getMechanicName(mech) }}
            </div>
          </div>
        </div>
        
        <div class="select-card-stats">
          <div class="stat-item">
            <span class="stat-label">风险</span>
            <span class="stat-value">{{ getRiskLevel(dir) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">潜力</span>
            <span class="stat-value">{{ getPotentialLevel(dir) }}</span>
          </div>
        </div>
        
        <p class="select-card-detail">{{ config.successEnding }}</p>
      </div>
    </div>

    <StoryModal
      v-model="showStoryModal"
      :title="storyTitle"
      :text="storyText"
      :button-text="storyButtonText"
      @confirm="onStoryConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '../stores/game';
import { usePlayerStore } from '../stores/player';
import { useSkinStore } from '../stores/skin';
import StoryModal from '../components/StoryModal.vue';
import storiesData from '@/data/stories.json';
import toolchainData from '@/data/toolchain.json';
import directionConfig from '@/data/direction_config.json';

const router = useRouter();
const gameStore = useGameStore();
const playerStore = usePlayerStore();
const skinStore = useSkinStore();

const showStoryModal = ref(false);
const storyTitle = ref('');
const storyText = ref('');
const storyButtonText = ref('');
let currentStoryStep = ref('opening');
let pendingDirection = ref(null);
const directionConfigs = directionConfig;

const STORY_KEY = "fair_office_story_state";

onMounted(() => {
  checkStoryProgress();
});

function checkStoryProgress() {
  const saved = localStorage.getItem(STORY_KEY);
  if (!saved || saved === 'opening') {
    showOpeningStory();
  } else {
    // 直接显示选择页面
  }
}

function showOpeningStory() {
  const story = storiesData.founder_notes.opening;
  storyTitle.value = story.title;
  storyText.value = story.content;
  storyButtonText.value = story.choices[0].text;
  currentStoryStep.value = 'opening';
  showStoryModal.value = true;
}

function getDirectionDesc(direction) {
  const descs = {
    'tob': '服务企业，稳扎稳打，长期合作',
    'toc': '做产品，赌一个爆款，病毒式增长',
    'b2c': '做平台，赚抽成，双边市场效应'
  };
  return descs[direction];
}

function getMechanicName(mech) {
  const names = {
    'contractNegotiation': '合同谈判',
    'clientRetention': '客户留存',
    'complianceRisk': '合规风险',
    'viralGrowth': '病毒式增长',
    'a_b_testing': 'A/B测试',
    'userRetention': '用户留存',
    'twoSidedMarket': '双边市场',
    'networkEffect': '网络效应',
    'ecosystemBuilding': '生态建设'
  };
  return names[mech] || mech;
}

function getRiskLevel(direction) {
  const levels = { 'tob': '🟢 低', 'toc': '🔴 高', 'b2c': '🟡 中' };
  return levels[direction];
}

function getPotentialLevel(direction) {
  const levels = { 'tob': '⭐⭐⭐', 'toc': '⭐⭐⭐⭐⭐', 'b2c': '⭐⭐⭐⭐' };
  return levels[direction];
}

function selectDirection(direction) {
  pendingDirection.value = direction;
  
  const story = storiesData.founder_notes.direction_intro[direction];
  if (story) {
    storyTitle.value = story.title;
    storyText.value = story.content;
    storyButtonText.value = '确认选择';
    currentStoryStep.value = 'direction';
    showStoryModal.value = true;
  } else {
    startGame(direction);
  }
}

function selectToolchain(direction) {
  const availableToolchains = toolchainData.direction_default[direction];
  if (!availableToolchains || availableToolchains.length === 0) {
    return 'feishu';
  }
  
  const randomIndex = Math.floor(Math.random() * availableToolchains.length);
  return availableToolchains[randomIndex];
}

function startGame(direction) {
  localStorage.removeItem(STORY_KEY);
  gameStore.startNewGame(direction);
  
  const toolchainId = selectToolchain(direction);
  const selectedToolchain = toolchainData.toolchains[toolchainId];
  localStorage.setItem("fair_office_toolchain_theme", toolchainId);
  
  skinStore.loadSkinForDirection(direction);
  
  router.push('/game');
}

function onStoryConfirm() {
  if (currentStoryStep.value === 'opening') {
    localStorage.setItem(STORY_KEY, 'opening_done');
    showStoryModal.value = false;
  } else if (currentStoryStep.value === 'direction' && pendingDirection.value) {
    startGame(pendingDirection.value);
  }
}
</script>

<style scoped>
.select-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  z-index: 99999;
  overflow-y: auto;
  padding: 40px 20px;
}
.select-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  color: #ffd700;
  text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700;
  margin-bottom: 60px;
  text-align: center;
  animation: titleGlow 2s ease-in-out infinite;
}
@keyframes titleGlow {
  0%, 100% { text-shadow: 0 0 20px #ffd700, 0 0 40px #ffd700; }
  50% { text-shadow: 0 0 30px #ffd700, 0 0 60px #ffd700, 0 0 80px #ffd700; }
}
.select-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 40px;
  max-width: 1200px;
  width: 100%;
}
.select-card {
  background: rgba(0, 0, 0, 0.7);
  border: 4px solid #333;
  padding: 30px 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.select-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, transparent, var(--card-color, #ffd700), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.select-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px var(--card-shadow, rgba(255, 215, 0, 0.2));
}
.select-card:hover::before {
  opacity: 1;
}

.select-card-tob {
  --card-color: #10b981;
  --card-shadow: rgba(16, 185, 129, 0.3);
}
.select-card-tob:hover {
  border-color: #10b981;
}

.select-card-toc {
  --card-color: #3b82f6;
  --card-shadow: rgba(59, 130, 246, 0.3);
}
.select-card-toc:hover {
  border-color: #3b82f6;
}

.select-card-b2c {
  --card-color: #f59e0b;
  --card-shadow: rgba(245, 158, 11, 0.3);
}
.select-card-b2c:hover {
  border-color: #f59e0b;
}

.select-card-icon {
  font-size: 70px;
  margin-bottom: 20px;
}
.select-card-title {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px;
  color: var(--card-color, #00ff41);
  margin-bottom: 12px;
}
.select-card-desc {
  font-size: 12px;
  color: #fff;
  margin-bottom: 18px;
  line-height: 1.6;
}

.select-card-mechanics {
  margin: 20px 0;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}
.mechanics-title {
  font-size: 11px;
  color: #888;
  margin-bottom: 10px;
  font-family: 'Press Start 2P', monospace;
}
.mechanic-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.mechanic-item {
  font-size: 10px;
  color: var(--card-color, #fff);
  background: rgba(0, 0, 0, 0.3);
  padding: 5px 10px;
  border-radius: 15px;
}

.select-card-stats {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
  padding: 12px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.stat-label {
  font-size: 10px;
  color: #888;
  font-family: 'Press Start 2P', monospace;
}
.stat-value {
  font-size: 12px;
  color: #fff;
  font-weight: bold;
}

.select-card-detail {
  font-size: 10px;
  color: #888;
  line-height: 1.6;
  margin-top: 15px;
}

@media (max-width: 900px) {
  .select-cards {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  .select-title {
    font-size: 18px;
  }
  .select-card-icon {
    font-size: 60px;
  }
}
</style>
