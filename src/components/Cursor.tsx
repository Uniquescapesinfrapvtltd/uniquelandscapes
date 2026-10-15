import { useEffect, useRef } from 'react'
import { css } from '@/lib/css'
import { gsap } from '@/lib/gsap'

// Modes, after Codrops' "Custom Cursor Effects" (magnetic/stuck circle) and their filled-circle cursor sketch:
//  idle    — small ring (difference blend) trailing a dot, stretched along the direction of travel
//  hover   — ring grows; small controls (pills, round buttons) pull ring + element together (magnetic)
//  label   — "View" / "Drag" targets: ring fills olive and carries the label inside
//  text    — inputs: ring shrinks out of the way of the caret
type Mode = 'idle' | 'hover' | 'label' | 'text'
const SCALE: Record<Mode, number> = { idle: 1, hover: 1.6, label: 2.6, text: .45 }
const MAGNET_MAX = 220 // px: only controls smaller than this (both sides) are magnetic

export default function Cursor({ loaded }: { loaded: boolean }) {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const ambientRef = useRef<HTMLSpanElement>(null)
  const loadedRef = useRef(loaded)
  loadedRef.current = loaded

  const syncRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = document.documentElement
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const m = { x: -100, y: -100, rx: -100, ry: -100, angle: 0, stretch: 0 }
    let shown = false, down = false, mode: Mode = 'idle', magnet: HTMLElement | null = null, clickRaf = 0
    // The system cursor is hidden ONLY while the custom one is on screen (pointer inside the page, preloader done),
    // so there is never a moment with no cursor at all.
    const sync = () => {
      const visible = shown && loadedRef.current
      if (cursorRef.current) cursorRef.current.style.opacity = visible ? '1' : '0'
      root.classList.toggle('uq-cursor', visible)
    }
    syncRef.current = sync
    const applyScale = () => { if (ringRef.current) ringRef.current.style.scale = String(SCALE[mode] * (down ? .85 : 1)) }
    // Every control that has leaned toward the pointer; released ones ease back to rest in the tick instead of snapping.
    const lean = new Map<HTMLElement, { x: number; y: number }>()
    const setMagnet = (el: HTMLElement | null) => { magnet = el }
    const setMode = (next: Mode, label: string, ambient: string) => {
      mode = next
      const ring = ringRef.current, dot = dotRef.current
      if (ring) {
        ring.style.background = next === 'label' ? '#7A8C5E' : 'rgba(245,244,240,.12)'
        ring.style.borderColor = next === 'label' ? '#7A8C5E' : '#F5F4F0'
      }
      // The blend lives on the fixed container (a stacking context isolates its children's blending).
      if (cursorRef.current) cursorRef.current.style.mixBlendMode = next === 'label' ? 'normal' : 'difference'
      applyScale()
      if (dot) dot.style.opacity = next === 'idle' ? '1' : '0'
      if (labelRef.current) { labelRef.current.textContent = label; labelRef.current.style.opacity = next === 'label' ? '1' : '0' }
      if (ambientRef.current) { ambientRef.current.textContent = ambient; ambientRef.current.style.opacity = ambient && next === 'idle' ? '1' : '0' }
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
      m.x = e.clientX; m.y = e.clientY
      if (!shown) { shown = true; m.rx = e.clientX; m.ry = e.clientY; sync() }
    }
    // pointerleave isn't reliably dispatched to document; pointerout with no relatedTarget = pointer left the window.
    const onOut = (e: PointerEvent) => { if (!e.relatedTarget) { shown = false; setMagnet(null); sync() } }
    const update = (t: Element | null) => {
      if (!t) return
      const act = t.closest<HTMLElement>('a,button,input,textarea,select,[role=button],[role=slider]')
      const zone = t.closest('[data-cursor]')
      const view = act?.tagName === 'A' && (act.closest('#projects') || act.hasAttribute('data-svc-img') || act.hasAttribute('data-svc-title'))
      const label = view ? 'View' : act?.getAttribute('data-cursor') || ''
      if (act && /^(INPUT|TEXTAREA|SELECT)$/.test(act.tagName)) { setMagnet(null); setMode('text', '', '') }
      else if (label) { setMagnet(null); setMode('label', label, '') }
      else if (act) {
        const r = act.getBoundingClientRect()
        setMagnet(!reduced && r.width < MAGNET_MAX && r.height < MAGNET_MAX ? act : null)
        setMode('hover', '', '')
      } else { setMagnet(null); setMode('idle', '', zone?.getAttribute('data-cursor') || '') }
    }
    const onOver = (e: Event) => update(e.target instanceof Element ? e.target : null)
    // A click can swap the page under a still pointer (service page ↔ home); re-read what is under it next frame.
    const onClick = () => { cancelAnimationFrame(clickRaf); clickRaf = requestAnimationFrame(() => requestAnimationFrame(() => update(document.elementFromPoint(m.x, m.y)))) }
    const onDown = () => { down = true; applyScale() }
    const onUp = () => { down = false; applyScale() }

    const tick = () => {
      // A page swap (e.g. Back) can unmount the control under the pointer; its rect would read 0,0 and drag the ring to the corner.
      if (magnet && !magnet.isConnected) setMagnet(null)
      lean.forEach((o, el) => {
        if (el === magnet) return
        o.x *= .8; o.y *= .8
        if (!el.isConnected || Math.abs(o.x) + Math.abs(o.y) < .2) { el.style.translate = ''; lean.delete(el) }
        else el.style.translate = `${o.x.toFixed(1)}px ${o.y.toFixed(1)}px`
      })
      if (!shown) return
      let tx = m.x, ty = m.y
      if (magnet) {
        const r = magnet.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2
        tx = cx + (m.x - cx) * .35; ty = cy + (m.y - cy) * .35 // ring sticks near the control's centre
        const o = { x: (m.x - cx) * .2, y: (m.y - cy) * .2 } // control leans toward the pointer
        lean.set(magnet, o)
        magnet.style.translate = `${o.x.toFixed(1)}px ${o.y.toFixed(1)}px`
      }
      const px = m.rx, py = m.ry
      m.rx += (tx - m.rx) * .18; m.ry += (ty - m.ry) * .18
      // Squash & stretch along the direction of travel, eased so it settles back to a circle.
      const vx = m.rx - px, vy = m.ry - py, speed = Math.hypot(vx, vy)
      if (speed > .5) m.angle = Math.atan2(vy, vx) * 180 / Math.PI
      m.stretch += (Math.min(speed / 60, mode === 'idle' ? .45 : .15) - m.stretch) * .2
      const s = reduced ? 0 : m.stretch
      if (posRef.current) posRef.current.style.transform = `translate3d(${m.rx}px,${m.ry}px,0) rotate(${m.angle}deg) scale(${1 + s},${1 - s * .6})`
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${m.x}px,${m.y}px,0)`
      if (labelRef.current) labelRef.current.style.transform = `translate3d(${m.rx}px,${m.ry}px,0) translate(-50%,-50%)`
      if (ambientRef.current) ambientRef.current.style.transform = `translate3d(${m.rx}px,${m.ry + 34}px,0) translateX(-50%)`
    }
    gsap.ticker.add(tick)
    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('pointerdown', onDown)
    addEventListener('pointerup', onUp)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('pointerover', onOver)
    document.addEventListener('click', onClick)
    addEventListener('popstate', onClick)
    return () => {
      gsap.ticker.remove(tick); cancelAnimationFrame(clickRaf); lean.forEach((_, el) => { el.style.translate = '' })
      removeEventListener('pointermove', onMove)
      removeEventListener('pointerdown', onDown)
      removeEventListener('pointerup', onUp)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('click', onClick)
      removeEventListener('popstate', onClick)
      root.classList.remove('uq-cursor')
    }
  }, [])

  // Preloader finished while the pointer was already over the page: show the custom cursor right away.
  useEffect(() => { syncRef.current() }, [loaded])

  const CAPS = 'position:absolute;left:0;top:0;font-size:10px;letter-spacing:.3em;text-transform:uppercase;color:#F5F4F0;white-space:nowrap;opacity:0;transition:opacity .25s ease'
  return (
    <div ref={cursorRef} aria-hidden="true" style={css('position:fixed;left:0;top:0;z-index:300;width:1px;height:1px;pointer-events:none;opacity:0;transition:opacity .25s ease;mix-blend-mode:difference')}>
      <span ref={posRef} style={css('position:absolute;left:0;top:0;width:0;height:0')}>
        <span ref={ringRef} style={css('position:absolute;left:-18px;top:-18px;width:36px;height:36px;border-radius:50%;border:1px solid #F5F4F0;background:rgba(245,244,240,.12);transition:scale .5s cubic-bezier(.22,1,.36,1),background .3s ease,border-color .3s ease')}></span>
      </span>
      <span ref={dotRef} style={css('position:absolute;left:0;top:0;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#F5F4F0;transition:opacity .2s ease')}></span>
      <span ref={labelRef} style={css(CAPS + ';padding-left:.3em')}></span>
      <span ref={ambientRef} style={css(CAPS)}></span>
    </div>
  )
}
