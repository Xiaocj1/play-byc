const STORAGE_KEY = "fair_office_game_state";
const ENDINGS_KEY = "fair_office_unlocked_endings";
const PRESTIGE_KEY = "fair_office_prestige";
const RANK_KEY = "fair_office_current_rank";
const TOOLCHAIN_KEY = "fair_office_toolchain";
const UNLOCKED_TOOLS_KEY = "fair_office_unlocked_tools";
const QUARTER_DURATION = 12;

let prestige = 0;
let currentRank = "p5";
let ranks = [];
let toolsData = { categories: [] };
let selectedTools = {};
let unlockedTools = [];

function getCurrentQuarter() {
    const week = gameState.week;
    return Math.floor((week - 1) / QUARTER_DURATION) + 1;
}

function getWeekInQuarter() {
    const week = gameState.week;
    return ((week - 1) % QUARTER_DURATION) + 1;
}

function formatQuarterWeek() {
    const q = getCurrentQuarter();
    const w = getWeekInQuarter();
    return `Q${q} · 第 ${w} 周`;
}

function getFameLevel() {
    const fame = gameState.fame;
    if (fame >= 80) return 'legendary';
    if (fame >= 60) return 'high';
    if (fame >= 40) return 'normal';
    if (fame >= 20) return 'low';
    return 'bad';
}

function getFameMultiplier() {
    const fame = gameState.fame;
    if (fame >= 80) return 1.5;
    if (fame >= 60) return 1.2;
    if (fame >= 40) return 1.0;
    if (fame >= 20) return 0.8;
    return 0.5;
}

function getDrawCostMultiplier() {
    const fame = gameState.fame;
    if (fame >= 80) return 0.7;
    if (fame >= 60) return 0.9;
    if (fame >= 40) return 1.0;
    if (fame >= 20) return 1.2;
    return 1.5;
}

function getDebtLimit() {
    const fame = gameState.fame;
    if (fame >= 80) return 200;
    if (fame >= 60) return 150;
    if (fame >= 40) return 100;
    if (fame >= 20) return 50;
    return 20;
}

function getInterestRate() {
    const fame = gameState.fame;
    if (fame >= 80) return 0.02;
    if (fame >= 60) return 0.03;
    if (fame >= 40) return 0.05;
    if (fame >= 20) return 0.08;
    return 0.15;
}

function updateDebtLimit() {
    gameState.debtLimit = getDebtLimit();
}

function addFame(amount) {
    gameState.fame = Math.max(0, Math.min(100, gameState.fame + amount));
    updateDebtLimit();
}

function borrowMoney(amount) {
    if (amount <= 0) return false;
    if (gameState.debt + amount > gameState.debtLimit) return false;
    
    gameState.budget += amount;
    gameState.debt += amount;
    saveGame();
    updateUI();
    return true;
}

function repayMoney(amount) {
    if (amount <= 0) return false;
    if (gameState.budget < amount) return false;
    if (gameState.debt < amount) amount = gameState.debt;
    
    gameState.budget -= amount;
    gameState.debt -= amount;
    saveGame();
    updateUI();
    return true;
}

function calculateInterest() {
    if (gameState.debt <= 0) return 0;
    const interest = Math.round(gameState.debt * getInterestRate());
    gameState.budget -= interest;
    return interest;
}

const directionTexts = {
    'tob': {
        name: 'To B',
        icon: '💼',
        taskSource: '甲方需求',
        satisfactionName: '甲方满意度',
        fameName: '行业口碑',
        reportName: '项目验收',
        cardRole: '外包团队',
        successEnding: '被大厂收购 / 成为头部服务商',
        failureEnding: '被甲方拉黑',
        cardPoolTheme: '外包',
        weeklyStoryPrefix: '第一个客户',
        fameIcon: '🏢',
        satisfactionIcon: '👨‍💼'
    },
    'toc': {
        name: 'To C',
        icon: '📱',
        taskSource: '用户反馈',
        satisfactionName: '用户满意度',
        fameName: '应用评分',
        reportName: '数据复盘',
        cardRole: '合伙人',
        successEnding: 'App爆火 / 公司上市',
        failureEnding: 'App凉了',
        cardPoolTheme: '产品',
        weeklyStoryPrefix: '第一个用户',
        fameIcon: '⭐',
        satisfactionIcon: '😊'
    },
    'b2c': {
        name: 'B2C',
        icon: '🌐',
        taskSource: '服务商订单',
        satisfactionName: '双边满意度',
        fameName: '平台信用分',
        reportName: '双边增长复盘',
        cardRole: '服务商',
        successEnding: '平台垄断 / 成为行业标准',
        failureEnding: '平台跑路',
        cardPoolTheme: '平台',
        weeklyStoryPrefix: '第一个服务商',
        fameIcon: '🏛️',
        satisfactionIcon: '🤝'
    }
};

