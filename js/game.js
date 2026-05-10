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

function getDirectionConfig() {
    const dir = gameState.direction || 'tob';
    return data.directionConfig[dir] || data.directionConfig['tob'];
}

function getProgressConfig() {
    return getDirectionConfig();
}

function getDirectionPhaseByProgress(progress) {
    const config = getDirectionConfig();
    const phases = config.phases || [];
    const weightsPhases = weightsData.phases || [];
    
    for (const wPhase of weightsPhases) {
        if (progress >= wPhase.min_progress && progress < wPhase.max_progress) {
            const dirPhase = phases.find(p => p.id === wPhase.id);
            return dirPhase || wPhase;
        }
    }
    return phases[phases.length - 1] || { name: '未知阶段', code: 'SDLC-00' };
}

function getDirectionText(key) {
    const config = getDirectionConfig();
    return config[key] || '';
}

function triggerVictory(endingType = 'success') {
    gameState.gameOver = true;
    gameState.ending = endingType;
    saveGame();
    checkAndUnlockProducts();
    showEndingModalForVictory(endingType);
}

function triggerGameOver(reason) {
    gameState.gameOver = true;
    gameState.ending = 'failure';
    gameState.failureReason = reason;
    saveGame();
    
    if (typeof clearBackpack === 'function') {
        clearBackpack();
    }
    
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
    debtLimit: 100,
    okrBonus: 0,
    financingRound: 0,
    financingDebt: 0,
    consecutiveProfitableQuarters: 0,
    totalAssets: 0,
    dau: 0,
    ltv: 2,
    gmv: 0,
    commissionRate: 5,
    disputeRate: 5,
    benchmarkClients: 0,
    renewalRate: 70,
    toBPhase: 0,
    declinedIPO: false,
    triggerAcquisition: false
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
    buffs: { buffs: [], buff_rules: {} },
    financing: { rounds: [] },
    directionConfig: {}
};

let weightsData = { phases: [], efficiency_buff: { threshold: 80, min_bonus: 0.05, max_bonus: 1.0 } };
let buffsData = { buffs: [], buff_rules: { max_buffs_per_character: 3, buff_duration_unit: "weeks", stacking: { same_type: "refresh", different_type: "stack" } } };

