// Scroll-scrub benchmark. Paste into DevTools console (or evaluate_script) on either build.
async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const t0 = performance.now(); let n = 0;
  await new Promise(r => { const f = () => { n++; performance.now() - t0 < 1000 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  const rafPerSec = n;
  // wait for preloader to release scroll
  const tw = performance.now();
  while (document.documentElement.style.overflow === 'hidden' && performance.now() - tw < 20000) await sleep(100);
  const preloaderDoneAt = Math.round(performance.now());
  await sleep(1500);
  const hero = document.querySelector('#top'), video = hero.querySelector('video'), canvas = hero.querySelector('canvas');
  const src = video.currentSrc || video.src;

  // 1) seek latency on a fresh element with the same source
  const v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = src;
  await new Promise(r => v.addEventListener('loadeddata', r, { once: true }));
  const D = v.duration, seeks = [];
  for (const f of [.95, .05, .5, .8, .2, .65, .35, .9, .1, .75, .25, .6, .4, .85, .15]) {
    const s = performance.now();
    await new Promise(r => { v.addEventListener('seeked', r, { once: true }); v.currentTime = f * D; });
    seeks.push(performance.now() - s);
  }
  v.removeAttribute('src'); v.load();
  seeks.sort((a, b) => a - b);

  // 2) scripted scroll through the hero, 4 s down + 2 s back up
  const longTasks = []; const po = new PerformanceObserver(l => l.getEntries().forEach(e => longTasks.push(e.duration)));
  try { po.observe({ type: 'longtask', buffered: false }); } catch {}
  let presented = 0, rvfcOn = true;
  if (video.requestVideoFrameCallback) { const cb = () => { presented++; if (rvfcOn) video.requestVideoFrameCallback(cb); }; video.requestVideoFrameCallback(cb); }
  const span = hero.offsetHeight - innerHeight, dts = [];
  const run = (from, to, ms) => new Promise(r => { const s = performance.now(); let last = s;
    const f = now => { dts.push(now - last); last = now; const k = Math.min(1, (now - s) / ms); scrollTo(0, from + (to - from) * k); k < 1 ? requestAnimationFrame(f) : r(); }; requestAnimationFrame(f); });
  scrollTo(0, 0); await sleep(500);
  await run(0, span, 4000); await run(span, 0, 2000);
  rvfcOn = false; po.disconnect(); await sleep(300);
  dts.shift(); dts.sort((a, b) => a - b);
  const pct = (a, p) => +a[Math.min(a.length - 1, Math.floor(a.length * p))].toFixed(1);
  return {
    rafPerSec, preloaderDoneAt, videoSrc: src.slice(0, 60), duration: +D.toFixed(2),
    renderPath: canvas && getComputedStyle(canvas).opacity === '1' ? 'canvas-frames' : 'video-seek',
    seekMs: { median: pct(seeks, .5), p90: pct(seeks, .9), max: +seeks[seeks.length - 1].toFixed(1) },
    scroll: { frames: dts.length, frameMsMedian: pct(dts, .5), frameMsP95: pct(dts, .95), framesOver33ms: dts.filter(d => d > 33.4).length, longTasks: longTasks.length, longTaskMsTotal: Math.round(longTasks.reduce((a, b) => a + b, 0)) },
    videoFramesPresentedDuringScrub: presented,
    heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : null,
  };
}
