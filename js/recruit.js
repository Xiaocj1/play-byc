const CARDS_KEY = "fair_office_cards";
const HC_KEY = "fair_office_hc";
const WEEKLY_DRAWS_KEY = "fair_office_weekly_draws";
const UNLOCKED_CARDS_KEY = "fair_office_unlocked_cards";
const FIRST_DRAW_KEY = "fair_office_first_draw";
const DRAW_HISTORY_KEY = "fair_office_draw_history";

let cardsData = null;
let currentPool = null;
let backpack = [];
let hc = 3;
let weeklyDraws = 0;
let unlockedCards = [];
let storiesData = null;
let hasShownFirstDrawStory = false;
let drawHistory = [];

async function loadCardsData() {
    try {
        const [cards, stories] = await Promise.all([
            fetch('data/cards.json').then(r => r.json()),
            fetch('data/stories.json').then(r => r.json())
        ]);
        cardsData = cards;
        storiesData = stories;
        loadBackpack();
        loadHC();
        loadWeeklyDraws();
        loadUnlockedCards();
        checkFirstDraw();
        loadDrawHistory();
    } catch (error) {
        console.error('Failed to load cards data:', error);
    }
}

function checkFirstDraw() {
    const saved = localStorage.getItem(FIRST_DRAW_KEY);
    if (!saved) {
        hasShownFirstDrawStory = false;
    } else {
        hasShownFirstDrawStory = true;
    }
}

function loadBackpack() {
    const saved = localStorage.getItem(CARDS_KEY);
    if (saved) {
        try {
            backpack = JSON.parse(saved);
        } catch (e) {
            backpack = [];
        }
    }
}

function saveBackpack() {
    localStorage.setItem(CARDS_KEY, JSON.stringify(backpack));
}

function clearBackpack() {
    backpack = [];
    saveBackpack();
}

function loadHC() {
    hc = parseInt(localStorage.getItem(HC_KEY) || '3');
}

function saveHC() {
    localStorage.setItem(HC_KEY, hc.toString());
}

function loadWeeklyDraws() {
    const saved = localStorage.getItem(WEEKLY_DRAWS_KEY);
    if (saved) {
        const data = JSON.parse(saved);
        if (data.week === gameState?.week) {
            weeklyDraws = data.count;
        } else {
            weeklyDraws = 0;
        }
    }
}

function saveWeeklyDraws() {
    localStorage.setItem(WEEKLY_DRAWS_KEY, JSON.stringify({
        week: gameState?.week || 1,
        count: weeklyDraws
    }));
}

function loadUnlockedCards() {
    const saved = localStorage.getItem(UNLOCKED_CARDS_KEY);
    if (saved) {
        unlockedCards = JSON.parse(saved);
    }
}

function saveUnlockedCards() {
    localStorage.setItem(UNLOCKED_CARDS_KEY, JSON.stringify(unlockedCards));
}

function loadDrawHistory() {
    const saved = localStorage.getItem(DRAW_HISTORY_KEY);
    if (saved) {
        try {
            drawHistory = JSON.parse(saved);
        } catch (e) {
            drawHistory = [];
        }
    }
}

function saveDrawHistory() {
    localStorage.setItem(DRAW_HISTORY_KEY, JSON.stringify(drawHistory));
}

function addToDrawHistory(card) {
    drawHistory.unshift({
        name: card.name,
        rarity: card.rarity,
        pool: card.poolId,
        timestamp: Date.now()
    });
    if (drawHistory.length > 100) {
        drawHistory = drawHistory.slice(0, 100);
    }
    saveDrawHistory();
}

function getCurrentHCCount() {
    return backpack.filter(c => !c.is_variant).length;
}

