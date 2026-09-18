<template>
  <div class="music-player">
    <!-- Hidden Audio Element -->
    <audio
      ref="audioElement"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onTrackEnded"
      @play="onPlay"
      @pause="onPause"
      @error="onAudioError"
      preload="metadata"
    />
    
    <!-- Album Header -->
    <!-- <div class="section-header"> -->
      <!-- <p class="section-subtitle">Sing along to your favorite songs with professional backing tracks</p> -->
    <!-- </div> -->
    <div class="album-header-card">
      <div class="album-card-content">
        <!-- Left: Portrait Artwork -->
        <div class="album-portrait-artwork">
          <v-img
            :src="albumData.coverImage"
            :alt="albumData.title"
            class="portrait-cover"
            cover
          >
            <template v-slot:placeholder>
              <div class="album-placeholder">
                <v-icon size="64" color="white">mdi-music</v-icon>
              </div>
            </template>
          </v-img>
        </div>
        
        <!-- Center: Details -->
        <div class="album-card-details">
          <div class="album-artist-prefix">By {{ albumData.artist || 'Various Artists' }}</div>
          <h1 class="album-card-title">{{ albumData.title }}</h1>
          
          <div class="album-badges">
            <span class="meta-badge">{{ albumData.tracks.length }} Songs</span>
            <span v-if="price > 0" class="meta-badge premium">Premium</span>
            <span class="meta-badge">High Quality</span>
          </div>

          <div class="album-card-actions">
            <v-btn
              class="action-btn-outlined"
              variant="outlined"
              @click="togglePlay"
            >
              <v-icon size="24">{{ isPlaying ? 'mdi-pause' : 'mdi-play' }}</v-icon>
            </v-btn>
            <v-btn
              v-if="showBuyButton"
              class="action-btn-filled"
              variant="flat"
              @click="emit('buy-click')"
            >
              BUY FULL ALBUM
            </v-btn>
          </div>
        </div>

        <!-- Right: Price -->
        <div v-if="price !== null && price > 0" class="album-card-price">
          {{ currencySymbol }}{{ price }}
        </div>
      </div>
    </div>

    <!-- CTA strip: shown when user hasn't purchased / subscribed -->
    <div v-if="showBuyButton" class="player-cta-strip">

      <!-- Header row -->
      <div class="player-cta-header">
        <div class="player-cta-lock">
          <v-icon size="16" color="white">mdi-lock</v-icon>
        </div>
        <div class="player-cta-text">
          <span class="player-cta-title">Unlock full access</span>
          <span class="player-cta-subtitle">You're on limited previews. Choose how you want to get in.</span>
        </div>
      </div>

      <!-- Two option cards -->
      <div class="player-cta-options">

        <!-- Option 1: Buy album -->
        <div class="player-cta-option">
          <div class="player-cta-option-icon">
            <v-icon size="20" color="#14a0a5">mdi-music-box-outline</v-icon>
          </div>
          <div class="player-cta-option-body">
            <span class="player-cta-option-label">Buy this album</span>
            <span class="player-cta-option-desc">Own it forever — full playback, downloads &amp; high-quality audio.</span>
          </div>
        </div>

        <!-- Divider -->
        <div class="player-cta-or">
          <span>or</span>
        </div>

        <!-- Option 2: Subscribe -->
        <div class="player-cta-option">
          <div class="player-cta-option-icon">
            <v-icon size="20" color="#14a0a5">mdi-account-star-outline</v-icon>
          </div>
          <div class="player-cta-option-body">
            <span class="player-cta-option-label">
              Subscribe to {{ artistName || albumData.artist || 'the artist' }}
            </span>
            <span class="player-cta-option-desc">Access every album, new releases &amp; exclusive content — all in one plan.</span>
          </div>
        </div>

      </div>
    </div>

    <!-- Track List -->
    


     <div class="songs-table">
      <!-- Table Header -->
      <div :class="['table-header', { 'has-download': showDownload }]">
        <span class="col-number">#</span>
        <span class="col-title">Title</span>
        <span class="col-album">Album</span>
        <span class="col-duration">
          <v-icon size="16">mdi-clock-outline</v-icon>
        </span>
        <span v-if="showDownload" class="col-download"></span>
      </div>

      <!-- Table Rows -->
      <div class="table-body custom-scrollbar">
        <div
          v-for="(track, index) in albumData.tracks"
          :key="track.id"
          v-memo="[currentTrackIndex === index, isPlaying, trackStreamCounts.get(index)]"
          :class="['table-row', { 
            'active': currentTrackIndex === index,
            'has-download': showDownload,
            'disabled': showBuyButton && !canPlayTrack(index)
          }]"
          @click="selectTrack(index)"
          >
          <span class="col-number">
            <div v-if="currentTrackIndex === index && isPlaying" class="playing-animation">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <v-icon 
              v-else-if="currentTrackIndex === index"
              size="16"
              color="white"
            >
              mdi-play
            </v-icon>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <div class="col-title">
            <div class="song-name">
              {{ track.title }}
              <span v-if="showBuyButton && track.remaining_free_streams !== undefined" class="stream-badge">
                ({{ getRemainingStreams(index) }} free)
              </span>
            </div>
            <div class="song-category">{{ track.artist }}</div>
          </div>
          <span class="col-album">{{ track.album || 'Album Name' }}</span>
          <span class="col-duration">{{ track.duration }}</span>
          <span v-if="showDownload" class="col-download">
            <v-btn
              icon="mdi-download"
              variant="text"
              color="white"
              size="small"
              class="download-btn"
              @click.stop="downloadTrack(track)"
            />
          </span>
        </div>
      </div>
    </div>


    <!-- Preview Limit Alert -->
    <v-dialog v-model="showPreviewAlert" max-width="400">
      <v-card class="preview-alert-card">
        <v-card-title class="preview-alert-title">
          <v-icon color="warning" class="mr-2">mdi-music-note-off</v-icon>
          Preview Limit Reached
        </v-card-title>
        <v-card-text class="preview-alert-text">
          <div v-if="!canPlayTrack(currentTrackIndex)">
            You've used all your free preview streams for this song. Purchase the album to enjoy unlimited access to all songs.
          </div>
          <div v-else>
            You've already previewed this song. Purchase the album to enjoy unlimited access to all songs.
          </div>
        </v-card-text>
        <v-card-actions class="preview-alert-actions">
          <v-btn variant="text" @click="showPreviewAlert = false">Close</v-btn>
          <v-btn color="primary" variant="flat" @click="emit('buy-click'); showPreviewAlert = false">
            <v-icon left size="18">mdi-cart</v-icon>
            Buy Now
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div v-if="currentTrackIndex >= 0" class="bottom-player glass-effect slide-up">
        <div class="now-playing">
          <div class="current-song-cover">
            <v-img
              :src="albumData.coverImage"
              width="56"
              height="56"
              class="rounded-lg shadow-lg"
              />
          </div>
          <div class="current-song-info">
            <div class="current-song-name">{{ currentTrack.title }}</div>
            <div class="current-artist-name">{{ currentTrack.artist }}</div>
          </div>
        </div>

        <div class="player-main-controls">
          <div class="player-buttons">
            <v-btn
              icon="mdi-shuffle"
              variant="text"
              color="rgba(255,255,255,0.6)"
              size="small"
              class="control-btn"
            />
            <v-btn
              icon="mdi-skip-previous"
              variant="text"
              color="white"
              size="small"
              class="control-btn"
              @click="previousTrack"
            />
            <v-btn
              :icon="isPlaying ? 'mdi-pause' : 'mdi-play'"
              variant="flat"
              color="white"
              size="large"
              class="control-play-btn shadow-lg"
              @click="togglePlay"
            />
            <v-btn
              icon="mdi-skip-next"
              variant="text"
              color="white"
              size="small"
              class="control-btn"
              @click="nextTrack"
            />
            <v-btn
              icon="mdi-repeat"
              variant="text"
              color="rgba(255,255,255,0.6)"
              size="small"
              class="control-btn"
            />
          </div>
    
          <div class="progress-container">
            <span class="time-display">{{ formatTime(currentTime) }}</span>
            <div 
              class="progress-track-wrapper" 
              @click="seekToPosition"
              ref="progressBarRef"
            >
              <div class="progress-track-bg">
                <div class="progress-bar-fill" :style="{ width: progress + '%' }">
                  <div class="progress-handle"></div>
                </div>
              </div>
            </div>
            <span class="time-display">{{ formatTime(duration) }}</span>
          </div>
        </div>

  
        <div class="volume-area">
          <v-btn
            :icon="volume === 0 ? 'mdi-volume-mute' : volume < 0.5 ? 'mdi-volume-low' : 'mdi-volume-high'"
            variant="text"
            color="rgba(255,255,255,0.6)"
            size="small"
            class="control-btn"
            @click="toggleMute"
          />
          <div 
            class="volume-track"
            @click="setVolume"
            ref="volumeBarRef"
          >
            <div class="volume-bar smooth-volume" :style="{ width: (volume * 100) + '%' }"></div>
          </div>
          <v-btn
            icon="mdi-fullscreen"
            variant="text"
            color="rgba(255,255,255,0.6)"
            size="small"
            class="control-btn"
            @click="toggleFullscreen"
          />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { getSongStream, getSongDownload } from '@/services/paidSongsService'
