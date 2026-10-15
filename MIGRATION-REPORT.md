# Uniquescapes Infra — React migration report

## 1. Root cause of the scroll lag

**The hero video had one keyframe for the whole 10-second clip.** Each scroll-driven `currentTime` seek made the browser decode every frame from 0 up to the target (up to 239 frames of 1080p at 11 Mbit/s).

Evidence:
- `ffprobe` on `uploads/Camera_moving_toward_swimming_pool_20261014115109.mp4` found exactly one keyframe (packet flag `K` only at `0.000000`) across 239 frames.
- Measured seek latency on that file: median **172–312 ms**, worst **358–1065 ms** per seek (two runs; see §5).
- The original code tried to work around this by pre-extracting up to 140 frames into a canvas. That extraction also performs one slow seek per frame (140 seeks plus a JPEG encode each), so it ran for many seconds. In both test runs it had **not finished** when scrolling began, so users scrubbed on the slow seek path.

## 2. Tech stack

| Item | Why |
|---|---|
| React 18.3 + TypeScript 5.6 | Requested. Strict mode on. |
| Vite 5.4 + `@vitejs/plugin-react-swc` | Requested. SWC is faster than the Babel plugin. |
| `vite-plugin-checker` | `vite build` does not type-check, so this adds it in dev. `npm run build` also runs `tsc --noEmit`. |
| `vite-tsconfig-paths` | Provides the `@/` alias from `tsconfig.json`, so there's no hand-written alias config. |
| GSAP 3.12.5 + ScrollTrigger | Drives every scroll-linked effect: hero scrub, nav colour, statement words, services carousel, founders visibility, back-to-top ring. |
| Plain CSS | The original `<style>` block is in `src/styles/global.css`, unchanged. Inline styles are kept as the original strings via `css()` in `src/lib/css.ts`. No Tailwind. |

`@types/gsap` was not installed: it's deprecated, and GSAP ships its own types.

## 3. Files

**Created**
- Root: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `.claude/launch.json`
- `src/main.tsx`, `src/App.tsx`
- `src/components/`: `Preloader`, `Logo`, `Cursor`, `Header`, `MobileMenu`, `Hero`, `Statement`, `Services`, `Projects`, `About`, `Enquire`, `Footer`, `ImageSlot`
- `src/hooks/useVideoScroll.ts`
- `src/lib/`: `css.ts`, `ease.ts`, `gsap.ts`, `media.ts`
- `src/data/content.ts`
- `src/styles/global.css`
- `public/assets/hero-pool-optimized.mp4`, `public/assets/hero-pool-optimized-1280.mp4`
- `perf/bench.js`, `perf/measure-layout.js`

**Unchanged:** `original/` (the unzipped design export, kept as the reference and source video) and the original `.zip`.

**Not shipped**
- The original 13.8 MB mp4. It's still in `original/uploads/` but is no longer served.
- The unused `cosmos_*.mp4`, `gemini_*.mp4` and the two `ezgif` frame folders. The page never referenced them.
- The VP9 WebM. See §4.

**Section mapping (original `data-screen-label` → component):** Hero → `Hero`, Statement → `Statement`, Services → `Services`, Selected projects → `Projects`, About → `About`, Enquire → `Enquire`, Footer → `Footer`. The fixed chrome (preloader, logo, cursor, header, mobile menu) has its own components.

## 4. Video

| | Codec | Size | Keyframes | SSIM vs source |
|---|---|---|---|---|
| Original | H.264 High, 1920×1080, 24 fps, AAC audio | 13.8 MB | **1** (whole clip) | — |
| `hero-pool-optimized.mp4` (shipped) | H.264, 1920×1080, 24 fps, no audio, faststart | 11.4 MB | **24** (every 10 frames = 0.42 s) | **0.989** |
| `hero-pool-optimized-1280.mp4` (shipped, viewports < 860px) | H.264, 1280×720, 24 fps, no audio, faststart | **6.3 MB** | 24 (every 10 frames) | 0.986 (vs source scaled to 720p) |
| `hero-pool-optimized.webm` (dropped) | VP9 CRF 33 | 13.1 MB | 24 | 0.926 |

