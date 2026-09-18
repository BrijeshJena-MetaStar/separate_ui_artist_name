/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Global styles
import '@/styles/global.css'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import { useAppStore } from '@/stores/app'
import { setApiRequestCountCallback } from '@/helper/apiWrapper'

const app = createApp(App)

registerPlugins(app)

// Initialize iframe detection
const appStore = useAppStore()
appStore.detectIframe()

// Global API loader: update store so App.vue can show indicator while any request is in flight
setApiRequestCountCallback((delta) => {
  appStore.apiRequestCount = Math.max(0, (appStore.apiRequestCount || 0) + delta)
})

app.mount('#app')
