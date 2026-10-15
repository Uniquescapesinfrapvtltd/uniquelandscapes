import { useEffect, useRef, useState } from 'react'
import { createHeroMedia } from '@/lib/media'
import { ScrollTrigger } from '@/lib/gsap'
import Preloader from '@/components/Preloader'
import Logo from '@/components/Logo'
import Cursor from '@/components/Cursor'
import Header from '@/components/Header'
import MobileMenu from '@/components/MobileMenu'
import Hero from '@/components/Hero'
import Statement from '@/components/Statement'
import Services from '@/components/Services'
import Projects from '@/components/Projects'
import About from '@/components/About'
import Testimonials from '@/components/Testimonials'
import Enquire from '@/components/Enquire'
import Footer from '@/components/Footer'
import ServicePage from '@/components/ServicePage'
import { SERVICE_PAGES } from '@/data/content'

interface Props { scrollLength?: number; preloader?: boolean }

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches

// Service pages live at ?service=<slug>: works on any static host (no rewrite rules) and leaves #anchors free.
const readService = () => { const s = new URLSearchParams(location.search).get('service'); return s && SERVICE_PAGES[s] ? s : null }
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

export default function App({ scrollLength = 500, preloader = true }: Props) {
  const media = useRef(createHeroMedia()).current
  const [loaded, setLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(() => innerWidth < 860)
  const [menuOpen, setMenuOpen] = useState(false)
  const [navSolid, setNavSolid] = useState(false)
  const [service, setService] = useState(readService)
  // Where to scroll once the newly shown page has rendered: a y offset, an #anchor, or nothing.
  const pendingScroll = useRef<number | string | null>(null)

  const openService = (href: string) => {
    history.replaceState({ y: scrollY }, '') // remember the home scroll position for Back
    history.pushState({ fromHome: true }, '', href)
    // Jump to the top BEFORE the stage page mounts, so its ScrollTrigger is created at scroll 0 and
    // Stage 1 shows first (otherwise it starts at the old Services scroll offset and rewinds visibly).
    scrollTo(0, 0)
    pendingScroll.current = 0
    setService(readService())
  }
  const goHome = (hash: string) => {
    history.pushState({}, '', location.pathname + hash)
    pendingScroll.current = hash === '#top' ? 0 : hash
    setNavSolid(false); setService(null)
  }

  // ← Back on a stage page: real history step when we came from the landing page (restores the exact scroll spot),
  // otherwise (page opened directly) go to the landing page's Services section.
  const backToHome = () => { if (history.state?.fromHome) history.back(); else goHome('#services') }

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      pendingScroll.current = typeof e.state?.y === 'number' ? e.state.y : (location.hash || 0)
      setService(readService())
    }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const target = pendingScroll.current; if (target === null) return
    pendingScroll.current = null
    requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      if (typeof target === 'number') scrollTo(0, target)
      else document.querySelector(target)?.scrollIntoView()
    })
  }, [service])

  // On a service page, in-page anchors (logo, nav, menu, footer) point at home sections: go home, then scroll there.
  useEffect(() => {
    if (!service) return
    const onClick = (e: MouseEvent) => {
      const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      e.preventDefault(); goHome(a.getAttribute('href') || '#top')
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [service]) // eslint-disable-line react-hooks/exhaustive-deps

  const mobRef = useRef(isMobile)
  const menuRef = useRef(menuOpen)
  menuRef.current = menuOpen

  useEffect(() => {
    const onResize = () => {
      const m = innerWidth < 860
      if (m === mobRef.current) return
      mobRef.current = m
      if (menuRef.current) document.documentElement.style.overflow = ''
      setIsMobile(m); setMenuOpen(false)
    }
    addEventListener('resize', onResize)
    return () => removeEventListener('resize', onResize)
  }, [])

  // ScrollTrigger measures section positions once. Re-measure whenever the page's size really changes —
  // webfonts loading (resizes the statement text), the mobile breakpoint, the scrollbar appearing after the preloader.
  // Without this, triggers below the hero start too early and their animations run ahead of the scroll.
  useEffect(() => {
    let t = 0
    const ro = new ResizeObserver(() => { clearTimeout(t); t = window.setTimeout(() => ScrollTrigger.refresh(), 100) })
    ro.observe(document.body)
    return () => { ro.disconnect(); clearTimeout(t) }
  }, [])

  const toggleMenu = () => { document.documentElement.style.overflow = menuOpen ? '' : 'hidden'; setMenuOpen(!menuOpen) }
  const closeMenu = () => { document.documentElement.style.overflow = ''; setMenuOpen(false) }
  const light = (navSolid || !!service) && !menuOpen

  return (
    <>
      <Preloader enabled={preloader} reduced={reduced} media={media} loaded={loaded} onDone={() => setLoaded(true)} />
      <Logo loaded={loaded} light={light} />
      {finePointer && <Cursor loaded={loaded} />}
      <Header loaded={loaded} isMobile={isMobile} light={light} menuOpen={menuOpen} onToggleMenu={toggleMenu} />
      {menuOpen && <MobileMenu onClose={closeMenu} />}
      {service ? (
        <ServicePage key={service} slug={service} page={SERVICE_PAGES[service]} isMobile={isMobile} reduced={reduced} onBack={backToHome} />
      ) : (
        <>
          <Hero media={media} loaded={loaded} isMobile={isMobile} reduced={reduced} preloader={preloader} scrollLength={scrollLength} onNavSolid={setNavSolid} />
          <Statement reduced={reduced} />
          <Services isMobile={isMobile} reduced={reduced} onOpen={openService} />
          <Projects isMobile={isMobile} />
          <About reduced={reduced} />
          <Testimonials reduced={reduced} />
          <Enquire />
        </>
      )}
      <Footer reduced={reduced} finePointer={finePointer} />
    </>
  )
}
