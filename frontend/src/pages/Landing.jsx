import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Button } from '../components/ui.jsx';

/* ───────────── Static content ───────────── */
const FEATURES = [
  { icon: 'complaints', color: 'var(--accent-blue)', title: 'Maintenance complaints', text: 'Residents report issues with a category, location, priority and an optional photo.' },
  { icon: 'history', color: 'var(--accent-orange)', title: 'Complaint tracking', text: 'Every complaint moves through Pending, Assigned, In Progress, Resolved and Closed.' },
  { icon: 'announcement', color: 'var(--accent-teal)', title: 'Announcements', text: 'Admins publish updates residents actually see — general, maintenance, security or emergency.' },
  { icon: 'dashboard', color: 'var(--accent-purple)', title: 'Role-based dashboards', text: 'Residents, admins and workers each get a dashboard built for what they need to do.' },
  { icon: 'feedback', color: 'var(--accent-pink)', title: 'Feedback', text: 'Residents rate the resolution once a complaint is closed, so quality stays visible.' },
];
const STEPS = [
  ['01', 'Report', 'A resident reports a maintenance issue with the details that matter.', null],
  ['02', 'Assign', 'The admin reviews the complaint and assigns it to a worker.', 'var(--accent-orange)'],
  ['03', 'Resolve', 'The worker updates the status as the work gets done.', 'var(--accent-teal)'],
  ['04', 'Close', 'The resident confirms the fix and leaves feedback.', 'var(--accent-purple)'],
];
const PROBLEMS = [
  'Complaints shared over WhatsApp groups get buried in minutes.',
  'Phone calls and verbal requests leave no record of what was promised.',
  'Nobody is clearly responsible, so issues sit unresolved.',
  'Announcements posted on noticeboards go unnoticed.',
];
const MARQUEE = [1, 9, 2, 10, 3, 20, 21, 11, 5, 12, 6, 14, 20, 15, 8, 16];
const SOCIETIES = [
  [12, 'High-Rise Towers', 'Multiple blocks, hundreds of flats'],
  [18, 'Gated Villas', 'Independent homes, one gate'],
  [8, 'Small Societies', 'A handful of buildings, tight-knit'],
];
const ROLES = [
  { key: 'resident', label: 'Resident', color: 'var(--accent-blue)', img: '/images/21.jpg', title: 'Report it once. Watch it get fixed.',
    text: 'Snap a photo, pick a category and priority, and drop a pin on the location — your complaint is in the queue with a status you can track anytime.',
    bullets: ['Live status: Pending \u2192 Assigned \u2192 In Progress \u2192 Resolved', 'Push updates when your issue moves forward', "Rate the fix once it's closed"], cta: 'Sign up as a resident' },
  { key: 'admin', label: 'Admin', color: 'var(--accent-orange)', img: '/images/admin.jpg', title: 'Every complaint, one queue.',
    text: 'See every open issue across the society, assign it to the right worker in a tap, and publish announcements residents actually read.',
    bullets: ['Filter by tower, category or urgency', 'Assign & reassign workers instantly', 'Broadcast general, maintenance or emergency updates'], cta: 'Sign up as an admin' },
  { key: 'worker', label: 'Worker', color: 'var(--accent-teal)', img: '/images/worker.jpg', title: 'Your job list, always up to date.',
    text: "No more phone calls chasing details — see what's assigned to you, where it is, and mark it done straight from your phone.",
    bullets: ['Jobs sorted by priority automatically', 'Update status on site, no paperwork', "Full history of every job you've closed"], cta: 'Sign up as a worker' },
];
const TESTIMONIALS = [
  ['"We used to chase people on a WhatsApp group for every leaking pipe. Now every complaint has an owner and a status."', 'Priya Nair \u2014 Committee Secretary, Bengaluru'],
  ['"Residents can finally see who\'s fixing what and when. Complaints about \'nothing gets done\' have dropped a lot."', 'Rohit Malhotra \u2014 Resident, Gurugram'],
  ['"My whole day used to be scattered phone calls. Now I just open my queue and know exactly where to go next."', 'Sunil Kumar \u2014 Maintenance Worker, Pune'],
];
const FAQS = [
  ['Is ResiCare free to use?', 'Yes — you can sign up and try it with any of the three roles, free.'],
  ['Where is my data stored?', 'Your data is stored on the ResiCare server and protected behind your account login.'],
  ['Can one society have residents, admins and workers together?', "Yes — that's the whole idea. Each role gets its own dashboard, but they all work off the same complaints."],
  ['What happens after a complaint is marked resolved?', 'The resident gets notified and can leave a rating, closing the loop on that issue.'],
];

