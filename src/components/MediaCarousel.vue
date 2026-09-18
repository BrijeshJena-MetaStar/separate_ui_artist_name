<template>
  <div v-if="isVisible" class="media-carousel-overlay" @click="closeCarousel">
    <div class="media-carousel-container" @click.stop>
      <button type="button" class="carousel-close-btn" @click="closeCarousel">
        <v-icon size="22" color="white">mdi-close</v-icon>
      </button>

      <div v-if="!hasSelectedIndex" class="grid-view-container">
        <div class="grid-hero">
          <div class="grid-hero-copy">
            <!-- <span class="grid-eyebrow">Media Gallery</span> -->
            <h2 class="grid-title">{{ artistName }}'s</h2>
            <p class="grid-subtitle">
              Browse Behind the Scenes and premium moments.
            </p>
          </div>

          <div class="grid-stats">
            <!-- <div class="grid-stat-card">
              <span class="grid-stat-label">Total</span>
              <strong class="grid-stat-value">{{ mediaList.length }}</strong>
            </div> -->
            <div class="grid-stat-card">
              <span class="grid-stat-label">Videos</span>
              <strong class="grid-stat-value">{{ gridVideoStats.videos }}</strong>
            </div>
            <div class="grid-stat-card">
              <span class="grid-stat-label">Subscription</span>
              <strong class="grid-stat-value">{{ gridVideoStats.subscription }}</strong>
            </div>
            <div class="grid-stat-card">
              <span class="grid-stat-label">Premium</span>
              <strong class="grid-stat-value">{{ gridVideoStats.premium }}</strong>
            </div>
            <div class="grid-stat-card">
              <span class="grid-stat-label">Free</span>
              <strong class="grid-stat-value">{{ gridVideoStats.free }}</strong>
            </div>
            <!-- <div class="grid-stat-card">
              <span class="grid-stat-label">Images</span>
              <strong class="grid-stat-value">{{ mediaList.filter((item) => item.mediaType === 'image').length }}</strong>
            </div> -->
          </div>
        </div>

        <div class="media-grid">
          <div
            v-for="(media, index) in mediaList"
            :key="media.id ?? media.videoId ?? index"
            class="media-grid-item"
            :class="{ 'coming-soon-card': isComingSoon(media) }"
            @click="selectMedia(index)"
          >
            <div
              v-if="media.mediaType === 'image'"
              class="grid-media-wrapper"
            >
              <div class="grid-media-topbar">
                <span class="grid-media-badge">
                  <v-icon size="14" color="white">mdi-image</v-icon>
                  <span>Image</span>
                </span>
              </div>
              <img
                :src="media.url"
                :alt="media.title"
                class="grid-media-image"
                loading="lazy"
                decoding="async"
                @load="onGridMediaLoad(index)"
                @error="onGridMediaError(index)"
              />
              <div class="grid-media-overlay">
                <h4 class="grid-media-title">{{ media.title }}</h4>
                <p v-if="media.description" class="grid-media-description">{{ media.description }}</p>
                <div class="grid-media-type">
                  <span>Open media</span>
                </div>
              </div>
            </div>

            <div
              v-else-if="media.mediaType === 'video'"
              class="grid-media-wrapper"
              :class="{
                'grid-media-wrapper--video-locked':
                  !isComingSoon(media) &&
                  (media.category === undefined ||
                    (media.pricing === 'SUBSCRIPTION' && !props.isSubscribed)),
              }"
              @click="handleVideoClick(media, index)"
            >
              <div class="grid-media-topbar">
                <span class="grid-media-badge">
                  <v-icon size="14" color="white">mdi-video</v-icon>
                  <span>Video</span>
                </span>
                <span
                  class="grid-status-badge"
                  :class="{
                    'is-soon': isComingSoon(media),
                    'is-locked': media.category === undefined || (media.pricing === 'SUBSCRIPTION' && !props.isSubscribed),
                    'is-open': !isComingSoon(media) && media.category !== undefined && !(media.pricing === 'SUBSCRIPTION' && !props.isSubscribed)
                  }"
                >
                  {{
                    isComingSoon(media)
                      ? 'Coming Soon'
                      : media.category === undefined
                        ? 'Premium'
                        : media.pricing === 'SUBSCRIPTION' && !props.isSubscribed
                          ? 'Members'
                          : 'Playable'
                  }}
                </span>
              </div>

              <div class="grid-video-container">
                <img v-if="media.thumbnail" :src="media.thumbnail" :alt="media.title" class="grid-media-image" />
                <div v-else class="grid-video-placeholder">
                  <v-icon size="32" color="#94a3b8">mdi-video</v-icon>
                </div>

                <div v-if="isComingSoon(media)" class="coming-soon-overlay">
                  <div class="coming-soon-content">
                    <v-icon size="48" color="white" class="coming-soon-icon">mdi-clock-outline</v-icon>
                    <span class="coming-soon-badge">Coming Soon</span>
                  </div>
                </div>

                <div
                  v-else-if="media.category === undefined || (media.pricing === 'SUBSCRIPTION' && !props.isSubscribed)"
                  class="paid-video-overlay"
                >
                  <div class="paid-video-content">
                    <span class="paid-video-label">
                      {{
                        media.pricing === 'SUBSCRIPTION' && !props.isSubscribed
                          ? 'Subscribers only'
                          : 'Premium video'
                      }}
                    </span>
                    <div class="paid-video-lock-icon">
                      <v-icon size="32" color="white">mdi-lock</v-icon>
                    </div>
                    <button
                      type="button"
                      class="paid-video-subscribe-btn"
                      @click.stop="media.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : navigateToPaidVideo(media)"
                    >
                      {{ media.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? 'Subscription' : 'Buy now' }}
                    </button>
                  </div>
                </div>

                <div v-else class="grid-video-play-overlay">
                  <v-icon size="24" color="white">mdi-play</v-icon>
                </div>
              </div>

              <div class="grid-media-overlay">
                <h4 class="grid-media-title">{{ media.title }}</h4>
                <p
                  v-if="
                    media.description &&
                      !isComingSoon(media) &&
                      media.category !== undefined &&
                      !(media.pricing === 'SUBSCRIPTION' && !props.isSubscribed)
                  "
                  class="grid-media-description"
                >
                  {{ media.description }}
                </p>
                <div
                  v-if="
                    !isComingSoon(media) &&
                      media.category !== undefined &&
                      !(media.pricing === 'SUBSCRIPTION' && !props.isSubscribed)
                  "
                  class="grid-media-type"
                >
                  <span>Play video</span>
                </div>
              </div>
            </div>

            <div v-else class="grid-media-wrapper">
              <div class="grid-media-topbar">
                <span class="grid-media-badge">
                  <v-icon size="14" color="white">mdi-file</v-icon>
                  <span>Unknown</span>
                </span>
              </div>
              <div class="grid-placeholder">
                <v-icon size="32" color="#94a3b8">mdi-file</v-icon>
                <span>Unknown Media</span>
              </div>
              <div class="grid-media-overlay">
                <h4 class="grid-media-title">{{ media.title }}</h4>
                <p v-if="media.description" class="grid-media-description">{{ media.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <div class="carousel-content-wrapper">
          <div v-if="currentMedia" class="carousel-topbar">
            <div class="carousel-topbar-copy">
              <span class="carousel-kicker">
                {{ currentMedia.mediaType === 'video' ? 'Featured Video' : 'Featured Image' }}
              </span>
              <h3 class="carousel-topbar-title">{{ currentMedia.title }}</h3>
              <p v-if="currentMedia.description" class="carousel-topbar-description">
                {{ currentMedia.description }}
              </p>
            </div>

            <div class="carousel-meta-stack">
              <span class="carousel-counter">{{ currentIndex + 1 }} / {{ mediaList.length }}</span>
              <span
                class="carousel-access-pill"
                :class="{
                  'is-soon': currentMedia?.mediaType === 'video' && isComingSoon(currentMedia),
                  'is-locked': currentMedia?.category === undefined || (currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed),
                  'is-open': currentMedia?.category !== undefined && !(currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed) && !(currentMedia?.mediaType === 'video' && isComingSoon(currentMedia))
                }"
              >
                {{
                  currentMedia?.mediaType === 'video' && isComingSoon(currentMedia)
                    ? 'Coming Soon'
                    : currentMedia?.category === undefined
                      ? 'Premium'
                      : currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed
                        ? 'Subscribers Only'
                        : currentMedia?.mediaType === 'video'
                          ? 'Ready to Play'
                          : 'Viewing'
                }}
              </span>
            </div>
          </div>

          <div class="carousel-stage-layout">
            <div class="main-media-container" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
              <div class="current-media-wrapper">
                <div class="stage-ambient-glow"></div>

                <img
                  v-if="currentMedia?.mediaType === 'image'"
                  :src="currentMedia.url"
                  :alt="currentMedia.title"
                  class="current-media current-image"
                  @load="onMediaLoad"
                  @error="onMediaError"
                />

                <div
                  v-else-if="currentMedia?.mediaType === 'video' && currentMedia?.category !== undefined && !(currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed) && !isComingSoon(currentMedia)"
                  class="video-container"
                >
                  <iframe
                    v-if="currentMedia?.isVimeo || currentMedia?.videoType === 'vimeo'"
                    ref="videoPlayer"
                    :src="currentMedia.url"
                    class="current-media current-video vimeo-iframe"
                    frameborder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowfullscreen
                    @load="onMediaLoad"
                    @error="onMediaError"
                  ></iframe>

                  <template v-else>
                    <video
                      ref="videoPlayer"
                      class="current-media current-video vimeo-iframe"
                      controls
                      controlsList="nodownload"
                      :poster="currentMedia?.thumbnail"
                      @loadedmetadata="onMediaLoad"
                      @error="onMediaError"
                    ></video>
                    <div v-if="!isPlaying" class="play-button" @click="playVideo">
                      <v-icon x-large color="white" style="font-size: 50px">mdi-play</v-icon>
                    </div>
                  </template>
                </div>

                <div v-if="currentMedia?.mediaType === 'video' && isComingSoon(currentMedia)" class="coming-soon-overlay">
                  <div class="coming-soon-content">
                    <v-icon size="64" color="white" class="coming-soon-icon">mdi-clock-outline</v-icon>
                    <span class="coming-soon-badge">Coming Soon</span>
                  </div>
                </div>

                <div
                  v-else-if="currentMedia?.category === undefined || (currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed)"
                  class="paid-video-overlay"
                  :class="{ 'paid-video-overlay--carousel-thumb': currentMedia?.thumbnail }"
                >
                  <div
                    v-if="currentMedia?.thumbnail"
                    class="paid-video-carousel-thumb"
                    aria-hidden="true"
                  >
                    <img
                      :src="currentMedia.thumbnail"
                      :alt="currentMedia.title || ''"
                      class="paid-video-carousel-thumb-img"
                    />
                  </div>
                  <div
                    v-if="currentMedia?.thumbnail"
                    class="paid-video-carousel-dim"
                    aria-hidden="true"
                  />
                  <div class="paid-video-content">
                    <div class="paid-video-lock-icon">
                      <v-icon size="32" color="white">mdi-lock</v-icon>
                    </div>
                    <button
                      type="button"
                      class="paid-video-subscribe-btn"
                      @click="currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? handleSubscriptionClick() : navigateToPaidVideo(currentMedia)"
                    >
                      {{ currentMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed ? 'Subscription' : 'Buy Now' }}
                    </button>
                  </div>
                </div>

                <div v-if="isLoading" class="media-loading-overlay">
                  <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
                  <p>Loading media...</p>
                </div>

                <div v-if="mediaError" class="media-error">
                  <v-icon size="48" color="#ef4444">mdi-alert-circle</v-icon>
                  <p>Failed to load media</p>
                </div>
              </div>

              <div v-if="currentMedia" class="media-info-overlay" :class="{ 'visible': isHovering }">
                <div class="media-info-content">
                  <h3 class="media-title">{{ currentMedia.title }}</h3>
                  <p v-if="currentMedia.description" class="media-description">
                    {{ currentMedia.description }}
                  </p>
                </div>
              </div>
            </div>

            <aside v-if="currentMedia" class="carousel-side-panel">
              <div class="carousel-side-section">
                <span class="carousel-side-label">Now showing</span>
                <h4 class="carousel-side-title">{{ currentMedia.title }}</h4>
                <p v-if="currentMedia.description" class="carousel-side-description">
                  {{ currentMedia.description }}
                </p>
              </div>

              <div class="carousel-side-section">
                <span class="carousel-side-label">Access</span>
                <div class="carousel-side-pills">
                  <span class="carousel-side-pill">
                    {{ currentMedia.mediaType === 'video' ? 'Video' : 'Image' }}
                  </span>
                  <span v-if="currentMedia?.pricing === 'SUBSCRIPTION'" class="carousel-side-pill">Subscription</span>
                  <span v-if="currentMedia?.category === undefined" class="carousel-side-pill">Premium Route</span>
                  <span v-if="currentMedia?.mediaType === 'video' && isComingSoon(currentMedia)" class="carousel-side-pill">Upcoming</span>
                </div>
              </div>

              <div class="carousel-side-section">
                <span class="carousel-side-label">Navigation</span>
                <p class="carousel-side-note">
                  Use the thumbnail rail or keyboard arrows to browse without leaving the focused view.
                </p>
                <div class="carousel-side-shortcuts">
                  <div class="carousel-shortcut">
                    <span class="carousel-shortcut-key">Esc</span>
                    <span class="carousel-shortcut-label">Close</span>
                  </div>
                  <div class="carousel-shortcut">
                    <span class="carousel-shortcut-key">←</span>
                    <span class="carousel-shortcut-label">Prev</span>
                  </div>
                  <div class="carousel-shortcut">
                    <span class="carousel-shortcut-key">→</span>
                    <span class="carousel-shortcut-label">Next</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div v-if="mediaList.length > 1" class="thumbnail-bar-external">
            <div class="thumbnail-navigation">
              <button type="button" class="thumbnail-nav-arrow thumbnail-nav-left" @click="previousMedia">
                <v-icon size="22" color="white">mdi-chevron-left</v-icon>
              </button>

              <div ref="thumbnailContainer" class="thumbnail-container">
                <div
                  v-for="(media, index) in mediaList"
                  :key="index"
                  class="thumbnail-item"
                  :class="{ 'active': index === currentIndex }"
                  @click="selectMedia(index)"
                >
                  <img v-if="media.mediaType === 'image'" :src="media.url" :alt="media.title" class="thumbnail-image" />

                  <div
                    v-else-if="
                      media.mediaType === 'video' &&
                        media.category !== undefined &&
                        !(media.pricing === 'SUBSCRIPTION' && !props.isSubscribed) &&
                        !isComingSoon(media)
                    "
                    class="thumbnail-video"
                    @click="handleVideoClick(media, index)"
                  >
                    <img v-if="media.thumbnail" :src="media.thumbnail" :alt="media.title" class="thumbnail-image" />
                    <div v-else class="thumbnail-placeholder">
                      <v-icon size="20" color="#94a3b8">mdi-video</v-icon>
                    </div>
                    <div class="video-play-icon">
                      <v-icon size="16" color="white">mdi-play</v-icon>
                    </div>
                  </div>

                  <div
                    v-else-if="
                      media.mediaType === 'video' &&
                        (isComingSoon(media) ||
                          media.category === undefined ||
                          (media.pricing === 'SUBSCRIPTION' && !props.isSubscribed))
                    "
                    class="thumbnail-video thumbnail-video--locked"
                  >
                    <img v-if="media.thumbnail" :src="media.thumbnail" :alt="media.title" class="thumbnail-image" />
                    <div v-else class="thumbnail-placeholder">
                      <v-icon size="20" color="#94a3b8">mdi-video</v-icon>
                    </div>
                    <div class="paid-video-overlay thumbnail-paid-overlay">
                      <div class="paid-video-content thumbnail-paid-content">
                        <template v-if="isComingSoon(media)">
                          <div class="paid-video-lock-icon thumbnail-paid-lock">
                            <v-icon size="18" color="white">mdi-clock-outline</v-icon>
                          </div>
                          <span class="thumbnail-soon-label">Soon</span>
                        </template>
                        <template v-else>
                          <div class="paid-video-lock-icon thumbnail-paid-lock">
                            <v-icon size="18" color="white">mdi-lock</v-icon>
                          </div>
                          <button
                            v-if="media.pricing === 'SUBSCRIPTION' && !props.isSubscribed && media.category !== undefined"
                            type="button"
                            class="paid-video-subscribe-btn thumbnail-paid-btn"
                            @click.stop="handleSubscriptionClick"
                          >
                            Subscribe
                          </button>
                          <button
                            v-else
                            type="button"
                            class="paid-video-subscribe-btn thumbnail-paid-btn"
                            @click.stop="navigateToPaidVideo(media)"
                          >
                            Buy Now
                          </button>
                        </template>
                      </div>
                    </div>
                  </div>

                  <div v-else class="thumbnail-placeholder">
                    <v-icon size="20" color="#94a3b8">mdi-file</v-icon>
                  </div>
                </div>
              </div>

              <button type="button" class="thumbnail-nav-arrow thumbnail-nav-right" @click="nextMedia">
                <v-icon size="22" color="white">mdi-chevron-right</v-icon>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>

  <SubscriptionDialog
    v-model="isSubscriptionDialogVisible"
    :artist-name="artistName"
    @subscribe="handleSubscribe"
    @cancel="handleCancelSubscription"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick, defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import Hls from 'hls.js';

const SubscriptionDialog = defineAsyncComponent(() => import('./SubscriptionDialog.vue'));

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  mediaList: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every(item =>
        item.title &&
        item.mediaType &&
        ['image', 'video'].includes(item.mediaType)
      );
    }
  },
  selectedIndex: {
    type: Number,
    default: undefined,
    validator: (value) => value === undefined || value >= 0
  },
  artistName: {
    type: String,
    default: ''
  },
  isSubscribed: {
    type: Boolean,
    default: false
  },
  onVideoClick: {
    type: Function,
    default: null
  },
  onSubscribe: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['close', 'mediaChange', 'openCarousel']);

