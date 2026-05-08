const STORAGE_KEY = "fair_office_game_state";
const ENDINGS_KEY = "fair_office_unlocked_endings";
const PRESTIGE_KEY = "fair_office_prestige";
const RANK_KEY = "fair_office_current_rank";
const TOOLCHAIN_KEY = "fair_office_toolchain";
const UNLOCKED_TOOLS_KEY = "fair_office_unlocked_tools";

let prestige = 0;
let currentRank = "p5";
let ranks = [];
let toolsData = { categories: [] };
let selectedTools = {};
let unlockedTools = [];

let data = {
    ranks: { ranks: [] },
    endings: { endings: [] },
    tools: { categories: [] }
};

async function loadAllData() {
    try {
        const [ranksData, endings, tools] = await Promise.all([
            fetch('data/ranks.json').then(r => r.json()),
            fetch('data/endings.json').then(r => r.json()),
            fetch('data/tools.json').then(r => r.json())
        ]);
        
        data.ranks = ranksData;
        data.endings = endings;
        data.tools = tools;
        toolsData = tools;
        
        ranks = ranksData.ranks || [];
        
        loadPrestigeAndRank();
        loadUnlockedTools();
        loadSelectedTools();
        initDefaultTools();
        updateRankDisplay();
        checkForSave();
    } catch (error) {
        console.error('Failed to load data:', error);
    }
}

function loadPrestigeAndRank() {
    prestige = parseInt(localStorage.getItem(PRESTIGE_KEY) || '0');
    currentRank = localStorage.getItem(RANK_KEY) || 'p5';
}

function loadSelectedTools() {
    const saved = localStorage.getItem(TOOLCHAIN_KEY);
    if (saved) {
        try {
            const savedTools = JSON.parse(saved);
            Object.keys(savedTools).forEach(key => {
                selectedTools[key] = savedTools[key];
            });
        } catch (e) {
            console.error('Failed to load selected tools:', e);
        }
    }
}

function savePrestigeAndRank() {
    localStorage.setItem(PRESTIGE_KEY, prestige.toString());
    localStorage.setItem(RANK_KEY, currentRank);
}

function loadUnlockedTools() {
    const saved = localStorage.getItem(UNLOCKED_TOOLS_KEY);
    if (saved) {
        unlockedTools = JSON.parse(saved);
    }
}

function initDefaultTools() {
    if (Object.keys(selectedTools).length === 0) {
        toolsData.categories.forEach(category => {
            const defaultTool = category.tools.find(t => t.cost === 0);
            if (defaultTool) {
                selectedTools[category.id] = defaultTool.id;
            }
        });
    }
}

function initRanks() {
    ranks = [
        {"id": "p5", "name": "P5", "tian": "P5", "jue": "2-1", "di": "1-1", "cost": 0, "budget": 80, "unlock": "基础开局"},
        {"id": "p6", "name": "P6", "tian": "P6", "jue": "2-2", "di": "1-2", "cost": 2, "budget": 100, "unlock": "「前大厂实习生」背景"},
        {"id": "p7", "name": "P7", "tian": "P7", "jue": "3-1", "di": "2-1", "cost": 5, "budget": 120, "unlock": "「前天堂RD」背景"},
        {"id": "p8", "name": "P8", "tian": "P8", "jue": "3-2", "di": "2-2", "cost": 9, "budget": 150, "unlock": "「免死金牌」"},
        {"id": "p9", "name": "P9", "tian": "P9", "jue": "4-1", "di": "3-1", "cost": 14, "budget": 180, "unlock": "「前G端审计员」"},
        {"id": "p10", "name": "P10", "tian": "P10", "jue": "4-2", "di": "3-2", "cost": 20, "budget": 220, "unlock": "「黑化线」"}
    ];
    data.ranks = { ranks: ranks };
}

function updateRankDisplay() {
    const rank = ranks.find(r => r.id === currentRank) || ranks[0] || { name: 'P5', tian: 'P5', jue: '2-1', di: '1-1', cost: 0 };
    const nextRank = ranks.find(r => r.cost > prestige);
    
    const rankValue = document.querySelector('.rank-value');
    const tianSpan = document.querySelector('.rank-comparison .tian');
    const jueSpan = document.querySelector('.rank-comparison .jue');
    const diSpan = document.querySelector('.rank-comparison .di');
    const prestigeValue = document.querySelector('.prestige-value');
    const nextPrestige = document.querySelector('.next-prestige');
    const prestigeRemaining = document.querySelector('.prestige-remaining');
    
    if (rankValue) rankValue.textContent = rank.name;
    if (tianSpan) tianSpan.textContent = `天堂 ${rank.tian}`;
    if (jueSpan) jueSpan.textContent = `裁决 ${rank.jue}`;
    if (diSpan) diSpan.textContent = `地狱 ${rank.di}`;
    if (prestigeValue) prestigeValue.textContent = prestige;
    
    if (nextRank) {
        if (nextPrestige) nextPrestige.textContent = nextRank.cost;
        const remaining = nextRank.cost - prestige;
        if (prestigeRemaining) prestigeRemaining.textContent = `（下一级 ${nextRank.name} 还需 ${remaining}）`;
    } else {
        if (nextPrestige) nextPrestige.textContent = '-';
        if (prestigeRemaining) prestigeRemaining.textContent = '（已达到最高职级）';
    }
}