function getCurrentDrawCost() {
    if (!cardsData || !cardsData.costs) return 10;
    const baseCost = cardsData.costs.single_draw || 10;
    
    const budget = gameState?.budget || 0;
    const fame = gameState?.fame || 50;
    
    let fameCoefficient = 1.0;
    if (typeof getDrawCostMultiplier === 'function') {
        fameCoefficient = getDrawCostMultiplier();
    } else {
        if (fame >= 80) fameCoefficient = 0.7;
        else if (fame >= 60) fameCoefficient = 0.9;
        else if (fame >= 40) fameCoefficient = 1.0;
        else if (fame >= 20) fameCoefficient = 1.2;
        else fameCoefficient = 1.5;
    }
    
    const quarter = getCurrentQuarter ? getCurrentQuarter() : 1;
    let capitalThreshold;
    if (quarter <= 4) {
        capitalThreshold = 5;
    } else if (quarter <= 8) {
        capitalThreshold = 20;
    } else {
        capitalThreshold = 50;
    }
    
    let capitalCoefficient = 1.0 + (budget / capitalThreshold) * 0.5;
    const cap = cardsData.costs.capital_cap;
    if (cap !== null && cap !== undefined) {
        capitalCoefficient = Math.min(cap, capitalCoefficient);
    }
    
    const multiplier = fameCoefficient * capitalCoefficient;
    
    return Math.round(baseCost * multiplier);
}

function canDraw() {
    if (!gameState) return false;
    if (gameState.budget <= 0) return false;
    if (gameState.budget < getCurrentDrawCost()) return false;
    if (getCurrentHCCount() >= hc) return false;
    return true;
}

function drawCard(poolId) {
    const pool = cardsData.pools.find(p => p.id === poolId);
    if (!pool) return null;
    
    const cards = pool.cards;
    // 提高高级卡爆率：SSR 5%, SR 15%, R 80%
    const weights = cards.map(c => {
        switch(c.rarity) {
            case 'SSR': return 5;
            case 'SR': return 15;
            default: return 80;
        }
    });
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < cards.length; i++) {
        random -= weights[i];
        if (random <= 0) {
            const card = {...cards[i]};
            card.instanceId = Date.now() + Math.random();
            card.poolId = poolId;
            return card;
        }
    }
    
    return {...cards[0]};
}

function handleVariantCard(card, callback) {
    if (!card.is_variant || !card.variant_pool) return card;
    
    const resultId = card.variant_pool[Math.floor(Math.random() * card.variant_pool.length)];
    const result = cardsData.variant_results[resultId];
    
    if (!result) {
        console.error('Variant result not found:', resultId);
        return card;
    }
    
    showVariantResult(card, result);
    
    if (resultId === 'runaway' || resultId === 'exam') {
        if (result.bonus?.type === 'budget' && gameState) {
            gameState.budget += result.bonus.value;
        }
        showToast(`管培生${result.name}！${result.bonus?.type === 'budget' ? `+${result.bonus.value}资金` : ''}`);
        return null;
    }
    
    const drawnQuarter = getCurrentQuarter();
    const drawnAbsoluteWeek = gameState.week;
    const drawnReportCount = gameState.totalReports || 0;
    
    const pendingVariant = {
        ...card,
        variantResultId: resultId,
        variantResult: result,
        drawnQuarter: drawnQuarter,
        drawnAbsoluteWeek: drawnAbsoluteWeek,
        drawnReportCount: drawnReportCount,
        isTraining: true,
        trainingProgress: 0
    };
    
    gameState.pendingVariants = gameState.pendingVariants || [];
    gameState.pendingVariants.push(pendingVariant);
    
    backpack.push(pendingVariant);
    saveBackpack();
    
    // 记录抽卡历史（包括管培生）
    addToDrawHistory(card);
    
    showToast(`管培生已加入培养，需要经历报表考核后才会变异`);
    
    if (callback) {
        callback();
    }
    
    return pendingVariant;
}