function getDirectionText(key) {
    const dir = gameState.direction || 'tob';
    if (!directionTexts[dir]) {
        return directionTexts['tob'][key] || '';
    }
    return directionTexts[dir][key] || '';
}

function triggerVictory() {
    gameState.gameOver = true;
    gameState.ending = 'victory';
    saveGame();
    showGameOverModal();
}

let gameState = {
    week: 1,
    direction: null,
    prdVersion: "V1.0.0",
    favors: {},
    progress: 0,
    satisfaction: 80,
    satisfactionHistory: [80],
    consecutiveLowSatisfactionWeeks: 0,
    prdHistory: [],
    weeklyLogs: [],
    currentEventIndex: 0,
    gameOver: false,
    budget: 100,
    toolchain: {},
    characterBuffs: {},
    quarterlyQuests: [],
    quarterlyScore: 0,
    fame: 50,
    debt: 0,
    debtLimit: 100
};

function showBorrowModal() {
    const modal = document.getElementById('borrow-modal');
    if (!modal) return;
    
    updateBorrowModal();
    modal.style.display = 'flex';
}

function closeBorrowModal() {
    const modal = document.getElementById('borrow-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateBorrowModal() {
    const currentDebt = document.getElementById('borrow-current-debt');
    const debtLimit = document.getElementById('borrow-limit');
    const interest = document.getElementById('borrow-interest');
    const available = document.getElementById('borrow-available');
    
    if (currentDebt) currentDebt.textContent = gameState.debt;
    if (debtLimit) debtLimit.textContent = gameState.debtLimit;
    if (interest) interest.textContent = Math.round(getInterestRate() * 100) + '%';
    if (available) available.textContent = gameState.debtLimit - gameState.debt;
}

function handleBorrow() {
    const amountInput = document.getElementById('borrow-amount');
    const amount = parseInt(amountInput.value) || 0;
    
    if (borrowMoney(amount)) {
        showToast(`成功借款 ${amount} 元`);
        amountInput.value = '';
        updateBorrowModal();
    } else {
        showToast('借款失败！检查金额是否超出额度');
    }
}

function handleRepay() {
    const amountInput = document.getElementById('repay-amount');
    const amount = parseInt(amountInput.value) || 0;
    
    if (repayMoney(amount)) {
        showToast(`成功还款 ${amount} 元`);
        amountInput.value = '';
        updateBorrowModal();
    } else {
        showToast('还款失败！检查资金是否足够');
    }
}

let data = {
    weekly_reports: { reports: [] },
    prd_templates: { prd_entries: [] },
    events: { events: [] },
    characters: { characters: [] },
    ranks: { ranks: [] },
    endings: { endings: [] },
    tools: { categories: [] },
    weights: { phases: [], efficiency_buff: {} },
    buffs: { buffs: [], buff_rules: {} }
};

let weightsData = { phases: [], efficiency_buff: { threshold: 80, min_bonus: 0.05, max_bonus: 1.0 } };
let buffsData = { buffs: [], buff_rules: { max_buffs_per_character: 3, buff_duration_unit: "weeks", stacking: { same_type: "refresh", different_type: "stack" } } };

async function loadAllData() {
    try {
        const [weeklyReports, prdTemplates, events, characters, ranksData, endings, tools, weights, buffs] = await Promise.all([
            fetch('data/weekly_reports.json').then(r => r.json()),
            fetch('data/prd_templates.json').then(r => r.json()),
            fetch('data/events.json').then(r => r.json()),
            fetch('data/characters.json').then(r => r.json()),
            fetch('data/ranks.json').then(r => r.json()),
            fetch('data/endings.json').then(r => r.json()),
            fetch('data/tools.json').then(r => r.json()),
            fetch('data/weights.json').then(r => r.json()),
            fetch('data/buffs.json').then(r => r.json())
        ]);
        
        data.weekly_reports = weeklyReports;
        data.prd_templates = prdTemplates;
        data.events = events;
        data.characters = characters;
        data.ranks = ranksData;
        data.endings = endings;
        data.tools = tools;
        data.weights = weights;
        data.buffs = buffs;
        toolsData = tools;
        weightsData = weights;
        buffsData = buffs;
        
        ranks = ranksData.ranks || [];
        
        loadPrestigeAndRank();
        loadGameState();
        loadUnlockedTools();
        
        if (gameState.toolchain) {
            selectedTools = { ...gameState.toolchain };
        }        
        initGame();
        startDirectionLabelUpdates();
        
    } catch (error) {
        console.error('Failed to load data:', error);
        alert('数据加载失败，请刷新页面重试');
    }
}

function loadPrestigeAndRank() {
    prestige = parseInt(localStorage.getItem(PRESTIGE_KEY) || '0');
    currentRank = localStorage.getItem(RANK_KEY) || 'p5';
}

function savePrestigeAndRank() {
    localStorage.setItem(PRESTIGE_KEY, prestige.toString());
    localStorage.setItem(RANK_KEY, currentRank);
}

function loadGameState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState = { ...gameState, ...savedState };
        
        if (!gameState.direction) {
            window.location.href = 'select.html';
            return;
        }
    } else {
        window.location.href = 'index.html';
        return;
    }
}

