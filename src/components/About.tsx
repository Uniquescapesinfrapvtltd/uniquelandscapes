import { useEffect, useRef, useState } from 'react'
import { css } from '@/lib/css'
import { gsap, ScrollTrigger } from '@/lib/gsap'
import { STEPS } from '@/data/content'
import ImageSlot from '@/components/ImageSlot'

const STEP_MS = 6000
const H3 = "margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(36px,4.2vw,64px);line-height:.95"
const CAPS = 'font-size:11px;letter-spacing:.34em;text-transform:uppercase'

export default function About({ reduced }: { reduced: boolean }) {
  const [step, setStep] = useState(0)
  const secRef = useRef<HTMLElement>(null)
  const t = useRef({ stepT: 0, paused: false, step: 0 })
  t.current.step = step

  // Founder auto-advance: time-based, runs only while the section is in the middle of the viewport.
  useEffect(() => {
    const sec = secRef.current; if (!sec) return
    const bars = [...sec.querySelectorAll<HTMLElement>('[data-step-bar]')]
    let vis = false
    const st = ScrollTrigger.create({ trigger: sec, start: 'top 60%', end: 'bottom 40%', onToggle: self => { vis = self.isActive } })
    const tick = (_: number, dt: number) => {
      const s = t.current
      if (vis && !s.paused && !reduced) {
        s.stepT += Math.min(100, dt)
        if (s.stepT >= STEP_MS) { s.stepT = 0; setStep(x => (x + 1) % STEPS.length) }
      }
      bars.forEach((el, i) => { el.style.transform = 'scaleX(' + (i === s.step ? Math.min(1, s.stepT / STEP_MS) : 0).toFixed(4) + ')' })
    }
    gsap.ticker.add(tick)
    return () => { gsap.ticker.remove(tick); st.kill() }
  }, [reduced])

  const select = (i: number) => { t.current.stepT = 0; setStep(i) }

  return (
    <section id="studio" ref={secRef} data-screen-label="About" style={css('background:#F5F4F0;color:#0A0A0A;padding:clamp(96px,14vh,160px) clamp(20px,5vw,72px) clamp(80px,12vh,140px)')}>
      <div style={css('max-width:1440px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(56px,9vh,104px)')}>
        <div style={css('display:flex;flex-direction:column;gap:clamp(32px,5vh,56px)')}>
          <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:24px;flex-wrap:wrap;padding-bottom:24px;border-bottom:1px solid #0A0A0A')}>
            <span style={css(CAPS)}>About us</span>
            <span style={css(CAPS + ';color:#5B6B42')}>Uniquescapes Infra</span>
          </div>
          <h2 style={css("margin:0;max-width:18ch;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(48px,6.4vw,104px);line-height:.92;letter-spacing:-.01em;text-wrap:balance")}>Built by Brothers. Driven by Vision. <em style={css('font-weight:400;color:#5B6B42')}>Designed to Inspire.</em></h2>
          <p style={css('margin:0;font-size:clamp(18px,1.5vw,21px);line-height:1.65;font-weight:300;color:#3A3A36;max-width:52ch;text-wrap:pretty')}>Every extraordinary place begins with a vision. Ours began with two brothers who wanted to create spaces people don’t just visit, but truly feel — resorts, farmhouses and landscapes that tell a story and stay with you long after you leave.</p>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:28px')}>
          <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:24px;flex-wrap:wrap')}>
            <h3 style={css(H3)}>The <em style={css('font-weight:400;color:#5B6B42')}>founders.</em></h3>
            <span style={css(CAPS + ';color:#3A3A36')}>Select a founder</span>
          </div>
          <p style={css('margin:0;font-size:17px;line-height:1.7;font-weight:300;color:#3A3A36;max-width:58ch;text-wrap:pretty')}>As brothers and partners, they lead every project personally — from the first sketch to the final stone. Design, civil works, landscaping, pools and fabrication all happen under one roof, guided by trust, a sharp eye for detail and honest conversation with every client.</p>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:clamp(32px,5vw,88px);align-items:start')}>
            <div className="founder-portrait" style={css('position:relative;aspect-ratio:4/5;width:100%;overflow:hidden;background:#E8E8E2')}>
              {STEPS.map((s, i) => {
                const on = i === step
                return (
                  <div key={i} style={{ ...css('position:absolute;inset:0;transition:opacity .9s cubic-bezier(.22,1,.36,1),transform 1.4s cubic-bezier(.16,1,.3,1)'), opacity: on ? 1 : 0, transform: `scale(${on ? 1 : 1.06})`, zIndex: on ? 2 : 1, pointerEvents: on ? 'auto' : 'none' }}>
                    <ImageSlot id={'founder-' + (i + 1)} placeholder={s[3]} />
                  </div>
                )
              })}
              <div style={css('position:absolute;left:20px;bottom:20px;z-index:5;pointer-events:none;display:flex;align-items:center;gap:12px;padding:10px 16px;border-radius:999px;background:#0A0A0A;color:#F5F4F0;font-size:11px;letter-spacing:.3em;text-transform:uppercase')}>
                {String(step + 1).padStart(2, '0') + ' / 0' + STEPS.length + ' — ' + STEPS[step][4].split(' · ')[0]}
              </div>
            </div>
            <div onMouseEnter={() => { t.current.paused = true }} onMouseLeave={() => { t.current.paused = false }} style={css('display:flex;flex-direction:column;border-bottom:1px solid #0A0A0A')}>
              {STEPS.map(([title, body, items, , role, quote], i) => {
                const on = i === step
                return (
                  <button key={i} type="button" className="hv-opaque" onClick={() => select(i)} aria-expanded={on} style={{ ...css('position:relative;display:flex;flex-direction:column;text-align:left;width:100%;background:transparent;border:0;border-top:1px solid #0A0A0A;padding:28px 0;color:#0A0A0A;cursor:pointer;transition:opacity .4s ease'), opacity: on ? 1 : .5 }}>
                    <span style={css('display:flex;align-items:center;gap:24px;width:100%')}>
                      <span style={css('font-size:12px;letter-spacing:.24em;color:#5B6B42;min-width:28px')}>{String(i + 1).padStart(2, '0')}</span>
                      <span style={css('flex:1;display:flex;flex-direction:column;gap:8px')}>
                        <span style={{ ...css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(36px,3.8vw,60px);line-height:.95"), fontStyle: on ? 'italic' : 'normal' }}>{title}</span>
                        <span style={css('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#3A3A36')}>{role}</span>
                      </span>
                      <span style={{ ...css('display:flex;align-items:center;justify-content:center;flex:none;width:40px;height:40px;border-radius:50%;border:1px solid #0A0A0A;font-size:18px;line-height:1;transition:transform .5s cubic-bezier(.22,1,.36,1),background .3s,color .3s'), background: on ? '#0A0A0A' : 'transparent', color: on ? '#F5F4F0' : '#0A0A0A', transform: `rotate(${on ? '45deg' : '0deg'})` }}>+</span>
                    </span>
                    <span style={{ ...css('display:grid;transition:grid-template-rows .6s cubic-bezier(.22,1,.36,1)'), gridTemplateRows: on ? '1fr' : '0fr' }}>
                      <span style={css('min-height:0;overflow:hidden;display:flex;flex-direction:column;gap:20px;padding-left:52px')}>
                        <span style={css("padding-top:20px;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:clamp(22px,2vw,28px);line-height:1.3;max-width:30ch")}>“{quote}”</span>
                        <span style={css('font-size:16px;line-height:1.65;font-weight:300;color:#3A3A36;max-width:44ch')}>{body}</span>
                        <span style={css('display:flex;flex-wrap:wrap;gap:8px')}>
                          {items.map(it => <span key={it} style={css('display:flex;align-items:center;height:32px;padding:0 14px;border-radius:999px;border:1px solid #C9C7BF;font-size:12px;letter-spacing:.06em;color:#3A3A36')}>{it}</span>)}
                        </span>
                      </span>
                    </span>
                    <span style={css('position:absolute;left:0;right:0;top:-1px;height:2px;overflow:hidden')}><span data-step-bar={i} style={css('display:block;height:100%;background:#7A8C5E;transform-origin:left;transform:scaleX(0)')}></span></span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        {/* Drawing and Built shown whole, side by side (portrait 2:3 photos): text beside them on wide screens, above them on narrow ones. */}
        <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:clamp(32px,5vw,72px)')}>
          <div style={css('flex:1 1 320px;display:flex;flex-direction:column;gap:24px')}>
            <h3 style={css(H3 + ';max-width:16ch;text-wrap:balance')}>Drawn, then built — <em style={css('font-weight:400;color:#5B6B42')}>line for line.</em></h3>
            <p style={css('margin:0;font-size:17px;line-height:1.7;font-weight:300;color:#3A3A36;max-width:40ch;text-wrap:pretty')}>A Buddha water wall, from our 3D render to the finished pavilion — lit at night, exactly where we drew it.</p>
          </div>
          <div style={css('display:flex;gap:clamp(12px,1.6vw,20px);width:min(100%,calc(72vh * 4 / 3 + 20px))')}>
            {([['studio-drawing', '/assets/studio/buddha-water-wall-render.jpg', 'Buddha water wall — 3D render', 'Drawing'], ['studio-built', '/assets/studio/buddha-water-wall-built.jpg', 'Buddha water wall — completed, at night', 'Built']] as const).map(([id, src, alt, tag]) => (
              <figure key={id} style={css('position:relative;flex:1;min-width:0;margin:0;aspect-ratio:2/3;overflow:hidden;background:#E8E8E2')}>
                <div className="hv-zoom" style={css('position:absolute;inset:0;transition:transform 1.2s cubic-bezier(.16,1,.3,1)')}><ImageSlot id={id} src={src} placeholder={alt} /></div>
                <figcaption style={css('position:absolute;left:clamp(10px,1.4vw,20px);top:clamp(10px,1.4vw,20px);z-index:2;pointer-events:none;padding:8px 14px;border-radius:999px;background:' + (tag === 'Built' ? '#F5F4F0;color:#0A0A0A' : '#0A0A0A;color:#F5F4F0') + ';font-size:11px;letter-spacing:.3em;text-transform:uppercase')}>{tag}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