// Router
const router = useRouter();

// Reactive state
const currentIndex = ref(0);
const isLoading = ref(false);
const mediaError = ref(null);

// Video player state
const videoPlayer = ref(null);
const hls = ref(null);
const isPlaying = ref(false);

// Loading timeout fallback
let loadingTimeout = null;

// Subscription prompt tracking
let hasPromptedSubscription = false;

// Hover state for overlays
const isHovering = ref(false);

// Thumbnail container reference for scrolling
const thumbnailContainer = ref(null);

// Subscription dialog state
const isSubscriptionDialogVisible = ref(false);

// Computed properties
const currentMedia = computed(() => {
  if (!props.mediaList || props.mediaList.length === 0) return null;
  return props.mediaList[currentIndex.value];
});

const hasSelectedIndex = computed(() => {
  return props.selectedIndex !== undefined && props.selectedIndex !== null;
});

/** Single-pass counts for grid header — avoids repeated template filters on re-render. */
const gridVideoStats = computed(() => {
  let videos = 0;
  let subscription = 0;
  let premium = 0;
  let free = 0;
  const list = props.mediaList;
  if (!list?.length) {
    return { videos, subscription, premium, free };
  }
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (item.mediaType !== 'video') continue;
    videos++;
    if (item.pricing === 'SUBSCRIPTION') subscription++;
    if (item.category === undefined) premium++;
    if (item.category !== undefined && item.pricing !== 'SUBSCRIPTION') free++;
  }
  return { videos, subscription, premium, free };
});