import { getUserToken } from '@/services/userService'
import Hls from 'hls.js'

// Props
const props = defineProps({
  albumData: {
    type: Object,
    required: true
  },
  showDownload: {
    type: Boolean,
    default: false
  },
  showBuyButton: {
    type: Boolean,
    default: false
  },
  price: {
    type: Number,
    default: null
  },
  currencySymbol: {
    type: String,
    default: ''
  },
  maxPrice: {
    type: Number,
    default: null
  },
  artistName: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['buy-click', 'subscribe-click'])

// Refs
const audioElement = ref(null)
const progressBarRef = ref(null)
const volumeBarRef = ref(null)
const hls = ref(null)

// Dragging state
const isDragging = ref(false)

// Volume state
const volume = ref(0.7) // Default volume 70%
const previousVolume = ref(0.7) // Store previous volume for mute/unmute

// Preview limit state (for non-purchased users)
const playedTracks = ref(new Set())
const showPreviewAlert = ref(false)
const trackStreamCounts = ref(new Map()) // Track remaining streams per track

// Local state
const currentTrackIndex = ref(-1) // -1 means no track selected
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

// Computed
const currentTrack = computed(() => {
  if (currentTrackIndex.value >= 0 && currentTrackIndex.value < props.albumData.tracks.length) {
    return props.albumData.tracks[currentTrackIndex.value]
  }
  return props.albumData.tracks[0] || null
})
const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// Audio Event Handlers
const onLoadedMetadata = () => {
  // Duration is now set from API data, not from audio metadata
  // This is kept only as a fallback
  if (audioElement.value && duration.value === 0) {
    duration.value = audioElement.value.duration
  }
}

const onTimeUpdate = () => {
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime
  }
}

