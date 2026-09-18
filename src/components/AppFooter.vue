<template>
  <footer class="footer" 
  v-if="!appStore.isInIframe">
    <div class="footer-content">
      <div class="footer-section brand-section">
        <a href="https://artisteverse.com" class="logo-link">
          <img
            src="https://artisteverse.com/img/logo.png"
            alt="ArtistVerse Logo"
            class="footer-logo"
          />
        </a>
        <div class="powered-by">
          <span class="powered-text">Powered by</span>
          <img
            :src="poweredByLogoUrl"
            alt="Powered by Logo"
            class="powered-logo"
          />
        </div>
      </div>

      <div class="footer-section links-section">
        <nav class="footer-nav">
          <a @click="navigateTo('/aboutUs')" class="footer-link">About</a>
          <a @click="navigateTo('/faq')" class="footer-link">FAQ</a>
          <a @click="navigateTo('/contact')" class="footer-link">Contact</a>
          <a @click="navigateTo('/terms')" class="footer-link">Terms</a>
          <a @click="navigateTo('/privacy')" class="footer-link">Privacy</a>
          <a @click="navigateTo('/refund')" class="footer-link">Refund</a>
        </nav>
      </div>

      <div class="footer-section social-section">
        <div class="social-links">
          <a :href="LINKS.facebook" class="social-link" aria-label="Facebook">
            <v-icon size="20">mdi-facebook</v-icon>
          </a>
          <a :href="LINKS.twitter" class="social-link" aria-label="Twitter">
            <v-icon size="20">mdi-twitter</v-icon>
          </a>
          <a :href="LINKS.instgaram" class="social-link" aria-label="Instagram">
            <v-icon size="20">mdi-instagram</v-icon>
          </a>
          <a :href="LINKS.linkedin" class="social-link" aria-label="LinkedIn">
            <v-icon size="20">mdi-linkedin</v-icon>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { LINKS } from "@/helper/common";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();
const router = useRouter();

const navigateTo = (path) => {
  if (!appStore.isInIframe) {
    router.push({ path });
  }
};

const poweredByLogoUrl = ref(
  "https://d2b4rv4q8lb0q0.cloudfront.net/assets/company/metastarlogo.png"
);
</script>

<style scoped>
.footer {
  padding: 3rem 0 2rem;
  position: relative;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background-color: transparent;
  transition: background 0.3s ease;
  /* margin-top: 10rem; */
}

.artist-page-footer {
  /* background: linear-gradient(
    90deg,
    rgba(16, 21, 78, 0.9) 0%,
    rgba(13, 13, 13, 0.95) 50%,
    rgba(13, 13, 13, 1) 100%
  ); */
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1500px;
  margin: 0 auto;
  padding: 0 2rem;
  gap: 3rem;
}

.footer-section {
  display: flex;
  align-items: center;
}

/* Brand Section */
.brand-section {
  flex-direction: column;
  align-items: flex-start;
}

.logo-link {
  display: block;
}

.footer-logo {
  height: 28px;
  width: auto;
  transition: opacity 0.2s ease;
}

.footer-logo:hover {
  opacity: 0.8;
}

.powered-by {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.powered-text {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 400;
}

.powered-logo {
  height: 24px;
  width: auto;
  opacity: 0.8;
}

/* Links Section */
.links-section {
  flex: 1;
  justify-content: center;
}

.footer-nav {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 400;
  transition: color 0.2s ease;
  white-space: nowrap;
  cursor: pointer;
}

.footer-link:hover {
  color: white;
}

/* Social Section */
.social-section {
  justify-content: flex-end;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link > a {
  cursor: pointer;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  transition: all 0.2s ease;
  background: rgba(255, 255, 255, 0.05);
  text-decoration: none !important;
}

.social-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  text-decoration: none !important;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .footer {
    padding: 2rem 0 1.5rem;
  }

  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
    padding: 0 1rem;
  }

  .brand-section {
    align-items: center;
    order: 1;
  }

  .links-section {
    order: 2;
  }

  .footer-nav {
    gap: 1.5rem;
    justify-content: center;
  }

  .footer-link {
    font-size: 0.85rem;
  }

  .social-section {
    order: 3;
    justify-content: center;
  }

  .social-links {
    gap: 0.75rem;
  }

  .social-link {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .footer-nav {
    gap: 1rem;
  }

  .footer-link {
    font-size: 0.8rem;
  }
}
</style>