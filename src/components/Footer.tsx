import { useEffect, useRef, useState } from 'react'
import { css } from '@/lib/css'
import { ScrollTrigger } from '@/lib/gsap'

const CAPS6 = 'font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:rgba(245,244,240,.6)'
const LIST = "font-family:'Cormorant Garamond',serif;font-size:24px;display:flex;flex-direction:column;gap:6px"
const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

export default function Footer({ reduced, finePointer }: { reduced: boolean; finePointer: boolean }) {
  const [now, setNow] = useState(Date.now())
  const [ctaHover, setCtaHover] = useState(false)
  const [copied, setCopied] = useState(false)
  const ringRef = useRef<SVGCircleElement>(null)
  const lettersRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLAnchorElement>(null)
  const copyTo = useRef(0)
  const footRef = useRef<HTMLElement>(null)
  // The live clock re-renders every second and the 'open' dot pulses forever: run both only while the footer is on screen.
  const [onScreen, setOnScreen] = useState(false)
  useEffect(() => {
    const el = footRef.current; if (!el || !('IntersectionObserver' in window)) { setOnScreen(true); return }
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => () => clearTimeout(copyTo.current), [])
  useEffect(() => {
    if (!onScreen) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [onScreen])

  // "Back to top" ring = whole-page scroll progress.
  useEffect(() => {
    const paint = (p: number) => { if (ringRef.current) ringRef.current.style.strokeDashoffset = String(295.3 * (1 - p)) }
    const st = ScrollTrigger.create({ start: 0, end: () => ScrollTrigger.maxScroll(window), onUpdate: s => paint(s.progress), onRefresh: s => paint(s.progress) })
    return () => st.kill()
  }, [])

  // Touch devices: no hover, so play the letter wave / CTA state when they scroll into view.
  useEffect(() => {
    if (finePointer || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.target === lettersRef.current && e.isIntersecting && !reduced)
        [...e.target.children].forEach((l, i) => l.animate([{ transform: 'translateY(0)', color: 'inherit' }, { transform: 'translateY(-14%)', color: '#7A8C5E' }, { transform: 'translateY(0)', color: 'inherit' }], { duration: 900, delay: i * 55, easing: 'cubic-bezier(.22,1,.36,1)' }))
      if (e.target === ctaRef.current) setCtaHover(e.isIntersecting)
    }), { threshold: .6 })
    const t = setTimeout(() => { if (lettersRef.current) io.observe(lettersRef.current); if (ctaRef.current) io.observe(ctaRef.current) }, 500)
    return () => { clearTimeout(t); io.disconnect() }
  }, [finePointer, reduced])

  const parts: Record<string, string> = {}
  fmt.formatToParts(new Date(now)).forEach(p => { parts[p.type] = p.value })
  const hr = +parts.hour % 24, isOpen = parts.weekday !== 'Sun' && hr >= 9 && hr < 19

  const copyEmail = () => {
    navigator.clipboard?.writeText('hello@uniquescapes.in').catch(() => {})
    clearTimeout(copyTo.current); setCopied(true)
    copyTo.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <footer ref={footRef} data-screen-label="Footer" style={css('background:#0A0A0A;color:#F5F4F0;padding:clamp(72px,12vh,128px) clamp(20px,5vw,72px) 28px;overflow:hidden;border-top:1px solid rgba(245,244,240,.15)')}>
      <div style={css('max-width:1440px;margin:0 auto;display:flex;flex-direction:column;gap:clamp(56px,9vh,96px)')}>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));gap:48px clamp(32px,5vw,80px);align-items:end')}>
          <div style={css('display:flex;flex-direction:column;gap:20px')}>
            <span style={css(CAPS6)}>Have a site in mind?</span>
            <a id="footer-cta" ref={ctaRef} href="#enquire" onMouseEnter={() => setCtaHover(true)} onMouseLeave={() => setCtaHover(false)} style={{ ...css("display:flex;align-items:center;gap:clamp(16px,2vw,32px);font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(60px,8.4vw,136px);line-height:.9;transition:color .4s ease"), color: ctaHover ? '#7A8C5E' : '#F5F4F0' }}>
              <span>Let's <em style={css('font-weight:400')}>talk.</em></span>
              <span style={{ ...css("display:flex;align-items:center;justify-content:center;flex:none;width:clamp(56px,6vw,96px);height:clamp(56px,6vw,96px);border-radius:50%;color:#0A0A0A;font-family:'DM Sans',sans-serif;font-size:clamp(20px,2vw,30px);transition:transform .6s cubic-bezier(.22,1,.36,1),background .4s ease"), background: ctaHover ? '#7A8C5E' : '#F5F4F0', transform: `rotate(${ctaHover ? '0deg' : '-45deg'})` }}>→</span>
            </a>
          </div>
          <div style={css('display:flex;flex-direction:column;gap:20px;padding:28px;border:1px solid rgba(245,244,240,.18);border-radius:4px')}>
            <div style={css('display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap')}>
              <span style={css('display:flex;align-items:center;gap:10px;font-size:11px;letter-spacing:.3em;text-transform:uppercase')}>
                <span style={{ position: 'relative', width: 8, height: 8, borderRadius: '50%', background: isOpen ? '#7A8C5E' : 'rgba(245,244,240,.4)', flex: 'none' }}>
                  {isOpen && !reduced && onScreen ? <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#7A8C5E', animation: 'uqPulse 2s ease-out infinite' }} /> : null}
                </span>
                {isOpen ? 'Studio open — replies today' : 'Studio closed — opens 9:00'}
              </span>
              <span style={css('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(245,244,240,.6)')}>India · IST</span>
            </div>
            <span style={css('font-weight:300;font-size:clamp(44px,4.4vw,64px);line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.01em')}>{parts.hour + ':' + parts.minute + ':' + parts.second}</span>
            <button type="button" className="hv-olive-ink" onClick={copyEmail} style={css('display:flex;justify-content:space-between;align-items:center;gap:16px;width:100%;padding:16px 0 0;background:transparent;border:0;border-top:1px solid rgba(245,244,240,.18);color:#F5F4F0;cursor:pointer;text-align:left')}>
              <span style={css("font-family:'Cormorant Garamond',serif;font-size:24px")}>hello@uniquescapes.in</span>
              <span style={{ ...css('font-size:11px;letter-spacing:.3em;text-transform:uppercase'), color: copied ? '#7A8C5E' : 'rgba(245,244,240,.6)' }}>{copied ? 'Copied ✓' : 'Copy'}</span>
            </button>
          </div>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,160px),1fr));gap:36px 24px;padding-top:40px;border-top:1px solid rgba(245,244,240,.18)')}>
          <div style={css('display:flex;flex-direction:column;gap:14px')}><span style={css(CAPS6)}>Navigate</span><div style={css(LIST)}><a href="#services">Services</a><a href="#projects">Projects</a><a href="#studio">About</a><a href="#enquire">Enquire</a></div></div>
          <div style={css('display:flex;flex-direction:column;gap:14px')}><span style={css(CAPS6)}>Studios</span><div style={css(LIST)}><span>Mumbai</span><span>Pune</span><span>Goa</span></div></div>
          <div style={css('display:flex;flex-direction:column;gap:14px')}><span style={css(CAPS6)}>Follow</span><div style={css(LIST)}><a href="#">Instagram</a><a href="#">LinkedIn</a></div></div>
          <div style={css('display:flex;align-items:flex-start')}>
            <a href="#top" aria-label="Back to top" className="hv-pill" style={css('position:relative;display:flex;align-items:center;justify-content:center;width:96px;height:96px;border-radius:50%;font-size:10px;letter-spacing:.3em;text-transform:uppercase;text-align:center;line-height:1.4;transition:background .3s,color .3s')}>
              <svg viewBox="0 0 96 96" width="96" height="96" style={css('position:absolute;inset:0;transform:rotate(-90deg);pointer-events:none')}><circle cx="48" cy="48" r="47" fill="none" stroke="rgba(245,244,240,.2)" strokeWidth="1"></circle><circle ref={ringRef} cx="48" cy="48" r="47" fill="none" stroke="#7A8C5E" strokeWidth="2" strokeDasharray="295.3" strokeDashoffset="295.3"></circle></svg>
              <span>↑<br />Top</span>
            </a>
          </div>
        </div>
        <div style={css('display:flex;flex-direction:column;gap:20px')}>
          <div ref={lettersRef} aria-label="Uniquescapes" style={css("display:flex;justify-content:space-between;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(40px,11.2vw,176px);line-height:.85;text-transform:uppercase;white-space:nowrap")}>
            {'Uniquescapes'.split('').map((l, i) => <span key={i} aria-hidden="true" className="hv-letter" style={css('display:inline-block;transition:transform .6s cubic-bezier(.22,1,.36,1),color .4s ease')}>{l}</span>)}
          </div>
          <div style={css('display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;padding-top:20px;border-top:1px solid rgba(245,244,240,.18);font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:rgba(245,244,240,.6)')}>
            <span>© 2026 Uniquescapes Infra</span><span>Landscape · Pools · Resorts · Construction</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