const onTrackEnded = () => {
  nextTrack()
}

const onPlay = () => {
  isPlaying.value = true
  // Decrement remaining free streams when playback starts (for preview limit)
  if (props.showBuyButton && currentTrackIndex.value >= 0) {
    const trackIndex = currentTrackIndex.value
    const track = props.albumData.tracks[trackIndex]
    if (track) {
      const currentRemaining = trackStreamCounts.value.get(trackIndex) ?? track.remaining_free_streams ?? 0
      if (currentRemaining > 0) {
        const newRemaining = currentRemaining - 1
        trackStreamCounts.value.set(trackIndex, newRemaining)
        // Mark as played if no streams remaining
        if (newRemaining === 0) {
          playedTracks.value.add(trackIndex)
        }
      }
    }
  }
}

const onPause = () => {
  isPlaying.value = false
}

const onAudioError = (error) => {
  console.error('Audio playback error:', error)
  isPlaying.value = false
  
  // Show user-friendly error message
  
  // Try to fall back to a working audio source if available
  if (currentTrack.value && currentTrack.value.audioUrl !== 'https://www.soundjay.com/human/sounds/applause-01.wav') {
    currentTrack.value.audioUrl = 'https://www.soundjay.com/human/sounds/applause-01.wav'
    loadCurrentTrack()
  }
}

// Methods
const canPlayTrack = (trackIndex) => {
  // If user has purchased, they can play any track
  if (!props.showBuyButton) {
    return true
  }
  
  // For non-purchased users, check remaining free streams
  const track = props.albumData.tracks[trackIndex]
  if (!track) return false
  
  // Check if track has remaining free streams
  const remainingStreams = trackStreamCounts.value.get(trackIndex) ?? track.remaining_free_streams ?? 0
  return remainingStreams > 0
}

