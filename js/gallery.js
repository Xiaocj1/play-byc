// 检查是否已声明，避免重复声明
if (typeof window.UNLOCKED_CARDS_KEY === 'undefined') {
    window.UNLOCKED_CARDS_KEY = "fair_office_unlocked_cards";
}
if (typeof window.ENDINGS_KEY === 'undefined') {
    window.ENDINGS_KEY = "fair_office_unlocked_endings";
}
if (typeof window.RARITY_COLORS === 'undefined') {
    window.RARITY_COLORS = {
        "SSR": "#f39c12",
        "SR": "#9b59b6",
        "R": "#888"
    };
}

if (typeof window.galleryCardsData === 'undefined') {
    window.galleryCardsData = null;
}
if (typeof window.galleryUnlockedCards === 'undefined') {
    window.galleryUnlockedCards = [];
}

if (typeof window.currentGalleryFilter === 'undefined') {
    window.currentGalleryFilter = {
        position: 'all',
        rarity: 'all',
        status: 'all'
    };
}

async function loadGalleryCards() {
    try {
        window.galleryCardsData = await fetch('data/cards.json').then(r => r.json());
        loadGalleryUnlockedCards();
    } catch (error) {
        console.error('Failed to load cards data:', error);
    }
}

function loadGalleryUnlockedCards() {
    try {
        const saved = localStorage.getItem(window.UNLOCKED_CARDS_KEY);
        window.galleryUnlockedCards = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Failed to load unlocked cards:', error);
        window.galleryUnlockedCards = [];
    }
}

function updateGalleryFilter(filterType, value) {
    window.currentGalleryFilter[filterType] = value;
    renderCardsGallery(document.getElementById('gallery-grid'));
}

