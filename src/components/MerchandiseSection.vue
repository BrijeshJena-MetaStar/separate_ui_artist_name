<template>
  <section class="merchandise-section">
    <div class="container">
      <div class="merchandise-header">
        <h2 class="merchandise-title">The Shop</h2>
        <p class="merchandise-subtitle">Signature merchandise, artiste brands & collectibles</p>
      </div>
      
      <div class="merchandise-showcase">
        <div class="showcase-left">
          <div v-if="isProductsLoading" class="loading-placeholder">
            <v-progress-circular indeterminate color="#FF6B35" size="48"></v-progress-circular>
            <p>Loading exclusive collection...</p>
          </div>
          <div v-else-if="featuredProduct" class="featured-item" @click="viewProduct(featuredProduct)">
            <div class="item-visual">
              <div class="item-glow"></div>
              <div class="item-preview">
                <img 
                  v-if="featuredProduct.product_image && featuredProduct.product_image.length > 0" 
                  :src="featuredProduct.product_image[0]" 
                  :alt="featuredProduct.product_name"
                  class="featured-product-image"
                />
              </div>
            </div>
            <div class="item-details">
              <h3>{{ featuredProduct.product_name.toLowerCase() }}</h3>
              <div class="item-meta">
                <span class="availability">{{ getProductPrice(featuredProduct) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-placeholder">
            <v-icon size="64" color="rgba(255, 255, 255, 0.3)">mdi-package-variant</v-icon>
            <p>No merchandise available at the moment</p>
          </div>
        </div>
        
        <div class="showcase-right">
          <div class="products-container">
            <div class="products-grid">
              <div 
                class="product-card" 
                v-for="product in displayProducts" 
                :key="product.product_id"
                @click="viewProduct(product)"
              >
                <div class="product-image-container">
                  <img 
                    v-if="product.product_image && product.product_image.length > 0" 
                    :src="product.product_image[0]" 
                    :alt="product.product_name"
                    class="product-card-image"
                  />
                  <div class="product-overlay">
                    <div class="product-price-badge">
                      {{ getProductPrice(product) }}
                    </div>
                  </div>
                </div>
                
                <div class="product-card-content">
                  <h4 class="product-title">{{ getProductTitle(product.product_name) }}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import router from '@/router';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';

// Props
const appStore = useAppStore()
const props = defineProps({
  artistName: {
    type: String,
    required: true
  },
  artistId: {
    type: [String, Number],
    default: null
  },
  isProductsLoading: {
    type: Boolean,
    default: false
  },
  products: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['viewProduct']);

// Computed properties for products
const displayProducts = computed(() => {
  if (!props.products || props.products.length === 0) return [];
  
  // Show all products except the featured one (products are already filtered for PRODUCT type)
  if (props.products.length > 1) {
    return props.products.slice(1);
  }
  // If only one product, return empty array (it's the featured one)
  return [];
});

// Computed property for featured product (products are already filtered for PRODUCT type)
const featuredProduct = computed(() => {
  if (!props.products || props.products.length === 0) return null;
  
  // Return the first product (already filtered for PRODUCT type)
  return props.products[0] || null;
});


const getProductPrice = (product) => {
  if (!product || !product.currencies || product.currencies.length === 0) {
    return 'Price on request';
  }

  const code = (appStore.currencyCode || '').toUpperCase();
  const currency = code
    ? product.currencies.find((c) => (c.currency || '').toUpperCase() === code)
    : null;

  if (!currency) return '--';

  if (currency.price === 0) {
    return 'Free';
  }

  const displayCurrency = code || currency.currency || 'USD';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currency.price);
};

const getProductStatusClass = (product) => {
  if (!product) return 'available';
  
  // Generic availability logic that works for any product
  // Check if product has stock information
  if (product.stock_quantity !== undefined) {
    if (product.stock_quantity <= 0) return 'sold-out';
    if (product.stock_quantity <= 5) return 'limited';
    return 'available';
  }
  
  // Check if product is free (like NFTs)
  if (product.currencies && product.currencies.length > 0) {
    if (product.currencies[0].price === 0) return 'available';
  }
  
  // Default to available
  return 'available';
};

const getProductStatusText = (product) => {
  if (!product) return 'Available';
  
  const statusClass = getProductStatusClass(product);
  if (statusClass === 'limited') return 'Limited Stock';
  if (statusClass === 'sold-out') return 'Sold Out';
  return 'Available';
};

const viewProduct = (product) => {
  router.push({path: `productDetails/${product.product_id}`});
  // router.push({path: `${appStore.artistDomain}/productDetails/${product.product_id}`});
};

const getProductTitle = (productName) => {
  if (!productName) return '';
  
  // Case-insensitive split on 'by', 'BY', or 'By'
  const regex = /by/i;
  const parts = productName.split(regex);
  
  // Return the first part (before 'by'), trimmed
  return parts[0].trim();
};
</script>

<style scoped>
.merchandise-section {
  padding: 60px 0;
  position: relative;
  overflow: hidden;
}

.container {
  /* max-width: 1500px; */
  margin: 0 auto;
  padding: 0 24px;
}

.merchandise-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(255, 107, 53, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(78, 205, 196, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.merchandise-header {
  /* text-align: center; */
  margin-bottom: 60px;
  /* padding: 0 24px; */
  /* position: relative;
  z-index: 2; */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.merchandise-title {
  font-size: 2.5rem;
  color: #ffffff;
  /* padding-left: 20px; */
  font-weight: 600;
  background: #fff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.merchandise-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
  font-weight: 300;
}

.merchandise-showcase {
  display: grid;
  /* width: 80%; */
  margin: auto;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: start;
  position: relative;
  z-index: 2;
}

.showcase-left {
  position: relative;
}

.featured-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 24px;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.featured-item:hover {
  transform: translateY(-8px);
  border-color: rgba(53, 191, 255, 0.4);
  box-shadow: 0 10px 50px rgba(52, 81, 250, 0.15);
}

.item-visual {
  position: relative;
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  border-radius: 8px;
  overflow: hidden;
}

.item-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(53, 117, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
}

.item-preview {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
}

.featured-product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
  border-radius: 6px;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-transform: capitalize;
}

.item-details h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: auto;
}

.availability {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  background: rgba(78, 205, 196, 0.1);
  color: #4ECDC4;
  border: 1px solid rgba(78, 205, 196, 0.3);
}

.showcase-right {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.products-container {
  overflow-y: auto;
  max-height: 600px;
  padding-right: 8px;
  -webkit-overflow-scrolling: touch;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding-bottom: 16px;
}

.product-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  height: 300px;
  min-width: 0;
}

.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(53, 67, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.product-image-container {
  position: relative;
  height: 230px;
  overflow: hidden;
  border-radius: 12px 12px 0 0;
}

.product-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.product-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px 12px 0 0;
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.product-price-badge {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.product-card-content {
  padding: 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
}

.product-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.loading-placeholder, .empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.loading-placeholder p, .empty-placeholder p {
  margin-top: 16px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.empty-placeholder .v-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-products {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.no-products p {
  margin-top: 16px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .merchandise-showcase {
    width: 80%;
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px;
  }
  
  .product-card {
    height: 260px;
  }
  
  .product-image-container {
    height: 170px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
  
  .merchandise-section {
    padding: 60px 0;
  }
  
  .merchandise-title {
    font-size: 2rem;
  }
  
  .merchandise-subtitle {
    font-size: 1rem;
  }
  
  .featured-item {
    padding: 24px;
    height: 350px;
  }
  
  .item-visual {
    height: 150px;
    margin-bottom: 20px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }
  
  .product-card {
    height: 240px;
  }
  
  .product-image-container {
    height: 170px;
  }
  
  .product-card-content {
    padding: 10px;
  }
  
  .product-title {
    font-size: 0.8rem;
  }
  
  .product-status {
    font-size: 0.6rem;
    padding: 2px 5px;
  }
  
  .products-container {
    max-height: 500px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0;
  }

  .merchandise-header{
    margin-bottom: 8px;
  }
  
  .merchandise-title {
    font-size: 20px;
  }
  
  .merchandise-showcase {
    gap: 24px;
    width: 100%;
  }
  
  .featured-item {
    height: 320px;
    padding: 20px;
  }
  
  .item-visual {
    height: 220px;
    margin-bottom: 16px;
  }

  .item-details h3{
    font-size: 16px;
  }
  
  .item-meta {
    flex-direction: column;
    gap: 8px;
    width: fit-content;
  }

  .availability{
    padding: 4px 8px;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
  }
  
  .product-card {
    height: 220px;
  }
  
  .product-image-container {
    height: 180px;
  }
  
  .product-card-content {
    padding: 8px;
  }
  
  .product-title {
    font-size: 0.75rem;
    margin-bottom: 6px;
  }
  
  .product-status {
    font-size: 0.55rem;
    padding: 2px 4px;
  }
  
  .products-container {
    max-height: 600px;
  }
}
</style>