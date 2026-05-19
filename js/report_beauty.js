// ============ 报表美容院核心模块 ============
const REPORT_BEAUTY_STORAGE_KEY = 'fair_office_report_beauty_state';

let reportBeautyState = {
  stage: 1, // 1:乱糟糟报表, 2:PK, 3:矿工, 4:美容后
  badWords: [],
  beautifiedWords: [],
  currentHookCount: 0,
  totalHookCount: 0,
  pkRound: 1,
  currentOpponentCamp: null,
  selectedCard: null,
  pkWins: 0,
  gameStateRef: null,
  minerTimer: null,
  canvas: null,
  ctx: null,
  hookX: 0,
  hookY: 0,
  hookAngle: 0,
  hookDirection: 1,
  hookSpeed: 0.03,
  hookLaunched: false,
  hookLength: 0,
  maxHookLength: 250,
  hookReturning: false,
  caughtItem: null,
  minerItems: [],
  isB2Version: false,
  hookUpgrades: { length: 0, speed: 0, magnet: 0 },
  selectedPKCards: [],
  isTransitioning: false,
  usedReverse: false,
  active: false  // 是否正在进行中
};

const CAMPS = ['运营', '设计', 'QA', 'RD'];
const CAMP_COUNTER = {
  '运营': '设计',
  '设计': 'QA',
  'QA': 'RD',
  'RD': '运营'
};

let reportWordsData = null;

async function loadReportWords() {
  try {
    const response = await fetch('data/report_words.json');
    reportWordsData = await response.json();
  } catch (error) {
    console.error('Failed to load report words:', error);
  }
}

function startReportBeauty() {
  if (!reportWordsData) {
    loadReportWords().then(() => initializeReportBeauty());
  } else {
    initializeReportBeauty();
  }
}

// 保存报表美容进度到localStorage
function saveReportBeautyState() {
  // 只保存需要持久化的字段
  const stateToSave = {
    active: reportBeautyState.active,
    stage: reportBeautyState.stage,
    badWords: reportBeautyState.badWords,
    beautifiedWords: reportBeautyState.beautifiedWords,
    currentHookCount: reportBeautyState.currentHookCount,
    totalHookCount: reportBeautyState.totalHookCount,
    pkRound: reportBeautyState.pkRound,
    pkWins: reportBeautyState.pkWins,
    isB2Version: reportBeautyState.isB2Version,
    hookUpgrades: reportBeautyState.hookUpgrades,
    usedReverse: reportBeautyState.usedReverse,
    quarter: getCurrentQuarter()  // 记录是哪个季度的
  };
  localStorage.setItem(REPORT_BEAUTY_STORAGE_KEY, JSON.stringify(stateToSave));
  // 调用主保存函数
  if (typeof saveGame === 'function') {
    saveGame();
  }
}

// 尝试恢复报表美容进度
function tryRestoreReportBeautyState() {
  const saved = localStorage.getItem(REPORT_BEAUTY_STORAGE_KEY);
  if (saved) {
    try {
      const stateData = JSON.parse(saved);
      // 检查是否是当前季度的数据
      if (stateData.quarter === getCurrentQuarter() && stateData.active) {
        return stateData;
      }
    } catch (e) {
      console.error('Failed to restore report beauty state:', e);
    }
  }
  return null;
}

// 清除报表美容进度
function clearReportBeautyState() {
  localStorage.removeItem(REPORT_BEAUTY_STORAGE_KEY);
  // 重置gameState中的数据（BUG-004）
  if (gameState.reportBeauty) {
    gameState.reportBeauty.pkWins = 0;
    gameState.reportBeauty.hookCount = 0;
    gameState.reportBeauty.beautifiedWords = [];
    gameState.reportBeauty.upgradeLevels = { length: 0, speed: 0, magnetism: 0 };
  }
  gameState.thisQuarterUsedAutoBeauty = false;
}

// 更新按钮状态（BUG-002）
function updateBeautyButtonsState() {
  const beautyBtn = document.querySelector('.report-beauty-btn');
  const autoBtn = document.querySelector('.auto-beauty-btn');
  const backpack = getBackpack() || [];
  const hasCards = backpack.filter(c => !c.is_variant && c.durability > 0).length > 0;
  
  if (beautyBtn) {
    if (!hasCards) {
      beautyBtn.disabled = true;
      beautyBtn.classList.add('disabled');
      beautyBtn.title = '需要至少1张可用卡牌才能使用报表美容';
    } else {
      beautyBtn.disabled = false;
      beautyBtn.classList.remove('disabled');
    }
  }
  
  if (autoBtn) {
    const hasCoupons = (gameState.autoBeautyCoupons || 0) > 0;
    const canUse = hasCards && hasCoupons && !gameState.thisQuarterUsedAutoBeauty;
    if (!canUse) {
      autoBtn.disabled = true;
      autoBtn.classList.add('disabled');
      if (!hasCards) autoBtn.title = '需要至少1张可用卡牌';
      else if (!hasCoupons) autoBtn.title = '没有自动美容券';
      else if (gameState.thisQuarterUsedAutoBeauty) autoBtn.title = '本季度已使用过自动美容';
    } else {
      autoBtn.disabled = false;
      autoBtn.classList.remove('disabled');
    }
  }
}

