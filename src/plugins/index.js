/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import vuetify from './vuetify'
import pinia from '@/stores'
import router from '@/router'
import vue3GoogleLogin from 'vue3-google-login'

export function registerPlugins(app) {
  const clientId = import.meta.env.VITE_G_CLIENT_ID;
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(vue3GoogleLogin, {
      clientId: clientId
    })
}
