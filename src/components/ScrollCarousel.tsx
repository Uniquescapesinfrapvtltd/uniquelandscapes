import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { css } from '@/lib/css'
import { ease } from '@/lib/ease'
import { gsap } from '@/lib/gsap'
import ImageSlot from '@/components/ImageSlot'

export interface CarouselItem { num: string; title: string; body: string; slot: string; placeholder: string; href?: string; src?: string }

interface Props {
  id: string; screenLabel: string
  label: string; count: string; staticCount: string
  items: CarouselItem[]
  isMobile: boolean; reduced: boolean
  onOpen?: (href: string) => void
  onBack?: () => void // stage pages: shows a ← Back button that returns to the landing page
}

// Keyframe tables from the original tickServices(); index = distance from the active card (−2..2).
// Mobile cy/h are fractions of the free band between the label row and the title block (not of the
// screen), so the cards can never reach the service name however many lines it wraps to; the
// proportions match the original's on a 390×844 phone.
const K_MOB = { cx: [-.2, .2, .5, .8, 1.2], cy: [.85, .85, .4, .85, .85], w: [.2, .26, .88, .26, .2], h: [.1, .13, .64, .13, .1], s: [1.25, 1.18, 1, 1.18, 1.25], o: [0, 1, 1, 1, 0] }
const MOB_BAND_TOP = 140 // px: just under the label row at top:104px
const K_DESK = { cx: [.36, .4, .54, .66, .7], cy: [-.3, .02, .52, .98, 1.3], w: [.12, .17, .44, .19, .14], h: [.12, .18, .58, .18, .12], s: [1.25, 1.18, 1, 1.18, 1.25], o: [0, 1, 1, 1, 0] }
// The mobile keyframes are fractions of viewport height, with fixed labels at 104px. Below ~640px tall
// (phones in landscape) the active card covers the labels and the side cards hit the titles,
// so short mobile-layout screens get the static list instead (same one reduced-motion users see).
const MIN_ANIMATED_MOBILE_H = 640
const isShort = () => innerHeight < MIN_ANIMATED_MOBILE_H
// Must match --svc-gutter in global.css: clamp(20px,5vw,96px).
const svcGutter = (W: number) => Math.min(96, Math.max(20, W * .05))

const at = (arr: number[], d: number) => { d = Math.min(2, Math.max(-2, d)) + 2; const k = Math.min(3, Math.floor(d)), t = d - k; return arr[k] + (arr[k + 1] - arr[k]) * t }

const BACK = 'flex:none;display:inline-flex;align-items:center;gap:8px;height:32px;padding:0 16px;border-radius:999px;border:1px solid #0A0A0A;background:transparent;color:#0A0A0A;font-size:11px;letter-spacing:.24em;text-transform:uppercase;cursor:pointer;pointer-events:auto;transition:background .3s,color .3s'
const CARD = 'position:absolute;left:30%;top:20%;width:40%;height:56%;overflow:hidden;background:#E2E1DA;opacity:0;display:block;color:inherit;will-change:transform'

