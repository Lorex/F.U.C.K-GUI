import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: 'src/quasar-variables.sass'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    fs: {
      allow: [
        '.',
        './node_modules/@fhir-uck/fhir-converter-core/src/fhir_packages',
        './node_modules/ace-builds'
      ]
    }
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['ace-builds']
  }
})
