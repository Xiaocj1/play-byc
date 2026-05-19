// 检查是否已声明，避免重复声明
if (typeof window.STORAGE_KEY === 'undefined') {
    window.STORAGE_KEY = "fair_office_game_state";
}
if (typeof window.PROJECT_EXPERIENCE_KEY === 'undefined') {
    window.PROJECT_EXPERIENCE_KEY = "fair_office_project_experience";
}
if (typeof window.RANK_KEY === 'undefined') {
    window.RANK_KEY = "fair_office_current_rank";
}
if (typeof window.TOOLCHAIN_KEY === 'undefined') {
    window.TOOLCHAIN_KEY = "fair_office_toolchain";
}
if (typeof window.UNLOCKED_TOOLS_KEY === 'undefined') {
    window.UNLOCKED_TOOLS_KEY = "fair_office_unlocked_tools";
}
if (typeof window.ENDINGS_KEY === 'undefined') {
    window.ENDINGS_KEY = "fair_office_unlocked_endings";
}

if (typeof window.projectExperience === 'undefined') {
    window.projectExperience = 0;
}
if (typeof window.currentRank === 'undefined') {
    window.currentRank = "p5";
}
if (typeof window.ranks === 'undefined') {
    window.ranks = [];
}
if (typeof window.toolsData === 'undefined') {
    window.toolsData = { categories: [] };
}
if (typeof window.selectedTools === 'undefined') {
    window.selectedTools = {};
}
if (typeof window.unlockedTools === 'undefined') {
    window.unlockedTools = [];
}

// 检查是否已声明，避免重复声明
if (typeof window.data === 'undefined') {
    window.data = {
        ranks: { ranks: [] },
        endings: { endings: [] },
        tools: { categories: [] }
    };
}

// 为了向后兼容，让代码可以继续使用 data 而不是 window.data
let data = window.data;

