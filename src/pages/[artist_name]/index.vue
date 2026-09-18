<template>
  <div class="artist-landing-page">
    <!-- Skeleton loading: same layout as hero + sections -->
    <template v-if="isArtistLoading">
      <section class="hero-section hero-container artist-skeleton-hero">
        <div class="hero-content">
          <div class="hero-left">
            <div class="artist-skeleton-back" />
            <div class="hero-details">
              <div class="hero-title-wrapper">
                <div class="artist-skeleton-title" />
                <div class="artist-skeleton-subscribe" />
              </div>
              <div class="artist-skeleton-subtitle" />
              <div class="artist-skeleton-promo">
                <div class="artist-skeleton-promo-image" />
                <div class="artist-skeleton-promo-content">
                  <div class="artist-skeleton-line" />
                  <div class="artist-skeleton-line short" />
                </div>
              </div>
            </div>
          </div>
          <div class="hero-avatar">
            <div class="artist-skeleton-avatar" />
          </div>
        </div>
      </section>
      <div class="section-container artist-skeleton-sections">
        <div class="artist-skeleton-section" />
        <div class="artist-skeleton-section" />
        <div class="artist-skeleton-section" />
      </div>
    </template>

    <!-- Error state -->
    <div v-else-if="artistLoadError" class="artist-error">
      <p>{{ artistLoadError }}</p>
      <button class="back-button" @click="goBack">Back to all artistes</button>
    </div>

    <!-- Real content when loaded -->
    <template v-else-if="selectedArtist">
    <!-- Hero Section -->
    <section class="hero-section hero-container">
      <div class="hero-content">
        <!-- Artist Details -->
        <div class="hero-left">
          <button @click="goBack" class="back-button">
            <v-icon size="24" color="white">mdi-arrow-left</v-icon>
            <span class="back-text">Back to all artistes</span>
          </button>
          <div class="hero-details">
            <div class="hero-title-wrapper">
              <h1 class="hero-title">{{ selectedArtist?.text }}</h1>
              <!-- Subscribe Button -->
              <button 
                @click="toggleSubscription" 
                class="subscribe-btn"
                :class="{ 'subscribed': isSubscribed, 'loading': isSubscriptionLoading || isCheckingSubscription }"
                :disabled="isSubscriptionLoading || isCheckingSubscription || isSubscribed"
              >
                <v-icon 
                  v-if="!isCheckingSubscription" 
                  size="18" 
                  class="subscribe-icon"
                >
                  {{ isSubscribed ? 'mdi-bell-check' : 'mdi-bell-plus' }}
                </v-icon>
                <v-icon 
                  v-else 
                  size="18" 
                  class="subscribe-icon spinning"
                >
                  mdi-loading
                </v-icon>
                <span class="subscribe-text">
                  {{ 
                    isCheckingSubscription ? 'Loading...' : 
                    isSubscriptionLoading ? 'Processing...' : 
                    (isSubscribed ? 'Subscribed' : 'Subscribe') 
                  }}
                </span>
              </button>
            </div>

            <!-- Subscription benefits — visible only when not yet subscribed -->
            <!-- <Transition name="benefits">
              <div v-if="!isSubscribed && !isCheckingSubscription" class="benefits-wrapper">
                <div class="benefits-pass-stamp">
                  <span class="benefits-pass-title">SUB PASS</span>
                  <span class="benefits-pass-subtitle">Unlock route</span>
                </div>
                <div class="benefits-route">
                  <span class="benefits-route-line"></span>
                  <div class="benefit-stop">
                    <span class="benefit-stop-icon"><v-icon size="12">mdi-music-box-multiple-outline</v-icon></span>
                    <span class="benefit-stop-label">Albums</span>
                  </div>
                  <div class="benefit-stop">
                    <span class="benefit-stop-icon"><v-icon size="12">mdi-new-box</v-icon></span>
                    <span class="benefit-stop-label">New</span>
                  </div>
                  <div class="benefit-stop">
                    <span class="benefit-stop-icon"><v-icon size="12">mdi-star-outline</v-icon></span>
                    <span class="benefit-stop-label">Exclusive</span>
                  </div>
                  <div class="benefit-stop">
                    <span class="benefit-stop-icon"><v-icon size="12">mdi-download-outline</v-icon></span>
                    <span class="benefit-stop-label">Downloads</span>
                  </div>
                </div>
              </div>
            </Transition> -->

            <p class="hero-subtitle">{{ selectedArtist?.shortDescription }}</p>

            <div class="promo-card">
              <div class="promo-image-wrapper">
                <img
                  :src="promotionalContent.imageUrl"
                  :alt="promotionalContent.heading"
                  class="promo-image"
                />
                <div class="promo-overlay"></div>
              </div>
              <div class="promo-content">
                <h3 class="promo-heading">{{ promotionalContent.heading }}</h3>
                <p class="promo-description">
                  {{ promotionalContent.description }}
                </p>
                <button
                  @click="handlePromoClick(promotionalContent.ctaLink)"
                  class="promo-cta"
                >
                  <span class="cta-text">{{ promotionalContent.ctaText }}</span>
                  <v-icon size="18" class="cta-icon">mdi-arrow-right</v-icon>
                </button>
              </div>
            </div>

            <!-- <div class="hero-actions">
              <button @click="scrollToSection('courses', 'merchandise')" class="hero-btn primary-btn">
                <span class="btn-text">Explore Content</span>
                <div class="btn-glow"></div>
              </button>
            </div> -->
          </div>

          <!-- Promotional Element -->
        </div>

        <!-- Artist Image -->
        <div class="hero-avatar">
          <button @click="goBack" class="back-button1">
            <v-icon size="24" color="white">mdi-arrow-left</v-icon>
            <span class="back-text">Back to all artistes</span>
          </button>
          <!-- Decorative Background Elements -->
          <div class="avatar-background">
            <div class="gradient-circle"></div>
            <div class="decorative-ring ring-1"></div>
            <div class="decorative-ring ring-2"></div>
            <div class="decorative-ring ring-3"></div>
          </div>

          <img
            :src="selectedArtist?.imageRemoveBgUrl"
            :alt="selectedArtist?.text"
            class="artist-hero-avatar"
          />
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="scroll-indicator" @click="scrollToContent" v-show="showScrollIndicator">
        <div class="scroll-indicator-text">Explore More</div>
        <div class="scroll-indicator-icon">
          <v-icon size="32" color="white" class="bounce-animation">mdi-chevron-down</v-icon>
        </div>
      </div>
    </section>

    <!-- Free Video Section -->
    <div class="section-container" v-if="artistVideos.length > 0">
      <FreeVideoSection
        id="videos"
        :artist-videos="artistVideos"
        :paid-videos="paidVideos"
        :is-videos-loading="isVideosLoading"
        :is-paid-videos-loading="isPaidVideosLoading"
        :artist-name="selectedArtist?.text"
        :is-subscribed="isSubscribed"
        :default-thumbnail="selectedArtist?.imageUrl || selectedArtist?.image || selectedArtist?.imageRemoveBgUrl"
        :on-subscribe="toggleSubscription"
        @open-video-carousel="openVideoCarousel"
        @open-all-videos-grid="openAllVideosGrid"
      />
    </div>

    <!-- Course and Meet Section -->
    <div class="section-container">
      <CourseMeetSection
        id="courses"
        v-if="(artistProducts && artistProducts.length > 0) || artistVideos.length > 0 || isVideosLoading"
        :artist-name="selectedArtist?.text"
        :products="artistProducts"
        :artist-videos="artistVideos"
        :is-videos-loading="isVideosLoading"
        :is-subscribed="isSubscribed"
        :default-thumbnail="selectedArtist?.imageUrl || selectedArtist?.image || selectedArtist?.imageRemoveBgUrl"
        :on-subscribe="toggleSubscription"
        @view-product="viewProduct"
      />
    </div>

    <!-- Media Carousel -->
    <div class="section-container">
      <MediaCarousel
        id="videos"
        :is-visible="isCarouselVisible"
        :media-list="carouselMediaList"
        :selected-index="selectedCarouselIndex"
        @close="closeVideoCarousel"
        @media-change="onCarouselMediaChange"
        @open-carousel="openVideoCarousel"
        :artist-name="selectedArtist?.text"
        :is-subscribed="isSubscribed"
        :on-subscribe="toggleSubscription"
      />
    </div>

    <div class="section-container">
      <MerchandiseSection
        id="merchandise"
        v-if="merchandiseProducts && merchandiseProducts.length > 0"
        :artist-name="selectedArtist?.text"
        :artist-id="selectedArtist?.id"
        :is-products-loading="isProductsLoading"
        :products="merchandiseProducts"
        @view-product="viewProduct"
      />
    </div>

    <div class="section-container">
      <AlbumSection
        id="album"
        v-if="albumProducts && albumProducts.length > 0"
        :artist-name="selectedArtist?.text"
        :artist-id="selectedArtist?.id"
        :is-products-loading="isProductsLoading"
        :products="albumProducts"
        @view-product="viewProduct"
      />
    </div>

    <!-- Dedicated Karaoke Section (system flag from GET /api/system-properties/features when logged in) -->
    <div v-if="isKaraokeFeatureLive" class="section-container">
      <KaraokeSection
        :artist-name="selectedArtist?.text"
        :artist-id="selectedArtist?.id"
        :is-karaoke="selectedArtist?.hasKaraoke"
      />
    </div>

    <!-- <div
      class="music-player-container section-container"
      v-if="artistSongs.length > 0"
    >
      <MusicPlayer :album-data="albumData" />
    </div> -->

    <!-- Social Links -->
    <section class="social-section">
      <div class="container">
        <div class="social-header">
          <h3>Connect</h3>
        </div>

        <div class="social-links">
          <a
            v-for="(link, idx) in selectedArtist?.links || []"
            :key="idx"
            :href="link.url"
            target="_blank"
            class="social-link"
            :title="link.label"
          >
            <v-icon size="20">{{ getLinkIcon(link.label) }}</v-icon>
            <span>{{ link.label }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Snackbar Component -->
    <Snackbar ref="snackbarRef" />
    </template>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAppStore } from "@/stores/app";