function updateDirectionLabels() {
    const dir = gameState.direction || 'tob';
    const dt = directionTexts[dir] || directionTexts['tob'];
    
    const fameLabel = document.getElementById('fame-label');
    const satisfactionPanelTitle = document.getElementById('satisfaction-panel-title');
    
    if (fameLabel) {
        const newFameText = `${dt.fameIcon} ${dt.fameName}:`;
        if (fameLabel.textContent !== newFameText) {
            fameLabel.textContent = newFameText;
        }
    }
    if (satisfactionPanelTitle) {
        if (satisfactionPanelTitle.textContent !== dt.satisfactionName) {
            satisfactionPanelTitle.textContent = dt.satisfactionName;
        }
    }
}

// 持续更新标签，确保万无一失
let directionLabelInterval = null;
function startDirectionLabelUpdates() {
    if (directionLabelInterval) {
        clearInterval(directionLabelInterval);
    }
    // 降低更新频率，避免不必要的重复更新
    directionLabelInterval = setInterval(updateDirectionLabels, 1000);
}

function stopDirectionLabelUpdates() {
    if (directionLabelInterval) {
        clearInterval(directionLabelInterval);
        directionLabelInterval = null;
    }
}

function saveGame() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    showSaveNotification();
}

function showSaveNotification() {
    const notification = document.getElementById('save-notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function loadUnlockedTools() {
    const saved = localStorage.getItem(UNLOCKED_TOOLS_KEY);
    if (saved) {
        unlockedTools = JSON.parse(saved);
    }
}

function initGame() {
    if (gameState.prdHistory.length === 0) {
        gameState.prdHistory = [...data.prd_templates.prd_entries];
    }
    
    updateUI();
    renderEvent();
}

function updateUI() {
    if (gameState.gameOver) return;

    document.getElementById('week-number').textContent = formatQuarterWeek();
    document.getElementById('prd-version').textContent = gameState.prdVersion;
    document.getElementById('budget-value').textContent = gameState.budget;
    document.getElementById('fame-value').textContent = gameState.fame;
    document.getElementById('debt-value').textContent = `${gameState.debt}/${gameState.debtLimit}`;
    
    if (gameState.budget < 20) {
        document.getElementById('budget-value').classList.add('cashflow-low');
    } else {
        document.getElementById('budget-value').classList.remove('cashflow-low');
    }

    updateDirectionLabels();

    updateHCDisplay();
    renderCharacterCards();
    updateProgressUI();
    updateSatisfactionUI();
    updateWeeklyReport();
    renderPRDHistory();
    renderWeeklyLogs();
}

function updateHCDisplay() {
    const hcDisplay = document.getElementById('hc-display');
    if (!hcDisplay || typeof getCurrentHCCount !== 'function') return;
    
    const currentHC = getCurrentHCCount ? getCurrentHCCount() : 0;
    const maxHC = typeof hc !== 'undefined' ? hc : 3;
    const variantCount = typeof backpack !== 'undefined' ? backpack.filter(c => c.is_variant).length : 0;
    
    hcDisplay.textContent = `📦 HC ${currentHC}/${maxHC}（管培生${variantCount}不计）`;
}

function renderCharacterCards() {
    const container = document.getElementById('portraits-container');
    container.innerHTML = '';

    data.characters.characters.forEach(character => {
        const like = gameState.favors[character.id] || 50;
        const buffs = gameState.characterBuffs[character.id] || [];
        
        let buffsHtml = '';
        if (buffs.length > 0) {
            buffsHtml = `<div class="character-card-buffs">`;
            buffs.forEach(buff => {
                const buffData = buffsData.buffs.find(b => b.id === buff.buffId);
                const icon = buffData ? buffData.icon : '✨';
                const color = buffData ? buffData.color : '#888';
                const typeClass = buffData && buffData.type === 'positive' ? 'buff-positive' : 'buff-negative';
                buffsHtml += `<span class="buff-item ${typeClass}" style="color: ${color}" title="${buffData ? buffData.name : buff.buffId}">${icon}</span>`;
            });
            buffsHtml += `</div>`;
        }

        const favorTrend = getFavorTrend(character.id);
        const trendIcon = favorTrend > 0 ? '⬆️' : favorTrend < 0 ? '⬇️' : '➡️';
        const trendClass = favorTrend > 0 ? 'trend-up' : favorTrend < 0 ? 'trend-down' : 'trend-neutral';

        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.characterId = character.id;

        card.innerHTML = `
            <div class="character-portrait" id="portrait-${character.id}" onclick="showCharacterStatus('${character.id}')">
                <span class="placeholder">${character.name.charAt(0)}</span>
            </div>
            <div style="flex: 1">
                <div class="character-card-name">${character.name}</div>
                <div class="character-card-role">${character.role}</div>
                <div class="character-card-favor-bar">
                    <div class="character-card-favor-fill" id="favor-fill-${character.id}" style="width: ${like}%"></div>
                </div>
                ${buffsHtml}
            </div>
            <div class="character-card-favor-value">${like}</div>
        `;

        const portraitDiv = card.querySelector(`#portrait-${character.id}`);
        if (character.portrait) {
            const img = new Image();
            img.onload = () => {
                portraitDiv.innerHTML = '';
                portraitDiv.appendChild(img);
            };
            img.src = character.portrait;
        }

        container.appendChild(card);
    });
}

function getFavorTrend(characterId) {
    const favorHistory = gameState.favorHistory || {};
    const history = favorHistory[characterId] || [];
    if (history.length < 2) return 0;
    return history[history.length - 1] - history[history.length - 2];
}

function showCharacterStatus(characterId) {
    const character = data.characters.characters.find(c => c.id === characterId);
    const favor = gameState.favors[characterId] || 50;
    const buffs = gameState.characterBuffs[characterId] || [];

    let buffsInfo = '';
    if (buffs.length > 0) {
        buffsInfo = '<div class="status-buffs">';
        buffs.forEach((buff, index) => {
            const buffData = buffsData.buffs.find(b => b.id === buff.buffId);
            const icon = buffData ? buffData.icon : '✨';
            const name = buffData ? buffData.name : buff.buffId;
            const type = buffData && buffData.type === 'positive' ? 'positive' : 'negative';
            const duration = buff.duration > 0 ? `${buff.duration}周` : '永久';
            buffsInfo += `
                <div class="status-buff-item ${type}">
                    <span class="buff-icon">${icon}</span>
                    <span class="buff-name">${name}</span>
                    <span class="buff-duration">剩余${duration}</span>
                </div>
            `;
        });
        buffsInfo += '</div>';
    } else {
        buffsInfo = '<div class="status-no-buffs">当前没有buff效果</div>';
    }

    const modalContent = `
        <div class="character-status-modal" id="character-status-modal">
            <div class="character-status-content">
                <button class="status-close" onclick="closeCharacterStatus()">X</button>
                <div class="status-header">
                    <div class="status-portrait">${character ? character.name.charAt(0) : '?'}</div>
                    <div class="status-info">
                        <h3>${character ? character.name : '未知'}</h3>
                        <p>${character ? character.role : '未知角色'}</p>
                    </div>
                </div>
                <div class="status-favor">
                    <div class="favor-label">好感度</div>
                    <div class="favor-bar">
                        <div class="favor-fill" style="width: ${favor}%"></div>
                    </div>
                    <div class="favor-value">${favor}%</div>
                </div>
                <div class="status-buffs-header">当前状态效果</div>
                ${buffsInfo}
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    const modalEl = document.getElementById('character-status-modal');
    modalEl.style.display = 'flex';
}

function closeCharacterStatus() {
    const modal = document.getElementById('character-status-modal');
    if (modal) {
        modal.remove();
    }
}

function updateProgressUI() {
    const progress = Math.min(gameState.progress, 100);
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    const phase = getCurrentPhase();
    const phaseName = phase.name || '未知阶段';
    const phaseCode = phase.code || 'SDLC-00';
    
    const progressText = document.getElementById('progress-text');
    const phaseElement = document.createElement('span');
    phaseElement.className = 'phase-link';
    phaseElement.textContent = `${phaseName}·${phaseCode}`;
    phaseElement.onclick = () => showPhaseRant(phase);
    
    progressText.innerHTML = '';
    progressText.appendChild(document.createTextNode(`${progress.toFixed(2)}% (`));
    progressText.appendChild(phaseElement);
    progressText.appendChild(document.createTextNode(')'));
    
    if (progress >= 100) {
        triggerCompletionAnimation();
    }
}

function showPhaseRant(phase) {
    const rant = phase.pm_rant || '这个阶段没有PM吐槽...';
    const modalContent = `
        <div class="phase-rant-modal" id="phase-rant-modal">
            <div class="phase-rant-content">
                <button class="rant-close" onclick="closePhaseRant()">X</button>
                <h3>${phase.name} · ${phase.code}</h3>
                <div class="rant-text">"${rant}"</div>
                <div class="rant-author">— PM吐槽</div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    const modalEl = document.getElementById('phase-rant-modal');
    modalEl.style.display = 'flex';
}

function closePhaseRant() {
    const modal = document.getElementById('phase-rant-modal');
    if (modal) {
        modal.remove();
    }
}

function triggerCompletionAnimation() {
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.getElementById('progress-fill');
    
    progressFill.classList.add('completion-animation');
    progressBar.classList.add('completion-flash');
    
    setTimeout(() => {
        progressFill.classList.remove('completion-animation');
        progressBar.classList.remove('completion-flash');
    }, 3000);
}

function updateSatisfactionUI() {
    const satisfaction = gameState.satisfaction;
    const fill = document.getElementById('satisfaction-fill');
    const text = document.getElementById('satisfaction-text');

    fill.style.width = `${satisfaction}%`;
    text.textContent = `${satisfaction}%`;

    fill.classList.remove('green', 'yellow', 'orange', 'red');

    if (satisfaction >= 80) {
        fill.classList.add('green');
    } else if (satisfaction >= 65) {
        fill.classList.add('yellow');
    } else if (satisfaction >= 50) {
        fill.classList.add('orange');
    } else {
        fill.classList.add('red');
    }
}

function updateWeeklyReport() {
    const reportIndex = Math.min(gameState.week - 1, data.weekly_reports.reports.length - 1);
    const report = data.weekly_reports.reports[reportIndex];
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-summary').textContent = report.summary;
    document.getElementById('report-completed').textContent = report.completed;
    document.getElementById('report-next').textContent = report.next_plan;
    document.getElementById('report-risk').textContent = report.risk;
    document.getElementById('report-fun').textContent = report.fun_comment;
}

function renderEvent() {
    if (gameState.gameOver) return;

    const events = data.events.events;
    if (events.length === 0) return;

    const eventIndex = gameState.currentEventIndex % events.length;
    const event = events[eventIndex];

    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-description').textContent = event.description;

    const optionsContainer = document.getElementById('event-options');
    optionsContainer.innerHTML = '';

    event.options.forEach((option) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.onclick = () => handleChoice(option, event);
        optionsContainer.appendChild(button);
    });
}

function handleChoice(option, event) {
    if (gameState.gameOver) return;

    const effects = option.effects;
    const toolchainEffects = getToolchainEffects();

    data.characters.characters.forEach(character => {
        if (effects[character.id]) {
            let favorChange = effects[character.id];
            if (character.id === 'aisaike') {
                favorChange += toolchainEffects.aisaike_favor;
            } else if (character.id === 'moganna') {
                favorChange += toolchainEffects.moganna_favor;
            } else if (character.id === 'xiaokui') {
                favorChange += toolchainEffects.xiaokui_favor;
            }
            gameState.favors[character.id] = Math.max(0, Math.min(100, 
                (gameState.favors[character.id] || 50) + favorChange));
        }
    });
    
    if (effects.progress) {
        let progressChange = effects.progress;
        gameState.progress = Math.max(0, Math.min(100, gameState.progress + progressChange));
    }
    if (effects.satisfaction !== undefined) {
        let satisfactionChange = effects.satisfaction + toolchainEffects.satisfaction;
        gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + satisfactionChange));
    }

    updatePRDVersion(option.prd_effect);

    gameState.weeklyLogs.push({
        week: gameState.week,
        event: event.title,
        choice: option.text,
        effect: option.weekly_effect
    });

    gameState.currentEventIndex++;

    if (gameState.currentEventIndex % 3 === 0) {
        gameState.week++;
        handleWeekChange();
    }

    saveGame();
    updateUI();
    renderEvent();

    checkEnding();
}