const getRemainingStreams = (trackIndex) => {
  const track = props.albumData.tracks[trackIndex]
  if (!track) return 0
  return trackStreamCounts.value.get(trackIndex) ?? track.remaining_free_streams ?? 0
}

const togglePlay = async () => {
  if (!audioElement.value) return

  // If no track is selected, select and play the first track
  if (currentTrackIndex.value < 0) {
    if (props.albumData.tracks && props.albumData.tracks.length > 0) {
      await selectTrack(0)
      return
    }
    return
  }

  // Check preview limit when trying to play
  if (!isPlaying.value && props.showBuyButton) {
    if (!canPlayTrack(currentTrackIndex.value)) {
      showPreviewAlert.value = true
      return
    }
  }

  try {
    if (isPlaying.value) {
      audioElement.value.pause()
    } else {
      await audioElement.value.play()
    }
  } catch (error) {
    console.error('Playback error:', error)
  }
}

const selectTrack = async (index) => {
  // Check preview limit for non-purchased users
  if (props.showBuyButton && !canPlayTrack(index)) {
    showPreviewAlert.value = true
    return
  }
  
  const track = props.albumData.tracks[index]
  if (!track) return
  
  // Set duration from API data immediately (assuming duration is in seconds)
  if (track.duration) {
    // If duration is a string like "3:45", convert it to seconds
    const durationInSeconds = typeof track.duration === 'string' 
      ? parseDurationToSeconds(track.duration)
      : track.duration
    duration.value = durationInSeconds
  }
  
  // Call stream API to get the streaming URL (only if token exists)
  if (getUserToken()) {
    try {
      const streamResponse = await getSongStream(track.id)
      
      // Update track with stream URL and response data
      if (streamResponse.url) {
        track.streamUrl = streamResponse.url
      }
      
      // Update remaining streams if provided
      if (streamResponse.remaining_streams !== undefined) {
        trackStreamCounts.value.set(index, streamResponse.remaining_streams)
        track.remaining_free_streams = streamResponse.remaining_streams
      }
      
      // Update purchase status if provided
      if (streamResponse.has_purchased_album !== undefined) {
        track.has_purchased_album = streamResponse.has_purchased_album
      }
      
      currentTrackIndex.value = index
      await loadCurrentTrack()
      
      if (audioElement.value) {
        try {
          await audioElement.value.play()
        } catch (error) {
          console.error('Playback error:', error)
        }
      }
    } catch (error) {
      console.error('Error fetching stream URL:', error)
      // Fallback to original audioUrl
      currentTrackIndex.value = index
      await loadCurrentTrack()
      if (audioElement.value) {
        try {
          await audioElement.value.play()
        } catch (playError) {
          console.error('Playback error:', playError)
        }
      }
    }
  } else {
    // No token - use fallback to original audioUrl
    console.warn('No authentication token found, using fallback audio URL')
    currentTrackIndex.value = index
    await loadCurrentTrack()
    if (audioElement.value) {
      try {
        await audioElement.value.play()
      } catch (error) {
        console.error('Playback error:', error)
      }
    }
  }
}

const nextTrack = async () => {
  if (currentTrackIndex.value < 0) return
  const nextIndex = (currentTrackIndex.value + 1) % props.albumData.tracks.length
  // For preview mode, check if next track can be played
  if (props.showBuyButton && !canPlayTrack(nextIndex)) {
    // Find a playable track or show alert
    const playableIndex = props.albumData.tracks.findIndex((_, i) => canPlayTrack(i))
    if (playableIndex === -1) {
      showPreviewAlert.value = true
      if (audioElement.value) audioElement.value.pause()
      return
    }
    await selectTrack(playableIndex)
    return
  }
  await selectTrack(nextIndex)
}

const previousTrack = async () => {
  if (currentTrackIndex.value < 0) return
  const prevIndex = currentTrackIndex.value === 0 
    ? props.albumData.tracks.length - 1 
    : currentTrackIndex.value - 1
  await selectTrack(prevIndex)
}

