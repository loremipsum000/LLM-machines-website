# LLM Machines — website

The marketing website for **LLM Machines**, a Croatia-based team providing
managed private inference inside customer-controlled infrastructure.

Live at **[llm-machines.com](https://llm-machines.com)**.

This repository contains the marketing website source. It is not the LLM
Machines Product source repository, and publishing this website does not change
the licence that applies to Product source.

## Stack

Pure static HTML, CSS, and vanilla JavaScript. No build step, no framework, no bundler.

## Structure

```
.
├── index.html              ← Homepage
├── 404.html                ← 404 page (large ASCII-art)
├── technology/index.html   ← Core Appliance architecture and supported interfaces
├── pricing/index.html      ← Core Appliance offering and service scope
├── onboarding/index.html   ← Customer-premises deployment timeline + RACI
├── company/index.html      ← Mission, vision, sovereignty deep-dive
├── contact/index.html      ← Contact channels + structured form
├── privacy/index.html      ← Privacy Policy (generated from ../privacy.md)
├── terms/index.html        ← Terms & Conditions (generated source + licensing overlay)
├── trust/index.html        <- Trust Center source page
├── trust/subprocessors/index.html <- Subprocessor and supplier list source page
├── trust/important-notices/index.html <- Product rights and readiness notices
├── robots.txt              ← Search engine directives
├── sitemap.xml             ← Public marketing URLs; draft legal and trust pages stay excluded
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

The `/privacy/` HTML body is generated from `../privacy.md`. The `/terms/`
HTML body starts from `../app-stack/terms.md` and must then be reconciled with
`../docs/business/LLM-Machines-First-Party-Product-Source-Licensing-Decision.md`.
The Product licensing decision alone does not authorize a Privacy Policy change.

To regenerate after editing the markdown:

```bash
pip install --break-system-packages markdown
python3 -c "
import markdown
source = '../privacy.md'  # use '../app-stack/terms.md' as the Terms baseline
md = open(source).read()
md = md.split('\n', 1)[1]  # strip H1
body = markdown.markdown(md, extensions=['extra', 'sane_lists'])
# paste body into <article class=\"legal-body\"> in privacy/index.html
print(body)
"
```

After regenerating Terms, restore the approved licensing overlay: first-party
Product source is source-available under the unmodified [PolyForm Internal Use
License 1.0.0](https://polyformproject.org/licenses/internal-use/1.0.0/);
third-party software keeps its upstream licence; maintenance is
separate from delivered source rights; website and brand materials remain
outside the Product licence. Terms, Trust, and Important Notices remain draft
and `noindex` until the legal entity, counsel decisions, and publication approval
are complete.

## Website and Product rights

Copyright © 2026 LLM Machines. All rights are reserved in the website
editorial and creative content, trademarks, logos, brand assets, and other
material excluded from the Product licence unless expressly licensed. This
reservation does not relabel or restrict Product source or third-party software
rights.

Original first-party LLM Machines Product source is source-available under the
unmodified [PolyForm Internal Use License 1.0.0](https://polyformproject.org/licenses/internal-use/1.0.0/).
Third-party software remains
under its existing upstream licence. The exact licensor and copyright holder
must be verified before legal publication.
