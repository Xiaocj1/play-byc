const CARDS_KEY = "fair_office_cards";
const HC_KEY = "fair_office_hc";
const WEEKLY_DRAWS_KEY = "fair_office_weekly_draws";
const UNLOCKED_CARDS_KEY = "fair_office_unlocked_cards";

let cardsData = null;
let currentPool = null;
let backpack = [];
let hc = 3;
let weeklyDraws = 0;
let unlockedCards = [];

async function loadCardsData() {
    try {
        cardsData = await fetch('data/cards.json').then(r => r.json());
        loadBackpack();
        loadHC();
        loadWeeklyDraws();
        loadUnlockedCards();
    } catch (error) {
        console.error('Failed to load cards data:', error);
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

function getCurrentHCCount() {
    return backpack.filter(c => !c.is_variant).length;
}

function getCurrentDrawCost() {
    const baseCost = cardsData.costs.single_draw;
    const multiplier = typeof getDrawCostMultiplier === 'function' ? getDrawCostMultiplier() : 1;
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
    const weights = cards.map(c => {
        switch(c.rarity) {
            case 'SSR': return 1;
            case 'SR': return 3;
            default: return 6;
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

function handleVariantCard(card) {
    if (!card.is_variant || !card.variant_pool) return card;
    
    const resultId = card.variant_pool[Math.floor(Math.random() * card.variant_pool.length)];
    const result = cardsData.variant_results[resultId];
    
    if (!result) return card;
    
    showVariantResult(card, result);
    
    if (resultId === 'runaway' || resultId === 'exam') {
        if (result.bonus?.type === 'budget' && gameState) {
            gameState.budget += result.bonus.value;
        }
        return null;
    }
    
    return {
        ...card,
        name: `${card.name}-${result.name}`,
        rarity: result.rarity,
        durability: result.durability,
        is_variant: false
    };
}

function drawFromPool(poolId) {
    if (!canDraw()) return null;
    if (!currentPool) {
        showToast('请先选择岗位！');
        return null;
    }
    
    let card = drawCard(currentPool);
    if (!card) return null;
    
    gameState.budget -= getCurrentDrawCost();
    
    if (card.is_variant) {
        card = handleVariantCard(card);
    }
    
    if (card) {
        showCardAnimation(card, () => {
            confirmRecruit(card);

        });
    } else {
        saveWeeklyDraws();
        saveGame();
        updateRecruitUI();
    }
    
    return card;
}

function confirmRecruit(card) {
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
    
    confirmCardName.textContent = card.name;
    confirmCardRarity.textContent = card.rarity;
    confirmCardRarity.style.color = cardsData.rarity_colors[card.rarity];
    confirmCardDesc.textContent = card.description;
    
    confirmBtn.onclick = () => {
        confirmModal.style.display = 'none';
        addCardToBackpack(card);
    };
    
    cancelBtn.onclick = () => {
        confirmModal.style.display = 'none';
        saveWeeklyDraws();
        saveGame();
        updateRecruitUI();
        showToast('已放弃该员工');
    };
    
    confirmModal.style.display = 'flex';
}

function addCardToBackpack(card) {
    if (!card.is_variant && getCurrentHCCount() >= hc) {
        showToast('HC不足！');
        return;
    }
    
    backpack.push(card);
    saveBackpack();
    
    if (card.rarity === 'SSR') {
        unlockCard(card);
    }
    
    saveWeeklyDraws();
    saveGame();
    updateRecruitUI();
    showToast(`已录用 ${card.name}`);
}

function unlockCard(card) {
    const cardKey = `${card.poolId}_${card.id}`;
    if (!unlockedCards.includes(cardKey)) {
        unlockedCards.push(cardKey);
        saveUnlockedCards();
    }
}

function useCard(instanceId) {
    const index = backpack.findIndex(c => c.instanceId === instanceId);
    if (index === -1) return null;
    
    const card = backpack[index];
    card.durability--;
    
    if (card.durability <= 0) {
        backpack.splice(index, 1);
    }
    
    saveBackpack();
    updateRecruitUI();
    
    return card;
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

function updateRecruitUI() {
    const drawBtn = document.getElementById('recruit-draw');
    const hcDisplay = document.getElementById('recruit-hc');
    const budgetDisplay = document.getElementById('recruit-budget');
    const drawsLeft = document.getElementById('recruit-draws-left');
    const backpackEl = document.getElementById('recruit-backpack');
    
    if (hcDisplay) {
        const variantCount = backpack.filter(c => c.is_variant).length;
        hcDisplay.textContent = `📦 HC ${getCurrentHCCount()}/${hc}（管培生${variantCount}不计）`;
    }
    
    if (budgetDisplay && gameState) {
        budgetDisplay.textContent = `现金流: ${gameState.budget}`;
    }
    
    if (drawsLeft) {
        drawsLeft.textContent = `抽卡消耗: ${cardsData.costs.single_draw}`;
    }
    
    if (drawBtn) {
        drawBtn.disabled = !canDraw();
        drawBtn.onclick = canDraw() ? () => {
            const card = drawFromPool(currentPool || 'rd');
            if (card) {
                showCardAnimation(card);
            }
        } : () => {};
    }
    
    if (backpackEl) {
        backpackEl.innerHTML = backpack.map(card => `
            <div class="card-item" style="border-color: ${cardsData.rarity_colors[card.rarity]}">
                <div class="card-rarity">${card.rarity}</div>
                <div class="card-name">${card.name}</div>
                <div class="card-durability">耐久: ${card.durability}</div>
                ${card.is_variant ? '<div class="card-variant">管培生</div>' : ''}
                <button class="card-use-btn" onclick="useCard(${card.instanceId})">使用</button>
            </div>
        `).join('');
    }
}

function showCardAnimation(card, callback) {
    const animationEl = document.getElementById('card-animation');
    if (!animationEl) {
        if (callback) callback();
        return;
    }
    
    animationEl.innerHTML = `
        <div class="card-reveal" style="border-color: ${cardsData.rarity_colors[card.rarity]}">
            <div class="card-reveal-rarity">${card.rarity}</div>
            <div class="card-reveal-name">${card.name}</div>
            <div class="card-reveal-desc">${card.description}</div>
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