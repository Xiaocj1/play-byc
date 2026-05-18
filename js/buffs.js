// ============ Buff系统模块 ============

let buffsData = null;

async function loadBuffsData() {
    try {
        buffsData = await fetch('data/buffs.json').then(r => r.json());
    } catch (error) {
        console.error('Failed to load buffs data:', error);
    }
}

function checkSeasonBuffs() {
    if (!buffsData) return;
    
    const currentQuarter = getCurrentQuarter();
    const season = `Q${currentQuarter}`;
    
    buffsData.buffs.forEach(buff => {
        if (!buff.season || buff.season !== season) return;
        if (!buff.character) return;
        
        const hasBuff = gameState.characterBuffs[buff.character]?.some(b => b.buffId === buff.id);
        if (!hasBuff) {
            addBuffToCharacter(buff.character, buff.id);
            const character = data.characters.characters.find(c => c.id === buff.character);
            showToast(`🍃 ${character?.name || buff.character}获得季节效果: ${buff.name}`);
        }
    });
}

function checkHolidayBuffs() {
    if (!buffsData) return;
    
    const week = gameState.week;
    
    buffsData.buffs.forEach(buff => {
        if (!buff.holiday || buff.week !== week) return;
        
        applyBuffEffect(buff);
        
        if (buff.cost_effect) {
            applyBuffEffect(buff.cost_effect);
        }
        
        if (buff.special_effect === 'no_base_cost') {
            gameState.noBaseCostThisWeek = true;
        }
        
        showToast(`🎊 ${buff.name}: ${buff.description}`);
    });
}

function applyBuffEffect(buffOrEffect) {
    const effect = buffOrEffect.effect || buffOrEffect;
    if (!effect) return;
    
    switch(effect.type) {
        case 'progress':
            gameState.progress = Math.max(0, Math.min(100, gameState.progress + effect.value));
            break;
        case 'satisfaction':
            gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + effect.value));
            break;
        case 'morale':
            gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + effect.value));
            break;
        case 'budget':
            gameState.budget += effect.value;
            break;
        case 'satisfaction_random':
            const randomValue = Math.random() > 0.5 ? effect.value : -effect.value;
            gameState.satisfaction = Math.max(0, Math.min(100, gameState.satisfaction + randomValue));
            break;
    }
}

function updateCharacterBuffs() {
    if (!gameState.characterBuffs) {
        gameState.characterBuffs = {};
    }
    
    const characters = data.characters.characters;
    characters.forEach(char => {
        if (!gameState.characterBuffs[char.id]) {
            gameState.characterBuffs[char.id] = [];
        }
        
        gameState.characterBuffs[char.id] = gameState.characterBuffs[char.id].filter(buff => {
            if (buff.duration > 0) {
                buff.duration--;
                return true;
            }
            return false;
        });
    });
}

function addBuffToCharacter(characterId, buffId) {
    if (!buffsData) return;
    
    if (!gameState.characterBuffs) {
        gameState.characterBuffs = {};
    }
    if (!gameState.characterBuffs[characterId]) {
        gameState.characterBuffs[characterId] = [];
    }
    
    const buff = buffsData.buffs.find(b => b.id === buffId);
    if (!buff) return;
    
    const maxBuffs = buffsData.buff_rules?.max_buffs_per_character || 3;
    if (gameState.characterBuffs[characterId].length >= maxBuffs) {
        gameState.characterBuffs[characterId].shift();
    }
    
    const newBuff = {
        buffId: buff.id,
        name: buff.name,
        type: buff.type,
        effect: buff.effect,
        duration: buff.effect?.duration || 1,
        startWeek: gameState.week
    };
    
    gameState.characterBuffs[characterId].push(newBuff);
}

function removeBuffFromCharacter(characterId, buffId) {
    if (!gameState.characterBuffs || !gameState.characterBuffs[characterId]) return;
    
    gameState.characterBuffs[characterId] = gameState.characterBuffs[characterId].filter(
        buff => buff.buffId !== buffId
    );
}

function getCharacterActiveBuffs(characterId) {
    if (!gameState.characterBuffs || !gameState.characterBuffs[characterId]) return [];
    return gameState.characterBuffs[characterId].filter(buff => buff.duration > 0);
}

function applyCharacterBuffEffects() {
    if (!gameState.characterBuffs) return;
    
    Object.keys(gameState.characterBuffs).forEach(characterId => {
        const buffs = getCharacterActiveBuffs(characterId);
        buffs.forEach(buff => {
            if (buff.effect) {
                applyBuffEffect(buff);
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', loadBuffsData);
