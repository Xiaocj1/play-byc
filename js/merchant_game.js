const MERCHANT_KEY = "fair_office_merchant_game";
const COMBO_KEY = "fair_office_combo_count";

let negotiationCardsData = null;
let merchantsData = null;
let currentMerchant = null;
let playerHand = [];
let comboCount = 0;

async function loadMerchantGameData() {
    try {
        const [negotiationCards, merchants] = await Promise.all([
            fetch('data/negotiation_cards.json').then(r => r.json()),
            fetch('data/merchants.json').then(r => r.json())
        ]);
        negotiationCardsData = negotiationCards;
        merchantsData = merchants;
        loadComboCount();
    } catch (error) {
        console.error('Failed to load merchant game data:', error);
    }
}

function loadComboCount() {
    const saved = localStorage.getItem(COMBO_KEY);
    comboCount = parseInt(saved || '0');
}

function saveComboCount() {
    localStorage.setItem(COMBO_KEY, comboCount.toString());
}

function startMerchantGame() {
    if (!merchantsData || !negotiationCardsData) {
        showToast('数据加载中，请稍后再试');
        return;
    }
    
    const availableMerchants = merchantsData.merchants.filter(m => {
        if (m.unlock_condition) {
            if (m.unlock_condition.gmv && gameState.gmv < m.unlock_condition.gmv) return false;
            if (m.unlock_condition.week && gameState.week < m.unlock_condition.week) return false;
        }
        return true;
    });
    
    if (availableMerchants.length === 0) {
        showToast('暂无可用商家');
        return;
    }
    
    currentMerchant = availableMerchants[Math.floor(Math.random() * availableMerchants.length)];
    drawNegotiationCards();
    showMerchantGameModal();
}

function drawNegotiationCards() {
    playerHand = [];
    const cards = negotiationCardsData.cards;
    
    for (let i = 0; i < 3; i++) {
        const weights = cards.map(c => {
            switch(c.rarity) {
                case 'SSR': return 5;
                case 'SR': return 15;
                default: return 80;
            }
        });
        
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (let j = 0; j < cards.length; j++) {
            random -= weights[j];
            if (random <= 0) {
                const card = {...cards[j]};
                card.instanceId = Date.now() + Math.random() + i;
                playerHand.push(card);
                break;
            }
        }
    }
}

function showMerchantGameModal() {
    const modal = document.getElementById('merchant-game-modal');
    if (!modal) {
        createMerchantGameModal();
        return;
    }
    
    updateMerchantGameUI();
    modal.style.display = 'flex';
}