// Helper function to check if video is coming soon
const isComingSoon = (media) => {
  if (!media) return false;
  
  const id = media.id || media.videoId;
  if (!id) return false;
  
  return id.toString().startsWith('coming-soon');
};

// Methods
const closeCarousel = () => {
  if (hasSelectedIndex.value) {
    // If we're in carousel view, close it
    emit('close');
  } else {
    // If we're in grid view, just close the modal
    emit('close');
  }
};

const promptSubscriptionAccess = () => {
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

const selectMedia = (index) => {
  if (index >= 0 && index < props.mediaList.length) {
    const targetMedia = props.mediaList[index];
    
    // Prevent selecting coming soon videos
    if (isComingSoon(targetMedia)) {
      return;
    }
    
    if (targetMedia?.pricing === 'SUBSCRIPTION' && !props.isSubscribed) {
      promptSubscriptionAccess();
      return;
    }

    if (!hasSelectedIndex.value) {
      // If we're in grid view, emit an event to open carousel with this index
      emit('mediaChange', index);
      emit('openCarousel', index);
    } else {
      // If we're already in carousel view, just change the current media
      currentIndex.value = index;
      emit('mediaChange', index);
      handleMediaLoading();
    }
  }
};

const nextMedia = () => {
  if (thumbnailContainer.value) {
    const scrollAmount = 92; // 80px thumbnail + 12px gap
    thumbnailContainer.value.scrollLeft += 3 * scrollAmount;
  }
};

const previousMedia = () => {
  if (thumbnailContainer.value) {
    const scrollAmount = 92; // 80px thumbnail + 12px gap
    thumbnailContainer.value.scrollLeft -= 3 * scrollAmount;
  }
};

const onMediaLoad = () => {
  isLoading.value = false;
  mediaError.value = null;
};

const onMediaError = () => {
  isLoading.value = false;
  mediaError.value = 'Failed to load media';
};

const onGridMediaLoad = (index) => {
  // This method is no longer needed for grid view as loading is handled by v-for
};

const onGridMediaError = (index) => {
  // This method is no longer needed for grid view as error handling is handled by v-for
};

// HLS video player methods
const initializeHLSPlayer = (url) => {

  if (!videoPlayer.value) {
    console.error('Video player element not found');
    return;
  }

  // Check if the URL is a data URL (base64 encoded HLS)
  let hlsUrl = url;
  if (url && url.startsWith('data:application/vnd.apple.mpegurl;base64,')) {
    // Decode the base64 HLS content
    try {
      const base64Content = url.split(',')[1];
      const hlsContent = atob(base64Content);

      const blob = new Blob([hlsContent], { type: 'application/vnd.apple.mpegurl' });
      hlsUrl = URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error decoding base64 HLS content:', error);
      isLoading.value = false;
      mediaError.value = "Error decoding video stream";
      return;
    }
  }

  // Use HLS.js for video playback
  if (Hls.isSupported()) {
    if (hls.value) {
      hls.value.destroy();
    }

    hls.value = new Hls({
      xhrSetup: (xhr) => {
        xhr.withCredentials = true;
      },
    });

    hls.value.loadSource(hlsUrl);
    hls.value.attachMedia(videoPlayer.value);

    hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
      // Don't clear loading here, wait for video to be ready
    });

    hls.value.on(Hls.Events.LEVEL_LOADED, () => {
      // Don't clear loading here, wait for video to be ready
    });

    hls.value.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error:', data);
      isLoading.value = false;
      mediaError.value = `Video playback error: ${data.details}`;
    });
  } else if (videoPlayer.value.canPlayType("application/vnd.apple.mpegurl")) {
    videoPlayer.value.src = hlsUrl;
    // Event listeners will be added by addVideoEventListeners()
  } else {
    console.error('HLS is not supported in this browser');
    isLoading.value = false;
    mediaError.value = "HLS is not supported in this browser.";
  }
};

