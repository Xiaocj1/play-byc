const PRODUCTS_KEY = "fair_office_unlocked_products";
const GAME_STORAGE_KEY = "fair_office_game_state";

let productsData = { products: [] };
let unlockedProducts = [];

function loadProductsData() {
    return fetch('data/products.json')
        .then(r => r.json())
        .then(data => {
            productsData = data;
            loadUnlockedProducts();
        });
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

function unlockProduct(productId) {
    if (isProductUnlocked(productId)) return;
    
    const product = productsData.products.find(p => p.id === productId);
    if (!product) return;
    
    unlockedProducts.push({
        id: product.id,
        unlockTime: Date.now()
    });
    saveUnlockedProducts();
}

function getProductsByDirection(direction) {
    return productsData.products.filter(p => p.direction === direction);
}

function showMuseumModal() {
    const modal = document.getElementById('museum-modal');
    if (!modal) return;
    
    if (productsData.products.length === 0) {
        loadProductsData().then(() => {
            renderMuseumTabs('toc');
            modal.style.display = 'flex';
        });
    } else {
        renderMuseumTabs('toc');
        modal.style.display = 'flex';
    }
}

function closeMuseumModal() {
    const modal = document.getElementById('museum-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderMuseumTabs(activeDirection) {
    const tabs = document.getElementById('museum-tabs');
    if (!tabs) return;
    
    tabs.innerHTML = `
        <button class="museum-tab ${activeDirection === 'toc' ? 'active' : ''}" onclick="renderMuseumTabs('toc')">To C</button>
        <button class="museum-tab ${activeDirection === 'tob' ? 'active' : ''}" onclick="renderMuseumTabs('tob')">To B</button>
        <button class="museum-tab ${activeDirection === 'b2c' ? 'active' : ''}" onclick="renderMuseumTabs('b2c')">B2C</button>
    `;
    
    renderMuseumGrid(activeDirection);
}

function showLockedProductHint(productId) {
    const product = productsData.products.find(p => p.id === productId);
    if (!product) return;
    
    const toast = document.getElementById('toast-modal');
    const message = document.getElementById('toast-message');
    if (toast && message) {
        message.textContent = `解锁条件：${product.unlock_condition}`;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function renderMuseumGrid(direction) {
    const grid = document.getElementById('museum-grid');
    if (!grid) return;
    
    const products = getProductsByDirection(direction);
    
    grid.innerHTML = products.map(product => {
        const unlocked = isProductUnlocked(product.id);
        
        return `
            <div class="museum-card ${unlocked ? '' : 'locked'}" onclick="${unlocked ? `showProductDetail('${product.id}')` : `showLockedProductHint('${product.id}')`}">
                ${unlocked ? `
                    <div class="museum-card-icon">${product.icon}</div>
                    <div class="museum-card-name">${product.name}</div>
                    <div class="museum-card-subname">${product.subname}</div>
                ` : `
                    <div class="museum-card-icon">❓</div>
                    <div class="museum-card-name">？？？</div>
                    <div class="museum-card-condition">${product.unlock_condition}</div>
                `}
            </div>
        `;
    }).join('');
}

function showProductDetail(productId) {
    const product = productsData.products.find(p => p.id === productId);
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
            <h3>🌏 国外用户说</h3>
            <blockquote>"${product.international_quote}"</blockquote>
            <cite>—— ${product.international_source}</cite>
        </div>
        <div class="museum-detail-unlock">
            <h3>📜 图鉴解锁文案</h3>
            <p>${product.unlock_desc}</p>
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

function checkAndUnlockProducts() {
    const saved = localStorage.getItem(GAME_STORAGE_KEY);
    if (!saved) return;
    
    const gameState = JSON.parse(saved);
    const direction = gameState.direction;
    const progress = gameState.progress || 0;
    const week = gameState.week || 1;
    
    if (direction === 'toc' && progress >= 100) {
        unlockProduct('wecom');
        if (week > 24) unlockProduct('douyin');
        if (week > 48) unlockProduct('taobao');
    }
    
    if (direction === 'tob' && progress >= 100) {
        unlockProduct('yonyou');
        if (week > 48) unlockProduct('salesforce');
    }
    
    if (direction === 'b2c' && progress >= 100) {
        unlockProduct('pdd_platform');
        if (week > 48) unlockProduct('shopify');
    }
}

window.addEventListener('DOMContentLoaded', loadProductsData);