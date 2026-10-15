import { css } from '@/lib/css'

const ITEM = "font-family:'Cormorant Garamond',serif;font-size:56px;line-height:1.1"

export default function MobileMenu({ onClose }: { onClose: () => void }) {
  return (
    <div style={css('position:fixed;inset:0;z-index:99;background:#0A0A0A;color:#F5F4F0;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:96px 24px 40px;overflow-y:auto;overscroll-behavior:contain')}>
      <a href="#services" onClick={onClose} style={css(ITEM)}>Services</a>
      <a href="#projects" onClick={onClose} style={css(ITEM)}>Projects</a>
      <a href="#studio" onClick={onClose} style={css(ITEM)}>About</a>
      <a href="#enquire" onClick={onClose} style={css(ITEM + ';font-style:italic;color:#7A8C5E')}>Enquire</a>
    </div>
  )
}
