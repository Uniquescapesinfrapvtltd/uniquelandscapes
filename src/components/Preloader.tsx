import { useEffect, useRef } from 'react'
import { css } from '@/lib/css'
import { ease } from '@/lib/ease'
import type { HeroMedia } from '@/lib/media'

interface Props { enabled: boolean; reduced: boolean; media: HeroMedia; loaded: boolean; onDone: () => void }

export default function Preloader({ enabled, reduced, media, loaded, onDone }: Props) {
  const countRef = useRef<HTMLDivElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    let finished = false, raf = 0, to = 0
    const finish = (instant: boolean) => {
      if (finished) return; finished = true
      const c = countRef.current
      if (c && !instant) c.animate([{ opacity: 1, filter: 'blur(0)', transform: 'translate(-50%,0)' }, { opacity: 0, filter: 'blur(7px)', transform: 'translate(-50%,-34px)' }], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'forwards' })
      to = window.setTimeout(() => { document.documentElement.style.overflow = ''; doneRef.current() }, instant ? 0 : 200)
    }
    if (!enabled) { finish(true); return () => clearTimeout(to) }

    document.documentElement.style.overflow = 'hidden'; scrollTo(0, 0)
    const start = performance.now(), minDur = reduced ? 600 : 2800, maxDur = 15000
    const step = (now: number) => {
      const el = now - start, t = ease(Math.min(1, el / minDur))
      const v = media.video
      let buf = 1
      if (v && !media.failed) {
        if (media.loadPct != null) buf = media.loadPct
        else if (v.readyState >= 4) buf = 1
        else buf = Math.min(.9, el / maxDur)
      }
      const val = Math.round(Math.min(t, buf) * 100)
      if (counterRef.current) counterRef.current.textContent = String(val)
      if ((val >= 100 && el >= minDur) || el > maxDur) { if (counterRef.current) counterRef.current.textContent = '100'; finish(false) }
      else raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => { cancelAnimationFrame(raf); clearTimeout(to); document.documentElement.style.overflow = '' }
  }, [enabled, reduced, media])

  return (
    <div style={{ ...css('position:fixed;inset:0;z-index:200;background:linear-gradient(to bottom,rgba(10,10,10,.55),rgba(10,10,10,.35) 50%,rgba(10,10,10,.92));transition:opacity 1.4s cubic-bezier(.16,1,.3,1) .3s'), pointerEvents: loaded ? 'none' : 'auto', opacity: loaded ? 0 : 1 }}>
      <div ref={countRef} style={css('position:absolute;left:50%;bottom:clamp(22px,3.4vh,32px);transform:translateX(-50%);display:flex;align-items:flex-end;gap:4px;line-height:1;color:#F5F4F0')}>
        <span ref={counterRef} style={css('font-weight:300;font-size:64px;font-variant-numeric:tabular-nums;letter-spacing:-.02em')}>0</span><span style={css('font-size:22px;padding-bottom:6px')}>%</span>
      </div>
      <div style={css('position:absolute;left:50%;top:calc(50% + 64px);transform:translateX(-50%);font-size:10px;letter-spacing:.42em;text-transform:uppercase;padding-left:.42em;color:rgba(245,244,240,.7);white-space:nowrap')}>Infra · Landscape · Pools · Resorts</div>
    </div>
  )
}
