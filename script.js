const STORAGE_KEY = "fair_office_game_state";
const ENDINGS_KEY = "fair_office_unlocked_endings";
const PRESTIGE_KEY = "fair_office_prestige";
const RANK_KEY = "fair_office_current_rank";

let gameState = {
    week: 1,
    prdVersion: "V1.0.0",
    favors: {
        aisaike: 50,
        moganna: 50,
        xiaokui: 50
    },
    progress: 0,
    satisfaction: 80,
    satisfactionHistory: [80],
    consecutiveLowSatisfactionWeeks: 0,
    prdHistory: [],
    weeklyLogs: [],
    currentEventIndex: 0,
    gameOver: false,
    budget: 100
};

let prestige = 0;
let currentRank = "p5";
let ranks = [];

let data = {
    weekly_reports: { reports: [] },
    prd_templates: { prd_entries: [] },
    events: { events: [] },
    characters: { characters: [] },
    endings: { endings: [] },
    ranks: { ranks: [] }
};

async function loadData() {
    try {
        const [reports, prd, events, characters, endings, ranksData] = await Promise.all([
            fetch('data/weekly_reports.json').then(r => r.json()),
            fetch('data/prd_templates.json').then(r => r.json()),
            fetch('data/events.json').then(r => r.json()),
            fetch('data/characters.json').then(r => r.json()),
            fetch('data/endings.json').then(r => r.json()),
            fetch('data/ranks.json').then(r => r.json())
        ]);
        
        data.weekly_reports = reports;
        data.prd_templates = prd;
        data.events = events;
        data.characters = characters;
        data.endings = endings;
        data.ranks = ranksData;
        ranks = ranksData.ranks;
        
        loadPrestigeAndRank();
        updateRankDisplay();
        checkForSave();
    } catch (error) {
        console.error('Failed to load data:', error);
        initGameWithFallback();
    }
}

function initGameWithFallback() {
    data.weekly_reports = {
        reports: [{
            id: "week1",
            title: "第一周周报",
            summary: "项目启动，团队磨合中",
            completed: "搭建基础框架，完成需求评审",
            next_plan: "进入开发阶段，预计下周输出第一个接口",
            risk: "无",
            fun_comment: "艾萨克和莫甘娜第一次见面就在代码风格上吵了起来，气氛很微妙。"
        }]
    };
    
    data.events = {
        events: [{
            id: "event_001",
            title: "凌晨三点的需求",
            description: "甲方在群里@了你，发来59秒语音。",
            options: [
                {
                    text: "接下需求，安排RD加班",
                    effects: {"aisaike": -5, "progress": 10, "satisfaction": 5},
                    prd_effect: "新增需求#408：批量导出功能",
                    weekly_effect: "本周加班严重，团队略显疲惫"
                },
                {
                    text: "拒绝需求，跟甲方谈判",
                    effects: {"team_mood": -10, "morale": 5, "satisfaction": -15},
                    prd_effect: "需求变更记录：拒绝非核心需求",
                    weekly_effect: "团队士气有所提升，但甲方关系紧张"
                },
                {
                    text: "让QA帮忙评估需求",
                    effects: {"moganna": 3, "progress": 5, "satisfaction": 0},
                    prd_effect: "需求评估记录：QA参与需求分析",
                    weekly_effect: "莫甘娜参与度提高，团队协作加强"
                }
            ]
        }]
    };
    
    data.prd_templates = {
        prd_entries: [{
            id: "prd_001",
            version: "V1.0.0",
            change: "初始版本，确定项目范围",
            author: "PM"
        }]
    };
    
    data.endings = {
        endings: [
            {
                id: "ending_fail",
                name: "被大厂吞并",
                trigger: {"project_progress": {"<": 100}, "jiafang_manyi": {"<": 65}},
                priority: 1,
                description: "甲方最终无奈再次接洽天堂和地狱两方大厂……创业失败。"
            },
            {
                id: "ending_success",
                name: "梦想实现",
                trigger: {"project_progress": {"==": 100}},
                priority: 0,
                description: "项目成功上线！你们终于……实现了大家的梦想。"
            },
            {
                id: "ending_team_collapse",
                name: "团队解散",
                trigger: {"avg_favor": {"<": 30}},
                priority: 2,
                description: "团队矛盾激化，成员纷纷离职。你的事务所不得不解散。"
            },
            {
                id: "ending_perfect",
                name: "完美收官",
                trigger: {"project_progress": {"==": 100}, "avg_favor": {">": 80}, "jiafang_manyi": {">": 90}},
                priority: 0,
                description: "项目完美交付，团队凝聚力空前，甲方高度认可！这是属于你们的传奇！"
            },
            {
                id: "ending_balance",
                name: "中规中矩",
                trigger: {"project_progress": {">=": 80}, "avg_favor": {">=": 50}, "jiafang_manyi": {">=": 70}},
                priority: 1,
                description: "项目顺利完成，虽然不算完美，但大家都还算满意。"
            }
        ]
    };
    
    checkForSave();
}