function handleWeekChange() {
    gameState.satisfactionHistory.push(gameState.satisfaction);

    gameState.consecutiveLowSatisfactionWeeks = 0;

    gameState.budget -= 5;

    const interest = calculateInterest();
    
    updateFavorHistory();
    updateCharacterBuffs();
    checkEfficiencyBuffs();

    calculateWeeklyProgress();

    if (gameState.progress >= 100) {
        triggerVictory();
        return;
    }

    if (gameState.budget <= 0) {
        if (gameState.debt >= gameState.debtLimit) {
            triggerGameOver();
            return;
        } else {
            if (typeof showToast === 'function') {
                showToast('⚠️ 资金不足！可以考虑借钱续命');
            }
        }
    }

    const weekInQuarter = getWeekInQuarter();
    
    if (weekInQuarter === 12 && typeof showToast === 'function') {
        showToast('⚠️ 本周是本季度最后一周，结束后将进入季度报表！');
    }

    if (typeof checkQuarterEnd === 'function' && checkQuarterEnd()) {
        showReportModal();
    }
}

function updateFavorHistory() {
    if (!gameState.favorHistory) {
        gameState.favorHistory = {};
    }

    data.characters.characters.forEach(character => {
        if (!gameState.favorHistory[character.id]) {
            gameState.favorHistory[character.id] = [];
        }
        gameState.favorHistory[character.id].push(gameState.favors[character.id] || 50);
        
        if (gameState.favorHistory[character.id].length > 5) {
            gameState.favorHistory[character.id].shift();
        }
    });
}