import { getArtists, getArtistVideos, unsubscribeFromArtist, checkSubscriptionStatus, getSongs, getSubscriptionPlans } from "@/services/artistService";
// import { getAllProducts } from "@/services/productService";
import { getUserToken } from "@/services/userService";
import { readFeatureFlagsSession } from "@/utils/featureFlagsSession";
import { loadSystemFeatureFlagsAfterLogin } from "@/services/featureFlagsAfterLogin";
import { defineAsyncComponent, reactive } from "vue";

const MediaCarousel = defineAsyncComponent(() => import("@/components/MediaCarousel.vue"));
const FreeVideoSection = defineAsyncComponent(() => import("@/components/FreeVideoSection.vue"));
const KaraokeSection = defineAsyncComponent(() => import("@/components/KaraokeSection.vue"));
const MerchandiseSection = defineAsyncComponent(() => import("@/components/MerchandiseSection.vue"));
const AlbumSection = defineAsyncComponent(() => import("@/components/AlbumSection.vue"));
const CourseMeetSection = defineAsyncComponent(() => import("@/components/CourseMeetSection.vue"));
const Snackbar = defineAsyncComponent(() => import("@/components/Snackbar.vue"));
const MusicPlayer = defineAsyncComponent(() => import("@/components/MusicPlayer.vue"));

// Dummy data for the music player

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();

// Back button functionality
const goBack = () => {
  router.push("/discover");
};

// Artist details from API (checkSubscriptionStatus / GET /api/artists/:id)
const artistDetailsFromApi = ref(null);
const isArtistLoading = ref(true);
const artistLoadError = ref(null);

/** Normalize API artist shape to template shape (id, text, domain, imageUrl, etc.) */
function normalizeApiArtist(apiArtist) {
  if (!apiArtist) return null;
  const a = apiArtist;
  return {
    id: a.id,
    text: a.name ?? a.text ?? "",
    domain: a.domain ?? "",
    imageUrl: a.image_url ?? a.imageUrl ?? "",
    imageRemoveBgUrl: a.image_removebg_url ?? a.imageRemoveBgUrl ?? a.image_url ?? a.imageUrl ?? "",
    image: a.image_url ?? a.imageUrl ?? "",
    shortDescription: a.short_description ?? a.shortDescription ?? a.description ?? "",
    description: a.description ?? "",
    links: a.links ?? [],
    hasKaraoke: a.has_karaoke ?? a.hasKaraoke ?? false,
    hasMusic: a.has_music ?? a.hasMusic ?? true,
    promotion: a.promotion ?? null,
    artisteverse: a.artisteverse ?? "",
  };
}

// Reactive state for artist videos
const artistVideos = ref([]);
const paidVideos = ref([]);
const isVideosLoading = ref(false);
const isPaidVideosLoading = ref(false);