const playVideo = () => {
  if (videoPlayer.value) {
    videoPlayer.value.play();
  }
};

// Handle video clicks in carousel
const handleVideoClick = (media, index) => {
  // Prevent clicking on coming soon videos
  if (isComingSoon(media)) {
    return;
  }

  if (media.mediaType === 'video') {
    // Check if it's a paid video (no category means it's paid)
    if (media.category === undefined || (media.pricing === 'SUBSCRIPTION' && !props.isSubscribed)) {
      if (media.pricing === 'SUBSCRIPTION' && !props.isSubscribed) {
        promptSubscriptionAccess();
      } else {
        closeCarousel();
        navigateToPaidVideo(media);
      }
      return;
    }

    if (props.onVideoClick) {
      // Call the parent's video click handler
      props.onVideoClick(media.id || media.videoId, media.category === 'ICONIC_VIDEOS');
    } else {
      // Fallback to normal selection
      selectMedia(index);
    }
  } else {
    // For non-video media, just select it
    selectMedia(index);
  }
};

// Mouse event handlers for overlay visibility
let hoverTimeout = null;

const onMouseEnter = () => {
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }
  isHovering.value = true;
};

const onMouseLeave = () => {
  hoverTimeout = setTimeout(() => {
    isHovering.value = false;
  }, 150); // Small delay to prevent flickering
};

