const PRODUCTS_KEY = "fair_office_unlocked_products";
const ENDINGS_GALLERY_KEY = "fair_office_unlocked_endings_gallery";
const REAL_FAILED_PRODUCTS_KEY = "fair_office_unlocked_real_failed_products";
const GAME_STORAGE_KEY = "fair_office_game_state";

let productsData = { products: [] };
let endingsGalleryData = { endings: [] };
let realFailedProductsData = null;
let unlockedProducts = [];
let unlockedEndingsGallery = [];
let unlockedRealFailedProducts = [];
let currentGameStats = null;

function loadProductsData() {
    return fetch('data/products.json')
        .then(r => r.json())
        .then(data => {
            productsData = data;
            loadUnlockedProducts();
        });
}

function loadEndingsGalleryData() {
    return fetch('data/ending_gallery.json')
        .then(r => r.json())
        .then(data => {
            endingsGalleryData = data;
            loadUnlockedEndingsGallery();
        });
}

function loadUnlockedEndingsGallery() {
    const saved = localStorage.getItem(ENDINGS_GALLERY_KEY);
    if (saved) {
        unlockedEndingsGallery = JSON.parse(saved);
    }
}

function saveUnlockedEndingsGallery() {
    localStorage.setItem(ENDINGS_GALLERY_KEY, JSON.stringify(unlockedEndingsGallery));
}

function isEndingGalleryUnlocked(endingId) {
    return unlockedEndingsGallery.some(e => e.id === endingId);
}

function unlockEndingGallery(endingId, reason) {
    if (isEndingGalleryUnlocked(endingId)) return false;
    
    const ending = endingsGalleryData.endings.find(e => e.id === endingId);
    if (!ending) return false;
    
    unlockedEndingsGallery.push({
        id: ending.id,
        unlockTime: Date.now(),
        reason: reason || '达成解锁条件'
    });
    saveUnlockedEndingsGallery();
    return true;
}

function loadUnlockedProducts() {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    if (saved) {
        unlockedProducts = JSON.parse(saved);
    }
}

function saveUnlockedProducts() {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(unlockedProducts));
}

function isProductUnlocked(productId) {
    return unlockedProducts.some(p => p.id === productId);
}

function unlockProduct(productId, reason) {
    if (isProductUnlocked(productId)) return false;
    
    const product = productsData.products.find(p => p.id === productId);
    if (!product) return false;
    
    unlockedProducts.push({
        id: product.id,
        unlockTime: Date.now(),
        reason: reason || '达成解锁条件'
    });
    saveUnlockedProducts();
    return true;
}

function filterProducts(products, direction, status, productType) {
    let filtered = products;
    
    if (direction !== 'all') {
        filtered = filtered.filter(p => p.direction === direction);
    }
    
    if (status === 'unlocked') {
        filtered = filtered.filter(p => isProductUnlocked(p.id));
    } else if (status === 'locked') {
        filtered = filtered.filter(p => !isProductUnlocked(p.id));
    }
    
    return filtered;
}

function filterRealFailedProducts(products, direction, status) {
    let filtered = products;
    
    if (status === 'unlocked') {
        filtered = filtered.filter(p => isRealFailedProductUnlocked(p.id));
    } else if (status === 'locked') {
        filtered = filtered.filter(p => !isRealFailedProductUnlocked(p.id));
    }
    
    return filtered;
}

function filterEndings(endings, direction, status) {
    let filtered = endings;
    
    if (direction !== 'all') {
        filtered = filtered.filter(e => e.direction === direction || e.direction === 'all');
    }
    
    if (status === 'unlocked') {
        filtered = filtered.filter(e => isEndingGalleryUnlocked(e.id));
    } else if (status === 'locked') {
        filtered = filtered.filter(e => !isEndingGalleryUnlocked(e.id));
    }
    
    return filtered;
}

function showMuseumModal() {
    const modal = document.getElementById('museum-modal');
    if (!modal) return;
    
    const loadProducts = productsData.products.length === 0 ? loadProductsData() : Promise.resolve();
    const loadEndings = endingsGalleryData.endings.length === 0 ? loadEndingsGalleryData() : Promise.resolve();
    const loadRealFailed = !realFailedProductsData ? loadRealFailedProductsData() : Promise.resolve();
    
    Promise.all([loadProducts, loadEndings, loadRealFailed]).then(() => {
        currentFilter = { type: 'products', direction: 'all', status: 'all', productType: 'all' };
        renderMuseumTabs('products');
        modal.style.display = 'flex';
    });
}

