<template>
  <canvas 
    ref="canvasRef" 
    class="particle-canvas"
    :class="{ active }"
  ></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
const active = ref(false)
const type = ref('sparkle')
const color = ref('#ffd700')
const count = ref(50)
const duration = ref(2000)

let animationId = null
let particles = []
let startTime = null

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
})

watch(active, (newVal) => {
  if (newVal) {
    startParticleEffect()
  } else {
    stopParticleEffect()
  }
})

function startParticleEffect() {
  const canvas = canvasRef.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  particles = []
  startTime = Date.now()
  
  // 创建粒子
  for (let i = 0; i < count.value; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 5 + 2,
      alpha: 1,
      color: color.value
    })
  }
  
  function animate() {
    const elapsed = Date.now() - startTime
    if (elapsed > duration.value) {
      stopParticleEffect()
      return
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    particles.forEach(p => {
      p.x += p.vx
      p.y += p.vy
      p.alpha -= 0.02
      
      if (p.alpha > 0) {
        ctx.globalAlpha = p.alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
    ctx.globalAlpha = 1
    animationId = requestAnimationFrame(animate)
  }
  
  animate()
}

function stopParticleEffect() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  
  const canvas = canvasRef.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  
  active.value = false
}

defineExpose({ active, type, color, count, duration })
</script>

<style scoped>
.particle-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9998;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.particle-canvas.active {
  opacity: 1;
}
</style>