function updateCharacterBuffs() {
    Object.keys(gameState.characterBuffs).forEach(characterId => {
        gameState.characterBuffs[characterId] = gameState.characterBuffs[characterId].filter(buff => {
            if (buff.duration > 0) {
                buff.duration--;
                return buff.duration > 0;
            }
            return true;
        });

        if (gameState.characterBuffs[characterId].length === 0) {
            delete gameState.characterBuffs[characterId];
        }
    });
}

function checkEfficiencyBuffs() {
    const efficiencyBuff = buffsData.buffs.find(b => b.id === 'efficiency_boost');
    if (!efficiencyBuff) return;

    data.characters.characters.forEach(character => {
        const favor = gameState.favors[character.id] || 50;
        const hasBuff = gameState.characterBuffs[character.id]?.some(b => b.buffId === 'efficiency_boost');

        if (favor > 80 && !hasBuff) {
            addBuffToCharacter(character.id, 'efficiency_boost');
        } else if (favor <= 80 && hasBuff) {
            removeBuffFromCharacter(character.id, 'efficiency_boost');
        }
    });
}

function addBuffToCharacter(characterId, buffId) {
    const buffData = buffsData.buffs.find(b => b.id === buffId);
    if (!buffData) return;

    if (!gameState.characterBuffs[characterId]) {
        gameState.characterBuffs[characterId] = [];
    }

    const existingBuffIndex = gameState.characterBuffs[characterId].findIndex(b => b.buffId === buffId);
    if (existingBuffIndex >= 0) {
        if (buffsData.buff_rules.stacking.same_type === 'refresh') {
            gameState.characterBuffs[characterId][existingBuffIndex].duration = buffData.effect.duration === 'permanent' ? 0 : buffData.effect.duration;
        }
    } else {
        if (gameState.characterBuffs[characterId].length < buffsData.buff_rules.max_buffs_per_character) {
            gameState.characterBuffs[characterId].push({
                buffId: buffId,
                duration: buffData.effect.duration === 'permanent' ? 0 : buffData.effect.duration
            });
        }
    }
}

