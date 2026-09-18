<template>
  <section class="course-meet-section"  v-if="allProducts.length > 0 || classroomVideos.length > 0 || isVideosLoading">
    <div class="container">
      <!-- Combined Section with "The Classroom" title -->
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">The Classroom</h2>
          <p class="section-subtitle">Tutorials, masterclasses & mentorships</p>
        </div>
        
        <!-- Combined Courses, Meet, and Videos Section -->
        <div v-if="allItems.length > 0 || isVideosLoading" class="carousel-container">
          <div v-if="isVideosLoading" class="video-loading-state">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
            ></v-progress-circular>
            <p>Loading videos...</p>
          </div>

          <template v-else>
            <button 
              v-if="shouldShowCarousel"
              class="carousel-nav-btn carousel-prev" 
              @click="scrollCarousel('left')"
              :disabled="scrollPosition <= 0"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </button>
            
            <div 
              class="courses-carousel" 
              :class="{ 'centered-grid': !shouldShowCarousel }"
              ref="coursesCarousel"
            >

             <!-- Video Cards -->
             <div
                v-for="(video, index) in displayedClassroomVideos"
                :key="`video-${video.id || video.video_id || index}`"
                class="video-gallery-card expandable-card"
                :class="{ 'coming-soon-card': isVideoComingSoon(video) }"
                @click="
                  isVideoComingSoon(video)
                    ? null
                    : video.pricing === 'SUBSCRIPTION' && !props.isSubscribed
                    ? handleSubscriptionClick()
                    : video.category !== undefined
                    ? callingApiforVideo(video.id, false)
                    : navigateToPaidVideo(video)
                "
              >
                <div class="video-gallery-thumbnail" :style="getThumbnailBackgroundStyle(video)">
                  <div
                    v-if="video.category === undefined"
                    class="premium-crown-badge"
                  >
                    <v-icon size="28" color="#facc15">mdi-crown</v-icon>
                  </div>
                  <!-- Coming Soon Overlay -->
                  <div v-if="isVideoComingSoon(video)" class="coming-soon-overlay">
                    <div class="coming-soon-content">
                      <v-icon size="48" color="white" class="coming-soon-icon">mdi-clock-outline</v-icon>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                  <!-- Regular Video Thumbnail -->
                  <div>
                    <div
                      v-if="!getVideoThumbnail(video) && video.category !== undefined"
                      class="video-gallery-placeholder"
                      @click.stop="!isVideoComingSoon(video) && (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : callingApiforVideo(video.id, false))"
                    >
                      <v-icon
                        v-if="!videoLoadingStates[video.id]"
                        size="48"
                        color="#94a3b8"
                        >mdi-video</v-icon
                      >
                      <v-progress-circular
                        v-else
                        indeterminate
                        color="primary"
                        size="48"
                      ></v-progress-circular>
                    </div>
                    <div
                      class="video-gallery-play-overlay"
                      v-if="
                        !isVideoComingSoon(video) &&
                        video.category !== undefined &&
                        !(video.pricing === 'SUBSCRIPTION' && !props.isSubscribed) &&
                        !videoLoadingStates[video.id]
                      "
                      @click.stop="callingApiforVideo(video.id, false)"
                    >
                      <v-icon size="32" color="white">mdi-play-circle</v-icon>
                    </div>

                    <!-- Enhanced expandable content overlay -->
                    <div
                      class="expandable-content-overlay"
                      v-if="video.category !== undefined"
                    >
                      <div class="expandable-header">
                        <h4 class="expandable-title">{{ video.title }}</h4>
                      </div>
                    </div>

                    <!-- Premium video overlay -->
                    <div
                      v-if="!isVideoComingSoon(video) && (video.category === undefined || (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed))"
                      class="premium-video-overlay"
                    >
                      <div class="premium-overlay-content">
                        <div class="premium-lock-icon">
                          <v-icon size="20" color="white">mdi-lock</v-icon>
                        </div>
                        <button
                          class="premium-subscribe-btn"
                          @click.stop="video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : navigateToPaidVideo(video)"
                        >
                          {{ video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? 'Subscribe to Watch' : 'Buy Now' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Product Cards -->
              <div 
                v-for="(product, index) in allProducts" 
                :key="`product-${product.product_id}`"
                class="course-card" 
                :class="{ 'coming-soon-card': isComingSoon(product) }"
                @click="viewProduct(product)"
              >
                <div class="course-image-container">
                  <img 
                    v-if="product.product_image && product.product_image.length > 0" 
                    :src="product.product_image[0]" 
                    :alt="product.product_name"
                    class="course-card-image"
                  />
                  <div v-if="isComingSoon(product)" class="coming-soon-overlay">
                    <div class="coming-soon-content">
                      <v-icon size="48" color="white" class="coming-soon-icon">mdi-clock-outline</v-icon>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                </div>
                
                <div class="course-card-content">
                  <div class="course-badges">
                    <span class="course-level-badge" v-if="product.product_type === 'MEET'">
                      Session
                    </span>
                    <span class="course-level-badge" v-else-if="product.course_level">
                      {{ product.course_level }}
                    </span>
                    <span class="course-price-badge" v-if="!isComingSoon(product)">
                      {{ getProductPrice(product) }}
                    </span>
                  </div>
                  <h4 class="course-title">{{ product.product_name }}</h4>
                </div>
              </div>             
            </div>
            
            <button 
              v-if="shouldShowCarousel"
              class="carousel-nav-btn carousel-next" 
              @click="scrollCarousel('right')"
              :disabled="scrollPosition >= maxScroll"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Media Carousel Component -->
    <MediaCarousel
      :is-visible="isCarouselVisible"
      :media-list="carouselMediaList"
      :selected-index="selectedVideoIndex"
      :artist-name="artistName"
      :is-subscribed="props.isSubscribed"
      :on-video-click="handleVideoClickInCarousel"
      :on-subscribe="props.onSubscribe"
      @close="closeCarousel"
      @media-change="handleMediaChange"
      @open-carousel="handleOpenCarousel"
    />

    <!-- Subscription Dialog -->
    <SubscriptionDialog
      v-model="isSubscriptionDialogVisible"
      :artist-name="artistName"
      @subscribe="handleSubscribe"
      @cancel="handleCancelSubscription"
    />

  </section>
</template>

<script setup>
import { computed, ref, nextTick, onMounted, onUnmounted, watch, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import { getArtistVideosUrl } from '@/services/artistService';

const MediaCarousel = defineAsyncComponent(() => import('./MediaCarousel.vue'));
const SubscriptionDialog = defineAsyncComponent(() => import('./SubscriptionDialog.vue'));

const props = defineProps({
  products: {
    type: Array,
    required: true,
    default: () => []
  },
  artistName: {
    type: String,
    required: true,
    default: 'Artist'
  },
  artistVideos: {
    type: Array,
    default: () => []
  },
  isVideosLoading: {
    type: Boolean,
    default: false
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  defaultThumbnail: {
    type: String,
    default: ''
  },
  onSubscribe: {
    type: Function,
    default: null
  }
});

const router = useRouter();
const appStore = useAppStore();

// Filter products by type
const courseProducts = computed(() => {
  return props.products.filter(product => product.product_type === 'COURSE');
});

const meetProducts = computed(() => {
  return props.products.filter(product => product.product_type === 'MEET');
});

// Combined products array
const allProducts = computed(() => {
  return [...courseProducts.value, ...meetProducts.value];
});

// Combined items array (products + videos) for same row display
const allItems = computed(() => {
  const items = [];
  
  // Add products
  allProducts.value.forEach(product => {
    items.push({
      type: 'product',
      data: product
    });
  });
  
  // Add classroom videos
  displayedClassroomVideos.value.forEach(video => {
    items.push({
      type: 'video',
      data: video
    });
  });
  
  return items;
});

// Filter videos by CLASSROOM category
const classroomVideos = computed(() => {
  if (!props.artistVideos || props.artistVideos.length === 0) return [];
  return props.artistVideos.filter(
    (video) => video.category === 'CLASSROOM' || video.video_category === 'CLASSROOM'
  );
});

const displayedClassroomVideos = computed(() => {
  if (!classroomVideos.value || classroomVideos.value.length === 0) return [];

  // Sort videos by order_id (ascending order)
  // Videos without order_id will be placed at the end
  const sortedVideos = [...classroomVideos.value].sort((a, b) => {
    const orderIdA = a.order_id ?? a.video_order_id ?? Number.MAX_SAFE_INTEGER;
    const orderIdB = b.order_id ?? b.video_order_id ?? Number.MAX_SAFE_INTEGER;
    return orderIdA - orderIdB;
  });

  return sortedVideos;
});

// Computed property to determine if classroom carousel should be shown
const shouldShowClassroomCarousel = computed(() => {
  return classroomVideos.value && classroomVideos.value.length > 4;
});

// Carousel state management
const scrollPosition = ref(0);
const maxScroll = ref(0);
const coursesCarousel = ref(null);

// Classroom video carousel state
const classroomScrollPosition = ref(0);
const classroomMaxScroll = ref(0);
const classroomCarousel = ref(null);

// Video carousel state management
const isCarouselVisible = ref(false);
const selectedVideoIndex = ref(0);
const currentCategory = ref('');

// Video stream URLs cache
const videoStreamUrls = ref({});

// Loading states for individual videos
const videoLoadingStates = ref({});

// Subscription dialog state
const isSubscriptionDialogVisible = ref(false);

// Computed property to determine if carousel should be shown
const shouldShowCarousel = computed(() => {
  return allItems.value && allItems.value.length > 3;
});

// Computed property for carousel media list
const carouselMediaList = computed(() => {
  return getAllVideosForCategory(currentCategory.value);
});

const getProductPrice = (product) => {
  if (!product || !product.currencies || product.currencies.length === 0) {
    return 'Price on request';
  }
  
  // Try to find currency matching store currency first
  let currency = product.currencies.find(c => c.currency === appStore.currencyCode);
  
  // Fallback to first available currency if store currency not found
  if (!currency) {
    currency = product.currencies[0];
  }
  
  if (currency.price === 0) {
    return 'Free';
  }
  
  // Format price based on store currency
  const locale = appStore.currencyCode === 'INR' ? 'en-IN' : 'en-US';
  const formattedPrice = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(currency.price);
  
  return formattedPrice;
};

// Keep old functions for backward compatibility (not used in template anymore)
const getCoursePrice = (course) => {
  return getProductPrice(course);
};

const getMeetPrice = (meet) => {
  return getProductPrice(meet);
};

const isComingSoon = (product) => {
  return product.product_id && product.product_id.toString().startsWith('coming-soon');
};

const viewProduct = (product) => {
  // Don't navigate for coming soon products
  if (isComingSoon(product)) {
    return;
  }
  
  // Check if product has a redirect_url, if so open it in a new tab
  if (product.redirect_url) {
    window.open(product.redirect_url, '_blank');
    return;
  }
  
  // if (product.product_type === 'COURSE') {
  //   router.push({path: `${appStore.artistDomain}/course/${product.product_id}`});
  // } else if (product.product_type === 'MEET') {
  //   router.push({path: `${appStore.artistDomain}/slotBook/${product.product_id}`});
  // }
  if (product.product_type === 'COURSE') {
    router.push({path: `course/${product.product_id}`});
  } else if (product.product_type === 'MEET') {
    router.push({path: `slotBook/${product.product_id}`});
  }
};

// Carousel scroll methods
const scrollCarousel = (direction) => {
  const carousel = coursesCarousel.value;
  if (!carousel) {
    return;
  }
  
  const scrollAmount = 249; // Width of one card plus gap (225px + 24px)
  const currentScroll = carousel.scrollLeft;
  const maxScrollValue = carousel.scrollWidth - carousel.clientWidth;
  
  if (direction === 'left') {
    const newPosition = Math.max(0, currentScroll - scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setTimeout(() => {
      scrollPosition.value = carousel.scrollLeft;
      maxScroll.value = carousel.scrollWidth - carousel.clientWidth;
    }, 300);
  } else {
    const newPosition = Math.min(maxScrollValue, currentScroll + scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    setTimeout(() => {
      scrollPosition.value = carousel.scrollLeft;
      maxScroll.value = carousel.scrollWidth - carousel.clientWidth;
    }, 300);
  }
};


// Update scroll positions on scroll events
const updateScrollPosition = () => {
  if (coursesCarousel.value) {
    scrollPosition.value = coursesCarousel.value.scrollLeft;
    maxScroll.value = coursesCarousel.value.scrollWidth - coursesCarousel.value.clientWidth;
  }
};


// Initialize carousel on mount
const initializeCarousel = () => {
  // Initialize courses carousel
  if (coursesCarousel.value && shouldShowCarousel.value) {
    maxScroll.value = coursesCarousel.value.scrollWidth - coursesCarousel.value.clientWidth;
    scrollPosition.value = coursesCarousel.value.scrollLeft;
    
    // Add scroll listener to track position only if carousel is needed
    coursesCarousel.value.addEventListener('scroll', updateScrollPosition);
    
  } else if (coursesCarousel.value && !shouldShowCarousel.value) {
    // Reset scroll position for centered grid
    scrollPosition.value = 0;
    maxScroll.value = 0;
  }

};

// Watch for changes in course data and reinitialize
watch([() => props.products], () => {
  nextTick(() => {
    setTimeout(initializeCarousel, 100);
  });
}, { deep: true });

// Initialize on mount
onMounted(() => {
  // Use a timeout to ensure DOM is fully rendered
  setTimeout(() => {
    initializeCarousel();
  }, 100);
});

// Cleanup on unmount
onUnmounted(() => {
  if (coursesCarousel.value && shouldShowCarousel.value) {
    coursesCarousel.value.removeEventListener('scroll', updateScrollPosition);
  }
  if (classroomCarousel.value && shouldShowClassroomCarousel.value) {
    classroomCarousel.value.removeEventListener('scroll', updateClassroomScrollPosition);
  }
});

// Helper to resolve thumbnails with fallback
const getVideoThumbnail = (video) => {
  if (!video) return props.defaultThumbnail || '';
  return video.thumbnail || video.image || props.defaultThumbnail || '';
};

const getThumbnailBackgroundStyle = (video) => {
  if (!video) return {};

  const thumbnail = getVideoThumbnail(video);
  if (!thumbnail) return {};

  return {
    backgroundImage: `url('${thumbnail}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
};

// Helper function to check if video is coming soon
const isVideoComingSoon = (video) => {
  if (!video) return false;
  
  const id = video.id || video.video_id;
  if (!id) return false;
  
  return id.toString().startsWith('coming-soon');
};

// Helper function to detect video type
const detectVideoType = (videoUrl, isVimeoFlag = false) => {
  if (!videoUrl) return 'unknown';
  
  const urlStr = videoUrl.toString().toLowerCase();
  
  // Check the isVimeo flag first (from backend)
  if (isVimeoFlag) {
    return 'vimeo';
  }
  
  // Check if it's a Vimeo video (embedded player or regular vimeo URL)
  if (urlStr.includes('player.vimeo.com') || urlStr.includes('vimeo.com') || urlStr.includes('vimeo')) {
    return 'vimeo';
  }
  
  // Check if it's an m3u8 stream
  if (urlStr.includes('.m3u8') || urlStr.includes('m3u8')) {
    return 'm3u8';
  }
  
  // Check for other common video formats
  if (urlStr.includes('.mp4')) {
    return 'mp4';
  }
  
  return 'unknown';
};

// Helper function to extract Vimeo ID from embedded URL
const extractVimeoId = (vimeoUrl) => {
  if (!vimeoUrl) return null;
  
  const urlStr = vimeoUrl.toString();
  // Extract ID from URLs like: 
  // https://player.vimeo.com/video/1135641875?... or
  // https://vimeo.com/1135659083 or /videos/1135659083
  const match = urlStr.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/|\/videos\/)(\d+)/);
  return match ? match[1] : null;
};

// Convert videos to media format for MediaCarousel
const convertVideosToMedia = (videos) => {
  const mediaList = videos.map((video) => {
    // Use cached URL if available, otherwise check video_stream_url, video, or old_video
    let url = videoStreamUrls.value[video.id] || video.video_stream_url || video.video || video.old_video;
    
    // Check if backend provided isVimeo flag
    const isVimeoFlag = video.isVimeo === true;
    const videoType = detectVideoType(url, isVimeoFlag);
    let vimeoId = null;
    
    // If it's a Vimeo video, extract the ID
    if (videoType === 'vimeo') {
      vimeoId = extractVimeoId(url);
      // Also check old_video field for Vimeo ID
      if (!vimeoId && video.old_video) {
        vimeoId = extractVimeoId(video.old_video);
      }
    }

    return {
      url: url,
      title: video.title,
      mediaType: 'video',
      videoType: videoType, // 'vimeo', 'm3u8', 'mp4', or 'unknown'
      vimeoId: vimeoId, // Vimeo video ID for embedded player
      isVimeo: isVimeoFlag, // Backend flag indicating Vimeo video
      thumbnail: getVideoThumbnail(video),
      description: video.description,
      duration: video.duration,
      category: video.category,
      pricing: video.pricing, // 'FREE' or 'SUBSCRIPTION'
      id: video.id,
      videoId: video.video_id,
    };
  });

  return mediaList;
};

// Get all videos for a specific category
const getAllVideosForCategory = (category) => {
  if (category === 'CLASSROOM') {
    return convertVideosToMedia(classroomVideos.value);
  }
  return [];
};

// Video carousel methods
const openVideoCarousel = (index) => {
  const video = props.artistVideos[index];

  // Prevent opening coming soon videos
  if (video && isVideoComingSoon(video)) {
    return;
  }

  if (video) {
    currentCategory.value = video.category || 'CLASSROOM';
    const categoryVideos = getAllVideosForCategory(currentCategory.value);

    // Find the video in the category videos by matching the video ID directly
    const categoryIndex = categoryVideos.findIndex((v) => v.id === video.id);

    if (categoryIndex !== -1) {
      selectedVideoIndex.value = categoryIndex;
      isCarouselVisible.value = true;
    } else {
      console.error('Could not find video in category videos');
      // Fallback: open carousel with first video
      selectedVideoIndex.value = 0;
      isCarouselVisible.value = true;
    }
  } else {
    console.error('Video not found at index:', index);
  }
};

const openAllClassroomVideos = () => {
  currentCategory.value = 'CLASSROOM';
  selectedVideoIndex.value = undefined; // Set to undefined to show grid view
  isCarouselVisible.value = true;
};

const closeCarousel = () => {
  isCarouselVisible.value = false;
  selectedVideoIndex.value = undefined;
  currentCategory.value = '';
};

const handleMediaChange = (index) => {
  selectedVideoIndex.value = index;
};

const handleOpenCarousel = (index) => {
  selectedVideoIndex.value = index;
};

const handleVideoClickInCarousel = (videoId, isIconic) => {
  callingApiforVideo(videoId, isIconic);
};

const navigateToPaidVideo = (video) => {
  if (video && video.id) {
    // Use the router to navigate to the paid video page
    const route = `/paidVideo/${video.id}`;
    // const route = `/${props.artistName}/paidVideo/${video.id}`;
    router.push(route);
  } else {
    console.error('Video or video.id is missing:', video);
  }
};

const handleSubscriptionClick = () => {
  // Show subscription dialog
  isSubscriptionDialogVisible.value = true;
};

const handleSubscribe = async () => {
  // Call the subscription API - parent handles success/error messages
  if (props.onSubscribe) {
    await props.onSubscribe();
  }
};

const handleCancelSubscription = () => {
  // Just close the dialog, no action needed
  isSubscriptionDialogVisible.value = false;
};

const callingApiforVideo = async (id, paid) => {
  // Prevent API calls for coming soon videos
  if (id && id.toString().startsWith('coming-soon')) {
    return;
  }

  videoLoadingStates.value[id] = true;

  try {
    let resp;
    if (paid) {
      resp = await getArtistVideosUrl(id, true, false);
    } else {
      resp = await getArtistVideosUrl(id, false, true);
    }

    // Check if we have videos
    if (resp && resp.videos && resp.videos.length > 0) {
      const video = resp.videos[0];

      // Check for video_stream_url, video, or old_video fields
      const videoUrl = video.video_stream_url || video.video || video.old_video;

      if (videoUrl) {
        const isVimeoFlag = video.isVimeo === true;
        // Store the video URL and metadata
        videoStreamUrls.value[id] = videoUrl;
        
        // Update the video in props.artistVideos with the stream URL and isVimeo flag
        const videoIndex = props.artistVideos.findIndex((v) => v.id === id);
        if (videoIndex !== -1) {
          // Update the video object with fetched data
          props.artistVideos[videoIndex].video_stream_url = videoUrl;
          props.artistVideos[videoIndex].isVimeo = isVimeoFlag;
          
          if (!isCarouselVisible.value) {
            openVideoCarousel(videoIndex);
          } else {
            // Force a re-render by updating the current media
            nextTick(() => {});
          }
        } else {
          console.error('Video not found in artistVideos array');
        }
      } else {
        console.warn('No video URL found in response (checked video_stream_url, video, and old_video fields)');
      }
    } else {
      console.warn('No videos found in response');
    }
  } catch (error) {
    console.error('Error fetching video URL:', error);
    // You could show a user-friendly error message here
  } finally {
    // Clear loading state
    videoLoadingStates.value[id] = false;
  }
};

// Classroom carousel scroll methods
const scrollClassroomCarousel = (direction) => {
  const carousel = classroomCarousel.value;
  if (!carousel) {
    return;
  }

  const scrollAmount = 320; // Width of one card plus gap
  const currentScroll = carousel.scrollLeft;
  const maxScrollValue = carousel.scrollWidth - carousel.clientWidth;

  if (direction === 'left') {
    const newPosition = Math.max(0, currentScroll - scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setTimeout(() => {
      classroomScrollPosition.value = carousel.scrollLeft;
    }, 300);
  } else {
    const newPosition = Math.min(maxScrollValue, currentScroll + scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setTimeout(() => {
      classroomScrollPosition.value = carousel.scrollLeft;
    }, 300);
  }

  classroomMaxScroll.value = maxScrollValue;
};

// Update classroom scroll positions on scroll events
const updateClassroomScrollPosition = () => {
  if (classroomCarousel.value) {
    classroomScrollPosition.value = classroomCarousel.value.scrollLeft;
  }
};

// Initialize classroom carousel
const initializeClassroomCarousel = () => {
  nextTick(() => {
    if (classroomCarousel.value && shouldShowClassroomCarousel.value) {
      classroomMaxScroll.value =
        classroomCarousel.value.scrollWidth - classroomCarousel.value.clientWidth;
      classroomCarousel.value.addEventListener('scroll', updateClassroomScrollPosition);
    } else if (classroomCarousel.value && !shouldShowClassroomCarousel.value) {
      classroomScrollPosition.value = 0;
      classroomMaxScroll.value = 0;
    }
  });
};

// Watch for changes in video data and reinitialize
watch(
  [() => props.artistVideos],
  () => {
    nextTick(() => {
      setTimeout(initializeClassroomCarousel, 100);
    });
  },
  { deep: true }
);

// Initialize classroom carousel on mount
onMounted(() => {
  setTimeout(() => {
    initializeCarousel();
    initializeClassroomCarousel();
  }, 100);
});
</script>

<style scoped>
.course-meet-section {
  padding-bottom: 100px; 
  position: relative;
  overflow: hidden;
}

.course-meet-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 30% 20%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(245, 158, 11, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.container {
  /* max-width: 1500px; */
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

/* .section-container {
  margin-bottom: 80px;
  padding-top: 60px;
} */

.section-header {
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #ffffff;
  /* margin-bottom: 16px; */
  background: #ffff;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-container:nth-child(2) .section-title {
  /* background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.section-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
  font-weight: 300;
}

.currency-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.currency-badge {
  background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.section-container:nth-child(2) .currency-badge {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.currency-note {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 300;
}

/* Carousel Container */
.carousel-container {
  position: relative;
  margin-top: 48px;
}

.carousel-nav-btn {
  position: absolute;
  top: 38.5%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  border: 5px solid #000;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.carousel-nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #000;
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.carousel-prev {
  left: -24px;
}

.carousel-next {
  right: -24px;
}

.courses-carousel {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.courses-carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Centered grid layout for 6 or fewer cards */
.courses-carousel.centered-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  margin: 0 auto;
  overflow: visible;
  padding: 0 20px;
}

.view-all-button-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.view-all-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 12px 32px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.course-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  flex-shrink: 0;
  transform-origin: center;
  will-change: transform, opacity, box-shadow;
  width: 225px;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.course-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.course-card:hover {
  border-radius: 12px !important;
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.15);
  z-index: 15;
  opacity: 1 !important;
  filter: blur(0px) !important;
}

.course-card:hover::before {
  opacity: 1;
  border-radius: 12px;
}

.course-card:hover .course-image-container {
  border-radius: 12px;
  overflow: hidden;
}

.course-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  flex-shrink: 0;
}

.coming-soon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.5) 70%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  backdrop-filter: blur(2px);
  pointer-events: none;
}

.coming-soon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: comingSoonPulse 2s ease-in-out infinite;
}

@keyframes comingSoonPulse {
  0%, 100% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

.coming-soon-icon {
  animation: clockRotate 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
}

@keyframes clockRotate {
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

.coming-soon-badge {
  background: linear-gradient(135deg, #030d31 0%, #040d21 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.coming-soon-card {
  opacity: 0.9;
  cursor: default;
}

.coming-soon-card:hover {
  transform: translateY(-4px) scale(1.01);
  opacity: 0.95;
}

/* Ensure title is visible on coming soon cards */
.coming-soon-card .course-card-content {
  opacity: 1 !important;
  z-index: 4;
}

.course-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  object-position: top;
}

.course-card:hover .course-card-image {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  z-index: 3;
}

.course-card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 10px;
  max-height: 35%;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  pointer-events: auto;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* Content is now always visible, no need for hover effect */
/* .course-card:hover .course-card-content {
  opacity: 1 !important;
  transform: translateY(0);
  pointer-events: auto;
} */

/* Background overlay for better text visibility - always visible */
.course-image-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
  z-index: 2;
  pointer-events: none;
  border-radius: 0 0 12px 12px;
}

.course-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-wrap: wrap;
}

.course-level-badge {
  padding: 3px 6px;
  border-radius: 12px;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.2px;
  white-space: nowrap;
  color: #fff;
  border: 1px solid rgba(59, 130, 246, 0.4);
  max-width: 60%;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
}

.course-price-badge {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  color: white;
  flex-shrink: 0;
}

.course-title {
  color: #ffffff !important;
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 12px;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;
}

/* Meet Section - Grid Layout */
.meet-vertical-container {
  /* display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin: 0 auto;
  justify-items: center; */
  display: flex;
    gap: 20px;
    margin: 0 auto;
    justify-content: center;
    flex-wrap: wrap;
}
/* max-width: 800px; */
/* padding: 0 20rem; */

.meet-horizontal-card {
  /* width: 100%; */
  max-width: 36vw;
  display: flex;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(20px);
  position: relative;
  /* max-height: 170px; */
}

.meet-horizontal-card:hover {
  transform: translateY(-4px) scale(1.01);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.meet-image-section {
  position: relative;
  width: 28%;
  min-height: 120px;
  overflow: hidden;
  object-fit: cover;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  flex-shrink: 0;
}

.meet-card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
  object-position: center;
}

.meet-horizontal-card:hover .meet-card-image {
  transform: scale(1.05);
}

.meet-content-section {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.meet-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.meet-title {
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
  margin-bottom: 12px;
  flex: 1;
}

.book-now-btn {
  background: white;
  color: black;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-end;
  text-transform: none;
  letter-spacing: 0.025em;
  margin-top: auto;
}

.book-now-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}

/* Meet badge styles for session indicator */

.meet-visual {
  position: relative;
  height: 400px;
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.meet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.meet-card:hover .meet-image {
  transform: scale(1.05);
}

.meet-overlay {
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

.meet-card:hover .meet-overlay {
  opacity: 1;
}

.meet-price-badge {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  backdrop-filter: blur(5px);
}

.meet-badge {
  border: 1px solid rgba(59, 130, 246, 0.4);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  align-self: flex-start;
  margin-bottom: 8px;
  display: inline-block;
  width: fit-content;
}

.meet-content {
  text-align: center;
}

/* .meet-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1.3;
} */

.meet-description {
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 16px;
  line-height: 1.5;
}

.meet-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 0.8rem;
}

.meet-duration {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #94a3b8;
}



.book-btn {
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.025em;
}

/* No Products */
.no-products {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 60px 20px;
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.no-products-content {
  text-align: center;
  max-width: 500px;
}

.no-products-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #f8fafc;
  margin: 20px 0 12px 0;
}

.no-products-content p {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.no-additional-courses {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
}

.no-additional-courses p {
  margin-top: 16px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .carousel-nav-btn {
    width: 40px;
    height: 40px;
  }

  .carousel-prev {
    left: -20px;
  }

  .carousel-next {
    right: -20px;
  }

  .course-card {
    width: 260px;
    height: 320px;
  }

  /* Responsive grid for centered layout */
  .courses-carousel.centered-grid {
    max-width: 1600px;
    padding: 0 15px;
  }

  .meet-vertical-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    /* max-width: 800px; */
    margin: 0 auto;
    padding: 0 15px;
  }
  
  .meet-horizontal-card {
    max-width: 100%;
    min-height: 120px;
  }
  
  .meet-image-section {
    min-height: 120px;
    width: 120px;
  }
  
  .meet-content-section {
    padding: 12px;
  }
  
  .meet-card-title {
    font-size: 1rem;
  }
  
  .meet-card-description {
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .course-meet-section {
    padding: 60px 0;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
   
  .currency-info {
    margin-top: 12px;
  }
   
  .currency-badge {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
   
  .currency-note {
    font-size: 0.8rem;
  }
  
  .carousel-nav-btn {
    width: 36px;
    height: 36px;
  }

  .carousel-prev {
    left: -18px;
  }

  .carousel-next {
    right: -18px;
  }

  .course-card {
    width: 240px;
    height: 300px;
  }

  .course-card:hover {
    transform: translateY(-6px) scale(1.02);
    width: 320px;
    height: 300px;
  }

  .course-title {
    font-size: 0.9rem;
  }

  /* Mobile responsive grid */
  .courses-carousel.centered-grid {
    max-width: 1400px;
    padding: 0 10px;
    gap: 20px;
  }

  .meet-vertical-container {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
    padding: 0 15px;
    gap: 16px;
  }
  
  .meet-horizontal-card {
    max-width: 100%;
    min-height: 130px;
    /* Keep horizontal layout on mobile for better UX */
  }
  
  .meet-image-section {
    width: 35%;
    min-height: 130px;
    flex-shrink: 0;
  }
  
  .meet-content-section {
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .meet-title {
    font-size: 1rem;
    margin-bottom: 12px;
  }
  
  .meet-price {
    font-size: 1.125rem;
    margin-bottom: 8px;
  }
}

@media (max-width: 480px) {
  .container{
    padding: 0;
  }
  
  .section-header{
    margin-bottom: 0;
  }

  .section-title {
    font-size: 20px;
  }

  .carousel-container{
    margin-top: 12px;
  }
  
  .carousel-nav-btn {
    width: 32px;
    height: 32px;
  }

  .carousel-prev {
    left: -16px;
  }

  .carousel-next {
    right: -16px;
  }

  .course-card {
    width: 250px;
  }

  .course-title {
    font-size: 0.85rem;
  }

  .course-badges {
    gap: 6px;
    margin-bottom: 8px;
  }

  .course-level-badge,
  .course-price-badge {
    font-size: 0.7rem;
    padding: 3px 6px;
  }

  .course-level-badge{
    padding: 3px 8px;
  }

  /* Small mobile responsive grid */
  .courses-carousel.centered-grid {
    max-width: 1200px;
    padding: 0 5px;
    gap: 16px;
  }

  .meet-vertical-container {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
    padding: 0;
    gap: 12px;
  }
  
  .meet-horizontal-card {
    height: 110px;
    min-height: 110px;
    width: 100%;
  }
  
  .meet-image-section {
    width: 33%;
    min-height: 110px;
    flex-shrink: 0;
  }
  
  .meet-content-section {
    padding: 10px;
    gap: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  
  .meet-title {
    font-size: 13px;
    margin-bottom: 8px;
    margin-bottom: 0;
  }
  
  .meet-price {
    font-size: 14px;
    margin-bottom: 6px;
    margin-bottom: 0;
  }

  .meet-badge{
    font-size: 9px;
    padding: 2px 6px;
    margin-bottom: 0;
  }
  
  .book-now-btn {
    display: none;
  }
  
  .currency-info {
    margin-top: 8px;
  }
  
  .currency-badge {
    padding: 4px 10px;
    font-size: 0.7rem;
  }
  
  .currency-note {
    font-size: 0.7rem;
  }
}

/* Additional Responsive Breakpoints */

/* Large Desktop (1400px and up) */
@media (min-width: 1400px) {
  /* .meet-horizontal-card {
    max-width: 450px;
  } */
  
  .meet-vertical-container {
    max-width: 100vw;
    margin: 0 auto;
  }
}

/* Desktop (1200px to 1399px) */
@media (max-width: 1399px) and (min-width: 1200px) {
  .meet-horizontal-card {
    max-width: 400px;
  }
  
  .meet-vertical-container {
    max-width: 900px;
    margin: 0 auto;
  }
}

/* Laptop (992px to 1199px) */
@media (max-width: 1199px) and (min-width: 992px) {
  .meet-horizontal-card {
    max-width: 380px;
  }
  
  .meet-vertical-container {
    /* max-width: 800px; */
    margin: 0 auto;
  }
}

/* Mobile Large (576px to 767px) */
@media (max-width: 767px) and (min-width: 576px) {
  .meet-vertical-container {
    max-width: 450px;
    padding: 0;
  }
  
  .meet-horizontal-card {
    min-height: 125px;
  }
  
  .meet-image-section {
    width: 32%;
    min-height: 125px;
  }
  
  .meet-content-section {
    padding: 12px;
  }
}

/* Extra Small Mobile (up to 375px) */
@media (max-width: 375px) {
  .meet-vertical-container {
    max-width: 350px;
    padding: 0;
  }
  
  .meet-horizontal-card {
    min-height: 100px;
  }
  
  .meet-image-section {
    width: 28%;
    min-height: 100px;
  }
  
  .meet-content-section {
    padding: 8px;
  }
  
  .meet-title {
    font-size: 0.85rem;
  }
  
  .meet-description {
    font-size: 0.75rem;
  }
  
  .meet-price {
    font-size: 0.9rem;
  }
  
  .book-now-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }
}

/* Video Gallery Styles */
.video-category-section {
  margin-top: 60px;
}

.video-loading-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.video-loading-state p {
  margin-top: 16px;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.video-gallery-carousel {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  position: relative;
  width: 100%;
  justify-content: flex-start;
}

.video-gallery-carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.video-gallery-carousel.centered-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  margin: 0 auto;
  overflow: visible;
  padding: 0 20px;
}

.video-gallery-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  flex-shrink: 0;
  transform-origin: center;
  will-change: transform, opacity, box-shadow;
  width: 225px;
  height: 300px;
}

.video-gallery-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.video-gallery-card:hover {
  border-radius: 12px !important;
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.15);
  z-index: 15;
  opacity: 1 !important;
  filter: blur(0px) !important;
}

.video-gallery-card:hover::before {
  opacity: 1;
  border-radius: 12px;
}

.video-gallery-card:hover .video-gallery-thumbnail {
  border-radius: 12px;
  overflow: hidden;
}

.video-gallery-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 12px;
}

.video-gallery-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-gallery-play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  transition: all 0.4s ease;
  z-index: 6;
  pointer-events: auto;
}

.video-gallery-play-overlay .v-icon {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  padding: 0;
  color: #1a1a1a !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  font-size: 24px;
}

.video-gallery-card:hover .video-gallery-play-overlay .v-icon {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
}

.expandable-content-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  padding: 10px 12px;
  max-height: 30%;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  pointer-events: none;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
}

.video-gallery-card:hover .expandable-content-overlay {
  opacity: 1 !important;
  transform: translateY(0);
  pointer-events: auto;
}

.expandable-header {
  text-align: center;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.video-gallery-card:hover .expandable-header {
  opacity: 1 !important;
  transform: translateY(0);
}

.expandable-title {
  color: #ffffff !important;
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.9), 0 0 20px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px 16px;
  border-radius: 12px;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  max-width: 100%;
  width: 100%;
  box-sizing: border-box;
  overflow-wrap: break-word;
  word-break: normal;
  hyphens: none;
}

.premium-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
}

.premium-lock-icon {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-video-overlay:hover .premium-lock-icon {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.premium-subscribe-btn {
  background: #ffffff;
  color: #1a1a1a;
  border: none;
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
  text-transform: none;
  letter-spacing: 0.02em;
}

.premium-subscribe-btn:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.3);
}

.premium-crown-badge {
  position: absolute;
  top: 14px;
  right: 14px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 6;
  pointer-events: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.premium-crown-badge .v-icon {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

@media (max-width: 1024px) {
  .video-gallery-card {
    width: 260px;
    height: 320px;
  }
}

@media (max-width: 768px) {
  .video-gallery-card {
    width: 240px;
    height: 300px;
  }

  .video-gallery-card:hover {
    transform: translateY(-6px) scale(1.02);
    width: 320px;
    height: 300px;
  }

  .expandable-title {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .video-gallery-card {
    width: 250px;
  }
}
</style>
