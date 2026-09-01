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
      const reveals = document.querySelectorAll('.reveal');

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        reveals.forEach((el) => el.classList.add('in'));
        return;
      }

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
    reveals.forEach((el) => io.observe(el));
    })();

/* ----- Mobile / tablet menu drawer ----- */
(function () {
  const toggle = document.querySelector('.menu-toggle');
  const drawer = document.getElementById('mobile-menu');
  if (!toggle || !drawer) return;

  const links = drawer.querySelectorAll('a');
  const openLabel = toggle.getAttribute('aria-label') || 'Open menu';
  const closeLabel = document.documentElement.lang.toLowerCase().startsWith('hr')
    ? 'Zatvori izbornik'
    : 'Close menu';
  let closeTimer;

  function openMenu() {
    window.clearTimeout(closeTimer);
    drawer.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', closeLabel);
    document.body.classList.add('menu-open');
    requestAnimationFrame(() => drawer.classList.add('open'));
  }

  function closeMenu() {
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', openLabel);
    document.body.classList.remove('menu-open');
    closeTimer = window.setTimeout(() => {
      if (!drawer.classList.contains('open')) drawer.hidden = true;
    }, 260);
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
  const counters = document.querySelectorAll('[data-counter]');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counters.forEach((el) => {
      const target = parseFloat(el.dataset.target);
      if (isNaN(target)) return;
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    });
    return;
  }

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
  counters.forEach((el) => io.observe(el));
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
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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
   SITE PREFERENCE MODULE
   - Strict opt-in: nothing non-essential loads until accepted
   - Bottom-left banner + preference modal
   - Bilingual (EN / HR) — picks via <html lang>
   - Persisted in localStorage as 'llm-consent-v1'
   - Re-openable via the preference link injected in the footer
   ============================================================ */
(function () {
  const STORAGE_KEY = 'llm-consent-v1';
  const CURRENT_VERSION = '1.1';
  const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;
  const lang = (document.documentElement.lang || 'en').toLowerCase().startsWith('hr') ? 'hr' : 'en';

  // -------- i18n strings --------
  const STRINGS = {
    en: {
      bannerLabel: 'Privacy choices',
      bannerTitle: 'We respect your data.',
      bannerBody: 'This site uses necessary local storage to remember your choice. Optional fonts and visual assets stay off until you allow them. See our <a href="/privacy/">Privacy Policy</a> for details.',
      btnAcceptAll: 'Allow functional assets',
      btnRejectAll: 'Essential only',
      btnCustomize: 'Customise preferences',
      modalTitle: 'Site preferences',
      modalIntro: 'This is the complete list of browser storage and optional third-party assets used by the current site. The necessary local-storage record remembers your choice. Functional providers stay off until you switch them on.',
      catNecessary: 'Strictly necessary',
      catNecessaryDesc: 'Required to remember your site preference. Cannot be disabled.',
      catFunctional: 'Functional',
      catFunctionalDesc: 'Loads visual assets — hero/background animations and the Urbanist webfont — that make the site feel like our brand. The site works without them, just with system fonts and static backgrounds.',
      always: 'Always on',
      btnSavePrefs: 'Save preferences',
      btnAcceptAllModal: 'Allow functional assets',
      btnRejectAllModal: 'Essential only',
      version: 'v ' + CURRENT_VERSION,
      footerLink: 'Privacy settings',
      ariaClose: 'Close site preferences',
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
          purpose: 'Loads the animation runtime from jsDelivr and scene media from assets.unicorn.studio. Your browser sends standard request data, including its IP address and browser headers, to those providers.',
        },
        fonts: {
          name: 'Google Fonts (Urbanist)',
          purpose: 'Your browser requests the Urbanist font directly from Google and sends standard request data, including its IP address, requested URL, browser headers and referrer where provided. Declining uses your system font.',
        },
      },
    },
    hr: {
      bannerLabel: 'Postavke privatnosti',
      bannerTitle: 'Poštujemo vaše podatke.',
      bannerBody: 'Ova stranica koristi nužnu lokalnu pohranu kako bi zapamtila vaš izbor. Neobavezni fontovi i vizualni resursi ostaju isključeni dok ih ne dopustite. Detalji su u <a href="/privacy/">Pravilima privatnosti</a>.',
      btnAcceptAll: 'Dopusti funkcionalne resurse',
      btnRejectAll: 'Samo nužno',
      btnCustomize: 'Prilagodi postavke',
      modalTitle: 'Postavke stranice',
      modalIntro: 'Ovo je potpuni popis pohrane preglednika i neobaveznih resursa trećih strana koje koristi trenutačna stranica. Nužni zapis lokalne pohrane pamti vaš izbor. Funkcionalni pružatelji ostaju isključeni dok ih ne uključite.',
      catNecessary: 'Strogo nužni',
      catNecessaryDesc: 'Potrebni za pamćenje vaših postavki stranice. Ne mogu se onemogućiti.',
      catFunctional: 'Funkcionalni',
      catFunctionalDesc: 'Učitava vizualne resurse — animacije hero i pozadinskih scena te Urbanist webfont — koji daju stranici naš brand. Stranica radi i bez njih, samo sa sistemskim fontovima i statičnim pozadinama.',
      always: 'Uvijek uključeno',
      btnSavePrefs: 'Spremi postavke',
      btnAcceptAllModal: 'Dopusti funkcionalne resurse',
      btnRejectAllModal: 'Samo nužno',
      version: 'v ' + CURRENT_VERSION,
      footerLink: 'Postavke privatnosti',
      ariaClose: 'Zatvori postavke stranice',
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
          purpose: 'Učitava animacijski runtime putem jsDelivra i resurse scena s assets.unicorn.studio. Vaš preglednik tim pružateljima šalje standardne podatke zahtjeva, uključujući IP adresu i zaglavlja preglednika.',
        },
        fonts: {
          name: 'Google Fonts (Urbanist)',
          purpose: 'Vaš preglednik izravno traži Urbanist font od Googlea i šalje standardne podatke zahtjeva, uključujući IP adresu, traženi URL, zaglavlja preglednika i referrer ako je dostupan. Ako odbijete, koristi se sistemski font.',
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
      const timestamp = Date.parse(obj.timestamp);
      const age = Date.now() - timestamp;
      if (
        obj.version !== CURRENT_VERSION ||
        !Number.isFinite(timestamp) ||
        age < 0 ||
        age >= CONSENT_TTL_MS
      ) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return obj;
    } catch (e) { return null; }
  }
  function saveConsent(prefs) {
    const payload = {
      necessary: true,
      functional: !!prefs.functional,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (e) {}
    return payload;
  }

  // -------- apply consent (load or unload functional assets) --------
  function setGoogleFontPreconnect(enabled) {
    const selectors = [
      'link[data-cc="google-fonts-preconnect"][href="https://fonts.googleapis.com"]',
      'link[data-cc="google-fonts-preconnect"][href="https://fonts.gstatic.com"]',
    ];

    if (!enabled) {
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => el.remove());
      });
      return;
    }

    if (!document.querySelector(selectors[0])) {
      const googleApis = document.createElement('link');
      googleApis.rel = 'preconnect';
      googleApis.href = 'https://fonts.googleapis.com';
      googleApis.setAttribute('data-cc', 'google-fonts-preconnect');
      document.head.appendChild(googleApis);
    }

    if (!document.querySelector(selectors[1])) {
      const googleStatic = document.createElement('link');
      googleStatic.rel = 'preconnect';
      googleStatic.href = 'https://fonts.gstatic.com';
      googleStatic.crossOrigin = '';
      googleStatic.setAttribute('data-cc', 'google-fonts-preconnect');
      document.head.appendChild(googleStatic);
    }
  }

  function applyConsent(prefs) {
    const wasAllowed = window.__cc_functional_allowed === true;
    window.__cc_functional_allowed = !!prefs.functional;

    // Google Fonts (Urbanist) — load only after functional consent.
    setGoogleFontPreconnect(!!prefs.functional);
    document.querySelectorAll('link[data-cc="google-fonts"]').forEach(el => {
      if (prefs.functional) {
        if (el.dataset.ccHref && !el.getAttribute('href')) {
          el.setAttribute('href', el.dataset.ccHref);
        }
        el.disabled = false;
        el.removeAttribute('disabled');
        if (el.hasAttribute('data-cc-original-media')) {
          el.setAttribute('media', el.getAttribute('data-cc-original-media'));
          el.removeAttribute('data-cc-original-media');
        }
      } else {
        if (!el.hasAttribute('data-cc-original-media')) {
          el.setAttribute('data-cc-original-media', el.getAttribute('media') || 'all');
        }
        el.disabled = true;
        el.setAttribute('media', 'not all');
        el.setAttribute('disabled', '');
        el.removeAttribute('href');
      }
    });

    // Unicorn — dispatch event so the gated loader picks it up
    if (prefs.functional && !wasAllowed) {
      window.dispatchEvent(new CustomEvent('cc:functional-allowed'));
    }
    if (!prefs.functional && wasAllowed) {
      // Reload after withdrawal so already-running third-party scenes stop.
      document.querySelectorAll('script[data-cc="unicorn"]').forEach(el => el.remove());
      window.__unicornLoaded = false;
      window.__usScriptLoading = false;
      window.setTimeout(() => window.location.reload(), 0);
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
  let bannerEl, modalEl, modalReturnFocus;

  function focusPageStart() {
    const target = document.querySelector('.brand, h1');
    if (target && typeof target.focus === 'function') {
      target.focus({ preventScroll: true });
    }
  }

  function buildBanner() {
    const banner = el('div', { class: 'cc-banner', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'cc-banner-title', tabindex: '-1' });

    const head = el('div', { class: 'cc-banner-head' },
      el('span', { class: 'cc-banner-mark' }, t.bannerLabel)
    );
    const h4 = el('h4', { id: 'cc-banner-title' }, t.bannerTitle);
    const p = el('p', { html: t.bannerBody });

    const accept = el('button', { class: 'cc-btn cc-btn--primary', type: 'button', onclick: onAcceptAll }, t.btnAcceptAll);
    const reject = el('button', { class: 'cc-btn', type: 'button', onclick: onRejectAll }, t.btnRejectAll);
    const customize = el('button', { class: 'cc-btn cc-btn-customize', type: 'button', onclick: () => { showModal(); hideBanner(false); } }, t.btnCustomize);

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
        buildToggleControl(catKey, name, !!initialPrefs[catKey], always)
      );
      const descP = el('p', { class: 'cc-cat-desc' }, desc);
      cat.appendChild(catHead);
      cat.appendChild(descP);
      if (techList && techList.length) {
        const ul = el('ul', { class: 'cc-tech-list' });
        techList.forEach(it => ul.appendChild(buildTech(it)));
        cat.appendChild(ul);
      }
      return cat;
    }

    function buildToggleControl(catKey, label, checked, always) {
      const wrap = el('label', { class: 'cc-toggle', 'aria-label': label });
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
        domain: 'cdn.jsdelivr.net · assets.unicorn.studio',
      },
      {
        name: t.items.fonts.name,
        code: 'fonts.googleapis.com',
        purpose: t.items.fonts.purpose,
        type: t.labels.stylesheet,
        duration: t.labels.loadFunctional,
        domain: 'fonts.googleapis.com · fonts.gstatic.com',
      },
    ]));

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
    bannerEl.hidden = false;
    bannerEl.removeAttribute('aria-hidden');
    requestAnimationFrame(() => {
      bannerEl.classList.add('is-open');
      bannerEl.focus({ preventScroll: true });
    });
  }
  function hideBanner(restoreFocus = true) {
    if (!bannerEl) return;
    const hadFocus = bannerEl.contains(document.activeElement) || document.activeElement === bannerEl;
    bannerEl.classList.remove('is-open');
    bannerEl.hidden = true;
    bannerEl.setAttribute('aria-hidden', 'true');
    if (restoreFocus && hadFocus) focusPageStart();
  }
  function showModal() {
    const current = loadConsent() || { necessary: true, functional: false };
    if (modalEl) { modalEl.remove(); modalEl = null; }
    modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modalEl = buildModal(current);
    document.body.appendChild(modalEl);
    modalEl.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        hideModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(modalEl.querySelectorAll('button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
    requestAnimationFrame(() => {
      modalEl.classList.add('is-open');
      const firstControl = modalEl.querySelector('.cc-modal-close');
      if (firstControl) firstControl.focus({ preventScroll: true });
    });
    document.body.style.overflow = 'hidden';
  }
  function hideModal() {
    if (modalEl) {
      const closingModal = modalEl;
      closingModal.classList.remove('is-open');
      closingModal.setAttribute('aria-hidden', 'true');
      closingModal.inert = true;
      setTimeout(() => {
        closingModal.remove();
        if (modalEl === closingModal) modalEl = null;
      }, 320);
      const returnTarget = modalReturnFocus;
      modalReturnFocus = null;
      if (returnTarget && returnTarget.isConnected && !returnTarget.closest('[hidden]')) {
        returnTarget.focus({ preventScroll: true });
      } else {
        focusPageStart();
      }
    }
    document.body.style.overflow = '';
  }

  // -------- handlers --------
  function onAcceptAll() {
    const prefs = saveConsent({ functional: true });
    applyConsent(prefs);
    hideBanner();
    hideModal();
  }
  function onRejectAll() {
    const prefs = saveConsent({ functional: false });
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
      applyConsent({ necessary: true, functional: false });
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