function removeBuffFromCharacter(characterId, buffId) {
    if (!gameState.characterBuffs[characterId]) return;

    gameState.characterBuffs[characterId] = gameState.characterBuffs[characterId].filter(b => b.buffId !== buffId);

    if (gameState.characterBuffs[characterId].length === 0) {
        delete gameState.characterBuffs[characterId];
    }
}

function calculateWeeklyProgress() {
    let baseProgress = 5;
    
    const toolchainEffects = getToolchainEffects();
    baseProgress += toolchainEffects.progress;
    
    const currentPhase = getCurrentPhase();
    const { weightedSum, totalWeight } = calculateWeightedEfficiency(currentPhase);
    
    let progressMultiplier = totalWeight > 0 ? weightedSum / totalWeight : 1;
    let weeklyProgress = baseProgress * progressMultiplier;
    
    gameState.progress = Math.min(100, gameState.progress + weeklyProgress);
}

function getCurrentPhase() {
    const progress = gameState.progress;
    const phases = weightsData.phases || [];
    
    for (const phase of phases) {
        if (progress >= phase.min_progress && progress < phase.max_progress) {
            return phase;
        }
    }
    
    return phases[phases.length - 1] || { weights: {} };
}

function calculateWeightedEfficiency(phase) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    data.characters.characters.forEach(character => {
        const characterId = character.id;
        const baseWeight = phase.weights[characterId] || 0.1;
        const favor = gameState.favors[characterId] || 50;
        
        let efficiency = 1;
        if (favor > weightsData.efficiency_buff.threshold) {
            efficiency = 1 + getRandomEfficiencyBonus();
        }
        
        const characterBuffs = gameState.characterBuffs[characterId] || [];
        characterBuffs.forEach(buff => {
            const buffData = buffsData.buffs.find(b => b.id === buff.buffId);
            if (buffData && buffData.effect.type === 'progress') {
                efficiency += buffData.effect.value / 100;
            }
        });
        
        weightedSum += efficiency * baseWeight;
        totalWeight += baseWeight;
    });
    
    return { weightedSum, totalWeight };
}

