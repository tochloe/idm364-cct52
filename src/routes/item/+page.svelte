<!--ITEM PAGE-->
<script>
    import { goto } from '$app/navigation';
    import { supabase } from "$lib/supabase";
    import '../../app.css';
    
    // Props
    let { data } = $props();
    
    // State
    let product = $state(null);
    let loading = $state(true);
    let cart = $state([]);
    let cartDrawerOpen = $state(false);
    let currentImageIndex = $state(0);
    let saved = $state(false);
    let productId = $state(null);
    let selectedSize = $state(null);
    
    // Load cart and product on mount
    $effect(() => {
        // Get product ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        productId = urlParams.get('id');
        
        // Load cart from localStorage
        const savedCart = localStorage.getItem('retreat_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
        
        // Load saved items
        const savedItems = localStorage.getItem('retreat_saved');
        if (savedItems) {
            const savedList = JSON.parse(savedItems);
            saved = savedList.includes(productId);
        }
    });
    
    // Load product when productId changes
    $effect(() => {
        if (productId) {
            loadProduct();
        }
    });
    
    async function loadProduct() {
        loading = true;
        const { data: productData, error } = await supabase
            .from("allproducts")
            .select("*")
            .eq("id", productId)
            .single();
            
        if (error) {
            console.error('Error loading product:', error);
        } else {
            product = productData;
            // Set default size if product has sizes
            if (productData.product_sizes && productData.product_sizes !== 'One Size') {
                const sizes = productData.product_sizes.split(',').map(s => s.trim());
                selectedSize = sizes[0]; // Default to first size
            } else {
                selectedSize = 'One Size';
            }
        }
        loading = false;
    }
    
    function selectSize(size) {
        selectedSize = size;
    }
    
    function addToCart() {
        if (!product) return;
        
        const cartItemId = `${product.id}-${selectedSize}`;
        
        const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId);
        
        if (existingIndex > -1) {
            // Increase quantity
            cart[existingIndex].quantity += 1;
        } else {
            // Add new item
            cart = [...cart, {
                cartItemId: cartItemId,
                id: product.id,
                name: product.product_name,
                price: Number(product.product_price),
                image: product.hero_img,
                size: selectedSize,
                quantity: 1
            }];
        }
        

        localStorage.setItem('retreat_cart', JSON.stringify(cart));
        

        cartDrawerOpen = true;
    }
    
    function toggleSave() {
        saved = !saved;
        
        let savedItems = [];
        const savedItemsStr = localStorage.getItem('retreat_saved');
        if (savedItemsStr) {
            savedItems = JSON.parse(savedItemsStr);
        }
        
        if (saved) {
            savedItems.push(productId);
        } else {
            savedItems = savedItems.filter(id => id !== productId);
        }
        
        localStorage.setItem('retreat_saved', JSON.stringify(savedItems));
    }
    
    function updateQuantity(cartItemId, delta) {
        const index = cart.findIndex(item => item.cartItemId === cartItemId);
        if (index > -1) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart = cart.filter(item => item.cartItemId !== cartItemId);
            }
            localStorage.setItem('retreat_cart', JSON.stringify(cart));
        }
    }
    
    function removeFromCart(cartItemId) {
        cart = cart.filter(item => item.cartItemId !== cartItemId);
        localStorage.setItem('retreat_cart', JSON.stringify(cart));
    }
    
    function toggleCart() {
        cartDrawerOpen = !cartDrawerOpen;
    }
    
    function closeCart() {
        cartDrawerOpen = false;
    }
    
    function goBack() {
        goto('/');
    }
    
    // Computed values
    let cartCount = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));
    let cartTotal = $derived(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    
    // Get all product images from database columns
    let productImages = $derived(() => {
        if (!product) return [];
        const images = [];
        
        if (product.hero_img) {
            images.push(product.hero_img);
        }
        
        if (product.product_2) {
            images.push(product.product_2);
        }
        
        if (product.product_1) {
            images.push(product.product_1);
        }
        
        return images;
    });
</script>

<header class="header">
    <div class="container">
        <a href="/" class="logo">re:treat</a>
        <button class="cart-btn" onclick={toggleCart}>
            Cart (<span>{cartCount}</span>)
        </button>
    </div>
</header>

{#if loading}
    <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading product...</p>
    </div>
{:else if product}
    <div class="product-detail">
<button class="back-btn" onclick={goBack} aria-label="Go back" title="Go back">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <!-- Optional: visually hidden text (for localization or if you prefer explicit visible text for screen readers) -->
    <span class="sr-only">Go back</span>
</button>

        <div class="product-layout">
            <!-- Image Gallery -->
            <div class="product-images">
                <div class="main-image">
                    <img src={productImages()[currentImageIndex] || product.hero_img} alt={product.product_name}>
                </div>
                
                {#if productImages().length > 1}
                    <div class="image-thumbnails">
                        {#each productImages() as img, i}
                            <button 
                                class="thumbnail" 
                                class:active={currentImageIndex === i}
                                onclick={() => currentImageIndex = i}
                            >
                                <img src={img} alt={`${product.product_name} view ${i + 1}`}>
                            </button>
                        {/each}
                    </div>
                {/if}
            </div>
            
            <!-- Product Info -->
            <div class="product-info">
                <div class="product-header">
                    <div>
                        <h1>{product.product_name}</h1>
                        <p class="product-category">{product.product_filters?.split(',')[0]?.trim() || 'Product'}</p>
                    </div>
                    <div class="product-price">${Number(product.product_price).toFixed(2)}</div>
                </div>
                
                <p class="product-description">{product.product_description || 'High-quality outdoor gear designed for adventure.'}</p>
                
                {#if product.product_sizes && product.product_sizes !== 'One Size'}
                    <div class="product-details">
                        <h3>Select Size</h3>
                        <div class="size-options">
                            {#each product.product_sizes.split(',') as size}
                                <button 
                                    class="size-btn" 
                                    class:selected={selectedSize === size.trim()}
                                    onclick={() => selectSize(size.trim())}
                                >
                                    {size.trim()}
                                </button>
                            {/each}
                        </div>
                    </div>
                {/if}
                
                <div class="product-actions">
                    <button class="btn btn-primary" onclick={addToCart}>
                        Add to Bag
                    </button>
                </div>
            </div>
        </div>
    </div>
{:else}
    <div class="error-container">
        <h2>Product not found</h2>
        <button class="btn btn-primary" onclick={goBack}>Back to Home</button>
    </div>
{/if}

<footer class="footer">
    <div class="container">
        <p>re:treat 2025 | IDM364_CCT52</p>
    </div>
</footer>

<!-- Cart Drawer -->
<div class="cart-drawer" class:open={cartDrawerOpen}>
    <div class="cart-header">
        <h3>🛒 Cart</h3>
        <button class="close-btn" onclick={closeCart}>✕</button>
    </div>
    
    <div class="cart-items">
        {#if cart.length === 0}
            <p class="empty-cart">Your cart is lonely☹️</p>
        {:else}
            {#each cart as item}
                <div class="cart-item">
                    <img src={item.image} alt={item.name}>
                    <div class="cart-item-info">
                        <h4>{item.name}</h4>
                        <p class="cart-item-size">Size: {item.size}</p>
                        <p class="cart-item-price">${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button onclick={() => updateQuantity(item.cartItemId, -1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onclick={() => updateQuantity(item.cartItemId, 1)}>+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick={() => removeFromCart(item.cartItemId)}>✕</button>
                </div>
            {/each}
        {/if}
    </div>
    
    <div class="cart-footer">
        <div class="cart-total">
            <span>Total:</span>
            <span>${cartTotal.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary btn-full" disabled={cart.length === 0}>Checkout</button>
    </div>
</div>

{#if cartDrawerOpen}
    <div class="cart-overlay" onclick={closeCart}></div>
{/if}

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #768e35;
    --primary-hover: #5f7229;
    --bg: #f7f7f7;
    --white: #ffffff;
    --text: #1a1a1a;
    --text-muted: #666666;
    --border: #e5e5e5;
}



.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

/* Header */
.header {
    background: var(--white);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-family: 'K2D', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    text-decoration: none;
}

.cart-btn {
    background: var(--primary);
    color: var(--white);
    border: none;
    padding: 0.5rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.cart-btn:hover {
    background: var(--primary-hover);
}

/* Loading */
.loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Product Detail */
.product-detail {
    position: relative;
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem 1rem;
}

.back-btn {
    position: absolute;
    top: 2rem;
    left: 1rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--white);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: transform 0.3s;
    z-index: 10;
}

.back-btn:hover {
    transform: scale(1.1);
}

.product-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-top: 5rem;
}

/* Images */
.product-images {
    position: sticky;
    top: 100px;
    height: fit-content;
}

.main-image {
    width: 100%;
    aspect-ratio: 1;
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 1rem;
}

.main-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-thumbnails {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 0.75rem;
}

.thumbnail {
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    transition: border-color 0.3s;
    padding: 0;
    background: var(--white);
}

.thumbnail:hover,
.thumbnail.active {
    border-color: var(--primary);
}

.thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

/* Product Info */
.product-info {
    background: var(--white);
    padding: 3rem;
    border-radius: 16px;
}

.product-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 2rem;
}

.product-header h1 {
    font-family: 'K2D', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.product-category {
    color: var(--text-muted);
    text-transform: uppercase;
    font-size: 0.875rem;
    letter-spacing: 1px;
}

.product-price {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
    white-space: nowrap;
}

.product-description {
    color: var(--text-muted);
    font-size: 1.125rem;
    line-height: 1.8;
    margin-bottom: 2rem;
}

.product-details {
    padding-top: 2rem;
    padding-bottom: 2rem;
    border-top: 1px solid var(--border);
    margin-top: 2rem;
}

.product-details h3 {
    font-family: 'K2D', sans-serif;
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

/* Size Selection */
.size-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.size-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid var(--border);
    background: var(--white);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
    font-family: 'Kanit', sans-serif;
}

.size-btn:hover {
    border-color: var(--primary);
}

.size-btn.selected {
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
}

.product-actions {
    display: flex;
    gap: 1rem;
}

.btn {
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
    flex: 1;
}

.btn-primary {
    background: var(--primary);
    color: var(--white);
}

.btn-primary:hover:not(:disabled) {
    background: var(--primary-hover);
    transform: translateY(-2px);
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-full {
    width: 100%;
}

/* Cart Drawer */
.cart-drawer {
    position: fixed;
    top: 0;
    right: -450px;
    width: 450px;
    height: 100vh;
    background: var(--white);
    box-shadow: -4px 0 16px rgba(0,0,0,0.1);
    transition: right 0.3s;
    z-index: 1000;
    display: flex;
    flex-direction: column;
}

.cart-drawer.open {
    right: 0;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
}

.cart-items {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
}

.empty-cart {
    text-align: center;
    color: var(--text-muted);
    padding: 3rem 1rem;
}

.cart-item {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg);
    border-radius: 12px;
    margin-bottom: 1rem;
    position: relative;
}

.cart-item img {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
}

.cart-item-info {
    flex: 1;
}

.cart-item-info h4 {
    margin-bottom: 0.25rem;
    font-size: 1rem;
}

.cart-item-size {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
}

.cart-item-price {
    color: var(--primary);
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.quantity-controls {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.quantity-controls button {
    width: 28px;
    height: 28px;
    border: 1px solid var(--border);
    background: var(--white);
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
}

.quantity-controls button:hover {
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
}

.remove-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-muted);
    width: 24px;
    height: 24px;
}

.remove-btn:hover {
    color: red;
}

.cart-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border);
}

.cart-total {
    display: flex;
    justify-content: space-between;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.cart-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
}

/* Footer */
.footer {
    background: #2a2a2a;
    color: var(--white);
    padding: 2rem 0;
    margin-top: 5rem;
    text-align: center;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}

/* Responsive */
@media (max-width: 968px) {
    .product-layout {
        grid-template-columns: 1fr;
        gap: 2rem;
    }
    
    .product-images {
        position: relative;
        top: 0;
    }
    
    .product-info {
        padding: 2rem;
    }
    
    .product-header {
        flex-direction: column;
    }

    .product-header h1 {
        font-size: 1.5rem;
    }

    .product-price {
        align-self: flex-start;
    }
    
    .cart-drawer {
        width: 100%;
        right: -100%;
    }
}

@media (max-width: 640px) {
    .product-actions {
        flex-direction: column;
    }
    
}
</style>