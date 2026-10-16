import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { css } from '@/lib/css'
import { PHONE, PROJECT_TYPES, TEL } from '@/data/content'
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
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  // FormSubmit relays the form to the inbox below; the very first submission sends that inbox a one-time activation link.
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    const data = Object.fromEntries(new FormData(e.currentTarget))
    try {
      const r = await fetch('https://formsubmit.co/ajax/info@uniquescapesinfra.com', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, _subject: 'New website enquiry', _replyto: data.email, _template: 'table', _captcha: 'false' }),
      })
      if (!r.ok) throw new Error(String(r.status))
      setSent(true); setStatus('idle')
    } catch { setStatus('error') }
  }

  return (
    <section id="enquire" data-screen-label="Enquire" style={css('background:#0A0A0A;color:#F5F4F0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr))')}>
      <div style={css('position:relative;min-height:clamp(600px,85vh,820px);overflow:hidden;background:#1a1a1a')}>
        <ImageSlot id="enquire-image" placeholder="Lit pool, dolphin fountain and timber cottage at dusk" src="/assets/enquire-pool-dusk.webp" />
        <div style={css('position:absolute;inset:0;pointer-events:none;background:linear-gradient(to top,rgba(10,10,10,.92),rgba(10,10,10,.6) 45%,rgba(10,10,10,0) 80%)')}></div>
        <div style={css('position:absolute;left:clamp(20px,4vw,56px);right:clamp(20px,4vw,56px);bottom:clamp(28px,5vh,56px);display:flex;flex-direction:column;gap:28px;pointer-events:none')}>
          <h2 style={css("margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(60px,7.6vw,128px);line-height:.88")}>Begin a <em style={css('font-weight:400')}>project.</em></h2>
          <div style={css('display:flex;flex-wrap:wrap;gap:12px 40px;pointer-events:auto')}>
            <div style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>Write</span><a href="mailto:info@uniquescapesinfra.com" style={css("font-family:'Cormorant Garamond',serif;font-size:26px")}>info@uniquescapesinfra.com</a></div>
            <div style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>Call</span><a href={TEL} style={css("font-family:'DM Sans',sans-serif;font-weight:300;font-size:22px;line-height:1.35;letter-spacing:.02em;font-variant-numeric:lining-nums tabular-nums;white-space:nowrap")}>{PHONE}</a></div>
            <div style={css('display:flex;flex-direction:column;gap:6px')}><span style={css(LABEL)}>Where we work</span><span style={css("font-family:'Cormorant Garamond',serif;font-size:26px;text-wrap:balance")}>{'Telangana\u00A0· Andhra\u00A0Pradesh\u00A0· Tamil\u00A0Nadu\u00A0· Karnataka\u00A0· Maharashtra'}</span></div>
          </div>
        </div>
      </div>
      <div style={css('padding:clamp(48px,8vh,96px) clamp(20px,5vw,72px);display:flex;flex-direction:column;justify-content:center;gap:40px')}>
        <p style={css('margin:0;font-size:17px;line-height:1.7;font-weight:300;max-width:40ch;color:rgba(245,244,240,.8)')}>Tell us about the site and what you imagine. A principal will respond within two working days.</p>
        {!sent ? (
          <form onSubmit={submit} style={css('display:flex;flex-direction:column;gap:28px')}>
            <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" style={css('display:none')} />
            <Field label="Name"><input name="name" autoComplete="name" placeholder="Name" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Phone" req><input name="phone" autoComplete="tel" type="tel" required className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Email" req><input name="email" autoComplete="email" type="email" required placeholder="Email" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Location"><input name="location" autoComplete="address-level2" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Land size (sq ft)"><input name="land" type="number" inputMode="numeric" min="0" placeholder="e.g. 5000" className="fc-line" style={css(FIELD)} /></Field>
            <Field label="Type of project" req><Select name="type" options={PROJECT_TYPES} /></Field>
            <Field label="Estimated budget" req><Select name="budget" options={BUDGETS} /></Field>
            <Field label="Message"><textarea name="message" rows={3} placeholder="Message" className="fc-line" style={css(AREA)}></textarea></Field>
            <Field label="Preferred timeframe" req><Select name="timeframe" options={TIMEFRAMES} /></Field>
            <Field label="Additional comments or specific requests"><textarea name="requests" rows={3} className="fc-line" style={css(AREA)}></textarea></Field>
            <button type="submit" className="hv-olive" disabled={status === 'sending'} style={css('align-self:flex-start;opacity:' + (status === 'sending' ? .6 : 1) + ';display:flex;align-items:center;gap:16px;height:56px;padding:0 12px 0 32px;border-radius:999px;background:#F5F4F0;color:#0A0A0A;border:0;font-size:12px;letter-spacing:.3em;text-transform:uppercase;cursor:pointer;transition:background .3s,color .3s')}>{status === 'sending' ? 'Sending…' : 'Send enquiry'}<span style={css('display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:#0A0A0A;color:#F5F4F0;font-size:15px;letter-spacing:0')}>→</span></button>
            {status === 'error' && <p role="alert" style={css('margin:0;font-size:14px;color:#E8A598')}>Couldn't send — please try again or write to info@uniquescapesinfra.com.</p>}
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