function initializeReportBeauty() {
  // 检查是否有需要恢复的进度
  const restored = tryRestoreReportBeautyState();
  
  if (restored) {
    // 恢复进度
    reportBeautyState = {
      ...reportBeautyState,
      ...restored,
      gameStateRef: gameState,
      minerTimer: null,
      canvas: null,
      ctx: null
    };
  } else {
    // 新的开始
  reportBeautyState = {
    stage: 1,
    badWords: [],
    beautifiedWords: [],
    currentHookCount: 0,
    totalHookCount: 0,
    pkRound: 1,
    currentOpponentCamp: null,
    selectedCard: null,
    pkWins: 0,
    gameStateRef: gameState,
    minerTimer: null,
    canvas: null,
    ctx: null,
    hookX: 0,
    hookY: 0,
    hookAngle: 0,
    hookDirection: 1,
    hookSpeed: 0.03,
    hookLaunched: false,
    hookLength: 0,
    maxHookLength: 250,
    hookReturning: false,
    caughtItem: null,
    minerItems: [],
    isB2Version: false,
    hookUpgrades: { length: 0, speed: 0, magnet: 0 },
    selectedPKCards: [],
    isTransitioning: false,
    active: true,
    hasSSRWin: false,
    comboBonusUsed: 0
  };
    
    // 计算图鉴解锁率
    const unlockRate = calculateUnlockRate();
    reportBeautyState.isB2Version = unlockRate >= 0.33;
  }
  
  reportBeautyState.active = true;
  document.getElementById('report-beauty-modal').style.display = 'flex';
  
  // 如果是新开始，生成乱报表
  if (!restored) {
    generateUglyReport();
  }
  
  showStage(reportBeautyState.stage);
  saveReportBeautyState();
  
  // 更新按钮状态
  updateBeautyButtonsState();
}

function calculateUnlockRate() {
  // 从localStorage获取解锁的卡牌
  const unlockedCards = JSON.parse(localStorage.getItem(window.UNLOCKED_CARDS_KEY || '[]'));
  // 或者从window.unlockedCards获取
  if (window.unlockedCards && Array.isArray(window.unlockedCards)) {
    return Math.min(1, window.unlockedCards.length / 10);
  }
  return unlockedCards ? Math.min(1, unlockedCards.length / 10) : 0.3;
}

// 动态阈值（基于自动化测试优化）
const DYNAMIC_THRESHOLDS = {
  A: 55, // 员工满意度低 < 55
  B: 35, // 核心员工离职 < 35
  C: 35, // 市场口碑崩盘 < 35
  D: 2, // ToB大客户流失 < 2
  E: 45, // ToB续约率低 < 45
  F: 25, // ToC日活暴跌 < 25
  G: 0.4, // ToC用户价值低 < 0.4
  H: 35, // B2C纠纷率飙升 > 35
  I: 70, // B2C交易额暴跌 < 70
  debtX: 0.8 // 负债 > debtLimit*80%
};

// 坏词映射表
const BAD_WORD_MAPPING = {
  budgetNeg: { bad: '亏损', good: '战略性投入', weight: 'light', score: 10, severity: 5 },
  satLow: { bad: '员工满意度低', good: '团队处于磨合期', weight: 'medium', score: 15, severity: 3 },
  coreEmployeeLeave: { bad: '核心员工离职', good: '人才结构优化中', weight: 'heavy', score: 25, severity: 4 },
  highDebt: { bad: '负债压力大', good: '财务杠杆利用中', weight: 'medium', score: 20, severity: 3 },
  lowFame: { bad: '市场口碑崩盘', good: '品牌重塑期', weight: 'heavy', score: 30, severity: 5 },
  noProfit: { bad: '连续未盈利', good: '增长积累期', weight: 'medium', score: 20, severity: 3 },
  // ToB模式
  lostClients: { bad: '大客户流失', good: '业务方向调整', weight: 'heavy', score: 25, severity: 4 },
  lowRenewal: { bad: '续约率低', good: '筛选高质量客户', weight: 'medium', score: 20, severity: 3 },
  // ToC模式
  dauDrop: { bad: '日活暴跌', good: '用户筛选机制生效', weight: 'medium', score: 20, severity: 3 },
  lowLtv: { bad: '用户价值低', good: '商业化探索初期', weight: 'light', score: 15, severity: 2 },
  // B2C模式
  highDispute: { bad: '纠纷率飙升', good: '规则迭代优化中', weight: 'medium', score: 20, severity: 3 },
  lowGmv: { bad: '交易额暴跌', good: '供应链优化中', weight: 'heavy', score: 30, severity: 4 },
  // 默认补充
  rndFail: { bad: '研发失败', good: '技术积累期', weight: 'medium', score: 20, severity: 2 },
  productDelay: { bad: '产品延期', good: '精细化打磨中', weight: 'medium', score: 20, severity: 2 },
  overtime: { bad: '加班严重', good: '团队奋斗精神', weight: 'light', score: 10, severity: 1 }
};