async function loadAllData() {
    try {
        const [ranksData, endings, tools] = await Promise.all([
            fetch('data/ranks.json').then(r => r.json()),
            fetch('data/endings.json').then(r => r.json()),
            fetch('data/tools.json').then(r => r.json())
        ]);
        
        window.data.ranks = ranksData;
        window.data.endings = endings;
        window.data.tools = tools;
        window.toolsData = tools;
        
        window.ranks = ranksData.ranks || [];
        
        loadProjectExperienceAndRank();
        loadUnlockedTools();
        loadSelectedTools();
        initDefaultTools();
        updateRankDisplay();
        checkForSave();
        
        // 处理上一次游戏结果，更新项目经历
        processLastGameResult();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

// 处理上一次游戏结果，更新项目经历
function processLastGameResult() {
    const lastGameResult = localStorage.getItem('fair_office_last_game_result');
    if (!lastGameResult) return;
    
    // 清除标记，避免重复处理
    localStorage.removeItem('fair_office_last_game_result');
    
    if (lastGameResult === 'victory') {
        // 胜利获得2个项目经历
        window.projectExperience += 2;
        showToast('🎉 项目胜利！获得2个项目经历');
    } else if (lastGameResult === 'failure') {
        // 失败获得0.5个项目经历
        window.projectExperience += 0.5;
        showToast('😢 项目失败...获得0.5个项目经历');
    }
    
    saveProjectExperienceAndRank();
    updateRankDisplay();
}

function loadProjectExperienceAndRank() {
    window.projectExperience = parseFloat(localStorage.getItem(window.PROJECT_EXPERIENCE_KEY) || '0');
    window.currentRank = localStorage.getItem(window.RANK_KEY) || 'p5';
}

function loadSelectedTools() {
    const saved = localStorage.getItem(window.TOOLCHAIN_KEY);
    if (saved) {
        try {
            const savedTools = JSON.parse(saved);
            Object.keys(savedTools).forEach(key => {
                window.selectedTools[key] = savedTools[key];
            });
        } catch (e) {
            console.error('Failed to load selected tools:', e);
        }
    }
}

function saveProjectExperienceAndRank() {
    localStorage.setItem(window.PROJECT_EXPERIENCE_KEY, window.projectExperience.toString());
    localStorage.setItem(window.RANK_KEY, window.currentRank);
}

function loadUnlockedTools() {
    const saved = localStorage.getItem(window.UNLOCKED_TOOLS_KEY);
    if (saved) {
        window.unlockedTools = JSON.parse(saved);
    }
}

function initDefaultTools() {
    if (Object.keys(window.selectedTools).length === 0) {
        window.toolsData.categories.forEach(category => {
            const defaultTool = category.tools.find(t => t.cost === 0);
            if (defaultTool) {
                window.selectedTools[category.id] = defaultTool.id;
            }
        });
    }
}

function initRanks() {
    // 直接从 JSON 文件加载，这里留空，由 loadAllData 中的 fetch 加载
    // 如果加载失败，使用默认数据
    if (!window.ranks || window.ranks.length === 0) {
        window.ranks = [
            {"id": "p5", "name": "初级PM", "network": "1-1", "tech": "1-1", "resource": "1-1", "cost": 0, "budget": 80, "unlock": "基础开局"},
            {"id": "p6", "name": "中级PM", "network": "2-1", "tech": "1-2", "resource": "1-2", "cost": 2, "budget": 100, "unlock": "「大厂实习经历」"},
            {"id": "p7", "name": "高级PM", "network": "2-2", "tech": "2-1", "resource": "2-1", "cost": 5, "budget": 120, "unlock": "「技术背景加成」"},
            {"id": "p8", "name": "资深PM", "network": "3-1", "tech": "2-2", "resource": "2-2", "cost": 9, "budget": 150, "unlock": "「项目救星」"},
            {"id": "p9", "name": "专家PM", "network": "3-2", "tech": "3-1", "resource": "3-1", "cost": 14, "budget": 180, "unlock": "「行业认证专家」"},
            {"id": "p10", "name": "架构师", "network": "4-1", "tech": "3-2", "resource": "3-2", "cost": 20, "budget": 220, "unlock": "「技术决策者」"}
        ];
        window.data.ranks = { ranks: window.ranks };
    }
}

function updateRankDisplay() {
    const rank = window.ranks.find(r => r.id === window.currentRank) || window.ranks[0] || { name: '初级PM', network: '1-1', tech: '1-1', resource: '1-1', cost: 0 };
    const nextRank = window.ranks.find(r => r.cost > window.projectExperience);
    
    const rankValue = document.querySelector('.rank-value');
    const rankBars = document.querySelectorAll('.rank-bar');
    const prestigeValue = document.querySelector('.prestige-value');
    const prestigeNext = document.querySelector('.prestige-next');
    const prestigeHint = document.querySelector('.prestige-hint');
    
    if (rankValue) rankValue.textContent = rank.name;
    
    if (rankBars.length >= 3) {
        rankBars[0].querySelector('.bar-value').textContent = rank.network;
        rankBars[1].querySelector('.bar-value').textContent = rank.tech;
        rankBars[2].querySelector('.bar-value').textContent = rank.resource;
    }
    
    if (prestigeValue) prestigeValue.textContent = window.projectExperience.toFixed(1);
    
    if (nextRank) {
        if (prestigeNext) prestigeNext.textContent = nextRank.cost;
        const remaining = (nextRank.cost - window.projectExperience).toFixed(1);
        if (prestigeHint) prestigeHint.textContent = `（${nextRank.name}还需 ${remaining}）`;
    } else {
        if (prestigeNext) prestigeNext.textContent = '-';
        if (prestigeHint) prestigeHint.textContent = '（已达到最高职级）';
    }
}

function checkForSave() {
    const saved = localStorage.getItem(window.STORAGE_KEY);
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) {
        btnContinue.style.display = saved ? 'inline-block' : 'none';
    }
}

function startNewGame() {
    const saved = localStorage.getItem(window.STORAGE_KEY);
    if (saved) {
        showConfirm('将删除未通关的档案，是否继续？', () => {
            localStorage.removeItem(window.STORAGE_KEY);
            window.location.href = 'select.html';
        }, () => {});
        return;
    }
    window.location.href = 'select.html';
}

function doStartNewGame() {
    const rank = window.ranks.find(r => r.id === window.currentRank) || window.ranks[0] || { budget: 100 };
    
    let toolchainCost = 0;
    window.toolsData.categories.forEach(category => {
        const selectedToolId = window.selectedTools[category.id];
        if (selectedToolId) {
            const tool = category.tools.find(t => t.id === selectedToolId);
            if (tool) {
                toolchainCost += tool.cost;
            }
        }
    });
    
    const gameState = {
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
        budget: rank.budget + toolchainCost,
        toolchain: { ...selectedTools },
        fame: 50,
        debt: 0,
        debtLimit: 100
    };
    
    localStorage.setItem(window.STORAGE_KEY, JSON.stringify(gameState));
    window.location.href = 'game.html';
}

function continueGame() {
    window.location.href = 'game.html';
}

function showLevelupModal() {
    // 更新当前项目经历显示
    const expValue = document.getElementById('levelup-exp-value');
    if (expValue) {
        expValue.textContent = window.projectExperience.toFixed(1);
    }
    
    const list = document.getElementById('levelup-list');
    if (!list) return;
    list.innerHTML = '';
    
    window.ranks.forEach(rank => {
        const isCurrent = rank.id === window.currentRank;
        const isUnlocked = rank.cost <= window.projectExperience;
        
        const item = document.createElement('div');
        item.className = `levelup-item ${isCurrent ? 'current' : ''} ${!isUnlocked && !isCurrent ? 'locked' : ''}`;
        
        const info = document.createElement('div');
        info.className = 'levelup-info';
        
        const name = document.createElement('div');
        name.className = 'levelup-name';
        name.textContent = rank.name;
        
        const compare = document.createElement('div');
        compare.className = 'levelup-compare';
        compare.innerHTML = `<span style="color: #ff9500">人脉 ${rank.network}</span> / <span style="color: #00ff41">技术 ${rank.tech}</span> / <span style="color: #ff4444">资源 ${rank.resource}</span>`;
        
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
        button.textContent = isCurrent ? '当前职级' : (isUnlocked ? '🔥 晋升' : `需要 ${rank.cost} 项目经历`);
        button.disabled = !isUnlocked || isCurrent;
        
        if (isUnlocked && !isCurrent) {
            button.onclick = () => promoteToRank(rank.id);
        }
        
        item.appendChild(info);
        item.appendChild(button);
        list.appendChild(item);
    });
    
    const modal = document.getElementById('levelup-modal');
    if (modal) modal.style.display = 'flex';
}

function closeLevelupModal() {
    const modal = document.getElementById('levelup-modal');
    if (modal) modal.style.display = 'none';
}

function promoteToRank(rankId) {
    const rank = window.ranks.find(r => r.id === rankId);
    if (!rank || rank.cost > window.projectExperience) return;
    
    // 扣除项目经历
    window.projectExperience -= rank.cost;
    
    window.currentRank = rankId;
    saveProjectExperienceAndRank();
    updateRankDisplay();
    closeLevelupModal();
    
    showToast(`恭喜晋升到 ${rank.name}！初始预算变为 ${rank.budget}`);
}

function showConfirm(message, onOk, onCancel) {
    const modal = document.getElementById('confirm-modal');
    const msgEl = document.getElementById('confirm-message');
    const okBtn = document.getElementById('confirm-ok');
    const cancelBtn = document.getElementById('confirm-cancel');
    
    if (!modal || !msgEl || !okBtn || !cancelBtn) return;
    
    msgEl.textContent = message;
    modal.style.display = 'flex';
    
    okBtn.onclick = () => {
        modal.style.display = 'none';
        if (onOk) onOk();
    };
    
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
        if (onCancel) onCancel();
    };
}