function checkForSave() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        document.getElementById('btn-continue').style.display = 'block';
    }
    document.getElementById('start-screen').style.display = 'flex';
}

function startNewGame() {
    const rank = ranks.find(r => r.id === currentRank) || ranks[0];
    
    gameState = {
        week: 1,
        prdVersion: "V1.0.0",
        favors: {
            aisaike: 50,
            moganna: 50,
            xiaokui: 50
        },
        progress: 0,
        satisfaction: 80,
        satisfactionHistory: [80],
        consecutiveLowSatisfactionWeeks: 0,
        prdHistory: [],
        weeklyLogs: [],
        currentEventIndex: 0,
        gameOver: false,
        budget: rank.budget
    };
    
    document.getElementById('start-screen').style.display = 'none';
    initGame();
}

function continueGame() {
    loadGameState();
    document.getElementById('start-screen').style.display = 'none';
    initGame();
}

function initGame() {
    if (gameState.prdHistory.length === 0) {
        gameState.prdHistory = [...data.prd_templates.prd_entries];
    }
    
    updateUI();
    renderEvent();
}

function loadGameState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const savedState = JSON.parse(saved);
        gameState = { ...gameState, ...savedState };
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

function updateUI() {
    if (gameState.gameOver) return;
    
    document.getElementById('week-number').textContent = `第 ${gameState.week} 周`;
    document.getElementById('prd-version').textContent = gameState.prdVersion;
    
    const avgFavor = Math.round((gameState.favors.aisaike + gameState.favors.moganna + gameState.favors.xiaokui) / 3);
    document.getElementById('avg-favor').textContent = `${avgFavor}%`;

    document.getElementById('satisfaction-value').textContent = `${gameState.satisfaction}%`;

    const budgetElement = document.getElementById('budget-value');
    if (budgetElement) {
        budgetElement.textContent = gameState.budget;
        if (gameState.budget < 20) {
            budgetElement.classList.add('cashflow-low');
        } else {
            budgetElement.classList.remove('cashflow-low');
        }
    }

    document.getElementById('favor-isaac').style.width = `${gameState.favors.aisaike}%`;
    document.getElementById('favor-value-isaac').textContent = gameState.favors.aisaike;

    document.getElementById('favor-morgana').style.width = `${gameState.favors.moganna}%`;
    document.getElementById('favor-value-morgana').textContent = gameState.favors.moganna;

    document.getElementById('favor-xiaokui').style.width = `${gameState.favors.xiaokui}%`;
    document.getElementById('favor-value-xiaokui').textContent = gameState.favors.xiaokui;

    document.getElementById('progress-fill').style.width = `${Math.min(gameState.progress, 100)}%`;
    document.getElementById('progress-text').textContent = `${Math.min(gameState.progress, 100)}%`;

    updateSatisfactionUI();

    const reportIndex = Math.min(gameState.week - 1, data.weekly_reports.reports.length - 1);
    const report = data.weekly_reports.reports[reportIndex];
    document.getElementById('report-title').textContent = report.title;
    document.getElementById('report-summary').textContent = report.summary;
    document.getElementById('report-completed').textContent = report.completed;
    document.getElementById('report-next').textContent = report.next_plan;
    document.getElementById('report-risk').textContent = report.risk;
    document.getElementById('report-fun').textContent = report.fun_comment;

    renderPRDHistory();
    renderWeeklyLogs();
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

function renderEvent() {
    if (gameState.gameOver) return;
    
    const events = data.events.events;
    if (events.length === 0) return;
    
    const eventIndex = Math.floor(Math.random() * events.length);
    const event = events[eventIndex];

    document.getElementById('event-title').textContent = event.title;
    document.getElementById('event-description').textContent = event.description;

    const optionsContainer = document.getElementById('event-options');
    optionsContainer.innerHTML = '';

    event.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = option.text;
        button.onclick = () => handleChoice(option, event);
        optionsContainer.appendChild(button);
    });
}