/** Scroll-pinned card carousel: the home Services section and each service's stage-by-stage page. */
export default function ScrollCarousel({ id, screenLabel, label, count, staticCount, items, isMobile: mob, reduced, onOpen, onBack }: Props) {
  const ref = useRef<HTMLElement>(null)
  const [short, setShort] = useState(isShort)
  useEffect(() => {
    const onResize = () => setShort(isShort())
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])
  const animated = !reduced && !(mob && short)
  const N = items.length

  useEffect(() => {
    const sec = ref.current; if (!sec || !animated) return
    const imgs = [...sec.querySelectorAll<HTMLElement>('[data-svc-img]')]
    const titles = [...sec.querySelectorAll<HTMLElement>('[data-svc-title]')]
    const stage = sec.firstElementChild as HTMLElement, titleBlock = titles[0]?.parentElement
    const proxy = { p: 0 }
    // Layout is read once per refresh/resize, never inside the scroll frame (no forced reflow while scrolling).
    // The stage's own height (100svh) is used, not innerHeight: on phones innerHeight grows when the address
    // bar hides, which pushed the cards below where the title block actually sits.
    const box = { W: 0, H: 0, mobile: false, y0: 0, band: 0, K: K_DESK, Wa: 0, Ha: 0 }
    const measure = () => {
      const W = stage.clientWidth, H = stage.clientHeight, mobile = innerWidth < 860
      const K = mobile ? { ...K_MOB, w: [...K_MOB.w] } : K_DESK
      if (mobile) K.w[2] = 1 - 2 * svcGutter(W) / W // active mobile card spans gutter to gutter
      const bandBottom = mobile && titleBlock ? titleBlock.offsetTop - 16 : H
      Object.assign(box, { W, H, mobile, K, y0: mobile ? MOB_BAND_TOP : 0, band: mobile ? Math.max(120, bandBottom - MOB_BAND_TOP) : H })
      // Every card is laid out once at the ACTIVE card's size; per frame it is only moved/scaled (transform)
      // and cropped (clip-path) — compositor-friendly, unlike animating width/height/left/top.
      box.Wa = at(K.w, 0) * W; box.Ha = at(K.h, 0) * box.band
      imgs.forEach(el => { el.style.left = '0'; el.style.top = '0'; el.style.width = box.Wa + 'px'; el.style.height = box.Ha + 'px'; el.style.transformOrigin = '50% 50%' })
    }
    const render = () => {
      const { W, K, y0, band, Wa, Ha, mobile } = box
      const raw = proxy.p * (N - 1), i0 = Math.min(N - 2, Math.floor(raw)), fr = raw - i0
      const pos = i0 + ease(Math.min(1, Math.max(0, (fr - .2) / .6)))
      imgs.forEach((el, i) => {
        const d = i - pos, w = at(K.w, d) * W, h = at(K.h, d) * band
        const cx = at(K.cx, d) * W, cy = y0 + at(K.cy, d) * band
        // Transforms only (no repaint/re-raster per frame): the card box is stretched to w×h and its overflow:hidden
        // crops; the photo inside is counter-stretched so it stays undistorted, covering the box like object-fit:cover.
        const sx = w / Wa, sy = h / Ha, k = Math.max(sx, sy) * at(K.s, d)
        el.style.transform = `translate3d(${(cx - Wa / 2).toFixed(1)}px,${(cy - Ha / 2).toFixed(1)}px,0) scale(${sx.toFixed(4)},${sy.toFixed(4)})`
        el.style.opacity = String(at(K.o, d)); el.style.zIndex = String(10 - Math.round(Math.abs(d) * 3))
        const inner = el.firstElementChild as HTMLElement | null
        if (inner) inner.style.transform = `scale(${(k / sx).toFixed(4)},${(k / sy).toFixed(4)})`
      })
      titles.forEach((el, i) => {
        const d = i - pos, o = Math.max(0, 1 - Math.abs(d) * 2.4)
        el.style.opacity = String(o); el.style.transform = 'translate3d(0,' + (d * 60).toFixed(1) + 'px,0)'
        // Blurring text every frame is the costliest paint here; phones get the fade + slide only.
        if (!mobile) el.style.filter = 'blur(' + ((1 - o) * 6).toFixed(1) + 'px)'
        el.style.pointerEvents = o > .5 ? 'auto' : 'none'
      })
    }
    measure()
    // scrub .5s stands in for the original per-frame lerp (factor .12).
    const tw = gsap.to(proxy, { p: 1, ease: 'none', onUpdate: render, scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: .5, onRefresh: () => { measure(); render() } } })
    render()
    return () => { tw.scrollTrigger?.kill(); tw.kill() }
  }, [animated, mob, N])

  // Client-side navigation for cards that open a page; modifier/middle clicks keep normal link behaviour.
  const open = (href: string) => (e: MouseEvent) => {
    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
    e.preventDefault(); onOpen(href)
  }

  const back = onBack ? <button type="button" onClick={onBack} className="hv-dark" style={css(BACK)}><span aria-hidden="true">←</span>Back</button> : null

  return (
    <section id={id} ref={ref} data-screen-label={screenLabel} style={{ ...css('position:relative;background:#F5F4F0;color:#0A0A0A'), height: animated ? (mob ? '360vh' : '420vh') : 'auto' }}>
      {animated ? (
        <div style={css('position:sticky;top:0;height:100vh;height:100svh;overflow:hidden')}>
          {items.map((s, i) => {
            const inner = <div style={css('position:absolute;inset:0;will-change:transform')}><ImageSlot id={s.slot} placeholder={s.placeholder} src={s.src} eager /></div>
            return s.href
              ? <a key={i} href={s.href} onClick={open(s.href)} aria-label={'Open ' + s.title} data-svc-img={i} style={css(CARD)}>{inner}</a>
              : <div key={i} data-svc-img={i} style={css(CARD)}>{inner}</div>
          })}
          <div style={css('position:absolute;left:var(--svc-gutter);right:var(--svc-gutter);top:104px;z-index:30;display:flex;justify-content:space-between;align-items:center;gap:24px;font-size:11px;letter-spacing:.34em;text-transform:uppercase;pointer-events:none')}>
            <span style={css('min-width:0;display:flex;align-items:center;gap:16px;line-height:1.6')}>{back}<span>{label}</span></span><span style={css('flex:none;white-space:nowrap;line-height:1.6;font-variant-numeric:tabular-nums')}>{count}</span>
          </div>
          <div style={{ ...css('position:absolute;left:var(--svc-gutter);bottom:clamp(32px,8vh,88px);z-index:20;display:grid;pointer-events:none'), right: mob ? 'var(--svc-gutter)' : 'auto', width: mob ? 'auto' : 'min(480px, calc(32vw - var(--svc-gutter) - 40px))' }}>
            {items.map((s, i) => {
              const style = { ...css('grid-area:1/1;display:flex;flex-direction:column;opacity:0;color:inherit'), gap: mob ? '10px' : '16px' }
              const content = (
                <>
                  <span style={css('font-size:11px;letter-spacing:.3em')}>{s.num}</span>
                  <span style={{ ...css("font-family:'Cormorant Garamond',serif;font-weight:500;line-height:.95;text-wrap:balance"), fontSize: mob ? 'clamp(30px,8vw,40px)' : 'clamp(40px,3.8vw,64px)' }}>{s.title}</span>
                  <span style={{ ...css('line-height:1.55;font-weight:300;color:#3A3A36;max-width:34ch;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden'), fontSize: mob ? '14px' : '16px', WebkitLineClamp: mob ? '2' : 'none' }}>{s.body}</span>
                </>
              )
              // The visible service title opens its stage page too (same link as the card).
              return s.href
                ? <a key={i} href={s.href} onClick={open(s.href)} data-svc-title={i} style={style}>{content}</a>
                : <div key={i} data-svc-title={i} style={style}>{content}</div>
            })}
          </div>
        </div>
      ) : (
        <div style={css('padding:clamp(80px,12vh,120px) var(--svc-gutter);display:flex;flex-direction:column;gap:56px')}>
          <div style={css('display:flex;justify-content:space-between;gap:24px;padding-bottom:20px;border-bottom:1px solid #0A0A0A;font-size:11px;letter-spacing:.34em;text-transform:uppercase;align-items:center')}><span style={css('display:flex;align-items:center;gap:16px')}>{back}<span>{label}</span></span><span>{staticCount}</span></div>
          {items.map((s, i) => {
            const body = (
              <>
                <div style={css('position:relative;aspect-ratio:4/3;overflow:hidden;background:#E2E1DA')}><ImageSlot id={s.slot} placeholder={s.placeholder} src={s.src} /></div>
                <span style={css('font-size:11px;letter-spacing:.3em')}>{s.num}</span>
                <span style={css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(34px,8vw,48px);line-height:1")}>{s.title}</span>
                <span style={css('font-size:16px;line-height:1.65;font-weight:300;color:#3A3A36')}>{s.body}</span>
              </>
            )
            const style = css('display:flex;flex-direction:column;gap:18px;color:inherit')
            return s.href
              ? <a key={i} href={s.href} onClick={open(s.href)} style={style}>{body}</a>
              : <div key={i} style={style}>{body}</div>
          })}
        </div>
      )}
    </section>
  )
}
