import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import Icons from 'unplugin-icons/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      vue(),
      Icons({
        compiler: 'vue3',
        autoInstall: true,
      }),
      dts({
        tsconfigPath: './tsconfig.app.json',
        rollupTypes: true,
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@mst': resolve(__dirname, 'src/features/mst-calculator'),
        '@shared': resolve(__dirname, 'src/shared'),
      },
    },
    build: {
      cssCodeSplit: false,
      assetsInlineLimit: 0,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'NomadCalcModule',
        fileName: 'nomad-calc-module',
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue',
          },
        },
      },
    },
  }
})
