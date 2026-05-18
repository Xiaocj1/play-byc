// ============ 平衡系统模块 ============

let balanceConfig = null;

async function loadBalanceData() {
    try {
        const response = await fetch('data/balance.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        balanceConfig = await response.json();
        console.log('Balance configuration loaded successfully');
        return balanceConfig;
    } catch (error) {
        console.error('Failed to load balance configuration:', error);
        balanceConfig = getDefaultBalanceConfig();
        return balanceConfig;
    }
}

function getDefaultBalanceConfig() {
    return {
        progress_balance: {
            base_progress: 3,
            adjustments: {
                high_morale: {satisfaction_threshold: 80, event_count: 2, multiplier: 1.5},
                normal: {satisfaction_threshold: 40, event_count: 3, multiplier: 1.0},
                low_morale: {satisfaction_threshold: 0, event_count: 4, multiplier: 0.8}
            }
        },
        card_balance: {
            durability: {
                R: {initial: 10, fragments_on_destroy: 1, exchange_cost: 50},
                SR: {initial: 8, fragments_on_destroy: 3, exchange_cost: 100},
                SSR: {initial: 5, fragments_on_destroy: 10, exchange_cost: 300}
            }
        },
        financial_balance: {
            base_weekly_cost: 5,
            debt_limits: {
                high_fame: {threshold: 80, limit: 200},
                medium_high_fame: {threshold: 60, limit: 150},
                medium_fame: {threshold: 40, limit: 100},
                medium_low_fame: {threshold: 20, limit: 50},
                low_fame: {threshold: 0, limit: 20}
            },
            interest_rates: {
                high_fame: {threshold: 80, rate: 0.02},
                medium_high_fame: {threshold: 60, rate: 0.03},
                medium_fame: {threshold: 40, rate: 0.05},
                medium_low_fame: {threshold: 20, rate: 0.08},
                low_fame: {threshold: 0, rate: 0.15}
            }
        },
        kpi_weights: {
            tob: {
                satisfaction: 0.3,
                progress: 0.25,
                core_kpi: 0.25,
                fame: 0.1,
                budget: 0.1
            },
            toc: {
                satisfaction: 0.25,
                progress: 0.2,
                core_kpi: 0.3,
                fame: 0.15,
                budget: 0.1
            },
            b2c: {
                satisfaction: 0.2,
                progress: 0.2,
                core_kpi: 0.35,
                fame: 0.15,
                budget: 0.1
            }
        },
        victory_conditions: {
            tob: {
                progress: 100,
                satisfaction: 80,
                renewal_rate: 80,
                benchmark_clients: 3,
                fame: 70
            },
            toc: {
                progress: 100,
                satisfaction: 80,
                dau: 100,
                fame: 70
            },
            b2c: {
                progress: 100,
                satisfaction: 80,
                gmv: 100,
                merchant_count: 500,
                fame: 70
            }
        }
    };
}

function getBalanceConfig() {
    return balanceConfig || getDefaultBalanceConfig();
}

function getWeeklyEventCount() {
    const satisfaction = gameState.satisfaction;
    const baseProgress = 3;
    
    if (satisfaction >= 80) return { count: 2, multiplier: 1.5, baseProgress };
    if (satisfaction <= 40) return { count: 4, multiplier: 0.8, baseProgress };
    return { count: 3, multiplier: 1.0, baseProgress };
}

function getDirectionValue(condition) {
    switch(condition) {
        case 'clients':
            return gameState.benchmarkClients || 0;
        case 'dau':
            return gameState.dau || 0;
        case 'gmv':
            return gameState.gmv || 0;
        case 'satisfaction':
            return gameState.satisfaction || 0;
        case 'fame':
            return gameState.fame || 0;
        case 'progress':
            return gameState.progress || 0;
        default:
            return 0;
    }
}

function checkDirectionHCMilestones(currentHC) {
    const direction = gameState.direction;
    if (!direction) return 0;
    
    const directionMilestones = cardsData && cardsData.direction_hc_milestones && cardsData.direction_hc_milestones[direction];
    if (!directionMilestones) return 0;
    
    let bonus = 0;
    directionMilestones.forEach(m => {
        const value = getDirectionValue(m.condition);
        if (value >= m.threshold) {
            bonus += m.hc_bonus;
        }
    });
    
    return bonus;
}

function checkHCMilestones() {
    const totalAssets = gameState.totalAssets || (gameState.budget - gameState.debt);
    const currentHC = typeof hc !== 'undefined' ? hc : 3;
    
    const milestones = cardsData && cardsData.hc_milestones ? cardsData.hc_milestones : [
        { asset_threshold: 200, hc_bonus: 1 },
        { asset_threshold: 500, hc_bonus: 1 },
        { asset_threshold: 1000, hc_bonus: 1 },
        { asset_threshold: 2000, hc_bonus: 1 },
        { asset_threshold: 5000, hc_bonus: 1 }
    ];
    
    const initialHC = cardsData && cardsData.initial_hc ? cardsData.initial_hc : 3;
    const maxHCLimit = cardsData && cardsData.max_hc ? cardsData.max_hc : 8;
    
    let maxHC = initialHC;
    milestones.forEach(m => {
        if (totalAssets >= m.asset_threshold) {
            maxHC += m.hc_bonus;
        }
    });
    
    const directionBonus = checkDirectionHCMilestones(currentHC);
    maxHC += directionBonus;
    
    maxHC = Math.min(maxHC, maxHCLimit);
    
    if (typeof addHC === 'function' && maxHC > currentHC) {
        const diff = maxHC - currentHC;
        for (let i = 0; i < diff; i++) {
            addHC(1);
        }
        showToast(`🎉 HC达到里程碑！HC +${diff}`);
    }
}

function getDrawCostMultiplier() {
    const fame = gameState.fame;
    if (fame >= 80) return 0.7;
    if (fame >= 60) return 0.9;
    if (fame >= 40) return 1.0;
    if (fame >= 20) return 1.2;
    return 1.5;
}

function getDebtLimit() {
    const fame = gameState.fame;
    if (fame >= 80) return 200;
    if (fame >= 60) return 150;
    if (fame >= 40) return 100;
    if (fame >= 20) return 50;
    return 20;
}

function getInterestRate() {
    const fame = gameState.fame;
    if (fame >= 80) return 0.02;
    if (fame >= 60) return 0.03;
    if (fame >= 40) return 0.05;
    if (fame >= 20) return 0.08;
    return 0.15;
}

function calculateInterest() {
    const rate = getInterestRate();
    const interest = Math.round(gameState.debt * rate);
    if (interest > 0) {
        gameState.budget -= interest;
        if (interest > 0) {
            showToast(`💰 利息支出: ${interest}万 (利率${(rate * 100).toFixed(0)}%)`);
        }
    }
    return interest;
}

function getCoreKPI() {
    const direction = gameState.direction;
    if (direction === 'tob') {
        return Math.min(gameState.benchmarkClients || 0, 100);
    } else if (direction === 'toc') {
        return Math.min(gameState.dau || 0, 100);
    } else if (direction === 'b2c') {
        return Math.min(gameState.gmv || 0, 100);
    }
    return 0;
}

function calculateKPIScore() {
    const config = getBalanceConfig();
    const direction = gameState.direction;
    if (!config.kpi_weights || !config.kpi_weights[direction]) {
        return 0;
    }
    
    const weights = config.kpi_weights[direction];
    
    // 标准化各指标到0-100范围
    const normalizedSatisfaction = Math.max(0, Math.min(100, gameState.satisfaction || 0));
    const normalizedProgress = Math.max(0, Math.min(100, gameState.progress || 0));
    const normalizedCoreKPI = Math.max(0, Math.min(100, getCoreKPI()));
    const normalizedFame = Math.max(0, Math.min(100, gameState.fame || 0));
    const normalizedBudget = (gameState.budget > 0) ? 100 : 0;
    
    // 计算加权分数
    const score = 
        normalizedSatisfaction * weights.satisfaction +
        normalizedProgress * weights.progress +
        normalizedCoreKPI * weights.core_kpi +
        normalizedFame * weights.fame +
        normalizedBudget * weights.budget;
    
    return Math.round(score);
}
