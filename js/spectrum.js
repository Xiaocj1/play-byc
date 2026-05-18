// ============ 光谱系统模块 ============

function getProfessionalSpectrum(card) {
    if (!card || !cardsData || !cardsData.spectrum_info) return null;
    const spectrum = card.spectrum || card.functional_spectrum;
    return cardsData.spectrum_info[spectrum] || null;
}

function getCardFunctionalSpectrum(card) {
    if (!card) return null;
    if (card.functional_spectrum) return card.functional_spectrum;
    if (!cardsData || !cardsData.spectrum_info) return null;
    const info = cardsData.spectrum_info[card.spectrum];
    return info ? info.functional : null;
}

function getSpectrumSynergyBonus(professionalCards, functionalCards) {
    if (!professionalCards || professionalCards.length === 0) return 1.0;
    
    let multiplier = 1.0;
    const synergies = [];
    
    professionalCards.forEach(pc => {
        const pcFunctional = getCardFunctionalSpectrum(pc);
        if (pcFunctional) {
            const matchingFunctional = functionalCards.find(fc => fc.spectrum === pcFunctional);
            if (matchingFunctional) {
                synergies.push({ type: 'professional', from: pc.name, to: matchingFunctional.name, multiplier: 1.5 });
            }
        }
    });
    
    if (synergies.length > 0) {
        synergies.forEach(s => {
            multiplier *= s.multiplier;
        });
    }
    
    const spectrumCounts = {};
    functionalCards.forEach(c => {
        spectrumCounts[c.spectrum] = (spectrumCounts[c.spectrum] || 0) + 1;
    });
    
    Object.values(spectrumCounts).forEach(count => {
        if (count >= 2) {
            multiplier *= 1.5;
            synergies.push({ type: 'functional', count, multiplier: 1.5 });
        }
    });
    
    const uniqueFunctionalSpectrums = new Set(functionalCards.map(c => c.spectrum));
    if (uniqueFunctionalSpectrums.size >= 4) {
        multiplier *= 2.0;
        synergies.push({ type: 'cross-spectrum', count: uniqueFunctionalSpectrums.size, multiplier: 2.0 });
    }
    
    const positionCounts = {};
    professionalCards.forEach(c => {
        positionCounts[c.position] = (positionCounts[c.position] || 0) + 1;
    });
    
    Object.entries(positionCounts).forEach(([position, count]) => {
        if (count >= 2) {
            multiplier *= 2.0;
            synergies.push({ type: 'mastery', position, count, multiplier: 2.0 });
        }
    });
    
    return { multiplier: Math.min(multiplier, 4.0), synergies };
}

function getSynergyDetails(professionalCards, functionalCards) {
    const result = getSpectrumSynergyBonus(professionalCards, functionalCards);
    return result.synergies.length > 0 ? result.synergies : null;
}

function showSynergyNotification(type, multiplier, details) {
    const notification = document.createElement('div');
    notification.className = `synergy-notification ${type}`;
    
    let text = '';
    switch(type) {
        case 'professional':
            text = `🌉 职业协同触发！${details.from} + ${details.to} = 效果 ×${multiplier.toFixed(1)}`;
            break;
        case 'functional':
            text = `🌀 功能协同触发！×${multiplier.toFixed(1)}`;
            break;
        case 'cross-spectrum':
            text = `🌈 跨光谱组合！×${multiplier.toFixed(1)}`;
            break;
        case 'mastery':
            text = `⭐ 职业专精！${details.position}职业 = 效果 ×${multiplier.toFixed(1)}`;
            break;
        default:
            text = `协同效果 ×${multiplier.toFixed(1)}`;
    }
    
    notification.innerHTML = text;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function applySpectrumEffects(professionalCards, functionalCards, element) {
    if (!element) return;
    
    const result = getSpectrumSynergyBonus(professionalCards, functionalCards);
    if (!result.synergies || result.synergies.length === 0) return;
    
    result.synergies.forEach(synergy => {
        let className = '';
        switch(synergy.type) {
            case 'professional':
                className = 'synergy-professional-active';
                break;
            case 'functional':
                className = 'synergy-functional-active';
                break;
            case 'cross-spectrum':
                className = 'synergy-cross-spectrum-active';
                break;
            case 'mastery':
                className = 'synergy-mastery-active';
                break;
        }
        
        if (className) {
            element.classList.add(className);
        }
        
        showSynergyNotification(synergy.type, synergy.multiplier, synergy);
    });
    
    setTimeout(() => {
        element.classList.remove(
            'synergy-professional-active',
            'synergy-functional-active',
            'synergy-cross-spectrum-active',
            'synergy-mastery-active'
        );
    }, 5000);
}

function getCardByInstanceId(instanceId) {
    return backpack.find(c => c.instanceId === instanceId);
}

function getProfessionalCards() {
    return backpack.filter(c => c.position && ['RD', 'QA', 'Design', 'Operation'].includes(c.position));
}

function getFunctionalCards() {
    if (negotiationCardsData && negotiationCardsData.cards) {
        return negotiationCardsData.cards.filter(c => 
            ['fund', 'traffic', 'tech', 'special'].includes(c.spectrum)
        );
    }
    return [];
}
