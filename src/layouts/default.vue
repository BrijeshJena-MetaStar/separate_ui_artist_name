<template>
  <v-app class="bg-color">
    <AppHeader v-if="!hideHeaderFooter" />
    <!-- <v-main :style="{ 'padding-top': !isArtistPage ? '0rem !important' : '4rem !important' }"> -->
    <v-main :style="{ 'padding-top': !hideHeaderFooter ? '4rem !important' : '0rem !important' }">
      <router-view />
    </v-main>

    <AppFooter v-if="!hideHeaderFooter && !isInIframe && !isLandingPage" />
  </v-app>
</template>

<script setup>
import { useRoute } from 'vue-router';
// import { ref, onMounted, computed } from 'vue';
// import { ARTIST_DETAILS } from '@/helper/constant';

const route = useRoute();
const isInIframe = ref(false);
const isLandingPage = ref(false);

const hideHeaderFooter = /^\/(video|popup\/html|popup\/space|art-gallery)\/[a-zA-Z0-9]+$/.test(route.path) || route.path === '/art-gallery';

isLandingPage.value = route.path === '/' || route.path === '/landing';


// // Extract artist domain from route path (e.g., '/planetBickram/...' -> 'planetBickram')
// const getArtistDomainFromPath = (path) => {
//   const pathSegments = path.split('/').filter(segment => segment);
//   return pathSegments[0] || null;
// };

// // Reactive computed properties for artist domain checking
// const currentArtistDomain = computed(() => getArtistDomainFromPath(route.path));
// const matchedArtist = computed(() => 
//   ARTIST_DETAILS.find(artist => artist.domain === currentArtistDomain.value)
// );
// const isArtistPage = computed(() => !!matchedArtist.value);


onMounted(() => {
  try {
    isInIframe.value = window.self !== window.top;
  } catch (e) {
    isInIframe.value = true;
  }
});
</script>

<style scoped>
.bg-color {
  background-color: black;
}
</style>
