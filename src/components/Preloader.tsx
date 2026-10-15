import { useEffect, useRef, useState } from 'react'
import { css } from '@/lib/css'
import { ease } from '@/lib/ease'
import type { HeroMedia } from '@/lib/media'

interface Props { enabled: boolean; reduced: boolean; media: HeroMedia; loaded: boolean; onDone: () => void }

const MARK = '/assets/brand/logo-mark.png'

/** Brand-mark loader: the mark fills with colour from the bottom as the hero video downloads, then the screen lifts away like a curtain. */
export default function Preloader({ enabled, reduced, media, loaded, onDone }: Props) {
  const fillRef = useRef<HTMLImageElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone
  // Unmount once the curtain has lifted: its looping 'breathe' animation would otherwise keep the page rendering frames forever.
  const [gone, setGone] = useState(false)
  useEffect(() => { if (!loaded) return; const id = setTimeout(() => setGone(true), 1300); return () => clearTimeout(id) }, [loaded])

  useEffect(() => {
    let finished = false, raf = 0, to = 0
    const finish = (instant: boolean) => {
      if (finished) return; finished = true
      to = window.setTimeout(() => { document.documentElement.style.overflow = ''; doneRef.current() }, instant ? 0 : 350)
    }
    if (!enabled) { finish(true); return () => clearTimeout(to) }

    document.documentElement.style.overflow = 'hidden'; scrollTo(0, 0)
    const start = performance.now(), minDur = reduced ? 600 : 2400, maxDur = 15000
    const step = (now: number) => {
      const el = now - start, t = ease(Math.min(1, el / minDur))
      const v = media.video
      let buf = 1
      if (v && !media.failed) {
        if (media.loadPct != null) buf = media.loadPct
        else if (v.readyState >= 4) buf = 1
        else buf = Math.min(.9, el / maxDur)
      }
      const done = (Math.min(t, buf) >= 1 && el >= minDur) || el > maxDur
      const val = done ? 100 : Math.round(Math.min(t, buf) * 100)
      if (fillRef.current) fillRef.current.style.clipPath = `inset(${100 - val}% 0 0 0)`
      if (barRef.current) barRef.current.style.transform = `scaleX(${val / 100})`
      if (pctRef.current) pctRef.current.textContent = String(val).padStart(2, '0')
      if (done) finish(false)
      else raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(raf); clearTimeout(to); document.documentElement.style.overflow = '' }
  }, [enabled, reduced, media])

  if (!enabled || gone) return null
  return (
    <div aria-hidden={loaded} role="status" aria-label="Loading" style={{ ...css('position:fixed;inset:0;z-index:220;background:radial-gradient(ellipse at center,#16180F 0%,#0A0A0A 70%);color:#F5F4F0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;transition:transform 1.1s cubic-bezier(.76,0,.24,1),visibility 0s linear 1.1s'), transform: loaded ? 'translateY(-100%)' : 'none', visibility: loaded ? 'hidden' : 'visible' }}>
      <div style={css('position:relative;width:clamp(88px,12vw,128px);aspect-ratio:1;animation:uqBreathe 2.4s ease-in-out infinite')}>
        <img src={MARK} alt="" style={css('position:absolute;inset:0;width:100%;height:100%;filter:grayscale(1) brightness(.45)')} />
        <img ref={fillRef} src={MARK} alt="" style={css('position:absolute;inset:0;width:100%;height:100%;clip-path:inset(100% 0 0 0)')} />
      </div>
      <div style={css('display:flex;flex-direction:column;align-items:center;gap:14px')}>
        <span style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:20px;letter-spacing:.18em;padding-left:.18em;text-transform:uppercase")}>Unique Scapes</span>
        <span style={css('position:relative;width:160px;height:1px;background:rgba(245,244,240,.18);overflow:hidden')}>
          <span ref={barRef} style={css('position:absolute;inset:0;background:#7A8C5E;transform-origin:left;transform:scaleX(0)')}></span>
        </span>
        <span style={css('font-size:10px;letter-spacing:.42em;padding-left:.42em;text-transform:uppercase;color:rgba(245,244,240,.6);font-variant-numeric:tabular-nums')}>Loading <span ref={pctRef}>00</span>%</span>
      </div>
    </div>
  )
}