function processPendingVariants() {
    if (!gameState.pendingVariants || gameState.pendingVariants.length === 0) {
        return;
    }
    
    const currentAbsoluteWeek = gameState.week;
    const currentReportCount = gameState.totalReports || 0;
    const variantsToProcess = [];
    
    gameState.pendingVariants.forEach((variant, index) => {
        const weeksElapsed = currentAbsoluteWeek - variant.drawnAbsoluteWeek;
        const monthsElapsed = Math.floor(weeksElapsed / 4);
        
        const reportsPassed = currentReportCount - (variant.drawnReportCount || 0);
        
        const canMutate = monthsElapsed >= 3 && reportsPassed >= 1;
        
        if (canMutate) {
            variantsToProcess.push({ variant, index });
        }
    });
    
    if (variantsToProcess.length > 0) {
        showToast(`有 ${variantsToProcess.length} 位管培生完成培养！`);
    }
    
    variantsToProcess.forEach(({ variant, index }) => {
        const mutatedCard = {
            ...variant,
            name: `${variant.name}-${variant.variantResult.name}`,
            rarity: variant.variantResult.rarity,
            durability: variant.variantResult.durability,
            is_variant: false,
            isTraining: false,
            trainingProgress: null,
            variantResultId: null,
            variantResult: null,
            drawnQuarter: null,
            drawnAbsoluteWeek: null,
            drawnReportCount: null,
            description: variant.variantResult.text || variant.description
        };
        
        const backpackIndex = backpack.findIndex(c => c.instanceId === variant.instanceId);
        if (backpackIndex !== -1) {
            backpack[backpackIndex] = mutatedCard;
        } else {
            backpack.push(mutatedCard);
        }
        saveBackpack();
        
        showToast(`${variant.name} 变异为 ${variant.variantResult.name} (${variant.variantResult.rarity})！`);
    });
    
    for (let i = variantsToProcess.length - 1; i >= 0; i--) {
        gameState.pendingVariants.splice(variantsToProcess[i].index, 1);
    }
    
    updateRecruitUI();
}

function drawFromPool(poolId) {
    if (!canDraw()) {
        return null;
    }
    if (!currentPool) {
        showToast('请先选择岗位！');
        return null;
    }
    
    const performDrawInternal = () => {
        if (!gameState) {
            showToast('游戏状态未初始化');
            return null;
        }
        
        let card = drawCard(currentPool);
        
        if (!card) {
            showToast('抽卡失败');
            return null;
        }
        
        const cost = getCurrentDrawCost();
        gameState.budget -= cost;
        
        if (card.is_variant) {
            handleVariantCard(card, () => {
                saveWeeklyDraws();
                saveGame();
                updateRecruitUI();
            });
        } else {
            showCardAnimation(card, () => {
                confirmRecruit(card);
            });
            
            if (card.rarity === 'SSR') {
                showSSRStory();
            }
        }
        
        return card;
    };
    
    if (!hasShownFirstDrawStory && storiesData) {
        showFirstDrawStory(() => {
            performDrawInternal();
        });
    } else {
        performDrawInternal();
    }
    
    return true;
}



