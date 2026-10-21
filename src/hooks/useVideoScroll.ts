import { useEffect, useRef, useState } from 'react'
import { SCENES } from '@/data/content'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { HeroMedia } from '@/lib/media'

interface Options { src: string; media: HeroMedia; loaded: boolean; reduced: boolean; onNavSolid: (solid: boolean) => void }

const FPS = 24                 // from ffprobe: r_frame_rate=24/1
const HALF_FRAME = 1 / FPS / 2 // skip seeks smaller than half a frame — they can't change the picture
const SEEK_TIMEOUT = 300       // ms; allow hardware decoder to finish intermediate seeks without premature abort

/**
 * Scroll-scrubbed hero video.
 * One ScrollTrigger maps hero scroll → progress; GSAP ticker (rAF) + seeked callbacks write currentTime.
 * At most one seek in flight at any millisecond. As soon as a seek completes, writer() fires immediately,
 * achieving max frame delivery throughput.
 */
export function useVideoScroll({ src, media, loaded, reduced, onNavSolid }: Options) {
  const heroRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState(0)
  const [videoFailed, setVideoFailed] = useState(false)
  const live = useRef({ loaded, onNavSolid })
  live.current = { loaded, onNavSolid }

  useEffect(() => {
    const v = videoRef.current, hero = heroRef.current
    if (!v || !hero) return
    media.video = v
    let unmounted = false, blobUrl = '', lastScene = 0
    let target = 0, seeking = false, seekAt = 0

    // Ensure all mobile WebKit / Chromium inline video attributes are set on DOM element
    v.defaultMuted = true
    v.muted = true
    v.playsInline = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', '')
    v.setAttribute('x5-playsinline', '')
    v.setAttribute('disableremoteplayback', '')

    // iOS (Safari, in-app browsers) ignores preload and paints no frame until play() has run once.
    const prime = () => {
      v.defaultMuted = true
      v.muted = true
      v.setAttribute('muted', '')
      v.pause()
      const p = v.play()
      if (p && typeof p.then === 'function') {
        p.then(() => {
          v.pause()
          if (target === 0) v.currentTime = 0
        }).catch(() => {
          /* Low Power Mode or autoplay restrictions — poster stays visible */
        })
      }
    }

    // The only place currentTime is written.
    const writer = () => {
      if (reduced || !live.current.loaded || media.failed || v.readyState < 1 || !v.duration || isNaN(v.duration)) return
      if (seeking && performance.now() - seekAt > SEEK_TIMEOUT) seeking = false
      if (seeking) return
      const clampedTarget = Math.max(0, Math.min(1, target))
      const maxSeek = Math.max(0, v.duration - .04)
      const tt = Math.min(maxSeek, clampedTarget * v.duration)
      if (Math.abs(v.currentTime - tt) > HALF_FRAME) v.currentTime = tt
    }

    // Download the whole clip once: drives preloader % and keeps every seek local (no range requests mid-scrub).
    const load = async () => {
      try {
        const res = await fetch(src)
        if (!res.ok || !res.body || !(res.headers.get('content-type') || '').startsWith('video/')) throw new Error('fetch')
        const total = +(res.headers.get('content-length') || 0), reader = res.body.getReader(), parts: Uint8Array[] = []
        let got = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          parts.push(value)
          got += value.length
          if (total) media.loadPct = got / total
          if (unmounted) return
        }
        blobUrl = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' }))
        media.loadPct = 1
        if (!unmounted) {
          v.src = blobUrl
          prime()
        }
      } catch {
        if (!unmounted) {
          media.loadPct = 1
          v.src = src
          prime()
        }
      }
    }

    const onSeeking = () => { seeking = true; seekAt = performance.now() }
    const onSeeked = () => {
      seeking = false
      // Immediately trigger next seek if target moved while previous seek was processing
      writer()
    }
    const onLoadedMetadata = () => {
      try {
        v.pause()
        if (target === 0) v.currentTime = 0
      } catch { /* ignore */ }
      writer()
    }
    // A browser that rejects the downloaded blob gets one retry streaming the file directly; after that, the poster still shows.
    const onError = () => {
      if (blobUrl && v.src === blobUrl) { v.src = src; prime(); return }
      media.failed = true; setVideoFailed(true)
    }
    try { v.pause(); v.currentTime = 0 } catch { /* ignore */ }
    v.addEventListener('seeking', onSeeking)
    v.addEventListener('seeked', onSeeked)
    v.addEventListener('loadedmetadata', onLoadedMetadata)
    v.addEventListener('error', onError)
    load()

    gsap.ticker.add(writer)

    const proxy = { p: 0 }
    const update = () => {
      const sp = Math.max(0, Math.min(1, proxy.p))
      target = sp
      if (barRef.current) barRef.current.style.transform = `scaleY(${sp.toFixed(4)})`
      let sc = 0; SCENES.forEach((s, i) => { if (sp >= s.at - .0001) sc = i })
      if (sc !== lastScene) { lastScene = sc; setScene(sc) }
    }
    // scrub 0.35s balances instant finger tracking with silky smoothness
    const tween = gsap.to(proxy, {
      p: 1, ease: 'none', onUpdate: update,
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : .35 },
    })
    const nav = ScrollTrigger.create({ trigger: hero, start: 'bottom 80px', end: 'max', onToggle: self => live.current.onNavSolid(self.isActive) })

    return () => {
      unmounted = true
      gsap.ticker.remove(writer)
      tween.scrollTrigger?.kill(); tween.kill(); nav.kill()
      v.removeEventListener('seeking', onSeeking); v.removeEventListener('seeked', onSeeked)
      v.removeEventListener('loadedmetadata', onLoadedMetadata)
      v.removeEventListener('error', onError)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      media.video = null
    }
  }, [src, media, reduced])

  return { heroRef, videoRef, barRef, scene, videoFailed }
}
