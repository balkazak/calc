import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Icons from 'unplugin-icons/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      customElement: true,
    }),
    Icons({
      compiler: 'vue3',
      autoInstall: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@mst': resolve(__dirname, 'src/features/mst-calculator'),
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist/ce',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/web-component.ts'),
      name: 'NomadCalcElement',
      fileName: 'nomad-calc-element',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      // Bundle Vue and other dependencies for standalone usage
      external: [],
      output: {
        inlineDynamicImports: true,
      },
    },
  },
})