function getRandomEfficiencyBonus() {
    const min = weightsData.efficiency_buff.min_bonus || 0.05;
    const max = weightsData.efficiency_buff.max_bonus || 1.0;
    return Math.random() * (max - min) + min;
}

function getToolchainEffects() {
    let effects = {
        progress: 0,
        satisfaction: 0,
        team_favor: 0,
        aisaike_favor: 0,
        moganna_favor: 0,
        xiaokui_favor: 0,
        bug_rate: 0,
        fatigue: 0
    };
    
    if (!toolsData.categories) return effects;
    
    toolsData.categories.forEach(category => {
        const selectedToolId = selectedTools[category.id];
        if (selectedToolId) {
            const tool = category.tools.find(t => t.id === selectedToolId);
            if (tool) {
                tool.effects.forEach(effect => {
                    if (effects.hasOwnProperty(effect.type)) {
                        effects[effect.type] += effect.value;
                    }
                });
            }
        }
    });
    
    return effects;
}

function updatePRDVersion(change) {
    const versionParts = gameState.prdVersion.replace('V', '').split('.');
    let major = parseInt(versionParts[0]);
    let minor = parseInt(versionParts[1]);
    let patch = parseInt(versionParts[2]);

    patch++;

    if (patch > 9) {
        patch = 0;
        minor++;
    }

    if (minor > 9) {
        minor = 0;
        major++;
    }

    gameState.prdVersion = `V${major}.${minor}.${patch}`;

    const newEntry = {
        id: `prd_${String(gameState.prdHistory.length + 1).padStart(3, '0')}`,
        version: gameState.prdVersion,
        change: change,
        author: "PM"
    };

    gameState.prdHistory.push(newEntry);
}

function renderPRDHistory() {
    const container = document.getElementById('prd-history');
    container.innerHTML = '';

    gameState.prdHistory.slice().reverse().forEach(entry => {
        const div = document.createElement('div');
        div.className = 'prd-entry';
        div.innerHTML = `
            <div class="prd-version">${entry.version}</div>
            <div class="prd-change">${entry.change}</div>
            <div class="prd-author">${entry.author}</div>
        `;
        container.appendChild(div);
    });
}

function renderWeeklyLogs() {
    const reportSection = document.querySelector('.weekly-report');
    let logDiv = document.getElementById('weekly-logs');
    if (!logDiv) {
        logDiv = document.createElement('div');
        logDiv.id = 'weekly-logs';
        logDiv.className = 'change-log';
        reportSection.appendChild(logDiv);
    }

    const weekLogs = gameState.weeklyLogs.filter(log => log.week === gameState.week);
    if (weekLogs.length === 0) {
        logDiv.style.display = 'none';
        return;
    }

    logDiv.style.display = 'block';
    logDiv.innerHTML = '<h4 style="margin-bottom: 10px;">本周变更记录</h4>' +
        weekLogs.map((log, index) =>
            `<div class="change-log-item">[${index + 1}] ${log.effect}</div>`
        ).join('');
}

function openPRDModal() {
    document.getElementById('prd-modal').classList.add('active');
}

function closePRDModal() {
    document.getElementById('prd-modal').classList.remove('active');
}

function checkEnding() {
    if (gameState.gameOver) return;

    const favorValues = Object.values(gameState.favors);
    const avgFavor = favorValues.length > 0 ? Math.round(favorValues.reduce((a, b) => a + b, 0) / favorValues.length) : 0;
    const projectProgress = Math.min(gameState.progress, 100);
    const satisfaction = gameState.satisfaction;

    const currentStats = {
        project_progress: projectProgress,
        avg_favor: avgFavor,
        jiafang_manyi: satisfaction
    };

    const endings = data.endings.endings.sort((a, b) => a.priority - b.priority);

    for (const ending of endings) {
        if (checkTriggerCondition(ending.trigger, currentStats)) {
            triggerEnding(ending);
            return;
        }
    }
}

