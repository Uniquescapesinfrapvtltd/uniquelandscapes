import { useState } from 'react'
import type { FormEvent } from 'react'
import { css } from '@/lib/css'
import { PROJECT_TYPES } from '@/data/content'
import ImageSlot from '@/components/ImageSlot'

const LABEL = 'font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:rgba(245,244,240,.6)'
const FIELD = 'height:52px;background:transparent;border:0;border-bottom:1px solid rgba(245,244,240,.35);color:#F5F4F0;font-size:16px;outline:none;border-radius:0'

export default function Enquire() {
  const [types, setTypes] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const toggle = (label: string) => setTypes(t => (t.includes(label) ? t.filter(x => x !== label) : [...t, label]))
  // The original design has no backend — submit only flips to the thank-you state.
  const submit = (e: FormEvent) => { e.preventDefault(); setSent(true) }

  return (
    <section id="enquire" data-screen-label="Enquire" style={css('background:#0A0A0A;color:#F5F4F0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))')}>
      <div style={css('position:relative;min-height:clamp(420px,70vh,820px);overflow:hidden;background:#1a1a1a')}>
        <ImageSlot id="enquire-image" placeholder="Finished garden at dusk" />
        <div style={css('position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(10,10,10,.85),rgba(10,10,10,0) 60%)')}></div>
        <div style={css('position:absolute;left:clamp(20px,4vw,56px);right:clamp(20px,4vw,56px);bottom:clamp(28px,5vh,56px);display:flex;flex-direction:column;gap:28px;pointer-events:none')}>
          <h2 style={css("margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(60px,7.6vw,128px);line-height:.88")}>Begin a <em style={css('font-weight:400')}>project.</em></h2>
          <div style={css('display:flex;flex-wrap:wrap;gap:12px 40px;pointer-events:auto')}>
            <div style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>Write</span><a href="mailto:hello@uniquescapes.in" style={css("font-family:'Cormorant Garamond',serif;font-size:26px")}>hello@uniquescapes.in</a></div>
            <div style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>Studios</span><span style={css("font-family:'Cormorant Garamond',serif;font-size:26px")}>Mumbai · Pune · Goa</span></div>
          </div>
        </div>
      </div>
      <div style={css('padding:clamp(48px,8vh,96px) clamp(20px,5vw,72px);display:flex;flex-direction:column;justify-content:center;gap:40px')}>
        <p style={css('margin:0;font-size:17px;line-height:1.7;font-weight:300;max-width:40ch;color:rgba(245,244,240,.8)')}>Tell us about the site and what you imagine. A principal will respond within two working days.</p>
        {!sent ? (
          <form onSubmit={submit} style={css('display:flex;flex-direction:column;gap:44px')}>
            <div style={css('display:flex;flex-direction:column;gap:18px')}>
              <span style={css(LABEL)}><span style={css('color:#7A8C5E')}>01</span> — Project type</span>
              <div style={css('display:flex;flex-wrap:wrap;gap:10px')}>
                {PROJECT_TYPES.map(label => {
                  const on = types.includes(label)
                  return <button key={label} type="button" aria-pressed={on} onClick={() => toggle(label)} style={{ ...css('height:40px;padding:0 18px;border-radius:999px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;transition:background .3s,color .3s,border-color .3s'), border: `1px solid ${on ? '#F5F4F0' : 'rgba(245,244,240,.35)'}`, background: on ? '#F5F4F0' : 'transparent', color: on ? '#0A0A0A' : '#F5F4F0' }}>{label}</button>
                })}
              </div>
            </div>
            <div style={css('display:flex;flex-direction:column;gap:8px')}>
              <span style={css(LABEL)}><span style={css('color:#7A8C5E')}>02</span> — About you</span>
              <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));gap:12px 32px')}>
                <input name="name" autoComplete="name" required placeholder="Full name" aria-label="Full name" className="fc-line" style={css(FIELD)} />
                <input name="email" autoComplete="email" required type="email" placeholder="Email" aria-label="Email" className="fc-line" style={css(FIELD)} />
                <input name="phone" autoComplete="tel" type="tel" placeholder="Phone" aria-label="Phone" className="fc-line" style={css(FIELD)} />
                <input name="location" autoComplete="address-level2" placeholder="Site location" aria-label="Site location" className="fc-line" style={css(FIELD)} />
              </div>
            </div>
            <div style={css('display:flex;flex-direction:column;gap:8px')}>
              <span style={css(LABEL)}><span style={css('color:#7A8C5E')}>03</span> — The project</span>
              <textarea name="message" rows={3} placeholder="Tell us about your project" aria-label="Tell us about your project" className="fc-line" style={css('background:transparent;border:0;border-bottom:1px solid rgba(245,244,240,.35);color:#F5F4F0;font-size:16px;line-height:1.6;outline:none;resize:vertical;padding:12px 0;border-radius:0')}></textarea>
            </div>
            <button type="submit" className="hv-olive" style={css('align-self:flex-start;display:flex;align-items:center;gap:16px;height:56px;padding:0 12px 0 32px;border-radius:999px;background:#F5F4F0;color:#0A0A0A;border:0;font-size:12px;letter-spacing:.3em;text-transform:uppercase;cursor:pointer;transition:background .3s,color .3s')}>Send enquiry<span style={css('display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#0A0A0A;color:#F5F4F0;font-size:15px;letter-spacing:0')}>→</span></button>
          </form>
        ) : (
          <div style={css('display:flex;flex-direction:column;gap:20px;border-top:1px solid rgba(245,244,240,.25);padding-top:32px')}>
            <span style={css('font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:#7A8C5E')}>Enquiry received</span>
            <span style={css("font-family:'Cormorant Garamond',serif;font-size:clamp(32px,3.4vw,48px);line-height:1.05")}>Thank you. We'll be in touch within two working days.</span>
            <button onClick={() => { setSent(false); setTypes([]) }} style={css('align-self:flex-start;background:transparent;border:0;border-bottom:1px solid currentColor;color:#F5F4F0;padding:4px 0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;cursor:pointer')}>Send another</button>
          </div>
        )}
      </div>
    </section>
  )
}