function generateUglyReport() {
  const gs = gameState;
  const direction = gs.direction || 'tob';
  const candidates = [];
  
  // 通用指标映射
  if (gs.budget < 0) {
    candidates.push({ ...BAD_WORD_MAPPING.budgetNeg, gap: Math.abs(gs.budget) });
  }
  if (gs.satisfaction < DYNAMIC_THRESHOLDS.A) {
    candidates.push({ ...BAD_WORD_MAPPING.satLow, gap: DYNAMIC_THRESHOLDS.A - gs.satisfaction });
  }
  if (gs.satisfaction < DYNAMIC_THRESHOLDS.B) {
    candidates.push({ ...BAD_WORD_MAPPING.coreEmployeeLeave, gap: DYNAMIC_THRESHOLDS.B - gs.satisfaction });
  }
  if (gs.debt > gs.debtLimit * DYNAMIC_THRESHOLDS.debtX) {
    candidates.push({ ...BAD_WORD_MAPPING.highDebt, gap: gs.debt - gs.debtLimit * DYNAMIC_THRESHOLDS.debtX });
  }
  if (gs.fame < DYNAMIC_THRESHOLDS.C) {
    candidates.push({ ...BAD_WORD_MAPPING.lowFame, gap: DYNAMIC_THRESHOLDS.C - gs.fame });
  }
  if (gs.consecutiveProfitableQuarters === 0) {
    candidates.push({ ...BAD_WORD_MAPPING.noProfit, gap: 1 });
  }
  
  // 模式特定指标映射
  if (direction === 'tob') {
    if (gs.benchmarkClients < DYNAMIC_THRESHOLDS.D) {
      candidates.push({ ...BAD_WORD_MAPPING.lostClients, gap: DYNAMIC_THRESHOLDS.D - gs.benchmarkClients });
    }
    if (gs.renewalRate < DYNAMIC_THRESHOLDS.E) {
      candidates.push({ ...BAD_WORD_MAPPING.lowRenewal, gap: DYNAMIC_THRESHOLDS.E - gs.renewalRate });
    }
  } else if (direction === 'toc') {
    if (gs.dau < DYNAMIC_THRESHOLDS.F) {
      candidates.push({ ...BAD_WORD_MAPPING.dauDrop, gap: DYNAMIC_THRESHOLDS.F - gs.dau });
    }
    if (gs.ltv < DYNAMIC_THRESHOLDS.G) {
      candidates.push({ ...BAD_WORD_MAPPING.lowLtv, gap: DYNAMIC_THRESHOLDS.G - gs.ltv });
    }
  } else { // b2c
    if (gs.disputeRate > DYNAMIC_THRESHOLDS.H) {
      candidates.push({ ...BAD_WORD_MAPPING.highDispute, gap: gs.disputeRate - DYNAMIC_THRESHOLDS.H });
    }
    if (gs.gmv < DYNAMIC_THRESHOLDS.I) {
      candidates.push({ ...BAD_WORD_MAPPING.lowGmv, gap: DYNAMIC_THRESHOLDS.I - gs.gmv });
    }
  }
  
  // 完美季度判定
  if (candidates.length === 0) {
    showPerfectQuarter();
    return;
  }
  
  // 按严重程度排序（gap越大越严重）
  candidates.sort((a, b) => b.severity - a.severity || b.gap - a.gap);
  
  // 限制最多5个坏词
  const badWordCount = Math.min(5, candidates.length);
  reportBeautyState.badWords = candidates.slice(0, badWordCount).map(word => ({
    bad: word.bad,
    good: word.good,
    weight: word.weight,
    score: word.score,
    caught: false
  }));
  
  // 如果不够，补充默认词
  if (reportBeautyState.badWords.length < 3) {
    const defaultWords = [BAD_WORD_MAPPING.rndFail, BAD_WORD_MAPPING.productDelay, BAD_WORD_MAPPING.overtime];
    for (const w of defaultWords) {
      if (reportBeautyState.badWords.length >= 5) break;
      if (!reportBeautyState.badWords.find(bw => bw.bad === w.bad)) {
        reportBeautyState.badWords.push({
          bad: w.bad,
          good: w.good,
          weight: w.weight,
          score: w.score,
          caught: false
        });
      }
    }
  }
  
  const uglyEl = document.getElementById('ugly-report-content');
  uglyEl.innerHTML = reportBeautyState.badWords.map(word => `
    <div class="ugly-word" data-word="${word.bad}">
      <span class="bad-word">❌ ${word.bad}</span>
      <span class="bad-score">(-${word.score})</span>
    </div>
  `).join('');
}

function showPerfectQuarter() {
  const uglyEl = document.getElementById('ugly-report-content');
  uglyEl.innerHTML = `
    <div class="perfect-quarter">
      <div class="perfect-icon">🎉</div>
      <div class="perfect-title">完美季度！</div>
      <div class="perfect-desc">本季度表现完美，没有需要美容的内容</div>
      <div class="perfect-bonus">
        <div>满意度加成: +20%</div>
        <div>资金加成: +50万</div>
      </div>
    </div>
  `;
  
  document.querySelector('.beauty-start-btn').textContent = '✨ 领取奖励';
  document.querySelector('.beauty-start-btn').onclick = claimPerfectBonus;
}

function claimPerfectBonus() {
  gameState.satisfaction = Math.min(100, gameState.satisfaction + 20);
  gameState.budget += 50;
  showToast('🎉 完美季度奖励已领取！');
  closeReportBeauty();
  if (typeof updateUI === 'function') updateUI();
}

function showStage(stage) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`beauty-stage-${i}`).style.display = 'none';
  }
  document.getElementById(`beauty-stage-${stage}`).style.display = 'block';
  reportBeautyState.stage = stage;
  
  if (stage === 2) {
    renderPKStage();
  } else if (stage === 3) {
    renderMinerStage();
  } else if (stage === 4) {
    renderPrettyReport();
  }
  
  // 保存进度
  saveReportBeautyState();
}

function startPKStage() {
  showStage(2);
}