function createMerchantGameModal() {
    const modal = document.createElement('div');
    modal.id = 'merchant-game-modal';
    modal.className = 'merchant-game-modal';
    modal.innerHTML = `
        <div class="merchant-game-content">
            <button class="merchant-close" onclick="closeMerchantGame()">×</button>
            <h2 class="merchant-title">🏪 招商洽谈</h2>
            
            <div class="merchant-section">
                <h3>🎯 商家需求</h3>
                <div class="merchant-info" id="merchant-info">
                    <div class="merchant-name" id="merchant-name"></div>
                    <div class="merchant-type" id="merchant-type"></div>
                    <div class="merchant-demands" id="merchant-demands"></div>
                    <div class="merchant-success-rate" id="merchant-success-rate"></div>
                </div>
            </div>
            
            <div class="hand-section">
                <h3>🃏 你的手牌</h3>
                <div class="hand-container" id="hand-container"></div>
            </div>
            
            <div class="play-section">
                <button class="play-btn" id="play-1-card" onclick="playCards(1)">出1张牌</button>
                <button class="play-btn" id="play-2-cards" onclick="playCards(2)">出2张牌</button>
                <button class="play-btn" id="play-3-cards" onclick="playCards(3)">出3张牌</button>
            </div>
            
            <div class="combo-info" id="combo-info"></div>
            
            <div class="result-section" id="result-section" style="display: none;">
                <div class="result-title" id="result-title"></div>
                <div class="result-details" id="result-details"></div>
                <button class="result-btn" id="result-btn" onclick="handleGameResult()">继续</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    updateMerchantGameUI();
    modal.style.display = 'flex';
}

function updateMerchantGameUI() {
    if (!currentMerchant) return;
    
    const merchantName = document.getElementById('merchant-name');
    const merchantType = document.getElementById('merchant-type');
    const merchantDemands = document.getElementById('merchant-demands');
    const merchantSuccessRate = document.getElementById('merchant-success-rate');
    const handContainer = document.getElementById('hand-container');
    const comboInfo = document.getElementById('combo-info');
    
    if (merchantName) merchantName.textContent = currentMerchant.name;
    if (merchantType) merchantType.textContent = `类型: ${currentMerchant.type}`;
    
    if (merchantDemands) {
        merchantDemands.innerHTML = `
            <div class="demand-item">💰 资金需求: ${currentMerchant.fund_demand}</div>
            <div class="demand-item">👥 流量需求: ${currentMerchant.traffic_demand}</div>
            <div class="demand-item">⚙️ 技术需求: ${currentMerchant.tech_demand}</div>
        `;
    }
    
    if (merchantSuccessRate) {
        const baseRate = currentMerchant.base_success_rate;
        merchantSuccessRate.textContent = `基础成功率: ${baseRate}%`;
    }
    
    if (handContainer) {
        handContainer.innerHTML = playerHand.map((card, index) => {
            const color = negotiationCardsData.rarity_colors?.[card.rarity] || '#9ca3af';
            return `
                <div class="negotiation-card" style="border-color: ${color}" data-index="${index}">
                    <div class="card-rarity" style="color: ${color}">${card.rarity}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-effect">${card.effect_description}</div>
                    <div class="card-spectrum">${card.spectrum}</div>
                </div>
            `;
        }).join('');
    }
    
    if (comboInfo) {
        const comboBonus = Math.min(comboCount * 5, 15);
        comboInfo.textContent = `🔥 连续成功: ${comboCount}次 | 连击加成: +${comboBonus}%`;
    }
}

function playCards(count) {
    if (playerHand.length < count) {
        showToast('手牌不足！');
        return;
    }
    
    const selectedCards = playerHand.splice(0, count);
    calculateSuccess(selectedCards);
}

function calculateSuccess(selectedCards) {
    const baseRate = currentMerchant.base_success_rate;
    
    let cardBonus = 0;
    let fundReduction = 0;
    let trafficReduction = 0;
    let techReduction = 0;
    
    selectedCards.forEach(card => {
        if (card.effect_type === 'fund') {
            fundReduction += card.effect_value;
            cardBonus += card.effect_value * 2;
        } else if (card.effect_type === 'traffic') {
            trafficReduction += card.effect_value;
            cardBonus += card.effect_value * 2;
        } else if (card.effect_type === 'tech') {
            techReduction += card.effect_value;
            cardBonus += card.effect_value * 2;
        } else if (card.effect_type === 'success_rate') {
            cardBonus += card.effect_value;
        } else if (card.effect_type === 'combo') {
            cardBonus += 30;
        }
    });
    
    const fundMatch = fundReduction >= currentMerchant.fund_demand ? 1 : 0;
    const trafficMatch = trafficReduction >= currentMerchant.traffic_demand ? 1 : 0;
    const techMatch = techReduction >= currentMerchant.tech_demand ? 1 : 0;
    const resourceMatchBonus = (fundMatch + trafficMatch + techMatch) * 15;
    
    const xiaokuiFavor = gameState?.favors?.xiaokui || 50;
    const favorBonus = xiaokuiFavor >= 80 ? 10 : 0;
    
    const comboBonus = Math.min(comboCount * 5, 15);
    
    let finalRate = baseRate + cardBonus + resourceMatchBonus + favorBonus + comboBonus;
    finalRate = Math.max(5, Math.min(95, finalRate));
    
    const success = Math.random() * 100 < finalRate;
    
    showGameResult(success, finalRate, selectedCards, {
        cardBonus,
        resourceMatchBonus,
        favorBonus,
        comboBonus
    });
}

function showGameResult(success, finalRate, usedCards, bonuses) {
    const resultSection = document.getElementById('result-section');
    const resultTitle = document.getElementById('result-title');
    const resultDetails = document.getElementById('result-details');
    
    if (!resultSection || !resultTitle || !resultDetails) return;
    
    const playSection = document.querySelector('.play-section');
    const handContainer = document.getElementById('hand-container');
    
    if (playSection) playSection.style.display = 'none';
    if (handContainer) handContainer.style.display = 'none';
    
    if (success) {
        resultTitle.textContent = '🎉 洽谈成功！';
        resultTitle.style.color = '#4CAF50';
        
        comboCount++;
        saveComboCount();
        
        gameState.merchantCount = (gameState.merchantCount || 0) + currentMerchant.bonus_merchant_count;
        gameState.gmv = (gameState.gmv || 0) + currentMerchant.bonus_gmv;
        
        showToast(`🎊 ${currentMerchant.name}入驻成功！商家数+${currentMerchant.bonus_merchant_count}`);
    } else {
        resultTitle.textContent = '😔 洽谈失败';
        resultTitle.style.color = '#F44336';
        
        comboCount = 0;
        saveComboCount();
    }
    
    resultDetails.innerHTML = `
        <div>最终成功率: ${finalRate.toFixed(1)}%</div>
        <div>卡牌效果加成: +${bonuses.cardBonus}%</div>
        <div>资源匹配加成: +${bonuses.resourceMatchBonus}%</div>
        <div>小葵好感加成: +${bonuses.favorBonus}%</div>
        <div>连击加成: +${bonuses.comboBonus}%</div>
        <div style="margin-top: 10px;">使用的卡牌:</div>
        ${usedCards.map(c => `<div class="used-card">${c.rarity} - ${c.name}</div>`).join('')}
    `;
    
    usedCards.forEach(card => {
        if (typeof applyCardWear === 'function') {
            applyCardWear(card.instanceId, 'negotiation', success);
        }
    });
    
    resultSection.style.display = 'block';
}

function handleGameResult() {
    closeMerchantGame();
    
    if (typeof saveGame === 'function') saveGame();
    if (typeof updateUI === 'function') updateUI();
}

function closeMerchantGame() {
    const modal = document.getElementById('merchant-game-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    currentMerchant = null;
    playerHand = [];
}

function canStartMerchantGame() {
    if (!merchantsData || !negotiationCardsData) return false;
    if (gameState?.direction !== 'b2c') return false;
    if (gameState?.budget < 5) return false;
    return true;
}

function showMerchantGameToast() {
    if (!canStartMerchantGame()) return;
    
    showToast('🏪 可进行招商洽谈！');
}

window.addEventListener('DOMContentLoaded', loadMerchantGameData);