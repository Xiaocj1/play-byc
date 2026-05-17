let questsData = null;
let quarterlyQuests = [];
let negotiationState = null;
let currentBattleIndex = 0;
let battleResults = [];

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
    
    if (!gameState.quarterlyQuests || gameState.quarterlyQuests.length === 0) {
        quarterlyQuests = generateQuarterlyQuests();
        gameState.quarterlyQuests = quarterlyQuests;
    } else {
        quarterlyQuests = gameState.quarterlyQuests;
    }
    
    // 标记报表待处理状态，防止刷新后丢失
    gameState.reportPending = true;
    saveGame();
    
    renderReportModal();
    modal.style.display = 'flex';
}

function closeReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    negotiationState = null;
    currentBattleIndex = 0;
    battleResults = [];
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
        
        const posColor = cardsData.position_colors[quest.position] || '#888';
        const diffColor = questsData.difficulty_colors[quest.difficulty] || '#888';
        
        questEl.innerHTML = `
            <div class="quest-header">
                <span class="quest-name">${quest.name}</span>
                <span class="quest-position" style="color: ${posColor}">${quest.position}</span>
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
                <span class="card-select-pos" style="color: ${cardsData.position_colors[card.position] || '#888'}">${card.position}</span>
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
    
    const result = playRockPaperScissors(card, quest);
    
    if (!result.win) {
        card.durability--;
    }
    
    const finalResult = {
        questName: quest.name,
        cardName: card.name,
        score: result.score,
        durabilityLost: !result.win,
        bonus: result.win,
        cardDestroyed: card.durability <= 0,
        message: result.message
    };
    
    if (card.durability <= 0) {
        backpack.splice(cardIndex, 1);
    } else {
        backpack[cardIndex] = card;
    }
    
    saveBackpack();
    
    quest.completed = true;
    quest.usedCardId = card.instanceId;
    quest.score = result.score;
    
    gameState.quarterlyScore = (gameState.quarterlyScore || 0) + result.score;
    
    return finalResult;
}

function playRockPaperScissors(card, quest) {
    const counterChain = cardsData.counter_chain;
    const cardPosition = card.position;
    const questPosition = quest.position;
    
    let win = false;
    let score = 0;
    let message = '';
    
    if (counterChain[cardPosition] === questPosition) {
        win = true;
        score = Math.round(quest.base_score * 1.5);
        message = `${cardPosition} 克制 ${questPosition}！完美解决！`;
    } else if (counterChain[questPosition] === cardPosition) {
        win = false;
        score = Math.round(quest.base_score * 0.5);
        message = `${questPosition} 克制 ${cardPosition}！效果打折...`;
    } else {
        const randomResult = Math.random();
        if (randomResult > 0.3) {
            win = true;
            score = quest.base_score;
            message = `势均力敌，随机判定成功！`;
        } else {
            win = false;
            score = Math.round(quest.base_score * 0.3);
            message = `势均力敌，随机判定失败...`;
        }
    }
    
    return { win, score, message };
}

function showQuestResult(result) {
    if (!result) return;
    
    let message = `${result.message}\n用【${result.cardName}】解决【${result.questName}】，得分 +${result.score}`;
    
    if (result.durabilityLost) {
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
                <div class="report-card-header">
                    <span class="report-card-name">${card.name}</span>
                    <span class="report-card-position" style="color: ${cardsData.position_colors[card.position] || '#888'}">${card.position}</span>
                </div>
                <div class="report-card-info">
                    <span class="report-card-rarity" style="color: ${cardsData.rarity_colors[card.rarity] || '#888'}">${card.rarity}</span>
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
    
    gameState.totalReports = (gameState.totalReports || 0) + 1;
    
    if (gameState.pendingVariants && gameState.pendingVariants.length > 0) {
        gameState.pendingVariants.forEach(v => {
            v.reportPassed = true;
        });
    }
    
    // 清除报表待处理状态
    gameState.reportPending = false;
    gameState.quarterlyQuests = [];
    gameState.quarterlyScore = 0;
    
    saveGame();
    
    closeReportModal();
    
    setTimeout(() => {
        if (typeof processPendingVariants === 'function') {
            processPendingVariants();
        }
    }, 100);
    
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

function startNegotiation() {
    const availableCards = getBackpack().filter(c => !c.is_variant && c.durability > 0);
    
    if (availableCards.length === 0) {
        showToast('没有可用卡牌进行谈判！');
        return;
    }
    
    const opponentCards = generateOpponentCards();
    
    negotiationState = {
        playerCards: [...availableCards],
        opponentCards: opponentCards,
        playerScore: 0,
        opponentScore: 0,
        currentRound: 1
    };
    
    currentBattleIndex = 0;
    battleResults = [];
    
    renderNegotiationModal();
}

function generateOpponentCards() {
    const positions = ['Operation', 'Design', 'QA', 'RD'];
    const cards = [];
    
    for (let i = 0; i < 3; i++) {
        const position = positions[Math.floor(Math.random() * positions.length)];
        const pool = cardsData.pools.find(p => p.position === position);
        if (pool && pool.cards) {
            const availableCards = pool.cards.filter(c => !c.is_variant);
            if (availableCards.length > 0) {
                const card = availableCards[Math.floor(Math.random() * availableCards.length)];
                cards.push({
                    ...card,
                    instanceId: Date.now() + Math.random() + i,
                    durability: card.durability
                });
            }
        }
    }
    
    return cards;
}

function renderNegotiationModal() {
    const modal = document.getElementById('negotiation-modal');
    if (!modal) return;
    
    const content = document.getElementById('negotiation-content');
    if (!content) return;
    
    const progressBar = document.getElementById('negotiation-progress');
    if (progressBar) {
        progressBar.innerHTML = `
            <div class="negotiation-round">第 ${negotiationState.currentRound}/3 回合</div>
            <div class="negotiation-score">
                <span>我方: ${negotiationState.playerScore}</span>
                <span>对方: ${negotiationState.opponentScore}</span>
            </div>
        `;
    }
    
    const playerCardsDiv = document.getElementById('negotiation-player-cards');
    const opponentCardsDiv = document.getElementById('negotiation-opponent-cards');
    const battleResultDiv = document.getElementById('negotiation-result');
    
    if (battleResults.length > 0) {
        const lastResult = battleResults[battleResults.length - 1];
        battleResultDiv.innerHTML = `
            <div class="battle-result ${lastResult.win ? 'win' : 'lose'}">
                ${lastResult.win ? '✓ 克制成功！' : '✗ 被克制！'}
                ${lastResult.message}
            </div>
        `;
    } else {
        battleResultDiv.innerHTML = '';
    }
    
    playerCardsDiv.innerHTML = negotiationState.playerCards.map(card => `
        <button class="negotiation-card player" 
                onclick="selectNegotiationCard(${card.instanceId})"
                style="border-color: ${cardsData.position_colors[card.position] || '#888'}">
            <div class="negotiation-card-icon">${getPositionIcon(card.position)}</div>
            <div class="negotiation-card-name">${card.name}</div>
            <div class="negotiation-card-pos">${card.position}</div>
            <div class="negotiation-card-dur">耐久: ${card.durability}</div>
        </button>
    `).join('');
    
    opponentCardsDiv.innerHTML = negotiationState.opponentCards.map((card, index) => `
        <div class="negotiation-card opponent" 
             style="border-color: ${cardsData.position_colors[card.position] || '#888'}">
            <div class="negotiation-card-icon">${getPositionIcon(card.position)}</div>
            <div class="negotiation-card-name">${card.name}</div>
            <div class="negotiation-card-pos">${card.position}</div>
            <div class="negotiation-card-dur">耐久: ${card.durability}</div>
        </div>
    `).join('');
    
    modal.style.display = 'flex';
}

function getPositionIcon(position) {
    const icons = {
        'Operation': '📊',
        'Design': '🎨',
        'QA': '🧪',
        'RD': '💻'
    };
    return icons[position] || '❓';
}

function selectNegotiationCard(cardInstanceId) {
    if (!negotiationState || currentBattleIndex >= 3) return;
    
    const playerCard = negotiationState.playerCards.find(c => c.instanceId === cardInstanceId);
    if (!playerCard) return;
    
    const opponentCard = negotiationState.opponentCards[currentBattleIndex];
    if (!opponentCard) return;
    
    const result = calculateBattleResult(playerCard, opponentCard);
    
    battleResults.push(result);
    
    if (!result.win) {
        playerCard.durability--;
        
        const backpackIndex = backpack.findIndex(c => c.instanceId === playerCard.instanceId);
        if (backpackIndex !== -1) {
            backpack[backpackIndex].durability--;
            if (backpack[backpackIndex].durability <= 0) {
                backpack.splice(backpackIndex, 1);
                result.cardDestroyed = true;
            }
            saveBackpack();
        }
        
        const playerIndex = negotiationState.playerCards.findIndex(c => c.instanceId === cardInstanceId);
        if (playerIndex !== -1) {
            if (negotiationState.playerCards[playerIndex].durability <= 0) {
                negotiationState.playerCards.splice(playerIndex, 1);
            }
        }
    }
    
    if (result.win) {
        negotiationState.playerScore++;
    } else {
        negotiationState.opponentScore++;
    }
    
    currentBattleIndex++;
    negotiationState.currentRound++;
    
    if (currentBattleIndex >= 3 || 
        negotiationState.playerScore >= 2 || 
        negotiationState.opponentScore >= 2) {
        endNegotiation();
    } else {
        renderNegotiationModal();
    }
}

function calculateBattleResult(playerCard, opponentCard) {
    const counterChain = cardsData.counter_chain;
    
    const playerPos = playerCard.position;
    const opponentPos = opponentCard.position;
    
    if (counterChain[playerPos] === opponentPos) {
        return {
            win: true,
            message: `${playerPos} 克制 ${opponentPos}！`,
            cardDestroyed: false
        };
    } else if (counterChain[opponentPos] === playerPos) {
        return {
            win: false,
            message: `${opponentPos} 克制 ${playerPos}！`,
            cardDestroyed: false
        };
    } else {
        const playerPower = getCardPower(playerCard);
        const opponentPower = getCardPower(opponentCard);
        
        if (playerPower > opponentPower) {
            return {
                win: true,
                message: `战力比拼胜利！(${playerPower} vs ${opponentPower})`,
                cardDestroyed: false
            };
        } else if (opponentPower > playerPower) {
            return {
                win: false,
                message: `战力比拼失败！(${playerPower} vs ${opponentPower})`,
                cardDestroyed: false
            };
        } else {
            const win = Math.random() > 0.5;
            return {
                win: win,
                message: `平局判定，${win ? '我方' : '对方'}获胜！`,
                cardDestroyed: false
            };
        }
    }
}

function getCardPower(card) {
    const rarityBonus = {
        'R': 1,
        'SR': 2,
        'SSR': 3
    };
    return card.durability * (rarityBonus[card.rarity] || 1);
}

function endNegotiation() {
    const modal = document.getElementById('negotiation-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    const resultDiv = document.getElementById('negotiation-final-result');
    if (!resultDiv) return;
    
    let resultText;
    let okrBonus = 0;
    
    if (negotiationState.playerScore >= 2) {
        resultText = `🎉 谈判胜利！(${negotiationState.playerScore}:${negotiationState.opponentScore})`;
        okrBonus = 10;
        gameState.okrBonus = (gameState.okrBonus || 0) + okrBonus;
        showToast(`${resultText}\n下季度 OKR +${okrBonus} 点`);
    } else {
        resultText = `😔 谈判失败！(${negotiationState.playerScore}:${negotiationState.opponentScore})`;
        showToast(resultText);
    }
    
    resultDiv.innerHTML = `<div class="final-result ${negotiationState.playerScore >= 2 ? 'win' : 'lose'}">${resultText}</div>`;
    
    setTimeout(() => {
        resultDiv.innerHTML = '';
    }, 3000);
    
    saveGame();
    updateUI();
    
    negotiationState = null;
    currentBattleIndex = 0;
    battleResults = [];
}

function closeNegotiationModal() {
    const modal = document.getElementById('negotiation-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    negotiationState = null;
    currentBattleIndex = 0;
    battleResults = [];
}

window.addEventListener('DOMContentLoaded', loadQuestsData);