# LLM Machines — website

The marketing website for **LLM Machines**, a Croatia-based startup
building sovereign on-premise AI appliances for European enterprises.

Live at **[llm-machines.com](https://llm-machines.com)**.

## Stack

Pure static HTML, CSS, and vanilla JavaScript. No build step, no framework, no bundler.

## Structure

```
.
├── index.html              ← Homepage
├── 404.html                ← 404 page (large ASCII-art)
├── technology/index.html   ← Architecture, tier model, stack components
├── pricing/index.html      ← Tiers + Build vs. Partner cost comparison
├── onboarding/index.html   ← 9-phase deployment timeline + RACI
├── company/index.html      ← Mission, vision, sovereignty deep-dive
├── contact/index.html      ← Contact channels + structured form
├── privacy/index.html      ← Privacy Policy (generated from privacy.md)
├── terms/index.html        ← Terms & Conditions (generated from terms.md)
├── robots.txt              ← Search engine directives
├── sitemap.xml             ← Sitemap with 8 URLs
├── CNAME                   ← GitHub Pages custom domain
└── assets/
    ├── styles.css          ← Single source of truth for CSS
    ├── site.js             ← Reveal observer, sticky scroll, Unicorn loader, etc.
    ├── logo.svg            ← Procedural placeholder
    ├── logo-original.svg   ← Official lens/torus mark
    ├── LLM-machines-logo-full.png  ← Full lockup (icon + wordmark)
    ├── Favi-32.svg         ← Favicon
    ├── link-preview.jpg    ← Open Graph / Twitter card image
    ├── hero_background.json        ← Unicorn Studio scene (hero)
    ├── whats-next_background.json  ← Unicorn Studio scene (CTA)
    ├── flags/              ← Croatia + EU flag SVGs
    ├── fonts/              ← AcidGrotesk OTFs
    └── logos/              ← Tech-stack component logos
```

```

## License

Copyright © 2026 LLM Machine d.o.o. All rights reserved.