function showToast(message, duration = 3000) {
    const modal = document.getElementById('toast-modal');
    const msgEl = document.getElementById('toast-message');
    
    if (!modal || !msgEl) return;
    
    msgEl.textContent = message;
    modal.style.display = 'flex';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, duration);
}

function showGallery() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    function renderGallery() {
        if (typeof renderCardsGallery === 'function' && window.galleryCardsData) {
            renderCardsGallery(grid);
        } else {
            grid.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">卡牌数据加载中...</p>';
            setTimeout(renderGallery, 100);
        }
    }
    
    modal.style.display = 'flex';
    renderGallery();
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.style.display = 'none';
}

function isToolUnlocked(tool) {
    const rankOrder = ['p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
    const currentRankIndex = rankOrder.indexOf(window.currentRank);
    const requiredRankIndex = rankOrder.indexOf(tool.unlock_rank);
    
    if (currentRankIndex >= requiredRankIndex) {
        return true;
    }
    
    return window.unlockedTools.includes(tool.id);
}

function showToolchainModal() {
    if (!window.toolsData.categories || window.toolsData.categories.length === 0) {
        loadAllData().then(() => {
            renderToolchainModal();
            const modal = document.getElementById('toolchain-modal');
            if (modal) modal.style.display = 'flex';
        });
    } else {
        renderToolchainModal();
        const modal = document.getElementById('toolchain-modal');
        if (modal) modal.style.display = 'flex';
    }
}

function closeToolchainModal() {
    const modal = document.getElementById('toolchain-modal');
    if (modal) modal.style.display = 'none';
}

function renderToolchainModal() {
    const tabsContainer = document.getElementById('toolchain-tabs');
    const categoriesContainer = document.getElementById('toolchain-categories');
    
    tabsContainer.innerHTML = '';
    categoriesContainer.innerHTML = '';
    
    window.toolsData.categories.forEach((category, index) => {
        const tab = document.createElement('button');
        tab.className = `toolchain-tab ${index === 0 ? 'active' : ''}`;
        tab.textContent = `${category.icon} ${category.name}`;
        tab.onclick = () => switchToolchainTab(category.id);
        tabsContainer.appendChild(tab);
        
        const categoryDiv = document.createElement('div');
        categoryDiv.className = `toolchain-category ${index === 0 ? 'active' : ''}`;
        categoryDiv.id = `category-${category.id}`;
        
        const grid = document.createElement('div');
        grid.className = 'toolchain-grid';
        
        category.tools.forEach(tool => {
            const toolItem = createToolItem(tool, category.id);
            grid.appendChild(toolItem);
        });
        
        categoryDiv.appendChild(grid);
        categoriesContainer.appendChild(categoryDiv);
    });
    
    updateToolchainSummary();
}

function createToolItem(tool, categoryId) {
    const item = document.createElement('div');
    const isSelected = window.selectedTools[categoryId] === tool.id;
    const isUnlocked = isToolUnlocked(tool);
    
    item.className = `tool-item ${isSelected ? 'selected' : ''} ${!isUnlocked ? 'locked' : ''}`;
    item.dataset.toolId = tool.id;
    item.dataset.categoryId = categoryId;
    
    let effectsHtml = '';
    tool.effects.forEach(effect => {
        const color = effect.value >= 0 ? '#00ff41' : '#ff4444';
        effectsHtml += `<div style="color: ${color}">${effect.desc}</div>`;
    });
    
    if (tool.effects.length === 0) {
        effectsHtml = '<div style="color: #888">无效果</div>';
    }
    
    const costDisplay = tool.cost === 0 ? '免费' : `${tool.cost} 💰`;
    const rankNames = { p5: 'P5', p6: 'P6', p7: 'P7', p8: 'P8', p9: 'P9', p10: 'P10' };
    const unlockText = tool.unlock_rank === 'p5' ? '默认解锁' : `需要职级 ${rankNames[tool.unlock_rank]}`;
    
    item.innerHTML = `
        ${isSelected ? '<div class="tool-selected-badge">已选</div>' : ''}
        <div class="tool-name">${tool.name}</div>
        <div class="tool-effects">${effectsHtml}</div>
        <div class="tool-cost">${costDisplay}</div>
        <div class="tool-unlock">${unlockText}</div>
        <div class="tool-meme">"${tool.meme}"</div>
    `;
    
    if (isUnlocked) {
        item.onclick = () => selectTool(tool, categoryId);
    }
    
    return item;
}

function selectTool(tool, categoryId) {
    window.selectedTools[categoryId] = tool.id;
    
    document.querySelectorAll(`.tool-item[data-category-id="${categoryId}"]`).forEach(item => {
        item.classList.remove('selected');
        const badge = item.querySelector('.tool-selected-badge');
        if (badge) badge.remove();
    });
    
    const selectedItem = document.querySelector(`.tool-item[data-tool-id="${tool.id}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
        const badge = document.createElement('div');
        badge.className = 'tool-selected-badge';
        badge.textContent = '已选';
        selectedItem.insertBefore(badge, selectedItem.firstChild);
    }
    
    updateToolchainSummary();
}

function switchToolchainTab(categoryId) {
    document.querySelectorAll('.toolchain-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.toolchain-category').forEach(cat => cat.classList.remove('active'));
    
    document.querySelectorAll('.toolchain-tab').forEach(tab => {
        if (tab.textContent.includes(window.toolsData.categories.find(c => c.id === categoryId)?.name)) {
            tab.classList.add('active');
        }
    });
    
    const categoryDiv = document.getElementById(`category-${categoryId}`);
    if (categoryDiv) categoryDiv.classList.add('active');
}

function updateToolchainSummary() {
    const rank = window.ranks.find(r => r.id === window.currentRank) || window.ranks[0] || { budget: 100 };
    let baseBudget = rank.budget;
    let totalCost = 0;
    let effectsList = [];
    let toolNames = [];
    
    window.toolsData.categories.forEach(category => {
        const selectedToolId = window.selectedTools[category.id];
        if (selectedToolId) {
            const tool = category.tools.find(t => t.id === selectedToolId);
            if (tool) {
                totalCost += tool.cost;
                toolNames.push(tool.name);
                tool.effects.forEach(effect => {
                    effectsList.push(effect.desc);
                });
            }
        }
    });
    
    const adjustedBudget = baseBudget + totalCost;
    
    const baseBudgetEl = document.getElementById('base-budget');
    const adjustedBudgetEl = document.getElementById('adjusted-budget');
    const effectsSummaryEl = document.getElementById('toolchain-effects-summary');
    
    if (baseBudgetEl) baseBudgetEl.textContent = baseBudget;
    if (adjustedBudgetEl) {
        adjustedBudgetEl.textContent = adjustedBudget;
        adjustedBudgetEl.className = `budget-change ${totalCost >= 0 ? 'positive' : 'negative'}`;
    }
    if (effectsSummaryEl) {
        effectsSummaryEl.textContent = effectsList.length > 0 
            ? '效果：' + effectsList.join(' / ') 
            : '选择工具后将显示效果汇总';
    }
    
    const currentToolsNamesEl = document.getElementById('current-tools-names');
    const currentToolsDisplayEl = document.getElementById('current-tools-display');
    if (currentToolsNamesEl) currentToolsNamesEl.textContent = toolNames.join('、') || '未选择';
    if (currentToolsDisplayEl) currentToolsDisplayEl.style.display = Object.keys(window.selectedTools).length > 0 ? 'block' : 'none';
}

function confirmToolchain() {
    localStorage.setItem(window.TOOLCHAIN_KEY, JSON.stringify(window.selectedTools));
    closeToolchainModal();
    
    const display = document.getElementById('current-tools-display');
    if (display) display.style.display = 'block';
    
    updateToolchainSummary();
}

function bindButtonEvents() {
    const btnLevelup = document.getElementById('btn-levelup');
    const btnGallery = document.getElementById('btn-gallery');
    const btnMuseum = document.getElementById('btn-museum');
    const btnContinue = document.getElementById('btn-continue');
    const btnStart = document.getElementById('btn-start');
    const btnToolchain = document.getElementById('btn-toolchain');
    const confirmBtn = document.getElementById('toolchain-confirm');
    
    if (btnLevelup) btnLevelup.onclick = showLevelupModal;
    if (btnGallery) btnGallery.onclick = showGallery;
    if (btnMuseum) btnMuseum.onclick = showMuseumModal;
    if (btnContinue) btnContinue.onclick = continueGame;
    if (btnStart) btnStart.onclick = startNewGame;
    if (btnToolchain) btnToolchain.onclick = showToolchainModal;
    if (confirmBtn) confirmBtn.onclick = confirmToolchain;
}

document.addEventListener('DOMContentLoaded', () => {
    initRanks();
    loadAllData();
    bindButtonEvents();
    loadGalleryCards();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLevelupModal();
        closeGalleryModal();
        closeToolchainModal();
        closeMuseumModal();
        closeMuseumDetailModal();
    }
});
