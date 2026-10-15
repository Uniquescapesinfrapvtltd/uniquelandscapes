import { Fragment, useEffect, useLayoutEffect, useRef } from 'react'
import { css } from '@/lib/css'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { STATEMENT } from '@/data/content'

const WORD = 'opacity:.16;transition:opacity .25s linear'
// [value, suffix, label] — years since est. 2019.
const STATS: [number, string, string][] = [[35, '+', 'Projects delivered'], [__BUILD_YEAR__ - 2019, '+', 'Years of practice'], [5, '', 'States']]

export default function Statement({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const statsRef = useRef<HTMLDListElement>(null)

  useEffect(() => {
    const sec = ref.current; if (!sec) return
    const ws = [...sec.querySelectorAll<HTMLElement>('[data-stmt-w]')], n = ws.length
    const paint = (p: number) => ws.forEach((el, k) => { el.style.opacity = Math.min(1, Math.max(.16, (p * n * 1.1 - k) / 2 + .16)).toFixed(3) })
    if (reduced) { paint(1); return }
    // Same mapping as the original: p = (0.8·vh − top) / (0.6·height)
    const st = ScrollTrigger.create({
      trigger: sec, start: 'top 80%', end: () => '+=' + sec.offsetHeight * .6,
      onUpdate: self => paint(self.progress), onRefresh: self => paint(self.progress),
    })
    return () => st.kill()
  }, [reduced])

  // Markup holds the final figures (no-JS, crawlers, print); when motion is allowed they reset to 0 and count up the first time the row scrolls into view.
  useLayoutEffect(() => {
    const row = statsRef.current; if (!row || reduced) return
    const els = [...row.querySelectorAll<HTMLElement>('[data-count]')]
    const show = (k: number) => els.forEach(el => { el.textContent = String(Math.round(Number(el.dataset.count) * k)) })
    show(0)
    const v = { k: 0 }
    let tw: gsap.core.Tween | undefined
    const st = ScrollTrigger.create({ trigger: row, start: 'top 85%', once: true, onEnter: () => { tw = gsap.to(v, { k: 1, duration: 1.8, ease: 'power3.out', onUpdate: () => show(v.k) }) } })
    return () => { st.kill(); tw?.kill(); show(1) }
  }, [reduced])

  return (
    <section ref={ref} data-screen-label="Statement" style={css('background:#F5F4F0;color:#0A0A0A;padding:clamp(120px,20vh,220px) clamp(20px,5vw,72px)')}>
      <div style={css('max-width:1280px;margin:0 auto;display:flex;flex-direction:column;align-items:center;text-align:center;gap:clamp(40px,7vh,72px)')}>
        <div style={css('display:flex;align-items:center;gap:16px;font-size:11px;letter-spacing:.34em;text-transform:uppercase')}>
          <span style={css('flex:none;width:32px;height:1px;background:#0A0A0A')}></span><span style={css('flex:none;white-space:nowrap')}>Uniquescapes Infra</span><span style={css('flex:none;width:32px;height:1px;background:#0A0A0A')}></span>
        </div>
        <p style={css("margin:0;max-width:26ch;font-family:'Cormorant Garamond',serif;font-weight:400;font-size:clamp(32px,4.4vw,76px);line-height:1.04;letter-spacing:-.01em;text-wrap:balance")}>
          {STATEMENT.map((w, i) => <Fragment key={i}><span data-stmt-w={i} style={css(WORD)}>{w}</span>{' '}</Fragment>)}
          <em data-stmt-w={STATEMENT.length} style={css(WORD + ';color:#5B6B42')}>spaces.</em>
        </p>
        <dl ref={statsRef} style={css('margin:0;display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(28px,6vw,96px)')}>
          {STATS.map(([n, suf, label]) => (
            <div key={label} style={css('display:flex;flex-direction:column-reverse;align-items:center;gap:10px;min-width:7ch')}>
              <dt style={css('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#3A3A36')}>{label}</dt>
              <dd style={css("margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(56px,6vw,96px);line-height:1;font-variant-numeric:tabular-nums;color:#0A0A0A")}><span className="sr-only">{n + suf}</span><span data-count={n} aria-hidden="true">{n}</span><span aria-hidden="true" style={css('color:#5B6B42')}>{suf}</span></dd>
            </div>
          ))}
        </dl>
        <div style={css('display:flex;flex-direction:column;align-items:center;gap:14px;font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:#3A3A36')}>
          <span style={css('max-width:42ch;line-height:2;text-wrap:balance')}>Telangana · Andhra Pradesh · Tamil Nadu · Karnataka · Maharashtra</span>
          <span style={css('width:1px;height:56px;background:linear-gradient(#0A0A0A,rgba(10,10,10,0))')}></span>
        </div>
      </div>
    </section>
  )
}
