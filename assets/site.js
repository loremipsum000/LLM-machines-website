    /* ----- Procedural logo: lens / torus mark ----- */
    (function () {
      const NS = "http://www.w3.org/2000/svg";
      function build(target) {
        const svg = document.createElementNS(NS, "svg");
        svg.setAttribute("viewBox", "0 0 365 365");
        svg.setAttribute("xmlns", NS);
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("fill", "none");

        const g = document.createElementNS(NS, "g");
        g.setAttribute("transform", "translate(182.5 182.5)");
        g.setAttribute("stroke-width", "0.55");
        svg.appendChild(g);

        const count = 90;
        for (let i = 0; i < count; i++) {
          const t = i / count;
          const angle = t * 180;
          const ell = document.createElementNS(NS, "ellipse");
          ell.setAttribute("cx", 0);
          ell.setAttribute("cy", 0);
          ell.setAttribute("rx", 128);
          ell.setAttribute("ry", 46);
          // Subtle gradient: darker at the "diagonal", lighter perpendicular
          const phase = Math.cos((angle - 90) * Math.PI / 180);
          const lightness = 38 + Math.abs(phase) * 28;
          ell.setAttribute("stroke", `hsl(0,0%,${lightness}%)`);
          ell.setAttribute("transform", `rotate(${angle})`);
          g.appendChild(ell);
        }

        target.innerHTML = "";
        target.appendChild(svg);
      }
      document.querySelectorAll("[data-logo]").forEach(build);
    })();

    /* ----- Reveal-on-scroll -----
       Per the rules:
         - Elements enter viewport → ease-out (handled in CSS)
         - Stagger 30–80ms between items (we use 50ms, capped at 200ms total)
         - Stagger applies within the parent group, not by global doc order */
    (function () {
      const STAGGER_MS = 50;
      const STAGGER_MAX = 200;

      const io = new IntersectionObserver(
        (entries) => {
          // Group entries by their immediate parent so siblings stagger together,
          // independent of where they sit in the document.
          const groups = new Map();
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const key = e.target.parentElement || document.body;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(e.target);
          });
          groups.forEach((els) => {
            els.forEach((el, idx) => {
              el.style.transitionDelay =
                Math.min(idx * STAGGER_MS, STAGGER_MAX) + "ms";
              el.classList.add("in");
              io.unobserve(el);
            });
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
      );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    })();

/* ----- Mobile / tablet menu drawer ----- */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('mobile-menu');
  if (!toggle || !drawer) return;

  const links = drawer.querySelectorAll('a');

  function openMenu() {
    drawer.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('menu-open');
    requestAnimationFrame(() => drawer.classList.add('open'));
  }

  function closeMenu() {
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) closeMenu();
    else openMenu();
  });

  drawer.addEventListener('transitionend', (event) => {
    if (event.target !== drawer || drawer.classList.contains('open')) return;
    drawer.hidden = true;
  });

  links.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980 && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      drawer.hidden = true;
    }
  }, { passive: true });
})();

/* ----- Sticky-scroll active-panel tracking ----- */
(function () {
  document.querySelectorAll('.sticky-section').forEach((section) => {
    const current = section.querySelector('[data-current]');
    const bar = section.querySelector('.sticky-progress-bar');
    const panels = section.querySelectorAll('.sticky-panels .panel');
    if (!panels.length) return;

    const total = panels.length;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          panels.forEach((p) => p.classList.remove('in-view'));
          e.target.classList.add('in-view');
          const num = e.target.dataset.panel;
          if (current && num) current.textContent = num;
          if (bar && num) {
            const pct = (parseInt(num, 10) / total) * 100;
            bar.style.setProperty('--progress', pct + '%');
          }
        }
      });
    }, { threshold: 0.5, rootMargin: '-30% 0px -30% 0px' });

    panels.forEach((p) => io.observe(p));
    // Default first panel as active
    if (panels[0]) panels[0].classList.add('in-view');
  });
})();

/* ----- Stat counter ----- */
(function () {
  function animate(el) {
    const target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-counter]').forEach((el) => io.observe(el));
})();

/* ----- Architecture zoom-in ----- */
(function () {
  const els = document.querySelectorAll('.arch.zoom-in');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
})();