function renderPKStage() {
  document.getElementById('pk-round').textContent = reportBeautyState.pkRound;
  document.getElementById('pk-hooks').textContent = reportBeautyState.totalHookCount;
  
  // 清理旧的提示
  const oldHint = document.querySelector('.b2-hint');
  if (oldHint) oldHint.remove();
  const oldTransition = document.querySelector('.b2-transition');
  if (oldTransition) oldTransition.remove();
  
  // 检查是否第一次解锁B2版本
  const wasB2LastTime = localStorage.getItem('report_beauty_b2_unlocked') === 'true';
  if (reportBeautyState.isB2Version && !wasB2LastTime) {
    showB2TransitionAnimation();
    localStorage.setItem('report_beauty_b2_unlocked', 'true');
    return; // 先显示过渡动画
  }
  
  // 保底机制：前3次放水
  let availableCamps = CAMPS.slice();
  const playerCards = getBackpack().filter(c => !c.is_variant && c.durability > 0);
  const playerCamps = [...new Set(playerCards.map(c => c.position || c.poolId))];
  
  if (reportBeautyState.pkRound <= 3 && playerCamps.length > 0) {
    // 放水：随机选择一个玩家克制的阵营
    const possibleCamps = playerCamps.map(pc => Object.keys(CAMP_COUNTER).find(k => CAMP_COUNTER[k] === pc)).filter(Boolean);
    if (possibleCamps.length > 0 && Math.random() > 0.5) {
      reportBeautyState.currentOpponentCamp = possibleCamps[Math.floor(Math.random() * possibleCamps.length)];
    } else {
      reportBeautyState.currentOpponentCamp = availableCamps[Math.floor(Math.random() * availableCamps.length)];
    }
  } else {
    reportBeautyState.currentOpponentCamp = availableCamps[Math.floor(Math.random() * availableCamps.length)];
  }
  
  document.getElementById('opponent-camp').textContent = reportBeautyState.currentOpponentCamp;
  document.getElementById('opponent-camp').className = 'opponent-camp ' + reportBeautyState.currentOpponentCamp;
  
  renderPlayerCards();
  
  if (reportBeautyState.isB2Version) {
    const hintEl = document.createElement('div');
    hintEl.className = 'b2-hint';
    hintEl.innerHTML = '💡 B2版本：点击选中2张同阵营卡牌触发组合技能(+1钩子)！';
    document.querySelector('.pk-info').appendChild(hintEl);
    
    // 添加组合确认按钮
    const comboBtn = document.createElement('div');
    comboBtn.className = 'combo-confirm-btn';
    comboBtn.id = 'combo-confirm-btn';
    comboBtn.style.display = 'none';
    comboBtn.textContent = '🔥 使用组合技能出战';
    comboBtn.onclick = useComboSkill;
    document.querySelector('.pk-info').appendChild(comboBtn);
  } else {
    // B1版本：3秒倒计时
    startPKCountdown();
  }
  
  document.getElementById('pk-result').textContent = reportBeautyState.isB2Version ? 
    '选择1-2张卡牌出战！(2张同阵营触发组合技能)' : '选择一张卡牌出战！';
}

function showB2TransitionAnimation() {
  const modal = document.getElementById('beauty-stage-2');
  const transitionDiv = document.createElement('div');
  transitionDiv.className = 'b2-transition';
  transitionDiv.innerHTML = `
    <div class="transition-content">
      <div class="transition-title">🎊 解锁B2版本！</div>
      <div class="transition-desc">
        图鉴解锁率达到33%！<br>
        解锁以下新功能：<br>
        ✨ 组合技能：2张同阵营卡牌+1钩子<br>
        ⬆️ 钩子升级系统<br>
        🔄 反向使用功能
      </div>
      <button class="transition-continue" onclick="continueFromTransition()">继续 →</button>
    </div>
  `;
  modal.insertBefore(transitionDiv, modal.firstChild);
  reportBeautyState.isTransitioning = true;
}

function continueFromTransition() {
  const transition = document.querySelector('.b2-transition');
  if (transition) transition.remove();
  reportBeautyState.isTransitioning = false;
  renderPKStage();
}

function startPKCountdown() {
  let timeLeft = 3;
  const resultEl = document.getElementById('pk-result');
  
  const countdown = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      if (!reportBeautyState.selectedCard) {
        // 时间到没选，随机选一张
        const cards = getBackpack().filter(c => !c.is_variant && c.durability > 0);
        if (cards.length > 0) {
          selectPKCard(cards[0].instanceId);
        } else {
          reportBeautyState.pkRound++;
          if (reportBeautyState.pkRound > 3) {
            finishPKStage();
          } else {
            renderPKStage();
          }
        }
      }
    } else {
      resultEl.textContent = `选择一张卡牌出战！剩余 ${timeLeft} 秒...`;
    }
  }, 1000);
}

function renderPlayerCards() {
  const cards = getBackpack().filter(c => !c.is_variant && c.durability > 0);
  const container = document.getElementById('player-cards-pk');
  
  if (cards.length === 0) {
    container.innerHTML = '<div class="no-cards">没有可用卡牌！</div>';
    return;
  }
  
  reportBeautyState.selectedPKCards = [];
  
  container.innerHTML = cards.map((card, index) => `
    <div class="pk-card" data-index="${index}" data-camp="${card.position || card.poolId}" data-instance-id="${card.instanceId}">
      <div class="pk-card-name">${card.name}</div>
      <div class="pk-card-pos">${card.position || card.poolId}</div>
      <div class="pk-card-rarity">${card.rarity}</div>
    </div>
  `).join('');
  
  container.querySelectorAll('.pk-card').forEach(el => {
    el.addEventListener('click', (e) => handlePKCardClick(e, cards));
  });
}

function handlePKCardClick(e, cards) {
  if (reportBeautyState.selectedCard) return;
  if (reportBeautyState.isTransitioning) return;
  
  const index = parseInt(e.currentTarget.dataset.index);
  const card = cards[index];
  const camp = card.position || card.poolId;
  
  if (reportBeautyState.isB2Version) {
    // B2版本：支持点击多选
    const existingIndex = reportBeautyState.selectedPKCards.findIndex(c => c.instanceId === card.instanceId);
    if (existingIndex >= 0) {
      // 取消选中
      reportBeautyState.selectedPKCards.splice(existingIndex, 1);
      e.currentTarget.classList.remove('combo-selected');
    } else if (reportBeautyState.selectedPKCards.length < 2) {
      // 选中：必须同阵营
      if (reportBeautyState.selectedPKCards.length === 0 || 
          ((reportBeautyState.selectedPKCards[0].position || reportBeautyState.selectedPKCards[0].poolId) === camp)) {
        reportBeautyState.selectedPKCards.push(card);
        e.currentTarget.classList.add('combo-selected');
      } else {
        showToast('组合技能需要2张同阵营卡牌！');
        return;
      }
    }
    
    // 更新组合确认按钮
    updateComboConfirmButton();
    
    // 如果只选了一张，也可以直接使用单卡
    if (reportBeautyState.selectedPKCards.length === 1) {
      // 让用户选择是单卡还是继续选择第二张
    }
    
    return;
  }
  
  // B1版本：单卡选择
  selectPKCard(card.instanceId);
}

