import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import checker from 'vite-plugin-checker'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), checker({ typescript: true }), tsconfigPaths()],
  optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger'] },
  assetsInclude: ['**/*.mp4', '**/*.webm'],
  build: { assetsInlineLimit: 0 },
})
