
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('  报表美容院 - 平衡性自动化测试');
console.log('========================================\n');

// 从report_beauty.js中读取DYNAMIC_THRESHOLDS的默认值
const DEFAULT_THRESHOLDS = {
  A: 55, B: 35, C: 35, D: 2, E: 45, 
  F: 25, G: 0.4, H: 28, I: 90, debtX: 0.8
};

// 坏词映射（与report_beauty.js中一致）
const BAD_WORD_MAPPING = {
  budgetNeg: { bad: '亏损', severity: 5 },
  satLow: { bad: '员工满意度低', severity: 3 },
  coreEmployeeLeave: { bad: '核心员工离职', severity: 4 },
  highDebt: { bad: '负债压力大', severity: 3 },
  lowFame: { bad: '市场口碑崩盘', severity: 5 },
  noProfit: { bad: '连续未盈利', severity: 3 },
  lostClients: { bad: '大客户流失', severity: 4 },
  lowRenewal: { bad: '续约率低', severity: 3 },
  dauDrop: { bad: '日活暴跌', severity: 3 },
  lowLtv: { bad: '用户价值低', severity: 2 },
  highDispute: { bad: '纠纷率飙升', severity: 3 },
  lowGmv: { bad: '交易额暴跌', severity: 4 },
  rndFail: { bad: '研发失败', severity: 2 },
  productDelay: { bad: '产品延期', severity: 2 },
  overtime: { bad: '加班严重', severity: 1 }
};

// 模拟生成随机gameState
function generateRandomGameState(direction = 'tob') {
  const state = {
    direction: direction,
    budget: Math.floor(Math.random() * 200) - 50, // -50~150
    satisfaction: Math.floor(Math.random() * 100), // 0~100
    fame: Math.floor(Math.random() * 100), // 0~100
    debt: Math.floor(Math.random() * 150), // 0~150
    debtLimit: 100,
    consecutiveProfitableQuarters: Math.floor(Math.random() * 5), // 0~4
    week: 12
  };
  
  if (direction === 'tob') {
    state.benchmarkClients = Math.floor(Math.random() * 10); // 0~9
    state.renewalRate = Math.floor(Math.random() * 100); // 0~100
  } else if (direction === 'toc') {
    state.dau = Math.floor(Math.random() * 100); // 0~100
    state.ltv = Math.random() * 2; // 0~2
  } else { // b2c
    state.disputeRate = Math.floor(Math.random() * 50); // 0~50
    state.gmv = Math.floor(Math.random() * 200); // 0~200
  }
  
  return state;
}

// 根据阈值计算坏词数量
function calculateBadWords(state, thresholds) {
  const candidates = [];
  
  if (state.budget < 0) candidates.push(BAD_WORD_MAPPING.budgetNeg);
  if (state.satisfaction < thresholds.A) candidates.push(BAD_WORD_MAPPING.satLow);
  if (state.satisfaction < thresholds.B) candidates.push(BAD_WORD_MAPPING.coreEmployeeLeave);
  if (state.debt > state.debtLimit * thresholds.debtX) candidates.push(BAD_WORD_MAPPING.highDebt);
  if (state.fame < thresholds.C) candidates.push(BAD_WORD_MAPPING.lowFame);
  if (state.consecutiveProfitableQuarters === 0) candidates.push(BAD_WORD_MAPPING.noProfit);
  
  if (state.direction === 'tob') {
    if (state.benchmarkClients < thresholds.D) candidates.push(BAD_WORD_MAPPING.lostClients);
    if (state.renewalRate < thresholds.E) candidates.push(BAD_WORD_MAPPING.lowRenewal);
  } else if (state.direction === 'toc') {
    if (state.dau < thresholds.F) candidates.push(BAD_WORD_MAPPING.dauDrop);
    if (state.ltv < thresholds.G) candidates.push(BAD_WORD_MAPPING.lowLtv);
  } else {
    if (state.disputeRate > thresholds.H) candidates.push(BAD_WORD_MAPPING.highDispute);
    if (state.gmv < thresholds.I) candidates.push(BAD_WORD_MAPPING.lowGmv);
  }
  
  // 按严重程度排序，取前5个
  candidates.sort((a, b) => b.severity - a.severity);
  return Math.min(5, candidates.length);
}

// 运行单次测试
function runSingleTest(thresholds, direction) {
  const state = generateRandomGameState(direction);
  return calculateBadWords(state, thresholds);
}

// 运行完整测试
function runFullTest(thresholds, iterations = 1000) {
  const results = {
    tob: { counts: [], perfect: 0, collapse: 0 },
    toc: { counts: [], perfect: 0, collapse: 0 },
    b2c: { counts: [], perfect: 0, collapse: 0 }
  };
  
  const directions = ['tob', 'toc', 'b2c'];
  
  for (let i = 0; i < iterations; i++) {
    for (const dir of directions) {
      const count = runSingleTest(thresholds, dir);
      results[dir].counts.push(count);
      if (count === 0) results[dir].perfect++;
      if (count === 5) results[dir].collapse++;
    }
  }
  
  return results;
}

