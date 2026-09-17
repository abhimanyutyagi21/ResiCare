/* Landing page — only the interactive bits; all content is static HTML in index.html */
document.addEventListener('DOMContentLoaded', () => {
  // sync theme-toggle icon with whatever the boot script already applied
  const dark = resolvedTheme(getTheme()) === 'dark';
  document.querySelectorAll('.theme-toggle').forEach((btn) => { btn.innerHTML = Icon(dark ? 'sun' : 'moon', 17); });

  // animated stat counters in the hero mock
  document.querySelectorAll('[data-counter]').forEach((el) => {
    const target = parseInt(el.dataset.counter, 10);
    let cur = 0;
    const step = Math.max(1, Math.round(target / 20));
    const iv = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(iv); } el.textContent = cur; }, 40);
  });

  // nav gains a shadow once the page scrolls
  const nav = document.getElementById('marketing-nav');
  window.addEventListener('scroll', () => { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }, { passive: true });

  // fade/slide sections into view as they're scrolled to
  const reveals = document.querySelectorAll('.reveal, .reveal-item');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  reveals.forEach((el) => io.observe(el));

  // --- role tabs (click to switch preview) ---
  const roleTabs = document.getElementById('role-tabs');
  if (roleTabs) {
    const glider = document.getElementById('role-tab-glider');
    const setGlider = (btn) => { glider.style.width = btn.offsetWidth + 'px'; glider.style.transform = `translateX(${btn.offsetLeft - 5}px)`; };
    const activeTab = roleTabs.querySelector('.role-tab.active');
    if (activeTab) requestAnimationFrame(() => setGlider(activeTab));
    roleTabs.querySelectorAll('.role-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        roleTabs.querySelectorAll('.role-tab').forEach((b) => b.classList.toggle('active', b === btn));
        setGlider(btn);
        document.querySelectorAll('.role-panel').forEach((p) => p.classList.toggle('active', p.dataset.rolePanel === btn.dataset.role));
      });
    });
  }

  // --- testimonial slider (auto-advance + click dots) ---
  const track = document.getElementById('testimonial-track');
  if (track) {
    const dots = document.querySelectorAll('#testimonial-dots .t-dot');
    let idx = 0;
    const go = (i) => {
      idx = i;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === idx));
    };
    dots.forEach((d) => d.addEventListener('click', () => go(parseInt(d.dataset.slide, 10))));
    setInterval(() => go((idx + 1) % dots.length), 5000);
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => btn.closest('.faq-item').classList.toggle('open'));
  });

  // --- parallax photo strip on scroll ---
  const parallaxImgs = document.querySelectorAll('.parallax-img');
  if (parallaxImgs.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      parallaxImgs.forEach((img) => { img.style.transform = `translateY(${y * parseFloat(img.dataset.speed) * -0.15}px)`; });
    }, { passive: true });
  }

  // --- hero mock tilts toward the cursor ---
  const heroMock = document.querySelector('.hero-mock');
  if (heroMock) {
    heroMock.addEventListener('mouseenter', () => { heroMock.style.animationPlayState = 'paused'; });
    heroMock.addEventListener('mousemove', (e) => {
      const r = heroMock.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      heroMock.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${py * -8}deg)`;
    });
    heroMock.addEventListener('mouseleave', () => { heroMock.style.transform = ''; heroMock.style.animationPlayState = 'running'; });
  }
});

document.addEventListener('click', (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === 'toggle-marketing-menu') {
    document.getElementById('marketing-mobile-menu').classList.toggle('hidden');
    return;
  }
  if (action === 'toggle-theme') {
    toggleTheme();
    const dark = resolvedTheme(getTheme()) === 'dark';
    document.querySelectorAll('.theme-toggle').forEach((btn) => { btn.innerHTML = Icon(dark ? 'sun' : 'moon', 17); });
    return;
  }
  if (action === 'scroll-how') {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
});
