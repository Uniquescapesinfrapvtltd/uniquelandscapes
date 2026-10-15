// Every image or video in src/assets/designs/<service-slug>/ becomes a design on that service's page — no code changes needed.
// File name sets order and caption: "07-infinity-pool-villa-neel.jpg" → 7th, "Infinity pool villa neel".
const files = import.meta.glob<string>('/src/assets/designs/*/*.{jpg,jpeg,png,webp,avif,mp4,webm,JPG,JPEG,PNG,WEBP,MP4}', { eager: true, query: '?url', import: 'default' })

export interface Design { src: string; title: string; video: boolean }

export const DESIGNS: Record<string, Design[]> = {}
for (const path of Object.keys(files).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
  const [, slug, file] = path.match(/designs\/([^/]+)\/([^/]+)$/) ?? []
  if (!slug) continue
  const t = file.replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim()
  ;(DESIGNS[slug] ??= []).push({ src: files[path], title: t.charAt(0).toUpperCase() + t.slice(1), video: /\.(mp4|webm)$/i.test(file) })
}