function renderCardsGallery(container) {
    if (!window.galleryCardsData || !container) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">卡牌数据加载中...</p>';
        return;
    }
    
    const { position, rarity, status } = window.currentGalleryFilter;
    const availablePositions = window.galleryCardsData.pools.map(p => ({ id: p.id, name: p.name, icon: p.icon }));
    
    const allCards = [];
    window.galleryCardsData.pools.forEach(pool => {
        if (position !== 'all' && pool.id !== position) return;
        
        pool.cards.forEach(card => {
            const cardKey = pool.id + '_' + card.id;
            const isUnlocked = window.galleryUnlockedCards.includes(cardKey);
            
            if (status === 'unlocked' && !isUnlocked) return;
            if (status === 'locked' && isUnlocked) return;
            if (rarity !== 'all' && card.rarity !== rarity) return;
            
            allCards.push({
                poolName: pool.name,
                poolIcon: pool.icon,
                poolId: pool.id,
                cardKey: cardKey,
                unlocked: isUnlocked,
                id: card.id,
                name: card.name,
                rarity: card.rarity,
                description: card.description || ''
            });
        });
    });
    
    const rarityOrder = { "SSR": 0, "SR": 1, "R": 2 };
    allCards.sort(function(a, b) {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        if (rarityOrder[a.rarity] !== rarityOrder[b.rarity]) {
            return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        }
        return a.name.localeCompare(b.name);
    });
    
    const allCardsTotal = window.galleryCardsData.pools.reduce(function(sum, pool) { return sum + pool.cards.length; }, 0);
    const allCardsUnlocked = window.galleryUnlockedCards.length;
    const progress = allCardsTotal > 0 ? Math.round((allCardsUnlocked / allCardsTotal) * 100) : 0;
    
    var htmlContent = '';
    
    htmlContent += '<div class="gallery-tabs">';
    htmlContent += '<div class="gallery-tab-row"><span class="filter-label">职位：</span><div class="gallery-tab-group">';
    htmlContent += '<button class="gallery-tab ' + (position === 'all' ? 'active' : '') + '" onclick="updateGalleryFilter(\'position\', \'all\')">全部</button>';
    for (var i = 0; i < availablePositions.length; i++) {
        var p = availablePositions[i];
        htmlContent += '<button class="gallery-tab ' + (position === p.id ? 'active' : '') + '" onclick="updateGalleryFilter(\'position\', \'' + p.id + '\')">' + p.icon + ' ' + p.name + '</button>';
    }
    htmlContent += '</div></div>';
    
    htmlContent += '<div class="gallery-tab-row"><span class="filter-label">稀有度：</span><div class="gallery-tab-group">';
    htmlContent += '<button class="gallery-tab small ' + (rarity === 'all' ? 'active' : '') + '" onclick="updateGalleryFilter(\'rarity\', \'all\')">全部</button>';
    htmlContent += '<button class="gallery-tab small ' + (rarity === 'SSR' ? 'active' : '') + '" onclick="updateGalleryFilter(\'rarity\', \'SSR\')" style="color: #f39c12;">SSR</button>';
    htmlContent += '<button class="gallery-tab small ' + (rarity === 'SR' ? 'active' : '') + '" onclick="updateGalleryFilter(\'rarity\', \'SR\')" style="color: #9b59b6;">SR</button>';
    htmlContent += '<button class="gallery-tab small ' + (rarity === 'R' ? 'active' : '') + '" onclick="updateGalleryFilter(\'rarity\', \'R\')" style="color: #888;">R</button>';
    htmlContent += '</div></div>';
    
    htmlContent += '<div class="gallery-tab-row"><span class="filter-label">状态：</span><div class="gallery-tab-group">';
    htmlContent += '<button class="gallery-tab small ' + (status === 'all' ? 'active' : '') + '" onclick="updateGalleryFilter(\'status\', \'all\')">全部</button>';
    htmlContent += '<button class="gallery-tab small ' + (status === 'unlocked' ? 'active' : '') + '" onclick="updateGalleryFilter(\'status\', \'unlocked\')">已获得</button>';
    htmlContent += '<button class="gallery-tab small ' + (status === 'locked' ? 'active' : '') + '" onclick="updateGalleryFilter(\'status\', \'locked\')">未获得</button>';
    htmlContent += '</div></div>';
    htmlContent += '</div>';
    
    htmlContent += '<div class="gallery-stats">';
    htmlContent += '<div class="stat-header"><span class="stat-label">卡牌收集</span><span class="stat-value">' + allCardsUnlocked + '/' + allCardsTotal + '</span></div>';
    htmlContent += '<div class="stat-header"><div class="stat-progress-bar"><div class="stat-progress-fill" style="width: ' + progress + '%"></div></div><span class="stat-percentage">' + progress + '%</span></div>';
    htmlContent += '</div>';
    
    htmlContent += '<div class="cards-gallery">';
    for (var j = 0; j < allCards.length; j++) {
        var card = allCards[j];
        var cardClass = 'gallery-card ' + (card.unlocked ? '' : 'locked');
        var onclickAttr = card.unlocked ? 'showCardDetail(\'' + card.poolId + '\', \'' + card.id + '\')' : '';
        var onmouseenterAttr = !card.unlocked ? 'showCardHint(\'' + card.cardKey + '\')' : '';
        var iconHtml = card.unlocked ? card.poolIcon : '<span class="question-box">?</span>';
        var nameHtml = card.unlocked ? card.name : '???';
        var rarityColor = card.unlocked ? (window.RARITY_COLORS[card.rarity] || '#888') : '#666';
        var descHtml = '';
        if (card.unlocked && card.description) {
            descHtml = '<div class="gallery-card-desc">' + card.description + '</div>';
        } else {
            descHtml = '<div class="gallery-card-desc" style="color:#666;">通过抽卡获得</div>';
        }
        
        htmlContent += '<div class="' + cardClass + '" onclick="' + onclickAttr + '" onmouseenter="' + onmouseenterAttr + '">';
        htmlContent += '<div class="gallery-card-icon">' + iconHtml + '</div>';
        htmlContent += '<div class="gallery-card-name">' + nameHtml + '</div>';
        htmlContent += '<div class="gallery-card-rarity" style="color: ' + rarityColor + '">' + card.rarity + '</div>';
        htmlContent += '<div class="gallery-card-pool">' + card.poolName + '</div>';
        htmlContent += descHtml;
        htmlContent += '</div>';
    }
    htmlContent += '</div>';
    
    if (allCards.length === 0) {
        htmlContent += '<div class="no-results">暂无符合条件的卡牌</div>';
    }
    
    container.innerHTML = htmlContent;
}

function showCardHint(cardKey) {
    var toast = document.getElementById('toast-modal');
    var message = document.getElementById('toast-message');
    if (toast && message) {
        message.textContent = '在游戏中抽卡即可获得此卡牌';
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2000);
    }
}

function showCardDetail(poolId, cardId) {
    if (!window.galleryCardsData) return;
    
    var pool = null;
    for (var i = 0; i < window.galleryCardsData.pools.length; i++) {
        if (window.galleryCardsData.pools[i].id === poolId) {
            pool = window.galleryCardsData.pools[i];
            break;
        }
    }
    if (!pool) return;
    
    var card = null;
    for (var j = 0; j < pool.cards.length; j++) {
        if (pool.cards[j].id === cardId) {
            card = pool.cards[j];
            break;
        }
    }
    if (!card) return;
    
    showToast(pool.icon + ' ' + card.name + ' - ' + card.description);
}

function renderGalleryTab(tab) {
    var content = document.getElementById('gallery-content');
    if (!content) return;
    
    if (tab === 'cards') {
        renderCardsGallery(content);
    } else {
        renderEndingsGallery(content);
    }
}

function renderEndingsGallery(container) {
    var grid = document.createElement('div');
    grid.className = 'gallery-grid';
    grid.id = 'gallery-grid';
    grid.innerHTML = '<div style="text-align:center;padding:40px;color:#888;">结局系统开发中...</div>';
    
    container.innerHTML = '';
    container.appendChild(grid);
}