// Convert M3U8 string to blob URL and initialize HLS
const initializeHLS = (m3u8Source) => {
  if (!audioElement.value) return

  // Clean up existing HLS instance
  if (hls.value) {
    hls.value.destroy()
    hls.value = null
  }

  let hlsUrl = m3u8Source

  // Check if m3u8Source is M3U8 content (string starting with #EXTM3U) or a URL
  if (m3u8Source.includes('#EXTM3U')) {
    // This is M3U8 content string, convert to blob URL
    const blob = new Blob([m3u8Source], { type: 'application/vnd.apple.mpegurl' })
    hlsUrl = URL.createObjectURL(blob)
  }

  // Check if HLS is supported
  if (Hls.isSupported()) {
    hls.value = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    })

    hls.value.loadSource(hlsUrl)
    hls.value.attachMedia(audioElement.value)

    hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
      console.warn('HLS manifest parsed successfully')
    })

    hls.value.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error('Fatal network error, trying to recover...')
            hls.value.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('Fatal media error, trying to recover...')
            hls.value.recoverMediaError()
            break
          default:
            console.error('Fatal error, destroying HLS instance')
            if (hls.value) {
              hls.value.destroy()
              hls.value = null
            }
            break
        }
      }
    })
  } else if (audioElement.value.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    audioElement.value.src = hlsUrl
  } else {
    console.error('HLS is not supported in this browser')
    // Fallback to original audioUrl
    const fallbackUrl = currentTrack.value?.audioUrl
    if (fallbackUrl) {
      audioElement.value.src = fallbackUrl
      audioElement.value.load()
    }
  }
}

const loadCurrentTrack = async () => {
  if (!audioElement.value || !currentTrack.value) return

  // Clean up existing HLS instance
  if (hls.value) {
    hls.value.destroy()
    hls.value = null
  }

  // Set duration from API data immediately
  if (currentTrack.value.duration) {
    const durationInSeconds = parseDurationToSeconds(currentTrack.value.duration)
    duration.value = durationInSeconds
  }

  // Check if we have an HLS stream (M3U8 content or .m3u8 URL)
  const streamUrl = currentTrack.value.streamUrl
  if (streamUrl && (streamUrl.includes('#EXTM3U') || streamUrl.includes('.m3u8'))) {
    // This is M3U8 content or URL, initialize HLS
    initializeHLS(streamUrl)
  } else {
    // Regular audio URL
    const audioSource = streamUrl || currentTrack.value.audioUrl
    audioElement.value.src = audioSource
    audioElement.value.load()
  }
  
  // Reset progress
  currentTime.value = 0
}

const seekToPosition = (event) => {
  if (!audioElement.value || isDragging.value) return
  
  const progressBar = event.currentTarget
  const rect = progressBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const progressWidth = rect.width
  const seekTime = (clickX / progressWidth) * audioElement.value.duration
  
  audioElement.value.currentTime = seekTime
  currentTime.value = seekTime
}

const startDragging = (event) => {
  event.preventDefault()
  isDragging.value = true
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDragging)
}

const handleDrag = (event) => {
  if (!isDragging.value || !audioElement.value || !progressBarRef.value) return
  
  const rect = progressBarRef.value.getBoundingClientRect()
  const clickX = Math.max(0, Math.min(event.clientX - rect.left, rect.width))
  const progressWidth = rect.width
  const seekTime = (clickX / progressWidth) * audioElement.value.duration
  
  audioElement.value.currentTime = seekTime
  currentTime.value = seekTime
}

const stopDragging = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDragging)
}

const handleTouchDrag = (event) => {
  if (!isDragging.value || !audioElement.value || !progressBarRef.value) return
  
  event.preventDefault()
  const touch = event.touches[0]
  const rect = progressBarRef.value.getBoundingClientRect()
  const touchX = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
  const progressWidth = rect.width
  const seekTime = (touchX / progressWidth) * audioElement.value.duration
  
  audioElement.value.currentTime = seekTime
  currentTime.value = seekTime
}

const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const parseDurationToSeconds = (duration) => {
  // If duration is already a number, return it
  if (typeof duration === 'number') return duration
  
  // If duration is a string like "3:45", convert to seconds
  if (typeof duration === 'string') {
    const parts = duration.split(':').map(Number)
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1] // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2] // HH:MM:SS
    }
  }
  
  return 0
}

// Volume control methods
const setVolume = (event) => {
  if (!audioElement.value || !volumeBarRef.value) return
  
  const rect = volumeBarRef.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const volumeWidth = rect.width
  const newVolume = Math.max(0, Math.min(1, clickX / volumeWidth))
  
  volume.value = newVolume
  audioElement.value.volume = newVolume
  
  // Update previous volume if not muted
  if (newVolume > 0) {
    previousVolume.value = newVolume
  }
}

