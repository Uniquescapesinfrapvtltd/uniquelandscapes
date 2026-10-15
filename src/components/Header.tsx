import { css } from '@/lib/css'

interface Props { loaded: boolean; isMobile: boolean; light: boolean; menuOpen: boolean; onToggleMenu: () => void }

const LINK = 'display:flex;align-items:center;height:32px;padding:0 18px;border-radius:999px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;transition:background .3s,color .3s'

export default function Header({ loaded, isMobile, light, menuOpen, onToggleMenu }: Props) {
  return (
    <header style={{
      ...css('position:fixed;top:0;left:0;right:0;z-index:100;height:76px;display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:0 var(--gutter);transition:background .5s ease,color .5s ease,border-color .5s ease,opacity .9s cubic-bezier(.22,1,.36,1) .3s,transform .9s cubic-bezier(.22,1,.36,1) .3s'),
      background: light ? 'rgba(245,244,240,.92)' : 'transparent',
      color: light ? '#0A0A0A' : '#F5F4F0',
      borderBottom: `1px solid ${light ? '#D5D3CC' : 'transparent'}`,
      opacity: loaded ? 1 : 0,
      transform: loaded ? 'translateY(0)' : 'translateY(-18px)',
    }}>
      {!isMobile && (
        <nav style={{ ...css('display:flex;align-items:center;height:42px;padding:4px;gap:2px;border-radius:999px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)'), border: `1px solid ${light ? '#D5D3CC' : 'rgba(245,244,240,.45)'}`, background: light ? 'transparent' : 'rgba(245,244,240,.1)' }}>
          <a href="#services" className="hv-pill" style={css(LINK)}>Services</a>
          <a href="#projects" className="hv-pill" style={css(LINK)}>Projects</a>
          <a href="#studio" className="hv-pill" style={css(LINK)}>About</a>
        </nav>
      )}
      <a href="#enquire" className="hv-olive hdr-enquire" style={{ ...css('display:flex;align-items:center;height:42px;padding:0 22px;border-radius:999px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;transition:background .3s,color .3s'), background: light ? '#0A0A0A' : '#F5F4F0', color: light ? '#F5F4F0' : '#0A0A0A' }}>Enquire</a>
      {isMobile && (
        <button onClick={onToggleMenu} style={css('height:42px;padding:0 18px;border-radius:999px;background:transparent;border:1px solid currentColor;color:inherit;font-size:11px;letter-spacing:.24em;text-transform:uppercase;cursor:pointer')}>{menuOpen ? 'Close' : 'Menu'}</button>
      )}
    </header>
  )
}
