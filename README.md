# LLM Machines — website

The marketing website for **LLM Machines**, a Croatia-based startup
building sovereign on-premise AI appliances for European enterprises.

Live at **[llm-machines.com](https://llm-machines.com)**.

## Stack

Pure static HTML, CSS, and vanilla JavaScript. No build step, no framework, no bundler.

- **Body type:** [Urbanist](https://fonts.google.com/specimen/Urbanist) via Google Fonts CDN
- **Display type:** Acid Grotesk (self-hosted in `assets/fonts/`)
- **Hero & CTA animations:** [Unicorn Studio](https://www.unicorn.studio/) (scenes self-hosted in `assets/`)
- **Hosting:** GitHub Pages (custom domain via `CNAME`)

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

## Run locally

The site requires an HTTP server (CORS prevents `file://` from loading the JSON scenes):

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000/>.

## Deploy on GitHub Pages

1. Push this repo to `main`.
2. Repo **Settings → Pages**: set source to **`main` branch, `/` (root)**.
3. Custom domain (`llm-machines.com`) is read automatically from the `CNAME` file.
4. Configure DNS with your registrar:
   - Apex `A` records → `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153`
   - `www` `CNAME` → `loremipsum000.github.io`
5. Enable **Enforce HTTPS** once the cert is provisioned.

## Update legal pages

The `/privacy/` and `/terms/` HTML pages are generated from
`privacy.md` and `terms.md` (kept in the parent project folder).

To regenerate after editing the markdown:

```bash
pip install --break-system-packages markdown
python3 -c "
import markdown
md = open('../privacy.md').read()
md = md.split('\n', 1)[1]  # strip H1
body = markdown.markdown(md, extensions=['extra', 'sane_lists'])
# paste body into <article class=\"legal-body\"> in privacy/index.html
print(body)
"
```

## License

Copyright © 2026 LLM Machine d.o.o. All rights reserved.
