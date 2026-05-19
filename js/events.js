// ============ 事件系统模块 ============

function checkEventTriggerCondition(event) {
    const condition = event.trigger_condition;
    if (!condition) return true;
    
    const direction = gameState.direction;
    const week = gameState.week;
    const satisfaction = gameState.satisfaction;
    
    if (condition.direction && condition.direction !== direction) return false;
    
    if (condition.min_week && week < condition.min_week) return false;
    if (condition.max_week && week > condition.max_week) return false;
    
    if (condition.week_range) {
        const [min, max] = condition.week_range;
        if (week < min || week > max) return false;
    }
    
    if (condition.satisfaction_above && satisfaction < condition.satisfaction_above) return false;
    if (condition.satisfaction_below && satisfaction > condition.satisfaction_below) return false;
    
    if (condition.progress_milestone && gameState.progress < condition.progress_milestone) return false;
    
    if (condition.disputeRate_above && (gameState.disputeRate || 0) <= condition.disputeRate_above) return false;
    if (condition.disputeRate_below && (gameState.disputeRate || 0) > condition.disputeRate_below) return false;
    
    if (condition.dau_above && (gameState.dau || 0) < condition.dau_above) return false;
    if (condition.dau_below && (gameState.dau || 0) > condition.dau_below) return false;
    
    if (condition.fame_above && (gameState.fame || 0) < condition.fame_above) return false;
    if (condition.fame_below && (gameState.fame || 0) > condition.fame_below) return false;
    
    if (condition.gmv_above && (gameState.gmv || 0) < condition.gmv_above) return false;
    if (condition.gmv_below && (gameState.gmv || 0) > condition.gmv_below) return false;
    
    if (condition.clients_above && (gameState.benchmarkClients || 0) < condition.clients_above) return false;
    if (condition.clients_below && (gameState.benchmarkClients || 0) > condition.clients_below) return false;
    
    if (condition.holiday_near) {
        const holidays = [2, 4, 6, 16, 23, 31, 36, 39, 46, 50, 52];
        const nearWeeks = holidays.filter(h => Math.abs(h - week) <= condition.holiday_near);
        if (nearWeeks.length === 0) return false;
    }
    
    if (condition.special_condition) {
        switch(condition.special_condition) {
            case 'low_morale':
                if (satisfaction >= 50) return false;
                break;
            case 'high_morale':
                if (satisfaction < 80) return false;
                break;
            case 'early_game':
                if (week > 12) return false;
                break;
            case 'mid_game':
                if (week < 12 || week > 36) return false;
                break;
            case 'late_game':
                if (week < 36) return false;
                break;
            case 'has_employee':
                if (!gameState.currentEmployees || gameState.currentEmployees.length === 0) return false;
                break;
            case 'has_sr_card':
                const hasSR = window.backpack && window.backpack.some(c => c.rarity === 'SR' || c.rarity === 'SSR');
                if (!hasSR) return false;
                break;
        }
    }
    
    const probability = condition.probability || 0.2;
    if (Math.random() >= probability) return false;
    
    return true;
}

function checkRandomEvents() {
    if (!data.events || !data.events.events) return;
    
    const allEvents = data.events.events;
    
    // 筛选类型为 random 的事件
    const randomEvents = allEvents.filter(event => {
        return event.type === 'random' && checkEventTriggerCondition(event);
    });
    
    if (randomEvents.length > 0) {
        const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        applyRandomEvent(event);
    }
}