// Add video event listeners
const addVideoEventListeners = () => {
  if (videoPlayer.value) {
    // Clear existing listeners to avoid duplicates
    videoPlayer.value.removeEventListener('play', handleVideoPlay);
    videoPlayer.value.removeEventListener('pause', handleVideoPause);
    videoPlayer.value.removeEventListener('ended', handleVideoEnded);
    videoPlayer.value.removeEventListener('loadeddata', handleVideoLoadedData);
    videoPlayer.value.removeEventListener('canplay', handleVideoCanPlay);
    videoPlayer.value.removeEventListener('error', handleVideoError);

    // Add new listeners
    videoPlayer.value.addEventListener('play', handleVideoPlay);
    videoPlayer.value.addEventListener('pause', handleVideoPause);
    videoPlayer.value.addEventListener('ended', handleVideoEnded);
    videoPlayer.value.addEventListener('loadeddata', handleVideoLoadedData);
    videoPlayer.value.addEventListener('canplay', handleVideoCanPlay);
    videoPlayer.value.addEventListener('error', handleVideoError);
  }
};

// Video event handlers
const handleVideoPlay = () => {
  isPlaying.value = true;
  clearLoadingState();
};

const handleVideoPause = () => {
  isPlaying.value = false;
};

const handleVideoEnded = () => {
  isPlaying.value = false;
};

const handleVideoLoadedData = () => {
  clearLoadingState();
};

const handleVideoCanPlay = () => {
  clearLoadingState();
};

const handleVideoError = (e) => {
  console.error('Video error event:', e);
  clearLoadingState();
  mediaError.value = 'Video playback error';
};

// Helper function to clear loading state and timeout
const clearLoadingState = () => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  isLoading.value = false;
  mediaError.value = null;
};

// Navigate to paid video page
const navigateToPaidVideo = (video) => {
  if (video && video.id) {
    // Use the router to navigate to the paid video page
    const route = `/paidVideo/${video.id}`;
    router.push(route);
  } else {
    console.error('MediaCarousel: Video or video.id is missing:', video);
  }
};

const handleSubscriptionClick = () => {
  // Show subscription dialog
  isSubscriptionDialogVisible.value = true;
};

// Keyboard navigation
const handleKeydown = (event) => {
  if (!props.isVisible) return;

  switch (event.key) {
    case 'Escape':
      closeCarousel();
      break;
    case 'ArrowLeft':
      previousMedia();
      break;
    case 'ArrowRight':
      nextMedia();
      break;
  }
};

// Helper function to handle media loading states
const handleMediaLoading = () => {
  // Don't load coming soon videos
  if (isComingSoon(currentMedia.value)) {
    isLoading.value = false;
    mediaError.value = null;
    return;
  }

  if (currentMedia.value?.pricing === 'SUBSCRIPTION' && !props.isSubscribed) {
    isLoading.value = false;
    mediaError.value = null;
    promptSubscriptionAccess();
    return;
  }

  if (currentMedia.value?.mediaType === 'video') {
    if (currentMedia.value?.url) {
      // Check if it's a Vimeo video
      const isVimeo = currentMedia.value?.isVimeo === true || currentMedia.value?.videoType === 'vimeo';
      
      if (isVimeo) {
        // For Vimeo videos, just set loading state (iframe will handle loading)
        isLoading.value = true;
        mediaError.value = null;
        
        // Clear loading state after a short delay
        setTimeout(() => {
          isLoading.value = false;
        }, 1000);
      } else {
        // For HLS/MP4 videos, initialize HLS player
        isLoading.value = true;
        mediaError.value = null;

        // Clear any existing timeout
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }

        // Set a fallback timeout to clear loading state
        loadingTimeout = setTimeout(() => {
          isLoading.value = false;
        }, 10000); // 10 second timeout

        nextTick(() => {
          initializeHLSPlayer(currentMedia.value.url);
          addVideoEventListeners();
        });
      }
    } else if (currentMedia.value?.id && props.onVideoClick) {
      // For videos without URL, trigger the API call to get the stream URL
      if (currentMedia.value?.category === undefined) {
        isLoading.value = false;
        return;
      }
      isLoading.value = true;
      mediaError.value = null;
      props.onVideoClick(currentMedia.value.id, currentMedia.value.category === 'ICONIC_VIDEOS');
    } else {
      // No video ID or callback available
      isLoading.value = false;
      mediaError.value = 'Video URL not available';
    }
  } else if (currentMedia.value?.mediaType === 'image' && currentMedia.value?.url) {
    // For images, check if they're already loaded or load them
    const img = new Image();
    img.onload = () => {
      isLoading.value = false;
      mediaError.value = null;
    };
    img.onerror = () => {
      isLoading.value = false;
      mediaError.value = 'Failed to load image';
    };

    // If image is already cached, set loading to false immediately
    if (img.complete) {
      isLoading.value = false;
      mediaError.value = null;
    } else {
      img.src = currentMedia.value.url;
    }
  } else {
    // Fallback: set loading state
    isLoading.value = true;
    mediaError.value = null;
  }
};