// Reactive state for products
const artistProducts = ref([]);
const isProductsLoading = ref(false);

// Reactive state for video carousel
const isCarouselVisible = ref(false);
const selectedCarouselIndex = ref(0);

// Reactive state for subscription
const isSubscribed = ref(false);
const isSubscriptionLoading = ref(false);
const isCheckingSubscription = ref(true);
const hasSubscriptionPlans = ref(false);

// Reactive state for scroll indicator
const showScrollIndicator = ref(true);

// Reactive state for songs
const artistSongs = ref([]);
const isSongsLoading = ref(false);

/** localStorage cache filled by `loadSystemFeatureFlagsAfterLogin` (login or artist page if missing). */
const featureFlagsRevision = ref(0);
const isKaraokeFeatureLive = computed(() => {
  featureFlagsRevision.value;
  if (!getUserToken()) return false;
  const cached = readFeatureFlagsSession();
  return cached?.karaoke === true;
});

const selectedArtist = computed(() => artistDetailsFromApi.value);

const promotionalContent = computed(() => {
  if (selectedArtist.value?.promotion) {
    return selectedArtist.value.promotion;
  }

  // Placeholder content
  return {
    imageUrl:
      "https://d2b4rv4q8lb0q0.cloudfront.net/marketplace/artiste/Bickram Ghosh.jpg",
    heading: "Featured Content",
    description:
      "Discover exclusive content, upcoming events, and special releases from this artist.",
    ctaText: "Explore",
    ctaLink: "#",
  };
});