function applyRandomEvent(event) {
    if (!event.auto_effects) return;
    
    showToast(`📢 ${event.title}: ${event.weekly_effect}`);
    
    Object.keys(event.auto_effects).forEach(key => {
        const value = event.auto_effects[key];
        switch(key) {
            case 'morale':
                gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + value));
                break;
            case 'budget':
                gameState.budget += value;
                break;
            case 'progress':
                gameState.progress = Math.max(0, Math.min(100, gameState.progress + value));
                break;
            case 'satisfaction':
                gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + value));
                break;
            case 'fame':
                addFame(value);
                break;
            case 'dau':
                gameState.dau = Math.max(0, gameState.dau + value);
                break;
            case 'gmv':
                gameState.gmv = Math.max(0, gameState.gmv + value);
                break;
            case 'benchmarkClients':
                gameState.benchmarkClients += value;
                break;
            case 'renewalRate':
                gameState.renewalRate = Math.max(0, Math.min(100, gameState.renewalRate + value));
                break;
            case 'disputeRate':
                gameState.disputeRate = Math.max(0, Math.min(100, gameState.disputeRate + value));
                break;
        }
    });
    
    if (event.special_effect === 'progress_pause') {
        gameState.progressPaused = true;
    }
    
    gameState.weeklyLogs.push({
        week: gameState.week,
        event: event.title,
        choice: '自动事件',
        effect: event.weekly_effect
    });
}

// ============ 节假日事件系统 ============
function checkHolidayEvents() {
    if (!data.events || !data.events.events) return;
    
    const week = gameState.week;
    const allEvents = data.events.events;
    const holidayEvents = allEvents.filter(event => {
        if (event.type !== 'holiday') return false;
        if (event.trigger_condition?.week !== week) return false;
        return true;
    });
    
    if (holidayEvents.length > 0) {
        const event = holidayEvents[0];
        showEventModal(event);
    }
}

// ============ 团建事件系统 ============
function checkTeambuildingEvents() {
    if (!data.events || !data.events.events) return;
    
    const allEvents = data.events.events;
    const teambuildingEvents = allEvents.filter(event => {
        if (event.type !== 'teambuilding') return false;
        return checkEventTriggerCondition(event);
    });
    
    if (teambuildingEvents.length > 0) {
        const event = teambuildingEvents[Math.floor(Math.random() * teambuildingEvents.length)];
        showEventModal(event);
    }
}

// ============ 角色专属事件系统 ============
function checkCharacterEvents() {
    if (!data.events || !data.events.events) return;
    
    const allEvents = data.events.events;
    const characterEvents = allEvents.filter(event => {
        if (event.type !== 'character_event') return false;
        return checkEventTriggerCondition(event);
    });
    
    if (characterEvents.length > 0) {
        const event = characterEvents[Math.floor(Math.random() * characterEvents.length)];
        showEventModal(event);
    }
}

// ============ 连锁事件系统 ============
let chainEventCount = 0;
const MAX_CHAIN_EVENTS = 2;

function checkChainEvents() {
    if (!data.events || !data.events.events) return;
    if (chainEventCount >= MAX_CHAIN_EVENTS) {
        chainEventCount = 0;
        return;
    }
    
    const allEvents = data.events.events;
    const chainEvents = allEvents.filter(event => {
        if (event.type !== 'chain_event') return false;
        return checkEventTriggerCondition(event);
    });
    
    if (chainEvents.length > 0) {
        const event = chainEvents[Math.floor(Math.random() * chainEvents.length)];
        
        if (event.chain_effects) {
            Object.keys(event.chain_effects).forEach(key => {
                const value = event.chain_effects[key];
                switch(key) {
                    case 'morale':
                    case 'satisfaction':
                        gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + value));
                        break;
                    case 'renewalRate':
                        gameState.renewalRate = Math.max(0, Math.min(100, gameState.renewalRate + value));
                        break;
                    case 'dau':
                        gameState.dau = Math.max(0, gameState.dau + value);
                        break;
                    case 'gmv':
                        gameState.gmv = Math.max(0, gameState.gmv + value);
                        break;
                    case 'fame':
                        addFame(value);
                        break;
                    case 'disputeRate':
                        gameState.disputeRate = Math.max(0, Math.min(100, (gameState.disputeRate || 0) + value));
                        break;
                    case 'aisaike':
                        if (gameState.favors) gameState.favors.aisaike = Math.max(0, Math.min(100, gameState.favors.aisaike + value));
                        break;
                    case 'moganna':
                        if (gameState.favors) gameState.favors.moganna = Math.max(0, Math.min(100, gameState.favors.moganna + value));
                        break;
                    case 'xiaokui':
                        if (gameState.favors) gameState.favors.xiaokui = Math.max(0, Math.min(100, gameState.favors.xiaokui + value));
                        break;
                    case 'xinzhu':
                        if (gameState.favors) gameState.favors.xinzhu = Math.max(0, Math.min(100, gameState.favors.xinzhu + value));
                        break;
                }
            });
        }
        
        chainEventCount++;
        showEventModal(event);
    }
}