const h2 = { fontSize: '1.875rem', fontWeight: 700 };
const bodyText = { fontSize: '0.875rem', marginTop: '0.4rem', color: 'var(--text-secondary)' };
const wrap = { maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.25rem 0' };

/* ───────────── Small hooks ───────────── */
function useCountUp(target) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = Math.max(1, Math.round(target / 20));
    const iv = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(iv); } setN(cur); }, 40);
    return () => clearInterval(iv);
  }, [target]);
  return n;
}
const Counter = ({ to }) => <>{useCountUp(to)}</>;

// Fades/slides `.reveal` and `.reveal-item` elements in as they scroll into view.
function useRevealOnScroll(rootRef) {
  useEffect(() => {
    const els = rootRef.current.querySelectorAll('.reveal, .reveal-item');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootRef]);
}

/* ───────────── Sections ───────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const anchors = (<><a href="#features">Features</a><a href="#how-it-works">How It Works</a><a href="#about">About</a></>);
  return (
    <header className={`marketing-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="marketing-nav-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="brand-mark">R</div><span className="font-display font-extrabold text-lg">ResiCare</span></div>
        <nav className="marketing-links md-only">{anchors}</nav>
        <div className="marketing-cta md-only">
          <ThemeToggle />
          <Button variant="ghost" to="/login">Login</Button>
          <Button to="/signup">Get Started</Button>
        </div>
        <div className="lg-hidden" style={{ alignItems: 'center', gap: 6 }}>
          <ThemeToggle />
          <button type="button" className="focus-ring" onClick={() => setOpen((o) => !o)} style={{ padding: 6, borderRadius: '0.5rem' }} aria-label="Toggle menu"><Icon name="menu" size={20} /></button>
        </div>
      </div>
      {open && (
        <div className="marketing-mobile-menu" onClick={() => setOpen(false)}>
          {anchors}
          <Button variant="secondary" to="/login" style={{ width: '100%' }}>Login</Button>
          <Button to="/signup" style={{ width: '100%' }}>Get Started</Button>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const mock = useRef(null);
  const onMove = (e) => {
    const r = mock.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    mock.current.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${py * -8}deg)`;
  };
  const pill = (bg, fg, text) => <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 500, whiteSpace: 'nowrap', background: bg, color: fg }}>{text}</span>;
  const row = (title, badge) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', borderRadius: '0.65rem', padding: '0.5rem 0.75rem' }}>
      <span className="truncate" style={{ fontSize: '0.875rem' }}>{title}</span>{badge}
    </div>
  );
  const stat = (label, n) => (
    <div style={{ border: '1px solid var(--border)', borderRadius: '0.65rem', padding: '0.75rem' }}>
      <p style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</p>
      <p className="font-display font-bold" style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}><Counter to={n} /></p>
    </div>
  );
  return (
    <section className="hero-banner reveal">
      <video className="hero-video" autoPlay muted loop playsInline poster="https://images.pexels.com/videos/13761469/batiment-builder-building-construction-13761469.jpeg?auto=compress&cs=tinysrgb&h=627&fit=crop&w=1200">
        <source src="https://videos.pexels.com/video-files/13761469/13761469-uhd_2560_1440_30fps.mp4" type="video/mp4" />
      </video>
      <div className="hero-overlay" />
      <div className="hero-section">
        <div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.8rem', borderRadius: 9999, marginBottom: '1rem', backdropFilter: 'blur(6px)' }}>&#9733; Built for Indian housing societies</span>
          <h1 className="font-display hero-title">A simpler way to manage your society.</h1>
          <p className="hero-sub">Report maintenance issues, track repairs, and stay updated with everything happening in your residential community.</p>
          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Button size="lg" to="/signup">Get Started</Button>
            <button type="button" className="btn focus-ring hero-secondary-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: '0.65rem', fontWeight: 500, cursor: 'pointer', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>See How It Works</button>
          </div>
        </div>
        <div ref={mock} className="hero-mock float-anim" onMouseEnter={() => { mock.current.style.animationPlayState = 'paused'; }}
          onMouseMove={onMove} onMouseLeave={() => { mock.current.style.transform = ''; mock.current.style.animationPlayState = 'running'; }}>
          <div className="bg-white rounded-2xl border shadow-xl" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
              <span className="dot" style={{ background: '#fca5a5' }} /><span className="dot" style={{ background: '#fcd34d' }} /><span className="dot" style={{ background: '#6ee7b7' }} />
            </div>
            <div className="grid grid-cols-3" style={{ gap: 12, marginBottom: '1rem' }}>{stat('Active', 6)}{stat('Pending', 3)}{stat('Resolved', 18)}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1rem' }}>
              {row('Lift making loud noise', pill('var(--info-bg)', 'var(--info)', 'In Progress'))}
              {row('Kitchen tap leaking', pill('var(--success-bg)', 'var(--success)', 'Resolved'))}
              {row('Power socket sparking', pill('var(--info-bg)', 'var(--info)', 'Assigned'))}
            </div>
            <div style={{ borderRadius: '0.65rem', padding: '0.75rem', background: 'var(--success-bg)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--primary)' }}>&#128227; Water supply maintenance on Sunday, 10 AM&ndash;2 PM.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleShowcase() {
  const [active, setActive] = useState('resident');
  const tabs = useRef({});
  const glider = useRef(null);
  useLayoutEffect(() => {
    const btn = tabs.current[active];
    if (btn && glider.current) {
      glider.current.style.width = btn.offsetWidth + 'px';
      glider.current.style.transform = `translateX(${btn.offsetLeft - 5}px)`;
    }
  }, [active]);
  return (
    <section id="about" className="section-inner reveal">
      <h2 className="font-display" style={h2}>Built for everyone in the society.</h2>
      <p style={{ marginTop: '0.6rem', color: 'var(--text-secondary)', maxWidth: '34rem' }}>Click a role to see what their day looks like on ResiCare.</p>
      <div className="role-tabs">
        {ROLES.map((r) => (
          <button key={r.key} ref={(el) => { tabs.current[r.key] = el; }} type="button" className={`role-tab${active === r.key ? ' active' : ''}`} onClick={() => setActive(r.key)}>{r.label}</button>
        ))}
        <span ref={glider} className="role-tab-glider" />
      </div>
      <div className="role-showcase">
        {ROLES.map((r) => (
          <div key={r.key} className={`role-panel${active === r.key ? ' active' : ''}`}>
            <div className="role-panel-img-wrap"><img src={r.img} alt={`${r.label} using ResiCare`} loading="lazy" /></div>
            <div className="role-panel-copy">
              <span className="role-chip" style={{ background: `${r.color}22`, color: r.color }}>{r.label}</span>
              <h3 className="font-display font-bold" style={{ fontSize: '1.5rem', marginTop: '0.75rem' }}>{r.title}</h3>
              <p style={{ marginTop: '0.6rem', color: 'var(--text-secondary)' }}>{r.text}</p>
              <ul className="role-check-list">{r.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <Button to="/signup" style={{ marginTop: '1.25rem', padding: '0.7rem 1.35rem', fontSize: '0.9rem' }}>{r.cta} &rarr;</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(iv);
  }, [idx]); // restart the timer after a manual click
  return (
    <section className="section-band reveal">
      <div className="section-inner-narrow">
        <h2 className="font-display" style={h2}>What people say after switching.</h2>
        <div className="testimonial-slider">
          <div className="testimonial-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
            {TESTIMONIALS.map(([quote, name]) => (
              <div key={name} className="testimonial-slide">
                <p className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
                <p className="testimonial-quote">{quote}</p>
                <p className="testimonial-name">{name}</p>
              </div>
            ))}
          </div>
          <div className="testimonial-dots">
            {TESTIMONIALS.map((_, i) => <button key={i} type="button" className={`t-dot${i === idx ? ' active' : ''}`} onClick={() => setIdx(i)} aria-label={`Testimonial ${i + 1}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section-inner reveal">
      <h2 className="font-display" style={h2}>Frequently asked questions.</h2>
      <div className="faq-list" style={{ marginTop: '2rem', maxWidth: '44rem' }}>
        {FAQS.map(([q, a], i) => (
          <div key={q} className={`faq-item${open === i ? ' open' : ''}`}>
            <button type="button" className="faq-q" onClick={() => setOpen(open === i ? null : i)}>{q} <span className="faq-caret">+</span></button>
            <div className="faq-a"><p>{a}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Page ───────────── */