function showFirstDrawStory(callback) {
    const story = storiesData.card_stories.first_draw;
    
    if (!story) {
        if (callback) callback();
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'first-draw-story-modal';
    modal.className = 'story-modal';
    modal.innerHTML = `
        <div class="story-content recruit-story">
            <div class="story-close" onclick="closeFirstDrawStory()">×</div>
            <h2 class="story-title">${story.title}</h2>
            <div class="story-text">${story.intro}</div>
            <button class="story-button" onclick="closeFirstDrawStoryAndDraw()">开始招募</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    window.closeFirstDrawStoryAndDraw = function() {
        closeFirstDrawStory();
        hasShownFirstDrawStory = true;
        localStorage.setItem(FIRST_DRAW_KEY, 'true');
        if (callback) callback();
    };
}

function closeFirstDrawStory() {
    const modal = document.getElementById('first-draw-story-modal');
    if (modal) {
        modal.remove();
    }
}

function showSSRStory() {
    const story = storiesData.card_stories.ssr_draw;
    if (!story) return;
    
    const modal = document.createElement('div');
    modal.id = 'ssr-story-modal';
    modal.className = 'story-modal';
    modal.innerHTML = `
        <div class="story-content recruit-story">
            <div class="story-close" onclick="closeSSRStory()">×</div>
            <h2 class="story-title">${story.title}</h2>
            <div class="story-text">${story.intro}</div>
            <button class="story-button" onclick="closeSSRStory()">太棒了！</button>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeSSRStory() {
    const modal = document.getElementById('ssr-story-modal');
    if (modal) {
        modal.remove();
    }
}

function confirmRecruit(card) {
    if (!card) {
        console.error('Invalid card in confirmRecruit');
        return;
    }
    
    const confirmModal = document.getElementById('recruit-confirm-modal');
    const confirmCardName = document.getElementById('confirm-card-name');
    const confirmCardRarity = document.getElementById('confirm-card-rarity');
    const confirmCardDesc = document.getElementById('confirm-card-desc');
    const confirmBtn = document.getElementById('confirm-recruit-yes');
    const cancelBtn = document.getElementById('confirm-recruit-no');
    
    if (!confirmModal || !confirmCardName || !confirmCardRarity) {
        addCardToBackpack(card);
        return;
    }
    
    confirmCardName.textContent = card.name || '未知';
    confirmCardRarity.textContent = card.rarity || 'R';
    confirmCardRarity.style.color = cardsData?.rarity_colors?.[card.rarity] || '#9ca3af';
    confirmCardDesc.textContent = card.description || '暂无描述';
    
    confirmBtn.onclick = () => {
        confirmModal.style.display = 'none';
        addCardToBackpack(card);
    };
    
    cancelBtn.onclick = () => {
        confirmModal.style.display = 'none';
        const cost = getCurrentDrawCost();
        if (gameState) {
            gameState.budget += cost;
        }
        saveWeeklyDraws();
        saveGame();
        updateRecruitUI();
        showToast('已放弃该员工');
    };
    
    confirmModal.style.display = 'flex';
}



function addCardToBackpack(card, silent = false) {
    if (!card) {
        console.error('Invalid card in addCardToBackpack');
        return;
    }
    
    if (!card.is_variant && getCurrentHCCount() >= hc) {
        showToast('HC不足！');
        return;
    }
    
    addToDrawHistory(card);
    backpack.push(card);
    saveBackpack();
    
    // 如果报表模态框已打开，同步更新报表
    const reportModal = document.getElementById('report-modal');
    if (reportModal && reportModal.style.display === 'flex') {
        if (typeof renderReportModal === 'function') {
            renderReportModal();
        }
    }
    
    if (card.rarity === 'SSR') {
        unlockCard(card);
    }
    
    if (!silent) {
        saveWeeklyDraws();
        saveGame();
        updateRecruitUI();
        showToast(`已录用 ${card.name || '未知'}`);
    }
}

function unlockCard(card) {
    const cardKey = `${card.poolId}_${card.id}`;
    if (!unlockedCards.includes(cardKey)) {
        unlockedCards.push(cardKey);
        saveUnlockedCards();
    }
}

function useCard(instanceId, scenario = 'general', success = true) {
    if (typeof applyCardWear === 'function') {
        const result = applyCardWear(instanceId, scenario, success);
        if (result !== false) {
            saveBackpack();
            if (typeof updateRecruitUI === 'function') {
                updateRecruitUI();
            }
        }
        return result;
    }
    
    const index = backpack.findIndex(c => c.instanceId === instanceId);
    if (index === -1) return null;
    
    const card = backpack[index];
    
    if (!card.durability) {
        card.durability = card.rarity === 'SSR' ? 5 : (card.rarity === 'SR' ? 8 : 10);
    }
    
    if (card.currentDurability === undefined) {
        card.currentDurability = card.durability;
    }
    
    let wearAmount = 1;
    if (scenario === 'negotiation') {
        wearAmount = success ? 1 : 2;
    } else if (scenario === 'report_battle_defeat') {
        wearAmount = 1;
    } else if (card.rarity === 'SSR') {
        wearAmount = 3;
    }
    
    card.currentDurability -= wearAmount;
    
    const isDestroyed = card.currentDurability <= 0;
    
    if (isDestroyed) {
        const fragments = card.rarity === 'SSR' ? 10 : (card.rarity === 'SR' ? 3 : 1);
        if (gameState) {
            if (gameState.cardFragments === undefined) gameState.cardFragments = 0;
            gameState.cardFragments += fragments;
        }
        backpack.splice(index, 1);
        showToast(`卡牌"${card.name}"已报废！获得${fragments}碎片`);
    }
    
    saveBackpack();
    updateRecruitUI();
    
    return { card, isDestroyed };
}

function showRecruitModal() {
    const modal = document.getElementById('recruit-modal');
    if (!modal) return;
    
    const poolList = document.getElementById('pool-list');
    if (poolList) {
        poolList.innerHTML = cardsData.pools.map(pool => {
            const isSelected = currentPool === pool.id;
            return `
                <button class="pool-btn ${isSelected ? 'selected' : ''}" data-pool="${pool.id}">
                    <span class="pool-icon">${pool.icon}</span>
                    <span class="pool-name">${pool.name}</span>
                </button>
            `;
        }).join('');
        
        poolList.querySelectorAll('.pool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                poolList.querySelectorAll('.pool-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                currentPool = btn.dataset.pool;
                updateRecruitUI();
            });
        });
    }
    
    updateRecruitUI();
    modal.style.display = 'flex';
}