function handleChoice(option, event) {
    if (gameState.gameOver) return;
    
    if (option.budget !== undefined) {
        if (gameState.budget + option.budget < 0) {
            alert('预算不足，无法执行此选项');
            return;
        }
        gameState.budget = Math.max(0, Math.min(999, gameState.budget + option.budget));
    }
    
    const effects = option.effects;
    
    if (effects.aisaike) {
        gameState.favors.aisaike = Math.max(0, Math.min(100, gameState.favors.aisaike + effects.aisaike));
    }
    if (effects.moganna) {
        gameState.favors.moganna = Math.max(0, Math.min(100, gameState.favors.moganna + effects.moganna));
    }
    if (effects.xiaokui) {
        gameState.favors.xiaokui = Math.max(0, Math.min(100, gameState.favors.xiaokui + effects.xiaokui));
    }
    if (effects.progress) {
        gameState.progress = Math.max(0, Math.min(100, gameState.progress + effects.progress));
    }
    if (effects.satisfaction !== undefined) {
        gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + effects.satisfaction));
    }

    updatePRDVersion(option.prd_effect);

    gameState.weeklyLogs.push({
        week: gameState.week,
        event: event.title,
        choice: option.text,
        effect: option.weekly_effect
    });

    gameState.currentEventIndex++;

    const previousWeek = gameState.week;
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
    console.log('handleWeekChange called, week:', gameState.week);
    const weeklyProgress = calculateWeeklyProgress();
    console.log('Weekly progress:', weeklyProgress);
    gameState.progress = Math.min(100, gameState.progress + weeklyProgress);
    
    const previousBudget = gameState.budget;
    gameState.budget = Math.max(0, gameState.budget - 5);
    console.log('Budget changed:', previousBudget, '->', gameState.budget);
    
    gameState.weeklyLogs.push({
        week: gameState.week,
        event: '每周结算',
        choice: '自动',
        effect: `团队推进项目：+${weeklyProgress}%，基础运营消耗：-5`
    });
    
    if (checkGameOver()) {
        return;
    }
    
    gameState.satisfactionHistory.push(gameState.satisfaction);
    
    if (gameState.satisfaction < 65) {
        gameState.consecutiveLowSatisfactionWeeks++;
        
        if (gameState.consecutiveLowSatisfactionWeeks >= 3) {
            triggerGameOver('甲方已与天堂/地狱签约，你的事务所被列入黑名单');
            return;
        }
    } else {
        gameState.consecutiveLowSatisfactionWeeks = 0;
    }
    
    autoSaveOnWeekStart();
}

function autoSaveOnWeekStart() {
    saveGame();
}

function calculateWeeklyProgress() {
    const avgFavor = Math.round((gameState.favors.aisaike + gameState.favors.moganna + gameState.favors.xiaokui) / 3);
    
    const baseValue = 10;
    const favorBonus = (avgFavor - 50) / 10;
    
    let rdBonus = gameState.favors.aisaike > 80 ? 8 : 5;
    const qaBonus = 2;
    const opsBonus = 1;
    const growthBonus = gameState.satisfaction > 80 ? 4 : 2;
    
    const positionBonus = (rdBonus + qaBonus + opsBonus + growthBonus) / 4;
    
    let totalGrowth = baseValue + favorBonus + positionBonus;
    
    totalGrowth = Math.max(3, Math.min(20, totalGrowth));
    
    return Math.round(totalGrowth);
}

