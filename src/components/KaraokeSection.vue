<template>
  <section v-if="isKaraoke" class="karaoke-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">The Karaoke Studio - {{ artistName }}</h2>
        <!-- <p class="section-subtitle">Sing along to your favorite songs with professional backing tracks</p> -->
      </div>
      
      <div class="karaoke-content">
        <div class="karaoke-hero">
          <div class="karaoke-info">
            <!-- Karaoke Header -->
            <div class="karaoke-header">
              <h3 class="select-song-title">Select a song to sing and record your version</h3>
            </div>
            
            <!-- Loading state (API in progress) -->
            <div v-if="appStore.karaokeLoading" class="loading-state">
              <v-progress-circular indeterminate color="#8b5cf6"></v-progress-circular>
              <p>Loading songs...</p>
            </div>

            <!-- Songs List -->
            <div v-else-if="karaokeList.length > 0" class="karaoke-songs-list">
              <div 
                v-for="song in karaokeList" 
                :key="song.id"
                class="song-item"
                :class="{ 'selected': selectedSong?.id === song.id }"
                @click="selectSong(song)"
              >
                <div class="song-thumbnail">
                  <v-img 
                    :src="song.thumbnail_url || song.image" 
                    :alt="song.name"
                    class="thumbnail-img"
                    cover
                  />
                </div>
                <div class="song-details">
                  <h4 class="song-title">{{ song.name }}</h4>
                  <p v-if="artistName" class="song-artist">{{ artistName }}</p>
                </div>
                <div class="song-action">
                  <v-icon 
                    size="24" 
                    :color="selectedSong?.id === song.id ? '#8b5cf6' : '#10b981'"
                  >
                    {{ selectedSong?.id === song.id ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                  </v-icon>
                </div>
              </div>
            </div>
            
            <!-- Empty state (no songs after load) -->
            <div v-else class="loading-state">
              <p>No karaoke songs available.</p>
            </div>
          </div>
          
          <div class="karaoke-visual">
            <div class="karaoke-stage" :class="{ 'disabled': !selectedSong }" @click="navigateToKaraoke">
              <div class="stage-text">
                <span v-if="!selectedSong">SELECT SONG FIRST</span>
                <span v-else>Tap to start karaoke</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

const router = useRouter();
const route = useRoute();

const props = defineProps({
  artistName: {
    type: String,
    required: true
  },
  artistId: {
    type: [String, Number],
    required: true
  },
  isKaraoke: {
    type: Boolean,
    default: false
  }
});

const karaokeList = ref([]);
const selectedSong = ref(null);

const selectSong = (song) => {
  selectedSong.value = song;
  appStore.selectSong(song);
};

const navigateToKaraoke = () => {
  if (!selectedSong.value) {
    // Don't navigate if no song is selected
    return;
  }
  
  if (props.artistId) {
    const path = `karaoke/${props.artistId}`;
    // const path = `${route.params.artist_name}/karaoke/${props.artistId}`;
    router.push({
      path: path,
      query: { songId: selectedSong.value.id }
    });
  }
};

onBeforeMount(async () => {
  await appStore.getKaraoke(props.artistId);
  karaokeList.value = [...(appStore.karaokeList || [])];
  selectedSong.value = appStore.selectedSong || null;
});
</script>

<style scoped>
.karaoke-section {
  padding: 60px 0;
  position: relative;
  overflow: hidden;
}

.karaoke-content {
  position: relative;
  z-index: 2;
}

/* Karaoke Hero Layout */
.karaoke-hero {
  display: flex;
  flex-direction: column;
  /* display: grid;
  grid-template-columns: 3fr 2fr; */
  gap: 48px;
  /* align-items: start; */
  margin-top: 48px;
}

.karaoke-info {
  text-align: left;
}

/* Karaoke Header */
.karaoke-header {
  margin-bottom: 32px;
}

.select-song-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  text-align: left;
}

/* Songs List */
.karaoke-songs-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  /* max-width: 600px; */
}

.song-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 16px;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(139, 92, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.song-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
}

