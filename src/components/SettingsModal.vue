<template>
  <div v-if="visible" class="settings-panel" id="settings-panel" @click.self="close">
    <button class="settings-close" @click="close">×</button>
    <h3 class="settings-title">⚙️ 游戏设置</h3>
    
    <div class="settings-item">
      <div>
        <div class="settings-label">🎆 特效动画</div>
        <div class="settings-description">关闭可提升性能</div>
      </div>
      <div class="settings-toggle" :class="{ active: settings.effectsEnabled !== false }" @click="toggleEffectSettings"></div>
    </div>
    
    <div class="settings-item">
      <div>
        <div class="settings-label">🔊 游戏音效</div>
        <div class="settings-description">开启背景音乐和音效</div>
      </div>
      <div class="settings-toggle" :class="{ active: settings.soundEnabled }" @click="toggleSoundSettings"></div>
    </div>
    
    <div class="settings-item">
      <div>
        <div class="settings-label">💡 提示信息</div>
        <div class="settings-description">显示游戏技巧提示</div>
      </div>
      <div class="settings-toggle" :class="{ active: settings.tipsEnabled !== false }" @click="toggleTipsSettings"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)
const settings = ref({
  effectsEnabled: true,
  soundEnabled: false,
  tipsEnabled: true
})

function open() {
  loadSettings()
  visible.value = true
}

function close() {
  visible.value = false
}

function loadSettings() {
  const saved = localStorage.getItem('game_settings')
  if (saved) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(saved) }
    } catch (e) {
      console.warn('Failed to load settings:', e)
    }
  }
}

function saveSettings() {
  localStorage.setItem('game_settings', JSON.stringify(settings.value))
}

function toggleEffectSettings() {
  settings.value.effectsEnabled = !settings.value.effectsEnabled
  toggleEffectEffects(settings.value.effectsEnabled)
  showToast(settings.value.effectsEnabled ? '🎆 特效已开启' : '🎆 特效已关闭')
  saveSettings()
}

function toggleSoundSettings() {
  settings.value.soundEnabled = !settings.value.soundEnabled
  showToast(settings.value.soundEnabled ? '🔊 音效已开启' : '🔇 音效已关闭')
  saveSettings()
}

function toggleTipsSettings() {
  settings.value.tipsEnabled = !settings.value.tipsEnabled
  showToast(settings.value.tipsEnabled ? '💡 提示已开启' : '💡 提示已关闭')
  saveSettings()
}

function toggleEffectEffects(enabled) {
  if (enabled) {
    document.body.classList.remove('effect-disabled')
  } else {
    document.body.classList.add('effect-disabled')
  }
}

function showToast(message) {
  // 简单的toast实现
  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #172b4d;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 9999;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideDown 0.3s ease;
  `
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transition = 'opacity 0.3s ease'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 2000)
}

defineExpose({ open, close })

onMounted(() => {
  loadSettings()
})
</script>

<style>
.settings-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 2000;
  min-width: 360px;
}

.settings-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 24px;
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

.settings-close:hover {
  background: #f4f5f7;
  color: #333;
}

.settings-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #172b4d;
  font-weight: 600;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f4f5f7;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-label {
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
  margin-bottom: 4px;
}

.settings-description {
  font-size: 12px;
  color: #6b778c;
}

.settings-toggle {
  width: 48px;
  height: 24px;
  background: #dfe1e6;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s;
}

.settings-toggle::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.15);
}

.settings-toggle.active {
  background: #0052cc;
}

.settings-toggle.active::after {
  transform: translateX(24px);
}
</style>