function closeRecruitModal() {
    const modal = document.getElementById('recruit-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function showDrawHistory() {
    const modal = document.getElementById('draw-history-modal') || createDrawHistoryModal();
    modal.style.display = 'flex';
}

function createDrawHistoryModal() {
    const modal = document.createElement('div');
    modal.id = 'draw-history-modal';
    modal.className = 'draw-history-modal';
    modal.innerHTML = `
        <div class="draw-history-content">
            <button class="history-close" onclick="closeDrawHistory()">×</button>
            <h2 class="history-title">📜 抽卡记录</h2>
            <div class="history-list" id="history-list"></div>
        </div>
    `;
    document.body.appendChild(modal);
    return modal;
}

function closeDrawHistory() {
    const modal = document.getElementById('draw-history-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function updateDrawHistoryUI() {
    const list = document.getElementById('history-list');
    if (!list) return;
    
    if (drawHistory.length === 0) {
        list.innerHTML = '<div class="history-empty">暂无抽卡记录</div>';
        return;
    }
    
    list.innerHTML = drawHistory.slice(0, 50).map(record => {
        const color = cardsData?.rarity_colors?.[record.rarity] || '#9ca3af';
        const date = new Date(record.timestamp);
        const timeStr = `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        return `
            <div class="history-item" style="border-left-color: ${color}">
                <span class="history-rarity" style="color: ${color}">${record.rarity}</span>
                <span class="history-name">${record.name}</span>
                <span class="history-time">${timeStr}</span>
            </div>
        `;
    }).join('');
}

function getUpgradeCost(card) {
    if (!card) return 0;
    const rarityMultiplier = {
        'R': 1,
        'SR': 2
    };
    return 20 * (rarityMultiplier[card.rarity] || 1);
}

function canAffordUpgrade(card) {
    if (!gameState || !card) return false;
    if (card.is_variant || card.rarity === 'SSR') return false;
    return gameState.budget >= getUpgradeCost(card);
}

function upgradeCard(instanceId) {
    const cardIndex = backpack.findIndex(c => c.instanceId === instanceId);
    if (cardIndex === -1) return;
    
    const card = backpack[cardIndex];
    if (!canAffordUpgrade(card)) {
        showToast('资金不足！');
        return;
    }
    
    const cost = getUpgradeCost(card);
    gameState.budget -= cost;
    
    const rarityUpgrade = {
        'R': 'SR',
        'SR': 'SSR'
    };
    
    const newRarity = rarityUpgrade[card.rarity];
    if (newRarity) {
        card.rarity = newRarity;
        card.durability = card.rarity === 'SSR' ? 3 : 4;
        
        if (card.rarity === 'SSR') {
            unlockCard(card);
        }
        
        saveBackpack();
        saveGame();
        updateRecruitUI();
        showToast(`${card.name} 升级为 ${newRarity}！`);
    }
}

function updateRecruitUI() {
    if (!cardsData || !cardsData.costs) {
        return;
    }
    
    const drawBtn = document.getElementById('recruit-draw');
    const hcDisplay = document.getElementById('recruit-hc');
    const budgetDisplay = document.getElementById('recruit-budget');
    const drawsLeft = document.getElementById('recruit-draws-left');
    const backpackEl = document.getElementById('recruit-backpack');
    const historyBtn = document.getElementById('recruit-history');
    
    if (hcDisplay) {
        const variantCount = backpack.filter(c => c.is_variant).length;
        hcDisplay.textContent = `📦 HC ${getCurrentHCCount()}/${hc}（管培生${variantCount}不计）`;
    }
    
    if (budgetDisplay && gameState) {
        budgetDisplay.textContent = `资金: ${gameState.budget.toLocaleString()}万`;
    }
    
    if (drawsLeft) {
        drawsLeft.textContent = `单抽费用: ${getCurrentDrawCost()}万`;
    }
    
    if (historyBtn) {
        historyBtn.onclick = () => {
            updateDrawHistoryUI();
            showDrawHistory();
        };
    }
    
    if (drawBtn) {
        const canDrawResult = canDraw();
        drawBtn.disabled = !canDrawResult;
        drawBtn.onclick = canDrawResult ? () => {
            drawFromPool(currentPool || 'rd');
        } : () => {};
    }
    
    if (backpackEl) {
        backpackEl.innerHTML = backpack.map(card => {
            const rarityColor = cardsData?.rarity_colors?.[card.rarity] || '#9ca3af';
            return `
                <div class="card-item" style="border-color: ${rarityColor}">
                    <div class="card-rarity" style="color: ${rarityColor}">${card.rarity || 'R'}</div>
                    <div class="card-name">${card.name || '未知'}</div>
                    ${card.is_variant ? '<div class="card-variant">管培生</div>' : ''}
                </div>
            `;
        }).join('');
    }
}

function showCardAnimation(card, callback) {
    const animationEl = document.getElementById('card-animation');
    if (!animationEl) {
        if (callback) callback();
        return;
    }
    
    if (!card || !card.rarity || !card.name) {
        console.error('Invalid card data:', card);
        if (callback) callback();
        return;
    }
    
    const rarityColor = cardsData?.rarity_colors?.[card.rarity] || '#9ca3af';
    const description = card.description || '暂无描述';
    
    animationEl.innerHTML = `
        <div class="card-reveal" style="border-color: ${rarityColor}">
            <div class="card-reveal-rarity" style="color: ${rarityColor}">${card.rarity}</div>
            <div class="card-reveal-name">${card.name}</div>
            <div class="card-reveal-desc">${description}</div>
        </div>
    `;
    
    animationEl.style.display = 'flex';
    
    setTimeout(() => {
        animationEl.style.display = 'none';
        if (callback) callback();
    }, 2000);
}

function showVariantResult(card, result) {
    const toast = document.getElementById('variant-toast');
    if (!toast) {
        showToast(result.text);
        return;
    }
    
    const toastContent = toast.querySelector('.variant-toast-content');
    if (toastContent) {
        toastContent.innerHTML = `<p>${result.text}</p>`;
    }
    
    toast.style.display = 'flex';
    
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast-modal') || createToastModal();
    const msgEl = document.getElementById('toast-message') || toast.querySelector('.toast-message');
    
    if (msgEl) {
        msgEl.textContent = message;
    }
    
    if (toast) {
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}

function createToastModal() {
    const modal = document.createElement('div');
    modal.id = 'toast-modal';
    modal.className = 'toast-modal';
    modal.innerHTML = '<div class="toast-content"><p class="toast-message"></p></div>';
    modal.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:30000;justify-content:center;align-items:center;';
    document.body.appendChild(modal);
    return modal;
}

function addHC(amount) {
    hc += amount;
    saveHC();
}

function getBackpack() {
    return [...backpack];
}

window.addEventListener('DOMContentLoaded', loadCardsData);