/* ----- Onboarding timeline rail ----- */
(function () {
  const rail = document.querySelector('.timeline-rail');
  if (!rail) return;
  const markers = rail.querySelectorAll('[data-rail]');
  const phases = document.querySelectorAll('.timeline .phase');
  if (!markers.length || !phases.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const num = e.target.dataset.phase;
        markers.forEach((m) => m.classList.toggle('active', m.dataset.rail === num));
      }
    });
  }, { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' });
  phases.forEach((p) => io.observe(p));
})();

/* ----- Side dot-nav active section tracking ----- */
(function () {
  const dots = document.querySelectorAll('.side-dots a[data-section]');
  if (!dots.length) return;
  const sections = Array.from(dots).map((a) => document.getElementById(a.dataset.section)).filter(Boolean);
  if (!sections.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        dots.forEach((d) => d.classList.toggle('active', d.dataset.section === e.target.id));
      }
    });
  }, { threshold: 0.4, rootMargin: '-30% 0px -50% 0px' });
  sections.forEach((s) => io.observe(s));
})();

/* ============================================================
   NEW SOLUTION LAYOUT — closest-to-center active tracking
   ============================================================ */
(function () {
  const lists = document.querySelectorAll('.solution-list, .stack-list');
  if (!lists.length) return;
  lists.forEach((list) => {
    const items = list.querySelectorAll('.pillar-item');
    if (!items.length) return;

    function update() {
      const target = window.innerHeight * 0.45;
      let closest = null;
      let closestDist = Infinity;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(center - target);
        if (dist < closestDist) { closest = item; closestDist = dist; }
      });
      if (closest) items.forEach((i) => i.classList.toggle('active', i === closest));
    }

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    update();

    items.forEach((item) => {
      item.addEventListener('click', () => {
        items.forEach((i) => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  });
})();

/* ============================================================
   SIDE DOT-NAV — show only after Problem section enters view
   ============================================================ */
(function () {
  const dots = document.querySelector('.side-dots');
  const problem = document.getElementById('problem');
  const cta = document.getElementById('contact');
  if (!dots || !problem) return;
  function update() {
    const probTop = problem.getBoundingClientRect().top;
    const ctaBottom = cta ? cta.getBoundingClientRect().bottom : Infinity;
    const visible = probTop < window.innerHeight * 0.35 && ctaBottom > 120;
    dots.classList.toggle('is-visible', visible);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ============================================================
   ONBOARDING RAIL — closest-to-viewport-top active phase + smooth scroll
   ============================================================ */
(function () {
  const markers = document.querySelectorAll('.timeline-rail .rail-marker');
  const phases = document.querySelectorAll('.timeline .phase');
  if (!markers.length || !phases.length) return;

  function update() {
    const target = window.innerHeight * 0.35;
    let closest = null;
    let closestDist = Infinity;
    phases.forEach((p) => {
      const rect = p.getBoundingClientRect();
      const dist = Math.abs(rect.top - target);
      if (rect.bottom > 0 && dist < closestDist) {
        closest = p;
        closestDist = dist;
      }
    });
    if (closest) {
      const num = closest.dataset.phase;
      markers.forEach((m) => m.classList.toggle('active', m.dataset.rail === num));
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
})();

/* ============================================================
   PILLAR LIST — RAF-throttled, change-only active toggling
   (overrides previous unthrottled version)
   ============================================================ */
(function () {
  const lists = document.querySelectorAll('.solution-list, .stack-list');
  if (!lists.length) return;

  lists.forEach((list) => {
    const items = list.querySelectorAll('.pillar-item');
    if (!items.length) return;

    let currentActive = list.querySelector('.pillar-item.active');
    let ticking = false;

    function findClosest() {
      const target = window.innerHeight * 0.42;
      let closest = null;
      let closestDist = Infinity;
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const center = (rect.top + rect.bottom) / 2;
        const dist = Math.abs(center - target);
        if (dist < closestDist) { closest = item; closestDist = dist; }
      });
      return closest;
    }

    function update() {
      const closest = findClosest();
      if (closest && closest !== currentActive) {
        if (currentActive) currentActive.classList.remove('active');
        closest.classList.add('active');
        currentActive = closest;
      }
      ticking = false;
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();

    // Click to manually activate
    items.forEach((item) => {
      item.addEventListener('click', () => {
        if (item === currentActive) return;
        if (currentActive) currentActive.classList.remove('active');
        item.classList.add('active');
        currentActive = item;
      });
    });
  });
})();

/* ============================================================
   UNICORN STUDIO — gated behind FUNCTIONAL cookie consent.
   The cookie module dispatches 'cc:functional-allowed' once the
   user has opted in (or on subsequent visits when previously opted in).
   ============================================================ */
function __ccBootUnicorn() {
  // Project-style targets (legacy data-us-project)
  if (document.querySelector('[data-us-project]')) {
    if (window.UnicornStudio && window.UnicornStudio.init) {
      window.UnicornStudio.init();
    } else if (!window.__unicornLoaded) {
      window.__unicornLoaded = true;
      window.UnicornStudio = { isInitialized: false };
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.12/dist/unicornStudio.umd.js';
      s.setAttribute('data-cc', 'unicorn');
      s.onload = function () {
        if (window.UnicornStudio && window.UnicornStudio.init) window.UnicornStudio.init();
      };
      (document.head || document.body).appendChild(s);
    }
  }

  // Scene-style targets (data-us-scene)
  const targets = document.querySelectorAll('[data-us-scene]');
  if (!targets.length) return;

  function whenReady(cb) {
    if (window.UnicornStudio && typeof window.UnicornStudio.addScene === 'function') return cb();
    if (!window.__usScriptLoading) {
      window.__usScriptLoading = true;
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.12/dist/unicornStudio.umd.js';
      s.setAttribute('data-cc', 'unicorn');
      s.onload = () => { setTimeout(() => whenReady(cb), 50); };
      s.onerror = () => console.error('[Unicorn] script failed to load from CDN');
      (document.head || document.body).appendChild(s);
    } else {
      setTimeout(() => whenReady(cb), 60);
    }
  }

  whenReady(() => {
    targets.forEach((el, idx) => {
      if (!el.id) el.id = `us-auto-${idx}`;
      const filePath = el.dataset.usScene;
      if (!filePath) return;
      const params = {
        elementId: el.id,
        filePath: filePath,
        projectPath: filePath,
        fps: 60,
        scale: 1,
        dpi: 1.5,
      };
      try {
        const result = window.UnicornStudio.addScene(params);
        if (result && typeof result.catch === 'function') {
          result.catch((err) => console.error('[Unicorn] addScene error:', filePath, err));
        }
      } catch (err) {
        console.error('[Unicorn] addScene threw:', filePath, err);
      }
    });
  });
}

// Listen for consent. If already granted (e.g., previously opted in), the
// module dispatches the event during init. We listen and also poll the flag.
if (window.__cc_functional_allowed === true) {
  __ccBootUnicorn();
} else {
  window.addEventListener('cc:functional-allowed', __ccBootUnicorn, { once: true });
}

/* ============================================================
   COOKIE CONSENT MODULE (GDPR / ePrivacy / EU AI Act friendly)
   - Strict opt-in: nothing non-essential loads until accepted
   - Bottom-left banner + full granular preferences modal
   - Bilingual (EN / HR) — picks via <html lang>
   - Persisted in localStorage as 'llm-consent-v1'
   - Re-openable via "Cookie settings" link injected in footer
   ============================================================ */
(function () {
  const STORAGE_KEY = 'llm-consent-v1';
  const CURRENT_VERSION = '1.0';
  const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('hr') ? 'hr' : 'en';

  // -------- i18n strings --------
  const STRINGS = {
    en: {
      bannerLabel: 'Cookie notice',
      bannerTitle: 'We respect your data.',
      bannerBody: 'This site loads only the cookies and third-party assets you allow. Strictly necessary storage is on by default; everything else is off until you opt in. See our <a href="/privacy/">Privacy Policy</a> for details.',
      btnAcceptAll: 'Accept all',
      btnRejectAll: 'Reject all',
      btnCustomize: 'Customise preferences',
      modalTitle: 'Cookie preferences',
      modalIntro: 'Below is the complete list of storage and third-party assets this site can use, grouped by purpose. Strictly necessary items can\'t be disabled because the site can\'t remember your choice without them. Everything else stays off until you switch it on.',
      catNecessary: 'Strictly necessary',
      catNecessaryDesc: 'Required for the site to function and to remember your consent choices. Cannot be disabled.',
      catFunctional: 'Functional',
      catFunctionalDesc: 'Loads visual assets — hero/background animations and the Urbanist webfont — that make the site feel like our brand. The site works without them, just with system fonts and static backgrounds.',
      catAnalytics: 'Analytics',
      catAnalyticsDesc: 'We don\'t currently use any analytics, tracking, or measurement tools. This toggle exists so future analytics will only run with your explicit consent. Stays off by default.',
      catMarketing: 'Marketing',
      catMarketingDesc: 'We don\'t run any marketing tags, retargeting pixels, or ad networks. If that ever changes, you\'ll see the specific vendors listed here and be asked again. Stays off by default.',
      always: 'Always on',
      empty: 'No cookies or third-party assets currently used in this category.',
      btnSavePrefs: 'Save preferences',
      btnAcceptAllModal: 'Accept all',
      btnRejectAllModal: 'Reject all',
      version: 'v ' + CURRENT_VERSION,
      footerLink: 'Cookie settings',
      ariaClose: 'Close cookie preferences',
      labels: {
        type: 'Type',
        storage: 'localStorage',
        cookie: 'Cookie',
        script: 'Third-party script',
        stylesheet: 'Third-party stylesheet',
        formAction: 'Third-party form endpoint',
        duration: 'Duration',
        provider: 'Provider',
        purpose: 'Purpose',
        domain: 'Domain',
        persistent: 'Persistent (12 months)',
        sessionDur: 'Session',
        loadOnly: 'On-demand (only when used)',
        loadFunctional: 'On page load (if functional accepted)',
      },
      items: {
        consent: {
          name: 'llm-consent-v1',
          purpose: 'Records your cookie preferences and the timestamp of your choice. Required so we don\'t ask you again on every page load.',
        },
        unicorn: {
          name: 'Unicorn Studio',
          purpose: 'Animation engine used for the hero and call-to-action background visuals. Loaded from a public CDN. No cookies set; the CDN logs the request (IP + user agent) per standard HTTP behaviour.',
        },
        fonts: {
          name: 'Google Fonts (Urbanist)',
          purpose: 'Loads the Urbanist body font used across the site. Google receives your IP address when the font CSS is fetched. We do not pass any personal data. Declining falls back to your system font.',
        },
        formsubmit: {
          name: 'FormSubmit (contact form)',
          purpose: 'Used only when you submit the contact form. The data you typed plus your IP are sent to formsubmit.co to be delivered to us by email. Never loaded otherwise.',
        },
      },
    },
    hr: {
      bannerLabel: 'Obavijest o kolačićima',
      bannerTitle: 'Poštujemo vaše podatke.',
      bannerBody: 'Ova stranica učitava samo one kolačiće i resurse trećih strana koje vi dopustite. Strogo nužna pohrana uključena je prema zadanim postavkama; sve ostalo je isključeno dok se ne odlučite uključiti. Detalji u <a href="/privacy/">Pravilima privatnosti</a>.',
      btnAcceptAll: 'Prihvati sve',
      btnRejectAll: 'Odbij sve',
      btnCustomize: 'Prilagodi postavke',
      modalTitle: 'Postavke kolačića',
      modalIntro: 'Ispod je potpuni popis pohrane i resursa trećih strana koje ova stranica može koristiti, grupirano po namjeni. Strogo nužne stavke ne mogu se onemogućiti jer stranica bez njih ne može zapamtiti vaš izbor. Sve ostalo ostaje isključeno dok ga ne uključite.',
      catNecessary: 'Strogo nužni',
      catNecessaryDesc: 'Potrebni za rad stranice i za pamćenje vaše odluke o pristanku. Ne mogu se onemogućiti.',
      catFunctional: 'Funkcionalni',
      catFunctionalDesc: 'Učitava vizualne resurse — animacije hero i pozadinskih scena te Urbanist webfont — koji daju stranici naš brand. Stranica radi i bez njih, samo sa sistemskim fontovima i statičnim pozadinama.',
      catAnalytics: 'Analitika',
      catAnalyticsDesc: 'Trenutno ne koristimo nijedan alat za analitiku, praćenje ili mjerenje. Ovaj prekidač postoji kako bi se eventualna buduća analitika pokretala samo uz vaš izričiti pristanak. Prema zadanim postavkama isključen.',
      catMarketing: 'Marketing',
      catMarketingDesc: 'Ne koristimo marketinške oznake, retargeting piksele ni reklamne mreže. Ako se to ikad promijeni, ovdje ćete vidjeti konkretne dobavljače i bit ćete ponovno upitani. Prema zadanim postavkama isključen.',
      always: 'Uvijek uključeno',
      empty: 'Trenutno se u ovoj kategoriji ne koriste nikakvi kolačići ni resursi trećih strana.',
      btnSavePrefs: 'Spremi postavke',
      btnAcceptAllModal: 'Prihvati sve',
      btnRejectAllModal: 'Odbij sve',
      version: 'v ' + CURRENT_VERSION,
      footerLink: 'Postavke kolačića',
      ariaClose: 'Zatvori postavke kolačića',
      labels: {
        type: 'Vrsta',
        storage: 'localStorage',
        cookie: 'Kolačić',
        script: 'Skripta treće strane',
        stylesheet: 'Stylesheet treće strane',
        formAction: 'Endpoint obrasca treće strane',
        duration: 'Trajanje',
        provider: 'Pružatelj',
        purpose: 'Svrha',
        domain: 'Domena',
        persistent: 'Trajno (12 mjeseci)',
        sessionDur: 'Sesija',
        loadOnly: 'Na zahtjev (samo pri korištenju)',
        loadFunctional: 'Pri učitavanju stranice (ako prihvatite funkcionalne)',
      },
      items: {
        consent: {
          name: 'llm-consent-v1',
          purpose: 'Bilježi vaše postavke kolačića i vrijeme vaše odluke. Potrebno da vas ne pitamo iznova pri svakom učitavanju stranice.',
        },
        unicorn: {
          name: 'Unicorn Studio',
          purpose: 'Engine za animacije koji se koristi za hero i call-to-action pozadinske vizuale. Učitava se s javnog CDN-a. Ne postavlja kolačiće; CDN bilježi zahtjev (IP + user agent) prema standardnom HTTP ponašanju.',
        },
        fonts: {
          name: 'Google Fonts (Urbanist)',
          purpose: 'Učitava Urbanist font tijela teksta koji se koristi na cijeloj stranici. Google prima vašu IP adresu kada se font CSS dohvati. Ne prosljeđujemo nikakve osobne podatke. Ako odbijete, koristi se vaš sistemski font.',
        },
        formsubmit: {
          name: 'FormSubmit (kontakt obrazac)',
          purpose: 'Koristi se samo kada pošaljete kontakt obrazac. Podaci koje ste upisali i vaša IP adresa šalju se na formsubmit.co i nama dostavljaju email-om. Inače se ne učitava.',
        },
      },
    },
  };

  const t = STRINGS[lang];

  // -------- storage --------
  function loadConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (obj.version !== CURRENT_VERSION) return null;
      return obj;
    } catch (e) { return null; }
  }
  function saveConsent(prefs) {
    const payload = {
      necessary: true,
      functional: !!prefs.functional,
      analytics: !!prefs.analytics,
      marketing: !!prefs.marketing,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}
    return payload;
  }

  // -------- apply consent (load or unload functional assets) --------
  function applyConsent(prefs) {
    const wasAllowed = window.__cc_functional_allowed === true;
    window.__cc_functional_allowed = !!prefs.functional;

    // Google Fonts (Urbanist) — already in <head>. Toggle by disabling/restoring.
    document.querySelectorAll('link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]').forEach(el => {
      if (prefs.functional) {
        el.removeAttribute('disabled');
        if (el.hasAttribute('data-cc-original-media')) {
          el.setAttribute('media', el.getAttribute('data-cc-original-media'));
          el.removeAttribute('data-cc-original-media');
        }
      } else {
        if (!el.hasAttribute('data-cc-original-media')) {
          el.setAttribute('data-cc-original-media', el.getAttribute('media') || 'all');
        }
        el.setAttribute('media', 'not all');
      }
    });

    // Unicorn — dispatch event so the gated loader picks it up
    if (prefs.functional && !wasAllowed) {
      window.dispatchEvent(new CustomEvent('cc:functional-allowed'));
    }
    if (!prefs.functional && wasAllowed) {
      // Best-effort tear-down: remove injected Unicorn script tag.
      document.querySelectorAll('script[data-cc="unicorn"]').forEach(el => el.remove());
    }
  }

  // -------- DOM helpers --------
  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else if (attrs[k] === true) node.setAttribute(k, '');
        else if (attrs[k] !== false && attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    for (const c of children) {
      if (c == null) continue;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    }
    return node;
  }

  // -------- banner --------
  let bannerEl, modalEl;

  function buildBanner() {
    const banner = el('div', { class: 'cc-banner', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'cc-banner-title' });

    const head = el('div', { class: 'cc-banner-head' },
      el('span', { class: 'cc-banner-mark' }, t.bannerLabel)
    );
    const h4 = el('h4', { id: 'cc-banner-title' }, t.bannerTitle);
    const p = el('p', { html: t.bannerBody });

    const accept = el('button', { class: 'cc-btn cc-btn--primary', type: 'button', onclick: onAcceptAll }, t.btnAcceptAll);
    const reject = el('button', { class: 'cc-btn', type: 'button', onclick: onRejectAll }, t.btnRejectAll);
    const customize = el('button', { class: 'cc-btn cc-btn-customize', type: 'button', onclick: () => { hideBanner(); showModal(); } }, t.btnCustomize);

    const actions = el('div', { class: 'cc-banner-actions' }, accept, reject, customize);

    banner.appendChild(head);
    banner.appendChild(h4);
    banner.appendChild(p);
    banner.appendChild(actions);

    return banner;
  }

  function buildModal(initialPrefs) {
    const overlay = el('div', { class: 'cc-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cc-modal-title', onclick: (e) => { if (e.target === overlay) hideModal(); } });
    const panel = el('div', { class: 'cc-modal-panel' });

    // Head
    const head = el('div', { class: 'cc-modal-head' },
      el('h3', { id: 'cc-modal-title' }, t.modalTitle),
      el('button', { class: 'cc-modal-close', type: 'button', 'aria-label': t.ariaClose, onclick: hideModal }, '×')
    );

    // Body
    const body = el('div', { class: 'cc-modal-body' });
    body.appendChild(el('p', null, t.modalIntro));

    // Category builder
    function buildCategory(catKey, name, desc, always, techList) {
      const cat = el('section', { class: 'cc-cat', 'data-cat': catKey });
      const catHead = el('div', { class: 'cc-cat-head' },
        el('h4', null, name),
        buildToggleControl(catKey, !!initialPrefs[catKey], always)
      );
      const descP = el('p', { class: 'cc-cat-desc' }, desc);
      cat.appendChild(catHead);
      cat.appendChild(descP);
      if (techList && techList.length) {
        const ul = el('ul', { class: 'cc-tech-list' });
        techList.forEach(it => ul.appendChild(buildTech(it)));
        cat.appendChild(ul);
      } else {
        cat.appendChild(el('div', { class: 'cc-empty' }, t.empty));
      }
      return cat;
    }

    function buildToggleControl(catKey, checked, always) {
      const wrap = el('label', { class: 'cc-toggle', 'aria-label': name });
      const input = el('input', { type: 'checkbox', 'data-cat-toggle': catKey });
      if (checked || always) input.checked = true;
      if (always) input.disabled = true;
      const track = el('span', { class: 'cc-toggle-track' });
      wrap.appendChild(input);
      wrap.appendChild(track);
      if (always) {
        const note = el('span', { style: 'position:absolute;right:48px;top:50%;transform:translateY(-50%);font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:var(--fg-mute);white-space:nowrap;' }, t.always);
        wrap.appendChild(note);
      }
      return wrap;
    }

    function buildTech(item) {
      const wrap = el('li', { class: 'cc-tech' });
      const name = el('div', { class: 'cc-tech-name' }, item.name);
      if (item.code) {
        name.appendChild(el('code', null, item.code));
      }
      wrap.appendChild(name);
      wrap.appendChild(el('p', { class: 'cc-tech-purpose' }, item.purpose));
      const meta = el('div', { class: 'cc-tech-meta' });
      if (item.type) meta.appendChild(el('span', null, `${t.labels.type}: ${item.type}`));
      if (item.duration) meta.appendChild(el('span', null, `${t.labels.duration}: ${item.duration}`));
      if (item.domain) meta.appendChild(el('span', null, `${t.labels.domain}: ${item.domain}`));
      if (meta.children.length) wrap.appendChild(meta);
      return wrap;
    }

    // -------- Categories --------
    // Necessary
    body.appendChild(buildCategory('necessary', t.catNecessary, t.catNecessaryDesc, true, [
      {
        name: t.items.consent.name,
        code: 'localStorage',
        purpose: t.items.consent.purpose,
        type: t.labels.storage,
        duration: t.labels.persistent,
        domain: 'llm-machines.com',
      },
    ]));

    // Functional
    body.appendChild(buildCategory('functional', t.catFunctional, t.catFunctionalDesc, false, [
      {
        name: t.items.unicorn.name,
        code: 'cdn.jsdelivr.net',
        purpose: t.items.unicorn.purpose,
        type: t.labels.script,
        duration: t.labels.loadFunctional,
        domain: 'cdn.jsdelivr.net',
      },
      {
        name: t.items.fonts.name,
        code: 'fonts.googleapis.com',
        purpose: t.items.fonts.purpose,
        type: t.labels.stylesheet,
        duration: t.labels.loadFunctional,
        domain: 'fonts.googleapis.com · fonts.gstatic.com',
      },
      {
        name: t.items.formsubmit.name,
        code: 'formsubmit.co',
        purpose: t.items.formsubmit.purpose,
        type: t.labels.formAction,
        duration: t.labels.loadOnly,
        domain: 'formsubmit.co',
      },
    ]));

    // Analytics — empty by design
    body.appendChild(buildCategory('analytics', t.catAnalytics, t.catAnalyticsDesc, false, []));

    // Marketing — empty by design
    body.appendChild(buildCategory('marketing', t.catMarketing, t.catMarketingDesc, false, []));

    // Foot
    const foot = el('div', { class: 'cc-modal-foot' });
    const version = el('span', { class: 'cc-version' }, t.version);
    const actions = el('div', { class: 'cc-modal-foot-actions' },
      el('button', { class: 'cc-btn', type: 'button', onclick: onRejectAll }, t.btnRejectAllModal),
      el('button', { class: 'cc-btn', type: 'button', onclick: onSavePrefs }, t.btnSavePrefs),
      el('button', { class: 'cc-btn cc-btn--primary', type: 'button', onclick: onAcceptAll }, t.btnAcceptAllModal)
    );
    foot.appendChild(version);
    foot.appendChild(actions);

    panel.appendChild(head);
    panel.appendChild(body);
    panel.appendChild(foot);
    overlay.appendChild(panel);

    return overlay;
  }

  // -------- show / hide --------
  function showBanner() {
    if (!bannerEl) {
      bannerEl = buildBanner();
      document.body.appendChild(bannerEl);
    }
    requestAnimationFrame(() => bannerEl.classList.add('is-open'));
  }
  function hideBanner() {
    if (bannerEl) bannerEl.classList.remove('is-open');
  }
  function showModal() {
    const current = loadConsent() || { necessary: true, functional: false, analytics: false, marketing: false };
    if (modalEl) { modalEl.remove(); modalEl = null; }
    modalEl = buildModal(current);
    document.body.appendChild(modalEl);
    requestAnimationFrame(() => modalEl.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  }
  function hideModal() {
    if (modalEl) {
      modalEl.classList.remove('is-open');
      setTimeout(() => { if (modalEl) { modalEl.remove(); modalEl = null; } }, 320);
    }
    document.body.style.overflow = '';
  }

  // -------- handlers --------
  function onAcceptAll() {
    const prefs = saveConsent({ functional: true, analytics: true, marketing: true });
    applyConsent(prefs);
    hideBanner();
    hideModal();
  }
  function onRejectAll() {
    const prefs = saveConsent({ functional: false, analytics: false, marketing: false });
    applyConsent(prefs);
    hideBanner();
    hideModal();
  }
  function onSavePrefs() {
    // Read toggles from modal
    if (!modalEl) return;
    const get = (cat) => {
      const input = modalEl.querySelector(`input[data-cat-toggle="${cat}"]`);
      return !!(input && input.checked);
    };
    const prefs = saveConsent({
      functional: get('functional'),
      analytics: get('analytics'),
      marketing: get('marketing'),
    });
    applyConsent(prefs);
    hideBanner();
    hideModal();
  }

  // -------- footer link injection --------
  function injectFooterLink() {
    const footerCols = document.querySelectorAll('footer .foot-col');
    if (!footerCols.length) return;
    const lastCol = footerCols[footerCols.length - 1];
    if (lastCol.querySelector('.foot-cookie-settings')) return;
    const btn = el('button', { class: 'foot-cookie-settings', type: 'button', onclick: showModal }, t.footerLink);
    lastCol.appendChild(btn);
  }

  // -------- init --------
  function init() {
    const consent = loadConsent();
    if (consent) {
      applyConsent(consent);
    } else {
      // No prior consent — disable Google Fonts immediately
      applyConsent({ necessary: true, functional: false, analytics: false, marketing: false });
      showBanner();
    }
    injectFooterLink();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
