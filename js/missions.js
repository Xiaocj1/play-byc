let missionsData = null;

async function loadMissionsData() {
    try {
        const response = await fetch('data/missions.json');
        missionsData = await response.json();
    } catch (error) {
        console.error('Failed to load missions data:', error);
        missionsData = { missions: [] };
    }
}

function getAvailableMissions() {
    if (!missionsData || !missionsData.missions) return [];
    
    const availableMissions = [];
    const usedMissionIds = gameState.completedMissions || [];
    
    missionsData.missions.forEach(mission => {
        if (!usedMissionIds.includes(mission.id)) {
            availableMissions.push(mission);
        }
    });
    
    return availableMissions;
}

function showMissionModal() {
    const missions = getAvailableMissions();
    
    if (missions.length === 0) {
        showToast('当前没有可用任务！');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'mission-modal';
    modal.innerHTML = `
        <div class="mission-modal-content">
            <h2>📋 可用任务</h2>
            <div class="missions-list" id="missions-list"></div>
            <button class="btn-pixel mission-close-btn" onclick="closeMissionModal()">关闭</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    renderMissionList();
}

function renderMissionList() {
    const missionsList = document.getElementById('missions-list');
    const missions = getAvailableMissions();
    
    missionsList.innerHTML = missions.map(mission => {
        const canAssign = canAssignMission(mission);
        const assignedCards = getCardsByPosition(mission.requiredPosition);
        
        return `
            <div class="mission-card ${!canAssign ? 'disabled' : ''}">
                <div class="mission-header">
                    <h3>${mission.title}</h3>
                    <span class="mission-difficulty difficulty-${mission.difficulty}">
                        ${getDifficultyText(mission.difficulty)}
                    </span>
                </div>
                <p class="mission-description">${mission.description}</p>
                <div class="mission-info">
                    <div class="mission-requirement">
                        <span>👤 需求岗位:</span>
                        <span>${getPositionName(mission.requiredPosition)}</span>
                    </div>
                    <div class="mission-cost">
                        <span>⚔️ 耐久消耗:</span>
                        <span>${mission.durabilityCost}</span>
                    </div>
                    <div class="mission-success-rate">
                        <span>✅ 成功率:</span>
                        <span>${Math.round(mission.successRate * 100)}%</span>
                    </div>
                </div>
                <div class="mission-effects">
                    <div class="success-effects">
                        <span>成功效果:</span>
                        ${renderEffects(mission.successEffects)}
                    </div>
                    <div class="failure-effects">
                        <span>失败效果:</span>
                        ${renderEffects(mission.failureEffects)}
                    </div>
                </div>
                ${canAssign && assignedCards.length > 0 ? `
                    <div class="assign-section">
                        <select class="card-select" data-mission-id="${mission.id}">
                            <option value="">选择员工...</option>
                            ${assignedCards.map(card => `
                                <option value="${card.instanceId}">
                                    ${card.name} (${card.rarity}) - 耐久: ${card.durability || 1}
                                </option>
                            `).join('')}
                        </select>
                        <button class="btn-pixel assign-btn" 
                                onclick="assignMission('${mission.id}', this)">
                            指派执行
                        </button>
                    </div>
                ` : assignedCards.length === 0 ? `
                    <div class="no-card-warning">⚠️ 没有可用的${getPositionName(mission.requiredPosition)}员工</div>
                ` : ''}
            </div>
        `;
    }).join('');
}

function canAssignMission(mission) {
    const cards = getCardsByPosition(mission.requiredPosition);
    return cards.some(card => (card.durability || 1) >= mission.durabilityCost);
}

function getCardsByPosition(position) {
    if (!backpack) return [];
    
    const positionMap = {
        'RD': ['RD', '研发'],
        'QA': ['QA', '测试'],
        '设计': ['设计'],
        '运营': ['运营'],
        '产品': ['产品']
    };
    
    const positions = positionMap[position] || [position];
    
    return backpack.filter(card => 
        positions.includes(card.position) && !card.isTraining
    );
}

function getPositionName(position) {
    const positionNames = {
        'RD': '研发',
        'QA': '测试',
        '设计': '设计',
        '运营': '运营',
        '产品': '产品'
    };
    return positionNames[position] || position;
}

function getDifficultyText(difficulty) {
    const texts = {
        'low': '简单',
        'medium': '中等',
        'high': '困难'
    };
    return texts[difficulty] || difficulty;
}

function renderEffects(effects) {
    if (!effects || Object.keys(effects).length === 0) {
        return '<span class="no-effects">无</span>';
    }
    
    return Object.entries(effects).map(([key, value]) => {
        const effectNames = {
            'progress': '进度',
            'satisfaction': '满意度',
            'fame': '名声',
            'budget': '资金',
            'morale': '士气'
        };
        const name = effectNames[key] || key;
        const sign = value > 0 ? '+' : '';
        return `<span class="effect-tag ${value > 0 ? 'positive' : 'negative'}">${name} ${sign}${value}</span>`;
    }).join('');
}

function assignMission(missionId, button) {
    const select = button.parentElement.querySelector('.card-select');
    const cardInstanceId = select.value;
    
    if (!cardInstanceId) {
        showToast('请选择一名员工！');
        return;
    }
    
    const mission = missionsData.missions.find(m => m.id === missionId);
    const card = backpack.find(c => c.instanceId === cardInstanceId);
    
    if (!mission || !card) return;
    
    if ((card.durability || 1) < mission.durabilityCost) {
        showToast(`${card.name}耐久不足！`);
        return;
    }
    
    executeMission(mission, card);
    closeMissionModal();
}

function executeMission(mission, card) {
    const baseSuccessRate = mission.successRate;
    const rarityBonus = getRarityBonus(card.rarity);
    const finalSuccessRate = Math.min(0.99, baseSuccessRate + rarityBonus);
    
    const isSuccess = Math.random() < finalSuccessRate;
    
    card.durability = (card.durability || 1) - mission.durabilityCost;
    
    if (card.durability <= 0) {
        removeCardFromBackpack(card.instanceId);
        showToast(`${card.name} 耐久耗尽，已离职！`);
    } else {
        saveBackpack();
    }
    
    if (isSuccess) {
        applyEffects(mission.successEffects);
        showToast(`🎉 ${card.name} 成功完成「${mission.title}」！`);
    } else {
        applyEffects(mission.failureEffects);
        showToast(`💔 ${card.name} 未能完成「${mission.title}」...`);
    }
    
    gameState.completedMissions = gameState.completedMissions || [];
    gameState.completedMissions.push(mission.id);
    
    saveGame();
    updateUI();
}

function getRarityBonus(rarity) {
    const bonuses = {
        'R': 0,
        'SR': 0.1,
        'SSR': 0.2
    };
    return bonuses[rarity] || 0;
}

function applyEffects(effects) {
    if (!effects) return;
    
    Object.entries(effects).forEach(([key, value]) => {
        switch (key) {
            case 'progress':
                gameState.progress = Math.max(0, Math.min(100, gameState.progress + value));
                break;
            case 'satisfaction':
                gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + value));
                break;
            case 'fame':
                gameState.fame = Math.max(0, Math.min(100, gameState.fame + value));
                break;
            case 'budget':
                gameState.budget += value;
                break;
            case 'morale':
                gameState.morale = Math.max(0, Math.min(100, (gameState.morale || 50) + value));
                break;
        }
    });
}

function removeCardFromBackpack(instanceId) {
    const index = backpack.findIndex(c => c.instanceId === instanceId);
    if (index !== -1) {
        backpack.splice(index, 1);
        saveBackpack();
    }
}

function closeMissionModal() {
    const modal = document.querySelector('.mission-modal');
    if (modal) {
        modal.remove();
    }
}