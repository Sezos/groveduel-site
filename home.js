// Grove Duel home page: store hint by platform, the guardian picker, the phone download bar.
(() => {
  const root = document.documentElement;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const android = /Android/.test(ua);
  if (ios) root.classList.add('is-ios');
  if (android) root.classList.add('is-android');

  const stores = {
    ios: document.querySelector('.hero .store[data-store="ios"]'),
    play: document.querySelector('.hero .store[data-store="play"]'),
  };
  const get = document.querySelector('.dock a.get');
  if (get && (ios || android)) get.href = (ios ? stores.ios : stores.play).href;

  const still = matchMedia('(prefers-reduced-motion: reduce)');

  // Guardian picker: tabs swap the stage clip and the panel beside it.
  const tabs = [...document.querySelectorAll('.pick')];
  const figures = [...document.querySelectorAll('.stage figure')];
  const panels = [...document.querySelectorAll('.g-panel')];
  let current = 0;
  let stageVisible = false;

  const play = () => {
    figures.forEach((f, i) => {
      const v = f.querySelector('video');
      if (!v) return;
      if (i === current && stageVisible && !still.matches) {
        if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  const select = (i, focus) => {
    current = i;
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(j === i));
      t.tabIndex = j === i ? 0 : -1;
    });
    figures.forEach((f, j) => f.classList.toggle('on', j === i));
    panels.forEach((p, j) => { p.hidden = j !== i; });
    if (focus) tabs[i].focus();
    play();
  };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (step) { e.preventDefault(); select((i + step + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });

  const shot = document.querySelector('.shot');
  if (shot && 'IntersectionObserver' in window) {
    const once = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { shot.classList.add('live'); once.disconnect(); }
    }, { threshold: .5 });
    once.observe(shot);
  }

  const stage = document.querySelector('.stage');
  if (stage && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { stageVisible = entry.isIntersecting; play(); }, { threshold: .35 }).observe(stage);
  }
  still.addEventListener?.('change', play);

  // Phone download bar: shows once the hero buttons are gone, hides again at the closing buttons.
  const dock = document.querySelector('.dock');
  const heroStores = document.querySelector('.hero .stores');
  const closeStores = document.querySelector('.close .stores');
  if (dock && heroStores && 'IntersectionObserver' in window) {
    const seen = new Map();
    const update = () => dock.classList.toggle('show', !seen.get(heroStores) && !seen.get(closeStores) && window.scrollY > 200);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target, e.isIntersecting));
      update();
    });
    io.observe(heroStores);
    if (closeStores) io.observe(closeStores);
    addEventListener('scroll', update, { passive: true });
  }
})();
