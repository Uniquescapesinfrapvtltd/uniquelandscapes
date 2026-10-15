import { useEffect, useRef, useState } from 'react'
import { css } from '@/lib/css'
import { HERO_VIDEO, HERO_VIDEO_MOBILE, SCENES } from '@/data/content'
import { useVideoScroll } from '@/hooks/useVideoScroll'
import type { HeroMedia } from '@/lib/media'
import ImageSlot from '@/components/ImageSlot'

interface Props { media: HeroMedia; loaded: boolean; isMobile: boolean; reduced: boolean; preloader: boolean; scrollLength: number; onNavSolid: (solid: boolean) => void }

export default function Hero({ media, loaded, isMobile: mob, reduced, preloader, scrollLength, onNavSolid }: Props) {
  // Picked once at mount: swapping src on resize would re-download the clip and reset the scrub.
  const [videoSrc] = useState(() => (innerWidth < 860 ? HERO_VIDEO_MOBILE : HERO_VIDEO))
  const { heroRef, videoRef, barRef, scene, videoFailed } = useVideoScroll({ src: videoSrc, media, loaded, reduced, onNavSolid })
  const titleRef = useRef<HTMLDivElement>(null)
  const factsRef = useRef<HTMLDListElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Intro zoom that played while the preloader counted up.
  useEffect(() => {
    if (!preloader || reduced) return
    const kf = [{ transform: 'scale(1.14)' }, { transform: 'scale(1)' }]
    const opts: KeyframeAnimationOptions = { duration: 3800, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'both' }
    const anim = videoRef.current?.animate(kf, opts)
    return () => anim?.cancel()
  }, [preloader, reduced, videoRef])

  const animateScene = (first: boolean) => {
    const E = 'cubic-bezier(.16,1,.3,1)'
    titleRef.current?.animate([{ opacity: 0, filter: 'blur(12px)', transform: 'translateY(42px)' }, { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }], { duration: first ? 1050 : 900, easing: E, fill: 'backwards' })
    const fl = factsRef.current
    if (fl) [...fl.children].forEach((row, i) => row.animate([{ opacity: 0, filter: 'blur(7px)', transform: 'translateY(18px)' }, { opacity: 1, filter: 'blur(0)', transform: 'translateY(0)' }], { duration: 720, delay: (first ? 520 : 120) + i * 110, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }))
    const li = listRef.current
    if (li && !first) [...li.children].forEach((row, i) => row.animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(0)' }], { duration: 580, delay: 20 + i * 30, easing: 'cubic-bezier(.22,1,.36,1)' }))
  }

  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => animateScene(true), 500)
    return () => clearTimeout(t)
  }, [loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const firstScene = useRef(true)
  useEffect(() => {
    if (firstScene.current) { firstScene.current = false; return }
    if (loaded) animateScene(false)
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  const S = SCENES[scene]
  const chromeOpacity = loaded ? 1 : 0
  const sceneNumber = '0' + (scene + 1) + ' / 04'
  const factList = mob ? S.facts.slice(0, 2) : S.facts

  return (
    <section id="top" ref={heroRef} data-cursor="Scroll" data-screen-label="Hero — scroll journey" style={{ ...css('position:relative;background:#0A0A0A'), height: (mob ? Math.round(scrollLength * .7) : scrollLength) + 'vh' }}>
      <div style={css('position:sticky;top:0;height:100vh;height:100svh;min-height:540px;overflow:hidden;color:#F5F4F0')}>
        <video ref={videoRef} muted playsInline preload="auto" disablePictureInPicture style={css('position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform-origin:50% 60%')}></video>
        {videoFailed && <div style={css('position:absolute;inset:0')}><ImageSlot id="hero-fallback" placeholder="Fallback still — villa and pool" /></div>}
        <div style={css('position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(10,10,10,.62) 0%,rgba(10,10,10,0) 22%,rgba(10,10,10,0) 50%,rgba(10,10,10,.86) 100%)')}></div>
        <div style={css('position:absolute;inset:0;pointer-events:none;background:linear-gradient(to right,rgba(10,10,10,.55) 0%,rgba(10,10,10,0) 40%)')}></div>

        <aside style={{ ...css('position:absolute;left:var(--gutter);top:50%;align-items:stretch;gap:18px;transition:opacity .9s cubic-bezier(.22,1,.36,1) .65s,transform .9s cubic-bezier(.22,1,.36,1) .65s'), display: mob ? 'none' : 'flex', opacity: chromeOpacity, transform: `translate(${loaded ? '0px' : '-20px'},-43%)` }}>
          <div style={css('width:1px;background:rgba(245,244,240,.25);position:relative')}><div ref={barRef} style={css('position:absolute;inset:0;background:#F5F4F0;transform:scaleY(0);transform-origin:top')}></div></div>
          <div ref={listRef} style={css('display:flex;flex-direction:column;gap:10px')}>
            {SCENES.map((s, i) => {
              const on = i === scene
              return (
                <span key={s.name} style={{ ...css('display:flex;align-items:center;min-height:22px;white-space:nowrap;text-shadow:0 1px 12px rgba(10,10,10,.6);transition:opacity .4s ease,font-size .4s ease'), gap: on ? '10px' : '0px', fontSize: on ? '17px' : '15px', fontWeight: on ? 600 : 400, opacity: on ? 1 : .8 }}>
                  <span style={{ ...css('border-radius:50%;background:#F5F4F0;transition:width .45s cubic-bezier(.22,1,.36,1),height .45s cubic-bezier(.22,1,.36,1)'), width: on ? '12px' : '0px', height: on ? '12px' : '0px' }}></span>{s.name}
                </span>
              )
            })}
          </div>
        </aside>

        {mob && (
          <div style={{ ...css('position:absolute;left:var(--gutter);right:var(--gutter);top:96px;display:flex;flex-direction:column;gap:10px;transition:opacity .9s ease .65s;pointer-events:none'), opacity: chromeOpacity }}>
            <div style={css('display:flex;justify-content:space-between;gap:12px;font-size:10px;letter-spacing:.3em;text-transform:uppercase;text-shadow:0 1px 10px rgba(10,10,10,.6)')}><span>{S.name}</span><span>{sceneNumber}</span></div>
            <div style={css('display:grid;grid-template-columns:repeat(4,1fr);gap:6px')}>
              {SCENES.map((s, i) => <span key={s.name} style={{ ...css('height:2px;border-radius:2px;transition:background .4s ease'), background: i <= scene ? '#F5F4F0' : 'rgba(245,244,240,.3)' }}></span>)}
            </div>
          </div>
        )}
        <div style={css('position:absolute;left:var(--gutter);right:var(--gutter);bottom:clamp(24px,4vh,40px);display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:24px 40px;pointer-events:none')}>
          <div ref={titleRef} style={{ ...css('display:flex;flex-direction:column;gap:14px;transition:opacity 1s ease .2s'), opacity: chromeOpacity }}>
            <span style={css('font-size:11px;letter-spacing:.34em;text-transform:uppercase;white-space:nowrap')}>{sceneNumber} — Uniquescapes Infra</span>
            <h1 style={css("margin:0 0 -.06em;font-family:'Cormorant Garamond',serif;font-weight:500;font-size:clamp(72px,13vw,210px);line-height:.8;letter-spacing:-.015em")}>{S.title}</h1>
          </div>
          <dl ref={factsRef} style={{ ...css('width:min(440px,100%);margin:0;line-height:1.5;transition:opacity 1s ease .5s'), fontSize: mob ? '13px' : '14px', opacity: chromeOpacity }}>
            {factList.map(([k, v], i) => (
              <div key={k} style={{ ...css('display:grid;gap:14px'), gridTemplateColumns: mob ? '92px 1fr' : '118px 1fr', padding: mob ? '6px 0' : '9px 0', borderBottom: `1px solid ${i === factList.length - 1 ? 'transparent' : 'rgba(245,244,240,.4)'}` }}>
                <dt style={css('font-weight:500;letter-spacing:.04em')}>{k}</dt>
                <dd style={css('margin:0;font-weight:300;color:rgba(245,244,240,.88)')}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