const toggleMute = () => {
  if (!audioElement.value) return
  
  if (volume.value === 0) {
    // Unmute: restore previous volume
    volume.value = previousVolume.value
    audioElement.value.volume = previousVolume.value
  } else {
    // Mute: save current volume and set to 0
    previousVolume.value = volume.value
    volume.value = 0
    audioElement.value.volume = 0
  }
}

const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}

const downloadTrack = async (track) => {
  try {
    // Check if user is authenticated
    if (!getUserToken()) {
      console.error('User must be authenticated to download songs')
      return
    }

    // Call API to get download URL
    const downloadResponse = await getSongDownload(track.id)
    
    if (!downloadResponse?.download_url) {
      console.error('No download URL received from API')
      return
    }

    // Fetch the MP3 file from the download URL
    const response = await fetch(downloadResponse.download_url)
    if (!response.ok) {
      throw new Error('Failed to download song')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${track.title || 'track'}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
  }
}

const downloadAllTracks = async () => {
  for (const track of props.albumData.tracks) {
    await downloadTrack(track)
  }
}

// Watch for track changes
watch(() => currentTrackIndex.value, async () => {
  if (currentTrackIndex.value >= 0) {
    await loadCurrentTrack()
  }
})

// Keyboard shortcuts
const handleKeyPress = (event) => {
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      togglePlay()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextTrack()
      break
    case 'ArrowLeft':
      event.preventDefault()
      previousTrack()
      break
    case 'ArrowUp':
      event.preventDefault()
      if (audioElement.value) {
        audioElement.value.volume = Math.min(1, audioElement.value.volume + 0.1)
      }
      break
    case 'ArrowDown':
      event.preventDefault()
      if (audioElement.value) {
        audioElement.value.volume = Math.max(0, audioElement.value.volume - 0.1)
      }
      break
  }
}

// Initialize album data when component mounts
onMounted(async () => {
  // Initialize stream counts for each track
  if (props.showBuyButton && props.albumData.tracks) {
    props.albumData.tracks.forEach((track, index) => {
      if (track.remaining_free_streams !== undefined) {
        trackStreamCounts.value.set(index, track.remaining_free_streams)
      }
    })
  }
  
  // Don't auto-load track on mount - wait for user to click play
  // Set initial duration from API data if we have a track
  if (currentTrack.value && currentTrack.value.duration) {
    const durationInSeconds = parseDurationToSeconds(currentTrack.value.duration)
    duration.value = durationInSeconds
  }
  
  // Set initial volume
  if (audioElement.value) {
    audioElement.value.volume = volume.value
  }
  
  // Add keyboard event listeners
  document.addEventListener('keydown', handleKeyPress)
})

// Watch for album data changes to update stream counts
watch(() => props.albumData?.tracks, (newTracks) => {
  if (props.showBuyButton && newTracks) {
    newTracks.forEach((track, index) => {
      if (track.remaining_free_streams !== undefined) {
        trackStreamCounts.value.set(index, track.remaining_free_streams)
      }
    })
  }
}, { immediate: true })