// 计算统计数据
function calculateStats(results) {
  const allCounts = [
    ...results.tob.counts,
    ...results.toc.counts,
    ...results.b2c.counts
  ];
  
  const avgCount = allCounts.reduce((a, b) => a + b, 0) / allCounts.length;
  const totalPerfect = results.tob.perfect + results.toc.perfect + results.b2c.perfect;
  const totalCollapse = results.tob.collapse + results.toc.collapse + results.b2c.collapse;
  const totalIterations = allCounts.length;
  
  return {
    avgBadWords: avgCount,
    perfectRate: totalPerfect / totalIterations,
    collapseRate: totalCollapse / totalIterations
  };
}

// 打印测试结果
function printResults(results, thresholds) {
  console.log('当前阈值设置:');
  console.log(JSON.stringify(thresholds, null, 2));
  console.log('\n测试结果:');
  
  const stats = calculateStats(results);
  
  console.log(`\n平均坏词数: ${stats.avgBadWords.toFixed(2)}`);
  console.log(`完美季度概率: ${(stats.perfectRate * 100).toFixed(2)}%`);
  console.log(`崩盘季度概率: ${(stats.collapseRate * 100).toFixed(2)}%`);
  
  console.log('\n按模式细分:');
  for (const dir of ['tob', 'toc', 'b2c']) {
    const dirStats = {
      avg: results[dir].counts.reduce((a, b) => a + b, 0) / results[dir].counts.length,
      perfect: (results[dir].perfect / results[dir].counts.length) * 100,
      collapse: (results[dir].collapse / results[dir].counts.length) * 100
    };
    console.log(`  ${dir}: 平均${dirStats.avg.toFixed(2)}个坏词, 完美${dirStats.perfect.toFixed(2)}%, 崩盘${dirStats.collapse.toFixed(2)}%`);
  }
  
  // 检查是否满足平衡目标
  const isBalanced = 
    stats.avgBadWords >= 2.5 && stats.avgBadWords <= 3.5 &&
    stats.perfectRate < 0.05 &&
    stats.collapseRate < 0.10;
  
  console.log('\n平衡性检查:');
  console.log(`  平均坏词数 2.5~3.5: ${stats.avgBadWords >= 2.5 && stats.avgBadWords <= 3.5 ? '✓ 通过' : '✗ 未通过'}`);
  console.log(`  完美季度 < 5%: ${stats.perfectRate < 0.05 ? '✓ 通过' : '✗ 未通过'}`);
  console.log(`  崩盘季度 < 10%: ${stats.collapseRate < 0.10 ? '✓ 通过' : '✗ 未通过'}`);
  console.log(`\n总体: ${isBalanced ? '✓ 平衡目标达成' : '✗ 需调整阈值'}`);
  
  return isBalanced;
}

// 简单的自动调整阈值算法
function optimizeThresholds(initialThresholds, maxIterations = 20) {
  let bestThresholds = { ...initialThresholds };
  let bestStats = null;
  let bestScore = Infinity;
  
  console.log('开始优化阈值...\n');
  
  for (let iter = 0; iter < maxIterations; iter++) {
    const testThresholds = { ...bestThresholds };
    
    // 随机微调阈值
    const keys = ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'I'];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const adjustment = (Math.random() - 0.5) * 10; // ±5
    testThresholds[randomKey] = Math.max(10, Math.min(90, testThresholds[randomKey] + adjustment));
    
    const results = runFullTest(testThresholds, 300); // 快速测试用较少迭代
    const stats = calculateStats(results);
    
    // 计算评分（越小越好）
    const avgDeviation = Math.abs(stats.avgBadWords - 3);
    const perfectDeviation = Math.max(0, stats.perfectRate - 0.05) * 100;
    const collapseDeviation = Math.max(0, stats.collapseRate - 0.10) * 100;
    const score = avgDeviation * 10 + perfectDeviation + collapseDeviation;
    
    if (bestStats === null || score < bestScore) {
      bestThresholds = { ...testThresholds };
      bestStats = stats;
      bestScore = score;
      console.log(`迭代 ${iter + 1}: 找到更好的阈值，评分 ${score.toFixed(2)}`);
    }
  }
  
  console.log('\n优化完成！');
  return bestThresholds;
}

// 主函数
async function main() {
  console.log('开始1000次模拟测试...\n');
  
  // 初始测试
  const initialResults = runFullTest(DEFAULT_THRESHOLDS, 1000);
  let finalThresholds = { ...DEFAULT_THRESHOLDS };
  
  console.log('--- 初始阈值测试 ---');
  const isInitiallyBalanced = printResults(initialResults, DEFAULT_THRESHOLDS);
  
  if (!isInitiallyBalanced) {
    console.log('\n--- 开始自动优化阈值 ---');
    finalThresholds = optimizeThresholds(DEFAULT_THRESHOLDS);
    
    console.log('\n--- 最终验证测试 ---');
    const finalResults = runFullTest(finalThresholds, 1000);
    printResults(finalResults, finalThresholds);
  }
  
  // 保存最佳阈值到配置文件
  const configPath = path.join(__dirname, '..', 'data', 'report_beauty_balance.json');
  const configData = {
    thresholds: finalThresholds,
    generatedAt: new Date().toISOString(),
    description: '报表美容院平衡性配置'
  };
  
  fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
  console.log(`\n✅ 最佳阈值已保存到: ${configPath}`);
  
  console.log('\n========================================');
  console.log('  测试完成！');
  console.log('========================================');
}

main().catch(console.error);