function closeMuseumModal() {
    const modal = document.getElementById('museum-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

let currentFilter = {
    type: 'products',
    direction: 'all',
    status: 'all',
    productType: 'all'
};

function renderMuseumTabs(filterType) {
    const tabs = document.getElementById('museum-tabs');
    if (!tabs) return;
    
    if (filterType) {
        if (filterType === 'products' || filterType === 'endings') {
            currentFilter.type = filterType;
        } else if (['all', 'toc', 'tob', 'b2c'].includes(filterType)) {
            currentFilter.direction = filterType;
        } else if (['all', 'unlocked', 'locked'].includes(filterType)) {
            currentFilter.status = filterType;
        } else if (['all', 'success', 'failed'].includes(filterType)) {
            currentFilter.productType = filterType;
        }
    }
    
    const { type, direction, status, productType } = currentFilter;
    
    const typeHTML = `
        <div class="museum-tab-row">
            <span class="filter-label">类型：</span>
            <div class="museum-tab-group">
                <button class="museum-tab ${type === 'products' ? 'active' : ''}" onclick="renderMuseumTabs('products')">📦 产品图鉴</button>
                <button class="museum-tab ${type === 'endings' ? 'active' : ''}" onclick="renderMuseumTabs('endings')">🎭 结局图鉴</button>
            </div>
        </div>
    `;
    
    let productTypeHTML = '';
    if (type === 'products') {
        productTypeHTML = `
            <div class="museum-tab-row">
                <span class="filter-label">产品：</span>
                <div class="museum-tab-group">
                    <button class="museum-tab small ${productType === 'all' ? 'active' : ''}" onclick="renderMuseumTabs('all')">全部</button>
                    <button class="museum-tab small ${productType === 'success' ? 'active' : ''}" onclick="renderMuseumTabs('success')">🚀 成功产品</button>
                    <button class="museum-tab small ${productType === 'failed' ? 'active' : ''}" onclick="renderMuseumTabs('failed')">💔 真实失败产品</button>
                </div>
            </div>
        `;
    }
    
    let directionHTML = '';
    if (type === 'products' || type === 'endings') {
        directionHTML = `
            <div class="museum-tab-row">
                <span class="filter-label">方向：</span>
                <div class="museum-tab-group">
                    <button class="museum-tab small ${direction === 'all' ? 'active' : ''}" onclick="renderMuseumTabs('all')">全部</button>
                    <button class="museum-tab small ${direction === 'toc' ? 'active' : ''}" onclick="renderMuseumTabs('toc')">To C</button>
                    <button class="museum-tab small ${direction === 'tob' ? 'active' : ''}" onclick="renderMuseumTabs('tob')">To B</button>
                    <button class="museum-tab small ${direction === 'b2c' ? 'active' : ''}" onclick="renderMuseumTabs('b2c')">B2C</button>
                </div>
            </div>
        `;
    }
    
    let statusHTML = '';
    if (type === 'products') {
        statusHTML = `
            <div class="museum-tab-row">
                <span class="filter-label">状态：</span>
                <div class="museum-tab-group">
                    <button class="museum-tab small ${status === 'all' ? 'active' : ''}" onclick="renderMuseumTabs('all')">全部</button>
                    <button class="museum-tab small ${status === 'unlocked' ? 'active' : ''}" onclick="renderMuseumTabs('unlocked')">已解锁</button>
                    <button class="museum-tab small ${status === 'locked' ? 'active' : ''}" onclick="renderMuseumTabs('locked')">未解锁</button>
                </div>
            </div>
        `;
    }
    
    tabs.innerHTML = typeHTML + productTypeHTML + directionHTML + statusHTML;
    
    renderMuseumGrid();
}

function getThresholdDisplayName(key) {
    const names = {
        'renewal_rate': '续约率',
        '客单价': '客单价(万)',
        'on_time_rate': '交付准时率',
        'benchmark_clients': '标杆客户数',
        'dau': 'DAU(万)',
        'user_duration': '用户时长(分钟)',
        'creator_rate': '创作者占比(%)',
        'gmv': 'GMV(亿)',
        'commission_rate': '抽成率(%)',
        'growth_rate': '双边增长率(%)',
        'dispute_rate': '纠纷率(%)',
        'budget': '资金(万)',
        'fame': '名声',
        'satisfaction': '满意度(%)',
        'progress': '进度(%)',
        'avg_favor': '团队好感度(%)'
    };
    return names[key] || key;
}

function getThresholdComparison(key, threshold, actual) {
    const lowerIsBetter = ['dispute_rate'];
    
    if (lowerIsBetter.includes(key)) {
        if (actual <= threshold) {
            return { passed: true, text: `${getThresholdDisplayName(key)}: ${actual} ≤ ${threshold} ✅` };
        } else {
            return { passed: false, text: `${getThresholdDisplayName(key)}: ${actual} > ${threshold} ❌` };
        }
    } else {
        if (actual >= threshold) {
            return { passed: true, text: `${getThresholdDisplayName(key)}: ${actual} ≥ ${threshold} ✅` };
        } else {
            return { passed: false, text: `${getThresholdDisplayName(key)}: ${actual} < ${threshold} ❌` };
        }
    }
}

function showLockedProductHint(productId, productType) {
    const product = productType === 'success' 
        ? productsData.products.find(p => p.id === productId)
        : (realFailedProductsData?.real_failed_products || []).find(p => p.id === productId);
        
    if (!product || !currentGameStats) {
        const toast = document.getElementById('toast-modal');
        const message = document.getElementById('toast-message');
        if (toast && message) {
            message.textContent = `解锁条件：${product?.unlock_condition || product?.fail_reason || '达成指定指标'}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        return;
    }
    
    const thresholds = product.unlock_thresholds || {};
    const results = [];
    let allPassed = true;
    
    for (const [key, threshold] of Object.entries(thresholds)) {
        const actual = currentGameStats[key] || 0;
        const result = getThresholdComparison(key, threshold, actual);
        results.push(result);
        if (!result.passed) allPassed = false;
    }
    
    const toast = document.getElementById('toast-modal');
    const message = document.getElementById('toast-message');
    if (toast && message) {
        if (allPassed) {
            message.innerHTML = `✅ 已达成解锁条件<br><br>` + results.map(r => r.text).join('<br>');
        } else {
            message.innerHTML = `❌ 未达成解锁条件<br><br>` + results.map(r => {
                const color = r.passed ? '#00ff41' : '#ff4444';
                return `<span style="color: ${color}">${r.text}</span>`;
            }).join('<br>');
        }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }
}

function renderMuseumGrid() {
    const grid = document.getElementById('museum-grid');
    if (!grid) return;
    
    const { type, direction, status, productType } = currentFilter;
    
    if (type === 'products') {
        let successProducts = [];
        let failedProducts = [];
        
        if (productType === 'all' || productType === 'success') {
            successProducts = filterProducts(productsData.products, direction, status, productType);
        }
        
        if (productType === 'all' || productType === 'failed') {
            failedProducts = filterRealFailedProducts((realFailedProductsData && realFailedProductsData.real_failed_products) || [], direction, status);
        }
        
        const allProducts = [
            ...successProducts.map(p => ({ ...p, _type: 'success' })),
            ...failedProducts.map(p => ({ ...p, _type: 'failed' }))
        ];
        
        grid.innerHTML = allProducts.map(product => {
            const isSuccess = product._type === 'success';
            const unlocked = isSuccess ? isProductUnlocked(product.id) : isRealFailedProductUnlocked(product.id);
            
            return `
                <div class="museum-card ${unlocked ? '' : 'locked'}" 
                     onclick="${unlocked ? `showProductDetail('${product.id}', '${product._type}')` : `showLockedProductHint('${product.id}', '${product._type}')`}"
                     onmouseenter="${!unlocked ? `showLockedProductHint('${product.id}', '${product._type}')` : ''}">
                    ${unlocked ? `
                        <div class="museum-card-icon">${product.icon}</div>
                        <div class="museum-card-name">${product.name}</div>
                        <div class="museum-card-subname">${product.subname}</div>
                        <div class="museum-card-type ${product._type}">${isSuccess ? '🚀 成功' : '💔 失败'}</div>
                        ${isSuccess ? `<div class="museum-card-direction">${product.direction.toUpperCase()}</div>` : ''}
                    ` : `
                        <div class="museum-card-icon">❓</div>
                        <div class="museum-card-name">？？？</div>
                        <div class="museum-card-condition">悬浮查看解锁条件</div>
                    `}
                </div>
            `;
        }).join('');
        
        if (allProducts.length === 0) {
            grid.innerHTML = '<div class="no-results">暂无符合条件的产品</div>';
        }
    } else if (type === 'endings') {
        const endings = filterEndings(endingsGalleryData.endings || [], direction, status);
        
        grid.innerHTML = endings.map(ending => {
            const unlocked = isEndingGalleryUnlocked(ending.id);
            
            return `
                <div class="museum-card ${unlocked ? '' : 'locked'}" 
                     onclick="${unlocked ? `showEndingDetail('${ending.id}')` : `showLockedEndingHint('${ending.id}')`}"
                     onmouseenter="${!unlocked ? `showLockedEndingHint('${ending.id}')` : ''}">
                    ${unlocked ? `
                        <div class="museum-card-icon">${ending.icon}</div>
                        <div class="museum-card-name">${ending.name}</div>
                        <div class="museum-card-subname">${ending.subname}</div>
                        <div class="museum-card-type ${ending.type}">${ending.type === 'victory' ? '胜利' : '失败'}</div>
                        <div class="museum-card-direction">${ending.direction === 'all' ? '通用' : ending.direction.toUpperCase()}</div>
                    ` : `
                        <div class="museum-card-icon">❓</div>
                        <div class="museum-card-name">？？？</div>
                        <div class="museum-card-condition">达成结局后解锁</div>
                    `}
                </div>
            `;
        }).join('');
        
        if (endings.length === 0) {
            grid.innerHTML = '<div class="no-results">暂无符合条件的结局</div>';
        }
    }
}



function showLockedEndingHint(endingId) {
    const ending = endingsGalleryData.endings.find(e => e.id === endingId);
    if (!ending) return;
    
    const toast = document.getElementById('toast-modal');
    const message = document.getElementById('toast-message');
    if (toast && message) {
        message.innerHTML = `📜 结局类型：${ending.type === 'victory' ? '胜利' : '失败'}<br>🎯 方向：${ending.direction === 'all' ? '通用' : ending.direction.toUpperCase()}<br>💡 ${ending.unlock_desc}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

function showProductDetail(productId, productType) {
    let product;
    let isSuccess = productType === 'success';
    
    if (isSuccess) {
        product = productsData.products.find(p => p.id === productId);
    } else {
        product = (realFailedProductsData?.real_failed_products || []).find(p => p.id === productId);
    }
    
    if (!product) return;
    
    const modal = document.getElementById('museum-detail-modal');
    const content = document.getElementById('museum-detail-content');
    
    if (!modal || !content) return;
    
    const typeLabel = isSuccess ? '🚀 成功产品' : '💔 真实失败产品';
    const typeClass = isSuccess ? 'success' : 'failure';
    
    let detailHTML = `
        <button class="museum-detail-close" onclick="closeMuseumDetailModal()">X</button>
        <div class="museum-detail-header">
            <div class="museum-detail-icon">${product.icon}</div>
            <div class="museum-detail-title">
                <h2>${product.name}</h2>
                <p class="museum-detail-subname">${product.subname}</p>
                <div class="museum-detail-tags">
                    <span class="tag ${typeClass}">${typeLabel}</span>
                    ${isSuccess ? `<span class="tag">📌 ${product.direction.toUpperCase()}</span>` : ''}
                </div>
            </div>
        </div>
        <div class="museum-detail-section">
            <h3>👤 创始人/PM说</h3>
            <blockquote>"${product.founder_quote}"</blockquote>
            <cite>—— ${product.founder_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>🇨🇳 国内用户说</h3>
            <blockquote>"${product.domestic_quote}"</blockquote>
            <cite>—— ${product.domestic_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>🌏 ${isSuccess ? '国外用户' : '国外用户/媒体'}说</h3>
            <blockquote>"${product.international_quote}"</blockquote>
            <cite>—— ${product.international_source}</cite>
        </div>
    `;
    
    if (!isSuccess && product.fail_reason) {
        detailHTML += `
            <div class="museum-detail-section">
                <h3>⚰️ 失败原因</h3>
                <p>${product.fail_reason}</p>
            </div>
        `;
    }
    
    detailHTML += `
        <div class="museum-detail-unlock">
            <h3>📜 图鉴${isSuccess ? '解锁' : '解说'}</h3>
            <p>${product.unlock_desc}</p>
        </div>
    `;
    
    content.innerHTML = detailHTML;
    
    modal.style.display = 'flex';
}

function showEndingDetail(endingId) {
    const ending = endingsGalleryData.endings.find(e => e.id === endingId);
    if (!ending) return;
    
    const modal = document.getElementById('museum-detail-modal');
    const content = document.getElementById('museum-detail-content');
    
    if (!modal || !content) return;
    
    const typeLabel = ending.type === 'victory' ? '🏆 胜利结局' : '💔 失败结局';
    const directionLabel = ending.direction === 'all' ? '通用' : ending.direction.toUpperCase();
    
    content.innerHTML = `
        <button class="museum-detail-close" onclick="closeMuseumDetailModal()">X</button>
        <div class="museum-detail-header">
            <div class="museum-detail-icon">${ending.icon}</div>
            <div class="museum-detail-title">
                <h2>${ending.name}</h2>
                <p class="museum-detail-subname">${ending.subname}</p>
                <div class="museum-detail-tags">
                    <span class="tag ${ending.type}">${typeLabel}</span>
                    <span class="tag">📌 ${directionLabel}</span>
                </div>
            </div>
        </div>
        <div class="museum-detail-section">
            <h3>👤 创始人/PM说</h3>
            <blockquote>"${ending.founder_quote}"</blockquote>
            <cite>—— ${ending.founder_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>🇨🇳 国内用户说</h3>
            <blockquote>"${ending.domestic_quote}"</blockquote>
            <cite>—— ${ending.domestic_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>🌏 国外用户说</h3>
            <blockquote>"${ending.international_quote}"</blockquote>
            <cite>—— ${ending.international_source}</cite>
        </div>
        <div class="museum-detail-unlock">
            <h3>📜 图鉴解锁文案</h3>
            <p>${ending.unlock_desc}</p>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeMuseumDetailModal() {
    const modal = document.getElementById('museum-detail-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function calculateGameStats() {
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (!saved) return null;
    
    const gameState = JSON.parse(saved);
    const direction = gameState.direction;
    const progress = Math.min(gameState.progress || 0, 100);
    const week = gameState.week || 1;
    
    const avgFavor = Object.values(gameState.favors || {}).length > 0
        ? Object.values(gameState.favors).reduce((a, b) => a + b, 0) / Object.values(gameState.favors).length
        : 50;
    
    const satisfaction = gameState.satisfaction || 50;
    
    const stats = {
        direction: direction,
        week: week,
        progress: progress,
        satisfaction: satisfaction,
        avg_favor: avgFavor,
        fame: gameState.fame || 50,
        budget: gameState.budget || 0
    };
    
    if (direction === 'tob') {
        stats.renewal_rate = Math.round((avgFavor * 0.8 + satisfaction * 0.2) * 0.9);
        stats.客单价 = Math.round((gameState.budget / 10) + (week * 0.5));
        stats.on_time_rate = Math.round(progress * 0.85 + satisfaction * 0.1);
        stats.benchmark_clients = Math.floor(week / 12) + 1;
    } else if (direction === 'toc') {
        stats.dau = Math.round((progress * 10) + (week * 2) + (satisfaction * 0.5));
        stats.user_duration = Math.round(15 + (progress * 0.4) + (avgFavor * 0.2));
        stats.creator_rate = Math.round(3 + (avgFavor * 0.1));
    } else if (direction === 'b2c') {
        stats.gmv = Math.round((progress * 0.5) + (week * 0.3) + (satisfaction * 0.1));
        stats.commission_rate = Math.round(2 + (avgFavor * 0.05));
        stats.growth_rate = Math.round((progress * 0.5) + (week * 0.8));
        stats.dispute_rate = Math.round(10 - (satisfaction * 0.08) - (avgFavor * 0.02));
    }
    
    return stats;
}

function checkAndUnlockProducts() {
    const gameStats = calculateGameStats();
    if (!gameStats) return [];
    
    currentGameStats = gameStats;
    
    const direction = gameStats.direction;
    const products = productsData.products.filter(p => p.direction === direction);
    
    let unlockedCount = 0;
    const unlockedList = [];
    
    products.forEach(product => {
        if (isProductUnlocked(product.id)) return;
        
        const thresholds = product.unlock_thresholds || {};
        let allPassed = true;
        
        for (const [key, threshold] of Object.entries(thresholds)) {
            const actual = gameStats[key] || 0;
            const lowerIsBetter = ['dispute_rate'];
            
            if (lowerIsBetter.includes(key)) {
                if (actual > threshold) {
                    allPassed = false;
                    break;
                }
            } else {
                if (actual < threshold) {
                    allPassed = false;
                    break;
                }
            }
        }
        
        if (allPassed) {
            const reason = `游戏结束时达成所有指标`;
            if (unlockProduct(product.id, reason)) {
                unlockedCount++;
                unlockedList.push({
                    id: product.id,
                    name: product.name,
                    icon: product.icon,
                    subname: product.subname,
                    type: 'product'
                });
                console.log(`🎉 产品图鉴解锁: ${product.name}`);
            }
        }
    });
    
    if (unlockedCount > 0) {
        console.log(`本局共解锁 ${unlockedCount} 个产品图鉴`);
    }
    
    return unlockedList;
}

function evaluateProductUnlock(productId) {
    const gameStats = calculateGameStats();
    if (!gameStats) return { unlocked: false, reason: '无游戏数据' };
    
    const product = productsData.products.find(p => p.id === productId);
    if (!product) return { unlocked: false, reason: '产品不存在' };
    
    if (isProductUnlocked(productId)) {
        return { unlocked: true, reason: '已解锁' };
    }
    
    if (product.direction !== gameStats.direction) {
        return { unlocked: false, reason: '路线不匹配' };
    }
    
    const thresholds = product.unlock_thresholds || {};
    const failedConditions = [];
    
    for (const [key, threshold] of Object.entries(thresholds)) {
        const actual = gameStats[key] || 0;
        const lowerIsBetter = ['dispute_rate'];
        
        let passed;
        if (lowerIsBetter.includes(key)) {
            passed = actual <= threshold;
        } else {
            passed = actual >= threshold;
        }
        
        if (!passed) {
            failedConditions.push({
                name: getThresholdDisplayName(key),
                required: threshold,
                actual: actual,
                passed: false
            });
        }
    }
    
    if (failedConditions.length === 0) {
        return { 
            unlocked: true, 
            reason: '已达成所有条件',
            stats: gameStats 
        };
    } else {
        return { 
            unlocked: false, 
            reason: '未达成条件',
            failedConditions: failedConditions,
            stats: gameStats 
        };
    }
}

function loadRealFailedProductsData() {
    return fetch('data/real_failed_products.json')
        .then(r => r.json())
        .then(data => {
            realFailedProductsData = data;
            loadUnlockedRealFailedProducts();
        })
        .catch(err => {
            console.error('加载真实失败产品数据失败:', err);
            realFailedProductsData = { real_failed_products: [] };
        });
}

function unlockAllRealFailedProducts() {
    const allProducts = realFailedProductsData.real_failed_products || [];
    allProducts.forEach(product => {
        if (!isRealFailedProductUnlocked(product.id)) {
            unlockedRealFailedProducts.push({
                id: product.id,
                unlockTime: Date.now(),
                reason: '真实历史案例'
            });
        }
    });
    saveUnlockedRealFailedProducts();
}

function loadUnlockedRealFailedProducts() {
    const saved = localStorage.getItem(REAL_FAILED_PRODUCTS_KEY);
    if (saved) {
        unlockedRealFailedProducts = JSON.parse(saved);
    } else {
        // 首次加载，初始为空数组，需要条件触发后才解锁
        unlockedRealFailedProducts = [];
    }
}

function saveUnlockedRealFailedProducts() {
    localStorage.setItem(REAL_FAILED_PRODUCTS_KEY, JSON.stringify(unlockedRealFailedProducts));
}

function isRealFailedProductUnlocked(productId) {
    return unlockedRealFailedProducts.some(p => p.id === productId);
}

function unlockRealFailedProduct(productId, reason) {
    if (isRealFailedProductUnlocked(productId)) return false;
    
    const product = realFailedProductsData.real_failed_products.find(p => p.id === productId);
    if (!product) return false;
    
    unlockedRealFailedProducts.push({
        id: product.id,
        unlockTime: Date.now(),
        reason: reason || '达成解锁条件'
    });
    saveUnlockedRealFailedProducts();
    return true;
}

function showLockedRealFailedProductHint(productId) {
    const product = realFailedProductsData.real_failed_products.find(p => p.id === productId);
    if (!product || !currentGameStats) {
        const toast = document.getElementById('toast-modal');
        const message = document.getElementById('toast-message');
        if (toast && message) {
            message.textContent = `解锁条件：${product?.fail_reason || '达成指定指标'}`;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        return;
    }
    
    const thresholds = product.unlock_thresholds || {};
    const results = [];
    let allPassed = true;
    
    for (const [key, threshold] of Object.entries(thresholds)) {
        const actual = currentGameStats[key] || 0;
        const result = getThresholdComparison(key, threshold, actual);
        results.push(result);
        if (!result.passed) allPassed = false;
    }
    
    const toast = document.getElementById('toast-modal');
    const message = document.getElementById('toast-message');
    if (toast && message) {
        if (allPassed) {
            message.innerHTML = `✅ 已达成解锁条件<br><br>` + results.map(r => r.text).join('<br>');
        } else {
            message.innerHTML = `❌ 未达成解锁条件<br><br>` + results.map(r => {
                const color = r.passed ? '#00ff41' : '#ff4444';
                return `<span style="color: ${color}">${r.text}</span>`;
            }).join('<br>');
        }
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }
}

function checkAndUnlockRealFailedProducts() {
    const gameStats = calculateGameStats();
    if (!gameStats) return [];
    
    currentGameStats = gameStats;
    
    const products = (realFailedProductsData && realFailedProductsData.real_failed_products) || [];
    let unlockedCount = 0;
    const unlockedList = [];
    
    products.forEach(product => {
        if (isRealFailedProductUnlocked(product.id)) return;
        
        const thresholds = product.unlock_thresholds || {};
        let allPassed = true;
        
        for (const [key, threshold] of Object.entries(thresholds)) {
            const actual = gameStats[key] || 0;
            const lowerIsBetter = ['dispute_rate'];
            
            if (lowerIsBetter.includes(key)) {
                if (actual > threshold) {
                    allPassed = false;
                    break;
                }
            } else {
                if (actual < threshold) {
                    allPassed = false;
                    break;
                }
            }
        }
        
        if (allPassed) {
            const reason = `达成失败指标`;
            if (unlockRealFailedProduct(product.id, reason)) {
                unlockedCount++;
                unlockedList.push({
                    id: product.id,
                    name: product.name,
                    icon: product.icon,
                    subname: product.subname,
                    type: 'real_failed'
                });
                console.log(`💔 真实失败产品解锁: ${product.name}`);
            }
        }
    });
    
    if (unlockedCount > 0) {
        console.log(`本局共解锁 ${unlockedCount} 个真实失败产品`);
    }
    
    return unlockedList;
}

function evaluateRealFailedProductUnlock(productId) {
    const gameStats = calculateGameStats();
    if (!gameStats) return { unlocked: false, reason: '无游戏数据' };
    
    const product = realFailedProductsData.real_failed_products.find(p => p.id === productId);
    if (!product) return { unlocked: false, reason: '产品不存在' };
    
    if (isRealFailedProductUnlocked(productId)) {
        return { unlocked: true, reason: '已解锁' };
    }
    
    const thresholds = product.unlock_thresholds || {};
    const failedConditions = [];
    
    for (const [key, threshold] of Object.entries(thresholds)) {
        const actual = gameStats[key] || 0;
        const lowerIsBetter = ['dispute_rate'];
        
        let passed;
        if (lowerIsBetter.includes(key)) {
            passed = actual <= threshold;
        } else {
            passed = actual >= threshold;
        }
        
        if (!passed) {
            failedConditions.push({
                name: getThresholdDisplayName(key),
                required: threshold,
                actual: actual,
                passed: false
            });
        }
    }
    
    if (failedConditions.length === 0) {
        return { 
            unlocked: true, 
            reason: '已达成所有条件',
            stats: gameStats 
        };
    } else {
        return { 
            unlocked: false, 
            reason: '未达成条件',
            failedConditions: failedConditions,
            stats: gameStats 
        };
    }
}

function showRealFailedProductDetail(productId) {
    if (!realFailedProductsData || !realFailedProductsData.real_failed_products) return;
    
    const product = realFailedProductsData.real_failed_products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('museum-detail-modal');
    const content = document.getElementById('museum-detail-content');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <button class="museum-detail-close" onclick="closeMuseumDetailModal()">X</button>
        <div class="museum-detail-header">
            <div class="museum-detail-icon">${product.icon}</div>
            <div class="museum-detail-title">
                <h2>${product.name}</h2>
                <p class="museum-detail-subname">${product.subname}</p>
                <div class="museum-detail-tags">
                    <span class="tag failure">🏚️ 真实失败产品</span>
                </div>
            </div>
        </div>
        <div class="museum-detail-section">
            <h3>👤 创始人/PM说</h3>
            <blockquote>"${product.founder_quote}"</blockquote>
            <cite>—— ${product.founder_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>🇨🇳 国内用户说</h3>
            <blockquote>"${product.domestic_quote}"</blockquote>
            <cite>—— ${product.domestic_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>🌏 国外用户/媒体说</h3>
            <blockquote>"${product.international_quote}"</blockquote>
            <cite>—— ${product.international_source}</cite>
        </div>
        <div class="museum-detail-section">
            <h3>⚰️ 失败原因</h3>
            <p>${product.fail_reason}</p>
        </div>
        <div class="museum-detail-unlock">
            <h3>📜 图鉴解说</h3>
            <p>${product.unlock_desc}</p>
        </div>
    `;
    
    modal.style.display = 'flex';
}

window.addEventListener('DOMContentLoaded', loadProductsData);

// ============ 解锁动画函数 ============

function showUnlockAnimation(unlockedList, callback) {
    if (!unlockedList || unlockedList.length === 0) {
        if (callback) callback();
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'unlock-animation-overlay';
    overlay.innerHTML = `
        <div class="unlock-animation-container">
            <h2 class="unlock-animation-title">🎉 图鉴解锁</h2>
            <div class="unlock-cards-container" id="unlock-cards-container"></div>
            <div class="unlock-animation-footer">
                <button class="unlock-continue-btn" onclick="closeUnlockAnimation()">继续</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 显示遮罩
    setTimeout(() => {
        overlay.classList.add('active');
    }, 10);
    
    // 存储回调函数
    window._unlockAnimationCallback = callback;
    
    // 逐个展示解锁的卡片
    const container = overlay.querySelector('#unlock-cards-container');
    let index = 0;
    
    function showNextCard() {
        if (index >= unlockedList.length) {
            // 所有卡片展示完成
            const footer = overlay.querySelector('.unlock-animation-footer');
            footer.classList.add('show');
            return;
        }
        
        const item = unlockedList[index];
        const card = document.createElement('div');
        card.className = 'unlock-card';
        
        const typeLabel = item.type === 'product' ? '📦 产品图鉴' : '🏚️ 真实失败产品';
        const typeClass = item.type === 'product' ? 'product' : 'real-failed';
        
        card.innerHTML = `
            <div class="unlock-card-icon">${item.icon}</div>
            <div class="unlock-card-name">${item.name}</div>
            <div class="unlock-card-subname">${item.subname}</div>
            <div class="unlock-card-type ${typeClass}">${typeLabel}</div>
        `;
        
        container.appendChild(card);
        
        // 触发动画
        setTimeout(() => {
            card.classList.add('show');
        }, 50);
        
        index++;
        
        // 延迟展示下一个卡片
        setTimeout(showNextCard, 800);
    }
    
    // 开始展示第一个卡片
    setTimeout(showNextCard, 500);
}

function closeUnlockAnimation() {
    const overlay = document.querySelector('.unlock-animation-overlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            overlay.remove();
            
            // 执行回调
            if (window._unlockAnimationCallback) {
                window._unlockAnimationCallback();
                window._unlockAnimationCallback = null;
            }
        }, 500);
    }
}
