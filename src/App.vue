<template>
  <v-app>
    <!-- Global route-change progress bar -->
    <!-- <v-progress-linear
      v-if="appStore.isRouteChanging"
      indeterminate
      color="primary"
      class="route-progress"
    /> -->
    <v-main v-if="CurrencyCode !== ''" :class="{ 'bg-color': !isArtistPage , 'padding-top': '20px !important'}">
      <router-view />
    </v-main>
    <!-- Global API loader: full-screen translucent overlay + centered spinner -->
    <!-- <div v-if="appStore.apiRequestCount > 0" class="global-api-loader-overlay" aria-hidden="true">
      <v-progress-circular :size="70" :width="7" color="white" indeterminate class="global-api-loader-spinner" />
    </div> -->
  </v-app>
</template>

<script setup>
import { onMounted, computed, watch, nextTick } from 'vue'
import { useAppStore } from './stores/app'
import { useArtistPage } from './composables/useArtistPage'

const appStore = useAppStore()
const CurrencyCode = computed(() => appStore.currencyCode)
const { isArtistPage } = useArtistPage()

onMounted(async () => {
  try {
    await appStore.selectCurrencyCode()
  } catch (err) {
    console.error("Country detection failed:", err)
    appStore.selectCurrencyCode("USD")
  }
})
//
</script>

<style scoped>
.bg-color {
  background: radial-gradient(86.53% 140.87% at -1.56% -10.74%, #000D4D 0%, #060606 100%) !important;
}

.route-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  margin: 0;
}

.global-api-loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  pointer-events: none;
}

.global-api-loader-spinner {
  flex-shrink: 0;
}
</style>