function resetChainEventCount() {
    chainEventCount = 0;
}

// ============ 事件显示系统 ============
function showEventModal(event) {
    console.log('DEBUG showEventModal: 显示事件', event);
    const modal = document.getElementById('event-modal');
    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-description');
    const optionsEl = document.getElementById('event-options');
    
    if (!modal || !titleEl || !descEl || !optionsEl) {
        console.error('DEBUG showEventModal: 事件模态框元素未找到');
        return;
    }
    
    titleEl.textContent = event.title || '事件';
    descEl.textContent = event.description || '';
    
    optionsEl.innerHTML = '';
    
    if (event.options && event.options.length > 0) {
        event.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'event-option-btn';
            btn.textContent = option.text || `选项 ${index + 1}`;
            btn.onclick = () => {
                handleEventChoice(event, option);
                closeEventModal();
            };
            optionsEl.appendChild(btn);
        });
    } else {
        const btn = document.createElement('button');
        btn.className = 'event-option-btn';
        btn.textContent = '确定';
        btn.onclick = () => {
            closeEventModal();
        };
        optionsEl.appendChild(btn);
    }
    
    modal.style.display = 'flex';
}

function closeEventModal() {
    const modal = document.getElementById('event-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleEventChoice(event, option) {
    console.log('DEBUG handleEventChoice: 处理事件选择', event, option);
    
    if (option.effects) {
        Object.keys(option.effects).forEach(key => {
            const value = option.effects[key];
            switch(key) {
                case 'morale':
                case 'satisfaction':
                    gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + value));
                    break;
                case 'budget':
                    gameState.budget += value;
                    break;
                case 'progress':
                    gameState.progress = Math.max(0, Math.min(100, gameState.progress + value));
                    break;
                case 'fame':
                    if (typeof addFame === 'function') {
                        addFame(value);
                    }
                    break;
                case 'dau':
                    gameState.dau = Math.max(0, gameState.dau + value);
                    break;
                case 'gmv':
                    gameState.gmv = Math.max(0, gameState.gmv + value);
                    break;
                case 'benchmarkClients':
                    gameState.benchmarkClients += value;
                    break;
                case 'renewalRate':
                    gameState.renewalRate = Math.max(0, Math.min(100, gameState.renewalRate + value));
                    break;
                case 'disputeRate':
                    gameState.disputeRate = Math.max(0, Math.min(100, (gameState.disputeRate || 0) + value));
                    break;
                case 'aisaike':
                case 'moganna':
                case 'xiaokui':
                case 'xinzhu':
                    if (gameState.favors) {
                        gameState.favors[key] = Math.max(0, Math.min(100, (gameState.favors[key] || 50) + value));
                    }
                    break;
            }
        });
    }
    
    if (option.budget) {
        gameState.budget += option.budget;
    }
    
    if (option.weekly_effect) {
        showToast(`📢 ${option.weekly_effect}`);
    }
    
    gameState.weeklyLogs.push({
        week: gameState.week,
        event: event.title,
        choice: option.text,
        effect: option.weekly_effect || ''
    });
    
    if (typeof saveGame === 'function') {
        saveGame();
    }
    if (typeof updateUI === 'function') {
        updateUI();
    }
}
