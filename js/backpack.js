function showBackpackModal() {
    const modal = document.createElement('div');
    modal.className = 'backpack-modal';
    modal.innerHTML = `
        <div class="backpack-modal-content">
            <h2>👥 员工管理</h2>
            <div class="backpack-stats">
                <div class="stat-item">
                    <span>📦 HC:</span>
                    <span id="backpack-hc">${backpack.length}/${gameState.hcLimit || 3}</span>
                </div>
            </div>
            <div class="backpack-filters">
                <button class="filter-btn active" data-filter="all" onclick="filterBackpack('all')">全部</button>
                <button class="filter-btn" data-filter="RD" onclick="filterBackpack('RD')">研发</button>
                <button class="filter-btn" data-filter="QA" onclick="filterBackpack('QA')">测试</button>
                <button class="filter-btn" data-filter="设计" onclick="filterBackpack('设计')">设计</button>
                <button class="filter-btn" data-filter="运营" onclick="filterBackpack('运营')">运营</button>
                <button class="filter-btn" data-filter="产品" onclick="filterBackpack('产品')">产品</button>
            </div>
            <div class="backpack-grid" id="backpack-grid"></div>
            <button class="btn-pixel backpack-close-btn" onclick="closeBackpackModal()">关闭</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    renderBackpack('all');
}

function filterBackpack(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    renderBackpack(filter);
}

function renderBackpack(filter) {
    const grid = document.getElementById('backpack-grid');
    if (!grid) return;
    
    let cards = [...backpack];
    
    if (filter !== 'all') {
        cards = cards.filter(card => card.position === filter);
    }
    
    if (cards.length === 0) {
        grid.innerHTML = '<div class="empty-backpack">暂无员工</div>';
        return;
    }
    
    grid.innerHTML = cards.map(card => {
        const rarityStars = getRarityStars(card.rarity);
        const trainingStatus = card.isTraining ? '<span class="training-badge">培养中</span>' : '';
        const durabilityBar = card.durability ? `
            <div class="durability-bar">
                <div class="durability-fill" style="width: ${(card.durability / 5) * 100}%"></div>
                <span class="durability-text">${card.durability}/5</span>
            </div>
        ` : '';
        
        return `
            <div class="backpack-card ${card.rarity.toLowerCase()}">
                <div class="card-header">
                    <span class="card-name">${card.name}</span>
                    <span class="card-rarity">${rarityStars}</span>
                </div>
                <div class="card-body">
                    <div class="card-position">${card.position}</div>
                    <div class="card-effect">${card.description || ''}</div>
                    ${durabilityBar}
                    ${trainingStatus}
                </div>
                <div class="card-footer">
                    <span class="card-camp">${card.camp || 'neutral'}</span>
                </div>
            </div>
        `;
    }).join('');
    
    updateBackpackStats();
}

function getRarityStars(rarity) {
    const stars = {
        'R': '⭐',
        'SR': '⭐⭐',
        'SSR': '⭐⭐⭐'
    };
    return stars[rarity] || '';
}

function updateBackpackStats() {
    const hcDisplay = document.getElementById('backpack-hc');
    if (hcDisplay) {
        hcDisplay.textContent = `${backpack.length}/${gameState.hcLimit || 3}`;
    }
}

function closeBackpackModal() {
    const modal = document.querySelector('.backpack-modal');
    if (modal) {
        modal.remove();
    }
}