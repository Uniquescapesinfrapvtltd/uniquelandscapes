// Scroll through #services in 9 steps and record active card geometry + visible title. Same probe for both builds.
async () => {
  const s = ms => new Promise(r => setTimeout(r, ms)); const t0 = performance.now();
  while (document.documentElement.style.overflow === 'hidden' && performance.now() - t0 < 25000) await s(100);
  await s(1500);
  const sv = document.querySelector('#services'), span = sv.offsetHeight - innerHeight, out = [];
  for (let k = 0; k <= 8; k++) {
    scrollTo(0, sv.offsetTop + span * k / 8); await s(2200);
    const cards = [...sv.querySelectorAll('[data-svc-img]')].map(e => { const b = e.getBoundingClientRect(); return { i: e.getAttribute('data-svc-img'), x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height), o: +(+e.style.opacity).toFixed(2), z: +e.style.zIndex }; });
    const titles = [...sv.querySelectorAll('[data-svc-title]')].map(e => +(+e.style.opacity).toFixed(2));
    const stickyTop = Math.round(sv.firstElementChild.getBoundingClientRect().top);
    out.push({ k, scrollInSec: Math.round(scrollY - sv.offsetTop), stickyTop, front: cards.sort((a, b) => b.z - a.z).slice(0, 2), titles });
  }
  return { W: innerWidth, H: innerHeight, secH: sv.offsetHeight, out };
}
