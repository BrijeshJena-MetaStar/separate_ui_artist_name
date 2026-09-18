<template>
  <header class="header" 
  >
  <!-- :class="{ 'artist-page-header': isArtistPage }" -->
    <div class="logo-container" @click="logoClick">
      <img src="https://artisteverse.com/img/logo.png" alt="ArtisteVerse Logo" class="logo-image" />
    </div>
    <nav class="navigation desktop-nav">

      <button @click="onStoreClick" v-if="!appStore.isInIframe">Explore</button>
      <button @click="loginClick" v-if="!isAuthenticated">Log In</button>
      <button @click="profileClick" v-if="isAuthenticated">Profile</button>
      <button @click="aboutClick()" v-if="!appStore.isInIframe">About Us</button>
      <v-btn @click="cartClick" icon>
        <v-icon>mdi-shopping</v-icon>
      </v-btn>
      <button @click="logoutClick" v-if="isAuthenticated">Log Out</button>
    </nav>
    <v-btn icon class="mobile-menu-btn" @click="toggleMobileMenu">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <v-dialog v-model="mobileMenuOpen" fullscreen transition="dialog-bottom-transition">
      <v-card class="mobile-menu" :class="{ 'artist-page-mobile-menu': isArtistPage }">
        <v-toolbar dark color="transparent">
          <v-spacer />
          <v-btn icon dark @click="toggleMobileMenu">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-list>
                     <v-list-item @click="() => { aboutClick(); toggleMobileMenu(); }" v-if="!appStore.isInIframe">
             <v-list-item-title>About Us</v-list-item-title>
           </v-list-item>
           <v-list-item @click="() => { onStoreClick(); toggleMobileMenu(); }" v-if="!appStore.isInIframe">
             <v-list-item-title>Explore</v-list-item-title>
           </v-list-item>
          <v-list-item v-if="isAuthenticated" @click="() => { profileClick(); toggleMobileMenu(); }">
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="!isAuthenticated" @click="() => { loginClick(); toggleMobileMenu(); }">
            <v-list-item-title>Log In</v-list-item-title>
          </v-list-item>
          <v-list-item v-if="isAuthenticated" @click="() => { logoutClick(); toggleMobileMenu(); }">
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item>
          <v-list-item @click="() => { cartClick(); toggleMobileMenu(); }">
            <v-list-item-title>
              <v-icon>mdi-shopping</v-icon>
              Shopping Bag
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
  </header>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import {
  useRouter,
  useRoute
} from "vue-router";
import { getUserToken } from "@/services/userService";
import { clearFeatureFlagsSession } from "@/utils/featureFlagsSession";
import { LINKS, getArtistRoute } from "@/helper/common";
import { useAppStore } from "@/stores/app";
// import { useArtistPage } from "@/composables/useArtistPage";

const appStore = useAppStore();
const mobileMenuOpen = ref(false);
const isAuthenticated = ref(false);
const router = useRouter();
const route = useRoute();
// const { isArtistPage } = useArtistPage();
const checkAuthStatus = () => {
  isAuthenticated.value = !!getUserToken();
};

onMounted(() => {
  checkAuthStatus();
});

watch(
  () => router.currentRoute.value,
  () => {
    checkAuthStatus();
  },
  { deep: true }
);

const openLink = (URL) => {
  window.location.href = URL;
};

const onStoreClick = () => {
  router.push({
    path: '/discover',
    // path: getArtistRoute(appStore.artistDomain, "/"),
  });
};

const profileClick = () => {
  router.push({
    path: "/profile",
  });
};

const logoClick = () => {
  if(!appStore.isInIframe){
    router.push({
    path: "/landing",
  });
    //  window.location.replace("https://dev.artisteverse.com/store/landing");
  }
};

const aboutClick = () => {
  if(!appStore.isInIframe){
    router.push({
    path: "/aboutUs",
  });
    //  window.location.replace("https://dev.artisteverse.com/store/landing");
  }
};

const loginClick = () => {
  router.push({
    path: "/login",
  });
};

const logoutClick = () => {
  const currentRoute = router.currentRoute.value.fullPath;
  localStorage.clear();
  clearFeatureFlagsSession();
  router.push({
    path: "/login",
    query: { toSend: currentRoute }
  });
};

const cartClick = () => {
  router.push("/cart");
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};
</script>

<style scoped>
.header {
  position: absolute;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100vw;
    padding: 1rem;
    background-color: transparent;
    transition: background 0.3s ease;
}

.artist-page-header {
  /* background: linear-gradient(
    180deg,
    rgba(16, 21, 78, 0.9) 0%,
    rgba(13, 13, 13, 0.95) 50%,
    rgba(13, 13, 13, 1) 100%
  ); */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.artist-page-header .navigation button {
  color: #ffffff;
  transition: color 0.3s ease;
}

.artist-page-header .navigation button:hover {
  color: #2196F3;
}

.artist-page-header .mobile-menu-btn {
  color: #ffffff;
}

.artist-page-header .logo-container {
  filter: brightness(1.1);
}

.artist-page-header .navigation .v-btn {
  color: #ffffff !important;
}

.artist-page-header .navigation .v-btn:hover {
  color: #2196F3 !important;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-container:hover {
  cursor: pointer;
}

.logo-image {
  height: 32px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 1rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.mobile-menu-btn {
  display: none;
}

.mobile-menu {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #000;
}

.artist-page-mobile-menu {
  background: linear-gradient(
    90deg,
    rgba(16, 21, 78, 0.9) 0%,
    rgba(13, 13, 13, 0.95) 50%,
    rgba(13, 13, 13, 1) 100%
  ) !important;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }

  .logo-image{
    height: 30px;
  }

}
</style>