function checkTriggerCondition(trigger, stats) {
    for (const [key, condition] of Object.entries(trigger)) {
        const statValue = stats[key];

        for (const [operator, value] of Object.entries(condition)) {
            let conditionMet = false;

            switch (operator) {
                case '==':
                case '===':
                    conditionMet = statValue === value;
                    break;
                case '<':
                    conditionMet = statValue < value;
                    break;
                case '<=':
                    conditionMet = statValue <= value;
                    break;
                case '>':
                    conditionMet = statValue > value;
                    break;
                case '>=':
                    conditionMet = statValue >= value;
                    break;
            }

            if (!conditionMet) {
                return false;
            }
        }
    }

    return true;
}

function triggerEnding(ending) {
    gameState.gameOver = true;
    unlockEnding(ending.id);
    
    let prestigeGained = 2;
    
    if (ending.id === 'ending_perfect') {
        prestigeGained += 3;
    }
    
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');
    if (unlockedEndings.length === 1) {
        prestigeGained += 1;
    }
    
    addPrestige(prestigeGained);
    
    showEndingModal(ending);
}

function unlockEnding(endingId) {
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');

    if (!unlockedEndings.includes(endingId)) {
        unlockedEndings.push(endingId);
        localStorage.setItem(ENDINGS_KEY, JSON.stringify(unlockedEndings));
    }
}

function showEndingModal(ending) {
    const modal = document.getElementById('ending-modal');
    const stats = document.getElementById('ending-stats');
    const badge = document.getElementById('ending-badge');
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');
    const isNew = !unlockedEndings.includes(ending.id);

    if (isNew) {
        badge.textContent = '🎉 新结局解锁!';
        badge.classList.add('ending-new');
    } else {
        badge.textContent = '结局解锁';
        badge.classList.remove('ending-new');
    }

    const avgFavor = Math.round((gameState.favors.aisaike + gameState.favors.moganna + gameState.favors.xiaokui) / 3);

    stats.innerHTML = `
        <div class="ending-stat-row">
            <span class="ending-stat-label">最终周数:</span>
            <span class="ending-stat-value">第 ${gameState.week} 周</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">PRD版本:</span>
            <span class="ending-stat-value">${gameState.prdVersion}</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">项目进度:</span>
            <span class="ending-stat-value ${Math.min(gameState.progress, 100) >= 100 ? 'perfect' : 'good'}">${Math.min(gameState.progress, 100)}%</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">${getDirectionText('satisfactionName')}:</span>
            <span class="ending-stat-value ${gameState.satisfaction >= 90 ? 'perfect' : gameState.satisfaction >= 70 ? 'good' : 'bad'}">${gameState.satisfaction}%</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">团队好感度:</span>
            <span class="ending-stat-value ${avgFavor >= 80 ? 'perfect' : avgFavor >= 50 ? 'good' : 'bad'}">${avgFavor}%</span>
        </div>
    `;

    const endingTitle = document.getElementById('ending-title');
    const endingDesc = document.getElementById('ending-description');
    
    if (gameState.ending === 'victory') {
        endingTitle.textContent = getDirectionText('successEnding');
        endingDesc.textContent = `恭喜！${getDirectionText('successEnding')}！`;
    } else {
        endingTitle.textContent = ending.name;
        endingDesc.textContent = ending.description;
    }

    modal.classList.add('active');
}

function triggerGameOver() {
    gameState.gameOver = true;
    
    if (typeof clearBackpack === 'function') {
        clearBackpack();
    }
    
    showGameOverModal();
}

function showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const stats = document.getElementById('game-over-stats');
    const message = document.getElementById('game-over-message');

    message.textContent = getDirectionText('failureEnding');

    stats.innerHTML = `
        <div class="game-over-stat">
            <span class="game-over-stat-label">最终周数:</span>
            <span class="game-over-stat-value">第 ${gameState.week} 周</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">PRD版本:</span>
            <span class="game-over-stat-value">${gameState.prdVersion}</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">项目进度:</span>
            <span class="game-over-stat-value">${Math.min(gameState.progress, 100)}%</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">${getDirectionText('satisfactionName')}:</span>
            <span class="game-over-stat-value">${gameState.satisfaction}%</span>
        </div>
    `;

    modal.classList.add('active');
}

function addPrestige(amount) {
    prestige += amount;
    savePrestigeAndRank();
}

function restartGame() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'index.html';
}

function returnToHome() {
    window.location.href = 'index.html';
}

document.getElementById('btn-back-home').onclick = returnToHome;

document.addEventListener('DOMContentLoaded', loadAllData);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePRDModal();
    }
});