export default function Landing() {
  const root = useRef(null);
  useRevealOnScroll(root);

  // Parallax photo strip
  useEffect(() => {
    const imgs = root.current.querySelectorAll('.parallax-img');
    const onScroll = () => imgs.forEach((img) => { img.style.transform = `translateY(${window.scrollY * parseFloat(img.dataset.speed) * -0.15}px)`; });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const label = { fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--muted)', marginBottom: '0.8rem' };

  return (
    <div ref={root}>
      <Nav />
      <Hero />

      <section className="reveal" style={wrap}>
        <div className="spotlight-grid">
          <Link to="/signup" className="spotlight-card reveal-item" style={{ background: 'var(--accent-blue)' }}><span className="tag">For Residents</span><h3>Report an issue in under a minute</h3><p>Category, photo, priority — done.</p></Link>
          <a href="#features" className="spotlight-card reveal-item" style={{ background: 'var(--accent-orange)', transitionDelay: '80ms' }}><span className="tag">For Admins</span><h3>One dashboard for every complaint</h3><p>Filter, assign, resolve — no spreadsheets.</p></a>
          <a href="#how-it-works" className="spotlight-card reveal-item" style={{ background: 'var(--accent-teal)', transitionDelay: '160ms' }}><span className="tag">For Workers</span><h3>Know exactly what's assigned to you</h3><p>See it, start it, close it.</p></a>
        </div>
      </section>

      <section className="marquee-wrap reveal" style={{ maxWidth: '100%', margin: '3rem auto 0' }}>
        <div className="marquee-track">{MARQUEE.map((n, i) => <img key={i} src={`/images/${n}.jpg`} alt="" loading="lazy" />)}</div>
      </section>

      <section className="section-band reveal">
        <div className="section-inner-narrow">
          <div className="problem-split">
            <div className="problem-photo-stack">
              <img src="https://picsum.photos/seed/resicare-building2/500/500" alt="Residential apartment building" loading="lazy" />
              <img src="/images/9.jpg" alt="Maintenance technician at work" loading="lazy" />
            </div>
            <div>
              <h2 className="font-display" style={{ ...h2, maxWidth: '42rem' }}>Small problems become frustrating when nobody knows who is handling them.</h2>
              <div className="grid" style={{ gap: '0.85rem', marginTop: '1.75rem' }}>
                {PROBLEMS.map((p, i) => (
                  <div key={p} className="problem-card reveal-item" style={{ transitionDelay: `${i * 80}ms` }}>
                    <span className="dot-bullet" /><p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: '2rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)' }}>There's a better way &mdash; and it works from the very first complaint.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="reveal" style={wrap}>
        <div className="parallax-strip">
          <img src="/images/13.jpg" alt="Residential apartment building" className="parallax-img" data-speed="0.06" loading="lazy" />
          <img src="/images/12.jpg" alt="Maintenance technician at work" className="parallax-img" data-speed="0.06" loading="lazy" />
          <img src="/images/20.jpg" alt="Resident at home" className="parallax-img" data-speed="0.06" loading="lazy" />
        </div>
      </section>

      <section className="reveal" style={wrap}>
        <div className="stats-strip">
          {[['5', 'Complaint Stages', 'blue'], ['3', 'Role Dashboards', 'orange'], ['8', 'Complaint Categories', 'teal'], ['100%', 'Digital Reporting', 'purple']].map(([n, l, c]) => (
            <div key={l}><p className="font-display stats-num" style={{ color: `var(--accent-${c})` }}>{n}</p><p className="stats-label">{l}</p></div>
          ))}
        </div>
      </section>

      <section id="features" className="section-inner reveal">
        <h2 className="font-display" style={h2}>Everything residents need, in one place.</h2>
        <div className="grid feature-grid" style={{ gap: '1.25rem', marginTop: '2.5rem' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="feature-card reveal-item" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="feature-icon" style={{ background: `${f.color}22`, color: f.color }}><Icon name={f.icon} size={19} /></div>
              <h3 className="font-display font-bold">{f.title}</h3>
              <p style={bodyText}>{f.text}</p>
            </div>
          ))}
          <div className="feature-card reveal-item" style={{ transitionDelay: '350ms' }}>
            <div className="feature-icon" style={{ background: 'var(--chip-bg)', color: 'var(--text-secondary)' }}><Icon name="gate" size={17} /></div>
            <h3 className="font-display font-bold" style={{ fontSize: '0.875rem' }}>Gate entry</h3>
            <p style={{ ...bodyText, fontSize: '0.75rem' }}>A simple visitor log for the admin to keep track of who's on site.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-band reveal">
        <div className="section-inner-narrow">
          <h2 className="font-display" style={h2}>From report to resolution.</h2>
          <div className="grid steps-grid" style={{ gap: '1.5rem', marginTop: '2.5rem' }}>
            {STEPS.map(([n, title, text, color], i) => (
              <div key={n} className="reveal-item" style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="step-circle" style={color ? { background: color } : undefined}>{n}</div>
                <h3 className="font-display font-bold" style={{ marginTop: '0.25rem' }}>{title}</h3>
                <p style={bodyText}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band reveal">
        <div className="section-inner-narrow">
          <h2 className="font-display" style={h2}>Fits any kind of housing society.</h2>
          <div className="society-grid" style={{ marginTop: '2rem' }}>
            {SOCIETIES.map(([img, title, sub], i) => (
              <Link key={title} to="/signup" className="society-card reveal-item" style={{ transitionDelay: `${i * 90}ms` }}>
                <img src={`/images/${img}.jpg`} alt={title} loading="lazy" />
                <div className="overlay" />
                <div className="label"><h4>{title}</h4><span>{sub}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <RoleShowcase />
      <Testimonials />
      <Faq />

      <section className="final-cta reveal" style={{ position: 'relative', overflow: 'hidden', backgroundImage: 'linear-gradient(rgba(18,58,107,0.82),rgba(18,58,107,0.88)),url(https://picsum.photos/seed/resicare-cta/1600/500)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <h2 className="font-display" style={{ ...h2, color: '#fff' }}>Keep your society running smoothly.</h2>
        <p style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>One place for complaints, updates and everyday maintenance.</p>
        <Button size="lg" to="/signup" style={{ background: 'var(--card)', color: 'var(--primary)', marginTop: '1.75rem' }}>Get Started</Button>
      </section>

      <footer className="site-footer">
        <div className="footer-inner">
          <div style={{ maxWidth: '20rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
              <div className="brand-mark" style={{ width: 28, height: 28, fontSize: '0.875rem' }}>R</div><span className="font-display font-extrabold">ResiCare</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>A simpler way to report, track and manage society maintenance issues — built for residents, admins and workers alike.</p>
          </div>
          <div>
            <p style={label}>Product</p>
            <div className="footer-links" style={{ flexDirection: 'column', gap: '0.6rem' }}><a href="#features">Features</a><a href="#how-it-works">How It Works</a><a href="#about">Who It's For</a></div>
          </div>
          <div>
            <p style={label}>Account</p>
            <div className="footer-links" style={{ flexDirection: 'column', gap: '0.6rem' }}><Link to="/login">Login</Link><Link to="/signup">Create Account</Link></div>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '2.5rem', color: 'var(--muted)' }}>&copy; 2026 ResiCare. All rights reserved.</p>
      </footer>
    </div>
  );
}
