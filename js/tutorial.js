// ============ 新手引导系统 ============

let tutorialData = null;
let currentTutorialStep = null;
let tutorialQueue = [];
let isTutorialActive = false;

async function loadTutorialData() {
    try {
        tutorialData = await fetch('data/tutorial.json').then(r => r.json());
    } catch (error) {
        console.error('Failed to load tutorial data:', error);
    }
}

function startTutorial(direction) {
    if (!tutorialData) return;
    
    isTutorialActive = true;
    
    let tutorialSteps = [];
    
    if (direction === 'tob' && tutorialData.tob_tutorial) {
        tutorialSteps = [...tutorialData.general_tutorial.steps, ...tutorialData.tob_tutorial.steps];
    } else if (direction === 'toc' && tutorialData.toc_tutorial) {
        tutorialSteps = [...tutorialData.general_tutorial.steps, ...tutorialData.toc_tutorial.steps];
    } else if (direction === 'b2c' && tutorialData.b2c_tutorial) {
        tutorialSteps = [...tutorialData.general_tutorial.steps, ...tutorialData.b2c_tutorial.steps];
    }
    
    tutorialSteps.push(...tutorialData.card_tutorial.steps);
    
    tutorialQueue = tutorialSteps;
    
    gameState.tutorialProgress = gameState.tutorialProgress || {};
    gameState.tutorialProgress.currentStep = 0;
    gameState.tutorialProgress.completed = false;
    gameState.tutorialProgress.started = true;
    
    showNextTutorialStep();
}

function showNextTutorialStep() {
    if (tutorialQueue.length === 0) {
        completeTutorial();
        return;
    }
    
    currentTutorialStep = tutorialQueue.shift();
    
    if (shouldSkipStep(currentTutorialStep)) {
        showNextTutorialStep();
        return;
    }
    
    gameState.tutorialProgress.currentStep++;
    
    showTutorialModal(currentTutorialStep);
}

function shouldSkipStep(step) {
    if (!step || !step.trigger_condition) return false;
    
    const condition = step.trigger_condition;
    
    if (condition.week_after && gameState.week > condition.week_after) {
        return false;
    }
    
    if (condition.has_ssr_card && !backpack.some(c => c.rarity === 'SSR')) {
        return true;
    }
    
    if (condition.direction && gameState.direction !== condition.direction) {
        return true;
    }
    
    if (condition.satisfaction_below && gameState.satisfaction >= condition.satisfaction_below) {
        return true;
    }
    
    return false;
}

function showTutorialModal(step) {
    removeTutorialOverlay();
    
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.className = 'tutorial-overlay';
    
    const modal = document.createElement('div');
    modal.id = 'tutorial-modal';
    modal.className = 'tutorial-modal';
    
    const progress = document.createElement('div');
    progress.className = 'tutorial-progress';
    progress.textContent = `${gameState.tutorialProgress.currentStep}/${tutorialQueue.length + gameState.tutorialProgress.currentStep}`;
    
    const title = document.createElement('h3');
    title.className = 'tutorial-title';
    title.textContent = step.title;
    
    const content = document.createElement('div');
    content.className = 'tutorial-content';
    content.innerHTML = step.content.replace(/\n/g, '<br>');
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'tutorial-buttons';
    
    if (step.action === 'continue') {
        const continueBtn = document.createElement('button');
        continueBtn.className = 'tutorial-btn tutorial-btn-primary';
        continueBtn.textContent = '继续';
        continueBtn.onclick = () => {
            removeTutorialOverlay();
            showNextTutorialStep();
        };
        buttonContainer.appendChild(continueBtn);
    } else if (step.action === 'wait_for_choice') {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'tutorial-btn tutorial-btn-primary';
            continueBtn.textContent = '我知道了';
            continueBtn.onclick = () => {
                removeTutorialOverlay();
                showNextTutorialStep();
            };
            buttonContainer.appendChild(continueBtn);
            
            const skipBtn = document.createElement('button');
            skipBtn.className = 'tutorial-btn tutorial-btn-secondary';
            skipBtn.textContent = '跳过引导';
            skipBtn.onclick = () => {
                removeTutorialOverlay();
                completeTutorial();
            };
            buttonContainer.appendChild(skipBtn);
        } else if (step.action === 'wait_for_event') {
        const laterBtn = document.createElement('button');
        laterBtn.className = 'tutorial-btn tutorial-btn-secondary';
        laterBtn.textContent = '稍后再说';
        laterBtn.onclick = () => {
            removeTutorialOverlay();
            tutorialQueue = [];
            completeTutorial();
        };
        buttonContainer.appendChild(laterBtn);
    } else if (step.action === 'complete') {
        const finishBtn = document.createElement('button');
        finishBtn.className = 'tutorial-btn tutorial-btn-primary';
        finishBtn.textContent = '开始游戏！';
        finishBtn.onclick = () => {
            removeTutorialOverlay();
            completeTutorial();
        };
        buttonContainer.appendChild(finishBtn);
    }
    
    modal.appendChild(progress);
    modal.appendChild(title);
    modal.appendChild(content);
    modal.appendChild(buttonContainer);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    if (step.highlight_element) {
        highlightElement(step.highlight_element);
    }
}