onUnmounted(() => {
  // Clean up HLS instance
  if (hls.value) {
    hls.value.destroy()
    hls.value = null
  }

  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value.src = ''
  }
  
  // Remove keyboard event listeners
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.music-player {
  --primary-color: #0d7377;
  --bg-dark: #0000004b;
  border-radius: 20px;
  --bg-surface: #121212;
  --bg-hover: rgba(255, 255, 255, 0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.7);
  --border-color: rgba(255, 255, 255, 0.1);
  
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;
  color: var(--text-primary);
  background: var(--bg-dark);
}

/* Header Styles - Inspired by Course Card UI */
.album-header-card {
  padding: 32px;
  background: linear-gradient(135deg, #0a0a14 0%, #121212 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin: 32px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.album-card-content {
  display: flex;
  gap: 40px;
  position: relative;
}

.album-portrait-artwork {
  width: 220px;
  height: 280px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.portrait-cover {
  width: 100%;
  height: 100%;
}

.album-card-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-top: 20px;
}

.album-artist-prefix {
  font-size: 1.1rem;
  color: var(--text-secondary);
  font-family: 'Georgia', serif;
  margin-bottom: 8px;
  font-style: italic;
}

.album-card-title {
  font-size: 3.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 24px;
  line-height: 1.1;
  letter-spacing: -1px;
}

.album-badges {
  display: flex;
  gap: 12px;
  margin-bottom: 40px;
}

.meta-badge {
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.meta-badge.premium {
  border-color: var(--primary-color);
  color: #14a0a5;
  background: rgba(13, 115, 119, 0.1);
}

.album-card-actions {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.action-btn-outlined {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  border-radius: 50% !important;
  color: white !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.action-btn-filled {
  height: 48px !important;
  border-radius: 24px !important;
  background: white !important;
  color: #0a0a14 !important;
  padding: 0 32px !important;
  font-weight: 700 !important;
  letter-spacing: 1px !important;
  font-size: 0.85rem !important;
}

.album-card-price {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  letter-spacing: -0.5px;
}

/* Updated Responsive Design */
@media (max-width: 1024px) {
  .album-card-title { font-size: 2.5rem; }
  .album-portrait-artwork { width: 180px; height: 230px; }
}

@media (max-width: 768px) {
  .album-header-card { padding: 24px; margin: 16px; }
  .album-card-content { flex-direction: column; gap: 24px; }
  .album-portrait-artwork { width: 100%; height: 300px; }
  .album-card-price { position: static; margin-bottom: 16px; font-size: 2rem; }
  .album-card-actions { flex-direction: column; }
  .album-badges { flex-wrap: wrap; }
}

/* ── Player CTA Strip ─────────────────────────────────────── */

@keyframes cta-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes cta-shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}

@keyframes cta-lock-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(20, 160, 165, 0); }
  50%       { box-shadow: 0 0 0 6px rgba(20, 160, 165, 0.18); }
}

@keyframes cta-option-in {
  from { opacity: 0; transform: translateX(-8px); }
  to   { opacity: 1; transform: translateX(0); }
}

.player-cta-strip {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 32px 24px;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(13, 115, 119, 0.1) 0%, rgba(13, 115, 119, 0.03) 100%);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  animation: cta-enter 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;

  /* Animated teal border via outline + pseudo shimmer */
  border: 1px solid rgba(13, 115, 119, 0.35);
}

/* Shimmer sweep across the top edge */
.player-cta-strip::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(20, 160, 165, 0.07) 50%,
    transparent 60%
  );
  background-size: 200% 100%;
  animation: cta-shimmer 3.5s linear infinite;
  pointer-events: none;
}

.player-cta-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.player-cta-lock {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(13, 115, 119, 0.18);
  border: 1px solid rgba(20, 160, 165, 0.4);
  flex-shrink: 0;
  margin-top: 1px;
  animation: cta-lock-pulse 2.4s ease-in-out infinite;
}

.player-cta-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.player-cta-title {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.player-cta-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.5;
}

/* Two-option row */
.player-cta-options {
  display: flex;
  align-items: stretch;
  gap: 0;
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  overflow: hidden;
}

.player-cta-option {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.25s ease;
  animation: cta-option-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.player-cta-option:nth-child(1) { animation-delay: 0.15s; }
.player-cta-option:nth-child(3) { animation-delay: 0.28s; }

.player-cta-option:hover {
  background: rgba(13, 115, 119, 0.08);
}

.player-cta-option:hover .player-cta-option-icon {
  transform: translateY(-2px) scale(1.08);
  background: rgba(13, 115, 119, 0.22);
  border-color: rgba(20, 160, 165, 0.5);
  box-shadow: 0 4px 12px rgba(13, 115, 119, 0.3);
}

.player-cta-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: rgba(13, 115, 119, 0.12);
  border: 1px solid rgba(20, 160, 165, 0.2);
  flex-shrink: 0;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
              background 0.25s ease,
              border-color 0.25s ease,
              box-shadow 0.25s ease;
}

.player-cta-option-body {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.player-cta-option-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-cta-option-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.4;
}

/* "or" vertical divider */
.player-cta-or {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  flex-shrink: 0;
  position: relative;
}

.player-cta-or::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: rgba(255, 255, 255, 0.07);
}

.player-cta-or span {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #121212;
  padding: 3px 0;
  position: relative;
  z-index: 1;
}


@media (max-width: 900px) {
  .player-cta-options {
    flex-direction: column;
  }

  .player-cta-or {
    width: auto;
    height: 28px;
    flex-direction: row;
  }

  .player-cta-or::before {
    top: 50%;
    bottom: auto;
    left: 0;
    right: 0;
    width: auto;
    height: 1px;
  }
}

