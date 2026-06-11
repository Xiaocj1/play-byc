<template>
  <div class="visual-enhancement">
    <!-- 发光效果 -->
    <div v-if="glow" class="glow-effect" :class="`glow-${glowColor}`" :style="glowStyle"></div>
    
    <!-- 渐变背景 -->
    <div v-if="gradient" class="gradient-overlay" :style="gradientStyle"></div>
    
    <!-- 光晕效果 -->
    <div v-if="halo" class="halo-effect" :class="`halo-${haloPosition}`"></div>
    
    <!-- 扫描线效果 -->
    <div v-if="scanline" class="scanline-effect"></div>
    
    <!-- 玻璃拟态效果 -->
    <div v-if="glass" class="glass-effect"></div>
    
    <!-- 阴影层 -->
    <div v-if="shadow" class="shadow-layer" :class="`shadow-${shadowType}`"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  glow: {
    type: Boolean,
    default: false
  },
  glowColor: {
    type: String,
    default: 'primary'
  },
  glowIntensity: {
    type: Number,
    default: 0.5
  },
  glowSize: {
    type: String,
    default: '20px'
  },
  gradient: {
    type: Boolean,
    default: false
  },
  gradientType: {
    type: String,
    default: 'linear',
    validator: (val) => ['linear', 'radial'].includes(val)
  },
  gradientColors: {
    type: Array,
    default: () => ['#667eea', '#764ba2']
  },
  gradientDirection: {
    type: String,
    default: '135deg'
  },
  halo: {
    type: Boolean,
    default: false
  },
  haloPosition: {
    type: String,
    default: 'top',
    validator: (val) => ['top', 'bottom', 'left', 'right', 'center'].includes(val)
  },
  scanline: {
    type: Boolean,
    default: false
  },
  glass: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: Boolean,
    default: false
  },
  shadowType: {
    type: String,
    default: 'ambient',
    validator: (val) => ['ambient', 'directional', 'inner'].includes(val)
  },
  shadowColor: {
    type: String,
    default: '#000'
  }
})

const glowStyle = computed(() => ({
  '--glow-intensity': props.glowIntensity,
  '--glow-size': props.glowSize
}))

const gradientStyle = computed(() => {
  if (props.gradientType === 'linear') {
    return {
      '--gradient-direction': props.gradientDirection,
      '--gradient-color-1': props.gradientColors[0] || '#667eea',
      '--gradient-color-2': props.gradientColors[1] || '#764ba2',
      '--gradient-color-3': props.gradientColors[2] || props.gradientColors[1] || '#764ba2'
    }
  } else {
    return {
      '--gradient-color-1': props.gradientColors[0] || '#667eea',
      '--gradient-color-2': props.gradientColors[1] || '#764ba2'
    }
  }
})
</script>

<style scoped>
.visual-enhancement {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* 发光效果 */
.glow-effect {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at center,
    rgba(102, 126, 234, var(--glow-intensity)) 0%,
    transparent 50%
  );
  animation: glow-pulse 2s ease-in-out infinite;
  pointer-events: none;
}

.glow-primary {
  background: radial-gradient(
    circle at center,
    rgba(102, 126, 234, var(--glow-intensity)) 0%,
    transparent 50%
  );
}

.glow-success {
  background: radial-gradient(
    circle at center,
    rgba(39, 174, 96, var(--glow-intensity)) 0%,
    transparent 50%
  );
}

.glow-warning {
  background: radial-gradient(
    circle at center,
    rgba(243, 156, 18, var(--glow-intensity)) 0%,
    transparent 50%
  );
}

.glow-danger {
  background: radial-gradient(
    circle at center,
    rgba(231, 76, 60, var(--glow-intensity)) 0%,
    transparent 50%
  );
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* 渐变背景 */
.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    var(--gradient-direction, 135deg),
    var(--gradient-color-1) 0%,
    var(--gradient-color-2) 50%,
    var(--gradient-color-3) 100%
  );
  opacity: 0.1;
  pointer-events: none;
}

/* 光晕效果 */
.halo-effect {
  position: absolute;
  width: 100%;
  height: 50%;
  background: linear-gradient(
    to bottom,
    rgba(102, 126, 234, 0.1) 0%,
    transparent 100%
  );
  pointer-events: none;
}

.halo-top {
  top: 0;
  background: linear-gradient(
    to bottom,
    rgba(102, 126, 234, 0.15) 0%,
    transparent 100%
  );
}

.halo-bottom {
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(102, 126, 234, 0.15) 0%,
    transparent 100%
  );
}

.halo-left {
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(102, 126, 234, 0.1) 0%,
    transparent 100%
  );
}

.halo-right {
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to left,
    rgba(102, 126, 234, 0.1) 0%,
    transparent 100%
  );
}

.halo-center {
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at center,
    rgba(102, 126, 234, 0.1) 0%,
    transparent 50%
  );
}

/* 扫描线效果 */
.scanline-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 255, 255, 0.03) 50%,
    transparent 100%
  );
  background-size: 100% 4px;
  pointer-events: none;
  animation: scanline-move 8s linear infinite;
}

@keyframes scanline-move {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 0 100%;
  }
}

/* 玻璃拟态效果 */
.glass-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: inherit;
  pointer-events: none;
}

/* 阴影层 */
.shadow-layer {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 90%;
  border-radius: inherit;
  pointer-events: none;
}

.shadow-ambient {
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.3),
    0 6px 10px -6px rgba(0, 0, 0, 0.2);
}

.shadow-directional {
  box-shadow: 
    0 20px 50px -15px rgba(0, 0, 0, 0.4),
    0 10px 20px -10px rgba(0, 0, 0, 0.3);
}

.shadow-inner {
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.2);
}
</style>
