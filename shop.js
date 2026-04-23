let allProducts = [];
let currentCategory = 'all';

// Load products and categories
async function initializeShop() {
    await loadCategories();
    await loadProducts();
}

// Load categories - try network first, fallback to IndexedDB
async function loadCategories() {
    let categories = [];
    try {
        const response = await fetch(`${API_URL}/products/categories/all`);
        if (!response.ok) throw new Error('Network error');
        categories = await response.json();
        // Cache to IndexedDB for offline use
        await dbHelper.cacheCategories(categories);
    } catch (error) {
        console.warn('Fetching categories from network failed. Using local cache.', error);
        categories = await dbHelper.getLocalCategories();
    }

    const container = document.getElementById('categoryFilters');
    if (!container) return;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = cat.name;
        btn.onclick = () => filterByCategory(cat.id, btn);
        container.appendChild(btn);
    });
}

// Load all products - try network first, fallback to IndexedDB
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Network error');
        allProducts = await response.json();
        // Cache to IndexedDB for offline use
        await dbHelper.cacheProducts(allProducts);
    } catch (error) {
        console.warn('Fetching products from network failed. Using local cache.', error);
        allProducts = await dbHelper.getLocalProducts();
        if (allProducts.length === 0) {
            const container = document.getElementById('productsGrid');
            if (container) {
                container.innerHTML = `
                    <div style="text-align:center;grid-column:1/-1;padding:3rem;">
                        <div style="font-size:3rem;">📶</div>
                        <h3 style="margin-top:1rem;">No products cached yet</h3>
                        <p style="color:var(--gray);">Please connect to the internet once to load products, then they'll be available offline.</p>
                    </div>`;
            }
            return;
        }
    }
    displayProducts(allProducts);
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray); grid-column: 1/-1;">No products found.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <div class="product-category">${product.category_name}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₦${product.price.toLocaleString()}</span>
                    <button class="add-to-cart" onclick='addToCart(${product.id}, "${product.name.replace(/"/g, '&quot;')}", ${product.price}, "${product.image}")'>
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Filter by category
function filterByCategory(category, btn) {
    currentCategory = category;
    
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    else document.querySelector('.filter-btn').classList.add('active');

    if (category === 'all') {
        displayProducts(allProducts);
    } else {
        const filtered = allProducts.filter(p => p.category_id === category || p.category_id == category);
        displayProducts(filtered);
    }
}

// Search/filter products
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        const matchesCategory = currentCategory === 'all' || product.category_id == currentCategory;
        return matchesSearch && matchesCategory;
    });
    
    displayProducts(filtered);
}

// Initialize shop page
initializeShop();