@media (max-width: 768px) {
  .player-cta-strip {
    margin: 0 16px 16px;
    padding: 16px;
  }

  .player-cta-option {
    padding: 12px 14px;
  }
}

/* Songs Table */
.songs-table {
  flex: 1;
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: grid;
  grid-template-columns: 48px 1fr 200px 100px;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.table-header.has-download {
  grid-template-columns: 48px 1fr 200px 100px 48px;
}

.table-body {
  overflow-y: auto;
  /* max-height: calc(100vh - 550px); */
}

.table-row {
  display: grid;
  grid-template-columns: 48px 1fr 200px 100px;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.table-row.has-download {
  grid-template-columns: 48px 1fr 200px 100px 48px;
}

.table-row:hover:not(.disabled) {
  background: var(--bg-hover);
}

.table-row.active {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--border-color);
}

.table-row.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.col-number {
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
}

.song-name {
  font-weight: 500;
  font-size: 1rem;
}

.song-category {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.col-duration {
  text-align: right;
  color: var(--text-secondary);
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.stream-badge {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
}

/* Playing Animation */
.playing-animation {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.playing-animation span {
  width: 3px;
  background: var(--primary-color);
  animation: bounce 0.8s ease infinite alternate;
}

.playing-animation span:nth-child(2) { animation-delay: 0.2s; }
.playing-animation span:nth-child(3) { animation-delay: 0.4s; }

@keyframes bounce {
  from { height: 4px; }
  to { height: 16px; }
}

/* Bottom Player */
.bottom-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  border-top: 1px solid var(--border-color);
}

.glass-effect {
  background: rgba(18, 18, 18, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 280px;
}

.current-song-info {
  min-width: 0;
}

.current-song-name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.current-artist-name {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.player-main-controls {
  flex: 1;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.player-buttons {
  display: flex;
  align-items: center;
  gap: 24px;
}

.control-play-btn {
  width: 48px !important;
  height: 48px !important;
  border-radius: 50% !important;
  background: white !important;
  color: black !important;
  transition: transform 0.2s ease;
}

.control-play-btn:hover {
  transform: scale(1.05);
}

/* Progress Bar */
.progress-container {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-track-wrapper {
  flex: 1;
  height: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.progress-track-bg {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  background: var(--text-primary);
  border-radius: 2px;
  position: relative;
}

.progress-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.progress-track-wrapper:hover .progress-handle {
  opacity: 1;
}

.progress-track-wrapper:hover .progress-track-bg {
  height: 6px;
}

.time-display {
  font-size: 0.75rem;
  color: var(--text-secondary);
  min-width: 40px;
}

/* Volume Control */
.volume-area {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  justify-content: flex-end;
}

.volume-track {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  cursor: pointer;
}

.volume-bar {
  height: 100%;
  background: var(--text-primary);
  border-radius: 2px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive */
@media (max-width: 1024px) {
  .album-title { font-size: 2.5rem; }
  .table-header .col-album,
  .table-row .col-album { display: none; }
  .table-header, .table-row {
    grid-template-columns: 40px 1fr 80px;
  }
  .table-header.has-download, .table-row.has-download {
    grid-template-columns: 40px 1fr 80px 40px;
  }
}

@media (max-width: 768px) {
  .album-header { padding: 24px; }
  .album-content { flex-direction: column; align-items: center; text-align: center; }
  .album-artwork { width: 180px; height: 180px; }
  .album-title { font-size: 2.25rem; }
  .bottom-player { height: auto; padding: 16px; flex-direction: column; gap: 16px; }
  .now-playing { min-width: 100%; justify-content: center; }
  .volume-area { display: none; }
  .player-main-controls { width: 100%; }
  .songs-table { padding: 0 16px 160px; }
}

@media (max-width: 480px) {
  .section-title { font-size: 1.75rem; }
  .album-title { font-size: 1.75rem; }
  .album-meta { flex-direction: column; align-items: center; gap: 12px; }
  .album-price-container { padding: 4px 12px; }
  .price-current { font-size: 1.25rem; }
  .songs-table { padding: 0 12px 180px; }
  .table-header, .table-row { padding: 12px 8px; }
}

/* Animations */
.slide-up {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
</style>