async function loadAllData() {
    try {
        const [weeklyReports, prdTemplates, events, characters, ranksData, endings, tools, weights, buffs, financing, directionConfig] = await Promise.all([
            fetch('data/weekly_reports.json').then(r => r.json()),
            fetch('data/prd_templates.json').then(r => r.json()),
            fetch('data/events.json').then(r => r.json()),
            fetch('data/characters.json').then(r => r.json()),
            fetch('data/ranks.json').then(r => r.json()),
            fetch('data/endings.json').then(r => r.json()),
            fetch('data/tools.json').then(r => r.json()),
            fetch('data/weights.json').then(r => r.json()),
            fetch('data/buffs.json').then(r => r.json()),
            fetch('data/financing.json').then(r => r.json()),
            fetch('data/direction_config.json').then(r => r.json())
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
        data.financing = financing;
        data.directionConfig = directionConfig;
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
        
        initToolchainSkin();
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

function initToolchainSkin() {
    const toolchainId = localStorage.getItem(TOOLCHAIN_KEY);
    if (!toolchainId) return;
    
    document.body.classList.add(`skin-${toolchainId}`);
    
    const toolchain = gameState.toolchain;
    if (toolchain) {
        applyToolchainStyles(toolchain);
        renderToolchainLayout(toolchainId);
    }
}

function applyToolchainStyles(toolchain) {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', toolchain.background);
    root.style.setProperty('--primary-color', toolchain.primary);
    root.style.setProperty('--secondary-color', toolchain.secondary);
    root.style.setProperty('--accent-color', toolchain.accent);
    root.style.setProperty('--text-color', toolchain.text);
    root.style.setProperty('--border-color', toolchain.border);
}

function renderToolchainLayout(toolchainId) {
    const container = document.querySelector('.container');
    if (!container) return;
    
    switch(toolchainId) {
        case 'jira':
            renderJiraLayout();
            break;
        case 'zentao':
            renderZentaoLayout();
            break;
        case 'feishu':
            renderFeishuLayout();
            break;
        case 'dingtalk':
            renderDingtalkLayout();
            break;
    }
}

function renderJiraLayout() {
    const mainArea = document.querySelector('.main-area');
    const sidebarLeft = document.querySelector('.sidebar-left');
    const sidebarRight = document.querySelector('.sidebar-right');
    if (!mainArea) return;
    
    if (sidebarLeft) sidebarLeft.style.display = 'none';
    if (sidebarRight) sidebarRight.style.display = 'none';
    
    let sidebar = document.querySelector('.sidebar');
    if (!sidebar && document.querySelector('.container')) {
        sidebar = document.createElement('div');
        sidebar.className = 'sidebar';
        document.querySelector('.container').appendChild(sidebar);
    }
    
    mainArea.innerHTML = `
        <div class="jira-kanban">
            <div class="kanban-col">
                <div class="kanban-col-header todo">
                    <span class="kanban-col-icon">📋</span>
                    <span class="kanban-col-title">To Do</span>
                    <span class="kanban-col-count">3</span>
                </div>
                <div class="kanban-col-body">
                    <div class="jira-ticket">
                        <div class="jira-ticket-key">FAIR-1</div>
                        <div class="jira-ticket-title">完成需求评审</div>
                        <div class="jira-ticket-meta">🔴 高优先级</div>
                    </div>
                    <div class="jira-ticket">
                        <div class="jira-ticket-key">FAIR-2</div>
                        <div class="jira-ticket-title">设计稿确认</div>
                        <div class="jira-ticket-meta">🟡 中优先级</div>
                    </div>
                    <div class="jira-ticket">
                        <div class="jira-ticket-key">FAIR-3</div>
                        <div class="jira-ticket-title">技术方案设计</div>
                        <div class="jira-ticket-meta">🟢 低优先级</div>
                    </div>
                </div>
            </div>
            <div class="kanban-col">
                <div class="kanban-col-header progress">
                    <span class="kanban-col-icon">🔄</span>
                    <span class="kanban-col-title">In Progress</span>
                    <span class="kanban-col-count">2</span>
                </div>
                <div class="kanban-col-body">
                    <div class="jira-ticket">
                        <div class="jira-ticket-key">FAIR-4</div>
                        <div class="jira-ticket-title">核心功能开发</div>
                        <div class="jira-ticket-meta">🔴 高优先级</div>
                    </div>
                    <div class="jira-ticket">
                        <div class="jira-ticket-key">FAIR-5</div>
                        <div class="jira-ticket-title">接口联调</div>
                        <div class="jira-ticket-meta">🟡 中优先级</div>
                    </div>
                </div>
            </div>
            <div class="kanban-col">
                <div class="kanban-col-header done">
                    <span class="kanban-col-icon">✅</span>
                    <span class="kanban-col-title">Done</span>
                    <span class="kanban-col-count">2</span>
                </div>
                <div class="kanban-col-body">
                    <div class="jira-ticket completed">
                        <div class="jira-ticket-key">FAIR-6</div>
                        <div class="jira-ticket-title">项目初始化</div>
                        <div class="jira-ticket-meta">✅ 已完成</div>
                    </div>
                    <div class="jira-ticket completed">
                        <div class="jira-ticket-key">FAIR-7</div>
                        <div class="jira-ticket-title">环境搭建</div>
                        <div class="jira-ticket-meta">✅ 已完成</div>
                    </div>
                </div>
            </div>
            <div class="kanban-col event-col">
                <div class="kanban-col-header events">
                    <span class="kanban-col-icon">📣</span>
                    <span class="kanban-col-title">本周事件</span>
                </div>
                <div class="kanban-col-body">
                    <div class="jira-event-card">
                        <h3 class="event-title" id="event-title">等待事件...</h3>
                        <p class="event-description" id="event-description">选择一个选项继续</p>
                        <div class="event-options" id="event-options"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (sidebar) {
        sidebar.innerHTML = `
            <div class="character-panel">
                <h3 class="panel-title">🧑‍💻 团队成员</h3>
                <div id="portraits-container" class="portraits-container"></div>
            </div>
            <div class="progress-panel">
                <h3 class="panel-title">${getProgressConfig().progressName}</h3>
                <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width: ${gameState.progress}%"></div></div>
                <div class="progress-text" id="progress-text">${gameState.progress.toFixed(1)}%</div>
            </div>
            <div class="satisfaction-panel">
                <h3 class="panel-title" id="satisfaction-panel-title">满意度</h3>
                <div class="satisfaction-bar"><div class="satisfaction-fill green" id="satisfaction-fill" style="width: ${gameState.satisfaction}%"></div></div>
                <div class="satisfaction-text" id="satisfaction-text">${gameState.satisfaction}%</div>
            </div>
        `;
        renderCharacterCards();
    }
}

function renderZentaoLayout() {
    const mainArea = document.querySelector('.main-area');
    if (!mainArea) return;
    
    mainArea.innerHTML = `
        <div class="project-header">
            <h2>公平事务所 - 当前项目</h2>
            <span>进度: ${gameState.progress}%</span>
        </div>
        <table class="task-table">
            <thead>
                <tr>
                    <th>需求</th>
                    <th>任务</th>
                    <th>Bug</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>用户登录模块</td>
                    <td>前端页面开发</td>
                    <td></td>
                </tr>
                <tr class="task-row-urgent">
                    <td>数据统计面板</td>
                    <td>后端接口开发</td>
                    <td>页面加载缓慢</td>
                </tr>
                <tr>
                    <td>报表导出功能</td>
                    <td>文档编写</td>
                    <td></td>
                </tr>
            </tbody>
        </table>
        <div class="zentao-event-modal">
            <div class="zentao-event-card">
                <h3 class="event-title" id="event-title">事件标题</h3>
                <p class="event-description" id="event-description">事件描述</p>
                <div class="event-options" id="event-options"></div>
            </div>
        </div>
    `;
    
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.innerHTML = `
            <div class="character-panel">
                <h3 class="panel-title">团队成员</h3>
                <table>
                    <thead>
                        <tr>
                            <th>角色</th>
                            <th>好感度</th>
                            <th>磨损</th>
                        </tr>
                    </thead>
                    <tbody id="team-table-body"></tbody>
                </table>
            </div>
            <div class="progress-panel">
                <h3 class="panel-title">${getProgressConfig().progressName}</h3>
                <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width: ${gameState.progress}%"></div></div>
                <div class="progress-text" id="progress-text">${gameState.progress}%</div>
            </div>
            <div class="satisfaction-panel">
                <h3 class="panel-title" id="satisfaction-panel-title"></h3>
                <div class="satisfaction-bar"><div class="satisfaction-fill green" id="satisfaction-fill" style="width: ${gameState.satisfaction}%"></div></div>
                <div class="satisfaction-text" id="satisfaction-text">${gameState.satisfaction}%</div>
            </div>
        `;
        renderTeamTable();
    }
}

function renderTeamTable() {
    const tbody = document.getElementById('team-table-body');
    if (!tbody) return;
    
    const characters = gameState.characters || [];
    tbody.innerHTML = characters.map(char => `
        <tr>
            <td>${char.name}</td>
            <td>${char.favor || 0}</td>
            <td>${char.wear || 0}</td>
        </tr>
    `).join('');
}

function renderFeishuLayout() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="sidebar">
            <div class="character-panel">
                <h3 class="panel-title">团队协作</h3>
                <div id="portraits-container" class="portraits-container"></div>
            </div>
            <div class="progress-panel">
                <h3 class="panel-title">📊 ${getProgressConfig().progressName}</h3>
                <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width: ${gameState.progress}%"></div></div>
                <div class="progress-text" id="progress-text">${gameState.progress.toFixed(1)}%</div>
            </div>
            <div class="satisfaction-panel">
                <h3 class="panel-title" id="satisfaction-panel-title">❤️ 甲方满意度</h3>
                <div class="satisfaction-bar"><div class="satisfaction-fill" id="satisfaction-fill" style="width: ${gameState.satisfaction}%"></div></div>
                <div class="satisfaction-text" id="satisfaction-text">${gameState.satisfaction}%</div>
            </div>
        </div>
        <div class="main-area">
            <div class="document-section">
                <div class="document-title">📄 PRD 文档</div>
                <div class="prd-section">
                    <h4>版本 ${gameState.prdVersion}</h4>
                    <p class="document-content">${getCurrentPRDContent()}</p>
                </div>
            </div>
            <div class="document-section">
                <div class="document-title">📝 本周周报</div>
                <div class="document-content">${getCurrentWeeklyReport()}</div>
            </div>
        </div>
        <div class="event-area">
            <div class="document-title">💬 消息</div>
            <div class="feishu-comment-bubble">
                <h3 class="event-title" id="event-title">事件标题</h3>
                <p class="event-description" id="event-description">事件描述</p>
                <div class="event-options" id="event-options"></div>
            </div>
        </div>
    `;
    
    renderCharacterCards();
    renderEventOptions();
}

function getCurrentPRDContent() {
    return '当前版本主要功能包括：用户登录认证、数据统计展示、报表导出功能。下版本计划新增移动端适配和多语言支持。';
}

function getCurrentWeeklyReport() {
    return `**本周工作：**
- 完成核心功能开发
- 修复线上Bug 3个
- 代码审查通过

**下周计划：**
- 进行系统联调
- 编写测试用例
- 准备上线部署`;
}

function renderDingtalkLayout() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="sidebar">
            <div class="character-panel" id="dingtalk-team">
                <h3 class="panel-title">🧑‍💻 团队成员</h3>
            </div>
            <div class="progress-panel">
                <h3 class="panel-title">📊 ${getProgressConfig().progressName}</h3>
                <div class="progress-bar"><div class="progress-fill" id="progress-fill" style="width: ${gameState.progress}%"></div></div>
                <div class="progress-text" id="progress-text">${gameState.progress.toFixed(1)}%</div>
            </div>
            <div class="satisfaction-panel">
                <h3 class="panel-title" id="satisfaction-panel-title">❤️ ${getDirectionText('satisfactionName')}</h3>
                <div class="satisfaction-bar"><div class="satisfaction-fill" id="satisfaction-fill" style="width: ${gameState.satisfaction}%"></div></div>
                <div class="satisfaction-text" id="satisfaction-text">${gameState.satisfaction}%</div>
            </div>
        </div>
        <div class="main-area">
            <div class="task-flow">
                <div class="task-flow-header">
                    <span class="active">已读</span>
                    <span>未回</span>
                </div>
                <div id="dingtalk-tasks"></div>
            </div>
        </div>
        <div class="event-area">
            <div class="message-bubble">
                <div class="message-avatar">📢</div>
                <div class="message-content">
                    <div class="message-sender">系统</div>
                    <h3 class="event-title" id="event-title">事件标题</h3>
                    <p class="event-description" id="event-description">事件描述</p>
                    <div class="event-options" id="event-options"></div>
                </div>
            </div>
        </div>
    `;
    
    const tasks = document.getElementById('dingtalk-tasks');
    if (tasks) {
        tasks.innerHTML = `
            <div class="task-item">
                <div class="task-avatar">💼</div>
                <div class="task-content">
                    <div class="task-title">项目进度同步</div>
                    <div class="task-meta">今天 14:30</div>
                </div>
                <div class="task-status">已读 ✅</div>
            </div>
            <div class="task-item unread">
                <div class="task-avatar">📊</div>
                <div class="task-content">
                    <div class="task-title">周报提交提醒</div>
                    <div class="task-meta">今天 09:00</div>
                </div>
                <div class="task-status">待处理</div>
            </div>
        `;
    }
    
    renderDingtalkTeam();
    renderEventOptions();
}

function renderDingtalkTeam() {
    const teamContainer = document.getElementById('dingtalk-team');
    if (!teamContainer) return;
    
    const characters = gameState.characters || [];
    teamContainer.innerHTML = `
        <h3 class="panel-title">🧑‍💻 团队成员</h3>
        <div class="portraits-container" id="portraits-container"></div>
    `;
    
    renderCharacterCards();
}

function renderEventOptions() {
    const optionsContainer = document.getElementById('event-options');
    if (!optionsContainer || !gameState.currentEvent) return;
    
    optionsContainer.innerHTML = gameState.currentEvent.options.map((opt, idx) => `
        <button class="btn-pixel" onclick="handleEventChoice(${idx})">${opt.text}</button>
    `).join('');
}

function updateDirectionLabels() {
    const config = getDirectionConfig();
    
    const fameLabel = document.getElementById('fame-label');
    const satisfactionPanelTitle = document.getElementById('satisfaction-panel-title');
    
    if (fameLabel) {
        const newFameText = `${config.fameIcon} ${config.fameName}:`;
        if (fameLabel.textContent !== newFameText) {
            fameLabel.textContent = newFameText;
        }
    }
    if (satisfactionPanelTitle) {
        if (satisfactionPanelTitle.textContent !== config.satisfactionName) {
            satisfactionPanelTitle.textContent = config.satisfactionName;
        }
    }
}

let directionLabelInterval = null;
function startDirectionLabelUpdates() {
    if (directionLabelInterval) {
        clearInterval(directionLabelInterval);
    }
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
    
    updateDirectionLabels();

    updateHCDisplay();
    renderCharacterCards();
    updateProgressUI();
    updateSatisfactionUI();
    updateWeeklyReport();
    updateBusinessMetrics();
    renderPRDHistory();
    renderWeeklyLogs();
}

function updateBusinessMetrics() {
    const direction = gameState.direction;
    const metricsDiv = document.getElementById('business-metrics');
    if (!metricsDiv) return;
    
    let metricsHTML = '';
    
    if (direction === 'tob') {
        metricsHTML = `
            <div class="metric-item">
                <span class="metric-label">标杆客户:</span>
                <span class="metric-value">${gameState.benchmarkClients}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">续约率:</span>
                <span class="metric-value">${gameState.renewalRate}%</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">回款阶段:</span>
                <span class="metric-value">Phase ${gameState.toBPhase + 1}</span>
            </div>
        `;
    } else if (direction === 'toc') {
        metricsHTML = `
            <div class="metric-item">
                <span class="metric-label">DAU(万):</span>
                <span class="metric-value">${gameState.dau}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">LTV(元):</span>
                <span class="metric-value">${gameState.ltv}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">季收入:</span>
                <span class="metric-value">${calculateToCRevenue()}</span>
            </div>
        `;
    } else if (direction === 'b2c') {
        metricsHTML = `
            <div class="metric-item">
                <span class="metric-label">GMV(亿):</span>
                <span class="metric-value">${gameState.gmv}</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">抽成率:</span>
                <span class="metric-value">${gameState.commissionRate}%</span>
            </div>
            <div class="metric-item">
                <span class="metric-label">纠纷率:</span>
                <span class="metric-value ${gameState.disputeRate > 30 ? 'warning' : ''}">${gameState.disputeRate}%</span>
            </div>
        `;
    }
    
    metricsDiv.innerHTML = metricsHTML;
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
    if (!container) return;
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
    
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    if (!progressFill || !progressText) return;
    
    progressFill.style.width = `${progress}%`;
    
    const phase = getDirectionPhaseByProgress(progress);
    const weightsPhase = getCurrentPhase();
    
    const phaseElement = document.createElement('span');
    phaseElement.className = 'phase-link';
    phaseElement.textContent = `${phase.name}·${phase.code}`;
    phaseElement.onclick = () => showPhaseRant(weightsPhase);
    
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
    
    if (!fill || !text) return;

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
    
    const titleEl = document.getElementById('report-title');
    const summaryEl = document.getElementById('report-summary');
    const completedEl = document.getElementById('report-completed');
    const nextEl = document.getElementById('report-next');
    const riskEl = document.getElementById('report-risk');
    const funEl = document.getElementById('report-fun');
    
    if (titleEl) titleEl.textContent = report.title;
    if (summaryEl) summaryEl.textContent = report.summary;
    if (completedEl) completedEl.textContent = report.completed;
    if (nextEl) nextEl.textContent = report.next_plan;
    if (riskEl) riskEl.textContent = report.risk;
    if (funEl) funEl.textContent = report.fun_comment;
}

function renderEvent() {
    if (gameState.gameOver) return;

    const events = data.events.events;
    if (events.length === 0) return;

    const direction = gameState.direction;
    
    const availableEvents = events.filter(event => {
        if (!event.direction) return true;
        return event.direction === direction;
    });
    
    if (availableEvents.length === 0) {
        console.warn('No events available for current direction:', direction);
        return;
    }

    const eventIndex = gameState.currentEventIndex % availableEvents.length;
    const event = availableEvents[eventIndex];
    gameState.currentEvent = event;

    const eventTitle = document.getElementById('event-title');
    const eventDescription = document.getElementById('event-description');
    const optionsContainer = document.getElementById('event-options');
    
    if (eventTitle) eventTitle.textContent = event.title;
    if (eventDescription) eventDescription.textContent = event.description;
    
    if (!optionsContainer) return;
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
    if (effects.budget) {
        gameState.budget += effects.budget;
    }
    if (effects.dau) {
        gameState.dau = Math.max(0, gameState.dau + effects.dau);
    }
    if (effects.gmv) {
        gameState.gmv = Math.max(0, gameState.gmv + effects.gmv);
    }
    if (effects.disputeRate) {
        gameState.disputeRate = Math.max(0, Math.min(100, gameState.disputeRate + effects.disputeRate));
    }
    if (effects.benchmarkClients) {
        gameState.benchmarkClients += effects.benchmarkClients;
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

    checkWinConditions();
    checkLoseConditions();
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
    updateBusinessKPI();

    gameState.totalAssets = gameState.budget - gameState.debt;

    checkWinConditions();
    checkLoseConditions();

    if (checkQuarterEnd()) {
        calculateQuarterlyRevenue();
        checkFinancingEvent();
        showReportModal();
    }
}

function updateBusinessKPI() {
    const direction = gameState.direction;
    const okrBonus = gameState.okrBonus || 0;
    
    if (direction === 'toc') {
        gameState.dau = Math.max(0, Math.round(
            gameState.dau + 
            (gameState.progress * 0.1) + 
            (gameState.satisfaction * 0.5) + 
            okrBonus * 2 -
            Math.random() * 5
        ));
        gameState.ltv = Math.max(1, Math.round(
            2 + (gameState.satisfaction * 0.05)
        ));
    } else if (direction === 'b2c') {
        gameState.gmv = Math.max(0, Math.round(
            gameState.gmv + 
            (gameState.progress * 0.05) + 
            (gameState.satisfaction * 0.1) + 
            okrBonus * 0.5
        ));
        gameState.disputeRate = Math.max(0, Math.min(100, Math.round(
            5 - (gameState.satisfaction * 0.05) + 
            Math.random() * 2
        )));
    } else if (direction === 'tob') {
        if (gameState.progress >= 100) {
            gameState.toBPhase = (gameState.toBPhase + 1) % 3;
            gameState.progress = 0;
            gameState.benchmarkClients++;
        }
        gameState.renewalRate = Math.round(
            70 + (gameState.satisfaction * 0.2) - 
            (gameState.consecutiveLowSatisfactionWeeks * 5)
        );
    }
}

function calculateQuarterlyRevenue() {
    const direction = gameState.direction;
    let revenue = 0;
    
    if (direction === 'tob') {
        const phases = [30, 40, 30];
        const phaseRevenue = phases[gameState.toBPhase] * 10;
        const satisfactionMultiplier = 0.5 + (gameState.satisfaction / 100);
        revenue = Math.round(phaseRevenue * satisfactionMultiplier);
    } else if (direction === 'toc') {
        const quarterDays = 90;
        revenue = Math.round(gameState.dau * 10000 * gameState.ltv * (quarterDays / 365));
    } else if (direction === 'b2c') {
        revenue = Math.round(gameState.gmv * 100000000 * (gameState.commissionRate / 100));
    }
    
    if (revenue > 0) {
        gameState.budget += revenue;
        if (revenue > 0) {
            gameState.consecutiveProfitableQuarters++;
        } else {
            gameState.consecutiveProfitableQuarters = 0;
        }
        showToast(`💰 季度收入 +${revenue}`);
    }
}

function calculateToCRevenue() {
    const quarterDays = 90;
    return Math.round(gameState.dau * 10000 * gameState.ltv * (quarterDays / 365));
}

function checkFinancingEvent() {
    const rounds = data.financing.rounds || [];
    if (rounds.length === 0) return;
    
    const availableRounds = rounds.filter(r => 
        r.minQuarter <= getCurrentQuarter() && 
        r.maxQuarter >= getCurrentQuarter() &&
        gameState.financingRound < r.round
    );
    
    if (availableRounds.length > 0 && Math.random() < 0.3) {
        const round = availableRounds[Math.floor(Math.random() * availableRounds.length)];
        showFinancingEvent(round);
    }
}

function showFinancingEvent(round) {
    const modal = document.getElementById('financing-modal');
    if (!modal) return;
    
    document.getElementById('financing-title').textContent = round.title;
    document.getElementById('financing-description').textContent = round.description;
    document.getElementById('financing-amount').textContent = round.amount;
    document.getElementById('financing-fame').textContent = round.fameBonus;
    
    if (round.hasCovenant) {
        document.getElementById('financing-covenant').textContent = round.covenantText;
        document.getElementById('financing-covenant-row').style.display = 'block';
    } else {
        document.getElementById('financing-covenant-row').style.display = 'none';
    }
    
    const acceptBtn = document.getElementById('financing-accept');
    const rejectBtn = document.getElementById('financing-reject');
    
    acceptBtn.onclick = () => acceptFinancing(round);
    rejectBtn.onclick = () => closeFinancingModal();
    
    modal.style.display = 'flex';
}

function acceptFinancing(round) {
    gameState.budget += round.amount;
    addFame(round.fameBonus);
    gameState.financingRound = round.round;
    
    if (round.hasCovenant) {
        gameState.activeCovenant = {
            round: round.round,
            type: round.covenantType,
            target: round.covenantTarget,
            quarter: getCurrentQuarter()
        };
    }
    
    showToast(`🎉 获得${round.title}融资！资金 +${round.amount}，名声 +${round.fameBonus}`);
    closeFinancingModal();
    saveGame();
    updateUI();
}

function closeFinancingModal() {
    const modal = document.getElementById('financing-modal');
    if (modal) {
        modal.style.display = 'none';
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
    
    const okrBonus = gameState.okrBonus || 0;
    baseProgress += okrBonus * 0.5;
    
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
    if (!container) return;
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
    if (!reportSection) return;
    
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

function checkWinConditions() {
    if (gameState.gameOver) return;

    const totalAssets = gameState.budget - gameState.debt;
    
    let marketPositionMet = false;
    let targetDesc = '';
    
    if (gameState.direction === 'tob') {
        marketPositionMet = gameState.benchmarkClients >= 5;
        targetDesc = '5个标杆客户';
    } else if (gameState.direction === 'toc') {
        marketPositionMet = gameState.dau > 500;
        targetDesc = 'DAU > 500万';
    } else if (gameState.direction === 'b2c') {
        marketPositionMet = gameState.gmv > 10;
        targetDesc = 'GMV > 10亿';
    }

    if (totalAssets >= 2000 && marketPositionMet) {
        showIPOOption();
        return;
    }

    if (totalAssets >= 1000 && gameState.consecutiveProfitableQuarters >= 8 && !gameState.declinedIPO) {
        showIPOOption();
        return;
    }

    if (totalAssets >= 500 && marketPositionMet && Math.random() < 0.1) {
        gameState.triggerAcquisition = true;
        showAcquisitionOption();
    }
}

function checkLoseConditions() {
    if (gameState.gameOver) return;

    if (gameState.budget <= 0 && gameState.debt >= gameState.debtLimit) {
        triggerGameOver('bankruptcy');
        return;
    }

    if (gameState.direction === 'toc' && gameState.dau <= 0) {
        triggerGameOver('dau_zero');
        return;
    }

    if (gameState.direction === 'b2c' && gameState.disputeRate > 30) {
        triggerGameOver('high_dispute');
        return;
    }

    if (gameState.direction === 'tob' && gameState.satisfaction < 25) {
        triggerGameOver('client_rage');
        return;
    }
}

function showIPOOption() {
    const modal = document.getElementById('ipo-modal');
    if (!modal) return;
    
    document.getElementById('ipo-title').textContent = '📈 IPO机会来临！';
    document.getElementById('ipo-description').textContent = `恭喜！您的公司已达到上市标准（资产≥2000万，${getDirectionText('fameName')}达标）。是否申请上市？`;
    
    const acceptBtn = document.getElementById('ipo-accept');
    const rejectBtn = document.getElementById('ipo-reject');
    
    acceptBtn.onclick = () => acceptIPO();
    rejectBtn.onclick = () => rejectIPO();
    
    modal.style.display = 'flex';
}

function acceptIPO() {
    closeIPOModal();
    triggerVictory('ipo');
}

function rejectIPO() {
    gameState.declinedIPO = true;
    closeIPOModal();
    showToast('您选择继续低调经营...');
    saveGame();
}

function closeIPOModal() {
    const modal = document.getElementById('ipo-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showAcquisitionOption() {
    const modal = document.getElementById('acquisition-modal');
    if (!modal) return;
    
    document.getElementById('acquisition-title').textContent = '💰 收购邀请';
    document.getElementById('acquisition-description').textContent = '有大厂向您抛出橄榄枝！是否接受收购？';
    
    const acceptBtn = document.getElementById('acquisition-accept');
    const rejectBtn = document.getElementById('acquisition-reject');
    
    acceptBtn.onclick = () => acceptAcquisition();
    rejectBtn.onclick = () => rejectAcquisition();
    
    modal.style.display = 'flex';
}

function acceptAcquisition() {
    closeAcquisitionModal();
    triggerVictory('acquisition');
}

function rejectAcquisition() {
    gameState.triggerAcquisition = false;
    closeAcquisitionModal();
    showToast('您拒绝了收购邀请，继续独立发展...');
    saveGame();
}

function closeAcquisitionModal() {
    const modal = document.getElementById('acquisition-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showEndingModalForVictory(endingType) {
    const modal = document.getElementById('ending-modal');
    const stats = document.getElementById('ending-stats');
    const badge = document.getElementById('ending-badge');
    const endingTitle = document.getElementById('ending-title');
    const endingDesc = document.getElementById('ending-description');
    
    const titles = {
        'ipo': '🏛️ 上市敲钟',
        'acquisition': '💰 被收购',
        'success': '✨ 事业成功',
        'silent': '🤫 闷声发财'
    };
    
    const descriptions = {
        'ipo': '恭喜！您的公司成功上市，敲响了资本市场的钟声。股票开盘即翻倍，您终于实现了财务自由——虽然代码可能还是那个烂代码。',
        'acquisition': '大厂收购了您的公司。您拿着巨额现金离开，留下一群迷茫的员工在会议室里面面相觑。',
        'success': '您成功达成了目标！公司发展蒸蒸日上，未来可期——如果996能少一点的话。',
        'silent': '您选择了闷声发财的道路，连续盈利两年却拒绝上市。股东们很困惑，但您的银行账户很满意。'
    };
    
    endingTitle.textContent = titles[endingType] || titles['success'];
    endingDesc.textContent = descriptions[endingType] || descriptions['success'];
    
    badge.textContent = '🎉 胜利!';
    badge.classList.add('ending-new');
    
    const avgFavor = Math.round((gameState.favors.aisaike + gameState.favors.moganna + gameState.favors.xiaokui) / 3);

    stats.innerHTML = `
        <div class="ending-stat-row">
            <span class="ending-stat-label">最终周数:</span>
            <span class="ending-stat-value">第 ${gameState.week} 周</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">总资产:</span>
            <span class="ending-stat-value">${gameState.budget - gameState.debt}</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">${getDirectionText('satisfactionName')}:</span>
            <span class="ending-stat-value">${gameState.satisfaction}%</span>
        </div>
        <div class="ending-stat-row">
            <span class="ending-stat-label">团队好感度:</span>
            <span class="ending-stat-value">${avgFavor}%</span>
        </div>
    `;

    modal.classList.add('active');
    
    unlockEnding(`ending_${endingType}`);
    addPrestige(5);
}

function showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const stats = document.getElementById('game-over-stats');
    const message = document.getElementById('game-over-message');

    const reasons = {
        'bankruptcy': '💀 资金链断裂，公司破产清算',
        'dau_zero': '📉 用户流失殆尽，产品凉了',
        'high_dispute': '🔥 纠纷率过高，平台崩盘',
        'client_rage': '🤬 甲方震怒，合同终止',
        'default': getDirectionText('failureEnding')
    };
    
    message.textContent = reasons[gameState.failureReason] || reasons['default'];

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
            <span class="game-over-stat-label">${getProgressConfig().progressName}:</span>
            <span class="game-over-stat-value">${Math.min(gameState.progress, 100)}%</span>
        </div>
        <div class="game-over-stat">
            <span class="game-over-stat-label">${getDirectionText('satisfactionName')}:</span>
            <span class="game-over-stat-value">${gameState.satisfaction}%</span>
        </div>
    `;

    modal.classList.add('active');
}

function unlockEnding(endingId) {
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');

    if (!unlockedEndings.includes(endingId)) {
        unlockedEndings.push(endingId);
        localStorage.setItem(ENDINGS_KEY, JSON.stringify(unlockedEndings));
    }
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