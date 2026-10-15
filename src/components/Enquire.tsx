import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { css } from '@/lib/css'
import { PROJECT_TYPES } from '@/data/content'
import ImageSlot from '@/components/ImageSlot'

const LABEL = 'font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:rgba(245,244,240,.6)'
const FIELD = 'height:52px;background:transparent;border:0;border-bottom:1px solid rgba(245,244,240,.35);color:#F5F4F0;font-size:16px;outline:none;border-radius:0'
const AREA = 'background:transparent;border:0;border-bottom:1px solid rgba(245,244,240,.35);color:#F5F4F0;font-size:16px;line-height:1.6;outline:none;resize:vertical;padding:12px 0;border-radius:0'
const BUDGETS = ['Less than ₹10 lakhs', '₹10 – 25 lakhs', '₹25 – 50 lakhs', '₹50 lakhs – ₹1 crore', 'Above ₹1 crore']
const TIMEFRAMES = ['Within 1 month', '1 – 3 months', '3 – 6 months', '6 months or more']

function Field({ label, req, children }: { label: string; req?: boolean; children: ReactNode }) {
  return <label style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>{label}{req && <span aria-hidden="true" style={css('color:#7A8C5E')}> *</span>}</span>{children}</label>
}
function Select({ name, options }: { name: string; options: readonly string[] }) {
  return <select name={name} required defaultValue={options[0]} className="fc-line" style={css(FIELD + ';cursor:pointer;color-scheme:dark')}>{options.map(o => <option key={o} style={css('background:#0A0A0A')}>{o}</option>)}</select>
}

export default function Enquire() {
  const [sent, setSent] = useState(false)
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
            <div style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>Where we work</span><span style={css("font-family:'Cormorant Garamond',serif;font-size:26px;text-wrap:balance")}>Telangana · Andhra Pradesh · Tamil Nadu · Karnataka · Maharashtra</span></div>
          </div>
        </div>
      </div>
      <div style={css('padding:clamp(48px,8vh,96px) clamp(20px,5vw,72px);display:flex;flex-direction:column;justify-content:center;gap:40px')}>
        <p style={css('margin:0;font-size:17px;line-height:1.7;font-weight:300;max-width:40ch;color:rgba(245,244,240,.8)')}>Tell us about the site and what you imagine. A principal will respond within two working days.</p>
        {!sent ? (
          <form onSubmit={submit} style={css('display:flex;flex-direction:column;gap:28px')}>
            <Field label="Name"><input name="name" autoComplete="name" placeholder="Name" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Phone" req><input name="phone" autoComplete="tel" type="tel" required className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Email" req><input name="email" autoComplete="email" type="email" required placeholder="Email" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Location"><input name="location" autoComplete="address-level2" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Type of project" req><Select name="type" options={PROJECT_TYPES} /></Field>
            <Field label="Estimated budget" req><Select name="budget" options={BUDGETS} /></Field>
            <Field label="Message"><textarea name="message" rows={3} placeholder="Message" className="fc-line" style={css(AREA)}></textarea></Field>
            <Field label="Preferred timeframe" req><Select name="timeframe" options={TIMEFRAMES} /></Field>
            <Field label="Additional comments or specific requests"><textarea name="requests" rows={3} className="fc-line" style={css(AREA)}></textarea></Field>
            <button type="submit" className="hv-olive" style={css('align-self:flex-start;display:flex;align-items:center;gap:16px;height:56px;padding:0 12px 0 32px;border-radius:999px;background:#F5F4F0;color:#0A0A0A;border:0;font-size:12px;letter-spacing:.3em;text-transform:uppercase;cursor:pointer;transition:background .3s,color .3s')}>Send enquiry<span style={css('display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#0A0A0A;color:#F5F4F0;font-size:15px;letter-spacing:0')}>→</span></button>
          </form>
        ) : (
          <div style={css('display:flex;flex-direction:column;gap:20px;border-top:1px solid rgba(245,244,240,.25);padding-top:32px')}>
            <span style={css('font-size:11px;letter-spacing:.34em;text-transform:uppercase;color:#7A8C5E')}>Enquiry received</span>
            <span style={css("font-family:'Cormorant Garamond',serif;font-size:clamp(32px,3.4vw,48px);line-height:1.05")}>Thank you. We'll be in touch within two working days.</span>
            <button onClick={() => { setSent(false) }} style={css('align-self:flex-start;background:transparent;border:0;border-bottom:1px solid currentColor;color:#F5F4F0;padding:4px 0;font-size:11px;letter-spacing:.3em;text-transform:uppercase;cursor:pointer')}>Send another</button>
          </div>
        )}
      </div>
    </section>
  )
}
