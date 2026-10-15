import { css } from '@/lib/css'

interface Props { id: string; placeholder: string; src?: string; eager?: boolean }

/** Read-only port of the design tool's <image-slot>: shows `src` when given,
 *  otherwise the same empty-state chrome (icon, caption, dashed ring). */
export default function ImageSlot({ id, placeholder, src, eager }: Props) {
  return (
    <div data-slot={id} style={css('display:block;position:relative;font:13px/1.3 system-ui,-apple-system,sans-serif;width:100%;height:100%;aspect-ratio:3/2')}>
      <div style={css('position:absolute;inset:0;overflow:hidden;background:rgba(127,127,127,.08)')}>
        {src ? (
          <img src={src} alt={placeholder} loading={eager ? 'eager' : 'lazy'} decoding="async" style={css('position:absolute;inset:0;width:100%;height:100%;object-fit:cover')} />
        ) : (
          <>
            <div style={css('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;padding:12px;box-sizing:border-box;user-select:none')}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: .45 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
              <div style={css('max-width:90%;font-weight:500;letter-spacing:.01em;opacity:.75')}>{placeholder}</div>
            </div>
            <div style={css('position:absolute;inset:0;pointer-events:none;border:1.5px dashed currentColor;opacity:.35')} />
          </>
        )}
      </div>
    </div>
  )
}
