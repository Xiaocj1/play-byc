let questsData = null;
let quarterlyQuests = [];

async function loadQuestsData() {
    try {
        questsData = await fetch('data/quests.json').then(r => r.json());
    } catch (error) {
        console.error('Failed to load quests data:', error);
    }
}

function getCurrentQuarter() {
    const week = gameState.week;
    return Math.floor((week - 1) / 12) + 1;
}

function getWeekInQuarter() {
    const week = gameState.week;
    return ((week - 1) % 12) + 1;
}

function formatQuarterWeek() {
    const q = getCurrentQuarter();
    const w = getWeekInQuarter();
    return `Q${q} · 第 ${w} 周`;
}

function generateQuarterlyQuests() {
    if (!questsData || !questsData.quests) return [];
    
    const shuffled = [...questsData.quests].sort(() => Math.random() - 0.5);
    const count = Math.min(5, shuffled.length);
    return shuffled.slice(0, count).map(q => ({
        ...q,
        instanceId: Date.now() + Math.random(),
        completed: false,
        usedCardId: null
    }));
}

function showReportModal() {
    const modal = document.getElementById('report-modal');
    if (!modal) return;
    
    quarterlyQuests = gameState.quarterlyQuests || generateQuarterlyQuests();
    if (!gameState.quarterlyQuests) {
        gameState.quarterlyQuests = quarterlyQuests;
    }
    
    renderReportModal();
    modal.style.display = 'flex';
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderReportModal() {
    const reportTitle = document.querySelector('.report-title');
    if (reportTitle && typeof getDirectionText === 'function') {
        reportTitle.textContent = `📊 ${getDirectionText('reportName')}`;
    }
    
    renderQuestList();
    renderCardList();
    updateReportPreview();
}

function renderQuestList() {
    const container = document.getElementById('report-quest-list');
    if (!container) return;
    
    container.innerHTML = quarterlyQuests.map(quest => {
        const questEl = document.createElement('div');
        questEl.className = `report-quest-item ${quest.completed ? 'completed' : ''}`;
        questEl.dataset.questId = quest.instanceId;
        
        const campColor = questsData.camp_colors[quest.camp] || '#888';
        const campName = questsData.camp_names[quest.camp] || '中立';
        const diffColor = questsData.difficulty_colors[quest.difficulty] || '#888';
        
        questEl.innerHTML = `
            <div class="quest-header">
                <span class="quest-name">${quest.name}</span>
                <span class="quest-camp" style="color: ${campColor}">${campName}</span>
            </div>
            <div class="quest-info">
                <span class="quest-difficulty" style="color: ${diffColor}">${quest.difficulty}</span>
                <span class="quest-score">基础分: ${quest.base_score}</span>
            </div>
            <div class="quest-flavor">"${quest.flavor}"</div>
            <div class="quest-cards" id="quest-cards-${quest.instanceId}"></div>
            ${quest.completed ? '<div class="quest-used">已解决</div>' : ''}
        `;
        
        return questEl.outerHTML;
    }).join('');
    
    quarterlyQuests.forEach(quest => {
        if (!quest.completed) {
            renderAvailableCardsForQuest(quest);
        }
    });
}

function renderAvailableCardsForQuest(quest) {
    const container = document.getElementById(`quest-cards-${quest.instanceId}`);
    if (!container) return;
    
    const availableCards = getBackpack().filter(c => !c.is_variant && c.durability > 0);
    
    if (availableCards.length === 0) {
        container.innerHTML = '<div class="no-cards-hint">背包无卡牌</div>';
        return;
    }
    
    container.innerHTML = '<div class="available-cards">' + 
        availableCards.map(card => `
            <button class="card-select-btn" onclick="selectCardForQuest(${quest.instanceId}, ${card.instanceId})">
                <span class="card-select-name">${card.name}</span>
                <span class="card-select-dur">耐久:${card.durability}</span>
            </button>
        `).join('') + 
        '</div>';
}

function selectCardForQuest(questInstanceId, cardInstanceId) {
    const quest = quarterlyQuests.find(q => q.instanceId === questInstanceId);
    const card = backpack.find(c => c.instanceId === cardInstanceId);
    
    if (!quest || !card) return;
    
    const result = useCardOnQuest(card, quest);
    
    showQuestResult(result);
    
    renderReportModal();
}

function useCardOnQuest(card, quest) {
    const cardIndex = backpack.findIndex(c => c.instanceId === card.instanceId);
    if (cardIndex === -1) return null;
    
    let noDurabilityLoss = false;
    let bonusMultiplier = 1;
    
    if (card.camp === quest.camp) {
        if ((card.camp === 'heaven' && quest.camp === 'heaven') ||
            (card.camp === 'hell' && quest.camp === 'hell')) {
            noDurabilityLoss = true;
            bonusMultiplier = 1.5;
        } else if (card.camp === 'justice') {
            noDurabilityLoss = true;
            bonusMultiplier = 1.3;
        }
    }
    
    const score = Math.round(quest.base_score * bonusMultiplier);
    
    card.durability--;
    
    const result = {
        questName: quest.name,
        cardName: card.name,
        score: score,
        durabilityLost: !noDurabilityLoss,
        bonus: bonusMultiplier > 1,
        cardDestroyed: card.durability <= 0
    };
    
    if (card.durability <= 0) {
        backpack.splice(cardIndex, 1);
    } else {
        backpack[cardIndex] = card;
    }
    
    saveBackpack();
    
    quest.completed = true;
    quest.usedCardId = card.instanceId;
    quest.score = score;
    
    gameState.quarterlyScore = (gameState.quarterlyScore || 0) + score;
    
    return result;
}

function showQuestResult(result) {
    if (!result) return;
    
    let message = `用【${result.cardName}】解决【${result.questName}】，得分 +${result.score}`;
    
    if (result.bonus) {
        message += '\n阵营匹配！得分 +' + Math.round(result.score * 0.5) + ' (无磨损)';
    } else if (result.durabilityLost) {
        message += '\n磨损 -1' + (result.cardDestroyed ? ' (卡牌销毁)' : '');
    }
    
    showToast(message);
}

function renderCardList() {
    const container = document.getElementById('report-card-list');
    if (!container) return;
    
    const cards = getBackpack();
    
    if (cards.length === 0) {
        container.innerHTML = '<div class="no-cards-hint">背包暂无卡牌</div>';
        return;
    }
    
    container.innerHTML = '<div class="report-cards-grid">' +
        cards.map(card => `
            <div class="report-card-item" style="border-color: ${cardsData.rarity_colors[card.rarity]}">
                <div class="report-card-name">${card.name}</div>
                <div class="report-card-info">
                    <span class="report-card-camp" style="color: ${questsData.camp_colors[card.camp] || '#888'}">${questsData.camp_names[card.camp] || '中立'}</span>
                    <span class="report-card-dur">耐久: ${card.durability}</span>
                </div>
            </div>
        `).join('') +
        '</div>';
}

function updateReportPreview() {
    const previewEl = document.getElementById('report-preview');
    const scoreEl = document.getElementById('report-current-score');
    const satisfactionEl = document.getElementById('report-satisfaction-change');
    const budgetEl = document.getElementById('report-budget-change');
    
    if (!previewEl) return;
    
    const completedQuests = quarterlyQuests.filter(q => q.completed);
    const totalScore = completedQuests.reduce((sum, q) => sum + (q.score || 0), 0);
    const uncompleteCount = quarterlyQuests.length - completedQuests.length;
    const finalScore = totalScore - (uncompleteCount * questsData.uncomplete_penalty);
    
    if (scoreEl) scoreEl.textContent = finalScore;
    
    let rating, satChange, budgetChange;
    
    if (finalScore >= 40) {
        rating = '优秀';
        satChange = '+15%';
        budgetChange = '+30';
    } else if (finalScore >= 20) {
        rating = '合格';
        satChange = '+5%';
        budgetChange = '+10';
    } else {
        rating = '不合格';
        satChange = '-15%';
        budgetChange = '-20';
    }
    
    if (satisfactionEl) satisfactionEl.textContent = satChange;
    if (budgetEl) budgetEl.textContent = budgetChange;
    
    document.getElementById('report-rating').textContent = rating;
}

function confirmQuarterlyReport() {
    const completedQuests = quarterlyQuests.filter(q => q.completed);
    const totalScore = completedQuests.reduce((sum, q) => sum + (q.score || 0), 0);
    const uncompleteCount = quarterlyQuests.length - completedQuests.length;
    const finalScore = totalScore - (uncompleteCount * questsData.uncomplete_penalty);
    
    let satChange = 0;
    let budgetChange = 0;
    let rating;
    let fameChange = 0;
    
    if (finalScore >= 40) {
        rating = '优秀';
        satChange = 10;
        budgetChange = 30;
        fameChange = 5;
    } else if (finalScore >= 20) {
        rating = '合格';
        satChange = 5;
        budgetChange = 10;
        fameChange = 0;
    } else {
        rating = '不合格';
        satChange = -10;
        budgetChange = -20;
        fameChange = -10;
    }
    
    let satisfactionBonus = 0;
    if (gameState.satisfaction > 80) {
        satisfactionBonus = 5;
    } else if (gameState.satisfaction < 40) {
        satisfactionBonus = -10;
    }
    
    const fameMultiplier = typeof getFameMultiplier === 'function' ? getFameMultiplier() : 1;
    budgetChange = Math.round((budgetChange + satisfactionBonus) * fameMultiplier);
    
    gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + satChange));
    
    if (typeof addFame === 'function') {
        addFame(fameChange);
    }
    
    gameState.budget = Math.max(0, gameState.budget + budgetChange);
    
    gameState.quarterlyQuests = [];
    gameState.quarterlyScore = 0;
    
    saveGame();
    
    closeReportModal();
    
    const direction = gameState.direction || 'tob';
    const satisfactionName = direction === 'tob' ? '甲方满意度' : (direction === 'toc' ? '用户满意度' : '双边满意度');
    const fameName = direction === 'tob' ? '行业口碑' : (direction === 'toc' ? '应用评分' : '平台信用分');
    
    showToast(`Q${getCurrentQuarter()} 财报评级：${rating} → ${satisfactionName} ${satChange > 0 ? '+' : ''}${satChange}%，资金 ${budgetChange > 0 ? '+' : ''}${budgetChange}，${fameName} ${fameChange > 0 ? '+' : ''}${fameChange}`);
    
    updateUI();
}

function checkQuarterEnd() {
    if (getWeekInQuarter() === 12) {
        return true;
    }
    return false;
}

window.addEventListener('DOMContentLoaded', loadQuestsData);