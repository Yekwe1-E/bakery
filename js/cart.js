// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add item to cart
function addToCart(id, name, price, image, quantity = 1) {
    let cart = getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ id, name, price, image, quantity });
    }

    saveCart(cart);
    showToast(`${name} added to cart!`, 'success');
}

// Remove item from cart
function removeFromCart(id) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== id);
    saveCart(cart);
    displayCart();
}

// Update quantity
function updateQuantity(id, change) {
    let cart = getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        saveCart(cart);
        displayCart();
    }
}

// Update cart count badge
function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }
}

// Display cart items
function displayCart() {
    const container = document.getElementById('cartContent');
    const cart = getCart();

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items yet.</p>
                <a href="shop.html" class="cta-button" style="margin-top: 2rem;">Continue Shopping</a>
            </div>
        `;
        return;
    }

    let total = 0;
    const itemsHtml = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-name">${item.name}</h3>
                    <p class="cart-item-price">₦${item.price.toLocaleString()}</p>
                    <div class="quantity-control">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                    🗑️
                </button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        ${itemsHtml}
        <div class="cart-summary">
            <div class="summary-row">
                <span>Subtotal</span>
                <span>₦${total.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Delivery</span>
                <span>₦500</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>₦${(total + 500).toLocaleString()}</span>
            </div>
            <button class="cta-button" style="width: 100%; margin-top: 1.5rem;" onclick="proceedToCheckout()">
                Proceed to Checkout
            </button>
            <a href="shop.html" style="display: block; text-align: center; margin-top: 1rem; color: var(--gray);">
                ← Continue Shopping
            </a>
        </div>
    `;
}

// Proceed to checkout
function proceedToCheckout() {
    if (!isLoggedIn()) {
        showAlert('Please login to complete your purchase', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    window.location.href = 'checkout.html';
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}