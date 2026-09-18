// Utilities
// import { getTracks } from "@/services/karaokeService";
import { getTracks } from "@/services/karaokeService";
import { getAllProducts } from "@/services/productService";
import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    artistId: null,
    categoryId: null,
    countryId: null,
    artistDomain: null,
    /** Raw artists from GET /api/artists (reused by discover & [artist_name] pages) */
    artistsApiList: [],
    products: [],
    originalProducts: [],
    filteredProducts: [],
    searchQuery: "",
    isLoading: false,
    isError: null,
    sortBy: null,
    karaokeList: [],
    /** True while karaoke tracks API is in progress */
    karaokeLoading: false,
    /** True while route is resolving (lazy chunk load + navigation) */
    isRouteChanging: false,
    /** Number of in-flight API requests (for global API loader) */
    apiRequestCount: 0,
    selectedSong: {
      id: null,
      video_url: null,
      name: null,
    },
    currencyCode: "INR",
    isInIframe: false,
  }),
  actions: {
    // Detect if the app is running inside an iframe
    setArtistsApiList(list) {
      this.artistsApiList = list || [];
    },
    detectIframe() {
      try {
        this.isInIframe = window.self !== window.top;
      } catch (e) {
        // If we can't access window.top, we're likely in an iframe
        this.isInIframe = true;
      }
    },
    async getKaraoke(id) {
      try {
        this.karaokeLoading = true;
        const res = await getTracks(id);
        if (res?.track) {
          this.karaokeList = res.track;
          this.selectedSong = this.karaokeList[0];
        }
      } catch (error) {
        console.error("Error in fetching karaoke", error);
      } finally {
        this.karaokeLoading = false;
      }
    },
    selectSong(item) {
      this.selectedSong = item;
    },
    /**
     * Sets currency from user's system timezone (no network call).
     * Pass an optional code (e.g. "USD") to force that currency instead.
     */
    selectCurrencyCode(overrideCode) {
      if (overrideCode) {
        this.currencyCode = overrideCode;
        sessionStorage.setItem("currency", overrideCode);
        return;
      }
      const getCurrencyFromTimezone = (tz) => {
        console.log(tz,'tz');
        if (!tz) return "USD";
        if (tz === "Asia/Calcutta") return "INR";
        if (tz.startsWith("America/")) return "USD";
        if (tz === "Europe/London") return "USD";
        const euroZones = [
          "Europe/Paris", "Europe/Berlin", "Europe/Amsterdam", "Europe/Brussels",
          "Europe/Madrid", "Europe/Rome", "Europe/Dublin", "Europe/Vienna",
          "Europe/Lisbon", "Europe/Athens", "Europe/Helsinki", "Europe/Stockholm",
        ];
        if (euroZones.some((z) => tz.startsWith(z))) return "USD";
        return "USD";
      };
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const code = getCurrencyFromTimezone(tz);
        console.log(code,'code');
        this.currencyCode = code;
        sessionStorage.setItem("currency", code);
      } catch (err) {
        this.currencyCode = "INR";
        sessionStorage.setItem("currency", "INR");
        console.error("Geo fetch failed:", err);
        // this.currencyCode = "USD";
        // sessionStorage.setItem("currency", "USD");
        // console.error("Timezone currency detection failed:", err);
      }
    },
    async getProductsStore() {
      try {
        this.isLoading = true;
        const params = {
          categoryId: this.categoryId,
          countryId: this.countryId,
          artistDomain: this.artistDomain,
          // queryforTLS: this.artistDomain === "terenceLewis",
          // queryTLPro: this.artistDomain === "terenceLewis",
        };

        console.log(params,'params');
        const result = await getAllProducts(params);
        this.products = result;
        this.originalProducts = [...result];
        this.applyFilters();
        this.isLoading = false;
      } catch (error) {
        this.isLoading = false;
        this.isError = "Error in getting products";
      }
    },

    updateFilters({ categoryId = null, countryId = null, artistDomain = null }) {
      if (categoryId !== null) this.categoryId = categoryId;
      if (countryId !== null) this.countryId = countryId;
      if (artistDomain !== null) this.artistDomain = artistDomain;

      this.getProductsStore();
    },

    filterByCountry(id) {
      this.updateFilters({ countryId: id });
    },

    filterByCategory(id) {
      this.updateFilters({ categoryId: id });
    },

    sortProducts(sortBy) {
      if (sortBy === "Default") {
        this.products = [...this.originalProducts];
      } else {
        this.products = [...this.originalProducts].sort((a, b) => {
          if (sortBy === "Name") {
            return a.product_name.localeCompare(b.product_name);
          } else if (sortBy === "Price") {
            return a.currencies[0].price - b.currencies[0].price;
          }
          return 0;
        });
      }
      this.applyFilters();
    },

    setSearchQuery(query) {
      this.searchQuery = query;
      this.applyFilters();
    },

    applyFilters() {
      let filtered = [...this.products];
      
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(product => 
          product.product_name.toLowerCase().includes(query) ||
          product.artist_name.toLowerCase().includes(query) ||
          (product.category_name && product.category_name.toLowerCase().includes(query))
        );
      }
      
      this.filteredProducts = filtered;
    },

    getDisplayProducts() {
      return this.searchQuery.trim() ? this.filteredProducts : this.products;
    },
  },
});
