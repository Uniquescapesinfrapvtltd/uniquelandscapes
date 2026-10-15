import { css } from '@/lib/css'
import { PROJECTS } from '@/data/content'
import ImageSlot from '@/components/ImageSlot'

export default function Projects({ isMobile: mob }: { isMobile: boolean }) {
  return (
    <section id="projects" data-screen-label="Selected projects" style={css('background:#E8E8E2;color:#0A0A0A;padding:clamp(96px,14vh,160px) clamp(20px,5vw,72px)')}>
      <div style={css('max-width:1440px;margin:0 auto')}>
        <div style={css('display:flex;justify-content:space-between;align-items:baseline;gap:24px;flex-wrap:wrap;padding-bottom:28px;border-bottom:1px solid #0A0A0A;margin-bottom:56px')}>
          <h2 style={css("margin:0;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(44px,6vw,96px);line-height:.95")}>Selected <em style={css('font-weight:400')}>projects</em></h2>
          <span style={css('font-size:11px;letter-spacing:.34em;text-transform:uppercase')}>2023 — 2025</span>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));column-gap:clamp(24px,4vw,64px);row-gap:72px')}>
          {PROJECTS.map(([name, type, place, year, aspect, photo], i) => (
            <a key={name} href="#enquire" style={{ ...css('display:flex;flex-direction:column;gap:18px;color:#0A0A0A'), marginTop: !mob && i % 2 === 1 ? '140px' : '0px' }}>
              <div style={{ ...css('position:relative;width:100%;overflow:hidden;background:#D5D3CC'), aspectRatio: mob && !photo ? '4/3' : aspect }}>
                <div className="hv-zoom" style={css('position:absolute;inset:0;transition:transform 1.2s cubic-bezier(.16,1,.3,1)')}><ImageSlot id={'proj-' + (i + 1)} placeholder={name + ' — hero photograph'} src={photo} /></div>
              </div>
              <div style={css('display:grid;grid-template-columns:1fr auto;gap:8px 24px;align-items:baseline')}>
                <span style={css("font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(28px,2.6vw,38px);line-height:1")}>{name}</span>
                <span style={css('font-size:11px;letter-spacing:.2em;font-variant-numeric:tabular-nums')}>{year}</span>
                <span style={css('font-size:11px;letter-spacing:.3em;text-transform:uppercase;color:#3B2F20')}>{[type, place].filter(Boolean).join(' · ')}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
