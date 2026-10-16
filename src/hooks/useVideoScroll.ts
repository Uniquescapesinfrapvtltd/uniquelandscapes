import { useEffect, useRef, useState } from 'react'
import { SCENES } from '@/data/content'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import type { HeroMedia } from '@/lib/media'

interface Options { src: string; media: HeroMedia; loaded: boolean; reduced: boolean; onNavSolid: (solid: boolean) => void }

const FPS = 24                 // from ffprobe: r_frame_rate=24/1
const HALF_FRAME = 1 / FPS / 2 // skip seeks smaller than half a frame — they can't change the picture
const SEEK_TIMEOUT = 250       // ms; recover if a 'seeked' event never arrives

/**
 * Scroll-scrubbed hero video.
 * One ScrollTrigger maps hero scroll → progress; one ticker callback (rAF) writes currentTime,
 * at most one seek in flight. The video file is encoded with a keyframe every 10 frames,
 * so each seek decodes ≤ 9 frames instead of the whole clip.
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

    // iOS (Safari, in-app browsers) ignores preload and paints no frame until play() has run once.
    const prime = () => { v.muted = true; v.setAttribute('muted', ''); v.load(); v.play().then(() => v.pause(), () => { /* Low Power Mode blocks play — poster stays */ }) }
    // Download the whole clip once: drives the preloader % and keeps every seek local (no range requests mid-scrub).
    const load = async () => {
      try {
        const res = await fetch(src)
        if (!res.ok || !res.body || !(res.headers.get('content-type') || '').startsWith('video/')) throw new Error('fetch')
        const total = +(res.headers.get('content-length') || 0), reader = res.body.getReader(), parts: Uint8Array[] = []; let got = 0
        for (;;) { const { done, value } = await reader.read(); if (done) break; parts.push(value); got += value.length; if (total) media.loadPct = got / total; if (unmounted) return }
        blobUrl = URL.createObjectURL(new Blob(parts, { type: 'video/mp4' })); media.loadPct = 1
        v.src = blobUrl; prime()
      } catch { if (!unmounted) { media.loadPct = 1; v.src = src; prime() } } // fall back to streaming
    }

    const onSeeking = () => { seeking = true; seekAt = performance.now() }
    const onSeeked = () => { seeking = false }
    // A browser that rejects the downloaded blob gets one retry streaming the file directly; after that, the poster still shows.
    const onError = () => {
      if (blobUrl && v.src === blobUrl) { v.src = src; prime(); return }
      media.failed = true; setVideoFailed(true)
    }
    try { v.pause(); v.currentTime = 0 } catch { /* ignore */ }
    v.addEventListener('seeking', onSeeking)
    v.addEventListener('seeked', onSeeked)
    v.addEventListener('error', onError)
    load()

    // The only place currentTime is written. Runs on GSAP's rAF ticker.
    const writer = () => {
      if (reduced || !live.current.loaded || media.failed || v.readyState < 1 || !v.duration) return
      if (seeking && performance.now() - seekAt > SEEK_TIMEOUT) seeking = false
      if (seeking) return
      const tt = Math.min(v.duration - .04, target * v.duration)
      if (Math.abs(v.currentTime - tt) > HALF_FRAME) v.currentTime = tt
    }
    gsap.ticker.add(writer)

    const proxy = { p: 0 }
    const update = () => {
      const sp = proxy.p
      target = sp
      if (barRef.current) barRef.current.style.transform = `scaleY(${sp.toFixed(4)})`
      let sc = 0; SCENES.forEach((s, i) => { if (sp >= s.at - .0001) sc = i })
      if (sc !== lastScene) { lastScene = sc; setScene(sc) }
    }
    // scrub .5s replaces the original per-frame lerp (factor .12) — same eased catch-up, but time-based.
    const tween = gsap.to(proxy, {
      p: 1, ease: 'none', onUpdate: update,
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom bottom', scrub: reduced ? true : .5 },
    })
    const nav = ScrollTrigger.create({ trigger: hero, start: 'bottom 80px', end: 'max', onToggle: self => live.current.onNavSolid(self.isActive) })

    return () => {
      unmounted = true
      gsap.ticker.remove(writer)
      tween.scrollTrigger?.kill(); tween.kill(); nav.kill()
      v.removeEventListener('seeking', onSeeking); v.removeEventListener('seeked', onSeeked); v.removeEventListener('error', onError)
      if (blobUrl) URL.revokeObjectURL(blobUrl)
      media.video = null
    }
  }, [src, media, reduced])

  return { heroRef, videoRef, barRef, scene, videoFailed }
}