function updateComboConfirmButton() {
  const comboBtn = document.getElementById('combo-confirm-btn');
  if (!comboBtn) return;
  
  if (reportBeautyState.selectedPKCards.length === 2) {
    comboBtn.style.display = 'block';
  } else {
    comboBtn.style.display = 'none';
  }
}

function useComboSkill() {
  if (reportBeautyState.selectedPKCards.length < 2) {
    showToast('需要2张同阵营卡牌！');
    return;
  }
  
  if (reportBeautyState.comboBonusUsed >= 2) {
    showToast('组合技能最多使用2次！');
    return;
  }
  
  const card1 = reportBeautyState.selectedPKCards[0];
  const card2 = reportBeautyState.selectedPKCards[1];
  
  const camp1 = card1.position || card1.poolId;
  const camp2 = card2.position || card2.poolId;
  
  if (camp1 !== camp2) {
    showToast('2张卡牌必须同阵营！');
    return;
  }
  
  // 扣除两张卡牌的耐久度
  card1.durability = Math.max(0, card1.durability - 1);
  card2.durability = Math.max(0, card2.durability - 1);
  
  // 使用组合技能
  reportBeautyState.selectedCard = card1; // 用第一张计算PK结果
  const result = calculatePKResult(card1);
  
  let resultMessage = result.message + ' +组合技能(+1钩子)';
  
  document.getElementById('pk-result').textContent = resultMessage;
  
  if (result.win) {
    let hooks = 1;
    if (card1.rarity === 'SR') hooks = 2;
    if (card1.rarity === 'SSR') {
      hooks = 3;
      reportBeautyState.hasSSRWin = true; // 标记SSR卡获胜
    }
    hooks += 1; // 组合技能+1钩子
    reportBeautyState.totalHookCount += hooks;
    reportBeautyState.pkWins++;
    reportBeautyState.comboBonusUsed++; // 记录组合技能使用次数
  }
  
  document.querySelectorAll('.pk-card').forEach(el => el.classList.add('selected'));
  
  // 保存进度
  saveReportBeautyState();
  
  setTimeout(() => {
    if (reportBeautyState.pkRound < 3) {
      reportBeautyState.pkRound++;
      reportBeautyState.selectedCard = null;
      reportBeautyState.selectedPKCards = [];
      renderPKStage();
    } else {
      finishPKStage();
    }
  }, 1500);
}

function selectPKCard(instanceId) {
  if (reportBeautyState.selectedCard) return;
  if (reportBeautyState.isTransitioning) return;
  
  let card;
  
  if (reportBeautyState.isB2Version && reportBeautyState.selectedPKCards.length === 1) {
    // B2版本只选了一张，使用单卡
    card = reportBeautyState.selectedPKCards[0];
  } else {
    const cards = getBackpack();
    card = cards.find(c => c.instanceId === instanceId);
  }
  
  if (!card) return;
  
  // 扣除卡牌耐久度
  card.durability = Math.max(0, card.durability - 1);
  
  reportBeautyState.selectedCard = card;
  
  const result = calculatePKResult(card);
  
  document.getElementById('pk-result').textContent = result.message;
  
  if (result.win) {
    let hooks = 1;
    if (card.rarity === 'SR') hooks = 2;
    if (card.rarity === 'SSR') {
      hooks = 3;
      reportBeautyState.hasSSRWin = true; // 标记SSR卡获胜
    }
    reportBeautyState.totalHookCount += hooks;
    reportBeautyState.pkWins++;
  }
  
  document.querySelectorAll('.pk-card').forEach(el => el.classList.add('selected'));
  
  // 保存进度
  saveReportBeautyState();
  
  setTimeout(() => {
    if (reportBeautyState.pkRound < 3) {
      reportBeautyState.pkRound++;
      reportBeautyState.selectedCard = null;
      reportBeautyState.selectedPKCards = [];
      renderPKStage();
    } else {
      finishPKStage();
    }
  }, 1500);
}

function calculatePKResult(card) {
  const playerCamp = card.position || card.poolId;
  const opponentCamp = reportBeautyState.currentOpponentCamp;
  
  let win = false;
  let message = '';
  
  if (CAMP_COUNTER[playerCamp] === opponentCamp) {
    win = true;
    message = `${playerCamp} 克制 ${opponentCamp}！完美获胜！`;
  } else if (CAMP_COUNTER[opponentCamp] === playerCamp) {
    win = false;
    message = `${opponentCamp} 克制 ${playerCamp}！惜败...`;
  } else if (playerCamp === opponentCamp) {
    // 同阵营：战力计算
    const playerPower = calculateCombatPower(card);
    const opponentPower = 3 + Math.random() * 4; // 对手战力
    win = playerPower > opponentPower;
    message = win ? `同阵营对决！战力 ${playerPower.toFixed(1)} > ${opponentPower.toFixed(1)}！你赢了！` :
                  `同阵营对决！战力 ${playerPower.toFixed(1)} < ${opponentPower.toFixed(1)}！运气不好...`;
  } else {
    win = Math.random() > 0.3;
    message = win ? '随机判定：你赢了！' : '随机判定：输了...';
  }
  
  return { win, message };
}

function calculateCombatPower(card) {
  let power = 1;
  
  // 稀有度加成
  switch(card.rarity) {
    case 'SSR': power += 3; break;
    case 'SR': power += 2; break;
    case 'R': power += 1; break;
  }
  
  // 效率加成
  if (card.efficiency) {
    power += card.efficiency / 10;
  }
  
  // 好感度加成
  if (card.favor) {
    power += card.favor / 50;
  }
  
  return power;
}