// Watch for prop changes
watch(() => props.selectedIndex, (newIndex) => {
  if (newIndex !== undefined && newIndex !== null && newIndex >= 0 && newIndex < props.mediaList.length) {
    currentIndex.value = newIndex;
    handleMediaLoading();
  }
});

watch(() => props.isVisible, (visible) => {
  if (visible) {
    hasPromptedSubscription = false;
    if (hasSelectedIndex.value) {
      handleMediaLoading();
    }
    // For grid view, no special initialization needed
  } else {
    hasPromptedSubscription = false;
  }
});

// Watch for changes in the media list (when URLs are updated)
watch(() => props.mediaList, (newList) => {
  if (currentMedia.value && currentMedia.value.mediaType === 'video') {
    const updatedMedia = newList.find(media =>
      media.id === currentMedia.value.id || media.videoId === currentMedia.value.videoId
    );
    if (updatedMedia && updatedMedia.url) {
      nextTick(() => {
        handleMediaLoading();
      });
    }
  }
}, { deep: true });


// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);

  // Cleanup hover timeout
  if (hoverTimeout) {
    clearTimeout(hoverTimeout);
  }

  // Cleanup loading timeout
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
  }

  // Cleanup video event listeners
  if (videoPlayer.value) {
    videoPlayer.value.removeEventListener('play', handleVideoPlay);
    videoPlayer.value.removeEventListener('pause', handleVideoPause);
    videoPlayer.value.removeEventListener('ended', handleVideoEnded);
    videoPlayer.value.removeEventListener('loadeddata', handleVideoLoadedData);
    videoPlayer.value.removeEventListener('canplay', handleVideoCanPlay);
    videoPlayer.value.removeEventListener('error', handleVideoError);
  }

  // Cleanup HLS
  if (hls.value) {
    hls.value.destroy();
  }

  // Cleanup blob URLs
  if (videoPlayer.value && videoPlayer.value.src) {
    if (videoPlayer.value.src.startsWith('blob:')) {
      URL.revokeObjectURL(videoPlayer.value.src);
    }
  }
});
</script>

<style scoped>
.media-carousel-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(12px, 2vw, 28px);
  background:
    radial-gradient(circle at top left, rgba(139, 92, 246, 0.22), transparent 30%),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 28%),
    rgba(2, 6, 23, 0.88);
  backdrop-filter: blur(18px);
}

.media-carousel-container {
  position: relative;
  width: min(1400px, 100%);
  height: min(920px, 100%);
  min-height: min(720px, 100%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%);
  box-shadow:
    0 32px 80px rgba(0, 0, 0, 0.48),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.carousel-content-wrapper,
.grid-view-container {
  width: 100%;
  height: 100%;
}

.carousel-close-btn {
  position: absolute;
  top: 22px;
  right: 22px;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
}

.carousel-close-btn:hover {
  background: rgba(30, 41, 59, 0.88);
  border-color: rgba(255, 255, 255, 0.22);
  transform: translateY(-1px);
}

.grid-view-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  overflow: hidden;
  background:
    radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 32%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%);
}

.grid-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  padding-right: 64px;
}

.grid-hero-copy {
  max-width: 760px;
}

.grid-eyebrow,
.carousel-kicker,
.carousel-side-label {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #93c5fd;
}

.grid-title {
  margin: 0;
  font-size: clamp(2rem, 2.8vw, 3rem);
  line-height: 1.05;
  font-weight: 800;
  color: #f8fafc;
}

.grid-subtitle {
  margin: 12px 0 0;
  max-width: 680px;
  font-size: 0.98rem;
  line-height: 1.6;
  color: #cbd5e1;
}

.grid-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
}

.grid-stat-card {
  min-width: 110px;
  padding: 14px 16px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.68);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.grid-stat-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.grid-stat-value {
  display: block;
  margin-top: 6px;
  font-size: 1.5rem;
  line-height: 1;
  color: #f8fafc;
}

.media-grid {
  --mg-gap: 18px;
  --mg-cols: 5;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: var(--mg-gap);
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
  overscroll-behavior: contain;
}

.media-grid-item {
  --mg-cell: calc((100% - (var(--mg-cols) - 1) * var(--mg-gap)) / var(--mg-cols));
  position: relative;
  box-sizing: border-box;
  flex: 0 0 var(--mg-cell);
  width: var(--mg-cell);
  max-width: var(--mg-cell);
  min-width: 0;
  align-self: start;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  content-visibility: auto;
  contain-intrinsic-block-size: 400px;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.7);
  box-shadow: 0 16px 40px rgba(2, 6, 23, 0.28);
}

.media-grid-item:hover {
  transform: translateY(-6px);
  border-color: rgba(96, 165, 250, 0.42);
  box-shadow:
    0 26px 60px rgba(2, 6, 23, 0.5),
    0 0 0 1px rgba(96, 165, 250, 0.1);
}

/*
 * Gallery grid cards (media list ~34–175): portrait tiles (9:16).
 * Use padding-bottom intrinsic ratio so height is stable even when
 * thumbnails are only absolutely positioned or in-flow images have natural 16:9 size.
 */
.media-grid .grid-media-wrapper {
  position: relative;
  width: 100%;
  height: 0;
  box-sizing: border-box;
  padding-bottom: calc(100% * 16 / 9);
  overflow: hidden;
  border-radius: 24px;
  isolation: isolate;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.95));
}

/* Image tiles: pull cover out of flow so intrinsic ratio cannot flatten the card */
.media-grid .grid-media-wrapper > .grid-media-image {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

/*
 * Locked gallery videos: full-bleed thumb; blur/dim on the entire face (backdrop-filter needs a
 * full-size layer). Lock + CTA stay centered but nudged up so the title strip (higher z) stays clear.
 */
.media-grid .grid-media-wrapper--video-locked .grid-video-container {
  inset: 0;
  z-index: 2;
}

.media-grid .grid-media-wrapper--video-locked .paid-video-overlay {
  inset: 0;
  align-items: center;
  justify-content: center;
  border-radius: 24px;
  overflow: hidden;
  isolation: isolate;
  contain: paint;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.45) 0%, rgba(2, 6, 23, 0.72) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform: translateZ(0);
}

