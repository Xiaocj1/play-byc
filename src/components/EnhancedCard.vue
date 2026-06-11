<template>
  <div
    class="enhanced-card"
    :class="[
      `card-${variant}`,
      { 'card-hoverable': hoverable },
      { 'card-glow': glow }
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <VisualEnhancement
      v-if="glow || gradient"
      :glow="glow && isHovered"
      :glow-color="glowColor"
      :glow-intensity="glowIntensity"
      :gradient="gradient"
      :gradient-colors="gradientColors"
      :gradient-direction="gradientDirection"
    />
    
    <div class="card-content">
      <div v-if="$slots.header" class="card-header">
        <slot name="header"></slot>
      </div>
      
      <div class="card-body">
        <slot></slot>
      </div>
      
      <div v-if="$slots.footer" class="card-footer">
        <slot name="footer"></slot>
      </div>
    </div>
    
    <div v-if="borderGlow && isHovered" class="card-border-glow"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VisualEnhancement from './VisualEnhancement.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'primary', 'secondary', 'success', 'danger', 'warning'].includes(val)
  },
  hoverable: {
    type: Boolean,
    default: true
  },
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
    default: 0.4
  },
  gradient: {
    type: Boolean,
    default: false
  },
  gradientColors: {
    type: Array,
    default: () => ['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']
  },
  gradientDirection: {
    type: String,
    default: '135deg'
  },
  borderGlow: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['mouseenter', 'mouseleave'])
const isHovered = ref(false)

function handleMouseEnter(event) {
  isHovered.value = true
  emit('mouseenter', event)
}

function handleMouseLeave(event) {
  isHovered.value = false
  emit('mouseleave', event)
}
</script>

<style scoped>
.enhanced-card {
  position: relative;
  background: rgba(20, 20, 40, 0.95);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 变体颜色 */
.card-default {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-primary {
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.card-secondary {
  border: 1px solid rgba(245, 87, 108, 0.5);
}

.card-success {
  border: 1px solid rgba(39, 174, 96, 0.5);
}

.card-danger {
  border: 1px solid rgba(231, 76, 60, 0.5);
}

.card-warning {
  border: 1px solid rgba(243, 156, 18, 0.5);
}

/* 可悬停效果 */
.card-hoverable {
  cursor: pointer;
}

.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

/* 发光效果 */
.card-glow.card-hoverable:hover {
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
}

/* 边框发光 */
.card-border-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #667eea, #764ba2) border-box;
  mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
  animation: border-glow-pulse 2s ease-in-out infinite;
}

@keyframes border-glow-pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 内容区域 */
.card-content {
  position: relative;
  z-index: 1;
  padding: 20px;
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-body {
  flex: 1;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 变体特定悬停效果 */
.card-primary.card-hoverable:hover {
  border-color: #667eea;
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
}

.card-secondary.card-hoverable:hover {
  border-color: #f5576c;
  box-shadow: 0 12px 40px rgba(245, 87, 108, 0.4);
}

.card-success.card-hoverable:hover {
  border-color: #4facfe;
  box-shadow: 0 12px 40px rgba(79, 172, 254, 0.4);
}

.card-danger.card-hoverable:hover {
  border-color: #fa709a;
  box-shadow: 0 12px 40px rgba(250, 112, 154, 0.4);
}

.card-warning.card-hoverable:hover {
  border-color: #fee140;
  box-shadow: 0 12px 40px rgba(254, 225, 64, 0.4);
}
</style>