function finishPKStage() {
  reportBeautyState.currentHookCount = reportBeautyState.totalHookCount;
  if (reportBeautyState.currentHookCount === 0) {
    showToast('没有获得钩子，无法继续矿工阶段！');
    renderPrettyReport();
    showStage(4);
    return;
  }
  showToast(`PK结束！获得 ${reportBeautyState.currentHookCount} 次钩子！`);
  showStage(3);
}

function renderMinerStage() {
  document.getElementById('miner-hooks').textContent = reportBeautyState.currentHookCount;
  document.getElementById('miner-timer').textContent = reportBeautyState.isB2Version ? '15' : '10';
  document.getElementById('miner-score').textContent = reportBeautyState.beautifiedWords.length;
  
  // 添加键盘监听器
  addKeyListener();
  
  // 清理旧的升级按钮
  const oldUpgrades = document.querySelector('.hook-upgrades');
  if (oldUpgrades) oldUpgrades.remove();
  const oldReverse = document.querySelector('.reverse-section');
  if (oldReverse) oldReverse.remove();
  
  if (reportBeautyState.isB2Version) {
    const minerInfo = document.querySelector('.miner-info');
    const upgradeDiv = document.createElement('div');
    upgradeDiv.className = 'hook-upgrades';
    
    // 升级费用固定100万
    const cost = 100;
    
    upgradeDiv.innerHTML = `
      <div class="upgrade-title">🔧 钩子升级</div>
      <div class="upgrade-btn" onclick="upgradeHook('length')">⬇️ 长度 Lv${reportBeautyState.hookUpgrades.length}/10 (${cost}万+1卡)</div>
      <div class="upgrade-btn" onclick="upgradeHook('speed')">⚡ 速度 Lv${reportBeautyState.hookUpgrades.speed}/10 (${cost}万+1卡)</div>
      <div class="upgrade-btn" onclick="upgradeHook('magnet')">🧲 磁力 Lv${reportBeautyState.hookUpgrades.magnet}/10 (${cost}万+1卡)</div>
    `;
    minerInfo.appendChild(upgradeDiv);
  }
  
  // 应用已有的升级效果
  applyUpgradeEffects();
  
  initializeMinerCanvas();
  generateMinerItems();
  startMinerGame();
}

function applyUpgradeEffects() {
  // 长度升级效果（Lv.10上限）
  reportBeautyState.maxHookLength = 250 + reportBeautyState.hookUpgrades.length * 30;
  // 速度升级效果
  reportBeautyState.hookSpeed = 0.03 + reportBeautyState.hookUpgrades.speed * 0.008;
}

function upgradeHook(type) {
  const currentLevel = reportBeautyState.hookUpgrades[type];
  
  if (currentLevel >= 10) {
    showToast('已升到最高等级Lv.10！');
    return;
  }
  
  // 计算费用（BUG-007：每级100万）
  const moneyCost = 100;
  if (!gameState || gameState.budget < moneyCost) {
    showToast(`资金不足！需要${moneyCost}万`);
    return;
  }
  
  // 检查是否有可用的卡牌
  const availableCards = getBackpack().filter(c => !c.is_variant && c.durability > 0);
  if (availableCards.length === 0) {
    showToast('没有可用的卡牌用于升级！');
    return;
  }
  
  // 消耗资金和一张卡牌
  gameState.budget -= moneyCost;
  
  // 消耗一张卡牌（选第一张）
  const cardToConsume = availableCards[0];
  cardToConsume.durability = 0;
  
  // 应用升级
  reportBeautyState.hookUpgrades[type]++;
  applyUpgradeEffects();
  
  // 重新渲染升级按钮
  const oldUpgrades = document.querySelector('.hook-upgrades');
  if (oldUpgrades) {
    const costLength = 100;
    const costSpeed = 100;
    const costMagnet = 100;
    oldUpgrades.innerHTML = `
      <div class="upgrade-title">🔧 钩子升级</div>
      <div class="upgrade-btn" onclick="upgradeHook('length')">⬇️ 长度 Lv${reportBeautyState.hookUpgrades.length}/10 (${costLength}万+1卡)</div>
      <div class="upgrade-btn" onclick="upgradeHook('speed')">⚡ 速度 Lv${reportBeautyState.hookUpgrades.speed}/10 (${costSpeed}万+1卡)</div>
      <div class="upgrade-btn" onclick="upgradeHook('magnet')">🧲 磁力 Lv${reportBeautyState.hookUpgrades.magnet}/10 (${costMagnet}万+1卡)</div>
    `;
  }
  
  const typeNames = { length: '长度', speed: '速度', magnet: '磁力' };
  showToast(`钩子${typeNames[type]}升级成功！当前Lv${reportBeautyState.hookUpgrades[type]}`);
  saveGame();
  saveReportBeautyState();
}

function initializeMinerCanvas() {
  const canvas = document.getElementById('miner-canvas');
  reportBeautyState.canvas = canvas;
  reportBeautyState.ctx = canvas.getContext('2d');
  
  canvas.width = 500;
  canvas.height = 400;
  
  reportBeautyState.hookX = canvas.width / 2;
  reportBeautyState.hookY = 50;
  
  canvas.addEventListener('click', handleMinerClick);
}

