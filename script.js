// ===== SITE DETAILS: edit here and it updates on every page =====
const SITE = {
  address: '22 Bishopsgate, London, EC2N 4BQ',
  phone: '+44 75 2950 7591',
  email: 'info@marksberrysolicitors.com',
  hours: 'Monday – Friday: 9:00 AM – 5:30 PM',
  sra: '000000' // your SRA number
};

const page = location.pathname.split('/').pop() || 'index.html';
const isHome = page === 'index.html';

// ===== HEADER & FOOTER =====
const links = [
  ['index.html', 'Home'],
  ['about.html', 'About'],
  ['practice-areas.html', 'Practice Areas'],
  ['cases.html', 'Cases'],
  ['team.html', 'Our Team']
];

document.getElementById('site-header').innerHTML = `
  <header class="header" id="header">
    <div class="container nav-wrap">
      <a href="index.html" class="logo">
        <span class="logo-mark">MB</span>
        <span class="logo-text">Marks Berry <small>Solicitors</small></span>
      </a>
      <nav class="nav" id="nav">
        ${links.map(([href, label]) => `<a href="${href}" class="${href === page ? 'active' : ''}">${label}</a>`).join('')}
        <a href="contact.html" class="btn btn-gold nav-cta">Free Consultation</a>
      </nav>
      <button class="menu-toggle" id="menuToggle" aria-label="Toggle menu"><span></span><span></span><span></span></button>
    </div>
  </header>`;

document.getElementById('site-footer').innerHTML = `
  <footer class="footer">
    <div class="container footer-grid">
      <div>
        <a href="index.html" class="logo light">
          <span class="logo-mark">MB</span>
          <span class="logo-text">Marks Berry <small>Solicitors</small></span>
        </a>
        <p class="footer-about">Professional corporate legal services built on trust, expertise and results.</p>
      </div>
      <div>
        <h4>Quick Links</h4>
        ${links.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
        <a href="contact.html">Contact</a>
      </div>
      <div>
        <h4>Contact</h4>
        <p>${SITE.email}</p>
        <p>${SITE.phone}</p>
        <p>${SITE.address}</p>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>&copy; ${new Date().getFullYear()} Marks Berry Solicitors. All rights reserved.</p>
        <p class="disclaimer">Authorised and regulated by the Solicitors Regulation Authority (SRA No. ${SITE.sra}). The information on this website is for general guidance only and does not constitute legal advice. Past results do not guarantee a similar outcome.</p>
      </div>
    </div>
  </footer>`;

// Fill contact details wherever marked
document.querySelectorAll('[data-site]').forEach(el => el.textContent = SITE[el.dataset.site]);
document.querySelectorAll('[data-link]').forEach(el => {
  const k = el.dataset.link;
  el.href = (k === 'email' ? 'mailto:' : 'tel:') + SITE[k].replace(/\s/g, '');
});

// ===== STICKY HEADER =====
const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('scrolled', !isHome || window.scrollY > 60);
window.addEventListener('scroll', onScroll);
onScroll();

// ===== MOBILE MENU =====
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
menuToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
  menuToggle.classList.toggle('open');
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== ANIMATED COUNTERS =====
const animateCounter = (el) => {
  const target = +el.dataset.target;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / 2000, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString();
  };
  requestAnimationFrame(step);
};
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(c => counterObserver.observe(c));

// ===== CASE FILTERS =====
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.case-card[data-cat]').forEach(card => {
      card.classList.toggle('hide', f !== 'all' && card.dataset.cat !== f);
    });
  });
});

// ===== APPOINTMENT FORM (emails you via send.php) =====
const form = document.getElementById('contactForm');
if (form) {
  const statusEl = document.getElementById('formStatus');
  document.getElementById('date').min = new Date().toISOString().split('T')[0];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusEl.className = 'form-status';
    statusEl.textContent = '';

    let valid = true;
    ['name', 'email', 'message', 'date', 'time'].forEach(id => {
      const input = document.getElementById(id);
      const field = input.closest('.field');
      const emailOk = id !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      const ok = input.value.trim() !== '' && emailOk;
      field.classList.toggle('error', !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      statusEl.textContent = 'Please complete all required fields correctly.';
      statusEl.classList.add('bad');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending...';

    try {
      const res = await fetch('send.php', { method: 'POST', body: new FormData(form) });
      const data = await res.json();
      if (!data.ok) throw new Error();
      statusEl.textContent = 'Thank you. Your appointment request has been received and we will confirm shortly.';
      statusEl.classList.add('ok');
      form.reset();
    } catch {
      statusEl.textContent = 'Something went wrong. Please call or email us directly.';
      statusEl.classList.add('bad');
    }

    btn.disabled = false;
    btn.textContent = 'Book Appointment';
  });
}
