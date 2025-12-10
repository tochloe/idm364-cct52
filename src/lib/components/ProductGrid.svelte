<script>
    let { products = [], loading = false } = $props();
</script>

{#if loading}
    <div class="loading">
        <p>Loading products...</p>
    </div>
{:else if products.length === 0}
    <div class="no-products">
        <p>No products found</p>
    </div>
{:else}
    <div class="product-grid">
        {#each products as product (product.id)}
            <div class="product-card">
                <img 
                    src={product.product_1 || '/placeholder.jpg'} 
                    class="product-image" 
                    alt={product.product_name || 'Product'} 
                />
                <div class="product-info">
                    <div class="product-title">{product.product_name || 'Unnamed Product'}</div>
                    <div class="product-price">
                        ${product.product_price ? Number(product.product_price).toFixed(2) : '0.00'}
                    </div>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .loading, .no-products {
        text-align: center;
        padding: 3rem;
        color: #666666;
    }

    .product-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 2rem;
    }

    .product-card {
        background: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        transition: transform 0.3s, box-shadow 0.3s;
        cursor: pointer;
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
        color: #1a1a1a;
    }

    .product-price {
        color: #768e35;
        font-size: 1.25rem;
        font-weight: 700;
    }
</style>