<!--Product Page-->

<script>
    import { page } from '$app/stores';
    import { supabase } from '$lib/supabase';

    let products = $state([]);
    let selectedFilters = $state([]);
    let cartDrawerOpen = $state(false);
    let sortBy = $state('featured');
    let cart = $state([]);
    let loading = $state(true);

    let pageTitle = $derived(
        selectedFilters.length === 0 
            ? 'All Products' 
            : selectedFilters
                .map(f => filterOptions.find(opt => opt.value === f)?.label)
                .join(' & ')
    );

    // Initialize filters from URL parameter
    $effect(() => {
        const filterParam = $page.url.searchParams.get('filter');
        if (filterParam && filterParam !== 'all') {
            selectedFilters = [filterParam];
        } else {
            selectedFilters = [];
        }
    });

    // Load products from Supabase
    $effect(() => {
        supabase.from("allproducts").select("*").then(({ data, error }) => {
            if (error) {
                console.error('Error loading products:', error);
            } else if (data) {
                products = data;
                console.log('Products loaded:', data); // Debug log
            }
            loading = false;
        });
    });

    const filterOptions = [
        { value: 'shoes', label: 'Shoes' },
        { value: 'bags', label: 'Bags' },
        { value: 'backpacks', label: 'Backpacks' },
        { value: 'jackets', label: 'Jackets' },
        { value: 'sneakers', label: 'Sneakers' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'hats', label: 'Hats' },
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

    let cartCount = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));

    let filteredProducts = $derived(
        selectedFilters.length === 0
            ? products
            : products.filter(product => {
                // Check if product has a categories array/field
                if (product.categories && Array.isArray(product.categories)) {
                    return selectedFilters.some(filter => product.categories.includes(filter));
                }
                // Fallback: check if product has a single 'category' field
                if (product.category) {
                    return selectedFilters.includes(product.category);
                }
                return false;
            })
    );

    let sortedProducts = $derived(
        [...filteredProducts].sort((a, b) => {
            switch(sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name':
                    return a.title.localeCompare(b.title);
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
            🛒 Cart (<span>{cartCount}</span>)
        </button>
    </div>
</header>

<div class="main-content container">
    <!-- Page Header -->
    <div class="page-header">
    <h1>Shop {pageTitle}</h1>
    <p>{filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found</p>
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

            <!-- Filter Checkboxes -->
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

            <!-- Active Filters -->
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

        <!-- Products Section -->
        <div class="products-section">
            <!-- Sort Options -->
            <div class="sort-section">
                <select bind:value={sortBy} class="sort-select">
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                </select>
            </div>

            <!-- Product Grid -->
            {#if loading}
                <div class="loading">
                    <p>Loading products...</p>
                </div>
            {:else if sortedProducts.length === 0}
                <div class="no-results">
                    <h3>No products found</h3>
                    <p>Try adjusting your filters to see more results</p>
                    <button class="btn-primary" onclick={clearFilters}>
                        Clear All Filters
                    </button>
                </div>
            {:else}
                <div class="product-grid">
                    {#each sortedProducts as product}
                        <div class="product-card">
                            <img src={product.image} alt={product.title} class="product-image" />
                            <div class="product-info">
                                <div class="product-title">{product.title}</div>
                                <div class="product-price">${Number(product.price).toFixed(2)}</div>
                                
                                {#if product.categories || product.category}
                                    <div class="category-tags">
                                        {#each (Array.isArray(product.categories) ? product.categories : [product.category]) as cat}
                                            <span class="category-tag">
                                                {filterOptions.find(f => f.value === cat)?.label || cat}
                                            </span>
                                        {/each}
                                    </div>
                                {/if}
                                
                                <button class="add-to-cart-btn">
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<!-- Cart Drawer -->
<div class="cart-drawer" class:open={cartDrawerOpen}>
    <div class="cart-header">
        <h3>Shopping Cart</h3>
        <button class="close-btn" onclick={closeCart}>✕</button>
    </div>
    <div class="cart-items">
        <p style="text-align: center; color: #666666;">Your cart is empty</p>
    </div>
</div>

<!-- Cart Overlay -->
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

body {
    font-family: 'Kanit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background-color: var(--bg);
    color: var(--text);
    line-height: 1.6;
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

.nav {
    display: flex;
    gap: 2rem;
}

.nav a {
    text-decoration: none;
    color: var(--text);
    font-weight: 500;
    transition: color 0.3s;
}

.nav a:hover {
    color: var(--primary);
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

/* Product Grid */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.product-card {
    background: var(--white);
    border-radius: 12px;
    overflow: hidden;
    transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
}

.product-image {
    width: 100%;
    height: 250px;
    object-fit: cover;
}

.product-info {
    padding: 1rem;
}

.product-title {
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.product-price {
    color: var(--primary);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.category-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin-bottom: 0.75rem;
}

.category-tag {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    background: #f0f4e8;
    color: var(--primary);
    border-radius: 12px;
}

.add-to-cart-btn {
    width: 100%;
    padding: 0.5rem;
    background: var(--primary);
    color: var(--white);
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.3s;
}

.add-to-cart-btn:hover {
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
    .nav {
        display: none;
    }
    
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
    
    .product-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
}
</style>