function generateMinerItems() {
  const items = [];
  
  reportBeautyState.badWords.forEach((word, index) => {
    if (!word.caught) {
      items.push({
        type: 'word',
        data: word,
        x: 80 + (index % 3) * 150,
        y: 150 + Math.floor(index / 3) * 100,
        radius: 30
      });
    }
  });
  
  if (Math.random() > 0.3) {
    items.push({
      type: 'audit_bomb',
      name: '审计炸弹',
      x: 250,
      y: 300,
      radius: 25
    });
  }
  
  if (Math.random() > 0.5) {
    items.push({
      type: 'money_chest',
      name: '资金宝箱',
      x: 100 + Math.random() * 300,
      y: 200 + Math.random() * 150,
      radius: 20
    });
  }
  
  if (Math.random() > 0.6) {
    items.push({
      type: 'hc_chest',
      name: 'HC宝箱',
      x: 100 + Math.random() * 300,
      y: 200 + Math.random() * 150,
      radius: 20
    });
  }
  
  reportBeautyState.minerItems = items;
}

function startMinerGame() {
  let timeLeft = 10;
  let lastTime = Date.now();
  
  const gameLoop = () => {
    const now = Date.now();
    const delta = (now - lastTime) / 1000;
    lastTime = now;
    
    updateMiner(delta);
    drawMiner();
    
    if (!reportBeautyState.hookLaunched && !reportBeautyState.hookReturning) {
      timeLeft -= delta;
      document.getElementById('miner-timer').textContent = Math.ceil(timeLeft);
      
      if (timeLeft <= 0) {
        finishMinerRound();
        return;
      }
    }
    
    requestAnimationFrame(gameLoop);
  };
  
  gameLoop();
}

function updateMiner(delta) {
  const state = reportBeautyState;
  
  if (!state.hookLaunched && !state.hookReturning) {
    state.hookAngle += state.hookSpeed * state.hookDirection;
    if (state.hookAngle > 0.8 || state.hookAngle < -0.8) {
      state.hookDirection *= -1;
    }
  } else if (state.hookLaunched) {
    state.hookLength += 3;
    const endX = state.hookX + Math.sin(state.hookAngle) * state.hookLength;
    const endY = state.hookY + Math.cos(state.hookAngle) * state.hookLength;
    
    // 计算磁力范围
    const magnetBonus = state.hookUpgrades.magnet * 20; // 每级+20像素
    const catchRadius = 10 + magnetBonus;
    
    for (const item of state.minerItems) {
      const dx = endX - item.x;
      const dy = endY - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < item.radius + catchRadius) {
        state.caughtItem = item;
        state.hookLaunched = false;
        state.hookReturning = true;
        break;
      }
    }
    
    if (state.hookLength >= state.maxHookLength) {
      state.hookLaunched = false;
      state.hookReturning = true;
    }
  } else if (state.hookReturning) {
    // 根据物品重量调整拉力（回收速度）
    let pullSpeed = 4;
    if (state.caughtItem && state.caughtItem.type === 'word') {
      switch(state.caughtItem.data.weight) {
        case 'light': 
          pullSpeed = 6; // 轻词：快速
          break;
        case 'medium': 
          pullSpeed = 4; // 中词：正常
          break;
        case 'heavy': 
          pullSpeed = 2; // 重词：缓慢
          // SSR卡助力：拉力+50%
          if (state.hasSSRWin) {
            pullSpeed = pullSpeed * 1.5;
          }
          break;
      }
    }
    // 速度升级效果
    pullSpeed += state.hookUpgrades.speed * 1;
    
    state.hookLength -= pullSpeed;
    
    if (state.hookLength <= 0) {
      state.hookLength = 0;
      state.hookReturning = false;
      
      if (state.caughtItem) {
        handleCaughtItem(state.caughtItem);
        state.caughtItem = null;
      }
    }
  }
}

// 键盘监听：空格键发射钩子
let keyListenerAdded = false;
function addKeyListener() {
  if (keyListenerAdded) return;
  keyListenerAdded = true;
  
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && reportBeautyState.stage === 3) {
      e.preventDefault();
      handleMinerClick();
    }
  });
}

function handleCaughtItem(item) {
  const index = reportBeautyState.minerItems.indexOf(item);
  if (index > -1) {
    reportBeautyState.minerItems.splice(index, 1);
  }
  
  if (item.type === 'word') {
    item.data.caught = true;
    reportBeautyState.beautifiedWords.push(item.data);
    document.getElementById('miner-score').textContent = reportBeautyState.beautifiedWords.length;
    showToast(`美容成功：${item.data.bad} → ${item.data.good}！`);
  } else if (item.type === 'audit_bomb') {
    showToast('💥 钓到审计炸弹！矿工阶段结束！');
    finishMinerStage();
    return;
  } else if (item.type === 'money_chest') {
    gameState.budget += 100;
    showToast('💰 钓到资金宝箱！+100万！');
  } else if (item.type === 'hc_chest') {
    window.hc = (window.hc || 3) + 1;
    gameState.hcLimit = window.hc;
    if (typeof saveHC === 'function') {
      saveHC();
    }
    if (typeof saveGame === 'function') {
      saveGame();
    }
    showToast('📦 钓到HC宝箱！+1 HC！');
  }
  
  finishMinerRound();
}

function finishMinerRound() {
  reportBeautyState.currentHookCount--;
  document.getElementById('miner-hooks').textContent = reportBeautyState.currentHookCount;
  
  if (reportBeautyState.currentHookCount <= 0 || reportBeautyState.minerItems.filter(i => i.type === 'word').length === 0) {
    finishMinerStage();
  } else {
    document.getElementById('miner-timer').textContent = '10';
    startMinerGame();
  }
}

function finishMinerStage() {
  const canvas = document.getElementById('miner-canvas');
  canvas.removeEventListener('click', handleMinerClick);
  showStage(4);
}

function handleMinerClick() {
  if (!reportBeautyState.hookLaunched && !reportBeautyState.hookReturning) {
    reportBeautyState.hookLaunched = true;
  }
}