// Helper function to format duration from seconds to MM:SS
const formatDuration = (seconds) => {
  if (!seconds || seconds === 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const albumData = computed(() => ({
  id: selectedArtist.value?.domain || "artist-music",
  type: "Music Player",
  title: selectedArtist.value?.text || "",
  artist: selectedArtist.value?.text || "",
  coverImage: selectedArtist.value?.imageUrl || "",
  tracks: artistSongs.value
    .filter(song => song.is_active) // Only include active songs
    .map((song, index) => ({
      id: index,
      title: song.title,
      artist: selectedArtist.value?.text || "",
      duration: typeof song.duration === 'number' ? formatDuration(song.duration) : (song.duration || "00:00"),
      audioUrl: song.audio_url,
      thumbnail: song.thumbnail_url,
      description: song.description,
    })),
}));

// Filtered products for merchandise section (only PRODUCT type)
const merchandiseProducts = computed(() => {
  if (!artistProducts.value || artistProducts.value.length === 0) return [];

  return artistProducts.value.filter(
    (product) => product.product_type === "PRODUCT"
  );
});

// Filtered products for album section (only ALBUM type)
const albumProducts = computed(() => {
  if (!artistProducts.value || artistProducts.value.length === 0) return [];

  return artistProducts.value.filter(
    (product) => product.product_type === "ALBUM"
  );
});

const onCarouselMediaChange = (index) => {
  selectedCarouselIndex.value = index;
};

function getLinkIcon(label) {
  const lower = label.toLowerCase();
  if (lower.includes("instagram")) return "mdi-instagram";
  if (lower.includes("youtube")) return "mdi-youtube";
  if (lower.includes("immersive")) return "mdi-video-vintage";
  if (
    lower.includes("official") ||
    lower.includes("site") ||
    lower.includes("web")
  )
    return "mdi-web";
  return "mdi-link";
}

const carouselMediaList = computed(() => {
  const allVideos = [
    ...(artistVideos.value || []),
    ...(paidVideos.value || []),
  ];
  if (allVideos.length === 0) return [];

  return allVideos.map((video) => ({
    url: video.video_stream_url,
    title: video.title,
    description: video.description,
    mediaType: "video",
    thumbnail: video.thumbnail || video.thumbnail_url || "",
  }));
});

const openVideoCarousel = (index) => {
  selectedCarouselIndex.value = index;
  isCarouselVisible.value = true;
};

const openAllVideosGrid = () => {
  selectedCarouselIndex.value = undefined; // This will trigger grid view
  isCarouselVisible.value = true;
};

const closeVideoCarousel = () => {
  isCarouselVisible.value = false;
};

const scrollToSection = (sectionId, fallbackId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  } else if (fallbackId) {
    const element = document.getElementById(fallbackId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }
};

// const getProductsByType = (productType) => {
//   return appStore.getDisplayProducts().filter(product => product.product_type === productType);
// };

// Function to fetch free artist videos
const fetchArtistVideos = async () => {
  if (!selectedArtist.value?.id) return;

  try {
    isVideosLoading.value = true;

    const videos = await getArtistVideos(
      selectedArtist.value.id.toString(),
      true, // paid videos
      true // free videos
    );

    let finalVideos = videos.videos || [];

    // SHAAN
    // if(selectedArtist.value?.id === 7) {
    //   const comingSoonVideos = [
    //     {
    //       id: 'coming-soon-studio',
    //       video_id: 'coming-soon-studio',
    //       title: 'Shaan Storyteller - Unplugged - Coming Soon',
    //       category: 'STUDIO',
    //       description: 'Exclusive studio content coming soon',
    //       thumbnail: 'https://d2b4rv4q8lb0q0.cloudfront.net/shaan/thumbnail/Shaan+Storyteller+-+Unplugged+1+-+Coming+Soon.jpg',
    //       thumbnail_url: 'https://d2b4rv4q8lb0q0.cloudfront.net/shaan/thumbnail/Shaan+Storyteller+-+Unplugged+1+-+Coming+Soon.jpg',
    //       video_stream_url: null,
    //       pricing: 'FREE',
    //       duration: null
    //     }
    //   ];

    //   finalVideos = [...finalVideos, ...comingSoonVideos];
    // }

    // pratyush
   

    // priyadarshini govind
    // if(selectedArtist.value?.id === 4) {
    //   const comingSoonVideos = [
    //     {
    //       id: 'coming-soon-studio',
    //       video_id: 'coming-soon-studio',
    //       title: 'Priyadarsini Govind - Coming Soon',
    //       category: 'STUDIO',
    //       description: 'Exclusive studio content coming soon',
    //       thumbnail: selectedArtist.value?.imageUrl || selectedArtist.value?.image || selectedArtist.value?.imageRemoveBgUrl || '',
    //       thumbnail_url: selectedArtist.value?.imageUrl || selectedArtist.value?.image || selectedArtist.value?.imageRemoveBgUrl || '',
    //       video_stream_url: null,
    //       pricing: 'FREE',
    //       duration: null
    //     }
    //   ];

    //   finalVideos = [...finalVideos, ...comingSoonVideos];
    // }
    
    artistVideos.value = finalVideos;
  } catch (error) {
    console.error("Error fetching free artist videos:", error);
    artistVideos.value = [];
  } finally {
    isVideosLoading.value = false;
  }
};

// Function to fetch paid artist videos
const fetchPaidArtistVideos = async () => {
  if (!selectedArtist.value?.id) return;

  try {
    isPaidVideosLoading.value = true;

    const videos = await getArtistVideos(
      selectedArtist.value.id.toString(),
      true, // paid videos
      false // free videos
    );

    paidVideos.value = videos.videos;
  } catch (error) {
    console.error("Error fetching paid artist videos:", error);
    paidVideos.value = [];
  } finally {
    isPaidVideosLoading.value = false;
  }
};

// Function to fetch artist products
const fetchArtistProducts = async () => {
  if (!selectedArtist.value?.domain) return;

  try {
    isProductsLoading.value = true;

    await appStore.getProductsStore();

    artistProducts.value = [...(appStore.products || [])];
  } catch (error) {
    console.error("Error fetching artist products:", error);
    artistProducts.value = [];
  } finally {
    isProductsLoading.value = false;
  }
};

// Function to fetch artist songs
const fetchArtistSongs = async () => {
  if (!selectedArtist.value?.id) return;

  try {
    isSongsLoading.value = true;
    const response = await getSongs(selectedArtist.value.id.toString());
    artistSongs.value = response?.videos || [];
  } catch (error) {
    console.error("Error fetching artist songs:", error);
    artistSongs.value = [];
  } finally {
    isSongsLoading.value = false;
  }
};

// Function to check subscription status and load full artist details from API
const checkSubscription = async (artistId) => {
  if (!artistId) {
    isCheckingSubscription.value = false;
    return;
  }

  try {
    isCheckingSubscription.value = true;
    const response = await checkSubscriptionStatus(artistId);
    // Use full artist from API for page details
    const normalized = normalizeApiArtist(response);
    if (normalized) {
      artistDetailsFromApi.value = normalized;
    }
    isSubscribed.value = response?.is_subscribed ?? response?.isSubscribed ?? false;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    isSubscribed.value = false;
  } finally {
    isCheckingSubscription.value = false;
  }
};

// Snackbar ref
const snackbarRef = ref(null);

// Function to handle subscribe/unsubscribe
const toggleSubscription = async () => {
  if (!getUserToken()) {
    router.push({ path: "/login", query: { toSend: route.fullPath } });
    return;
  }

  if (!selectedArtist.value?.id || isSubscriptionLoading.value) return;

  if (!isSubscribed.value) {
    // Redirect to subscription checkout to pick a plan and pay
    router.push({
      path: `/singleCheckout/${selectedArtist.value.id}`,
      query: {
        type: '6',
        artist_id: String(selectedArtist.value.id),
        name: selectedArtist.value.text,
        image: selectedArtist.value.imageRemoveBgUrl || selectedArtist.value.imageUrl || '',
        brand_name: 'Subscription',
      },
    });
    return;
  }

  // Unsubscribe flow
  try {
    isSubscriptionLoading.value = true;
    await unsubscribeFromArtist(selectedArtist.value.id);
    isSubscribed.value = false;
    if (snackbarRef.value) {
      snackbarRef.value.showSnackbar(
        `You have unsubscribed from ${selectedArtist.value?.text}`,
        'info'
      );
    }
  } catch (error) {
    console.error("Error unsubscribing:", error);
    if (snackbarRef.value) {
      snackbarRef.value.showSnackbar('Failed to unsubscribe. Please try again.', 'error');
    }
  } finally {
    isSubscriptionLoading.value = false;
  }
};

// Scroll indicator functionality
const scrollToContent = () => {
  const heroSection = document.querySelector('.hero-section');
  if (heroSection) {
    const heroHeight = heroSection.offsetHeight;
    window.scrollTo({
      top: heroHeight - 100,
      behavior: 'smooth'
    });
  }
};

const handleScroll = () => {
  if (window.scrollY > 100) {
    showScrollIndicator.value = false;
  } else {
    showScrollIndicator.value = true;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const loadArtistPageData = async (targetRoute = route) => {
  const slug = targetRoute?.params?.artist_name;
  if (!slug) {
    isArtistLoading.value = false;
    return;
  }

  try {
    isArtistLoading.value = true;
    artistLoadError.value = null;
    const list = appStore.artistsApiList?.length ? appStore.artistsApiList : await getArtists();
    if (!appStore.artistsApiList?.length && list?.length) {
      appStore.setArtistsApiList(list);
    }
    const match = (list || []).find(
      (a) => (a.domain || "").toLowerCase().includes(String(slug).toLowerCase())
    );
    if (!match) {
      artistLoadError.value = "Artist not found";
      artistDetailsFromApi.value = null;
      isArtistLoading.value = false;
      return;
    }
    // Set initial artist from list so we have id/domain for fetches
    artistDetailsFromApi.value = normalizeApiArtist(match);
    const artistDomain = artistDetailsFromApi.value?.domain ?? match.domain;
    const cateogryId = targetRoute.query.category_id;
    appStore.artistDomain = artistDomain;
    appStore.categoryId = cateogryId;
    appStore.countryId = appStore.currencyCode;
    // appStore.getProductsStore();
    // Load full artist details and subscription from GET /api/artists/:id
    const artistId = artistDetailsFromApi.value?.id ?? match.id;
    await Promise.all([
      checkSubscription(artistId),
      getSubscriptionPlans(artistId)
        .then((res) => { hasSubscriptionPlans.value = (res?.data?.length ?? 0) > 0; })
        .catch(() => { hasSubscriptionPlans.value = false; }),
      loadSystemFeatureFlagsAfterLogin().then(() => {
        featureFlagsRevision.value += 1;
      }),
    ]);
    fetchArtistVideos();
    fetchPaidArtistVideos();
    fetchArtistProducts();
    fetchArtistSongs();
  } catch (err) {
    console.error("Error loading artist:", err);
    artistLoadError.value = err?.message ?? "Failed to load artist";
    artistDetailsFromApi.value = null;
  } finally {
    isArtistLoading.value = false;
  }
};

watch(
  () => route.fullPath,
  async () => {
    await loadArtistPageData(route);
  },
  { immediate: true }
);

const getArtisteverseUrl = () => {
  if (!selectedArtist.value?.artisteverse) return "#";
  return selectedArtist.value.artisteverse;
};

const viewProduct = (product) => {};

const handlePromoClick = (link) => {
  if (link) {
    if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      router.push(link);
    }
  }
};
</script>

<style scoped>
.artist-loading,
.artist-error {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #fff;
  padding: 24px;
}

.artist-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: artist-spin 0.8s linear infinite;
}

.artist-loading-text {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes artist-spin {
  to {
    transform: rotate(360deg);
  }
}
.artist-error p {
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

/* ---- Artist page skeleton loading ---- */
@keyframes skeleton-pulse {
  0%, 100% {
    background-color: rgba(255, 255, 255, 0.08);
  }
  50% {
    background-color: rgba(255, 255, 255, 0.15);
  }
}

.artist-skeleton-hero .hero-content {
  width: 100%;
}

.artist-skeleton-back {
  width: 140px;
  height: 44px;
  border-radius: 12px;
  animation: skeleton-pulse 1s ease-in-out infinite;
}

.artist-skeleton-title {
  width: 70%;
  max-width: 320px;
  height: 48px;
  border-radius: 8px;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
  margin-bottom: 8px;
}

.artist-skeleton-subscribe {
  width: 110px;
  height: 36px;
  border-radius: 8px;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.artist-skeleton-subtitle {
  width: 90%;
  max-width: 400px;
  height: 20px;
  border-radius: 6px;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
  margin: 16px 0 24px;
}

.artist-skeleton-promo {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 90%;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid hsla(0, 0%, 100%, 0.06);
}

.artist-skeleton-promo-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  flex-shrink: 0;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.artist-skeleton-promo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.artist-skeleton-line {
  height: 14px;
  border-radius: 4px;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.artist-skeleton-line.short {
  width: 75%;
}

.artist-skeleton-avatar {
  width: 100%;
  max-width: 30rem;
  height: 280px;
  border-radius: 16px;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

.artist-skeleton-sections {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-top: 24px;
}

.artist-skeleton-section {
  width: 100%;
  height: 120px;
  border-radius: 12px;
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}

@media (max-width: 1024px) {
  .artist-skeleton-hero .hero-left {
    align-items: center;
  }
  .artist-skeleton-back {
    display: none;
  }
  .artist-skeleton-title,
  .artist-skeleton-subtitle {
    margin-left: auto;
    margin-right: auto;
  }
  .artist-skeleton-promo {
    flex-direction: column;
    margin: 0 auto;
  }
  .artist-skeleton-avatar {
    height: 240px;
    max-width: 50vh;
  }
}

@media (max-width: 480px) {
  .artist-skeleton-avatar {
    height: 200px;
  }
  .artist-skeleton-section {
    height: 100px;
  }
}

.artist-landing-page {
  /* padding: 0 100px !important; */
  min-height: 100vh;
  /* background: linear-gradient(
    138deg,
    rgba(16, 21, 78, 0.9) 0%,
    rgba(13, 13, 13, 0.95) 50%,
    rgba(13, 13, 13, 1) 100%
  ); */
  color: #ffffff;
  overflow-x: hidden;
}

@media (max-width: 1024px) {
  .artist-landing-page {
    padding: 0 24px !important;
  }

  .back-button1 {
    display: none;
  }
}

@media (max-width: 768px) {
  .artist-landing-page {
    padding: 0 16px !important;
  }
}

@media (max-width: 480px) {
  .artist-landing-page {
    padding: 0 12px !important;
  }
}

/* Section Container - Responsive Padding */
.section-container {
  padding: 0 24px;
}

@media (min-width: 1025px) {
  .section-container {
    padding: 0 100px;
  }
  .back-button1 {
    display: none;
  }
}

@media (max-width: 768px) {
  .section-container {
    padding: 0 16px;
  }
  .back-button1 {
    display: none;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 0 12px;
  }
}

/* General responsive improvements */
@media (max-width: 768px) {
  .artist-landing-page {
    font-size: 14px;
  }
  .back-button1 {
    display: none;
  }
}

@media (max-width: 480px) {
  .back-button1 {
    display: none;
  }
  .artist-landing-page {
    font-size: 13px;
  }
}

/* Back Button */
.back-button {
  /* position: absolute;
  top: 8rem;
  left: 8rem; */
  z-index: 1000;
  border-radius: 12px;
  padding: 12px 16px 12px 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  font-size: 14px;
  font-weight: 500;
  max-width: 15rem;
  justify-content: flex-start;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.back-button:active {
  transform: translateX(-2px) scale(0.98);
}

.back-text {
  transition: all 0.3s ease;
}

.back-button:hover .back-text {
  transform: translateX(2px);
}

/* Responsive back button */
@media (max-width: 768px) {
  .back-button {
    display: none;
    /* top: 15px;
    left: 15px;
    padding: 10px 14px;
    font-size: 13px;
    min-width: 70px; */
  }

  .back-text {
    display: none;
  }

  .back-button {
    border-radius: 50%;
    width: 44px;
    height: 44px;
    min-width: 44px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .back-button1 {
    /* position: absolute;
  top: 8rem;
  left: 8rem; */
    z-index: 1000;
    border-radius: 12px;
    padding: 12px 16px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-size: 14px;
    font-weight: 500;
    max-width: 15rem;
    justify-content: flex-start;
  }
}
/* top: 12px;
    left: 12px;
    width: 40px;
    height: 40px;
    min-width: 40px;
    padding: 8px;
    border-radius: 50%;
    justify-content: center;
  }

  .back-text {
    display: none;
  }
}

.container {
  margin: 0 auto;
  padding: 0 24px;
}

@media (min-width: 1025px) {
  .container {
    margin: 0 200px;
    padding: 0 24px;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 12px;
  }
}

/* Music Player Container */
.music-player-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .music-player-container {
    padding: 30px 16px;
  }
}

@media (max-width: 480px) {
  .music-player-container {
    padding: 20px 12px;
    flex-direction: row;
  }
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  overflow: hidden;
  padding: 40px 0;
  /* background: linear-gradient(135deg, #1a237e 0%, #283593 25%, #3f51b5 50%, #5c6bc0 75%, #7986cb 100%); */
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

@media (max-width: 1024px) {
  .back-button1 {
    /* position: absolute;
  top: 8rem;
  left: 8rem; */
    z-index: 1000;
    border-radius: 12px;
    padding: 12px 16px;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    font-size: 14px;
    font-weight: 500;
    max-width: 15rem;
    justify-content: flex-start;
  }

  .hero-section {
    min-height: 100vh;
    padding: 60px 0;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 100vh;
    padding: 20px 0;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 100vh;
    padding: 16px 0;
  }
}

.hero-container {
  padding: 0 50px !important;
  /* max-width: 1500px; */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  /* max-width: 1200px;
  margin: 0 auto; */
  padding: 40px 20px;
  animation: fadeInUp 0.8s ease-out;
  position: relative;
  z-index: 2;
}

@media (max-width: 1024px) {
  .hero-container {
    padding: 0 24px !important;
    gap: 30px;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .hero-container {
    padding: 0 16px !important;
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .hero-container {
    padding: 0 12px !important;
    gap: 20px;
  }
}

/* Scroll Indicator Styles */
.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  z-index: 10;
  transition: opacity 0.3s ease;
}

.scroll-indicator:hover {
  opacity: 0.8;
}

.scroll-indicator-text {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.scroll-indicator-icon {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.bounce-animation {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .scroll-indicator {
    bottom: 24px;
  }

  .scroll-indicator-text {
    font-size: 12px;
  }

  .scroll-indicator-icon {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 480px) {
  .scroll-indicator {
    bottom: 16px;
  }

  .scroll-indicator-text {
    font-size: 11px;
  }

  .scroll-indicator-icon {
    width: 36px;
    height: 36px;
  }
}

.hero-content {
  height: 100vh;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 40px;
  width: 100%;
  max-width: 100vw;
  padding: 0 8rem;
}

.hero-left {
  width: 60%;
  display: flex;
  margin-bottom: 3rem;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .hero-content {
    /* margin-top: 6rem; */
    flex-direction: column-reverse;
    text-align: center;
    gap: 30px;
    height: auto;
    padding: 0;
  }

  .back-button {
    display: none;
  }
}

@media (max-width: 768px) {
  .hero-content {
    gap: 20px;
    padding: 0;
  }

  .hero-left{
    width: 80%;
  }
}

@media (max-width: 480px) {
  .hero-content {
    gap: 16px;
    padding: 0;
  }

  .hero-left{
    width: 100%;
  }
}

.hero-details {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  text-align: left;
  padding-bottom: 3rem;
}

@media (max-width: 1024px) {
  .hero-details {
    text-align: center;
    order: 2;
  align-items: center;

  }
}

.hero-video-right {
  height: 100vh;
  position: relative;
  z-index: 3;
  animation: slideInRight 0.8s ease-out;
}

@media (max-width: 1024px) {
  .hero-video-right {
    height: 50vh;
    order: 1;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .hero-video-right {
    height: 40vh;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-video-right {
    height: 35vh;
    max-width: 100%;
  }
}

.hero-video-right:hover::before {
  opacity: 1;
}

.video-container {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.video-container:hover {
  transform: translateY(-10px);
}

.hero-video {
  width: 100%;
  max-width: 80vw;
  height: 100vh;
  object-fit: cover;
  display: block;
  border-radius: 10px;
}

@media (max-width: 1024px) {
  .hero-video {
    height: 50vh;
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-video {
    height: 40vh;
    width: 100%;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-video {
    height: 35vh;
  }
}

.hero-fallback-image {
  width: 100%;
  height: 100vh;
  object-fit: cover;
  display: block;
  border-radius: 18px;
}

@media (max-width: 1024px) {
  .hero-fallback-image {
    height: 50vh;
    width: 100%;
    object-fit: cover;
  }
}

@media (max-width: 768px) {
  .hero-fallback-image {
    height: 40vh;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-fallback-image {
    height: 35vh;
  }
}

/* Immersive Space Overlay Styles */
.immersive-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.immersive-link {
  display: block;
  text-decoration: none;
  position: relative;
  transition: all 0.3s ease;
}

.immersive-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

@media (max-width: 1024px) {
  .immersive-overlay {
    top: 15px;
    right: 15px;
  }

  .immersive-image {
    width: 30%;
    height: 30%;
  }
}

@media (max-width: 768px) {
  .immersive-overlay {
    top: 10px;
    right: 10px;
  }

  .immersive-image {
    width: 30%;
    height: 30%;
  }
}

@media (max-width: 480px) {
  .immersive-overlay {
    top: 8px;
    right: 8px;
  }

  .immersive-image {
    width: 30%;
    height: 30%;
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.hero-avatar {
  margin: 0;
  flex-shrink: 0;
  position: relative;
  display: inline-block;
}

.artist-hero-avatar {
  width: 100%;
  height: 100%;
  max-width: 30rem;
  border-radius: 16px;
  object-fit: cover;
  transition: all 0.3s ease;
  display: block;
}

/* Avatar Background Decorative Elements */
.avatar-background {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 500px;
  z-index: -1;
  pointer-events: none;
}

.gradient-circle {
  position: absolute;
  z-index: 5;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  background: linear-gradient(180deg, #ffffff 0%, #000d4d 100%);
  /* background: radial-gradient(circle at center, rgba(0, 255, 255, 0.4) 0%, rgba(138, 43, 226, 0.3) 30%, rgba(75, 0, 130, 0.4) 60%, rgba(25, 25, 112, 0.2) 85%, transparent 100%); */
  border-radius: 50%;
  animation: pulseGlow 4s ease-in-out infinite;
}

/* Responsive background circle sizing */
@media (max-width: 768px) {
  .avatar-background {
    width: 300px;
    height: 300px;
  }
}

@media (max-width: 480px) {
  .avatar-background {
    width: 250px;
    height: 250px;
  }
}

.decorative-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  /* border: 2px solid rgba(255, 255, 255, 0.1); */
  animation: rotateRing 20s linear infinite;
}

.ring-1 {
  z-index: 3;
  width: 75%;
  height: 75%;
  background: linear-gradient(
    180deg,
    rgba(21, 39, 126, 0.3) 0%,
    rgba(0, 13, 77, 0.2) 100%
  );
  /* border-color: rgba(138, 43, 226, 0.3); */
  /* animation-duration: 25s; */
}

.ring-2 {
  width: 100%;
  height: 100%;
  z-index: 2;
  background: linear-gradient(
    180deg,
    rgba(21, 39, 126, 0.2) 0%,
    rgba(0, 13, 77, 0.15) 100%
  );

  /* background: linear-gradient(180deg, #FFFFFF 0%, #000D4D 100%); */
  /* border-color: rgba(75, 0, 130, 0.2); */
  /* animation-duration: 30s; */
  animation-direction: reverse;
}

.ring-3 {
  width: 125%;
  height: 125%;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(21, 39, 126, 0.15) 0%,
    rgba(0, 13, 77, 0.1) 100%
  );

  /* background: linear-gradient(180deg, #FFFFFF 0%, #000D4D 100%); */
  /* border-color: rgba(75, 0, 130, 0.2); */
  /* animation-duration: 30s; */
  animation-direction: reverse;
}

/* Animations for decorative elements */
@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1);
  }

  50% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(1.05);
  }
}

@keyframes rotateRing {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }

  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

.hero-title-wrapper {
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 8px;
  width: 90%;
}

.hero-title-wrapper .hero-title {
  flex: 0 1 auto;
}



.hero-title {
  font-size: 48px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.hero-subtitle {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 32px;
  margin-right: 5rem;
  color: rgba(199, 199, 199, 0.911);
  font-weight: 400;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  max-width: 35vw;
  /* font-family: "Dancing Script", cursive !important; */
}

@media (max-width: 1024px) {
  .hero-subtitle {
    max-width: 100%;
    margin-right: 0px;
  }
}

@media (max-width: 768px) {
  .hero-subtitle {
    font-size: 0.95rem;
    margin-bottom: 24px;
    margin-right: 0px;
    max-width: 100%;
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 20px;
    line-height: 1.4;
  }
}

.hero-actions {
  display: flex;
  gap: 24px;
  justify-content: flex-start;
  /* margin-bottom: 80px; */
  flex-wrap: wrap;
  margin-top: 40px;
}

@media (max-width: 1024px) {
  .hero-actions {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero-actions {
    gap: 12px;
    margin-top: 20px;
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .hero-actions {
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }
}

.hero-btn {
  position: relative;
  padding: 10px;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  text-transform: none;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: none;
  min-width: 180px;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .hero-btn {
    padding: 14px 28px;
    font-size: 0.9rem;
    width: 100%;
    max-width: 280px;
  }
}

@media (max-width: 480px) {
  .hero-btn {
    width: 100%;
    max-width: 260px;
    padding: 12px 24px;
    font-size: 0.85rem;
  }
}

.primary-btn {
  background: #ffffff;
  color: #1a237e;
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
  border: 2px solid transparent;
  text-decoration: none;
  font-weight: 600;
}

.primary-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(255, 255, 255, 0.3);
  color: #1a237e;
}

.primary-btn .btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.primary-btn:hover .btn-glow {
  left: 100%;
}

.secondary-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  font-weight: 500;
}

.secondary-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(255, 255, 255, 0.15);
}

.secondary-btn .btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.6s ease;
}

.secondary-btn:hover .btn-shine {
  left: 100%;
}

.btn-text {
  position: relative;
  z-index: 2;
}

/* Responsive Hero Section */
@media (max-width: 1024px) {
  .container {
    padding: 0 100px;
    margin: 0 auto;
    padding: 0 24px;
  }

  .hero-section {
    min-height: 100vh;
    padding: 60px 0;
  }

  .hero-container {
    gap: 40px;
    text-align: center;
    padding: 20px;
  }

  /* .hero-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
    height: auto;
  } */

  .hero-details {
    text-align: center;
    order: 2;
  }

  .hero-video-right {
    height: 50vh;
    order: 1;
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .hero-actions {
    justify-content: center;
  }

  .hero-video {
    height: 50vh;
    max-width: 100%;
    width: 100%;
  }

  .hero-fallback-image {
    height: 50vh;
    width: 100%;
    object-fit: cover;
  }

  .hero-subtitle {
    max-width: 100%;
    margin-right: 0px;
  }

  .immersive-overlay {
    top: 15px;
    right: 15px;
  }

  .immersive-image {
    width: 30%;
    height: 30%;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 100vh;
    padding: 20px 0;
  }

  .hero-container {
    padding: 0 16px;
    gap: 24px;
  }

  .hero-content {
    gap: 20px;
  }

  .hero-video-right {
    height: 40vh;
    max-width: 100%;
  }

  .hero-title-wrapper {
    gap: 12px;
  }

  .hero-title {
    font-size: 2.2rem;
    margin-bottom: 0;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 0.95rem;
    margin-bottom: 24px;
    margin-right: 0px;
    max-width: 100%;
    line-height: 1.5;
  }

  .hero-actions {
    gap: 12px;
    margin-top: 20px;
    flex-direction: column;
    align-items: center;
  }

  .hero-btn {
    padding: 14px 28px;
    font-size: 0.9rem;
    width: 100%;
    max-width: 280px;
  }

  .artist-hero-avatar {
    max-width: 50vh;
    width: 100%;
    height: auto;
  }

  .hero-video {
    height: 40vh;
    width: 100%;
    max-width: 100%;
  }

  .hero-fallback-image {
    height: 40vh;
    width: 100%;
  }

  .immersive-overlay {
    top: 10px;
    right: 10px;
  }

  .immersive-image {
    width: 30%;
    height: 30%;
  }
}

@media (max-width: 480px) {
  .hero-section {
    min-height: 100vh;
    padding: 16px 0;
  }

  .hero-container {
    padding: 0 12px;
    gap: 20px;
  }

  .hero-content {
    gap: 16px;
  }

  .hero-video-right {
    height: 35vh;
    max-width: 100%;
  }

  .hero-title-wrapper {
    gap: 10px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-title-wrapper .subscribe-btn {
    margin-left: 0;
  }

  .hero-title {
    font-size: 1.8rem;
    margin-bottom: 0;
    line-height: 1.1;
  }

  .hero-subtitle {
    font-size: 14px !important;
    margin-bottom: 20px;
    line-height: 1.4;
  }

  .hero-actions {
    flex-direction: column;
    gap: 10px;
    margin-top: 16px;
  }

  .hero-btn {
    max-width: 260px;
    padding: 10px 16px;
    font-size: 0.85rem;
  }

  .artist-hero-avatar {
    max-width: 50vh;
  }

  .hero-video {
    height: 35vh;
  }

  .hero-fallback-image {
    height: 35vh;
  }

  .immersive-overlay {
    top: 8px;
    right: 8px;
  }

  .immersive-image {
    width: 30%;
    height: 30%;
  }
}

/* Subscribe Button Styles */
.subscribe-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  margin-bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  width: fit-content;
}

.subscribe-btn::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.6s ease;
}

.subscribe-btn:hover::before {
  left: 100%;
}

.subscribe-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.subscribe-btn:active {
  transform: translateY(0);
}

.subscribe-btn.subscribed {
  background: rgba(76, 175, 80, 0.2);
  border-color: rgba(76, 175, 80, 0.5);
  color: #4caf50;
}

.subscribe-btn.subscribed:hover {
  background: rgba(76, 175, 80, 0.25);
  border-color: rgba(76, 175, 80, 0.7);
}

.subscribe-btn.loading {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}

.subscribe-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.subscribe-icon {
  transition: transform 0.3s ease;
}

.subscribe-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.subscribe-btn:hover .subscribe-icon:not(.spinning) {
  transform: scale(1.1);
}

.subscribe-btn.subscribed .subscribe-icon {
  color: #4caf50;
}

.subscribe-text {
  position: relative;
  z-index: 2;
}

/* ── Subscription Benefits Strip ──────────────────────────── */
.benefits-wrapper {
  position: relative;
  display: grid;
  grid-template-columns: 92px 1fr;
  gap: 10px;
  align-items: center;
  padding: 8px 10px;
  margin-top: 6px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.benefits-wrapper::before,
.benefits-wrapper::after {
  content: "";
  position: absolute;
  left: 92px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(12, 16, 34, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.14);
  transform: translateX(-50%);
}

.benefits-wrapper::before {
  top: -8px;
}

.benefits-wrapper::after {
  bottom: -8px;
}

.benefits-pass-stamp {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 54px;
  padding: 8px 10px;
  border-radius: 9px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.04));
  border: 1px dashed rgba(255, 255, 255, 0.28);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.benefits-pass-title {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.92);
}

.benefits-pass-subtitle {
  font-size: 10px;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.7);
}

.benefits-route {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 54px;
  padding: 0 4px;
}

.benefits-route-line {
  position: absolute;
  left: 4px;
  right: 4px;
  top: 17px;
  height: 2px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0.15));
  z-index: 0;
}

.benefit-stop {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.benefit-stop-icon {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.45);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.08));
  box-shadow: 0 0 0 3px rgba(12, 18, 46, 0.6);
}

.benefit-stop-label {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
}

/* Vue <Transition name="benefits"> */
.benefits-enter-active {
  transition: opacity 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.benefits-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.benefits-enter-from,
.benefits-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

/* Responsive Subscribe Button */
@media (max-width: 1024px) {
  .subscribe-btn {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .subscribe-btn {
    padding: 9px 14px;
    font-size: 12px;
    margin-bottom: 0;
  }

  .benefits-wrapper {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 10px;
  }

  .benefits-wrapper::before,
  .benefits-wrapper::after {
    display: none;
  }

  .benefits-pass-stamp {
    min-height: auto;
    padding: 7px 9px;
    width: fit-content;
  }

  .benefits-route {
    min-height: 48px;
  }
}

@media (max-width: 480px) {
  .subscribe-btn {
    padding: 8px 12px;
    font-size: 11px;
    margin-bottom: 0;
    gap: 5px;
  }

  .benefit-stop-label {
    font-size: 9px;
  }
}

/* Promotional Card Styles */
.promo-card {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  overflow: hidden;
  max-width: 90%;
  padding: 10px;
}

.promo-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.promo-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.promo-card:hover::before {
  opacity: 1;
}

.promo-image-wrapper {
  position: relative;
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  overflow: hidden;
}

.promo-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.promo-card:hover .promo-image {
  transform: scale(1.1);
}

.promo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 100%);
  pointer-events: none;
}

.promo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-left: 10px;
}

.promo-heading {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  line-height: 1.3;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    rgba(255, 255, 255, 0.85) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.promo-description {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.promo-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  align-self: flex-start;
  margin-top: 4px;
  align-self: flex-end;
  margin-top: 0.75rem;
}

.promo-cta:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(4px);
}

.promo-cta:active {
  transform: translateX(2px) scale(0.98);
}

.cta-text {
  transition: transform 0.3s ease;
}

.cta-icon {
  transition: transform 0.3s ease;
}

.promo-cta:hover .cta-icon {
  transform: translateX(4px);
}

/* Responsive Promo Card */
@media (max-width: 768px) {
  .promo-card {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .promo-image-wrapper {
    width: 100px;
    height: 100px;
  }

  .promo-content {
    align-items: center;
  }

  .promo-heading {
    font-size: 1rem;
  }

  .promo-description {
    font-size: 0.8rem;
  }

  .promo-cta {
    align-self: center;
  }
}

@media (max-width: 480px) {
  .promo-card {
    padding: 14px;
    gap: 12px;
  }

  .promo-content {
    padding: 10px;
  }

  .promo-image-wrapper {
    width: 80px;
    height: 80px;
  }

  .promo-heading {
    font-size: 0.95rem;
  }

  .promo-description {
    font-size: 0.75rem;
    -webkit-line-clamp: 3;
    line-clamp: 3;
  }

  .promo-cta {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}

/* Social Section */
.social-section {
  margin-top: 5rem;
  padding: 60px 0;
  color: white;
}

.social-header {
  text-align: center;
  margin-bottom: 32px;
}

.social-header h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.social-header p {
  color: rgba(255, 255, 255, 0.6);
  font-size: 1rem;
}

.social-links {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin: 0 auto;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  font-size: 0.9rem;
}

.social-link:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
  border-color: rgba(33, 150, 243, 0.3);
  transform: translateY(-2px);
}

/* Social Section Responsive */
@media (max-width: 768px) {
  .social-section {
    margin-top: 3rem;
    padding: 40px 0;
  }

  .social-header h3 {
    font-size: 1.5rem;
  }

  .social-header p {
    font-size: 0.9rem;
  }

  .social-links {
    gap: 12px;
    padding: 0 16px;
  }

  .social-link {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .social-section {
    margin-top: 2rem;
    padding: 30px 0;
  }

  .social-header {
    margin-bottom: 24px;
  }

  .social-header h3 {
    font-size: 1.3rem;
  }

  .social-header p {
    font-size: 0.85rem;
  }

  .social-links {
    gap: 8px;
    padding: 0 12px;
  }

  .social-link {
    padding: 8px 12px;
    font-size: 0.8rem;
    gap: 6px;
  }
}

/* Responsive Design */
@media (max-width: 480px) {
  .hero-content {
    gap: 32px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-avatar {
    margin-top: 36px;
    width: 90vw;
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .back-button1 {
    align-self: flex-start;
    padding: 0 12px;
  }

  .artist-hero-avatar {
    width: 80vw;
    height: 40vh;
    max-width: max-content;
  }
}
</style>
