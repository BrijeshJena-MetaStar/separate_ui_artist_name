<template>
  <!-- Video Gallery Section -->
  <section v-if="journeyVideos.length > 0 || studioVideos.length > 0 || stageVideos.length > 0 || isVideosLoading" class="video-gallery-section">
  <!-- <section class="video-gallery-section"> -->
    <div class="container">
      <!-- Loading State -->
      <div v-if="isVideosLoading" class="video-loading-state">
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
        ></v-progress-circular>
        <p>Loading videos...</p>
      </div>

      <!-- Videos Content -->
      <div v-else>
          <div class="video-category-section" id="videos">
          <div v-if="journeyVideos.length > 0" class="video-category-section" id="videos">
          <div class="section-header">
            <h2 class="section-title">The Stories</h2>
            <p class="section-subtitle">Journey, highlights, BTS & Trivia</p>
          </div>

          <div class="carousel-container">
            <button
              v-if="shouldShowJourneyCarousel"
              class="carousel-nav-btn carousel-prev"
              @click="scrollJourneyCarousel('left')"
              :disabled="journeyScrollPosition <= 0"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </button>

            <div
              class="video-gallery-carousel"
              :class="{ 'centered-grid': !shouldShowJourneyCarousel }"
              ref="journeyCarousel"
            >
              <div
                v-for="(video, index) in displayedJourneyVideos"
                :key="video.id || video.video_id || index"
                class="video-gallery-card expandable-card"
                :class="{ 'coming-soon-card': isComingSoon(video) }"
                @click="
                  isComingSoon(video)
                    ? null
                    : video.type === 'viewAll'
                    ? openAllJourneyVideos()
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
                  <div v-if="isComingSoon(video)" class="coming-soon-overlay">
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
                      @click="!isComingSoon(video) && (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : callingApiforVideo(video.id, false))"
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
                        !isComingSoon(video) &&
                        video.category !== undefined &&
                        !(video.pricing === 'SUBSCRIPTION' && !props.isSubscribed) &&
                        !videoLoadingStates[video.id]
                      "
                      @click="callingApiforVideo(video.id, false)"
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
                      v-if="!isComingSoon(video) && (video.category === undefined || (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed))"
                      class="premium-video-overlay"
                    >
                      <div class="premium-overlay-content">
                        <div class="premium-lock-icon">
                          <v-icon size="20" color="white">mdi-lock</v-icon>
                        </div>
                        <button
                          class="premium-subscribe-btn"
                          @click="video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : navigateToPaidVideo(video)"
                        >
                          {{ video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? 'Subscribe to Watch' : 'Buy Now' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              v-if="shouldShowJourneyCarousel"
              class="carousel-nav-btn carousel-next"
              @click="scrollJourneyCarousel('right')"
              :disabled="journeyScrollPosition >= journeyMaxScroll"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </button>

            <div class="view-all-button-container">
              <button class="view-all-btn" @click="openAllJourneyVideos()">
                View all
              </button>
            </div>
          </div>
          </div>
        </div>

          <!-- Stage Videos Section -->
          <div class="video-category-section" id="videos">
          <div v-if="stageVideos.length > 0" class="video-category-section" id="videos">
          <div class="section-header">
            <h2 class="section-title">The Stage</h2>
            <p class="section-subtitle">Concerts, shows, performance clips</p>
          </div>

          <div class="carousel-container">
            <button
              v-if="shouldShowStageCarousel"
              class="carousel-nav-btn carousel-prev"
              @click="scrollStageCarousel('left')"
              :disabled="stageScrollPosition <= 0"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </button>

            <div
              class="video-gallery-carousel"
              :class="{ 'centered-grid': !shouldShowStageCarousel }"
              ref="stageCarousel"
            >
              <div
                v-for="(video, index) in displayedStageVideos"
                :key="video.id || video.video_id || index"
                class="video-gallery-card expandable-card"
                :class="{ 'coming-soon-card': isComingSoon(video) }"
                 @click="
                   isComingSoon(video)
                     ? null
                     : video.type === 'viewAll'
                     ? openAllStageVideos()
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
                  <div v-if="isComingSoon(video)" class="coming-soon-overlay">
                    <div class="coming-soon-content">
                      <v-icon size="48" color="white" class="coming-soon-icon">mdi-clock-outline</v-icon>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                  <div v-if="video.type === 'viewAll'" class="view-all-overlay">
                    <v-icon size="64" color="#3b82f6">mdi-playlist-play</v-icon>
                    <h3 class="view-all-text">View All</h3>
                  </div>

                  <!-- Regular Video Thumbnail -->
                  <template v-else>
                    <img
                      v-if="getVideoThumbnail(video)"
                      :src="getVideoThumbnail(video)"
                      :alt="video.title"
                      class="video-gallery-image"
                    />
                    <div
                      v-else
                      class="video-gallery-placeholder"
                      v-if="video.category !== undefined"
                      @click="!isComingSoon(video) && (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : callingApiforVideo(video.id, false))"
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
                        !isComingSoon(video) &&
                        video.category !== undefined &&
                        !(video.pricing === 'SUBSCRIPTION' && !props.isSubscribed) &&
                        !videoLoadingStates[video.id]
                      "
                      @click="callingApiforVideo(video.id, false)"
                    >
                      <v-icon size="32" color="white">mdi-play-circle</v-icon>
                    </div>

                    <!-- Enhanced expandable content overlay for free videos -->
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
                      v-if="!isComingSoon(video) && (video.category === undefined || (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed))"
                      class="premium-video-overlay"
                    >
                      <div class="premium-overlay-content">
                        <div class="premium-lock-icon">
                          <v-icon size="20" color="white">mdi-lock</v-icon>
                        </div>
                        <button
                          class="premium-subscribe-btn"
                          @click="video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : navigateToPaidVideo(video)"
                        >
                          {{ video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? 'Subscribe to Watch' : 'Buy Now' }}
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <button
              v-if="shouldShowStageCarousel"
              class="carousel-nav-btn carousel-next"
              @click="scrollStageCarousel('right')"
              :disabled="stageScrollPosition >= stageMaxScroll"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </button>

            <div class="view-all-button-container">
              <button class="view-all-btn" @click="openAllStageVideos()">
                View all
              </button>
            </div>
          </div>
          </div>
        </div>

        <!-- Studio Videos Section -->
        <div class="video-category-section" id="videos">
          <div v-if="studioVideos.length > 0" class="video-category-section" id="videos">
          <div class="section-header">
            <h2 class="section-title">The Backstage</h2>
          </div>

          <div class="carousel-container">
            <button
              v-if="shouldShowStudioCarousel"
              class="carousel-nav-btn carousel-prev"
              @click="scrollStudioCarousel('left')"
              :disabled="studioScrollPosition <= 0"
            >
              <v-icon>mdi-arrow-left</v-icon>
            </button>

            <div
              class="video-gallery-carousel"
              :class="{ 'centered-grid': !shouldShowStudioCarousel }"
              ref="studioCarousel"
            >
              <div
                v-for="(video, index) in displayedStudioVideos"
                :key="video.id || video.video_id || index"
                class="video-gallery-card expandable-card"
                :class="{ 'coming-soon-card': isComingSoon(video) }"
                @click="
                  isComingSoon(video)
                    ? null
                    : video.type === 'viewAll'
                    ? openAllStudioVideos()
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
                  <div v-if="isComingSoon(video)" class="coming-soon-overlay">
                    <div class="coming-soon-content">
                      <v-icon size="48" color="white" class="coming-soon-icon">mdi-clock-outline</v-icon>
                      <span class="coming-soon-badge">Coming Soon</span>
                    </div>
                  </div>
                  <div v-if="video.type === 'viewAll'" class="view-all-overlay">
                    <v-icon size="64" color="#3b82f6">mdi-playlist-play</v-icon>
                    <h3 class="view-all-text">View All</h3>
                  </div>

                  <!-- Regular Video Thumbnail -->
                  <template v-else>
                    <img
                      v-if="getVideoThumbnail(video)"
                      :src="getVideoThumbnail(video)"
                      :alt="video.title"
                      class="video-gallery-image"
                    />
                    <div
                      v-else
                      class="video-gallery-placeholder"
                      v-if="video.category !== undefined"
                      @click="!isComingSoon(video) && callingApiforVideo(video.id, true)"
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
                        !isComingSoon(video) &&
                        video.category !== undefined &&
                        !(video.pricing === 'SUBSCRIPTION' && !props.isSubscribed) &&
                        !videoLoadingStates[video.id]
                      "
                      @click="callingApiforVideo(video.id, false)"
                    >
                      <v-icon size="32" color="white">mdi-play-circle</v-icon>
                    </div>

                    <!-- Enhanced expandable content overlay for free videos -->
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
                      v-if="!isComingSoon(video) && (video.category === undefined || (video.pricing === 'SUBSCRIPTION' && !props.isSubscribed))"
                      class="premium-video-overlay"
                    >
                      <div class="premium-overlay-content">
                        <div class="premium-lock-icon">
                          <v-icon size="20" color="white">mdi-lock</v-icon>
                        </div>
                        <button
                          class="premium-subscribe-btn"
                          @click="video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : navigateToPaidVideo(video)"
                        >
                          {{ video.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? 'Subscribe to Watch' : 'Buy Now' }}
                        </button>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <button
              v-if="shouldShowStudioCarousel"
              class="carousel-nav-btn carousel-next"
              @click="scrollStudioCarousel('right')"
              :disabled="studioScrollPosition >= studioMaxScroll"
            >
              <v-icon>mdi-arrow-right</v-icon>
            </button>

            <div class="view-all-button-container">
              <button class="view-all-btn" @click="openAllStudioVideos()">
                View all
              </button>
            </div>
          </div>
          </div>
        </div>

      </div>
    </div>
  </section>

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
</template>

<script setup>
import { computed, ref, nextTick, onMounted, watch, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";
import { getArtistVideosUrl } from "@/services/artistService";

const MediaCarousel = defineAsyncComponent(() => import("./MediaCarousel.vue"));
const SubscriptionDialog = defineAsyncComponent(() => import("./SubscriptionDialog.vue"));

// Props
const props = defineProps({
  artistVideos: {
    type: Array,
    default: () => [],
  },
  isVideosLoading: {
    type: Boolean,
    default: false,
  },
  artistName: {
    type: String,
    default: "",
  },
  paidVideos: {
    type: Array,
    default: () => [],
  },
  isSubscribed: {
    type: Boolean,
    default: false,
  },
  defaultThumbnail: {
    type: String,
    default: "",
  },
  onSubscribe: {
    type: Function,
    default: null,
  },
});

// Helper to resolve thumbnails with fallback
const getVideoThumbnail = (video) => {
  if (!video) return props.defaultThumbnail || "";
  return video.thumbnail || video.image || props.defaultThumbnail || "";
};

const getThumbnailBackgroundStyle = (video) => {
  if (!video || video.type === 'viewAll') return {};

  const thumbnail = getVideoThumbnail(video);
  if (!thumbnail) return {};

  return {
    backgroundImage: `url('${thumbnail}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };
};

// Emits
const emit = defineEmits(["open-video-carousel"]);

// Router
const router = useRouter();

// Computed properties for categorized videos
const journeyVideos = computed(() => {
  if (!props.artistVideos || props.artistVideos.length === 0) return [];
  return props.artistVideos.filter(
    (video) => video.category === "JOURNEY_VIDEO" || video.video_category === "JOURNEY_VIDEO"
  );
});

const studioVideos = computed(() => {
  if (!props.artistVideos || props.artistVideos.length === 0) return [];
  return props.artistVideos.filter(
    (video) =>
      video.category === "STUDIO" || video.video_category === "STUDIO"
  );
});

const stageVideos = computed(() => {
  if (!props.artistVideos || props.artistVideos.length === 0) return [];
  return props.artistVideos.filter(
    (video) =>
      video.category === "STAGE" || video.video_category === "STAGE"
  );
});

const displayedJourneyVideos = computed(() => {
  if (!journeyVideos.value || journeyVideos.value.length === 0) return [];

  // Sort videos by order_id (ascending order)
  // Videos without order_id will be placed at the end
  const sortedVideos = [...journeyVideos.value].sort((a, b) => {
    const orderIdA = a.order_id ?? a.video_order_id ?? Number.MAX_SAFE_INTEGER;
    const orderIdB = b.order_id ?? b.video_order_id ?? Number.MAX_SAFE_INTEGER;
    return orderIdA - orderIdB;
  });

  return sortedVideos;
});

const displayedStudioVideos = computed(() => {
  if (!studioVideos.value || studioVideos.value.length === 0) return [];

  // Sort videos by order_id (ascending order)
  // Videos without order_id will be placed at the end
  const sortedVideos = [...studioVideos.value].sort((a, b) => {
    const orderIdA = a.order_id ?? a.video_order_id ?? Number.MAX_SAFE_INTEGER;
    const orderIdB = b.order_id ?? b.video_order_id ?? Number.MAX_SAFE_INTEGER;
    return orderIdA - orderIdB;
  });

  return sortedVideos;
});

const displayedStageVideos = computed(() => {
  if (!stageVideos.value || stageVideos.value.length === 0) return [];

  // Sort videos by order_id (ascending order)
  // Videos without order_id will be placed at the end
  const sortedVideos = [...stageVideos.value].sort((a, b) => {
    const orderIdA = a.order_id ?? a.video_order_id ?? Number.MAX_SAFE_INTEGER;
    const orderIdB = b.order_id ?? b.video_order_id ?? Number.MAX_SAFE_INTEGER;
    return orderIdA - orderIdB;
  });

  return sortedVideos;
});

// Computed properties to determine if carousels should be shown
const shouldShowJourneyCarousel = computed(() => {
  return journeyVideos.value && journeyVideos.value.length > 4;
});

const shouldShowStudioCarousel = computed(() => {
  return studioVideos.value && studioVideos.value.length > 4;
});

const shouldShowStageCarousel = computed(() => {
  return stageVideos.value && stageVideos.value.length > 4;
});

// Computed property for carousel media list
const carouselMediaList = computed(() => {
  return getAllVideosForCategory(currentCategory.value);
});

// Carousel state management
const isCarouselVisible = ref(false);
const selectedVideoIndex = ref(0);
const currentCategory = ref("");

// Carousel scroll state
const journeyScrollPosition = ref(0);
const studioScrollPosition = ref(0);
const stageScrollPosition = ref(0);
const journeyMaxScroll = ref(0);
const studioMaxScroll = ref(0);
const stageMaxScroll = ref(0);
const journeyCarousel = ref(null);
const studioCarousel = ref(null);
const stageCarousel = ref(null);

// Video stream URLs cache
const videoStreamUrls = ref({});

// Loading states for individual videos
const videoLoadingStates = ref({});

// Subscription dialog state
const isSubscriptionDialogVisible = ref(false);

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
      mediaType: "video",
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
  if (category === "JOURNEY_VIDEO") {
    return convertVideosToMedia(displayedJourneyVideos.value);
  } else if (category === "STUDIO") {
    return convertVideosToMedia(displayedStudioVideos.value);
  } else if (category === "STAGE") {
    return convertVideosToMedia(displayedStageVideos.value);
  }
  return [];
};

// Helper function to get the actual video index in the original array
const getVideoIndex = (video) => {
  if (video.type === "viewAll") return 0;

  // Find the video in the original artistVideos array
  const originalIndex = props.artistVideos.findIndex(
    (v) => v.id === video.id || v.video_id === video.video_id
  );

  return originalIndex;
};

// Helper function to format video duration
const formatDuration = (duration) => {
  if (!duration) return "";

  // If duration is in seconds, convert to MM:SS format
  if (typeof duration === "number") {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  // If duration is already a string, return as is
  if (typeof duration === "string") {
    return duration;
  }

  return "";
};

// Helper function to check if video is coming soon
const isComingSoon = (video) => {
  if (!video) return false;
  
  const id = video.id || video.video_id;
  if (!id) return false;
  
  return id.toString().startsWith('coming-soon');
};

// Methods
const openVideoCarousel = (index) => {
  // Find the video in the original artistVideos array
  const video = props.artistVideos[index];

  // Prevent opening coming soon videos
  if (video && isComingSoon(video)) {
    return;
  }

  if (video) {
    currentCategory.value = video.category;

    const categoryVideos = getAllVideosForCategory(video.category);

    // Find the video in the category videos by matching the video ID directly
    const categoryIndex = categoryVideos.findIndex((v) => v.id === video.id);

    if (categoryIndex !== -1) {
      selectedVideoIndex.value = categoryIndex;
      isCarouselVisible.value = true;
    } else {
      console.error("Could not find video in category videos");
      // Fallback: open carousel with first video
      selectedVideoIndex.value = 0;
      isCarouselVisible.value = true;
    }
  } else {
    console.error("Video not found at index:", index);
  }
};

const openAllJourneyVideos = () => {
  currentCategory.value = "JOURNEY_VIDEO";
  selectedVideoIndex.value = undefined; // Set to undefined to show grid view
  isCarouselVisible.value = true;
};

const openAllStudioVideos = () => {
  currentCategory.value = "STUDIO";
  selectedVideoIndex.value = undefined; // Set to undefined to show grid view
  isCarouselVisible.value = true;
};

const openAllStageVideos = () => {
  currentCategory.value = "STAGE";
  selectedVideoIndex.value = undefined; // Set to undefined to show grid view
  isCarouselVisible.value = true;
};

const closeCarousel = () => {
  isCarouselVisible.value = false;
  selectedVideoIndex.value = undefined;
  currentCategory.value = "";
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
    const route = `paidVideo/${video.id}`;
    // const route = `/${props.artistName}/paidVideo/${video.id}`;
    router.push(route);
  } else {
    console.error("Video or video.id is missing:", video);
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
        const videoType = detectVideoType(videoUrl, isVimeoFlag);
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
          console.error("Video not found in artistVideos array");
        }
      } else {
        console.warn("No video URL found in response (checked video_stream_url, video, and old_video fields)");
      }
    } else {
      console.warn("No videos found in response");
    }
  } catch (error) {
    console.error("Error fetching video URL:", error);
    // You could show a user-friendly error message here
  } finally {
    // Clear loading state
    videoLoadingStates.value[id] = false;
  }
};

// Carousel scroll methods
const scrollJourneyCarousel = (direction) => {
  const carousel = journeyCarousel.value;
  if (!carousel) {
    return;
  }

  const scrollAmount = 320; // Width of one card plus gap
  const currentScroll = carousel.scrollLeft;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;

  if (direction === "left") {
    const newPosition = Math.max(0, currentScroll - scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(() => {
      journeyScrollPosition.value = carousel.scrollLeft;
    }, 300);
  } else {
    const newPosition = Math.min(maxScroll, currentScroll + scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(() => {
      journeyScrollPosition.value = carousel.scrollLeft;
    }, 300);
  }

  journeyMaxScroll.value = maxScroll;
};

const scrollStudioCarousel = (direction) => {
  const carousel = studioCarousel.value;
  if (!carousel) {
    return;
  }

  const scrollAmount = 320; // Width of one card plus gap
  const currentScroll = carousel.scrollLeft;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;

  if (direction === "left") {
    const newPosition = Math.max(0, currentScroll - scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(() => {
      studioScrollPosition.value = carousel.scrollLeft;
    }, 300);
  } else {
    const newPosition = Math.min(maxScroll, currentScroll + scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(() => {
      studioScrollPosition.value = carousel.scrollLeft;
    }, 300);
  }

  studioMaxScroll.value = maxScroll;
};

const scrollStageCarousel = (direction) => {
  const carousel = stageCarousel.value;
  if (!carousel) {
    return;
  }

  const scrollAmount = 320; // Width of one card plus gap
  const currentScroll = carousel.scrollLeft;
  const maxScroll = carousel.scrollWidth - carousel.clientWidth;

  if (direction === "left") {
    const newPosition = Math.max(0, currentScroll - scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(() => {
      stageScrollPosition.value = carousel.scrollLeft;
    }, 300);
  } else {
    const newPosition = Math.min(maxScroll, currentScroll + scrollAmount);
    carousel.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });
    setTimeout(() => {
      stageScrollPosition.value = carousel.scrollLeft;
    }, 300);
  }

  stageMaxScroll.value = maxScroll;
};

// Initialize carousel max scroll values
const initializeCarousels = () => {
  nextTick(() => {
    if (journeyCarousel.value && shouldShowJourneyCarousel.value) {
      journeyMaxScroll.value =
        journeyCarousel.value.scrollWidth - journeyCarousel.value.clientWidth;
      journeyCarousel.value.addEventListener("scroll", updateScrollPositions);
    } else if (journeyCarousel.value && !shouldShowJourneyCarousel.value) {
      journeyScrollPosition.value = 0;
      journeyMaxScroll.value = 0;
    }

    if (studioCarousel.value && shouldShowStudioCarousel.value) {
      studioMaxScroll.value =
        studioCarousel.value.scrollWidth - studioCarousel.value.clientWidth;
      studioCarousel.value.addEventListener("scroll", updateScrollPositions);
    } else if (studioCarousel.value && !shouldShowStudioCarousel.value) {
      studioScrollPosition.value = 0;
      studioMaxScroll.value = 0;
    }

    if (stageCarousel.value && shouldShowStageCarousel.value) {
      stageMaxScroll.value =
        stageCarousel.value.scrollWidth - stageCarousel.value.clientWidth;
      stageCarousel.value.addEventListener("scroll", updateScrollPositions);
    } else if (stageCarousel.value && !shouldShowStageCarousel.value) {
      stageScrollPosition.value = 0;
      stageMaxScroll.value = 0;
    }
  });
};

// Update scroll positions on scroll events
const updateScrollPositions = () => {
  if (journeyCarousel.value) {
    journeyScrollPosition.value = journeyCarousel.value.scrollLeft;
  }
  if (studioCarousel.value) {
    studioScrollPosition.value = studioCarousel.value.scrollLeft;
  }
  if (stageCarousel.value) {
    stageScrollPosition.value = stageCarousel.value.scrollLeft;
  }
};

// Initialize on mount
onMounted(() => {
  // Use a timeout to ensure DOM is fully rendered
  setTimeout(() => {
    initializeCarousels();
  }, 100);
});

// Watch for changes in video data and reinitialize
watch(
  [() => props.artistVideos],
  () => {
    nextTick(() => {
      setTimeout(initializeCarousels, 100);
    });
  },
  { deep: true }
);
</script>

<style scoped>
.container {
  /* max-width: 1500px; */
  margin: 0 auto;
  padding: 0 24px;
}

/* Video Gallery Section */
.video-gallery-section {
  /* max-width: 1500px; */
  margin: 0 auto;
  padding: 60px 0;
}
/* 
.video-category-section {
  margin-bottom: 80px;
} */

.video-category-section:last-child {
  margin-bottom: 0;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

/* Webflow-style expansion effect - dim non-hovered cards */
/* .video-gallery-carousel:hover .video-gallery-card:not(:hover) { */
/* opacity: 0.4; */
/* transform: scale(0.96); */
/* filter: blur(0.5px); */
/* } */

.video-gallery-carousel::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* Centered flex layout for 6 or fewer videos */
.video-gallery-carousel.centered-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  /* justify-content: center; */
  align-items: center;
  /* max-width: 1800px; */
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
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 5px 32px;
  color: #000;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.view-all-btn:hover {
  background: rgb(185, 185, 185);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.video-gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 48px;
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

.video-gallery-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 12px;
}

.video-gallery-card:hover .video-gallery-thumbnail {
  border-radius: 12px;
  overflow: hidden;
}

.video-gallery-image {
  border-radius: 12px !important;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  object-position: top;
}

.video-gallery-card:hover .video-gallery-image {
  transform: scale(1.08);
  border-radius: 12px;
  overflow: hidden;
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
  /* box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); */
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

/* Title overlay on hover */
.video-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 40px 16px 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
  pointer-events: none;
}

.video-gallery-card:hover .video-title-overlay {
  opacity: 1;
  transform: translateY(0);
}

.video-overlay-title {
  color: white;
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  line-height: 1.3;
}

/* Expandable Content Overlay Styles - Horizontal Expansion */
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
  /* max-height: calc(1.3em * 2 + 16px);  */
}

.expandable-category {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 25px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expandable-category.iconic {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}

.expandable-category.premium {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}

.expandable-body {
  margin-top: 16px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-gallery-card:hover .expandable-body {
  opacity: 1;
  transform: translateY(0);
}

.expandable-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 20px 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
}

.expandable-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-gallery-card:hover .expandable-meta {
  opacity: 1;
  transform: translateY(0);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.meta-item:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.meta-item.premium {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.2);
}

.meta-item.premium:hover {
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.3);
}

/* Premium Video Overlay Styles */
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

.video-gallery-info {
  padding: 12px 24px;
  position: relative;
  z-index: 2;
}

.video-gallery-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  letter-spacing: -0.01em;
}

.view-all-title {
  font-weight: 400;
  font-size: 1rem;
  font-style: italic;
}

.video-gallery-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.video-gallery-duration {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.video-gallery-free-tag {
  font-size: 0.875rem;
  color: #10b981;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-gallery-card:hover .video-gallery-free-tag {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.video-gallery-view-all-tag {
  font-size: 0.875rem;
  color: #3b82f6;
  font-weight: 600;
  background: rgba(59, 130, 246, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.2);
}

.video-gallery-card:hover .video-gallery-view-all-tag.journey-tag {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.3);
  transform: translateY(-1px);
}

.video-gallery-card:hover .video-gallery-view-all-tag.iconic-tag {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.video-gallery-card:hover .video-gallery-view-all-tag {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}

.view-all-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #3b82f6;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.video-gallery-card:hover .view-all-overlay {
  border-color: rgba(59, 130, 246, 0.4);
  transform: scale(1.02);
}

.video-gallery-card:hover .view-all-text {
  color: #1d4ed8;
}

.video-gallery-card:hover .view-all-subtext {
  color: #4b5563;
}

.view-all-text {
  font-size: 1.2rem;
  margin: 6px 0 6px 0;
  color: #3b82f6;
  transition: color 0.3s ease;
  letter-spacing: -0.02em;
}

.view-all-subtext {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin: 0;
  transition: color 0.5s ease;
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

.video-empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.video-empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin: 16px 0 8px 0;
}

.video-empty-state p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
  line-height: 1.6;
}

/* Section Headers */
.section-header {
  margin-bottom: 48px;
  display: flex;
  flex-direction: column;
}

.section-title {
  /* text-align: center; */
  font-weight: 600;
  font-size: 2.25rem;
  color: #ffffff;
}

.section-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.6;
  font-weight: 300;
}

/* Responsive Design */
@media (max-width: 1024px) {
  /* Responsive flex for centered layout */
  .video-gallery-carousel.centered-grid {
    max-width: 1600px;
    padding: 0 15px;
  }
}

/* Responsive Expandable Cards - Horizontal Expansion */
@media (max-width: 1024px) {
  .video-gallery-card {
    width: 260px;
    height: 320px;
  }

  .video-gallery-card:hover {
    width: 360px;
    height: 320px;
  }

  .expandable-content-overlay {
    padding: 16px 16px 16px;
  }

  .expandable-title {
    font-size: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .premium-lock-icon {
    padding: 16px;
  }

  .premium-subscribe-btn {
    padding: 10px 28px;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }

  /* Mobile expandable cards adjustments - Horizontal Expansion */
  .video-gallery-card {
    width: 240px;
    height: 300px;
  }

  .video-gallery-card:hover {
    transform: translateY(-6px) scale(1.02);
    width: 320px;
    height: 300px;
  }

  .expandable-content-overlay {
    padding: 12px 12px 12px;
  }

  .expandable-title {
    display: flex !important;
    justify-content: center !important;
    font-size: 0.95rem;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .premium-overlay-content {
    gap: 16px;
  }

  .premium-lock-icon {
    padding: 14px;
  }

  .premium-subscribe-btn {
    padding: 10px 24px;
    font-size: 0.8rem;
  }

  .video-gallery-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

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

  .video-gallery-card {
    width: 250px;
  }

  /* Mobile responsive flex */
  .video-gallery-carousel.centered-grid {
    max-width: 1400px;
    padding: 0 10px;
    gap: 20px;
  }

  .view-all-text {
    font-size: 1.125rem;
  }

  .view-all-subtext {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0;
  }

  .section-title {
    font-size: 20px;
  }

  /* Small mobile responsive flex */
  .video-gallery-carousel.centered-grid {
    max-width: 1200px;
    padding: 0 5px;
    gap: 16px;
  }

  .view-all-btn {
    font-size: 14px;
    border-radius: 8px;
  }

  .view-all-text {
    font-size: 1rem;
  }

  .view-all-subtext {
    font-size: 0.75rem;
  }

  .view-all-overlay .v-icon {
    font-size: 48px !important;
  }
}

/* Coming Soon Overlay Styles */
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
  z-index: 4;
  backdrop-filter: blur(2px);
  border-radius: 8px;
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
  cursor: default !important;
}

.coming-soon-card:hover {
  transform: translateY(-4px) scale(1.01);
  opacity: 0.95;
}

/* Ensure title is visible on coming soon cards */
.coming-soon-card .expandable-content-overlay {
  opacity: 1 !important;
  transform: translateY(0) !important;
  z-index: 5;
}

/* Paid Video Overlay Styles */
.paid-video-overlay {
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
  z-index: 3;
  border-radius: 8px;
}

.paid-video-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 20px;
}

.paid-video-lock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.paid-video-subscribe-btn {
  background: white;
  color: black;
  border: none;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 120px;
}

.paid-video-subscribe-btn:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.paid-video-subscribe-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
</style>
