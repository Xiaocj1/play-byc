<template>
  <div class="test-page">
    <h1>🎮 工位大战铲车 - 试玩版</h1>
    <p class="subtitle">保护报表不被甲方攻破！</p>
    
    <PlantsVsZombies />
    
    <div class="instructions">
      <h3>📖 游戏说明</h3>
      <ul>
        <li><strong>🏗️ 放置工位</strong>：点击下方「工位」卡牌，然后点击战场上的空格子（第2-7列）</li>
        <li><strong>👤 放置员工</strong>：选择员工卡牌，然后点击已有工位的格子</li>
        <li><strong>🌻 运营</strong>：每5秒产出25阳光</li>
        <li><strong>🎯 设计</strong>：每5秒发射子弹攻击铲车</li>
        <li><strong>🛡️ QA</strong>：高血量，阻挡铲车前进</li>
        <li><strong>💣 RD</strong>：范围爆炸伤害（一次性使用）</li>
        <li><strong>🧠 保护报表</strong>：不要让铲车到达最左边的报表！</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import PlantsVsZombies from '../components/PlantsVsZombies.vue'
</script>

<style scoped>
.test-page {
  font-family: 'Microsoft YaHei', sans-serif;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 32px;
  margin-bottom: 10px;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
}

.instructions {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.instructions h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.instructions ul {
  margin: 0;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.instructions strong {
  color: #667eea;
}
</style>
