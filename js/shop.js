let allProducts = [];
let currentCategory = 'all';

// Load products and categories
async function initializeShop() {
    await loadCategories();
    await loadProducts();
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories/all`);
        const categories = await response.json();
        
        const container = document.getElementById('categoryFilters');
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = cat.name;
            btn.onclick = () => filterByCategory(cat.id, btn);
            container.appendChild(btn);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load all products
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsGrid');
    
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
                    <span class="product-price">${product.price.toLocaleString()}</span>
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
    
    // Update active button
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