.media-grid .grid-media-wrapper--video-locked .paid-video-label {
  display: none;
}

.media-grid .grid-media-wrapper--video-locked .paid-video-content {
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  transform: translateY(-12%);
}

.media-grid .grid-media-wrapper--video-locked .paid-video-lock-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
}

.media-grid .grid-media-wrapper--video-locked .paid-video-subscribe-btn {
  min-height: 32px;
  padding: 6px 14px;
  font-size: 0.78rem;
}

.media-grid .grid-media-wrapper--video-locked .grid-media-overlay {
  z-index: 4;
  pointer-events: none;
  background: linear-gradient(180deg, transparent 0%, rgba(2, 6, 23, 0.35) 28%, rgba(2, 6, 23, 0.92) 100%);
  padding-top: 28px;
}

.grid-media-topbar {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  z-index: 7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.grid-media-badge,
.grid-status-badge,
.carousel-access-pill,
.carousel-side-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  backdrop-filter: blur(10px);
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #f8fafc;
}

.grid-media-badge {
  background: rgba(15, 23, 42, 0.72);
}

.grid-status-badge {
  margin-left: auto;
  background: rgba(15, 23, 42, 0.72);
}

/* Grid only: skip per-tile backdrop blur (hundreds of stacking contexts while scrolling). */
.media-grid .grid-media-badge,
.media-grid .grid-status-badge {
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  background: rgba(15, 23, 42, 0.88);
}

.grid-status-badge.is-open,
.carousel-access-pill.is-open {
  color: #bbf7d0;
  background: rgba(6, 78, 59, 0.72);
}

.grid-status-badge.is-locked,
.carousel-access-pill.is-locked {
  color: #fde68a;
  background: rgba(120, 53, 15, 0.72);
}

.grid-status-badge.is-soon,
.carousel-access-pill.is-soon {
  color: #dbeafe;
  background: rgba(30, 41, 59, 0.78);
}

.grid-media-image,
.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.grid-media-image {
  object-position: center top;
  transition: transform 0.35s ease;
}

.media-grid-item:hover .grid-media-image {
  transform: scale(1.04);
}

.grid-media-overlay {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 3;
  padding: 18px 16px 16px;
  background: linear-gradient(180deg, transparent 0%, rgba(2, 6, 23, 0.18) 18%, rgba(2, 6, 23, 0.92) 100%);
}

.grid-media-title {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: #f8fafc;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.grid-media-description {
  display: -webkit-box;
  margin: 8px 0 0;
  overflow: hidden;
  color: #cbd5e1;
  font-size: 0.82rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.grid-media-type {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  color: #93c5fd;
  font-size: 0.76rem;
  font-weight: 600;
}

.grid-video-container,
.grid-placeholder,
.grid-video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-video-container,
.grid-placeholder,
.grid-video-placeholder,
.thumbnail-video,
.thumbnail-placeholder {
  background:
    linear-gradient(180deg, rgba(30, 41, 59, 0.8), rgba(2, 6, 23, 0.95));
}

.grid-video-placeholder,
.grid-placeholder {
  flex-direction: column;
  gap: 8px;
  color: #94a3b8;
}

.grid-video-play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.76);
  transform: translate(-50%, -50%);
  transition: transform 0.25s ease, background 0.25s ease;
}

.media-grid-item:hover .grid-video-play-overlay {
  transform: translate(-50%, -50%) scale(1.08);
  background: rgba(37, 99, 235, 0.84);
}

.carousel-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
}

.carousel-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-right: 68px;
}

.carousel-topbar-copy {
  max-width: 760px;
}

.carousel-topbar-title,
.carousel-side-title {
  margin: 0;
  color: #f8fafc;
  font-weight: 800;
  line-height: 1.15;
}

.carousel-topbar-title {
  font-size: clamp(1.5rem, 2vw, 2.25rem);
}

.carousel-topbar-description,
.carousel-side-description,
.carousel-side-note {
  margin: 10px 0 0;
  color: #cbd5e1;
  line-height: 1.6;
}

.carousel-meta-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.carousel-counter {
  font-size: 0.86rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.carousel-stage-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  min-height: 0;
  flex: 1;
}

.main-media-container,
.carousel-side-panel,
.thumbnail-bar-external {
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.main-media-container {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background:
    radial-gradient(circle at center, rgba(59, 130, 246, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(2, 6, 23, 0.98));
}

.current-media-wrapper,
.video-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.stage-ambient-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  width: 45%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.22), transparent 70%);
  transform: translate(-50%, -50%);
  filter: blur(40px);
}

.current-media,
.current-image,
.current-video,
.vimeo-iframe {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.vimeo-iframe {
  border: none;
}

.play-button {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 86px;
  height: 86px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transform: translate(-50%, -50%);
  transition: transform 0.25s ease, background 0.25s ease;
}

.play-button:hover {
  background: rgba(37, 99, 235, 0.82);
  transform: translate(-50%, -50%) scale(1.05);
}

.media-loading-overlay,
.media-error,
.paid-video-overlay,
.coming-soon-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.media-loading-overlay,
.media-error {
  flex-direction: column;
  gap: 14px;
  color: #cbd5e1;
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(4px);
}

.media-loading-overlay p,
.media-error p {
  margin: 0;
}

.media-info-overlay {
  position: absolute;
  inset: auto 20px 20px 20px;
  z-index: 8;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.25s ease, transform 0.25s ease;
  pointer-events: none;
}

.media-info-overlay.visible {
  opacity: 1;
  transform: translateY(0);
}

.media-info-content {
  max-width: 520px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(12px);
}

.media-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.05rem;
  font-weight: 700;
}

.media-description {
  margin: 8px 0 0;
  color: #cbd5e1;
  line-height: 1.5;
}

.carousel-side-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px;
  overflow-y: auto;
}

