import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { css } from '@/lib/css'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { TESTIMONIALS } from '@/data/content'

const N = TESTIMONIALS.length
const WORDS = TESTIMONIALS.map(([q]) => q.split(' ').length)
// Reading time per quote: 7s minimum, ~0.3s a word for the long ones.
const DUR = WORDS.map(w => Math.max(7000, w * 300))
const CAPS = 'font-size:11px;letter-spacing:.34em;text-transform:uppercase'
const ROUND = 'display:flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:50%;border:1px solid #0A0A0A;background:transparent;color:#0A0A0A;font-size:18px;cursor:pointer;transition:background .3s,color .3s'

/** Client words: one large quote at a time, revealed word by word; auto-advances while on screen. */
export default function Testimonials({ reduced }: { reduced: boolean }) {
  const [step, setStep] = useState(0)
  const stepRef = useRef(0)
  stepRef.current = step
  // Screen readers hear only quotes the visitor chose (Previous/Next), not the 7s auto-rotation.
  const [live, setLive] = useState(false)
  const secRef = useRef<HTMLElement>(null)
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const barRef = useRef<HTMLSpanElement>(null)
  // Paused by hover OR keyboard focus inside the section (WCAG 2.2.2).
  const t = useRef({ stepT: 0, hover: false, focus: false })

  // Same timing model as the founders block: time-based, only while the section is in view and not hovered.
  useEffect(() => {
    const sec = secRef.current; if (!sec) return
    let vis = false
    const st = ScrollTrigger.create({ trigger: sec, start: 'top 70%', end: 'bottom 30%', onToggle: self => { vis = self.isActive } })
    const tick = (_: number, dt: number) => {
      const s = t.current
      if (vis && !s.hover && !s.focus && !reduced) {
        s.stepT += Math.min(100, dt)
        if (s.stepT >= DUR[stepRef.current]) { s.stepT = 0; setLive(false); setStep(x => (x + 1) % N) }
      }
      if (vis && barRef.current) barRef.current.style.transform = 'scaleX(' + Math.min(1, s.stepT / DUR[stepRef.current]).toFixed(4) + ')'
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); st.kill() }
  }, [reduced])

  // Word-by-word rise on every quote change (before paint, so the new words never flash in place first).
  useLayoutEffect(() => {
    const words = quoteRef.current?.querySelectorAll('[data-w]'); if (!words || reduced) return
    const tw = gsap.fromTo(words, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .9, ease: 'expo.out', stagger: .03 })
    return () => { tw.kill() }
  }, [step, reduced])

  const go = (d: number) => { t.current.stepT = 0; setLive(true); setStep(x => (x + d + N) % N) }
  const [quote, who, project] = TESTIMONIALS[step]
  // Long quotes set smaller and wider so every one fits on a screen.
  const w = WORDS[step]
  const size = w > 60 ? 'font-size:clamp(20px,2.1vw,34px);line-height:1.25;max-width:52ch' : w > 30 ? 'font-size:clamp(24px,2.9vw,46px);line-height:1.15;max-width:34ch' : 'font-size:clamp(34px,4.6vw,72px);line-height:1.04;max-width:22ch'

  return (
    <section id="testimonials" ref={secRef} data-screen-label="Testimonials" style={css('background:#E8E8E2;color:#0A0A0A;padding:clamp(96px,14vh,160px) clamp(20px,5vw,72px)')}>
      <div onMouseEnter={() => { t.current.hover = true }} onMouseLeave={() => { t.current.hover = false }} onFocus={() => { t.current.focus = true }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) t.current.focus = false }} style={css('max-width:1440px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(40px,7vh,72px)')}>
        <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:24px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid #0A0A0A')}>
          <span style={css(CAPS)}>Client words</span>
          <span style={css(CAPS + ';color:#5B6B42;font-variant-numeric:tabular-nums')}>{String(step + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
        </div>
        <div aria-live={live ? 'polite' : 'off'} style={css('display:flex;flex-direction:column;gap:clamp(28px,4vh,44px);min-height:clamp(260px,34vw,420px)')}>
          <span aria-hidden="true" style={css("font-family:'Cormorant Garamond',serif;font-size:clamp(80px,9vw,140px);line-height:.5;color:#7A8C5E;height:.4em")}>“</span>
          <blockquote ref={quoteRef} key={step} style={css("margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;letter-spacing:-.01em;" + size)}>
            {quote.split(' ').map((w, i) => (
              <span key={i} style={css('display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em')}><span data-w style={css('display:inline-block')}>{w}</span>&nbsp;</span>
            ))}
          </blockquote>
          <p style={css('margin:0;display:flex;flex-wrap:wrap;gap:8px 16px;align-items:baseline')}>
            <span style={css(CAPS)}>{who}</span>
            {project && <span style={css(CAPS + ';color:#3B2F20')}>{project}</span>}
          </p>
        </div>
        <div style={css('display:flex;align-items:center;gap:24px')}>
          <button type="button" className="hv-dark" aria-label="Previous testimonial" onClick={() => go(-1)} style={css(ROUND)}>←</button>
          <button type="button" className="hv-dark" aria-label="Next testimonial" onClick={() => go(1)} style={css(ROUND)}>→</button>
          <span style={css('position:relative;flex:1;height:1px;background:rgba(10,10,10,.2);overflow:hidden')}>
            <span ref={barRef} style={css('position:absolute;inset:0;background:#0A0A0A;transform-origin:left;transform:scaleX(0)')}></span>
          </span>
        </div>
      </div>
    </section>
  )
}