Command used:

```bash
ffmpeg -i Camera_moving_toward_swimming_pool_20261014115109.mp4 -c:v libx264 -preset slow -crf 23 -g 10 -keyint_min 5 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart -an hero-pool-optimized.mp4
```

**Why the VP9 WebM was dropped.** At the specified settings it was visibly softer (SSIM 0.926) **and** larger than the H.264 file. Chrome would have picked it first if listed first. Per the rules, I stopped and am reporting this rather than shipping it.

**Why `<video src>` instead of `<source>` elements.** The hook downloads the file once into a Blob (this drives the preloader % and keeps every seek local). That needs a single URL.

## 5. Performance (measured, not estimated)

All numbers come from the Chrome DevTools MCP browser on this machine. Seek timing uses a detached `<video>` loaded from an in-memory blob: 15 seeks to fixed positions.

| Seek latency | Median | p90 | Max |
|---|---|---|---|
| Original file, run 1 (original page) | 311.7 ms | 668.6 ms | 1065 ms |
| Original file, run 2 (same session as the optimized run) | 171.7 ms | 317.5 ms | 358.4 ms |
| **Optimized file** (same session) | **23.0 ms** | **32.4 ms** | **40.1 ms** |

That's about **7.5× faster at the median, 9× at the worst case.** A seek now completes in roughly 1–2 display frames instead of 10–60.

Other measured results:
- **Frame extraction removed.** The 140-seek extraction, canvas and per-frame JPEG encoding are gone. In both baseline runs extraction hadn't finished when scrolling began, so the old canvas fast-path wasn't actually helping.
- **Bundle:** 309.9 kB JS (105.1 kB gzip) and 1.1 kB CSS.

