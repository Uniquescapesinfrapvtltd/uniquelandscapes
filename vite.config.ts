import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), checker({ typescript: true }), tsconfigPaths()],
  optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger'] },
  // Baked in at build time so 'Years of practice' never depends on the visitor's clock.
  define: { __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()) },
  assetsInclude: ['**/*.mp4', '**/*.webm'],
  build: { assetsInlineLimit: 0 },
})