.carousel-side-section + .carousel-side-section {
  padding-top: 20px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.carousel-side-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.carousel-side-pill {
  color: #e2e8f0;
  background: rgba(30, 41, 59, 0.72);
}

.carousel-side-shortcuts {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.carousel-shortcut {
  display: flex;
  align-items: center;
  gap: 12px;
}

.carousel-shortcut-key {
  min-width: 36px;
  padding: 8px 10px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.55);
  color: #f8fafc;
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.carousel-shortcut-label {
  color: #cbd5e1;
  font-size: 0.92rem;
}

.thumbnail-bar-external {
  padding: 14px;
}

.thumbnail-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thumbnail-nav-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(2, 6, 23, 0.62);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
  flex-shrink: 0;
}

.thumbnail-nav-arrow:hover {
  background: rgba(30, 41, 59, 0.88);
  transform: translateY(-1px);
}

.thumbnail-container {
  display: flex;
  gap: 12px;
  flex: 1;
  overflow-x: auto;
  min-width: 0;
  padding: 2px;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.thumbnail-container::-webkit-scrollbar {
  display: none;
}

.thumbnail-item {
  position: relative;
  height: 155px;
  width: 110px;
  /* width: 96px;
  height: 68px; */
  flex-shrink: 0;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  background: rgba(15, 23, 42, 0.8);
}

.thumbnail-item:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.38);
}

.thumbnail-item.active {
  border-color: rgba(147, 197, 253, 0.85);
  box-shadow: 0 0 0 1px rgba(147, 197, 253, 0.25);
}

.thumbnail-video,
.thumbnail-placeholder {
  width: 100%;
  height: 100%;
}

.thumbnail-video {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-video--locked .thumbnail-image {
  filter: brightness(0.58);
}

.thumbnail-paid-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.2), rgba(2, 6, 23, 0.78));
}

.thumbnail-paid-content {
  gap: 5px;
  padding: 2px 4px;
}

.thumbnail-paid-lock {
  width: 26px;
  height: 26px;
  min-width: 26px;
  min-height: 26px;
}

.thumbnail-paid-btn {
  min-width: 0;
  width: auto;
  max-width: min(100%, 76px);
  min-height: 20px;
  padding: 2px 8px;
  font-size: 0.58rem;
  line-height: 1.15;
  border-radius: 999px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.35);
}

.thumbnail-soon-label {
  display: block;
  max-width: min(100%, 76px);
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  font-size: 0.58rem;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.video-play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.72);
  transform: translate(-50%, -50%);
}

.paid-video-overlay {
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.34), rgba(2, 6, 23, 0.82));
  backdrop-filter: blur(4px);
}

/* Carousel: blurred poster behind lock/CTA when thumbnail exists */
.main-media-container .paid-video-overlay--carousel-thumb {
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.paid-video-carousel-thumb {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.paid-video-carousel-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: blur(18px);
  transform: scale(1.1);
}

.paid-video-carousel-dim {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.45) 0%, rgba(2, 6, 23, 0.78) 100%);
}

.main-media-container .paid-video-overlay--carousel-thumb .paid-video-content {
  position: relative;
  z-index: 2;
}

.paid-video-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.paid-video-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.76);
  color: #f8fafc;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-align: center;
  backdrop-filter: blur(10px);
}

.paid-video-lock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.paid-video-subscribe-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
  min-height: 28px;
  padding: 0 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  color: #020617;
  font-size: 0.86rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.24);
}

.paid-video-subscribe-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.28);
}

.coming-soon-overlay {
  background: linear-gradient(180deg, rgba(2, 6, 23, 0.28), rgba(2, 6, 23, 0.8));
  pointer-events: none;
}

.coming-soon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: comingSoonPulse 2s ease-in-out infinite;
}

.coming-soon-icon {
  animation: clockRotate 3s ease-in-out infinite;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.45));
}

.coming-soon-badge {
  padding: 10px 18px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.76);
  color: #f8fafc;
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.coming-soon-card {
  cursor: default !important;
}

.coming-soon-card .grid-media-overlay {
  z-index: 6;
}

/* Grid: disable infinite animations on many tiles — they keep repainting during scroll */
.media-grid .coming-soon-content {
  animation: none;
}

.media-grid .coming-soon-icon {
  animation: none;
}

@keyframes comingSoonPulse {
  0%,
  100% {
    opacity: 0.88;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
}

@keyframes clockRotate {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
}

@media (max-width: 1200px) {
  .carousel-stage-layout {
    grid-template-columns: 1fr;
  }

  .carousel-side-panel {
    max-height: 220px;
  }

  .media-grid {
    --mg-cols: 4;
  }
}

@media (max-width: 900px) {
  .media-carousel-container {
    height: 100%;
    min-height: 0;
    border-radius: 24px;
  }

  .grid-view-container,
  .carousel-content-wrapper {
    padding: 20px;
  }

  .grid-hero,
  .carousel-topbar {
    flex-direction: column;
    align-items: flex-start;
    padding-right: 56px;
  }

  .grid-stats,
  .carousel-meta-stack {
    align-items: flex-start;
    justify-content: flex-start;
  }

  .media-grid {
    --mg-cols: 3;
  }

  .thumbnail-item {
    width: 82px;
    height: 60px;
  }
}

@media (max-width: 640px) {
  .media-carousel-overlay {
    padding: 8px;
  }

  .media-carousel-container {
    border-radius: 20px;
  }

  .carousel-close-btn {
    top: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
  }

  .grid-view-container,
  .carousel-content-wrapper {
    padding: 16px;
    gap: 16px;
  }

  .grid-title {
    font-size: 1.8rem;
  }

  .media-grid {
    --mg-gap: 14px;
    --mg-cols: 2;
  }

  .grid-media-overlay {
    padding: 16px 14px 14px;
  }

  .carousel-side-panel {
    padding: 18px;
  }

  .thumbnail-navigation {
    gap: 8px;
  }

  .thumbnail-nav-arrow {
    width: 36px;
    height: 36px;
  }

  .thumbnail-item {
    width: 72px;
    height: 52px;
    border-radius: 14px;
  }
}
</style>