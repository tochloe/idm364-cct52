<!--Full Grid Component-->

<script>
    import { goto } from '$app/navigation';
    
    let { products, loading } = $props();
    
    function openProduct(productId) {
        goto(`/item?id=${productId}`);
    }
</script>

<div class="product-grid">
    {#if loading}
        <div class="loading">Loading products...</div>
    {:else if products.length === 0}
        <div class="no-products">No products found</div>
    {:else}
        {#each products as product}
            <div class="product-card" onclick={() => openProduct(product.id)}>
                <img 
                    src={product.product_1} 
                    alt={product.product_name}
                    class="product-image"
                />
                <div class="product-info">
                    <h3 class="product-title">{product.product_name}</h3>
                    <p class="product-price">${Number(product.product_price).toFixed(2)}</p>
                    <div class="category-tags">
                        {#each (product.product_filters?.split(',') || []) as filter}
                            <span class="category-tag">{filter.trim()}</span>
                        {/each}
                    </div>
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.product-card {
    background: var(--white);
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
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
    font-size: 1rem;
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
}

.category-tag {
    font-size: 0.75rem;
    padding: 0.125rem 0.5rem;
    background: #f0f4e8;
    color: var(--primary);
    border-radius: 12px;
}

.loading, .no-products {
    text-align: center;
    padding: 3rem;
    color: var(--text-muted);
}
</style>