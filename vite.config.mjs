import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
// import mkcert from'vite-plugin-mkcert'
// Generate a timestamp for cache busting
const timestamp = new Date().getTime()
export default defineConfig({
  base: '/store/',
  plugins: [
    VueRouter({ importMode: 'async' }),
    Layouts(),
    Vue({
      template: { transformAssetUrls }
    }),
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss',
      },
    }),
    Components(),
    Fonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900',
          },
          {
            name: 'Montserrat',
            styles: 'wght@100;200;300;400;500;600;700;800;900',
          }
        ],
      },
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
      ],
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
    // mkcert()
  ],
  define: { 
    'process.env': {},
    __BUILD_TIME__: JSON.stringify(timestamp),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api/zip': {
        target: 'https://api.zippopotam.us',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/zip/, ''),
      },
    },
  },
  preview: {

    port: 4173,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  build: {
    assetsDir: 'assets',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
      output: {
        entryFileNames: `assets/js/[name]-${timestamp}-[hash].js`,
        chunkFileNames: `assets/js/[name]-${timestamp}-[hash].js`,
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/css/i.test(extType)) {
            extType = 'css';
          } else {
            extType = 'assets';
          }
          return `assets/${extType}/[name]-${timestamp}-[hash][extname]`;
        },
        manualChunks(id) {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vuetify')) {
              return 'vendor';
            }
            // Other dependencies chunk
            return 'dependencies';
          }
        }
      }
    },
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
})