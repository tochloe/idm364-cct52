<!--FILTER PAGE-->
<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabase';
    import ProductGrid from '$lib/components/ProductGrid.svelte';
    import '../../app.css';

    let products = $state([]);
    let selectedFilters = $state([]);
    let cartDrawerOpen = $state(false);
    let sortBy = $state('featured');
    let cart = $state([]);
    let loading = $state(true);

    $effect(() => {
        const savedCart = localStorage.getItem('retreat_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    });

    let pageTitle = $derived(
        selectedFilters.length === 0 
            ? 'All Products' 
            : selectedFilters
                .map(f => filterOptions.find(opt => opt.value === f)?.label)
                .join(' & ')
    );

  
    $effect(() => {
        const filterParam = $page.url.searchParams.get('filter');
        console.log('Filter from URL:', filterParam);
        if (filterParam && filterParam !== 'all') {
            selectedFilters = [filterParam];
        } else {
            selectedFilters = [];
        }
    });

 
    $effect(() => {
        loading = true;
        supabase.from("allproducts").select("*").then(({ data, error }) => {
            if (error) {
                console.error('Error loading products:', error);
            } else if (data) {
                products = data;
                console.log('Products loaded:', data);
            }
            loading = false;
        });
    });

    const filterOptions = [
        { value: 'shoes', label: 'Shoes' },
        { value: 'backpacks', label: 'Backpacks' },
        { value: 'jackets', label: 'Jackets' },
        { value: 'accessories', label: 'Accessories' },
    ];

    function toggleFilter(filterValue) {
        if (selectedFilters.includes(filterValue)) {
            selectedFilters = selectedFilters.filter(f => f !== filterValue);
        } else {
            selectedFilters = [...selectedFilters, filterValue];
        }
    }

    function clearFilters() {
        selectedFilters = [];
    }

    function toggleCart() {
        cartDrawerOpen = !cartDrawerOpen;
    }

    function closeCart() {
        cartDrawerOpen = false;
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
    let cartCount = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));
    let cartTotal = $derived(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));

    // Filter products based on selected filters
    let filteredProducts = $derived(
        selectedFilters.length === 0
            ? products
            : products.filter(product => {
                if (product.category) {
                    return selectedFilters.includes(product.category);
                }
                if (product.product_filters) {
                    const filters = product.product_filters.toLowerCase().split(',').map(f => f.trim());
                    return selectedFilters.some(selected => filters.includes(selected));
                }
                return false;
            })
    );

    // Sort the filtered products
    let sortedProducts = $derived(
        [...filteredProducts].sort((a, b) => {
            switch(sortBy) {
                case 'price-low':
                    return Number(a.product_price || 0) - Number(b.product_price || 0);
                case 'price-high':
                    return Number(b.product_price || 0) - Number(a.product_price || 0);
                case 'name':
                    return (a.product_name || '').localeCompare(b.product_name || '');
                default:
                    return 0;
            }
        })
    );
</script>

<header class="header">
    <div class="container">
        <a href="/" class="logo">re:treat</a>
        <button class="cart-btn" onclick={toggleCart}>
            Cart (<span>{cartCount}</span>)
        </button>
    </div>
</header>

<div class="main-content container">
    <div class="page-header">
        <h1>Shop {pageTitle}</h1>
        <p>{sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'} found</p>
    </div>

    <div class="content-grid">
        <!-- Sidebar Filters -->
        <aside class="filter-sidebar">
            <div class="filter-header">
                <h3>Filters</h3>
                {#if selectedFilters.length > 0}
                    <button class="clear-all-btn" onclick={clearFilters}>
                        Clear all
                    </button>
                {/if}
            </div>

            <div class="filter-checkboxes">
                {#each filterOptions as filter}
                    <label class="filter-checkbox" class:active={selectedFilters.includes(filter.value)}>
                        <input
                            type="checkbox"
                            checked={selectedFilters.includes(filter.value)}
                            onchange={() => toggleFilter(filter.value)}
                        />
                        <span>{filter.label}</span>
                    </label>
                {/each}
            </div>

            {#if selectedFilters.length > 0}
                <div class="active-filters">
                    <h4>SELECTED:</h4>
                    <div class="filter-tags">
                        {#each selectedFilters as filter}
                            {@const filterLabel = filterOptions.find(f => f.value === filter)?.label}
                            <span class="filter-tag">
                                {filterLabel}
                                <button onclick={() => toggleFilter(filter)}>×</button>
                            </span>
                        {/each}
                    </div>
                </div>
            {/if}
        </aside>

        <!-- Products Section with ProductGrid Component -->
        <div class="products-section">
            <div class="sort-section">
                <select bind:value={sortBy} class="sort-select">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                </select>
            </div>

            <!-- Use ProductGrid Component - it handles loading, empty states, and display -->
            {#if sortedProducts.length === 0 && !loading}
                <div class="no-results">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters to see more results</p>
                    <button class="btn-primary" onclick={clearFilters}>
                        Clear All Filters
                    </button>
                </div>
            {:else}
                <ProductGrid products={sortedProducts} {loading} />
            {/if}
        </div>
    </div>
</div>


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
    @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&family=K2D:wght@700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
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

/* Main Content */
.main-content {
    padding: 2rem 1rem;
}

.page-header {
    margin-bottom: 2rem;
}

.page-header h1 {
    font-family: 'K2D', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
    color: var(--text);
}

.page-header p {
    color: var(--text-muted);
    font-size: 1.125rem;
}

.content-grid {
    display: grid;
    grid-template-columns: 250px 1fr;
    gap: 2rem;
}

/* Filter Sidebar */
.filter-sidebar {
    background: var(--white);
    border-radius: 12px;
    padding: 1.5rem;
    height: fit-content;
    position: sticky;
    top: 100px;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.filter-header h3 {
    font-family: 'K2D', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
}

.clear-all-btn {
    background: none;
    border: none;
    color: var(--primary);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: opacity 0.3s;
}

.clear-all-btn:hover {
    opacity: 0.7;
}

.filter-checkboxes {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background 0.2s;
}

.filter-checkbox:hover {
    background: #f7f7f7;
}

.filter-checkbox.active {
    background: #f0f4e8;
}

.filter-checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--primary);
}

.filter-checkbox span {
    font-weight: 500;
}

.active-filters {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
}

.active-filters h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text-muted);
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.filter-tag {
    background: var(--primary);
    color: var(--white);
    padding: 0.25rem 0.75rem;
    border-radius: 16px;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.filter-tag button {
    background: none;
    border: none;
    color: var(--white);
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
    line-height: 1;
}

/* Products Section */
.products-section {
    width: 100%;
}

.sort-section {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
}

.sort-select {
    padding: 0.5rem 1rem;
    border-radius: 8px;
    border: 2px solid var(--border);
    background: var(--white);
    cursor: pointer;
    font-weight: 500;
    font-size: 0.875rem;
    font-family: 'Kanit', sans-serif;
}

.loading {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-muted);
}

.no-results {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--white);
    border-radius: 12px;
}

.no-results h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
}

.no-results p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.btn-primary {
    background: var(--primary);
    color: var(--white);
    border: none;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.btn-primary:hover {
    background: var(--primary-hover);
}

/* Cart Drawer */
.cart-drawer {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
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
    margin-bottom: 0.5rem;
    font-size: 1rem;
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

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-muted);
}

.cart-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
}

/* Responsive */
@media (max-width: 768px) {
    .content-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-sidebar {
        position: static;
    }
    
    .cart-drawer {
        width: 100%;
        right: -100%;
    }
}
</style>