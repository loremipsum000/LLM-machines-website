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
   UNICORN STUDIO — initialize on all pages (replaces inline script)
   ============================================================ */
(function () {
  if (!document.querySelector('[data-us-project]')) return;
  if (window.UnicornStudio && window.UnicornStudio.init) {
    window.UnicornStudio.init();
    return;
  }
  if (window.__unicornLoaded) return;
  window.__unicornLoaded = true;
  window.UnicornStudio = { isInitialized: false };
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.12/dist/unicornStudio.umd.js';
  s.onload = function () {
    if (window.UnicornStudio && window.UnicornStudio.init) window.UnicornStudio.init();
  };
  (document.head || document.body).appendChild(s);
})();

/* ============================================================
   UNICORN STUDIO — programmatic scene loader (v2.1.12)
   Reads each [data-us-scene] element, resolves the JSON path,
   loads the scene, and adds it via UnicornStudio.addScene().
   Tries multiple known parameter names (filePath / projectPath / project).
   ============================================================ */
(function () {
  const targets = document.querySelectorAll('[data-us-scene]');
  if (!targets.length) return;

  function whenReady(cb) {
    if (window.UnicornStudio && typeof window.UnicornStudio.addScene === 'function') return cb();
    // Inject script if not already
    if (!window.__usScriptLoading) {
      window.__usScriptLoading = true;
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.12/dist/unicornStudio.umd.js';
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
        projectPath: filePath,  // alternate name some versions use
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
})();
