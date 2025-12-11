<script>
    import { goto } from '$app/navigation';
    import { supabase } from "$lib/supabase";
    import '../app.css';
    import ProductGrid from '$lib/components/ProductGrid.svelte';

    let {data} = $props(); 
    $inspect(data);

    let products = $state([]);
    let loading = $state(true);
    let selectedCategory = $state('all');
    let cartDrawerOpen = $state(false);
    let modalOpen = $state(false);
    let cart = $state([]);
    
    // Load cart from localStorage on mount
    $effect(() => {
        const savedCart = localStorage.getItem('retreat_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    });
    
    // Carousel
    let currentSlide = $state(0);
    
    import hero1 from '$lib/img/header/slide1.jpg';
    import hero2 from '$lib/img/header/slide2.jpg';
    import hero3 from '$lib/img/header/slide3.jpg';
    
    const heroImages = [hero1, hero2, hero3];
    
    $effect(() => {
        const interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % heroImages.length;
        }, 5000);
        return () => clearInterval(interval);
    });
    
    function goToSlide(index) {
        currentSlide = index;
    }
    
    $effect(() => {
        loading = true;
        supabase.from("allproducts").select("*").then(({ data, error }) => {
            if (error) {
                console.error('Error loading products:', error);
            } else if (data) {
                products = data;
                console.log('Loaded products:', data);
            }
            loading = false;
        });
    });
    
    function toggleCart() {
        cartDrawerOpen = !cartDrawerOpen;
    }
    
    function closeCart() {
        cartDrawerOpen = false;
    }
    
    function closeModal() {
        modalOpen = false;
    }

    function navigateToProducts(category) {
        goto(`/product?filter=${category}`);  
    }
    
    function filterCategory(category) {
        selectedCategory = category;
    }
    
    function updateQuantity(itemId, delta) {
        const index = cart.findIndex(item => item.id === itemId);
        if (index > -1) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart = cart.filter(item => item.id !== itemId);
            }
            localStorage.setItem('retreat_cart', JSON.stringify(cart));
        }
    }
    
    function removeFromCart(itemId) {
        cart = cart.filter(item => item.id !== itemId);
        localStorage.setItem('retreat_cart', JSON.stringify(cart));
    }
    
    let cartCount = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));
    let cartTotal = $derived(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    
    // Filter
    let filteredProducts = $derived(
        selectedCategory === 'all' 
            ? products 
            : products.filter(p => {
                if (p.category) return p.category === selectedCategory;
                if (p.product_filters) {
                    const filters = p.product_filters.toLowerCase().split(',').map(f => f.trim());
                    return filters.includes(selectedCategory);
                }
                return false;
            })
    );

    let previewProducts = $derived(
        filteredProducts.slice(0, 2)
    );

    import shoe_pic from '$lib/img/section_img/shoes.jpg';
    import bags_pic from '$lib/img/section_img/bags.jpg';
    import jackets_pic from '$lib/img/section_img/jackets.jpg';
</script>


<header class="header">
    <div class="container">
        <a href="/" class="logo">re:treat</a>
       
        <button class="cart-btn" onclick={toggleCart}>
            Cart (<span>{cartCount}</span>)
        </button>
    </div>
</header>


<section class="hero">
    <!-- Carousel Background -->
    <div class="hero-carousel">
        {#each heroImages as image, i}
            <div 
                class="hero-slide" 
                class:active={currentSlide === i}
                style="background-image: url({image})"
            ></div>
        {/each}
    </div>
    

    <div class="hero-overlay"></div>
    
    <!-- Content -->
    <div class="hero-content">
        <h1>Gear Up for Adventure</h1>
        <p>re:set. re:wear. re:treat.</p>
        <button class="btn btn-primary" onclick={() => navigateToProducts('all')}>Shop Now</button>
    </div>

    <div class="carousel-dots">
        {#each heroImages as _, i}
            <button 
                class="dot" 
                class:active={currentSlide === i}
                onclick={() => goToSlide(i)}
                aria-label="Go to slide {i + 1}"
            ></button>
        {/each}
    </div>
</section>


<section class="categories container">
    <div class="category-grid">
        <button class="category-card" onclick={() => navigateToProducts('shoes')}>
            <img src={shoe_pic} alt="Shoes">
            <div class="category-info">
                <h3>Shoes</h3>
                <p>Footwear that can keep up</p>
            </div>
        </button>
        <button class="category-card" onclick={() => navigateToProducts('backpacks')}>
            <img src={bags_pic} alt="Bags">
            <div class="category-info">
                <h3>Backpacks</h3>
                <p>Carry what you need in style</p>
            </div>
        </button>
        <button class="category-card" onclick={() => navigateToProducts('jackets')}>
            <img src={jackets_pic} alt="Jackets">
            <div class="category-info">
                <h3>Jackets</h3>
                <p>Stay warm. Stay Stylish.</p>
            </div>
        </button>
    </div>
</section>

<section class="products container">
    <div class="section-header">
        <h2>re:STOCK</h2>
        <p>shop our new drops</p>
    </div>

    <div class="filter-buttons">
        <button 
            class="filter-btn" 
            class:active={selectedCategory === 'all'}
            onclick={() => filterCategory('all')}
        >
            All Products
        </button>
        <button 
            class="filter-btn" 
            class:active={selectedCategory === 'shoes'}
            onclick={() => filterCategory('shoes')}
        >
            Shoes
        </button>
        <button 
            class="filter-btn" 
            class:active={selectedCategory === 'backpacks'}
            onclick={() => filterCategory('backpacks')}
        >
            Backpacks
        </button>
        <button 
            class="filter-btn" 
            class:active={selectedCategory === 'jackets'}
            onclick={() => filterCategory('jackets')}
        >
            Jackets
        </button>
        <button 
            class="filter-btn" 
            class:active={selectedCategory === 'accessories'}
            onclick={() => filterCategory('accessories')}
        >
            Accessories
        </button>
    </div>

    <ProductGrid products={previewProducts} {loading} />
    
    <!-- more than 2 items:-->
    {#if filteredProducts.length > 2}
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-secondary" onclick={() => navigateToProducts(selectedCategory)}>
                View All {filteredProducts.length} {selectedCategory === 'all' ? 'Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} →
            </button>
        </div>
    {:else if filteredProducts.length > 0}
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-secondary" onclick={() => navigateToProducts(selectedCategory)}>
                View {selectedCategory === 'all' ? 'All Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} →
            </button>
        </div>
    {/if}
</section>

<section>
    <div class="cta-content">
        <h2>Shop all re:treat</h2>
        <p>Explore our full collection of premium outdoor gear and lifestyle products</p>
        <button class="btn btn-secondary" onclick={() => navigateToProducts('all')}>View All Products →</button>
    </div>
</section>

<footer>
    <div class="container">
        <p>re:treat 2025 | IDM341_CCT52</p>
    </div>
</footer>

<div id="cart-drawer" class="cart-drawer" class:open={cartDrawerOpen}>
    <div class="cart-header">
        <h3>Shopping Cart</h3>
        <button class="close-btn" onclick={closeCart}>✕</button>
    </div>
    <div id="cart-items" class="cart-items">
        {#if cart.length === 0}
            <p class="empty-cart">Your cart is empty</p>
        {:else}
            {#each cart as item}
                <div class="cart-item">
                    <img src={item.image} alt={item.name}>
                    <div class="cart-item-info">
                        <h4>{item.name}</h4>
                        <p class="cart-item-price">${item.price.toFixed(2)}</p>
                        <div class="quantity-controls">
                            <button onclick={() => updateQuantity(item.id, -1)}>−</button>
                            <span>{item.quantity}</span>
                            <button onclick={() => updateQuantity(item.id, 1)}>+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick={() => removeFromCart(item.id)}>✕</button>
                </div>
            {/each}
        {/if}
    </div>
    <div class="cart-footer">
        <div class="cart-total">
            <span>Total:</span>
            <span id="cart-total">${cartTotal.toFixed(2)}</span>
        </div>
        <button class="btn btn-primary btn-full" disabled={cart.length === 0}>Checkout</button>
    </div>
</div>

{#if cartDrawerOpen}
    <div id="cart-overlay" class="cart-overlay visible" onclick={closeCart}></div>
{/if}

{#if modalOpen}
    <div id="product-modal" class="modal open">
        <div class="modal-content">
            <button class="close-btn" onclick={closeModal}>✕</button>
            <div id="modal-body">
                <!-- OPEN PRODUCT DETAILS -->
            </div>
        </div>
    </div>
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

/* Hero Section with Auto-Animating Carousel */
.hero {
    position: relative;
    height: 600px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.hero-carousel {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.hero-slide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    opacity: 0;
    transition: opacity 1.5s ease-in-out;
}

.hero-slide.active {
    opacity: 1;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        135deg, 
        rgba(118, 142, 53, 0.7) 0%, 
        rgba(95, 114, 41, 0.7) 100%
    );
    z-index: 1;
}

.hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    color: var(--white);
    max-width: 800px;
    padding: 2rem;
}

.hero-content h1 {
    font-family: 'K2D', sans-serif;
    font-size: 3.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-content p {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

/* Carousel Dots */
.carousel-dots {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 3;
    display: flex;
    gap: 0.75rem;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    border: 2px solid rgba(255, 255, 255, 0.8);
    cursor: pointer;
    transition: all 0.3s;
    padding: 0;
}

.dot:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
}

.dot.active {
    background: white;
    width: 30px;
    border-radius: 6px;
}

/**CART*/

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
/* Buttons */
.btn {
    padding: 0.75rem 2rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 1rem;
}

.btn-primary {
    background: var(--white);
    color: var(--primary);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.btn-secondary {
    background: var(--white);
    color: var(--primary);
}

.btn-full {
    width: 100%;
}

/* Categories Section */
.categories {
    padding: 5rem 0;
}

.category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
}

.category-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    cursor: pointer;
    height: 300px;
    transition: transform 0.3s;
    border: none; 
    padding: 0;
    width: 100%; 
    text-align: left;
}

.category-card:hover {
    transform: translateY(-8px);
}

.category-card img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.category-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 2rem;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: var(--white);
}

.category-info h3 {
    font-family: 'K2D', sans-serif;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

/* Products Section */
.products {
    padding: 5rem 0;
}

.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

.section-header h2 {
    font-family: 'K2D', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
}

.section-header p {
    color: var(--text-muted);
    font-size: 1.125rem;
}

/* Filter Buttons */
.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 3rem;
}

.filter-btn {
    padding: 0.5rem 1.5rem;
    border: 2px solid var(--border);
    background: var(--white);
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
}

.filter-btn.active,
.filter-btn:hover {
    background: var(--primary);
    color: var(--white);
    border-color: var(--primary);
}

/* CTA Section */
.cta {
    padding: 5rem 0;
}

.cta-content {
    background: var(--primary);
    border-radius: 16px;
    padding: 4rem 2rem;
    text-align: center;
    color: var(--white);
}

.cta-content h2 {
    font-family: 'K2D', sans-serif;
    font-size: 2.5rem;
    margin-bottom: 1rem;
}

.cta-content p {
    font-size: 1.125rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

/* Footer */
footer {
    background: #2a2a2a;
    color: var(--white);
    padding: 2rem 0;
    margin-top: 5rem;
    text-align: center;
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

/* Modal */
.modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-content {
    background: var(--white);
    border-radius: 16px;
    padding: 2rem;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

/* Responsive */
@media (max-width: 768px) {
    .hero {
        height: 500px;
    }
    
    .hero-content h1 {
        font-size: 2rem;
    }
    
    .hero-content p {
        font-size: 1.1rem;
    }
    
    .carousel-dots {
        bottom: 1rem;
    }
    
    .cart-drawer {
        width: 100%;
        right: -100%;
    }
}
</style>