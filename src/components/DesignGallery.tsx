import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent as RPointerEvent } from 'react'
import { css } from '@/lib/css'
import { DESIGNS } from '@/data/designs'

const CAPS = 'font-size:11px;letter-spacing:.34em;text-transform:uppercase'
const NAV = 'position:absolute;top:50%;transform:translateY(-50%);z-index:2;display:flex;align-items:center;justify-content:center;width:52px;height:52px;border-radius:50%;border:1px solid rgba(245,244,240,.5);background:rgba(10,10,10,.35);color:#F5F4F0;font-size:18px;cursor:pointer'
const pad = (n: number) => String(n).padStart(2, '0')

/** "Selected designs" for one service: masonry grid of everything in src/assets/designs/<slug>/, full-screen viewer on click. */
export default function DesignGallery({ slug, name }: { slug: string; name: string }) {
  const items = DESIGNS[slug] ?? []
  const [open, setOpen] = useState<number | null>(null)
  const dlg = useRef<HTMLDialogElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const swipeX = useRef<number | null>(null)
  const N = items.length

  // Fade each design up as it scrolls into view (once).
  useEffect(() => {
    const els = grid.current?.querySelectorAll<HTMLElement>('[data-reveal]'); if (!els?.length) return
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.setAttribute('data-in', '')); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.setAttribute('data-in', ''); io.unobserve(e.target) } }), { rootMargin: '0px 0px -8% 0px' })
    els.forEach(e => io.observe(e))
    return () => io.disconnect()
  }, [N])

  // Native <dialog>: focus trap, Esc to close and top-layer stacking for free.
  useEffect(() => {
    const d = dlg.current; if (!d) return
    if (open !== null && !d.open) d.showModal()
    if (open === null && d.open) d.close()
  }, [open])

  if (!N) return null
  const go = (step: number) => setOpen(i => (i === null ? i : (i + step + N) % N))
  const onKey = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1) }
  const down = (e: RPointerEvent) => { swipeX.current = e.clientX }
  const up = (e: RPointerEvent) => {
    if (swipeX.current === null) return
    const dx = e.clientX - swipeX.current; swipeX.current = null
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
  }
  const cur = open === null ? null : items[open]

  return (
    <section id="designs" data-screen-label={name + ' — designs'} style={css('background:#F5F4F0;color:#0A0A0A;padding:clamp(80px,12vh,140px) var(--svc-gutter)')}>
      <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:24px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid #0A0A0A;margin-bottom:clamp(32px,5vh,56px)')}>
        <h2 style={css("margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(40px,5.4vw,88px);line-height:.95")}>Selected <em style={css('font-weight:400;color:#5B6B42')}>designs.</em></h2>
        <span style={css(CAPS + ';font-variant-numeric:tabular-nums')}>{pad(N)} designs</span>
      </div>
      <div ref={grid} className="design-grid">
        {items.map((d, i) => (
          <button key={d.src} type="button" data-reveal onClick={() => setOpen(i)} aria-label={'Open design ' + (i + 1) + ': ' + d.title} data-cursor="View"
            style={css('display:block;width:100%;margin:0 0 clamp(12px,1.4vw,20px);padding:0;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;break-inside:avoid')}>
            <span style={css('display:block;overflow:hidden;background:#E2E1DA')}>
              <img className="hv-zoom" src={d.src} alt={d.title} loading="lazy" decoding="async" style={css('display:block;width:100%;height:auto;transition:transform 1.2s cubic-bezier(.16,1,.3,1)')} />
            </span>
            <span style={css('display:flex;gap:12px;padding-top:10px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#3A3A36')}>
              <span style={css('color:#5B6B42;font-variant-numeric:tabular-nums')}>{pad(i + 1)}</span>{d.title}
            </span>
          </button>
        ))}
      </div>

      <dialog ref={dlg} onClose={() => setOpen(null)} onKeyDown={onKey} onClick={e => { if (e.target === e.currentTarget) setOpen(null) }} aria-label={name + ' designs'}
        style={css('width:100vw;height:100dvh;max-width:none;max-height:none;margin:0;padding:0;border:0;background:rgba(10,10,10,.96);color:#F5F4F0;overflow:hidden')}>
        {cur && (
          <div onPointerDown={down} onPointerUp={up} style={css('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:64px var(--svc-gutter) 28px;touch-action:pan-y;user-select:none')}>
            <img key={cur.src} src={cur.src} alt={cur.title} draggable={false} style={css('max-width:100%;max-height:calc(100dvh - 140px);object-fit:contain;animation:uqFadeIn .35s ease')} />
            <span style={css(CAPS + ';text-align:center;font-variant-numeric:tabular-nums')}>{pad(open! + 1)} / {pad(N)} — {cur.title}</span>
            {N > 1 && <button type="button" aria-label="Previous design" onClick={() => go(-1)} style={css(NAV + ';left:clamp(8px,2vw,32px)')}>←</button>}
            {N > 1 && <button type="button" aria-label="Next design" onClick={() => go(1)} style={css(NAV + ';right:clamp(8px,2vw,32px)')}>→</button>}
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} style={css('position:absolute;top:16px;right:clamp(8px,2vw,32px);z-index:2;height:40px;padding:0 18px;border-radius:999px;border:1px solid rgba(245,244,240,.5);background:transparent;color:#F5F4F0;font-size:11px;letter-spacing:.24em;text-transform:uppercase;cursor:pointer')}>Close ✕</button>
          </div>
        )}
      </dialog>
    </section>
  )
}
