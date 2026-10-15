import { css } from '@/lib/css'

interface Props { loaded: boolean; isMobile: boolean; light: boolean }

export default function Logo({ loaded, isMobile, light }: Props) {
  return (
    <a href="#top" className="logo-link" aria-label="Unique Scapes Infra — home" style={{
      ...css('position:fixed;z-index:210;transform-origin:left center;display:flex;align-items:center;gap:12px;line-height:1;transition:left 2s cubic-bezier(.16,1,.3,1),top 2s cubic-bezier(.16,1,.3,1),transform 2s cubic-bezier(.16,1,.3,1),color .5s ease;white-space:nowrap'),
      left: loaded ? 'var(--gutter)' : '50%',
      top: loaded ? '38px' : '50%',
      transform: loaded ? 'translate(0,-50%) scale(1)' : (isMobile ? 'translate(-50%,-50%) scale(1.5) translateX(-17%)' : 'translate(-50%,-50%) scale(2.2) translateX(-27%)'),
      color: light ? '#0A0A0A' : '#F5F4F0',
    }}>
      <img className="logo-mark" src="/assets/brand/logo-mark.png" alt="" width={38} height={38} style={css('display:block;width:38px;height:38px;flex:none')} />
      <span style={css('display:flex;flex-direction:column;gap:3px')}>
        <span className="logo-word" style={css("font-family:'Cormorant Garamond',serif;font-weight:600;font-size:22px;letter-spacing:.18em;text-transform:uppercase")}>Uniquescapes</span>
        <span style={css('font-size:9px;letter-spacing:.42em;text-transform:uppercase;opacity:.75')}>Infra</span>
      </span>
    </a>
  )
}
