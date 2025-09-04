// Global state
let products = [];
let categories = ['Rings', 'Necklaces', 'Earrings', 'Bracelets'];
let cart = [];
let wishlist = [];
let editingProductId = null;
let isAdminLoggedIn = false;

// Admin credentials (in a real application, this would be handled server-side)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'eira2024'
};

// Initialize the application
function init() {
    loadSampleData();
    renderProducts();
    renderCategories();
    updateCartCount();
    updateWishlistCount();
    
    // Check URL for admin access
    if (window.location.hash === '#admin') {
        showAdminLogin();
    }
}

// Admin login functions
function showAdminLogin() {
    document.getElementById('adminLogin').classList.remove('hidden');
}

function hideAdminLogin() {
    document.getElementById('adminLogin').classList.add('hidden');
    window.location.hash = '';
}

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminLoggedIn = true;
        showAdminInterface();
        hideAdminLogin();
    } else {
        showLoginError('Invalid username or password');
    }
}

function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 3000);
}

function showAdminInterface() {
    document.getElementById('customerInterface').classList.add('hidden');
    document.getElementById('adminInterface').classList.remove('hidden');
    updateCategorySelect();
    renderAdminProducts();
}

function logout() {
    isAdminLoggedIn = false;
    document.getElementById('adminInterface').classList.add('hidden');
    document.getElementById('customerInterface').classList.remove('hidden');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    window.location.hash = '';
}

// Load sample data
function loadSampleData() {
    products = [
        {
            id: 1,
            name: "Diamond Solitaire Ring",
            price: 1299.99,
            category: "Rings",
            description: "Elegant 1-carat diamond solitaire ring in 14k white gold setting. Perfect for engagements and special occasions.",
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=300&h=250&fit=crop"
        },
        {
            id: 2,
            name: "Pearl Drop Earrings",
            price: 299.99,
            category: "Earrings",
            description: "Classic freshwater pearl drop earrings with gold-filled hooks. Timeless elegance for any outfit.",
            image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=250&fit=crop"
        },
        {
            id: 3,
            name: "Gold Tennis Bracelet",
            price: 899.99,
            category: "Bracelets",
            description: "Stunning tennis bracelet featuring brilliant-cut diamonds set in 18k yellow gold.",
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=250&fit=crop"
        },
        {
            id: 4,
            name: "Emerald Pendant Necklace",
            price: 749.99,
            category: "Necklaces",
            description: "Beautiful emerald pendant set in sterling silver with delicate chain. A perfect statement piece.",
            image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=250&fit=crop"
        }
    ];
}

// Render products for customers
function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    let filteredProducts = products;
    
    if (filter !== 'all') {
        filteredProducts = products.filter(p => p.category === filter);
    }

    grid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='💎'">` : '💎'}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="addToWishlist(${product.id})">♡ Wishlist</button>
                    <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Render categories
function renderCategories() {
    const container = document.getElementById('categoryButtons');
    container.innerHTML = categories.map(category => `
        <button class="category-btn" onclick="filterByCategory('${category}')">${category}</button>
    `).join('');
}

// Filter products by category
function filterByCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderProducts(category);
}

// Scroll to section
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        showMessage('Product added to cart!', 'success');
    }
}

// Add to wishlist
function addToWishlist(productId) {
    const product = products.find(p => p.id === productId);
    if (product && !wishlist.find(item => item.id === productId)) {
        wishlist.push(product);
        updateWishlistCount();
        showMessage('Product added to wishlist!', 'success');
    } else if (wishlist.find(item => item.id === productId)) {
        showMessage('Product already in wishlist!', 'error');
    }
}

// Toggle cart modal
function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        renderCartItems();
    }
}

// Toggle wishlist modal
function toggleWishlist() {
    const modal = document.getElementById('wishlistModal');
    modal.classList.toggle('active');
    if (modal.classList.contains('active')) {
        renderWishlistItems();
    }
}

// Render cart items
function renderCartItems() {
    const container = document.getElementById('cartItems');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23d4af37"/><text x="30" y="35" text-anchor="middle" fill="%231a1a2e" font-size="24">💎</text></svg>'}" alt="${item.name}">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
            <button class="btn btn-secondary" onclick="removeFromCart(${item.id})" style="min-width: auto; padding: 0.5rem;">×</button>
        </div>
    `).join('');
    
    document.getElementById('cartTotal').textContent = `Total: ${total.toFixed(2)}`;
}

// Render wishlist items
function renderWishlistItems() {
    const container = document.getElementById('wishlistItems');
    
    container.innerHTML = wishlist.map(item => `
        <div class="wishlist-item">
            <img src="${item.image || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><rect width="60" height="60" fill="%23d4af37"/><text x="30" y="35" text-anchor="middle" fill="%231a1a2e" font-size="24">💎</text></svg>'}" alt="${item.name}">
            <div class="item-details">
                <div class="item-name">${item.name}</div>
                <div class="item-price">${item.price.toFixed(2)}</div>
            </div>
            <div>
                <button class="btn btn-primary" onclick="addToCart(${item.id})" style="margin-bottom: 0.5rem;">Add to Cart</button>
                <button class="btn btn-secondary" onclick="removeFromWishlist(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    renderCartItems();
    showMessage('Product removed from cart!', 'success');
}