function highlightElement(selector) {
    try {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (e) {
        console.warn('Tutorial highlight element not found:', selector);
    }
}

function removeTutorialOverlay() {
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
}

function completeTutorial() {
    isTutorialActive = false;
    tutorialQueue = [];
    currentTutorialStep = null;
    
    gameState.tutorialProgress = gameState.tutorialProgress || {};
    gameState.tutorialProgress.completed = true;
    gameState.tutorialProgress.completedAt = Date.now();
    
    showToast('🎉 新手引导完成！祝您游戏愉快！');
    
    if (typeof saveGame === 'function') {
        saveGame();
    }
}

function showQuickGuide() {
    if (!tutorialData || !tutorialData.quick_guide) return;
    
    const modal = document.createElement('div');
    modal.id = 'quick-guide-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content quick-guide-content">
            <span class="close-modal" onclick="closeQuickGuide()">×</span>
            <h2>❓ 常见问题</h2>
            <div class="quick-guide-list">
                ${tutorialData.quick_guide.items.map(item => `
                    <div class="quick-guide-item" onclick="toggleQuickGuideAnswer('${item.id}')">
                        <div class="quick-guide-question">
                            ${item.icon} ${item.title}
                            <span class="toggle-icon">▼</span>
                        </div>
                        <div class="quick-guide-answer" id="answer-${item.id}">
                            ${item.answer}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeQuickGuide() {
    const modal = document.getElementById('quick-guide-modal');
    if (modal) {
        modal.remove();
    }
}

function toggleQuickGuideAnswer(id) {
    const answer = document.getElementById(`answer-${id}`);
    if (answer) {
        answer.classList.toggle('expanded');
    }
}

function showTip(tip) {
    if (!tip) return;
    
    const existingTip = document.getElementById('game-tip');
    if (existingTip) {
        existingTip.remove();
    }
    
    const tipElement = document.createElement('div');
    tipElement.id = 'game-tip';
    tipElement.className = 'game-tip';
    tipElement.innerHTML = tip.content;
    
    document.body.appendChild(tipElement);
    
    setTimeout(() => {
        tipElement.classList.add('fade-out');
        setTimeout(() => {
            tipElement.remove();
        }, 1000);
    }, 5000);
}

function checkAndShowTips() {
    if (!tutorialData || !tutorialData.tip_system || !tutorialData.tip_system.enabled) return;
    if (!tutorialData.tip_system.tips) return;
    
    const tips = tutorialData.tip_system.tips;
    
    tips.forEach(tip => {
        if (shouldShowTip(tip)) {
            showTip(tip);
        }
    });
}

function shouldShowTip(tip) {
    if (!tip || !tip.trigger_condition) return false;
    
    const condition = tip.trigger_condition;
    
    if (condition.week && gameState.week !== condition.week) return false;
    
    if (condition.week_after && gameState.week <= condition.week_after) return false;
    
    if (condition.satisfaction_below && gameState.satisfaction >= condition.satisfaction_below) return false;
    
    if (condition.has_debt && gameState.debt <= 0) return false;
    
    if (condition.has_ssr_card && !backpack.some(c => c.rarity === 'SSR')) return false;
    
    if (condition.direction && gameState.direction !== condition.direction) return false;
    
    if (gameState.shownTips && gameState.shownTips.includes(tip.id)) return false;
    
    return true;
}

function markTipAsShown(tipId) {
    if (!gameState.shownTips) {
        gameState.shownTips = [];
    }
    gameState.shownTips.push(tipId);
}

function isTutorialCompleted() {
    return gameState.tutorialProgress && gameState.tutorialProgress.completed;
}

function isTutorialActiveNow() {
    return isTutorialActive;
}

function getTutorialProgress() {
    return gameState.tutorialProgress || { currentStep: 0, completed: false };
}

window.addEventListener('DOMContentLoaded', loadTutorialData);