function checkGameOver() {
    if (gameState.budget <= 0) {
        triggerGameOver('预算耗尽，事务所倒闭');
        return true;
    }
    
    if (gameState.progress >= 100) {
        const ending = data.endings.endings.find(e => e.id === 'ending_success') || data.endings.endings[0];
        triggerEnding(ending);
        return true;
    }
    
    return false;
}

function checkEnding() {
    if (gameState.gameOver) return;
    
    const avgFavor = Math.round((gameState.favors.aisaike + gameState.favors.moganna + gameState.favors.xiaokui) / 3);
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
            <span class="ending-stat-label">甲方满意度:</span>
            <span class="ending-stat-value ${gameState.satisfaction >= 90 ? 'perfect' : gameState.satisfaction >= 70 ? 'good' : 'bad'}">${gameState.satisfaction}%</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">团队好感度:</span>
            <span class="ending-stat-value ${avgFavor >= 80 ? 'perfect' : avgFavor >= 50 ? 'good' : 'bad'}">${avgFavor}%</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">艾萨克好感度:</span>
            <span class="ending-stat-value">${gameState.favors.aisaike}</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">莫甘娜好感度:</span>
            <span class="ending-stat-value">${gameState.favors.moganna}</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">小葵好感度:</span>
            <span class="ending-stat-value">${gameState.favors.xiaokui}</span>
        </div>
    `;
    
    document.getElementById('ending-title').textContent = ending.name;
    document.getElementById('ending-description').textContent = ending.description;
    
    modal.classList.add('active');
}

let gameOverMessage = '';

function triggerGameOver(message = '甲方已与天堂/地狱签约，你的事务所被列入黑名单') {
    gameState.gameOver = true;
    gameOverMessage = message;
    showGameOverModal();
}

function showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const stats = document.getElementById('game-over-stats');
    
    title.textContent = gameOverMessage;
    
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
            <span class="game-over-stat-label">甲方满意度:</span>
            <span class="game-over-stat-value">${gameState.satisfaction}%</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">艾萨克好感度:</span>
            <span class="game-over-stat-value">${gameState.favors.aisaike}</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">莫甘娜好感度:</span>
            <span class="game-over-stat-value">${gameState.favors.moganna}</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">小葵好感度:</span>
            <span class="game-over-stat-value">${gameState.favors.xiaokui}</span>
        </div>
    `;
    
    modal.classList.add('active');
}

function restartGame() {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('game-over-modal').classList.remove('active');
    document.getElementById('ending-modal').classList.remove('active');
    startNewGame();
}