function checkForSave() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const btnContinue = document.getElementById('btn-continue');
    if (btnContinue) {
        btnContinue.style.display = saved ? 'inline-block' : 'none';
    }
}

function startNewGame() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        showConfirm('将删除未通关的档案，是否继续？', () => {
            localStorage.removeItem(STORAGE_KEY);
            doStartNewGame();
        }, () => {});
        return;
    }
    doStartNewGame();
}

function doStartNewGame() {
    const rank = ranks.find(r => r.id === currentRank) || ranks[0] || { budget: 100 };
    
    let toolchainCost = 0;
    toolsData.categories.forEach(category => {
        const selectedToolId = selectedTools[category.id];
        if (selectedToolId) {
            const tool = category.tools.find(t => t.id === selectedToolId);
            if (tool) {
                toolchainCost += tool.cost;
            }
        }
    });
    
    const gameState = {
        week: 1,
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
        toolchain: { ...selectedTools }
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    window.location.href = 'game.html';
}

function continueGame() {
    window.location.href = 'game.html';
}

function showLevelupModal() {
    const list = document.getElementById('levelup-list');
    if (!list) return;
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
    
    const modal = document.getElementById('levelup-modal');
    if (modal) modal.style.display = 'flex';
}

function closeLevelupModal() {
    const modal = document.getElementById('levelup-modal');
    if (modal) modal.style.display = 'none';
}

function promoteToRank(rankId) {
    const rank = ranks.find(r => r.id === rankId);
    if (!rank || rank.cost > prestige) return;
    
    currentRank = rankId;
    savePrestigeAndRank();
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
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');
    
    if (data.endings && data.endings.endings) {
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
    }
    
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.style.display = 'flex';
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) modal.style.display = 'none';
}

function isToolUnlocked(tool) {
    const rankOrder = ['p5', 'p6', 'p7', 'p8', 'p9', 'p10'];
    const currentRankIndex = rankOrder.indexOf(currentRank);
    const requiredRankIndex = rankOrder.indexOf(tool.unlock_rank);
    
    if (currentRankIndex >= requiredRankIndex) {
        return true;
    }
    
    return unlockedTools.includes(tool.id);
}

function showToolchainModal() {
    if (!toolsData.categories || toolsData.categories.length === 0) {
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
    
    toolsData.categories.forEach((category, index) => {
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
    const isSelected = selectedTools[categoryId] === tool.id;
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
    selectedTools[categoryId] = tool.id;
    
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
        if (tab.textContent.includes(toolsData.categories.find(c => c.id === categoryId)?.name)) {
            tab.classList.add('active');
        }
    });
    
    const categoryDiv = document.getElementById(`category-${categoryId}`);
    if (categoryDiv) categoryDiv.classList.add('active');
}

function updateToolchainSummary() {
    const rank = ranks.find(r => r.id === currentRank) || ranks[0] || { budget: 100 };
    let baseBudget = rank.budget;
    let totalCost = 0;
    let effectsList = [];
    let toolNames = [];
    
    toolsData.categories.forEach(category => {
        const selectedToolId = selectedTools[category.id];
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
    if (currentToolsDisplayEl) currentToolsDisplayEl.style.display = Object.keys(selectedTools).length > 0 ? 'block' : 'none';
}

function confirmToolchain() {
    localStorage.setItem(TOOLCHAIN_KEY, JSON.stringify(selectedTools));
    closeToolchainModal();
    
    const display = document.getElementById('current-tools-display');
    if (display) display.style.display = 'block';
    
    updateToolchainSummary();
}

function bindButtonEvents() {
    const btnLevelup = document.getElementById('btn-levelup');
    const btnGallery = document.getElementById('btn-gallery');
    const btnContinue = document.getElementById('btn-continue');
    const btnStart = document.getElementById('btn-start');
    const btnToolchain = document.getElementById('btn-toolchain');
    const confirmBtn = document.getElementById('toolchain-confirm');
    
    if (btnLevelup) btnLevelup.onclick = showLevelupModal;
    if (btnGallery) btnGallery.onclick = showGallery;
    if (btnContinue) btnContinue.onclick = continueGame;
    if (btnStart) btnStart.onclick = startNewGame;
    if (btnToolchain) btnToolchain.onclick = showToolchainModal;
    if (confirmBtn) confirmBtn.onclick = confirmToolchain;
}

document.addEventListener('DOMContentLoaded', () => {
    initRanks();
    loadAllData();
    bindButtonEvents();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLevelupModal();
        closeGalleryModal();
        closeToolchainModal();
    }
});
