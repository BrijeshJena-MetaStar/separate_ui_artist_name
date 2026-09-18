import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useArtistPage() {
  const route = useRoute()

  const isArtistPage = computed(() => {
    // Special cases: these are not artist pages
    if (route.path.startsWith('/store/') || 
        route.path.startsWith('/productDetails/') ||
        route.path.startsWith('/productNFTDetail/') ||
        route.path.startsWith('/course/') ||
        route.path.startsWith('/course-video/') ||
        route.path.startsWith('/paidVideo/') ||
        route.path.startsWith('/karaoke/') ||
        route.path.startsWith('/checkout/') ||
        route.path.startsWith('/singleCheckout/') ||
        route.path.startsWith('/slot-form/') ||
        route.path.startsWith('/slot-form-2/') ||
        route.path.startsWith('/slot-selection/') ||
        route.path.startsWith('/slotBook/')) {
      return false;
    }
    
    // Check if the path matches artist page patterns
    const pathSegments = route.path.split('/').filter(segment => segment);
    
    // Known non-artist routes that should not have the gradient navbar
    const nonArtistRoutes = ['login', 'register', 'profile', 'cart', 'discover', 'landing', 'forgotPassword', 'coming-soon', 'productDetails', 'productNFTDetail', 'course', 'course-video', 'paidVideo', 'karaoke', 'checkout', 'singleCheckout', 'slot-form', 'slot-form-2', 'slot-selection', 'slotBook'];
    
    // Check if any segment in the path is a non-artist route
    const hasNonArtistRoute = pathSegments.some(segment => nonArtistRoutes.includes(segment));
    
    // If there's at least one path segment and none of them are non-artist routes, it's likely an artist page
    if (pathSegments.length > 0 && !hasNonArtistRoute) {
      if (route.params && route.params.artist_name) {
        return true;
      }
      return true;
    }
    
    return false;
  });

  return {
    isArtistPage
  }
}