function updatePRDVersion(change) {
    const versionParts = gameState.prdVersion.replace('V', '').split('.');
    let major = parseInt(versionParts[0]);
    let minor = parseInt(versionParts[1]);
    let patch = parseInt(versionParts[2]) + 1;

    if (patch >= 10) {
        patch = 0;
        minor++;
    }
    if (minor >= 10) {
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

function loadPrestigeAndRank() {
    prestige = parseInt(localStorage.getItem(PRESTIGE_KEY) || '0');
    currentRank = localStorage.getItem(RANK_KEY) || 'p5';
}

function savePrestigeAndRank() {
    localStorage.setItem(PRESTIGE_KEY, prestige.toString());
    localStorage.setItem(RANK_KEY, currentRank);
}

function updateRankDisplay() {
    const rank = ranks.find(r => r.id === currentRank) || ranks[0];
    const nextRank = ranks.find(r => r.cost > prestige);
    
    document.querySelector('.rank-value').textContent = rank.name;
    document.querySelector('.rank-comparison .tian').textContent = `天堂 ${rank.tian}`;
    document.querySelector('.rank-comparison .jue').textContent = `裁决 ${rank.jue}`;
    document.querySelector('.rank-comparison .di').textContent = `地狱 ${rank.di}`;
    document.querySelector('.prestige-value').textContent = prestige;
    
    if (nextRank) {
        document.querySelector('.next-prestige').textContent = nextRank.cost;
        const remaining = nextRank.cost - prestige;
        document.querySelector('.prestige-remaining').textContent = `（下一级 ${nextRank.name} 还需 ${remaining}）`;
    } else {
        document.querySelector('.next-prestige').textContent = '-';
        document.querySelector('.prestige-remaining').textContent = '（已达到最高职级）';
    }
}

function addPrestige(amount) {
    prestige += amount;
    savePrestigeAndRank();
    updateRankDisplay();
}

function showLevelupModal() {
    const list = document.getElementById('levelup-list');
    list.innerHTML = '';
    
    ranks.forEach(rank => {
        const isCurrent = rank.id === currentRank;
        const isUnlocked = rank.cost <= prestige;
        
        const item = document.createElement('div');
        item.className = `levelup-item ${isCurrent ? 'current' : ''} ${!isUnlocked && !isCurrent ? 'locked' : ''}`;
        
        const info = document.createElement('div');
        info.className = 'levelup-info';
        
        const name = document.createElement('div');
        name.className = 'levelup-name';
        name.textContent = rank.name;
        
        const compare = document.createElement('div');
        compare.className = 'levelup-compare';
        compare.innerHTML = `<span style="color: #ff9500">天堂 ${rank.tian}</span> / <span style="color: #00ff41">裁决 ${rank.jue}</span> / <span style="color: #ff4444">地狱 ${rank.di}</span>`;
        
        const unlock = document.createElement('div');
        unlock.className = 'levelup-unlock';
        unlock.textContent = `解锁：${rank.unlock}`;
        
        const budget = document.createElement('div');
        budget.className = 'levelup-budget';
        budget.textContent = `初始预算：${rank.budget}`;
        
        info.appendChild(name);
        info.appendChild(compare);
        info.appendChild(unlock);
        info.appendChild(budget);
        
        const button = document.createElement('button');
        button.className = 'btn-promote';
        button.textContent = isCurrent ? '当前职级' : (isUnlocked ? '🔥 晋升' : `需要 ${rank.cost} 声望`);
        button.disabled = !isUnlocked || isCurrent;
        
        if (isUnlocked && !isCurrent) {
            button.onclick = () => promoteToRank(rank.id);
        }
        
        item.appendChild(info);
        item.appendChild(button);
        list.appendChild(item);
    });
    
    document.getElementById('levelup-modal').style.display = 'flex';
}

function closeLevelupModal() {
    document.getElementById('levelup-modal').style.display = 'none';
}

function promoteToRank(rankId) {
    const rank = ranks.find(r => r.id === rankId);
    if (!rank || rank.cost > prestige) return;
    
    currentRank = rankId;
    savePrestigeAndRank();
    updateRankDisplay();
    closeLevelupModal();
    
    alert(`恭喜晋升到 ${rank.name}！初始预算变为 ${rank.budget}`);
}

function showGallery() {
    const grid = document.getElementById('gallery-grid');
    grid.innerHTML = '';
    
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');
    
    data.endings.endings.forEach(ending => {
        const isUnlocked = unlockedEndings.includes(ending.id);
        
        const item = document.createElement('div');
        item.className = `gallery-item ${isUnlocked ? 'unlocked' : 'locked'}`;
        
        if (isUnlocked) {
            const name = document.createElement('div');
            name.className = 'gallery-name';
            name.textContent = ending.name;
            item.appendChild(name);
        }
        
        grid.appendChild(item);
    });
    
    document.getElementById('gallery-modal').style.display = 'flex';
}

function closeGalleryModal() {
    document.getElementById('gallery-modal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', loadData);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePRDModal();
        closeLevelupModal();
        closeGalleryModal();
    }
});

window.openPRDModal = openPRDModal;
window.closePRDModal = closePRDModal;
window.saveGame = saveGame;
window.startNewGame = startNewGame;
window.continueGame = continueGame;
window.restartGame = restartGame;
window.showLevelupModal = showLevelupModal;
window.closeLevelupModal = closeLevelupModal;
window.showGallery = showGallery;
window.closeGalleryModal = closeGalleryModal;