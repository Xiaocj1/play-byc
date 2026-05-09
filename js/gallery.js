let galleryCardsData = null;
let galleryUnlockedCards = [];

async function loadGalleryCards() {
    try {
        galleryCardsData = await fetch('data/cards.json').then(r => r.json());
        loadGalleryUnlockedCards();
    } catch (error) {
        console.error('Failed to load cards data:', error);
    }
}

function loadGalleryUnlockedCards() {
    const saved = localStorage.getItem(UNLOCKED_CARDS_KEY);
    if (saved) {
        galleryUnlockedCards = JSON.parse(saved);
    }
}

function showGallery() {
    const modal = document.getElementById('gallery-modal');
    if (!modal) return;
    
    const tabs = document.getElementById('gallery-tabs');
    const content = document.getElementById('gallery-content');
    
    if (tabs) {
        tabs.innerHTML = `
            <button class="gallery-tab active" data-tab="endings">结局</button>
            <button class="gallery-tab" data-tab="cards">员工图鉴</button>
        `;
        
        tabs.querySelectorAll('.gallery-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderGalleryTab(tab.dataset.tab);
            });
        });
    }
    
    renderGalleryTab('endings');
    modal.style.display = 'flex';
}

function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderGalleryTab(tab) {
    const content = document.getElementById('gallery-content');
    if (!content) return;
    
    if (tab === 'cards') {
        renderCardsGallery(content);
    } else {
        renderEndingsGallery(content);
    }
}

function renderCardsGallery(container) {
    if (!galleryCardsData) {
        container.innerHTML = '<p>加载中...</p>';
        return;
    }
    
    const unlockedCardsData = [];
    
    galleryCardsData.pools.forEach(pool => {
        pool.cards.forEach(card => {
            const cardKey = `${pool.id}_${card.id}`;
            if (galleryUnlockedCards.includes(cardKey)) {
                unlockedCardsData.push({
                    ...card,
                    poolName: pool.name,
                    poolIcon: pool.icon,
                    unlocked: true
                });
            } else {
                unlockedCardsData.push({
                    id: card.id,
                    name: '???',
                    rarity: 'R',
                    poolName: pool.name,
                    poolIcon: pool.icon,
                    unlocked: false
                });
            }
        });
    });
    
    container.innerHTML = `
        <div class="cards-gallery">
            ${unlockedCardsData.map(card => `
                <div class="card-collection-item ${card.unlocked ? '' : 'locked'}">
                    <div class="card-collection-icon">${card.poolIcon}</div>
                    <div class="card-collection-name">${card.name}</div>
                    <div class="card-collection-rarity" style="color: ${galleryCardsData.rarity_colors[card.rarity]}">
                        ${card.rarity}
                    </div>
                    <div class="card-collection-pool">${card.poolName}</div>
                    ${card.unlocked && card.description ? `
                        <div class="card-collection-desc">${card.description}</div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function renderEndingsGallery(container) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const unlockedEndings = JSON.parse(localStorage.getItem(ENDINGS_KEY) || '[]');
    
    if (data.endings && data.endings.endings) {
        data.endings.endings.forEach(ending => {
            const isUnlocked = unlockedEndings.includes(ending.id);
            
            const item = document.createElement('div');
            item.className = `gallery-item ${isUnlocked ? 'unlocked' : 'locked'}`;
            
            if (isUnlocked) {
                const name = document.createElement('div');
                name.className = 'gallery-item-name';
                name.textContent = ending.name;
                
                const desc = document.createElement('div');
                desc.className = 'gallery-item-desc';
                desc.textContent = ending.description;
                
                item.appendChild(name);
                item.appendChild(desc);
            } else {
                const lock = document.createElement('div');
                lock.className = 'gallery-item-lock';
                lock.textContent = '🔒';
                
                item.appendChild(lock);
            }
            
            grid.appendChild(item);
        });
    }
    
    container.innerHTML = '';
    container.appendChild(grid);
}

window.addEventListener('DOMContentLoaded', loadGalleryCards);