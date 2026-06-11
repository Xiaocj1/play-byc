<template>
  <div class="weekly-report paper-texture">
    <h3 class="report-title">{{ reportTitle }}</h3>
    <div class="report-section">
      <h4>本周总结</h4>
      <p>{{ summary }}</p>
    </div>
    <div class="report-section">
      <h4>完成事项</h4>
      <p>{{ completed }}</p>
    </div>
    <div class="report-section">
      <h4>下周计划</h4>
      <p>{{ nextPlan }}</p>
    </div>
    <div class="report-section">
      <h4>风险与问题</h4>
      <p>{{ risk }}</p>
    </div>
    <div class="fun-comment">{{ funComment }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'

const game = useGameStore()

// 根据周数生成周报内容
const reportTitle = computed(() => `第 ${game.week} 周周报`)

const summary = computed(() => {
  if (game.week === 1) {
    return '项目启动，团队磨合中'
  } else if (game.week <= 4) {
    return '项目稳步推进，各项工作有序开展'
  } else {
    return '项目按计划进行，取得阶段性进展'
  }
})

const completed = computed(() => {
  if (game.week === 1) {
    return '搭建基础框架，完成需求评审'
  } else if (game.progress > 80) {
    return '核心功能开发完成，进入测试阶段'
  } else if (game.progress > 50) {
    return '完成部分核心模块开发'
  } else {
    return '完成本周开发任务'
  }
})

const nextPlan = computed(() => {
  if (game.progress < 100) {
    return '进入下一阶段开发'
  } else {
    return '准备产品发布'
  }
})

const risk = computed(() => {
  if (game.satisfaction < 50) {
    return '需重点关注客户满意度问题'
  } else if (game.budget < 0) {
    return '资金压力较大，需要关注'
  } else {
    return '暂无重大风险'
  }
})

const funComment = computed(() => {
  const comments = [
    '艾萨克和莫甘娜第一次见面就在代码风格上吵了起来，气氛很微妙。',
    '团队今天又一起吃了火锅，大家关系越来越好了。',
    '小明今天提出了一个很棒的想法，大家都很兴奋。',
    '产品经理和RD今天在需求评审会上又进行了友好的讨论。',
    '测试同学今天发现了一个重要的bug，大家都很感谢她。'
  ]
  return comments[game.week % comments.length]
})
</script>

<style>
/* 最小化的样式，只补充原始CSS没有的部分 */
</style>