.thumbnail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  flex: 1;
  min-width: 0;
}

.song-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-action {
  flex-shrink: 0;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.song-item:hover .song-action {
  opacity: 1;
}

.song-item.selected {
  background: rgba(139, 92, 246, 0.1);
  border-color: #8b5cf6;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.2);
}

/* Karaoke Visual */
.karaoke-visual {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  align-items: center;
  /* cursor: pointer; */
  transition: all 0.3s ease;
}

.karaoke-stage:not(.disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 25px 50px rgba(139, 92, 246, 0.6), 0 0 80px rgba(59, 130, 246, 0.4);
}

.karaoke-stage:not(.disabled):hover .microphone-stand {
  transform: scale(1.1);
}

.karaoke-stage:not(.disabled):hover .stage-text {
  color: #ffffff;
  transform: scale(1.02);
}

.karaoke-stage {
  position: relative;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #8b5cf6 20%, #3b82f6 50%, #1d4ed8 100%);
  border-radius: 50%;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.4), 0 0 60px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.karaoke-stage::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%);
  border-radius: 50%;
  pointer-events: none;
}

.karaoke-stage.disabled {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

.karaoke-stage.disabled .microphone-stand {
  opacity: 0.5;
}

.karaoke-stage.disabled .stage-text {
  color: rgba(255, 255, 255, 0.5);
}

.microphone-stand {
  position: relative;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.stage-text {
  font-size: 1.125rem;
  font-weight: 300;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-align: center;
  transition: all 0.3s ease;
  line-height: 1.4;
}


/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.loading-state p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  margin: 0;
}

/* Section Headers */
.section-header {
  margin-bottom: 48px;
}

.section-title {
  font-size: 2.25rem;
  font-weight: 600;
  color: #ffffff;
}

.section-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.6);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.container {
  /* max-width: 1500px; */
  margin: 0 auto;
  padding: 0 24px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .karaoke-hero {
    grid-template-columns: 1fr;
    gap: 24px;
    text-align: center;
  }
  
  .karaoke-info {
    text-align: center;
  }
  
  .karaoke-songs-list {
    max-width: 100%;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .karaoke-section {
    padding: 80px 0;
  }
  
  .container {
    padding: 0 16px;
  }
  
  .karaoke-hero {
    gap: 20px;
    margin-top: 32px;
  }
  
  .karaoke-header {
    margin-bottom: 24px;
  }
  
  .karaoke-songs-list {
    grid-template-columns: 1fr;
    max-width: 100%;
    gap: 12px;
  }
  
  .song-item {
    padding: 12px;
    gap: 12px;
  }
  
  .song-thumbnail {
    width: 50px;
    height: 50px;
  }
  
  .song-title {
    font-size: 1rem;
  }
  
  .song-artist {
    font-size: 0.8rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .select-song-title {
    font-size: 1.25rem;
  }
  
  .karaoke-stage {
    width: 250px;
    height: 250px;
  }
  
  .karaoke-visual {
    margin-top: 16px;
  }
}

@media (max-width: 480px) {
  .karaoke-section {
    padding: 60px 0;
  }
  
  .container {
    padding: 0;
  }
  
  .section-header {
    margin-bottom: 22px;
  }
  
  .karaoke-hero {
    gap: 16px;
    margin-top: 24px;
  }
  
  .karaoke-header {
    margin-bottom: 20px;
  }
  
  .karaoke-songs-list {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .song-item {
    padding: 10px;
    gap: 10px;
    border-radius: 10px;
  }
  
  .song-thumbnail {
    width: 45px;
    height: 45px;
  }
  
  .song-title {
    font-size: 14px;
  }
  
  .song-artist {
    font-size: 12px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .select-song-title {
    font-size: 1.125rem;
  }
  
  .karaoke-stage {
    width: 160px;
    height: 160px;
  }
  
  .stage-text {
    font-size: 12px;
    letter-spacing: 1px;
  }
  
  .microphone-stand {
    margin-bottom: 16px;
  }
  
  
  .karaoke-visual {
    margin-top: 12px;
  }
}
</style>