// Remove from wishlist
function removeFromWishlist(productId) {
    wishlist = wishlist.filter(item => item.id !== productId);
    updateWishlistCount();
    renderWishlistItems();
    showMessage('Product removed from wishlist!', 'success');
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Update wishlist count
function updateWishlistCount() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Checkout process
function checkout() {
    if (cart.length === 0) {
        showMessage('Your cart is empty!', 'error');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (confirm(`Proceed with checkout for ${total.toFixed(2)}?`)) {
        // Simulate payment processing
        setTimeout(() => {
            cart = [];
            updateCartCount();
            toggleCart();
            showMessage('Order placed successfully! Thank you for your purchase.', 'success');
        }, 1000);
    }
}

// Admin Functions
function showAddProductForm() {
    document.getElementById('productForm').classList.remove('hidden');
    document.getElementById('categoryForm').classList.add('hidden');
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').textContent = 'Add Product';
    editingProductId = null;
    resetForm();
}

function showCategoryForm() {
    document.getElementById('categoryForm').classList.remove('hidden');
    document.getElementById('productForm').classList.add('hidden');
    renderCategoriesList();
}

function resetForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productImage').value = '';
    document.getElementById('productDescription').value = '';
}

function updateCategorySelect() {
    const select = document.getElementById('productCategory');
    select.innerHTML = '<option value="">Select Category</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function addCategory() {
    const name = document.getElementById('categoryName').value.trim();
    if (name && !categories.includes(name)) {
        categories.push(name);
        document.getElementById('categoryName').value = '';
        renderCategories();
        renderCategoriesList();
        updateCategorySelect();
        showMessage('Category added successfully!', 'success');
    } else {
        showMessage('Category name is empty or already exists!', 'error');
    }
}

function renderCategoriesList() {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '<h4 style="color: #d4af37; margin: 1rem 0;">Current Categories</h4>' +
        categories.map(cat => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(255,255,255,0.05); margin-bottom: 0.5rem; border-radius: 8px;">
                <span>${cat}</span>
                <button class="btn btn-secondary" onclick="deleteCategory('${cat}')" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;">Delete</button>
            </div>
        `).join('');
}

function deleteCategory(categoryName) {
    if (confirm(`Delete category "${categoryName}"? This will not delete products in this category.`)) {
        categories = categories.filter(cat => cat !== categoryName);
        renderCategories();
        renderCategoriesList();
        updateCategorySelect();
        showMessage('Category deleted successfully!', 'success');
    }
}

function saveProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const image = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    
    if (!name || !price || !category || !description) {
        showMessage('Please fill in all required fields!', 'error');
        return;
    }
    
    const productData = {
        name,
        price,
        category,
        image,
        description
    };
    
    if (editingProductId) {
        // Update existing product
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
            showMessage('Product updated successfully!', 'success');
        }
    } else {
        // Add new product
        const newProduct = {
            ...productData,
            id: Date.now() // Simple ID generation
        };
        products.push(newProduct);
        showMessage('Product added successfully!', 'success');
    }
    
    resetForm();
    renderProducts();
    renderAdminProducts();
}

function renderAdminProducts() {
    const grid = document.getElementById('adminProductsGrid');
    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='💎'">` : '💎'}
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn" onclick="deleteProduct(${product.id})" style="background: #dc3545; color: white;">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        editingProductId = productId;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productDescription').value = product.description;
        
        document.getElementById('formTitle').textContent = 'Edit Product';
        document.getElementById('submitBtn').textContent = 'Update Product';
        document.getElementById('productForm').classList.remove('hidden');
        document.getElementById('categoryForm').classList.add('hidden');
        
        // Scroll to form
        document.getElementById('productForm').scrollIntoView({ behavior: 'smooth' });
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        cart = cart.filter(item => item.id !== productId);
        wishlist = wishlist.filter(item => item.id !== productId);
        
        renderProducts();
        renderAdminProducts();
        updateCartCount();
        updateWishlistCount();
        showMessage('Product deleted successfully!', 'success');
    }
}

function showMessage(message, type) {
    const messageArea = document.getElementById('messageArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageArea.innerHTML = '';
    messageArea.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Handle admin URL access
function handleHashChange() {
    if (window.location.hash === '#admin' && !isAdminLoggedIn) {
        showAdminLogin();
    } else if (window.location.hash !== '#admin' && isAdminLoggedIn) {
        logout();
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Listen for hash changes
window.addEventListener('hashchange', handleHashChange);

// Initialize the application when page loads
document.addEventListener('DOMContentLoaded', init);