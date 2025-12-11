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
    
    // Carousel state - only need current slide now
    let currentSlide = $state(0);
    
    // Import your hero images
    import hero1 from '$lib/img/header/slide1.jpg';
    import hero2 from '$lib/img/header/slide2.jpg';
    import hero3 from '$lib/img/header/slide3.jpg';
    
    // Array of hero images
    const heroImages = [hero1, hero2, hero3];
    
    // Auto-advance carousel
    $effect(() => {
        const interval = setInterval(() => {
            currentSlide = (currentSlide + 1) % heroImages.length;
        }, 5000); // Change slide every 5 seconds
        
        // Cleanup function
        return () => clearInterval(interval);
    });
    
    // Optional: Allow clicking dots to change slides
    function goToSlide(index) {
        currentSlide = index;
    }
    
    // Load products on mount using $effect
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
    
    let cartCount = $derived(cart.reduce((sum, item) => sum + item.quantity, 0));
    
    let filteredProducts = $derived(
        selectedCategory === 'all' 
            ? products 
            : products.filter(p => {
                if (p.category) return p.category === selectedCategory;
                if (p.categories && Array.isArray(p.categories)) {
                    return p.categories.includes(selectedCategory);
                }
                return false;
            })
    );

    import shoe_pic from '$lib/img/section_img/shoes.jpg';
    import bags_pic from '$lib/img/section_img/bags.jpg';
    import jackets_pic from '$lib/img/section_img/jackets.jpg';
</script>

<!-- Header stays the same -->
<header class="header">
    <div class="container">
        <div class="logo">re:treat</div>
        <button class="cart-btn" onclick={toggleCart}>Cart (<span>{cartCount}</span>)</button>
    </div>
</header>

<!-- Clean Auto-Animating Hero Section -->
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
    
    <!-- Overlay for better text readability -->
    <div class="hero-overlay"></div>
    
    <!-- Content -->
    <div class="hero-content">
        <h1>Gear Up for Adventure</h1>
        <p>Premium outdoor equipment for every journey</p>
        <button class="btn btn-primary" onclick={() => navigateToProducts('all')}>Shop Now</button>
    </div>
    
    <!-- Dots Indicator (optional - you can remove this too if you want) -->
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

<!-- Rest of your page ... -->
<section class="categories container">
    <div class="category-grid">
        <button class="category-card" onclick={() => navigateToProducts('shoes')}>
            <img src={shoe_pic} alt="Shoes">
            <div class="category-info">
                <h3>Shoes</h3>
                <p>Footwear that can keep up</p>
            </div>
        </button>
        <button class="category-card" onclick={() => navigateToProducts('bags')}>
            <img src={bags_pic} alt="Bags">
            <div class="category-info">
                <h3>Bags</h3>
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
            class:active={selectedCategory === 'bags'}
            onclick={() => filterCategory('bags')}
        >
            Bags
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

    <ProductGrid products={filteredProducts} {loading} />
    
    {#if filteredProducts.length > 0}
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-secondary" onclick={() => navigateToProducts(selectedCategory)}>
                View All {selectedCategory === 'all' ? 'Products' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} →
            </button>
        </div>
    {/if}
</section>

<section class="cta container">
    <div class="cta-content">
        <h2>Shop all re:treat</h2>
        <p>Explore our full collection of premium outdoor gear and lifestyle products</p>
        <button class="btn btn-secondary" onclick={() => navigateToProducts('all')}>View All Products →</button>
    </div>
</section>

<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-section">
                <h4>re:treat</h4>
                <p>Premium outdoor gear for adventurers</p>
            </div>
            <div class="footer-section">
                <h4>Shop</h4>
                <a href="#shoes">Shoes</a>
                <a href="#bags">Bags</a>
                <a href="#jackets">Jackets</a>
                <a href="#accessories">Accessories</a>
            </div>
            <div class="footer-section">
                <h4>Company</h4>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
                <a href="#shipping">Shipping</a>
                <a href="#returns">Returns</a>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 re:treat. idm364-cct52.</p>
        </div>
    </div>
</footer>

<div id="cart-drawer" class="cart-drawer" class:open={cartDrawerOpen}>
    <div class="cart-header">
        <h3>Shopping Cart</h3>
        <button class="close-btn" onclick={closeCart}>✕</button>
    </div>
    <div id="cart-items" class="cart-items">
        <!-- Cart items will be inserted here -->
    </div>
    <div class="cart-footer">
        <div class="cart-total">
            <span>Total:</span>
            <span id="cart-total">$0.00</span>
        </div>
        <button class="btn btn-primary btn-full">Checkout</button>
    </div>
</div>

{#if cartDrawerOpen}
    <div id="cart-overlay" class="cart-overlay visible"></div>
{/if}

{#if modalOpen}
    <div id="product-modal" class="modal open">
        <div class="modal-content">
            <button class="close-btn" onclick={closeModal}>✕</button>
            <div id="modal-body">
                <!-- Product details will be inserted here -->
            </div>
        </div>
    </div>
{/if}

<style>
/* Your existing global styles */
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
.footer {
    background: #2a2a2a;
    color: var(--white);
    padding: 3rem 0 1rem;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.footer-section h4 {
    margin-bottom: 1rem;
}

.footer-section a {
    display: block;
    color: rgba(255,255,255,0.7);
    text-decoration: none;
    margin-bottom: 0.5rem;
    transition: color 0.3s;
}

.footer-section a:hover {
    color: var(--white);
}

.footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
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