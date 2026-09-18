<template>
  <section class="album-section">
    <div class="container">
      <div class="album-header">
        <h2 class="album-title">Music</h2>
        <p class="album-subtitle">Exclusive songs and digital music collections.</p>
      </div>      
 
      <div v-if="isProductsLoading" class="loading-placeholder">
        <v-progress-circular indeterminate color="#ffffff" size="48"></v-progress-circular>
        <p>Loading music collection...</p>
      </div>
      
      <div v-else-if="allProducts.length > 0" class="albums-scroll-container">
        <div class="albums-row">
          <div 
            class="album-card" 
            v-for="product in allProducts" 
            :key="product.product_id"
            @click="viewProduct(product)"
          >
            <div class="album-art">
              <v-img 
                :src="product.product_image && product.product_image.length > 0 ? product.product_image[0] : dummyImage" 
                :alt="product.product_name"
                class="album-image"
                height="100%"
                width="100%"
                cover
              >
                <template v-slot:placeholder>
                  <v-row class="fill-height ma-0" align="center" justify="center">
                    <v-icon size="48" color="rgba(255, 255, 255, 0.3)">mdi-music-note</v-icon>
                  </v-row>
                </template>
              </v-img>
            </div>
            <h3 class="album-title">{{ getProductTitle(product.product_name) }}</h3>
            <p class="album-artist">{{ getProductPrice(product) }}</p>
          </div>
        </div>
      </div>
      
      <div v-else class="empty-placeholder">
        <v-icon size="64" color="rgba(255, 255, 255, 0.3)">mdi-music-note</v-icon>
        <p>No albums available at the moment</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import router from '@/router';
import { useAppStore } from '@/stores/app';
import { computed } from 'vue';
import dummyImage from "@/assets/image_not_available.jpg";

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

const emit = defineEmits(['viewProduct']);

const allProducts = computed(() => {
  if (!props.products || props.products.length === 0) return [];
  return props.products;
});

const displayProducts = computed(() => {
  if (!props.products || props.products.length === 0) return [];
  if (props.products.length > 1) {
    return props.products.slice(1);
  }
  return [];
});

const featuredProduct = computed(() => {
  if (!props.products || props.products.length === 0) return null;
  return props.products[0] || null;
});

const getProductPrice = (product) => {
  if (!product || !product.currencies || product.currencies.length === 0) {
    return 'Price on request';
  }

  const code = appStore.currencyCode || 'INR';
  const currency = product.currencies.find((c) => (c.currency || '').toUpperCase() === code.toUpperCase())
    ?? product.currencies[0];

  if (currency.price === 0) {
    return 'Free';
  }

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(currency.price);

  return formattedPrice;
};

const viewProduct = (product) => {
  router.push({path: `paidSongs/${product.product_id}`});
  // router.push({path: `${appStore.artistDomain}/paidSongs/${product.product_id}`});
};

const getProductTitle = (productName) => {
  if (!productName) return '';
  const regex = /by/i;
  const parts = productName.split(regex);
  return parts[0].trim();
};
</script>

<style scoped>
.album-section {
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
  z-index: 1;
}

.album-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.album-section::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.1) 20%, 
    rgba(255, 255, 255, 0.1) 80%, 
    transparent 100%);
  pointer-events: none;
}

.album-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 64px;
  position: relative;
}

.album-header::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.6), transparent);
  border-radius: 2px;
}

.album-header .album-title {
  font-size: 2.75rem;
  color: #ffffff;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -1px;
  line-height: 1.2;
  transition: all 0.3s ease;
}

.album-subtitle {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.3px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 24px 0;
  text-transform: capitalize;
  letter-spacing: -0.5px;
}

.albums-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0 16px 0;
  margin: 0 -24px;
  padding-left: 24px;
  padding-right: 24px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
}

.albums-scroll-container::-webkit-scrollbar {
  height: 4px;
}

.albums-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.albums-scroll-container::-webkit-scrollbar-thumb {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.4), rgba(236, 72, 153, 0.4));
  border-radius: 10px;
  transition: background 0.3s ease;
}

.albums-scroll-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(90deg, rgba(168, 85, 247, 0.6), rgba(236, 72, 153, 0.6));
}

.albums-row {
  display: flex;
  gap: 24px;
  padding-bottom: 8px;
  width: max-content;
}

.album-card {
  flex-shrink: 0;
  width: 180px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.album-card::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(236, 72, 153, 0.2));
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: -1;
  filter: blur(8px);
}

.album-card:hover {
  transform: translateY(-8px);
}

.album-card:hover::before {
  opacity: 1;
}

.album-art {
  width: 180px;
  height: 180px;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 14px;
  background: rgba(255, 255, 255, 0.03);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.album-card:hover .album-art {
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.5),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 0 30px rgba(168, 85, 247, 0.2);
  transform: scale(1.02);
}

.album-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.album-card:hover .album-image {
  transform: scale(1.08);
}

.album-card .album-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 6px 0;
  line-height: 1.4;
  text-transform: capitalize;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  letter-spacing: 0.2px;
}

.album-card:hover .album-title {
  color: rgba(255, 255, 255, 0.95);
}

.album-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
  font-weight: 400;
}

.album-card:hover .album-artist {
  color: rgba(255, 255, 255, 0.75);
}

.loading-placeholder, .empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  padding: 60px 20px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.loading-placeholder p, .empty-placeholder p {
  margin-top: 20px;
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.65);
  font-weight: 400;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .album-section {
    padding: 60px 0;
  }
  
  .container {
    padding: 0 20px;
  }
  
  .albums-scroll-container {
    margin: 0 -20px;
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .album-header {
    margin-bottom: 48px;
  }
  
  .album-header::after {
    width: 50px;
    bottom: -16px;
  }
  
  .album-header .album-title {
    font-size: 2.25rem;
  }
  
  .album-subtitle {
    font-size: 0.95rem;
  }
  
  .section-title {
    font-size: 1.25rem;
    margin-bottom: 20px;
  }
  
  .albums-row {
    gap: 20px;
  }
  
  .album-card {
    width: 160px;
  }
  
  .album-art {
    width: 160px;
    height: 160px;
    border-radius: 12px;
  }
  
  .album-card .album-title {
    font-size: 0.9rem;
  }
  
  .album-artist {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .album-section {
    padding: 48px 0;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .albums-scroll-container {
    margin: 0 -16px;
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .album-header {
    margin-bottom: 40px;
    gap: 10px;
  }
  
  .album-header::after {
    width: 40px;
    bottom: -12px;
  }
  
  .album-header .album-title {
    font-size: 1.75rem;
    letter-spacing: -0.5px;
  }
  
  .album-subtitle {
    font-size: 0.9rem;
  }
  
  .section-title {
    font-size: 1.1rem;
    margin-bottom: 16px;
  }
  
  .albums-row {
    gap: 16px;
  }
  
  .album-card {
    width: 150px;
  }
  
  .album-art {
    width: 150px;
    height: 150px;
    border-radius: 12px;
    margin-bottom: 12px;
  }
  
  .album-card .album-title {
    font-size: 0.875rem;
    margin-bottom: 5px;
  }
  
  .album-artist {
    font-size: 0.8rem;
  }
  
  .loading-placeholder, .empty-placeholder {
    min-height: 300px;
    padding: 40px 16px;
  }
}
</style>