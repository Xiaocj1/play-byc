import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import toolchainData from '@/data/toolchain.json'

// 皮肤映射关系（根据direction_default随机选择）
function getRandomSkinForDirection(direction) {
  const defaults = toolchainData.direction_default || {}
  const skins = defaults[direction] || ['pixel']
  
  if (skins.length === 1) {
    return skins[0]
  }
  
  // 随机选择
  return skins[Math.floor(Math.random() * skins.length)]
}

export const DIRECTION_TO_SKIN = {
  'tob': 'jira',      // ToB -> Jira（默认，实际会随机选择Jira或Zentao）
  'toc': 'feishu',    // ToC -> 飞书
  'b2c': 'dingtalk'   // B2C -> 钉钉
}

export const useSkinStore = defineStore('skin', () => {
  const currentSkin = ref('pixel')  // 默认像素风格
  const loadedSkins = ref(new Set(['pixel']))
  
  // 加载皮肤CSS
  const loadSkin = (skinName) => {
    if (loadedSkins.value.has(skinName)) {
      currentSkin.value = skinName
      applySkin(skinName)
      return
    }
    
    // 动态加载皮肤
    if (skinName === 'pixel') {
      currentSkin.value = 'pixel'
      applySkin('pixel')
      return
    }
    
    // 像素风格以外的皮肤，我们会通过class直接应用
    currentSkin.value = skinName
    loadedSkins.value.add(skinName)
    applySkin(skinName)
  }
  
  // 应用皮肤到body
  const applySkin = (skinName) => {
    // 强制清除所有class并设置皮肤class
    document.body.classList.forEach(cls => {
      if (cls.startsWith('skin-')) {
        document.body.classList.remove(cls)
      }
    })
    if (skinName !== 'pixel') {
      document.body.classList.add(`skin-${skinName}`)
    }
    console.log('Skin applied to body:', document.body.className)
  }
  
  // 根据方向加载对应皮肤（ToB会随机选择Jira或Zentao）
  const loadSkinForDirection = (direction) => {
    // ToB方向随机选择Jira或Zentao
    const skinName = direction === 'tob' ? getRandomSkinForDirection(direction) : (DIRECTION_TO_SKIN[direction] || 'pixel')
    console.log('Random skin for direction:', direction, '->', skinName)
    loadSkin(skinName)
  }
  
  return {
    currentSkin,
    loadSkin,
    loadSkinForDirection
  }
})
