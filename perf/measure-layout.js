// Edge alignment + services title/image clearance + which hero video was loaded. Run after load.
window.__measure = async () => {
  const s = ms => new Promise(r => setTimeout(r, ms)); const t0 = performance.now();
  while (document.documentElement.style.overflow === 'hidden' && performance.now() - t0 < 25000) await s(100);
  await s(2500);
  const W = document.documentElement.clientWidth, B = el => el.getBoundingClientRect(), L = el => Math.round(B(el).left), R = el => Math.round(W - B(el).right);
  const h = document.querySelector('#top'), aside = h.querySelector('aside');
  const hero = { logoL: L(document.querySelector('a[href="#top"]')), headerR: R(document.querySelector('header').lastElementChild), listL: getComputedStyle(aside).display === 'none' ? 'hidden' : L(aside), titleL: L(h.querySelector('h1')), factsR: R(h.querySelector('dl')) };
  const mob = h.querySelector('div[style*="top: 96px"]'); if (mob) { hero.mobileBarL = L(mob); hero.mobileBarR = R(mob); }
  const videos = performance.getEntriesByType('resource').filter(e => e.name.endsWith('.mp4')).map(e => e.name.split('/').pop() + ' ' + e.initiatorType + ' ' + Math.round(e.transferSize / 1024) + 'KB');
  const sv = document.querySelector('#services'), res = [];
  for (const k of [0, 1, 2, 3]) {
    scrollTo(0, sv.offsetTop + (sv.offsetHeight - innerHeight) * k / 3); await s(1800);
    const t = [...sv.querySelectorAll('[data-svc-title]')].sort((a, b) => b.style.opacity - a.style.opacity)[0];
    const img = [...sv.querySelectorAll('[data-svc-img]')].sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
    const tb = B(t), ib = B(img), x = Math.max(0, Math.min(tb.right, ib.right) - Math.max(tb.left, ib.left)), y = Math.max(0, Math.min(tb.bottom, ib.bottom) - Math.max(tb.top, ib.top));
    res.push({ k, titleL: Math.round(tb.left), titleR: R(t), overlapPx2: Math.round(x * y), gapX: Math.round(ib.left - tb.right), gapY: Math.round(tb.top - ib.bottom) });
  }
  const top = sv.querySelector('div[style*="top: 104px"]');
  return { W, hero, svcLabelL: L(top), svcCounterR: R(top.lastElementChild), svc: res, videos, overflowX: document.documentElement.scrollWidth > W };
};