function drawMiner() {
  const state = reportBeautyState;
  const ctx = state.ctx;
  const canvas = state.canvas;
  
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  state.minerItems.forEach(item => {
    if (item.type === 'word') {
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.data.bad, item.x, item.y + 4);
    } else if (item.type === 'audit_bomb') {
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💣', item.x, item.y + 5);
    } else if (item.type === 'money_chest') {
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('💰', item.x, item.y + 5);
    } else if (item.type === 'hc_chest') {
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📦', item.x, item.y + 5);
    }
  });
  
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(state.hookX, state.hookY);
  
  const hookEndX = state.hookX + Math.sin(state.hookAngle) * state.hookLength;
  const hookEndY = state.hookY + Math.cos(state.hookAngle) * state.hookLength;
  ctx.lineTo(hookEndX, hookEndY);
  ctx.stroke();
  
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(hookEndX, hookEndY, 8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#3498db';
  ctx.beginPath();
  ctx.arc(state.hookX, state.hookY, 20, 0, Math.PI * 2);
  ctx.fill();
}

function renderPrettyReport() {
  const prettyEl = document.getElementById('pretty-report-content');
  
  const prettyHtml = reportBeautyState.badWords.map(word => {
    const isBeautified = word.caught || reportBeautyState.beautifiedWords.some(bw => bw.bad === word.bad);
    const displayWord = isBeautified ? word.good : word.bad;
    const className = isBeautified ? 'good-word' : 'bad-word';
    
    return `
      <div class="pretty-word ${className}">
        <span>${isBeautified ? '✅' : '❌'}</span>
        <span>${displayWord}</span>
        <span class="word-score">(${isBeautified ? '+' : '-'}${word.score})</span>
      </div>
    `;
  }).join('');
  
  prettyEl.innerHTML = prettyHtml;
  
  const score = reportBeautyState.beautifiedWords.reduce((sum, w) => sum + w.score, 0);
  const satBonus = reportBeautyState.beautifiedWords.length * 5;
  
  document.getElementById('beauty-summary').innerHTML = `
    <div class="beauty-summary-item">
      <span>美容成功</span>
      <span>${reportBeautyState.beautifiedWords.length} 个词</span>
    </div>
    <div class="beauty-summary-item">
      <span>美容得分</span>
      <span>+${score}</span>
    </div>
    <div class="beauty-summary-item">
      <span>满意度加成</span>
      <span>+${satBonus}%</span>
    </div>
  `;
  
  reportBeautyState.satBonus = satBonus;
}

function submitBeautifulReport() {
  if (reportBeautyState.satBonus) {
    gameState.satisfaction = Math.min(100, gameState.satisfaction + reportBeautyState.satBonus);
  }
  
  closeReportBeauty();
}

function closeReportBeauty() {
  document.getElementById('report-beauty-modal').style.display = 'none';
  // 清除进度
  clearReportBeautyState();
  // 更新按钮状态
  updateBeautyButtonsState();
}

function showAutoBeautyModal() {
  document.getElementById('auto-beauty-modal').style.display = 'flex';
  document.getElementById('auto-beauty-count').textContent = gameState.autoBeautyCoupons || 0;
}

function closeAutoBeautyModal() {
  document.getElementById('auto-beauty-modal').style.display = 'none';
}

function synthesizeAutoBeauty() {
  const fragments = gameState.cardFragments || 0;
  const budget = gameState.budget || 0;
  
  // 检查每月限购
  const currentMonth = Math.floor((gameState.week - 1) / 4) + 1; // 每4周一个月
  if (gameState.lastSynthesisMonth === currentMonth) {
    showToast('本月已合成过！请下月再试');
    return;
  }
  
  if (fragments < 10) {
    showToast('碎片不足！需要10碎片');
    return;
  }
  if (budget < 50) {
    showToast('资金不足！需要50万');
    return;
  }
  
  gameState.cardFragments -= 10;
  gameState.budget -= 50;
  gameState.lastSynthesisMonth = currentMonth; // 记录合成月份
  gameState.autoBeautyCoupons = (gameState.autoBeautyCoupons || 0) + 1;
  
  document.getElementById('auto-beauty-count').textContent = gameState.autoBeautyCoupons;
  showToast('合成成功！获得1张自动美容券');
  saveGame();
}

function useAutoBeauty() {
  const count = gameState.autoBeautyCoupons || 0;
  if (count <= 0) {
    showToast('没有自动美容券！');
    return;
  }
  
  // 检查每季度限用1次
  if (gameState.thisQuarterUsedAutoBeauty) {
    showToast('本季度已使用过自动美容！');
    return;
  }
  
  gameState.autoBeautyCoupons -= 1;
  gameState.thisQuarterUsedAutoBeauty = true;
  closeAutoBeautyModal();
  
  // AI自动美容逻辑：
  const beautifyCount = Math.ceil((reportBeautyState.badWords?.length || 2) * 0.8); // 80%覆盖率
  let actualBeautified = 0;
  for (let i = 0; i < beautifyCount && reportBeautyState.badWords[i]; i++) {
    reportBeautyState.badWords[i].caught = true;
    reportBeautyState.beautifiedWords.push(reportBeautyState.badWords[i]);
    actualBeautified++;
  }
  
  // 效果折扣：80%
  const satBonus = Math.floor(actualBeautified * 5 * 0.8);
  gameState.satisfaction = Math.min(100, gameState.satisfaction + satBonus);
  
  showToast(`🤖 自动美容成功！美容了${actualBeautified}个词，满意度+${satBonus}%`);
  closeReportBeauty();
  saveGame();
  if (typeof updateUI === 'function') updateUI();
}

// 修改showAutoBeautyModal，使用gameState而不是localStorage
function showAutoBeautyModal() {
  document.getElementById('auto-beauty-modal').style.display = 'flex';
  document.getElementById('auto-beauty-count').textContent = gameState.autoBeautyCoupons || 0;
}

loadReportWords();