**Not measured:**
- **FPS and long tasks during scroll.** Both available browsers were background-throttled to 2 `requestAnimationFrame`/s (the windows weren't in the foreground), so frame-timing numbers would be meaningless and are not reported. To get them, open the page in a focused Chrome and paste `perf/bench.js` into the console. It reports frame-time p95, frames over 33 ms and long tasks, for both builds.
- **Preloader duration.** Also skewed by the throttling, so not compared.

## 6. Test checklist

| Check | Result |
|---|---|
| `npm run build` (tsc + vite) exits 0 | ✅ |
| `npm run dev` serves (index 200, video 206 range) | ✅ |
| Forward scroll: video tracks (35% → 3.47 s, 65% → 6.47 s, 100% → 9.92 s) | ✅ |
| Reverse scroll (100% → 50% → 0%: 4.98 s → 0.02 s) | ✅ |
| Fast scroll: 60 random jumps at 16 ms, no errors, settles within 1 frame of target | ✅ |
| Resize during scroll: still converges | ✅ |
| Scenes, nav colour, statement words, services carousel, top ring respond | ✅ |
| Mobile 375 px: no horizontal overflow, segment bar, 350vh hero, Menu button | ✅ |
| Desktop 1440 px vs original | ✅ visually matched by side-by-side screenshot (not a pixel diff) |
| Tablet 768 px | ⚠️ not separately screenshotted; uses the same `<860px` mobile branch as 375 px |
| Console errors / React warnings (production build) | ✅ none |
| `prefers-reduced-motion`: video holds first frame, static services list, statement fully shown | ✅ |
| Video missing or failed: fallback slot shown, page scrolls normally | ✅ (after a fix, see §7) |

## 7. Changes from the original behaviour (intentional)

- **Video-failure fallback now works.** The original only flagged failure if the URL contained `.mp4`. After the Blob download the URL is `blob:…`, so a failed video never showed the fallback. Now any media error, or a non-`video/*` response, triggers it.
- **Smoothing is time-based.** The original per-frame lerp (factor .12) on the hero and services is replaced by ScrollTrigger `scrub: .5`. The catch-up feel is similar, but it no longer depends on display refresh rate.
- **Scrub writes are throttled.** Seeks are written at most once per rAF, skipped when the change is under half a frame, and never while a seek is in flight (250 ms safety timeout).
- **Reduced motion** keeps the video on its first frame (previously it still scrubbed).
- **Form markup.** Added `autocomplete` and `aria-label` to the form inputs and `aria-pressed` to the project-type chips.
- **Viewport height.** `height:100vh;height:100svh` collapses to `100svh` (inline React styles can't hold a fallback pair). All current browsers support `svh`.

## 8. Remaining limitations

1. **Image slots are placeholders.** The export had no image data, so these are empty in the original too. Pass `src` to `<ImageSlot>` to add photos.
2. ~~Mobile logo overlap~~. Fixed in §10.
3. **Services carousel animates layout properties.** It still animates `width/height/left/top`, as the original does. Switching to transforms would change how the image crops inside each card. It's 4 absolutely positioned elements inside an `overflow:hidden` sticky box, so the layout cost is contained.
4. **Desktop video is still 11.4 MB**, fully downloaded before scrubbing. Phones now get the 6.3 MB 1280px file (§10).
5. **`npm audit`** reports dev-server advisories in the Vite 5 toolchain. They don't affect the built site. Upgrading to Vite 6+ would clear them.
6. **No backend.** The enquiry form only shows the thank-you state, as in the original.

## 9. Commands

```bash
npm install
npm run dev
npm run build
```

## 10. Follow-up: mobile video and hero/services alignment

**Mobile video.**
- Phones get `hero-pool-optimized-1280.mp4`: the same encode settings at 1280×720, 6.3 MB instead of 11.4 MB.
- The file is chosen once at mount: `innerWidth < 860`, the site's existing mobile breakpoint. Swapping it on resize would re-download the clip and reset the scrub.
- Verified by resource timing: 375px loads only the 1280 file (6157 KB), and desktop loads only the full file.

**Single download.** The `<video>` element no longer has a `src` attribute. Previously it started its own download in parallel with the hook's `fetch()`, which only avoided downloading twice when the browser cache happened to serve the second request. Now the hook is the only loader: it sets `src` to the Blob once the download completes, or to the file URL if the download fails.

**Alignment.** The original used three different horizontal insets in the hero and services:
- `3vw` for the logo, header and scene list
- `4vw` for the hero title, with `3vw/44px` for the facts
- `5vw/72px` for the services labels and titles

These are now one token, `--gutter: clamp(20px,3vw,40px)`, defined in `global.css`. It's used by the logo, header, hero (scene list, mobile progress bar, title, facts) and services (labels, titles, reduced-motion list).

Measured edges:

| Viewport | Logo | Scene list | Hero title | Facts (right) | Services label / title | Services counter (right) |
|---|---|---|---|---|---|---|
| Before, 1422px | 40 | 40 | **57** | 42 | **71** | **72** |
| After, 1121px | 34 | 34 | 34 | 34 | 34 | 34 |
| After, 375px | 20 | (hidden) | 20 | 20 | 20 | 20 |

**Services.**
- On desktop, the copy block width is now `min(440px, 32vw − gutter − 32px)`. It ends 32px before the active image's left edge (32% of the viewport) at every service, with zero overlap measured at all 4 steps. Before, it could run under the image on narrower desktops.
- On mobile, the active card spans exactly gutter-to-gutter (20px each side, previously 22.5px).

**Mobile header.** Below 560px the header's Enquire pill is hidden. Logo plus both pills need about 545px, so it overlapped the logo at 375px. Enquire is still in the Menu overlay and the footer.


## 11. Follow-up: services animation and alignment

The reversed hero scroll (pool → house) was tried and **reverted** at your request. The hero plays house → pool as originally designed.

**Stale trigger positions (bug, fixed).**
- ScrollTrigger measures where each section starts once, and I only re-measured on breakpoint/preloader changes. Anything that later changes the page height made every trigger below the hero start at the wrong place, so its animation ran ahead of or behind the scroll. The main culprit is webfonts arriving late, which re-wraps the large statement text above Services.
- This affected Services, the statement word reveal and the back-to-top ring.
- `App.tsx` now watches `document.body` with a `ResizeObserver` and calls `ScrollTrigger.refresh()` whenever the page size really changes.
- Verified: the Services trigger start/end (5521 → 8365px) equal the section's real top and bottom.

**Animation matches the original.** At each scroll position, the settled title opacities equal the original formula's values. The original converges to the same state at the same positions; it just smooths frame-by-frame instead of over 0.5s.

**Short screens (design limit, fixed).**
- The mobile keyframes are fractions of viewport height, with fixed labels at 104px. On phones in landscape (844×390) the active card covered the "Services / 04 Disciplines" labels and the side cards ran into the titles: 26 collisions over a 13-step scan. The original has the same problem.
- Mobile-layout screens shorter than 640px (`MIN_ANIMATED_MOBILE_H` in `Services.tsx`) now show the static service list, the same one reduced-motion users get. It switches live on rotation.

**Overlap scan.** The section was checked at 25 scroll steps for title↔card, title↔labels, title↔header and active-card↔labels/header collisions:

| Viewport | Mode | Collisions |
|---|---|---|
| 1405×889 desktop | animated | 0 |
| 1501×853 desktop | animated | 0 |
| 1405×689 short desktop | animated | 0 |
| 768×1024 tablet | animated (mobile layout) | 0 |
| 390×844 phone | animated | 0 |
| 375×667 iPhone SE | animated | 0 |
| 844×390 phone landscape | static list (was 26) | n/a |

**How the testing was done.** All of these windows were background-throttled to about 2 fps. GSAP's lag smoothing then slows any 0.5s scrub to several seconds and makes it look broken. The scan therefore ran on the dev server with `gsap.ticker.lagSmoothing(0)`, which is a test-only setting and isn't in the app code.

## 12. Follow-up: laptop alignment and service stage pages (from the design recording)

The reference is your screen recording of the updated claude.ai design, "Landscaping · Stage by stage" at ~1903px wide.

**Alignment.**
- The recording insets the section labels and the text column by about 5vw (~96px), not the logo's 3vw. The text column is ~477px wide and ends ~40px before the active card.
- Services and stage pages now use `--svc-gutter: clamp(20px,5vw,96px)`.
- The title width is `min(480px, calc(32vw − gutter − 40px))`.
- Measured at a 1501px laptop width: labels, counter and title all at 76px (5vw), and the title sits exactly 40px from the card. At 390px everything is at 20px, and the active mobile card spans gutter to gutter.
- The logo, header and hero keep `--gutter` (40px max).

**Service pages.**
- `ScrollCarousel.tsx` is the shared scroll animation.
- `Services.tsx` (home) and the new `ServicePage.tsx` both render through it.
- Clicking the Luxury Landscaping card opens `?service=landscaping`, a "Landscaping · Stage by stage" page with "04 stages", the four stages, and copy and placeholders taken from the recording.

Navigation details:
- The query string was chosen because it works on any static host, with no rewrite rules.
- Pages switch without a reload.
- Browser Back returns to the exact Services scroll position.
- Logo, nav, menu and footer links on a stage page go home and scroll to that section.
- Opening `?service=landscaping` directly also works.
- The cursor shows "View" over clickable cards.

**Not yet built.**
- The other three services have no stage design yet, so their cards aren't clickable rather than linking to invented content.
- To add one, put an entry in `SERVICE_PAGES` (`src/data/content.ts`) keyed by its slug: `pools`, `resorts` or `construction`.

## 13. Follow-up: clickable service title and Back button

- **Clickable title.** On the landing page, the visible service title block ("01 / 04 Luxury Landscaping" plus its text) is a link to the stage page, as well as the card. Titles are stacked on top of each other, so only the visible one (opacity > 0.5) takes clicks; the hidden ones can't swallow them.
- **Back button.** Stage pages show a "← Back" pill next to the "Landscaping · Stage by stage" label. It stays on screen through every stage, on desktop and mobile, and in the static layout too.
  - **Coming from the landing page:** it steps back through history (the same as the browser Back button), so you land on the exact scroll spot you left.
  - **Opened from a direct link:** it goes to the landing page's Services section.

Verified (dev, 1366px and 390px):

| Check | Result |
|---|---|
| Click on the title → stage page | `?service=landscaping`, Stage 1 Site & Survey first |
| ← Back after coming from the landing page | `/`, scroll restored to 5357px (where you left) |
| ← Back after opening `?service=landscaping` directly | `/#services`, Services at the top of the screen |
| Back button on a 390px phone | clear of header and card, no sideways scroll |

## 14. Follow-up: every service opens its stages; Stage 1 always first

**All four services are clickable.** The card and the visible title each open `?service=landscaping | pools | resorts | construction`. All four pages use the same `ScrollCarousel`, so the animation, scroll scrub, mobile layout, short-screen fallback, ← Back button and alignment are identical everywhere.

**Draft copy, needs review.** The Pools, Resorts and Construction stage pages use copy I wrote from each service's existing description and feature list, in the voice of the Landscaping text from the design recording. It's marked DRAFT in `src/data/content.ts`; replace it with approved text when their designs arrive.

**Stage 1 first (bug, fixed).** The stage page used to mount while the window was still scrolled to the Services position. Its ScrollTrigger started part-way through, then the scroll jumped to 0 and the stages visibly rewound. Opening a service now calls `scrollTo(0, 0)` *before* the new page renders.

Verified (dev, lag smoothing off, no real input during the run). At each service the visible title was clicked at its on-screen position, then 15 samples were taken over 1.5s:

| Viewport | Service | Stages 2–4 max opacity in first 1.5s | Scroll walk | ← Back returns to |
|---|---|---|---|---|
| 1366 | Landscaping | 0 | Site & Survey → … → The Finished Garden | 5357px (left from 5357) |
| 1366 | Pools | 0 | Design & Excavation → … → The Finished Pool | 6267px (6267) |
| 1366 | Resorts | 0 | Masterplan → … → The Finished Resort | 7178px (7178) |
| 1366 | Construction | 0 | Design & Approvals → … → Handover | 8088px (8088) |
| 390 | all four | 0 | Stage 1 first, Finished last | exact spot (all four) |

## 15. Follow-up: real photos on the Pools service

Your five photos of your own pool build are in `public/assets/services/pools/`. They're used as-is, since they're already web-sized (145–310 KB, max 1600px).

| Where | File | Photo |
|---|---|---|
| Home Services card (Swimming Pool Construction) | `card-wide.jpg` | finished pool and deck in the rain |
| Stage 1 · Design & Excavation | `stage-1-excavation.jpg` | excavation with the first formwork |
| Stage 2 · Shell & Reinforcement | `stage-2-shell.jpg` | steel and formwork from above |
| Stage 3 · Plumbing & Water Test | `stage-3-water-test.jpg` | shell filled for the leak test |
| Finished · The Finished Pool | `finished-night.jpg` | aerial at night, pool lights on |

- **Copy changes.** The draft Stage 2 and Stage 3 titles and text were rewritten to match what the photos show; the earlier versions were mine, not approved copy.
- **Image slots.** `<ImageSlot>` shows a real image when it gets `src`, and the placeholder chrome otherwise. Stage photos come from the optional 5th field of each stage in `SERVICE_PAGES`, and home card photos from `SERVICE_CARD_PHOTOS`.
- **Loading.** Carousel photos load eagerly, so a card sliding in from off-screen never pops in half-loaded; images elsewhere stay lazy.
- **Verified** at 1366px: the active card at each stage shows the right photo, loaded, with `object-fit: cover` filling the 668×495 card. `perf/pool-stage-crops.jpg` shows the exact centred crops; the three portrait shots keep the pool in frame.

## 16. Follow-up: founders copy in the About section

Client-supplied text went into `About.tsx` (`#studio`), word for word except "our goal" → "Our goal" at the start of a sentence:

| Spot | Before | Now |
|---|---|---|
| Headline | Built by people who still *walk every site.* | Built by Brothers. Driven by Vision. *Designed to Inspire.* |
| Intro, column 1 | "Uniquescapes Infra began with a simple conviction…" | "Every extraordinary place begins with a vision. Ours began with two brothers…" |
| Intro, column 2 | "Today our architects, engineers and in-house crews…" | "At Unique Scapes Infra Pvt. Ltd., we believe… Our goal is to bring together creativity, functionality, quality, and nature in perfect harmony." |
| Under "The founders." (new) | — | "At Unique Scapes Infra, we specialize in end-to-end development…" and "As brothers and business partners, we bring a shared commitment…" |

The new founders paragraphs reuse the intro's two-column grid and paragraph style, so no new styles were added. At 1366px and 390px the headline is 3 lines, with no horizontal overflow.

**Still placeholders:** the founder cards ("Founder Name", roles, bios, quotes, portraits) are unchanged until real details arrive.

## 17. Follow-up: custom cursor fixes (`Cursor.tsx`)

| Problem | Cause | Fix |
|---|---|---|
| No cursor at all during the loading screen, and after it until the mouse moved | `html.uq-cursor` (which hides the system cursor) was added on mount, but the custom ring only showed after loading **and** a mouse move | The system cursor is hidden only while the custom one is actually visible. `sync()` toggles both together, and runs again when loading finishes, so a pointer that moved during loading gets the ring immediately |
| Ring could stay on screen, or the system cursor stay hidden, after leaving the window | `pointerleave` listened for on `document`, where browsers don't reliably dispatch it | Leaving is now detected with `pointerout` whose `relatedTarget` is null |
| "View" label / enlarged ring stuck after opening a service or pressing Back | The page is swapped under a still pointer, so no `pointerover` fires | After each click or `popstate`, the element under the pointer is re-read (`elementFromPoint`) two frames later |
| Touch / pen | — | The custom ring follows only `mouse` and `pen` pointer types |

Verified in dev with simulated pointer events and zero real input:
- **During loading:** system cursor shown, ring hidden.
- **After loading (pointer moved earlier):** ring shown, system cursor hidden.
- **Leaving the window:** system cursor back, ring hidden.
- **Returning:** ring shown again.
- **Hovering a service card:** "View", ring scale 1.5.
- **Clicking it:** the stage page opens and the label and scale reset.

## 18. New cursor and testimonials section

**Cursor** (`src/components/Cursor.tsx`), modelled on Codrops' "Custom Cursor Effects" (magnetic/stuck circle) and their filled-circle cursor sketch:
- Idle: a small ring trailing a dot (difference blend), squashed and stretched along the direction of travel.
- Links and buttons: the ring grows. Small controls (pills, round buttons, under 220px) are magnetic: the ring snaps near the control's centre and the control leans toward the pointer (CSS `translate`, so existing transforms are untouched).
- "View" (projects, service cards and titles) and "Drag" (compare slider): the ring fills olive with the label inside.
- Inputs: the ring shrinks out of the caret's way. Pressing the mouse shrinks the ring slightly.
- Reduced motion: no stretch, no magnet. Section 17's fixes (system cursor until the custom one shows, window-leave, reset after page swaps) are kept.
- Verified with simulated pointer events in Chrome: magnet offset applied and cleared on leave, label mode olive with "View", and stretch present while moving.

**Testimonials** (`src/components/Testimonials.tsx`, data `TESTIMONIALS` in `content.ts`), placed between About and Enquire:
- One large quote at a time with a word-by-word rise animation (GSAP).
- Auto-advances every 7s only while on screen and not hovered, with a progress line; also has Previous/Next buttons, and the quote region is `aria-live`.
- **The three quotes are draft sample copy.** Replace them with real, approved client quotes before launch.

Build passes (`tsc --noEmit && vite build`); no console errors.

### 18a. Review fixes
- **Testimonials not shown yet:** the mount in `App.tsx` is commented out because the quotes are draft sample copy. Restore that one line once `TESTIMONIALS` holds real, approved quotes.
- **Cursor after Back:** the cursor now drops a snapped-to control the moment it leaves the page (`isConnected`). Otherwise its rect reads 0,0 and the ring drifts toward the corner. Verified: after clicking Back, the ring stayed at the pointer for 6 samples over 1.8s.
- **Magnetic ease-back:** released controls now ease back to rest (decay ×0.8 per frame) instead of snapping. Verified: 3.2px → 2.6px → 2px over successive samples.
- **Testimonials accessibility:** auto-advance also pauses while keyboard focus is inside the section (WCAG 2.2.2). The quote region is `aria-live="off"` during auto-rotation and `polite` after Previous/Next. Verified: no advance during 8s of focus; `off` → `polite` after a click.
- The progress bar is written only while the section is on screen.

### 18b. About copy shortened, testimonials shown again
- About now has one short intro paragraph and one short founders paragraph, rewritten from the client copy.
- Testimonials are mounted again at the user's request. **The quotes are still draft sample copy and must be replaced before launch.**

## 19. Brand mark in the logo
- The client logo was saved untouched as `public/assets/brand/logo-full.png` (500×500, transparent background).
- The mark alone (cropped to its alpha bounds, 123,100–376,354, without the text) is `logo-mark.png`, 160×160 for sharp display at 38px. It sits left of the wordmark in the fixed logo and is also the favicon.
- Under 420px wide, the mark is 28px and the wordmark 19px, so the logo clears the Menu pill. Measured gap: 42px at 375px wide, 26px at 360px wide (it touched at 375px before this change).

## 20. Drawn-then-built photos
- `public/assets/studio/buddha-water-wall-render.jpg` (Drawing) and `buddha-water-wall-built.jpg` (Built) are the client uploads, unaltered: re-encoding made them larger.
- The photos are portrait (2:3), so the 16:9 frame would have cropped away most of the pavilion. The block is now a two-column grid, text beside a 2:3 slider capped at 80vh (474×711 at 1405×889), and it stacks on phones (350×525 at 390px wide, no horizontal scroll).
- Update: the drag slider (which showed half of each photo) was replaced, at the user's request, by both photos shown whole side by side with Drawing/Built tags and the site's hover zoom. Each photo is 72vh tall (474×711 at 1561×988), with no horizontal scroll. The slider code and its cursor "Drag" target were removed.

## 21. New loader and founder portrait fix
- **Loader:** the translucent overlay with the centred wordmark and big % counter is replaced by a solid dark screen. The brand mark (grey) fills with colour from the bottom as the hero video downloads, above a progress line and "Loading NN%". The screen then lifts away like a curtain (1.1s). Progress logic is unchanged (video Blob download, 2.4s minimum, 15s cap). The header logo no longer flies in from the centre: it fades in at its corner once loading ends.
- **Founder portrait on phones:** it was `position:sticky` at every width, so with the grid stacked into one column it slid over the founder text. It now sticks only at 1040px+ (two columns). Verified at 390px wide: the portrait ends 32px above the founder list, with no overlap.

## 22. Mobile services alignment and scroll performance
- **Photos covering the service name (mobile):** the card keyframes were fractions of `innerHeight` while the titles sit at the bottom of the 100svh stage, so wrapped titles or a hidden address bar put cards on the text. Mobile cy/h are now fractions of the measured band between the label row (140px) and the title block (`offsetTop - 16`). At 390×844 across 9 scroll positions the gap between the lowest card and the service name is 52–79px (previously the cards could touch it).
- **Cards move by transform only:** each card is laid out once at the active size; per frame it gets `translate3d + scale(sx,sy)`, with the photo counter-scaled to stay undistorted (overflow:hidden crops). No width/height/left/top writes or clip-path changes per frame, and layout is read only on refresh. Title blur is skipped on phones.
- **Idle work removed:** the loader unmounts after its curtain (its infinite "breathe" kept frames running); the footer clock and "open" pulse run only while the footer is on screen; founder progress bars are written only while visible.
- **Measured** (390×844, 4× CPU throttle, fresh reload, scripted 5s scroll through Services, same protocol): old 107/84/82 frames (median frame 33–50ms) vs new 171/105/90 (median 17–33ms), plus a traced run at 225 frames (median 16.7ms). Runs degrade within one session for both versions, so this is a lab comparison, not a device fps guarantee.

## 23. Design gallery per service
- Each service page now has, below the stage-by-stage carousel, a "Selected designs" gallery (`DesignGallery.tsx`): a masonry grid (3 columns on laptops, 2 on tablets, 1 on phones) with a fade-up reveal, and a full-screen viewer (native `<dialog>`) with Prev/Next buttons, arrow keys, swipe and Esc.
- **Adding designs needs no code:** drop images into `src/assets/designs/<slug>/` (`landscaping`, `pools`, `resorts`, `construction`). `src/data/designs.ts` picks them up with `import.meta.glob`. The file name sets order and caption: `07-infinity-pool-villa-neel.jpg` becomes design 07, "Infinity pool villa neel". A service with no images shows no gallery.
- Seeded with the 5 real pool photos already on the site. Images are lazy-loaded; keep each around 1600px wide and under ~400KB (30 per service).
- Verified at 1280×860 (3 columns, viewer next/prev/arrow-key/Esc) and 375×812 (1 column at the 20px gutters, no horizontal scroll).

## 24. Service renames
- Service 3 is now **Farmhouse & Resorts** (title, description, features, stage page name; stage 2 "Farmhouses & Villas", finished stage "The Finished Retreat").
- Service 4 "Residential & Commercial Construction" is now **3D Designs**, with new draft stages (Brief & Site Study, Concept & Layout, 3D Model & Materials, Renders & Walkthrough). Its URL is `?service=3d-designs` and its gallery folder is `src/assets/designs/3d-designs/`. The footer line and enquiry project types ("3D design" added) were updated to match.

## 25. Landscaping showcase photo
- The client's night photo of the garden pavilion (2000×1333, 432 KB, used as is) is now the Luxury Landscaping card photo on the home Services carousel, the "Finished Garden" stage photo, and design 01 in the landscaping gallery.

## 26. Luxury Landscaping photos
- 15 new client photos (7 attached, plus 9 from the WhatsApp zip; one attachment duplicated the pavilion shot). One zip photo was stored sideways with no EXIF orientation, so it was rotated 90° counter-clockwise; the others are used as is (85–507 KB, at most 2000px).
- **Stages:** 1 Site & Survey = dug-out site with footings; 2 Groundwork = pergola base and kerbs; 3 Planting = palms craned into place; Finished = aerial of the villa garden at night. The card photo stays the garden pavilion.
- **Gallery:** 17 designs, finished work first (pavilion, aerials, lawns, cottage path, gazebo, pergola bar, lit walkway, deck, loungers, swing, kitchen garden, bamboo light sculpture), then the build (pergola, pavilion footings, roof-frame lift, palm planting).

## 27. Designs from three WhatsApp zips (all services)
- 79 photos and 2 videos in. Removed: 5 already on the site and 3 byte-identical (by MD5), 6 resized copies (32×32 grayscale mean-abs-diff ≤ 0.4), 1 personal selfie, and a 0.4s blank clip. 63 photos and 1 video placed.
- **3D Designs (33):** the 11s top-down walkthrough video first, then rooftop pergola lounge renders, park/plaza/fountain renders, plan and aerial views, the villa masterplan, pagoda gazebo. Stages: real site, plan view, 3D model from above, sunset render. Card: fire-pit lounge render.
- **Farmhouse & Resorts (13):** timber cottages at night, cottage bar, lit jaali ceiling, log gate, gazebo, lawns and pergolas, then build (cottage frame, tiled roof framing, pergola deck). Stages: masterplan render, cottage build, lawn/deck/pergolas, cottage at night. Card: cottage garden at night.
- **Swimming Pools (13):** added slide and rock waterfall, lagoon pool at night, loungers, mosaic pools, round pool walls and tiling; finished first, build last.
- **Luxury Landscaping (26):** added lit cypress walkway, topiary path, palm avenue, garden name in stone, palm planting, boundary planting, turf laying; renumbered so finished work comes before build photos.
- The gallery now supports video: the tile shows a still frame (`#t=0.1`) with a "Play" badge and nothing plays in the grid; the viewer plays it with controls.
