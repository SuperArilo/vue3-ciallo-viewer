import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        dts({
            copyDtsFiles: true,
            tsconfigPath: './tsconfig.json'
        })
    ],
    build: {
        outDir: 'dist',
        sourcemap: false,
        lib: {
            entry: './src/index.ts',
            name: 'vue3-ciallo-viewer'
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
});
